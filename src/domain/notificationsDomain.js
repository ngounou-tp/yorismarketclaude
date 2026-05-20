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
});

/** Niveaux de priorité affichage (stockage + alias métier). */
export const NOTIF_PRIORITIES = /** @type {const} */ ({
  critical: "critical",
  important: "important",
  standard: "standard",
  promo: "promo",
});

const TYPE_RULES = [
  { test: (t) => /new_product|nouveau produit publié/i.test(t || ""), category: NOTIF_CATEGORIES.system, priority: NOTIF_PRIORITIES.standard },
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
};

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

/** Corps complet pour le panneau détail (texte intégral, retours à la ligne conservés). */
export function getNotificationFullBody(row) {
  if (row == null) return "";
  const msg = row.message ?? row.body ?? row.content ?? "";
  return String(msg).trim();
}

/** Remplace URLs brutes par un libellé lisible. */
export function formatNotificationBody(raw) {
  if (raw == null) return "";
  return String(raw).replace(/https?:\/\/[^\s]+/g, (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("wa.me") || u.hostname.includes("whatsapp")) return "Lien WhatsApp";
      if (u.hostname.includes("yorix")) return "Ouvrir sur Yorix";
      return `[${u.hostname}]`;
    } catch {
      return "Lien";
    }
  });
}

/**
 * @param {Record<string, unknown>} row — ligne Supabase `notifications`
 */
export function enrichNotification(row) {
  const type = row.type || "";
  const displayTitle = String(row.titre || row.title || "");
  const inferred = inferFromType(type, displayTitle, row.message);
  const category = row.category || inferred.category;
  const priority = normalizeNotificationPriority(row.priority || inferred.priority);

  return {
    ...row,
    _category: category,
    _priority: priority,
    _icon: row.icon || CATEGORY_ICONS[category] || "🔔",
    _title: displayTitle || "Notification Yorix",
    _body: formatNotificationBody(row.message),
    _image:
      row.image_url ||
      (typeof row.metadata === "object" && row.metadata !== null && row.metadata.image_url) ||
      null,
    _deeplink: typeof row.link === "string" ? row.link.trim() : "",
    _timeLabel: row.created_at
      ? new Date(row.created_at).toLocaleString("fr-FR", {
          dateStyle: "short",
          timeStyle: "short",
        })
      : "",
  };
}

export function filterNotificationsByCategory(items, filterKey) {
  if (!filterKey || filterKey === "all") return items;
  return (items || []).filter((n) => enrichNotification(n)._category === filterKey);
}

/** Notification navigateur (permission déjà accordée). */
export function showBrowserNotificationIfPossible(enrichedRow, prefs) {
  if (typeof window === "undefined" || typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  if (!prefs?.pushBrowser) return;
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
