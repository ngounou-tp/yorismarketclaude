// Edge Function: stock_lifecycle
// ─────────────────────────────────────────────────────────────────────────────
// Cron quotidien (recommandé : 03:00 UTC) — scan tous les produits en rupture
// et applique la politique configuree dans `commerce_settings`:
//   • J0   : notif + message vendeur (« votre produit est en rupture »)
//   • J15  : rappel
//   • J25  : dernier avertissement
//   • J>=N : archivage soft (is_archived=true, hidden_from_marketplace=true,
//            actif=false). Si stock_hard_delete=true, suppression definitive
//            apres une deuxieme periode (grace * 2) — garde-fou strict.
//
// Auth :
//   • Bearer SUPABASE_SERVICE_ROLE_KEY
//   • OU header x-yorix-cron-secret == STOCK_LIFECYCLE_SECRET
//
// Reponse : JSON { scanned, notified, reminded, archived, deleted, errors }.
//
// Cette fonction est idempotente : si on la re-execute le meme jour, elle ne
// renvoie pas plusieurs notifs (state stocke dans `stock_alerts_sent` jsonb).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, ok } from "../_shared/cors.ts";

type ProductRow = {
  id: string;
  vendeur_id: string | null;
  vendeur_nom: string | null;
  name_fr: string | null;
  name_en: string | null;
  stock: number | null;
  actif: boolean | null;
  is_archived: boolean | null;
  hidden_from_marketplace: boolean | null;
  out_of_stock_since: string | null;
  auto_removal_date: string | null;
  seller_notified: boolean | null;
  last_stock_alert_sent: string | null;
  stock_alerts_sent: Record<string, string> | null;
};

type Settings = {
  stock_out_grace_days: number;
  stock_low_threshold: number;
  stock_auto_archive: boolean;
  stock_hard_delete: boolean;
  stock_reminder_days_csv: string;
  stock_premium_seller_exempt: boolean;
};

const DEFAULT_SETTINGS: Settings = {
  stock_out_grace_days: 30,
  stock_low_threshold: 5,
  stock_auto_archive: true,
  stock_hard_delete: false,
  stock_reminder_days_csv: "1,15,25",
  stock_premium_seller_exempt: true,
};

function authorize(req: Request): boolean {
  const bearer = (req.headers.get("Authorization") ?? "")
    .replace(/^Bearer\s+/i, "")
    .trim();
  const sr = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (bearer && sr && bearer === sr) return true;
  const secret = Deno.env.get("STOCK_LIFECYCLE_SECRET") ?? "";
  const h = req.headers.get("x-yorix-cron-secret") ?? "";
  if (secret && h && h === secret) return true;
  return false;
}

function parseReminderDays(csv: string): number[] {
  const out = csv
    .split(",")
    .map((x) => parseInt(x.trim(), 10))
    .filter((n) => Number.isFinite(n) && n > 0);
  return out.length > 0 ? Array.from(new Set(out)).sort((a, b) => a - b) : [1, 15, 25];
}

function daysBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 86400000);
}

function productLabel(p: ProductRow): string {
  return p.name_fr || p.name_en || `produit ${p.id.slice(0, 8)}`;
}

async function loadSettings(
  supabase: ReturnType<typeof createClient>,
): Promise<Settings> {
  const { data, error } = await supabase
    .from("commerce_settings")
    .select(
      "stock_out_grace_days,stock_low_threshold,stock_auto_archive,stock_hard_delete,stock_reminder_days_csv,stock_premium_seller_exempt",
    )
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return DEFAULT_SETTINGS;
  return {
    stock_out_grace_days: Number(data.stock_out_grace_days ?? DEFAULT_SETTINGS.stock_out_grace_days),
    stock_low_threshold: Number(data.stock_low_threshold ?? DEFAULT_SETTINGS.stock_low_threshold),
    stock_auto_archive: data.stock_auto_archive ?? DEFAULT_SETTINGS.stock_auto_archive,
    stock_hard_delete: data.stock_hard_delete ?? DEFAULT_SETTINGS.stock_hard_delete,
    stock_reminder_days_csv: String(
      data.stock_reminder_days_csv ?? DEFAULT_SETTINGS.stock_reminder_days_csv,
    ),
    stock_premium_seller_exempt:
      data.stock_premium_seller_exempt ?? DEFAULT_SETTINGS.stock_premium_seller_exempt,
  };
}

