import { NOTIF_CATEGORIES } from "../domain/notificationsDomain";

const STORAGE_KEY = "yorix_notification_prefs_v1";

const defaultPrefs = () => ({
  pushEnabled: true,
  desktopAlerts: true,
  /** @deprecated utilise desktopAlerts — conservé pour rétrocompat localStorage */
  pushBrowser: true,
  sound: false,
  email: false,
  sms: false,
  whatsappDigest: false,
  categories: {
    [NOTIF_CATEGORIES.messages]: true,
    [NOTIF_CATEGORIES.orders]: true,
    [NOTIF_CATEGORIES.payments]: true,
    [NOTIF_CATEGORIES.delivery]: true,
    [NOTIF_CATEGORIES.security]: true,
    [NOTIF_CATEGORIES.promotions]: true,
    [NOTIF_CATEGORIES.system]: true,
    [NOTIF_CATEGORIES.business]: true,
    [NOTIF_CATEGORIES.admin]: true,
    [NOTIF_CATEGORIES.catalog]: true,
  },
});

/** Préférences locales (instantané, utilisé avant sync Supabase ou hors-ligne). */
export function loadNotificationPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultPrefs();
    const parsed = JSON.parse(raw);
    const merged = {
      ...defaultPrefs(),
      ...parsed,
      categories: { ...defaultPrefs().categories, ...(parsed.categories || {}) },
    };
    if (merged.desktopAlerts === undefined) {
      merged.desktopAlerts = parsed.pushBrowser !== false;
    }
    if (merged.pushEnabled === undefined) {
      merged.pushEnabled = parsed.pushBrowser !== false;
    }
    return merged;
  } catch {
    return defaultPrefs();
  }
}

export function saveNotificationPrefs(partial) {
  try {
    const cur = loadNotificationPrefs();
    const next = {
      ...cur,
      ...partial,
      categories: { ...cur.categories, ...(partial.categories || {}) },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return loadNotificationPrefs();
  }
}

/**
 * Convertit une ligne `notification_preferences` vers le format UI interne.
 * @param {Record<string, unknown>|null} row
 */
export function dbRowToPrefs(row) {
  if (!row) return null;
  const desktopAlerts = row.desktop_alerts !== false;
  return {
    pushEnabled: row.push_enabled !== false,
    desktopAlerts,
    pushBrowser: desktopAlerts,
    sound: row.sound_enabled === true,
    email: row.email_critical === true,
    sms: row.sms_critical === true,
    whatsappDigest: row.whatsapp_critical !== false,
    categories: {
      [NOTIF_CATEGORIES.messages]: row.category_messages !== false,
      [NOTIF_CATEGORIES.orders]: row.category_orders !== false,
      [NOTIF_CATEGORIES.payments]: row.category_payments !== false,
      [NOTIF_CATEGORIES.delivery]: row.category_delivery !== false,
      [NOTIF_CATEGORIES.security]: row.category_security !== false,
    [NOTIF_CATEGORIES.promotions]: row.category_promotions !== false,
    [NOTIF_CATEGORIES.system]: row.category_system !== false,
    [NOTIF_CATEGORIES.business]: row.category_business !== false,
    [NOTIF_CATEGORIES.admin]: row.category_admin !== false,
  },
  };
}

/**
 * @param {string} userId
 * @param {object} prefs
 */
export function prefsToDbRow(userId, prefs) {
  const c = prefs.categories || {};
  return {
    user_id: userId,
    push_enabled: prefs.pushEnabled !== false,
    desktop_alerts: prefs.desktopAlerts !== false,
    sound_enabled: prefs.sound === true,
    email_critical: prefs.email === true,
    sms_critical: prefs.sms === true,
    whatsapp_critical: prefs.whatsappDigest !== false,
    category_messages: c[NOTIF_CATEGORIES.messages] !== false,
    category_orders: c[NOTIF_CATEGORIES.orders] !== false,
    category_payments: c[NOTIF_CATEGORIES.payments] !== false,
    category_delivery: c[NOTIF_CATEGORIES.delivery] !== false,
    category_security: c[NOTIF_CATEGORIES.security] !== false,
    category_promotions: c[NOTIF_CATEGORIES.promotions] !== false,
    category_system: c[NOTIF_CATEGORIES.system] !== false,
    category_business: c[NOTIF_CATEGORIES.business] !== false,
    category_admin: c[NOTIF_CATEGORIES.admin] !== false,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Charge depuis Supabase ; si aucune ligne, remonte le localStorage et fait un upsert initial.
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 */
export async function ensureNotificationPrefsSynced(supabase, userId) {
  if (!supabase?.from || !userId) return loadNotificationPrefs();
  try {
    const { data: row, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      console.warn("[notification_prefs] load:", error.message);
      return loadNotificationPrefs();
    }
    if (row) {
      const fromDb = dbRowToPrefs(row);
      if (fromDb) saveNotificationPrefs(fromDb);
      return fromDb || loadNotificationPrefs();
    }
    const local = loadNotificationPrefs();
    const ins = prefsToDbRow(userId, local);
    const { error: upErr } = await supabase.from("notification_preferences").upsert(ins, { onConflict: "user_id" });
    if (upErr) console.warn("[notification_prefs] seed:", upErr.message);
    return local;
  } catch (e) {
    console.warn("[notification_prefs]", e?.message || e);
    return loadNotificationPrefs();
  }
}

/**
 * Écrit localStorage + upsert `notification_preferences` (RLS : utilisateur connecté).
 * @param {import("@supabase/supabase-js").SupabaseClient|null} supabase
 * @param {string|null|undefined} userId
 * @param {object} partial
 */
export async function saveNotificationPrefsHybrid(supabase, userId, partial) {
  const next = saveNotificationPrefs(partial);
  if (!supabase?.from || !userId) return next;
  try {
    const row = prefsToDbRow(userId, next);
    const { error } = await supabase.from("notification_preferences").upsert(row, { onConflict: "user_id" });
    if (error) console.warn("[notification_prefs] save:", error.message);
  } catch (e) {
    console.warn("[notification_prefs] save", e?.message || e);
  }
  return next;
}
