import { useEffect, useRef, useState } from "react";
import { searchUsersForChat, chatRoleLabel } from "../../lib/chatConversations";

const DEBOUNCE_MS = 300;

/**
 * Panneau « Nouveau message » — recherche membre + autocomplete.
 */
export function NewMessagePanel({ supabase, userId, onSelect, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);

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
      try {
        const rows = await searchUsersForChat(supabase, q);
        setResults(rows.filter((r) => r.id !== userId));
      } catch (err) {
        setError(err.message || "Recherche impossible");
        setResults([]);
      }
      setLoading(false);
    }, DEBOUNCE_MS);

    return () => clearTimeout(debounceRef.current);
  }, [query, supabase, userId]);

  const handlePick = (profile) => {
    onSelect?.(profile);
    onClose?.();
  };

  return (
    <div className="msg-new-panel" role="dialog" aria-label="Nouveau message">
      <div className="msg-new-panel__head">
        <h3 className="msg-new-panel__title">Nouveau message</h3>
        <button type="button" className="msg-new-panel__close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
      </div>

      <input
        ref={inputRef}
        type="search"
        className="msg-new-panel__input"
        placeholder="Rechercher par nom ou boutique…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
        aria-label="Rechercher un membre"
      />

      <div className="msg-new-panel__list ybell-scroll-panel">
        {loading && <div className="msg-new-panel__hint">Recherche…</div>}
        {!loading && error && <div className="msg-new-panel__error">{error}</div>}
        {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
          <div className="msg-new-panel__empty">
            <span aria-hidden>🔍</span>
            <p>Aucun membre trouvé pour « {query.trim()} »</p>
          </div>
        )}
        {!loading && query.trim().length < 2 && (
          <div className="msg-new-panel__hint">Tapez au moins 2 caractères (ex. rai, shop…)</div>
        )}
        {results.map((p) => (
          <button
            key={p.id}
            type="button"
            className="msg-new-panel__item"
            onClick={() => handlePick(p)}
          >
            <span className="msg-new-panel__av" aria-hidden>
              {(p.nom?.[0] || "M").toUpperCase()}
            </span>
            <span className="msg-new-panel__copy">
              <span className="msg-new-panel__name">{p.nom}</span>
              <span className="msg-new-panel__sub">
                {chatRoleLabel(p.role)}
                {p.ville ? ` · ${p.ville}` : ""}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