async function isPremiumSeller(
  supabase: ReturnType<typeof createClient>,
  vendeurId: string | null,
): Promise<boolean> {
  if (!vendeurId) return false;
  try {
    const { data } = await supabase
      .from("profiles")
      .select("role,premium,is_premium")
      .eq("id", vendeurId)
      .maybeSingle();
    if (!data) return false;
    if (data.role === "premium_seller" || data.role === "business") return true;
    if (data.premium === true) return true;
    if (data.is_premium === true) return true;
    return false;
  } catch {
    return false;
  }
}

async function insertSellerNotification(
  supabase: ReturnType<typeof createClient>,
  vendeurId: string | null,
  product: ProductRow,
  daysLeft: number,
  variant: "j0" | "reminder" | "final" | "archived",
): Promise<void> {
  if (!vendeurId) return;
  const label = productLabel(product);
  let title = "📦 Produit en rupture de stock";
  let message =
    `Votre produit « ${label} » est en rupture de stock. ` +
    `Merci de le réapprovisionner dans un délai de ${daysLeft} jours, ` +
    `sinon il sera automatiquement retiré du catalogue.`;

  if (variant === "reminder") {
    title = "⏳ Rappel : produit toujours en rupture";
    message =
      `Votre produit « ${label} » est en rupture depuis plusieurs jours. ` +
      `Il vous reste ${Math.max(0, daysLeft)} jour(s) avant son retrait automatique du catalogue.`;
  } else if (variant === "final") {
    title = "⚠️ Dernier avertissement — produit en rupture";
    message =
      `Dernier rappel : votre produit « ${label} » sera retiré du catalogue ` +
      `dans ${Math.max(0, daysLeft)} jour(s) si le stock n'est pas mis à jour.`;
  } else if (variant === "archived") {
    title = "🗄️ Produit archivé — rupture > délai autorisé";
    message =
      `Votre produit « ${label} » a été automatiquement archivé après ` +
      `une rupture de stock prolongée. Vous pouvez le réactiver en mettant à ` +
      `jour son stock depuis votre tableau de bord vendeur.`;
  }

  const link = `/dashboard?tab=mesProduits&product=${product.id}`;

  await supabase.from("notifications").insert({
    user_id: vendeurId,
    type: "stock_alert",
    titre: title,
    title,
    message,
    link,
    category: "business",
    priority: "high",
    metadata: {
      kind: "stock_alert",
      variant,
      product_id: product.id,
      days_left: daysLeft,
    },
  });
}

async function logEvent(
  supabase: ReturnType<typeof createClient>,
  product: ProductRow,
  event: string,
  payload: Record<string, unknown>,
  dayOffset: number | null = null,
): Promise<void> {
  try {
    await supabase.from("stock_lifecycle_log").insert({
      product_id: product.id,
      vendeur_id: product.vendeur_id,
      event,
      day_offset: dayOffset,
      payload,
    });
  } catch (e) {
    console.error("[stock_lifecycle] logEvent error", e);
  }
}

