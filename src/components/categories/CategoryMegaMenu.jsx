import { useState, useRef, useEffect } from "react";
import { categoryLabel } from "../../lib/marketplaceCategories";
import "./categoryUi.css";

export function CategoryMegaMenu({ tree = [], locale = "fr", onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (parentSlug, subSlug = null) => {
    setOpen(false);
    onNavigate?.({ parentSlug, subSlug });
  };

  return (
    <div className="cat-mega-wrap" ref={ref}>
      <button
        type="button"
        className="cat-mega-trigger"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="categories-title">{locale === "en" ? "Categories" : "Catégories"}</span>
        <span className="cat-mega-chevron" aria-hidden>
          ▾
        </span>
      </button>
      {open && (
        <div className="cat-mega-panel" role="navigation" aria-label={locale === "en" ? "Categories" : "Catégories"}>
          {tree.map((root) => (
            <div key={root.id || root.slug} className="cat-mega-col">
              <h4 role="button" tabIndex={0} onClick={() => go(root.slug)} onKeyDown={(e) => e.key === "Enter" && go(root.slug)}>
                {root.icon} {categoryLabel(root, locale)}
              </h4>
              <ul>
                {(root.children || []).slice(0, 8).map((ch) => (
                  <li key={ch.id || ch.slug}>
                    <button type="button" onClick={() => go(root.slug, ch.slug)}>
                      {categoryLabel(ch, locale)}
                    </button>
                  </li>
                ))}
                {(root.children || []).length > 8 && (
                  <li>
                    <button type="button" onClick={() => go(root.slug)}>
                      {locale === "en" ? "View all…" : "Tout voir…"}
                    </button>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
