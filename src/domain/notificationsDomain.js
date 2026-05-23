/** Catégories filtrables (UI + préférences). */
export const NOTIF_CATEGORIES = /** @type {const} */ ({
  messages: "messages",
  orders: "orders",
  payments: "payments",
  delivery: "delivery",
  security: "security",
  promotions: "promotions",
  system: "system",
  business: "business",
  admin: "admin",
  catalog: "catalog",
});

/** Niveaux de priorité affichage (stockage + alias métier). */
export const NOTIF_PRIORITIES = /** @type {const} */ ({
  critical: "critical",
  important: "important",
  standard: "standard",
  promo: "promo",
});

const TYPE_RULES = [
  { test: (t) => /new_product|nouveau produit publié|catalog/i.test(t || ""), category: NOTIF_CATEGORIES.catalog, priority: NOTIF_PRIORITIES.standard },
  { test: (t) => /pack_moderation|pack approuvé|pack refusé|pack à corriger/i.test(t || ""), category: NOTIF_CATEGORIES.business, priority: NOTIF_PRIORITIES.standard },
  { test: (t) => /stock_alert|rupture de stock|produit en rupture|produit archivé/i.test(t || ""), category: NOTIF_CATEGORIES.business, priority: NOTIF_PRIORITIES.important },
  { test: (t) => /admin|incident|réclamation|reclamation|staff yorix|paiement bloqué/i.test(t || ""), category: NOTIF_CATEGORIES.admin, priority: NOTIF_PRIORITIES.critical },
  { test: (t) => /business|b2b|partenaire|yorix business/i.test(t || ""), category: NOTIF_CATEGORIES.business, priority: NOTIF_PRIORITIES.important },
  { test: (t) => /payment|paiement|checkout|cinetpay|escrow/i.test(t || ""), category: NOTIF_CATEGORIES.payments, priority: NOTIF_PRIORITIES.critical },
  { test: (t) => /security|fraud|litige|connexion|login|suspicious/i.test(t || ""), category: NOTIF_CATEGORIES.security, priority: NOTIF_PRIORITIES.critical },
  { test: (t) => /deliver|livraison|livreur|shipping|colis/i.test(t || ""), category: NOTIF_CATEGORIES.delivery, priority: NOTIF_PRIORITIES.important },
  { test: (t) => /order|commande|booking|réservation|prestation|service_booking/i.test(t || ""), category: NOTIF_CATEGORIES.orders, priority: NOTIF_PRIORITIES.important },
  { test: (t) => /message|chat|support|conversation/i.test(t || ""), category: NOTIF_CATEGORIES.messages, priority: NOTIF_PRIORITIES.important },
  { test: (t) => /promo|offre|soldes|flash/i.test(t || ""), category: NOTIF_CATEGORIES.promotions, priority: NOTIF_PRIORITIES.promo },
];

const CATEGORY_ICONS = {
  [NOTIF_CATEGORIES.messages]: "💬",
  [NOTIF_CATEGORIES.orders]: "📦",
  [NOTIF_CATEGORIES.payments]: "💳",
  [NOTIF_CATEGORIES.delivery]: "🚚",
  [NOTIF_CATEGORIES.security]: "🛡️",
  [NOTIF_CATEGORIES.promotions]: "🏷️",
  [NOTIF_CATEGORIES.system]: "🔔",
  [NOTIF_CATEGORIES.business]: "💼",
  [NOTIF_CATEGORIES.admin]: "⚙️",
  [NOTIF_CATEGORIES.catalog]: "🛍️",
};

/** Libellés FR pour chips / cloche / détail */
export const NOTIF_CATEGORY_LABELS_FR = {
  [NOTIF_CATEGORIES.messages]: "Messages",
  [NOTIF_CATEGORIES.orders]: "Commandes",
  [NOTIF_CATEGORIES.payments]: "Paiements",
  [NOTIF_CATEGORIES.delivery]: "Livraison",
  [NOTIF_CATEGORIES.business]: "Business",
  [NOTIF_CATEGORIES.admin]: "Admin",
  [NOTIF_CATEGORIES.security]: "Sécurité",
  [NOTIF_CATEGORIES.promotions]: "Promos",
  [NOTIF_CATEGORIES.system]: "Système",
  [NOTIF_CATEGORIES.catalog]: "Catalogue",
  catalog: "Catalogue",
};

export function getNotificationCategoryLabel(category) {
  if (!category) return NOTIF_CATEGORY_LABELS_FR[NOTIF_CATEGORIES.system];
  return NOTIF_CATEGORY_LABELS_FR[category] || NOTIF_CATEGORY_LABELS_FR[String(category)] || String(category);
}

/** @param {unknown} p */
export function normalizeNotificationPriority(p) {
  if (p == null || p === "") return NOTIF_PRIORITIES.standard;
  const s = String(p).toLowerCase();
  if (s === "urgent" || s === "critical") return NOTIF_PRIORITIES.critical;
  if (s === "high" || s === "important") return NOTIF_PRIORITIES.important;
  if (s === "normal" || s === "standard") return NOTIF_PRIORITIES.standard;
  if (s === "promo" || s === "promotion") return NOTIF_PRIORITIES.promo;
  return NOTIF_PRIORITIES.standard;
}

