import { useState } from "react";

export function Stars({ value = 0, max = 5, onSelect = null, size = "normal" }) {
  const [hover, setHover] = useState(0);
  const current = hover || value;
  const sz = size === "lg" ? "1.4rem" : ".75rem";

  return (
    <div
      className={`stars-display${onSelect ? " star-input" : ""}`}
      style={{ cursor: onSelect ? "pointer" : "default", gap: 2, display: "flex" }}
      role={onSelect ? "radiogroup" : undefined}
      aria-label={onSelect ? "Donner une note" : `Note: ${value} sur ${max}`}
    >
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
        <span
          key={n}
          className={`star ${n <= current ? "filled" : "empty"}`}
          style={{
            fontSize: sz,
            transition: "transform .15s cubic-bezier(0.34,1.56,0.64,1)",
            transform: onSelect && hover >= n ? "scale(1.28)" : "scale(1)",
            display: "inline-block",
          }}
          role={onSelect ? "radio" : undefined}
          aria-checked={onSelect ? n === value : undefined}
          aria-label={onSelect ? `${n} étoile${n > 1 ? "s" : ""}` : undefined}
          tabIndex={onSelect ? 0 : undefined}
          onClick={() => onSelect && onSelect(n)}
          onKeyDown={(e) => e.key === "Enter" && onSelect && onSelect(n)}
          onMouseEnter={() => onSelect && setHover(n)}
          onMouseLeave={() => onSelect && setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