async function processProduct(
  supabase: ReturnType<typeof createClient>,
  product: ProductRow,
  settings: Settings,
  now: Date,
): Promise<{
  notified: boolean;
  reminded: boolean;
  archived: boolean;
  deleted: boolean;
}> {
  const result = { notified: false, reminded: false, archived: false, deleted: false };

  if (!product.out_of_stock_since) {
    return result; // pas vraiment en rupture (trigger n'a pas tourne)
  }

  // Exemption vendeur premium
  if (settings.stock_premium_seller_exempt) {
    const premium = await isPremiumSeller(supabase, product.vendeur_id);
    if (premium) {
      await logEvent(supabase, product, "skipped_premium", {});
      return result;
    }
  }

  const since = new Date(product.out_of_stock_since);
  const daysOut = Math.max(0, daysBetween(since, now));
  const graceDays = settings.stock_out_grace_days;
  const daysLeft = graceDays - daysOut;
  const remindersDays = parseReminderDays(settings.stock_reminder_days_csv);
  const alertsSent: Record<string, string> = product.stock_alerts_sent || {};
  const updates: Record<string, unknown> = {};

  // ── J0 (premiere notification) ─────────────────────────────────────────────
  if (!product.seller_notified || !alertsSent.j0) {
    await insertSellerNotification(supabase, product.vendeur_id, product, daysLeft, "j0");
    alertsSent.j0 = now.toISOString();
    updates.seller_notified = true;
    updates.last_stock_alert_sent = now.toISOString();
    updates.stock_alerts_sent = alertsSent;
    await logEvent(supabase, product, "notified_j0", { days_left: daysLeft }, daysOut);
    result.notified = true;
  }

  // ── Rappels intermediaires (ex. J15, J25) ──────────────────────────────────
  for (const reminderDay of remindersDays) {
    if (reminderDay === 1) continue; // J0 deja gere ci-dessus
    if (reminderDay >= graceDays) continue;
    const key = `j${reminderDay}`;
    if (alertsSent[key]) continue;
    if (daysOut < reminderDay) continue;

    const isFinalReminder = reminderDay === remindersDays[remindersDays.length - 1];
    await insertSellerNotification(
      supabase,
      product.vendeur_id,
      product,
      daysLeft,
      isFinalReminder ? "final" : "reminder",
    );
    alertsSent[key] = now.toISOString();
    updates.stock_alerts_sent = alertsSent;
    updates.last_stock_alert_sent = now.toISOString();
    await logEvent(
      supabase,
      product,
      isFinalReminder ? "final_warning" : "reminder",
      { reminder_day: reminderDay, days_left: daysLeft },
      daysOut,
    );
    result.reminded = true;
  }

  // ── Archivage (J >= graceDays) ─────────────────────────────────────────────
  if (daysOut >= graceDays && !product.is_archived && settings.stock_auto_archive) {
    updates.is_archived = true;
    updates.hidden_from_marketplace = true;
    updates.actif = false;
    updates.stock_status = "archived";
    await insertSellerNotification(supabase, product.vendeur_id, product, 0, "archived");
    await logEvent(supabase, product, "archived", { grace_days: graceDays }, daysOut);
    result.archived = true;
  }

  // ── Hard delete (option) : archive depuis >= graceDays * 2 ────────────────
  // Garde-fou supplémentaire : ne supprime que si le produit est deja archive,
  // que l'option est activee globalement, et qu'il s'est ecoule au moins 2x
  // le delai de grace depuis la rupture initiale.
  if (
    settings.stock_hard_delete &&
    product.is_archived &&
    daysOut >= graceDays * 2
  ) {
    await logEvent(supabase, product, "hard_deleted", {
      grace_days: graceDays,
      days_out: daysOut,
    });
    await supabase.from("products").delete().eq("id", product.id);
    result.deleted = true;
    return result; // ne pas executer l'update apres delete
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", product.id);
    if (error) {
      await logEvent(supabase, product, "error_update", { message: error.message });
      throw error;
    }
  }

  return result;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (!authorize(req)) {
    return ok({ error: "unauthorized" }, { status: 401 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return ok({ error: "missing env" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const settings = await loadSettings(supabase);
  const summary = {
    scanned: 0,
    notified: 0,
    reminded: 0,
    archived: 0,
    deleted: 0,
    errors: 0,
    settings,
  };

  // On scanne uniquement les produits non archives et avec stock <= 0
  // (le trigger garantit que out_of_stock_since est rempli des qu'on
  // tombe a 0). Limite a 500 par tour pour rester sous les quotas Edge.
  const { data: rows, error } = await supabase
    .from("products")
    .select(
      "id,vendeur_id,vendeur_nom,name_fr,name_en,stock,actif,is_archived,hidden_from_marketplace,out_of_stock_since,auto_removal_date,seller_notified,last_stock_alert_sent,stock_alerts_sent",
    )
    .lte("stock", 0)
    .eq("is_archived", false)
    .not("out_of_stock_since", "is", null)
    .limit(500);

  if (error) {
    return ok({ error: error.message }, { status: 500 });
  }
  const products = (rows ?? []) as ProductRow[];
  summary.scanned = products.length;

  for (const p of products) {
    try {
      const r = await processProduct(supabase, p, settings, now);
      if (r.notified) summary.notified += 1;
      if (r.reminded) summary.reminded += 1;
      if (r.archived) summary.archived += 1;
      if (r.deleted) summary.deleted += 1;
    } catch (e) {
      console.error("[stock_lifecycle] product error", p.id, e);
      summary.errors += 1;
    }
  }

  return ok({ ok: true, ...summary });
});
