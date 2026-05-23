import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { searchUsersForChat, chatRoleLabel } from "../../lib/chatConversations";

const DEBOUNCE_MS = 300;
const MOBILE_MQ = "(max-width: 768px)";

function SearchSkeleton() {
  return (
    <div className="msg-new-modal__skeleton" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div key={i} className="msg-new-modal__skel-row">
          <span className="msg-new-modal__skel-av" />
          <span className="msg-new-modal__skel-lines">
            <span className="msg-new-modal__skel-line msg-new-modal__skel-line--short" />
            <span className="msg-new-modal__skel-line" />
          </span>
        </div>
      ))}
    </div>
  );
}

function ProfileAvatar({ profile }) {
  const [err, setErr] = useState(false);
  const letter = (profile.full_name || profile.username || "M")[0].toUpperCase();

  if (profile.avatar_url && !err) {
    return (
      <img
        className="msg-new-modal__av-img"
        src={profile.avatar_url}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setErr(true)}
      />
    );
  }

  return <span className="msg-new-modal__av-fallback">{letter}</span>;
}

/**
 * Modal premium « Nouveau message » — bottom sheet mobile, modal desktop.
 */
export function NewMessageModal({ open, supabase, userId, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retryTick, setRetryTick] = useState(0);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia(MOBILE_MQ);
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError("");
      setLoading(false);
      return;
    }
    const t = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!open) return undefined;

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setError("");
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError("");

    debounceRef.current = setTimeout(async () => {
      const reqId = ++reqIdRef.current;
      try {
        const rows = await searchUsersForChat(supabase, q, 10);
        if (reqId !== reqIdRef.current) return;
        setResults(rows.filter((r) => r.id !== userId));
        setError("");
      } catch (err) {
        if (reqId !== reqIdRef.current) return;
        setError(err.message || "Recherche impossible");
        setResults([]);
      }
      if (reqId === reqIdRef.current) setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query, supabase, userId, open, retryTick]);

  const handlePick = (profile) => {
    try {
      navigator.vibrate?.(8);
    } catch {
      /* ignore */
    }
    onSelect?.(profile);
    onClose?.();
  };

  if (!open || typeof document === "undefined") return null;

  const shellClass = isMobile ? "msg-new-modal msg-new-modal--sheet" : "msg-new-modal msg-new-modal--dialog";

  return createPortal(
    <>
      <div className="msg-new-modal__backdrop" onClick={onClose} aria-hidden />
      <div className={shellClass} role="dialog" aria-modal="true" aria-label="Nouveau message">
        <div className="msg-new-modal__handle" aria-hidden={!isMobile} />
        <div className="msg-new-modal__head">
          <h3 className="msg-new-modal__title">Nouveau message</h3>
          <button type="button" className="msg-new-modal__close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="msg-new-modal__search-wrap">
          <span className="msg-new-modal__search-icon" aria-hidden>🔍</span>
          <input
            ref={inputRef}
            type="search"
            className="msg-new-modal__input"
            placeholder="Rechercher par nom, boutique ou pseudo…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            aria-label="Rechercher un membre"
          />
        </div>

        <div className="msg-new-modal__list">
          {loading && <SearchSkeleton />}
          {!loading && error && (
            <div className="msg-new-modal__error" role="alert">
              <strong>Recherche indisponible</strong>
              <p>{error}</p>
              <button type="button" className="msg-new-modal__retry" onClick={() => setRetryTick((t) => t + 1)}>
                Réessayer
              </button>
            </div>
          )}
          {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
            <div className="msg-new-modal__empty">
              <span className="msg-new-modal__empty-ico" aria-hidden>👤</span>
              <p>Aucun membre pour « {query.trim()} »</p>
              <span className="msg-new-modal__empty-hint">Essayez le nom affiché sur sa boutique Yorix</span>
            </div>
          )}
          {!loading && !error && query.trim().length < 2 && (
            <div className="msg-new-modal__hint">
              Tapez au moins 2 caractères pour lancer la recherche live
            </div>
          )}
          {!loading &&
            results.map((p) => (
              <button
                key={p.id}
                type="button"
                className="msg-new-modal__item"
                onClick={() => handlePick(p)}
              >
                <span className="msg-new-modal__av">
                  <ProfileAvatar profile={p} />
                </span>
                <span className="msg-new-modal__copy">
                  <span className="msg-new-modal__username">@{p.username}</span>
                  <span className="msg-new-modal__fullname">{p.full_name}</span>
                  <span className="msg-new-modal__sub">
                    {chatRoleLabel(p.role)}
                    {p.ville ? ` · ${p.ville}` : ""}
                  </span>
                </span>
              </button>
            ))}
        </div>
      </div>
    </>,
    document.body,
  );
}
