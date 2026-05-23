import { useEffect, useMemo, useState } from "react";
import {
  NOTIF_CATEGORIES,
  NOTIF_PRIORITIES,
  enrichNotification,
  filterNotificationsByCategory,
  getNotificationCategoryLabel,
  getNotificationFullBody,
} from "../domain/notificationsDomain";
import { getNotificationOpenAction } from "../lib/notificationNavigation";
import {
  ensureNotificationPrefsSynced,
  loadNotificationPrefs,
  saveNotificationPrefsHybrid,
} from "../lib/notificationPrefs";
import { supabase } from "../lib/supabase";
import { EMAIL_POLICY_HINT_FR } from "../lib/notificationChannels";
import { PushManager } from "./PushManager";
import { EnablePushButton } from "./EnablePushButton";
import { NotificationRowContent, NotificationSkeletonList } from "./notifications/NotificationRowContent";

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: NOTIF_CATEGORIES.messages, label: "Messages" },
  { key: NOTIF_CATEGORIES.orders, label: "Commandes" },
  { key: NOTIF_CATEGORIES.payments, label: "Paiements" },
  { key: NOTIF_CATEGORIES.delivery, label: "Livraison" },
  { key: NOTIF_CATEGORIES.business, label: "Business" },
  { key: NOTIF_CATEGORIES.admin, label: "Admin" },
  { key: NOTIF_CATEGORIES.security, label: "Sécurité" },
  { key: NOTIF_CATEGORIES.promotions, label: "Promos" },
  { key: NOTIF_CATEGORIES.system, label: "Système" },
];

function priorityClass(p) {
  if (p === NOTIF_PRIORITIES.critical || p === "urgent") return "notif-card-priority-critical";
  if (p === NOTIF_PRIORITIES.important || p === "high") return "notif-card-priority-important";
  if (p === NOTIF_PRIORITIES.promo || p === "promo") return "notif-card-priority-promo";
  return "notif-card-priority-standard";
}

function categoryLabelFr(key) {
  return getNotificationCategoryLabel(key);
}

