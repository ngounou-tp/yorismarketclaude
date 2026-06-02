import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { corsHeaders, ok } from "../_shared/cors.ts";
import {
  isHighUrgencyPush,
  shouldTriggerEmailWebhook,
} from "../_shared/notification_channels.ts";

type PrefsRow = {
  push_enabled?: boolean | null;
  desktop_alerts?: boolean | null;
  email_critical?: boolean | null;
  sms_critical?: boolean | null;
  whatsapp_critical?: boolean | null;
  category_messages?: boolean | null;
  category_orders?: boolean | null;
  category_payments?: boolean | null;
  category_delivery?: boolean | null;
  category_security?: boolean | null;
  category_promotions?: boolean | null;
  category_system?: boolean | null;
  category_business?: boolean | null;
  category_admin?: boolean | null;
};

const CATEGORY_PREF_COL: Record<string, keyof PrefsRow> = {
  messages: "category_messages",
  orders: "category_orders",
  payments: "category_payments",
  delivery: "category_delivery",
  security: "category_security",
  promotions: "category_promotions",
  system: "category_system",
  business: "category_business",
  admin: "category_admin",
};

function authorize(req: Request): boolean {
  const bearer = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim() ?? "";
  const sr = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (bearer && sr && bearer === sr) return true;
  const secret = Deno.env.get("NOTIFY_DISPATCH_SECRET") ?? Deno.env.get("DISPATCH_NOTIFICATION_SECRET") ?? "";
  const h =
    req.headers.get("x-yorix-dispatch-secret") ?? req.headers.get("X-Yorix-Dispatch-Secret") ?? "";
  if (secret && h === secret) return true;
  return false;
}

function inferNotificationCategory(row: Record<string, unknown>): string {
  const c = row.category;
  if (typeof c === "string" && c.length > 0) return c;
  const type = String(row.type || "").toLowerCase();
  if (type === "new_product") return "catalog";
  if (type === "pack_moderation" || type === "stock_alert") return "business";
  const blob = `${row.type || ""} ${row.title || ""} ${row.titre || ""} ${row.message || ""}`;
  if (/admin|superadmin|incident|réclamation|reclamation|staff yorix|paiement bloqué/i.test(blob)) return "admin";
  if (/business|b2b|partenaire|pro corner|yorix business|rupture de stock|produit en rupture/i.test(blob)) return "business";
  if (/payment|paiement|checkout|cinetpay|escrow/i.test(blob)) return "payments";
  if (/security|fraud|litige|connexion|login|suspicious/i.test(blob)) return "security";
  if (/deliver|livraison|livreur|shipping|colis/i.test(blob)) return "delivery";
  if (/order|commande|booking|réservation|prestation|service_booking/i.test(blob)) return "orders";
  if (/message|chat|support|conversation/i.test(blob)) return "messages";
  if (/promo|offre|soldes|flash/i.test(blob)) return "promotions";
  return "system";
}

function inferPriority(row: Record<string, unknown>, category: string): string {
  const p = row.priority;
  if (typeof p === "string" && p.length > 0) return p;
  const type = String(row.type || "").toLowerCase();
  if (type === "new_product" || type === "pack_moderation" || type === "stock_alert") return "standard";
  if (category === "catalog" || category === "business" || category === "promotions") {
    return "standard";
  }
  if (category === "payments" || category === "security") return "critical";
  if (category === "admin") return "high";
  if (category === "delivery" || category === "orders" || category === "messages") return "high";
  return "standard";
}

function categoryPushAllowed(prefs: PrefsRow | null, category: string): boolean {
  if (!prefs) return true;
  const col = CATEGORY_PREF_COL[category];
  if (col && col in prefs) return prefs[col] !== false;
  return prefs.category_system !== false;
}

function rowTitle(row: Record<string, unknown>): string {
  const t = row.title ?? row.titre;
  return typeof t === "string" ? t : "";
}

