import { useState } from "react";
import { getNotificationCategoryLabel } from "../../domain/notificationsDomain";

const CATEGORY_COLORS = {
  orders: "var(--green)",
  messages: "#2563eb",
  promotions: "#dc2626",
  payments: "#059669",
  delivery: "#d97706",
  catalog: "var(--green)",
  business: "#7c3aed",
  admin: "#64748b",
  security: "#b91c1c",
  system: "var(--gray)",
};

export function categoryColorFor(cat) {
  return CATEGORY_COLORS[String(cat || "").toLowerCase()] || "var(--gray)";
}

/**
 * Ligne notification premium partagée (cloche + centre).
 */
export function NotificationRowContent({
  enriched,
  raw,
  timeLabel,
  compact = false,
  showUnreadDot = false,
}) {
  const [imgErr, setImgErr] = useState(false);
  const cat = enriched._category;
  const catColor = categoryColorFor(cat);
  const showImg = enriched._image && !imgErr;

  return (
    <div className={`notif-row${compact ? " notif-row--compact" : ""}${!raw?.lu ? " notif-row--unread" : ""}`}>
      <span className="notif-thumb-wrap" aria-hidden>
        {showImg ? (
          <img
            className="notif-thumb"
            src={enriched._image}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImgErr(true)}
          />
        ) : (
          <span className="notif-thumb-fallback">{enriched._icon}</span>
        )}
        {showUnreadDot && !raw?.lu && <span className="notif-unread-dot" />}
      </span>

      <div className="notif-row-copy">
        <h4 className="notif-title">{enriched._title}</h4>
        {enriched._body ? <p className="notif-description">{enriched._body}</p> : null}
        <div className="notif-meta">
          <span
            className="notif-badge"
            style={{
              background: `color-mix(in srgb, ${catColor} 14%, transparent)`,
              color: catColor,
            }}
          >
            {getNotificationCategoryLabel(cat)}
          </span>
          {timeLabel ? (
            <time className="notif-time" dateTime={raw?.created_at || undefined}>
              {timeLabel}
            </time>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeletonList({ count = 3 }) {
  return (
    <div className="notif-skeleton-list" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="notif-skeleton-item">
          <span className="notif-skeleton-thumb" />
          <span className="notif-skeleton-lines">
            <span className="notif-skeleton-line notif-skeleton-line--short" />
            <span className="notif-skeleton-line" />
            <span className="notif-skeleton-line notif-skeleton-line--tiny" />
          </span>
        </div>
      ))}
    </div>
  );
}
