/**
 * Politique canaux (miroir client de `_shared/notification_channels.ts`).
 * Les emails transactionnels passent par le webhook critique, pas le bundle SPA.
 */

import { NOTIF_CATEGORIES } from "../domain/notificationsDomain";

export const EMAIL_ELIGIBLE_CATEGORIES = [
  NOTIF_CATEGORIES.messages,
  NOTIF_CATEGORIES.orders,
  NOTIF_CATEGORIES.payments,
  NOTIF_CATEGORIES.delivery,
  NOTIF_CATEGORIES.security,
];

export const EMAIL_POLICY_HINT_FR =
  "Les e-mails partent uniquement pour les messages, commandes, paiements, livraison et alertes de sécurité (si activés). Nouveaux produits, stock et packs : notification dans l'app seulement.";

/** @param {string} [type] */
export function defaultCategoryForType(type) {
  const t = String(type || "").toLowerCase();
  if (t === "new_message") return NOTIF_CATEGORIES.messages;
  if (t === "seller_new_order") return NOTIF_CATEGORIES.orders;
  if (t === "pack_moderation" || t === "stock_alert") return NOTIF_CATEGORIES.business;
  if (t === "new_product") return NOTIF_CATEGORIES.system;
  return NOTIF_CATEGORIES.system;
}

/** @param {string} [type] */
export function defaultPriorityForType(type) {
  const t = String(type || "").toLowerCase();
  if (t === "seller_new_order" || t === "new_message") return "important";
  return "standard";
}