async function logDelivery(
  supabase: ReturnType<typeof createClient>,
  entry: {
    notification_id?: string | null;
    user_id: string;
    channel: string;
    status: string;
    detail?: string | null;
    meta?: Record<string, unknown>;
  },
) {
  try {
    const nid =
      typeof entry.notification_id === "string" && entry.notification_id.trim() !== ""
        ? entry.notification_id.trim()
        : null;
    await supabase.from("notification_delivery_log").insert({
      notification_id: nid,
      user_id: entry.user_id,
      channel: entry.channel,
      status: entry.status,
      detail: entry.detail ?? null,
      meta: entry.meta ?? {},
    });
  } catch (e) {
    console.error("[dispatch_notification] logDelivery", e);
  }
}

function normalizeLinkUrl(raw: unknown): string {
  if (typeof raw !== "string" || !raw.trim()) return "/";
  const t = raw.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) return t;
  return t.startsWith("/") ? t : `/${t}`;
}

async function postCriticalWebhook(payload: unknown) {
  const url =
    Deno.env.get("CRITICAL_NOTIFY_WEBHOOK_URL") ?? Deno.env.get("CRITICAL_FALLBACK_WEBHOOK_URL") ?? "";
  if (!url) return;
  try {
    const secret = Deno.env.get("CRITICAL_WEBHOOK_SECRET") ?? "";
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers["x-webhook-secret"] = secret;
    await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    /* best-effort pour n8n / relais */
  }
}