function NotificationDetailPanel({ raw, enriched, onClose, onOpen, onDismiss, siteLocale = "fr" }) {
  const fullBody = getNotificationFullBody(raw);
  const action = getNotificationOpenAction(raw, siteLocale);
  const hasOpen = action.kind !== "none";

  return (
    <div className="notif-detail" role="region" aria-label="Détail de la notification">
      <div className="notif-detail__head">
        <button type="button" className="notif-detail__back" onClick={onClose} aria-label="Retour à la liste">
          ← Liste
        </button>
        <button type="button" className="notif-hub-close" onClick={onClose} aria-label="Fermer le détail">
          ✕
        </button>
      </div>

      <div className="notif-detail__hero">
        <span className="notif-detail__avatar" aria-hidden>
          {enriched._image ? (
            <img src={enriched._image} alt="" loading="lazy" />
          ) : (
            <span className="notif-card-emoji">{enriched._icon}</span>
          )}
        </span>
        <div className="notif-detail__meta">
          <h3 className="notif-detail__title">{enriched._title}</h3>
          <div className="notif-detail__chips">
            <span className="notif-detail__chip">{categoryLabelFr(enriched._category)}</span>
            {raw.type && <span className="notif-detail__chip notif-detail__chip--muted">{String(raw.type)}</span>}
            <time className="notif-detail__time" dateTime={raw.created_at || undefined}>
              {enriched._timeLabel}
            </time>
          </div>
        </div>
      </div>

      <div className="notif-detail__body-wrap">
        <p className="notif-detail__body">{fullBody || enriched._body || "—"}</p>
        {enriched._deeplink?.startsWith("http") && !/\/image\/upload/i.test(enriched._deeplink) && (
          <p className="notif-detail__link-hint">Lien externe disponible dans l’action « Ouvrir »</p>
        )}
        {enriched._deeplink?.startsWith("/") && (
          <p className="notif-detail__link-hint">Page Yorix : {enriched._deeplink}</p>
        )}
      </div>

      <div className="notif-detail__actions">
        {hasOpen && (
          <button type="button" className="notif-detail__btn notif-detail__btn--primary" onClick={() => onOpen?.(raw)}>
            Ouvrir dans Yorix →
          </button>
        )}
        <button type="button" className="notif-detail__btn" onClick={onClose}>
          Fermer
        </button>
        <button
          type="button"
          className="notif-detail__btn notif-detail__btn--danger"
          onClick={() => {
            onDismiss?.(raw.id);
            onClose?.();
          }}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

/**
 * Centre de notifications premium (dropdown ou page complète).
 */
export function NotificationCenter({
  variant = "dropdown",
  notifs = [],
  user,
  goPage,
  siteLocale = "fr",
  onMarkRead,
  onMarkAllRead,
  onDismiss,
  onClose,
  onOpenNotif,
  onPrefsUpdated,
  initialSelectedId = null,
}) {
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [prefs, setPrefs] = useState(() => loadNotificationPrefs());
  const [viewportNarrow, setViewportNarrow] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 720,
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(max-width: 719px)");
    const onChange = () => setViewportNarrow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (initialSelectedId) setSelectedId(initialSelectedId);
  }, [initialSelectedId]);

  useEffect(() => {
    if (!user?.id) {
      setPrefs(loadNotificationPrefs());
      return undefined;
    }
    let cancelled = false;
    ensureNotificationPrefsSynced(supabase, user.id).then((p) => {
      if (!cancelled) setPrefs(p);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!initialSelectedId) return;
    const raw = notifs.find((n) => String(n.id) === String(initialSelectedId));
    if (raw && !raw.lu) {
      onMarkRead?.(raw, { navigate: false, closeDrawer: false });
    }
  }, [initialSelectedId, notifs, onMarkRead]);

  const filtered = useMemo(() => filterNotificationsByCategory(notifs, filter === "all" ? null : filter), [notifs, filter]);

  const selectedRaw = useMemo(
    () => filtered.find((n) => String(n.id) === String(selectedId)) ?? null,
    [filtered, selectedId],
  );

  useEffect(() => {
    if (selectedId && !filtered.some((n) => String(n.id) === String(selectedId))) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  const updatePrefs = (patch) => {
    saveNotificationPrefsHybrid(supabase, user?.id, patch).then((next) => {
      setPrefs(next);
      onPrefsUpdated?.(next);
    });
  };

  const unread = useMemo(() => notifs.filter((n) => !n.lu).length, [notifs]);

  const selectNotification = (raw) => {
    setSelectedId(raw.id);
    onMarkRead?.(raw, { navigate: false, closeDrawer: false });
  };

  const showDetailOnly = variant === "page" && selectedRaw && viewportNarrow;

  return (
    <div className={`notif-hub notif-hub--${variant}${selectedRaw ? " notif-hub--has-detail" : ""}`}>
      <div className="notif-hub-toolbar">
        <div className="notif-hub-title-row">
          <h2 className="notif-hub-title">Notifications</h2>
          {unread > 0 && <span className="notif-hub-badge">{unread > 99 ? "99+" : unread}</span>}
        </div>
        <div className="notif-hub-actions-top">
          {unread > 0 && (
            <button type="button" className="notif-link-btn" onClick={() => onMarkAllRead?.()}>
              Tout marquer lu
            </button>
          )}
          {variant === "dropdown" && (
            <button type="button" className="notif-link-btn notif-link-btn-strong" onClick={() => goPage?.("notifications")}>
              Voir tout
            </button>
          )}
          {variant === "dropdown" && (
            <button type="button" className="notif-hub-close" onClick={() => onClose?.()} aria-label="Fermer">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="notif-filter-strip" role="tablist">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={`notif-chip${filter === f.key ? " notif-chip--active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="notif-hub-body">
        {(!showDetailOnly || !selectedRaw) && (
          <div className={variant === "dropdown" ? "notif-hub-scroll notif-hub-scroll--drop" : "notif-hub-scroll notif-hub-scroll--page"}>
            {filtered.length === 0 ? (
              <div className="notif-empty premium">
                <div className="notif-empty-icon">🔕</div>
                <div className="notif-empty-title">Aucune alerte dans ce filtre</div>
                <p className="notif-empty-sub">Les commandes, messages et livraisons apparaîtront ici en temps réel.</p>
              </div>
            ) : (
              <ul className="notif-card-list">
                {filtered.map((raw) => {
                  const n = enrichNotification(raw);
                  const isSelected = String(raw.id) === String(selectedId);
                  return (
                    <li
                      key={String(n.id)}
                      className={`notif-card-li ${priorityClass(n._priority)}${isSelected ? " notif-card-li--selected" : ""}${!raw.lu ? " notif-card-li--unread" : ""}`}
                    >
                      <button
                        type="button"
                        className="notif-card-main"
                        aria-pressed={isSelected}
                        onClick={() => selectNotification(raw)}
                      >
                        <NotificationRowContent
                          enriched={n}
                          raw={raw}
                          timeLabel={n._timeAgo || n._timeLabel}
                          showUnreadDot
                        />
                      </button>
                      <div className="notif-card-side">
                        <button
                          type="button"
                          className="notif-mini-btn"
                          title="Marquer comme lu"
                          aria-label="Marquer comme lu"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead?.(raw, { navigate: false, closeDrawer: false });
                          }}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className="notif-mini-btn notif-mini-btn-del"
                          title="Supprimer"
                          aria-label="Supprimer la notification"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (String(raw.id) === String(selectedId)) setSelectedId(null);
                            onDismiss?.(raw.id);
                          }}
                        >
                          🗑
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {selectedRaw && (
          <NotificationDetailPanel
            raw={selectedRaw}
            enriched={enrichNotification(selectedRaw)}
            siteLocale={siteLocale}
            onClose={() => setSelectedId(null)}
            onOpen={(raw) => {
              if (!raw.lu) {
                onMarkRead?.(raw, { navigate: false, closeDrawer: false });
              }
              onOpenNotif?.(raw);
              if (variant === "dropdown") onClose?.();
            }}
            onDismiss={onDismiss}
          />
        )}
      </div>

      <div className="notif-hub-footer-premium">
        <div className="notif-preferences-mini">
          <div className="notif-preferences-title">Préférences (compte synchronisé)</div>
          <label className="notif-toggle">
            <input
              type="checkbox"
              checked={prefs.desktopAlerts !== false}
              onChange={(e) => updatePrefs({ desktopAlerts: e.target.checked })}
            />
            Alertes bureau (navigateur ouvert)
          </label>
          <label className="notif-toggle">
            <input
              type="checkbox"
              checked={prefs.sound}
              onChange={(e) => updatePrefs({ sound: e.target.checked })}
            />
            Son discret (si navigateur autorise)
          </label>
          <label className="notif-toggle">
            <input
              type="checkbox"
              checked={prefs.email}
              onChange={(e) => updatePrefs({ email: e.target.checked })}
            />
            E-mails importants (commandes, messages, paiements, livraison)
          </label>
          <p className="notif-policy-hint">{EMAIL_POLICY_HINT_FR}</p>
        </div>
        {user?.id &&
          (variant === "page" ? (
            <EnablePushButton variant="primary" />
          ) : (
            <PushManager user={user} compact />
          ))}
      </div>
    </div>
  );
}
