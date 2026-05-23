import { ensureLocalePath } from "./seoRoutes.js";

function payloadConversationId(notification) {
  const raw = notification?.payload ?? notification?.metadata;
  if (!raw || typeof raw !== "object") return null;
  const id = raw.conversation_id;
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

/** Parse /dashboard?tab=messages&… en action page dashboard. */
function parseInternalDashboardLink(link) {
  if (!link || !link.startsWith("/")) return null;
  try {
    const u = new URL(link, "https://yorix.local");
    const path = u.pathname.replace(/\/+$/, "") || "/";
    if (!path.endsWith("/dashboard") && path !== "/dashboard") return null;
    const dashTab = u.searchParams.get("tab") || "overview";
    return { dashTab };
  } catch {
    return null;
  }
}

/**
 * Détermine où envoyer l'utilisateur depuis une notification.
 * @param {Record<string, unknown>} notification
 * @param {string} [locale]
 */
export function getNotificationOpenAction(notification, locale = "fr") {
  if (!notification) return { kind: "none" };

  const link = String(notification.link || "").trim();
  const type = String(notification.type || "").toLowerCase();
  const blob = `${type} ${link} ${notification.titre || ""} ${notification.title || ""} ${notification.message || ""}`.toLowerCase();
  const conversationId = payloadConversationId(notification);

  if (link.startsWith("http")) return { kind: "external", url: link };

  const dashFromLink = parseInternalDashboardLink(link);
  if (dashFromLink) {
    return {
      kind: "page",
      page: "dashboard",
      dashTab: dashFromLink.dashTab,
      conversationId: conversationId || undefined,
    };
  }

  if (link.startsWith("/")) return { kind: "route", path: ensureLocalePath(link, locale) };

  if (type === "new_message" || /message|chat|conversation/.test(blob)) {
    return { kind: "page", page: "dashboard", dashTab: "messages", conversationId: conversationId || undefined };
  }
  if (type === "pack_moderation" || (link.includes("dashboard") && !link.includes("admin"))) {
    return { kind: "page", page: "dashboard" };
  }
  if (type === "new_product" || link.includes("tab=produits") || link.includes("page=admin")) {
    return { kind: "route", path: ensureLocalePath("/admin?tab=produits", locale) };
  }
  if (link.includes("/products/") || link.includes("/produit")) {
    return { kind: "page", page: "produits" };
  }
  if (/commande|order|booking/.test(blob)) {
    return { kind: "page", page: "dashboard", dashTab: "commandes" };
  }
  if (/livrai|deliver|colis/.test(blob)) {
    return { kind: "page", page: "livraison" };
  }
  if (/payment|paiement|checkout/.test(blob)) {
    return { kind: "page", page: "dashboard" };
  }

  return { kind: "none" };
}

/** @returns {boolean} true si une navigation a été déclenchée */
export function applyNotificationOpen(
  action,
  { navigate, goPage, setDashTab, setPendingChatConversationId } = {},
) {
  if (!action || action.kind === "none") return false;

  if (action.kind === "external") {
    window.open(action.url, "_blank", "noopener,noreferrer");
    return true;
  }
  if (action.kind === "route" && typeof navigate === "function") {
    navigate(action.path);
    return true;
  }
  if (action.kind === "page" && typeof goPage === "function") {
    goPage(action.page, action.pageOpts || {});
    if (action.dashTab && typeof setDashTab === "function") setDashTab(action.dashTab);
    if (action.conversationId && typeof setPendingChatConversationId === "function") {
      setPendingChatConversationId(action.conversationId);
    }
    return true;
  }
  return false;
}

const PENDING_OPEN_KEY = "yorix_notif_open_id";

export function stashNotificationOpenId(id) {
  if (!id || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_OPEN_KEY, String(id));
  } catch {
    /* ignore */
  }
}

export function consumeNotificationOpenId() {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const id = sessionStorage.getItem(PENDING_OPEN_KEY);
    if (id) sessionStorage.removeItem(PENDING_OPEN_KEY);
    return id;
  } catch {
    return null;
  }
}
