/**
 * Cloche notifications — dropdown desktop, drawer mobile premium.
 */
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../lib/supabase";
import {
  enrichNotification,
  getNotificationFullBody,
} from "../domain/notificationsDomain";
import { getNotificationOpenAction, stashNotificationOpenId } from "../lib/notificationNavigation";
import { NotificationRowContent, NotificationSkeletonList } from "./notifications/NotificationRowContent";

const PAGE_SIZE = 10;
const MOBILE_MQ = "(max-width: 768px)";

function hapticTap() {
  try {
    navigator.vibrate?.(10);
  } catch {
    /* ignore */
  }
}

export function NotificationBell({
  user,
  goPage,
  siteLocale = "fr",
  onSync,
  onOpenNotification,
  onMarkNotifRead,
  notifRevision = 0,
  unreadNotifs,
}) {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [items, setItems] = useState([]);
  const [localUnread, setLocalUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const dropdownRef = useRef(null);

  const unreadCount = unreadNotifs ?? localUnread;

  const closePanel = useCallback(() => {
    setOpen(false);
    setSelectedId(null);
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.id) return;
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("lu", false);
    setLocalUnread(count || 0);
  }, [user?.id]);

  const fetchNotifs = useCallback(
    async (pageNum = 0, append = false) => {
      if (!user?.id) return;
      setLoading(true);

      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (!error && data) {
        setItems((prev) => (append ? [...prev, ...data] : data));
        setHasMore(data.length === PAGE_SIZE);
        setPage(pageNum);
      }
      setLoading(false);
    },
    [user?.id],
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchUnreadCount();
  }, [user?.id, notifRevision, fetchUnreadCount]);

  useEffect(() => {
    if (!user?.id || !open) return;
    fetchNotifs(0, false);
    fetchUnreadCount();
  }, [user?.id, open, notifRevision, fetchNotifs, fetchUnreadCount]);

  useEffect(() => {
    if (!isMobile || !open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobile, open]);

  useEffect(() => {
    if (!open || isMobile) return undefined;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        closePanel();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, isMobile, closePanel]);

  const markAsRead = async (notifId) => {
    if (!user?.id) return;
    await supabase.from("notifications").update({ lu: true }).eq("id", notifId).eq("user_id", user.id);
    setItems((prev) => prev.map((n) => (n.id === notifId ? { ...n, lu: true } : n)));
    setLocalUnread((c) => Math.max(0, c - 1));
    onSync?.();
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;
    await supabase.from("notifications").update({ lu: true }).eq("user_id", user.id).eq("lu", false);
    setItems((prev) => prev.map((n) => ({ ...n, lu: true })));
    setLocalUnread(0);
    onSync?.();
  };

  const handleSelectNotif = async (notif) => {
    setSelectedId(notif.id);
    if (onMarkNotifRead) {
      await onMarkNotifRead(notif, { navigate: false, closeDrawer: false });
    } else if (!notif.lu) {
      await markAsRead(notif.id);
    }
  };

  const handleOpenSelected = async (notif) => {
    if (!notif.lu) {
      if (onMarkNotifRead) {
        await onMarkNotifRead(notif, { navigate: false, closeDrawer: false });
      } else {
        await markAsRead(notif.id);
      }
    }
    if (onOpenNotification?.(notif)) {
      closePanel();
      return;
    }
    closePanel();
    stashNotificationOpenId(notif.id);
    goPage?.("notifications");
  };

  const toggleOpen = () => {
    setOpen((wasOpen) => {
      if (!wasOpen) hapticTap();
      else setSelectedId(null);
      return !wasOpen;
    });
  };

  const selectedNotif = items.find((n) => n.id === selectedId);
  const selectedEnriched = selectedNotif ? enrichNotification(selectedNotif) : null;
  const selectedAction = selectedNotif ? getNotificationOpenAction(selectedNotif, siteLocale) : { kind: "none" };

  const loadMore = () => fetchNotifs(page + 1, true);

  if (!user?.id) return null;

  const panelShellClass = isMobile ? "ybell-m-drawer" : "ybell-drop";

  const renderPanel = () => (
    <div className={panelShellClass} role="dialog" aria-label="Notifications" aria-modal={isMobile ? "true" : undefined}>
      <div className="ybell-head">
        <div className="ybell-head-title">
          🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}
        </div>
        <div className="ybell-head-actions">
          <button
            type="button"
            className="ybell-head-action"
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            Tout marquer lu
          </button>
          {isMobile && (
            <button type="button" className="ybell-head-close" onClick={closePanel} aria-label="Fermer">
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="ybell-list ybell-scroll-panel">
        {loading && items.length === 0 ? (
          <NotificationSkeletonList count={4} />
        ) : items.length === 0 ? (
          <div className="ybell-empty">
            <div className="ybell-empty-ico">🔕</div>
            <p>Aucune notification pour le moment.</p>
          </div>
        ) : (
          <>
            {items.map((n) => {
              const enriched = enrichNotification(n);
              return (
                <div
                  key={n.id}
                  className={`ybell-item${!n.lu ? " ybell-item--unread" : ""}${selectedId === n.id ? " ybell-item--selected" : ""}`}
                  onClick={() => handleSelectNotif(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSelectNotif(n)}
                >
                  <NotificationRowContent
                    enriched={enriched}
                    raw={n}
                    timeLabel={enriched._timeAgo || enriched._timeLabel}
                    compact
                    showUnreadDot
                  />
                </div>
              );
            })}
            {loading && items.length > 0 && <div className="ybell-loading">Chargement…</div>}
          </>
        )}
      </div>

      {selectedNotif && selectedEnriched && (
        <div className="ybell-detail" role="region" aria-label="Détail notification">
          <h4 className="ybell-detail-title">{selectedEnriched._title}</h4>
          <p className="ybell-detail-body">
            {getNotificationFullBody(selectedNotif) || selectedEnriched._body}
          </p>
          <div className="ybell-detail-actions">
            {selectedAction.kind !== "none" && (
              <button
                type="button"
                className="ybell-detail-btn ybell-detail-btn--primary"
                onClick={() => handleOpenSelected(selectedNotif)}
              >
                Ouvrir dans Yorix →
              </button>
            )}
            <button
              type="button"
              className="ybell-detail-btn ybell-detail-btn--ghost"
              onClick={() => {
                stashNotificationOpenId(selectedNotif.id);
                goPage?.("notifications");
                closePanel();
              }}
            >
              Voir sur la page Notifications
            </button>
            <button
              type="button"
              className="ybell-detail-btn ybell-detail-btn--ghost"
              onClick={() => setSelectedId(null)}
            >
              ← Retour à la liste
            </button>
          </div>
        </div>
      )}

      <div className="ybell-foot">
        {hasMore && items.length > 0 && (
          <button type="button" className="ybell-foot-btn" onClick={loadMore} disabled={loading}>
            {loading ? "…" : "Charger plus"}
          </button>
        )}
        <button
          type="button"
          className="ybell-foot-btn"
          onClick={() => {
            goPage?.("notifications");
            closePanel();
          }}
        >
          Voir tout →
        </button>
      </div>
    </div>
  );

  const css = `
    .ybell-wrap { position: relative; display: inline-flex; flex-shrink: 0; z-index: 2; }
    .ybell-btn {
      position: relative; background: var(--surface2); border: 1px solid var(--border);
      padding: 0; cursor: pointer; border-radius: 50%;
      transition: background .15s, transform .12s ease, box-shadow .15s;
      color: inherit; min-width: 44px; min-height: 44px;
      display: flex; align-items: center; justify-content: center;
      touch-action: manipulation; -webkit-tap-highlight-color: transparent;
    }
    .ybell-btn:hover { background: var(--green-pale); }
    .ybell-btn:active { transform: scale(0.94); }
    .ybell-icon { width: 22px; height: 22px; display: block; pointer-events: none; }
    .ybell-badge {
      position: absolute; top: 2px; right: 2px; min-width: 17px; height: 17px;
      padding: 0 4px; background: linear-gradient(135deg, #dc2626, #ef4444); color: #fff;
      border-radius: 50px; font-size: .6rem; font-weight: 800; font-family: 'DM Sans', sans-serif;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 8px rgba(220, 38, 38, .45);
      animation: ybellPulse 2s ease-in-out infinite; pointer-events: none;
      border: 2px solid var(--surface);
    }
    @keyframes ybellPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
    .ybell-drop {
      position: absolute; top: calc(100% + 8px); right: 0;
      width: min(420px, 92vw); max-height: min(560px, calc(100vh - 96px));
      background: var(--surface); color: var(--ink);
      border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,.12), 0 4px 14px rgba(26,107,58,.08);
      border: 1px solid var(--border); overflow: hidden; display: flex; flex-direction: column;
      z-index: 9999; animation: ybellSlide .22s ease-out;
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    }
    @keyframes ybellSlide { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .ybell-m-backdrop {
      position: fixed; inset: 0; z-index: 1070;
      background: rgba(13, 31, 20, .45);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      animation: ybellFadeIn .22s ease;
    }
    @keyframes ybellFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .ybell-m-drawer {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 1080;
      max-height: min(88vh, 640px);
      background: var(--surface); color: var(--ink);
      border-radius: 18px 18px 0 0;
      border: 1px solid var(--border); border-bottom: none;
      box-shadow: 0 -16px 48px rgba(0, 0, 0, .18);
      display: flex; flex-direction: column; overflow: hidden;
      animation: ybellDrawerUp .28s cubic-bezier(0.22, 1, 0.36, 1);
      will-change: transform;
      padding-bottom: env(safe-area-inset-bottom);
    }
    @keyframes ybellDrawerUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .ybell-head {
      padding: 14px 16px; background: linear-gradient(135deg, #0a1410, #1a3a24); color: #fff;
      display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; gap: 10px;
      position: sticky; top: 0; z-index: 2;
    }
    .ybell-head-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1rem; letter-spacing: -.3px; min-width: 0; }
    .ybell-head-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
    .ybell-head-action {
      background: rgba(252, 209, 22, .14); color: #fcd116;
      border: 1px solid rgba(252, 209, 22, .3); padding: 5px 10px; border-radius: 50px;
      font-size: .68rem; font-weight: 700; cursor: pointer; font-family: inherit;
      min-height: 36px; touch-action: manipulation;
    }
    .ybell-head-action:disabled { opacity: .4; cursor: not-allowed; }
    .ybell-head-close {
      width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,.25);
      background: rgba(255,255,255,.1); color: #fff; cursor: pointer; font-size: .85rem;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .ybell-scroll-panel {
      flex: 1; overflow-y: auto; overflow-x: hidden; padding: 8px;
      min-height: 0; -webkit-overflow-scrolling: touch; scroll-behavior: smooth;
    }
    .ybell-empty { padding: 50px 24px; text-align: center; color: var(--gray); }
    .ybell-empty-ico { font-size: 2.6rem; opacity: .35; margin-bottom: 10px; }
    .ybell-item {
      width: 100%; box-sizing: border-box; border-radius: 12px; cursor: pointer;
      transition: background .2s ease, transform .12s ease; position: relative;
      margin-bottom: 6px; border: 1px solid transparent;
      overflow: hidden; max-width: 100%;
    }
    .ybell-item:hover { background: var(--surface2); }
    .ybell-item:active { transform: scale(0.99); }
    .ybell-item--unread { background: rgba(26, 107, 58, .05); border-color: rgba(26,107,58,.12); }
    .ybell-item--selected { background: rgba(26, 107, 58, .1); border-color: rgba(26,107,58,.25); box-shadow: 0 0 0 2px rgba(26,107,58,.12); }
    .ybell-foot { border-top: 1px solid var(--border); padding: 10px; display: flex; gap: 8px; flex-shrink: 0; }
    .ybell-foot-btn {
      flex: 1; padding: 11px 9px; background: var(--surface2); border: 1px solid var(--border);
      border-radius: 9px; cursor: pointer; font-size: .78rem; font-weight: 700; color: var(--green);
      min-height: 44px; touch-action: manipulation;
    }
    .ybell-foot-btn:disabled { opacity: .5; cursor: not-allowed; }
    .ybell-loading { text-align: center; padding: 12px; color: var(--gray); font-size: .78rem; }
    .ybell-detail {
      border-top: 1px solid var(--border); padding: 12px 14px; background: var(--surface2);
      max-height: 42vh; overflow-y: auto; -webkit-overflow-scrolling: touch; flex-shrink: 0;
    }
    .ybell-detail-title { font-family: 'Syne', sans-serif; font-weight: 800; font-size: .92rem; margin: 0 0 8px; color: var(--ink); }
    .ybell-detail-body { font-size: .88rem; line-height: 1.55; color: var(--ink); white-space: pre-wrap; word-break: break-word; overflow-wrap: anywhere; margin: 0 0 12px; }
    .ybell-detail-actions { display: flex; flex-direction: column; gap: 8px; }
    .ybell-detail-btn {
      padding: 11px 14px; border-radius: 9px; border: none; cursor: pointer;
      font-size: .78rem; font-weight: 700; font-family: inherit; min-height: 44px;
    }
    .ybell-detail-btn--primary { background: var(--green); color: #fff; }
    .ybell-detail-btn--ghost { background: var(--surface); border: 1px solid var(--border); color: var(--ink); }
    @media (min-width: 769px) {
      .ybell-btn { background: none; border: none; min-width: auto; min-height: auto; padding: 8px; }
      .ybell-badge { border: none; top: 3px; right: 3px; }
    }
    @media (prefers-reduced-motion: reduce) {
      .ybell-m-drawer, .ybell-m-backdrop, .ybell-drop, .ybell-badge { animation: none !important; }
    }
  `;

  const mobilePortal =
    isMobile && open && typeof document !== "undefined"
      ? createPortal(
          <>
            <div className="ybell-m-backdrop" onClick={closePanel} aria-hidden />
            {renderPanel()}
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <style>{css}</style>
      <div className="ybell-wrap" ref={dropdownRef}>
        <button
          type="button"
          className="ybell-btn"
          onClick={toggleOpen}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
          aria-expanded={open}
          aria-haspopup="dialog"
        >
          <svg
            className="ybell-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="ybell-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
          )}
        </button>

        {open && !isMobile && renderPanel()}
      </div>
      {mobilePortal}
    </>
  );
}
