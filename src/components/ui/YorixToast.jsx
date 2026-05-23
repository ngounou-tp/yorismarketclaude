import { useCallback, useEffect, useState } from "react";

/** Toast premium fixe (bas écran) — remplace alert() dans le chat. */
export function YorixToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => onClose?.(), toast.duration ?? 4500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div
      className={`yorix-toast yorix-toast--${toast.type || "info"}`}
      role="alert"
      aria-live="polite"
    >
      <span className="yorix-toast__icon" aria-hidden>
        {isError ? "⚠️" : toast.type === "success" ? "✓" : "ℹ️"}
      </span>
      <span className="yorix-toast__msg">{toast.msg}</span>
      <button type="button" className="yorix-toast__close" onClick={onClose} aria-label="Fermer">
        ×
      </button>
    </div>
  );
}

export function useYorixToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "error", duration) => {
    setToast({ msg, type, duration });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}