function extractReqBody(raw: Record<string, unknown>): {
  notification_id?: string;
  user_id?: string;
  titre?: string;
  message?: string;
  link?: string;
  priority?: string;
  category?: string;
  record?: Record<string, unknown>;
} {
  const record = raw.record as Record<string, unknown> | undefined;
  if (record && typeof record === "object" && !raw.notification_id) {
    return { ...raw, notification_id: record.id as string | undefined, record };
  }
  return raw as typeof raw & { record?: Record<string, unknown> };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return ok({ error: "Method not allowed" }, { status: 405 });

  if (!authorize(req)) return ok({ error: "Unauthorized" }, { status: 401 });

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const sr = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!url || !sr) return ok({ error: "Server misconfigured" }, { status: 500 });

  const vapidPub = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
  const vapidPriv = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
  if (!vapidPub || !vapidPriv) {
    return ok({ error: "VAPID keys not configured (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)" }, { status: 500 });
  }

  const subject = Deno.env.get("VAPID_SUBJECT")?.trim() || "mailto:support@yorix.cm";
  webpush.setVapidDetails(subject, vapidPub, vapidPriv);

  let rawJson: Record<string, unknown>;
  try {
    rawJson = await req.json();
  } catch {
    return ok({ error: "Invalid JSON" }, { status: 400 });
  }

  const body = extractReqBody(rawJson);
  let notificationId = typeof body.notification_id === "string" ? body.notification_id : "";
  let userId = typeof body.user_id === "string" ? body.user_id : "";
  let title = String(body.titre || (body as { title?: string }).title || "Yorix");
  let bodyText = typeof body.message === "string" ? body.message : "";
  let linkUrl = normalizeLinkUrl(body.link);
  let priority = typeof body.priority === "string" ? body.priority : "standard";
  let category = typeof body.category === "string" ? body.category : "system";

  const supabase = createClient(url, sr);

  let notifRow: Record<string, unknown> | null = null;

  const fromRecord = body.record && typeof body.record === "object";
  if (fromRecord) {
    const r = body.record as Record<string, unknown>;
    notifRow = r;
    notificationId = notificationId || String(r.id ?? "");
    userId = userId || String(r.user_id ?? "");
    title = rowTitle(r) || title;
    bodyText = (r.message as string) ?? bodyText;
    linkUrl = normalizeLinkUrl(r.link ?? linkUrl);
    category = inferNotificationCategory(r);
    priority = inferPriority(r, category);
  }

  if (notificationId) {
    const { data: row, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("id", notificationId)
      .maybeSingle();
    if (error) return ok({ error: error.message }, { status: 500 });
    if (!row) return ok({ error: "notification not found" }, { status: 404 });
    notifRow = row as Record<string, unknown>;
    userId = row.user_id as string;
    title = rowTitle(notifRow) || title;
    bodyText = (row.message as string) ?? bodyText;
    linkUrl = normalizeLinkUrl(row.link ?? linkUrl);
    category = inferNotificationCategory(notifRow);
    priority = inferPriority(notifRow, category);
  }

  if (!userId) return ok({ error: "user_id or notification_id required" }, { status: 400 });

  const { data: prefsRow } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const prefs = prefsRow as PrefsRow | null;

  const pushEnabled = prefs?.push_enabled !== false && prefs?.desktop_alerts !== false;
  const catOk = categoryPushAllowed(prefs ?? {}, category);

  const policyRow: Record<string, unknown> = notifRow ?? {
    type: body.type,
    category,
    priority,
    title,
    titre: title,
    message: bodyText,
    metadata: (body as { metadata?: unknown }).metadata,
    payload: (body as { payload?: unknown }).payload,
  };

  const emailWebhook = shouldTriggerEmailWebhook(policyRow, prefs);
  const pushUrgent = isHighUrgencyPush(policyRow, category, priority);

  if (emailWebhook) {
    await postCriticalWebhook({
      event: "critical_notification",
      user_id: userId,
      notification_id: notificationId || null,
      title,
      body: bodyText,
      url: linkUrl,
      priority,
      category,
      channels: {
        email: true,
        sms: prefs?.sms_critical === true,
        whatsapp: prefs?.whatsapp_critical !== false,
      },
    });
    await logDelivery(supabase, {
      notification_id: notificationId || null,
      user_id: userId,
      channel: "email_webhook",
      status: "sent",
      detail: "critical_webhook",
      meta: { category, priority },
    });
  } else {
    await logDelivery(supabase, {
      notification_id: notificationId || null,
      user_id: userId,
      channel: "email_webhook",
      status: "skipped",
      detail: "policy_in_app_only",
      meta: { category, priority, type: policyRow.type },
    });
  }

  const results: Record<string, unknown> = {
    user_id: userId,
    category,
    priority,
    push_attempted: false,
    push_sent: 0,
    push_failed: 0,
    email_webhook: emailWebhook,
    push_urgency: pushUrgent ? "high" : "normal",
  };

  if (!pushEnabled || !catOk) {
    results.skipped_push = !pushEnabled ? "push_or_desktop_disabled" : "category_muted";
    await logDelivery(supabase, {
      notification_id: notificationId || null,
      user_id: userId,
      channel: "push",
      status: "skipped",
      detail: String(results.skipped_push),
      meta: { category, priority },
    });
    return ok(results);
  }

  const { data: subs, error: subErr } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (subErr) return ok({ error: subErr.message }, { status: 500 });
  if (!subs?.length) {
    results.no_subscriptions = true;
    await logDelivery(supabase, {
      notification_id: notificationId || null,
      user_id: userId,
      channel: "push",
      status: "skipped",
      detail: "no_subscriptions",
      meta: { category, priority },
    });
    return ok(results);
  }

  const tag = notificationId ? `notif-${notificationId}` : `yorix-${userId.slice(0, 8)}`;
  const payload = JSON.stringify({
    title,
    body: bodyText,
    url: linkUrl,
    tag,
    priority,
  });

  results.push_attempted = true;

  for (const sub of subs) {
    if (!sub.endpoint || !sub.p256dh || !sub.auth) continue;
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload,
        {
          TTL: pushUrgent ? 86400 : 3600,
          urgency: pushUrgent ? "high" : "normal",
        } as Record<string, string | number>,
      );
      results.push_sent = Number(results.push_sent) + 1;
    } catch (e: unknown) {
      results.push_failed = Number(results.push_failed) + 1;
      const msg = e && typeof e === "object" && "statusCode" in e ? String((e as { statusCode: number }).statusCode) : String(e);
      if (msg.includes("410")) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
      }
    }
  }

  const sent = Number(results.push_sent);
  const failed = Number(results.push_failed);
  let st = "skipped";
  if (sent > 0 && failed === 0) st = "sent";
  else if (sent > 0 && failed > 0) st = "partial";
  else if (sent === 0 && failed > 0) st = "failed";

  await logDelivery(supabase, {
    notification_id: notificationId || null,
    user_id: userId,
    channel: "push",
    status: st,
    detail: null,
    meta: { ...results },
  });

  return ok(results);
});
