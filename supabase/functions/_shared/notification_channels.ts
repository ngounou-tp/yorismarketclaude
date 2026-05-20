/**
 * Politique canaux Yorix — source de vérité côté Edge (dispatch / webhooks).
 * Email Resend uniquement via webhook critique + opt-in `email_critical`.
 * Catalogue, stock vendeur, packs : in-app (+ push optionnel) seulement.
 */

export const EMAIL_ELIGIBLE_CATEGORIES = new Set([
  "messages",
  "orders",
  "payments",
  "delivery",
  "security",
]);

/** Types explicitement sans email (même si priorité élevée). */
export const EMAIL_INELIGIBLE_TYPES = new Set([
  "new_product",
  "pack_moderation",
  "stock_alert",
  "catalog_update",
  "promotion",
  "system_broadcast",
  "yorix_broadcast",
  "admin_broadcast",
]);

export type NotificationMeta = {
  type: string;
  category: string;
  priority: string;
  metaKind: string;
  blob: string;
};

export function extractNotificationMeta(row: Record<string, unknown>): NotificationMeta {
  const type = String(row.type || "").toLowerCase();
  const category = String(row.category || "").toLowerCase();
  const priority = String(row.priority || "").toLowerCase();
  const rawMeta = row.metadata ?? row.payload;
  let metaKind = "";
  if (rawMeta && typeof rawMeta === "object") {
    metaKind = String((rawMeta as Record<string, unknown>).kind || "").toLowerCase();
  }
  const blob = `${type} ${category} ${row.title || ""} ${row.titre || ""} ${row.message || ""}`.toLowerCase();
  return { type, category, priority, metaKind, blob };
}

type PrefsEmail = { email_critical?: boolean | null };

/** Webhook n8n / email : uniquement événements importants + opt-in utilisateur. */
export function shouldTriggerEmailWebhook(
  row: Record<string, unknown>,
  prefs: PrefsEmail | null,
): boolean {
  const { type, category, priority, metaKind, blob } = extractNotificationMeta(row);

  if (EMAIL_INELIGIBLE_TYPES.has(type)) return false;
  if (metaKind === "stock_alert" || type === "stock_alert") return false;
  if (type === "pack_moderation") return false;
  if (type === "new_product" || metaKind === "new_product") return false;

  if (["catalog", "business", "promotions", "system"].includes(category)) return false;

  if (category === "admin") {
    const incident = /incident|réclamation|reclamation|fraud|litige|bloqué|security|paiement bloqué/i.test(blob);
    return incident && prefs?.email_critical === true;
  }

  if (!EMAIL_ELIGIBLE_CATEGORIES.has(category)) return false;
  if (prefs?.email_critical !== true) return false;
  if (priority === "standard" || priority === "promo") return false;

  return true;
}

/** Push haute urgence (TTL long) — indépendant de l'email. */
export function isHighUrgencyPush(row: Record<string, unknown>, category: string, priority: string): boolean {
  const { type, metaKind } = extractNotificationMeta(row);
  if (EMAIL_INELIGIBLE_TYPES.has(type) || metaKind === "stock_alert") return false;
  return (
    priority === "critical" ||
    category === "security" ||
    category === "payments" ||
    (category === "orders" && priority === "important")
  );
}