function inferFromType(type, titre, message) {
  const blob = `${type || ""} ${titre || ""} ${message || ""}`;
  for (const rule of TYPE_RULES) {
    if (rule.test(blob)) return { category: rule.category, priority: rule.priority };
  }
  return { category: NOTIF_CATEGORIES.system, priority: NOTIF_PRIORITIES.standard };
}

/** Corps complet pour le panneau détail (texte nettoyé, sans URLs techniques). */
export function getNotificationFullBody(row) {
  if (row == null) return "";
  const msg = row.message ?? row.body ?? row.content ?? "";
  return cleanNotificationText(String(msg));
}

/**
 * Retire URLs, chemins Cloudinary et extensions image du texte affiché.
 * @param {string} text
 */
export function cleanNotificationText(text = "") {
  let s = String(text ?? "");
  s = s.replace(/https?:\/\/[^\s]+/gi, " ");
  s = s.replace(/\/image\/upload[^\s]*/gi, " ");
  s = s.replace(/\/[^\s]*\.(jpg|jpeg|png|webp|gif|svg|avif)(\?[^\s]*)?/gi, " ");
  s = s.replace(/\b[\w-]+(?:\/[\w.-]+)+\.(jpg|jpeg|png|webp|gif)\b/gi, " ");
  s = s.replace(/res\.cloudinary\.com[^\s]*/gi, " ");
  s = s.replace(/\s{2,}/g, " ").trim();
  return s;
}

/** Extrait une URL image utilisable depuis le message brut. */
export function extractNotificationImageUrl(text) {
  const s = String(text ?? "");
  const httpImg = s.match(/https?:\/\/[^\s]+?\.(?:jpg|jpeg|png|webp|gif|avif)(?:\?[^\s]*)?/i);
  if (httpImg) return httpImg[0];
  const cloud = s.match(/https?:\/\/[^\s]*\/image\/upload\/[^\s]+/i);
  if (cloud) return cloud[0].replace(/[,)\]}>]+$/, "");
  return null;
}

function cleanNotificationTitle(title) {
  const cleaned = cleanNotificationText(title);
  return cleaned || "Notification Yorix";
}

/** Temps relatif FR (il y a X min). */
export function formatNotificationTimeAgo(date) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "";
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "à l'instant";
  if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `il y a ${Math.floor(diff / 86400)} j`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/** Remplace URLs brutes par un libellé lisible (legacy — préférer cleanNotificationText en liste). */
export function formatNotificationBody(raw) {
  if (raw == null) return "";
  return cleanNotificationText(String(raw));
}

/**
 * @param {Record<string, unknown>} row — ligne Supabase `notifications`
 */
export function enrichNotification(row) {
  const type = row.type || "";
  const rawMessage = row.message ?? row.body ?? row.content ?? "";
  const displayTitle = String(row.titre || row.title || "");
  const inferred = inferFromType(type, displayTitle, rawMessage);
  const rawCategory = row.category || inferred.category;
  const category = rawCategory === "catalog" ? NOTIF_CATEGORIES.catalog : rawCategory;
  const priority = normalizeNotificationPriority(row.priority || inferred.priority);

  const explicitImage =
    row.image_url ||
    (typeof row.metadata === "object" && row.metadata !== null && row.metadata.image_url) ||
    null;
  const imageFromMessage = extractNotificationImageUrl(rawMessage);

  return {
    ...row,
    _category: category,
    _priority: priority,
    _icon: row.icon || CATEGORY_ICONS[category] || "🔔",
    _title: cleanNotificationTitle(displayTitle),
    _body: formatNotificationBody(rawMessage),
    _image: explicitImage || imageFromMessage || null,
    _deeplink: typeof row.link === "string" ? row.link.trim() : "",
    _timeLabel: row.created_at
      ? new Date(row.created_at).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "",
    _timeAgo: formatNotificationTimeAgo(row.created_at),
  };
}

export function filterNotificationsByCategory(items, filterKey) {
  if (!filterKey || filterKey === "all") return items;
  return (items || []).filter((n) => {
    const cat = enrichNotification(n)._category;
    if (filterKey === NOTIF_CATEGORIES.system) {
      return cat === NOTIF_CATEGORIES.system || cat === NOTIF_CATEGORIES.catalog;
    }
    return cat === filterKey;
  });
}

/** Notification navigateur (permission déjà accordée). */
export function showBrowserNotificationIfPossible(enrichedRow, prefs) {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (!prefs?.desktopAlerts && !prefs?.pushBrowser) return;
  const cat = enrichedRow._category || NOTIF_CATEGORIES.system;
  if (prefs.categories && prefs.categories[cat] === false) return;

  try {
    /* eslint-disable no-new */
    new Notification(enrichedRow._title, {
      body: (enrichedRow._body || "").slice(0, 180),
      icon: "/favicon.svg",
      tag: String(enrichedRow.id || enrichedRow.created_at || "yorix"),
      silent: !prefs?.sound,
    });
  } catch {
    /* vieux navigateurs */
  }
}
