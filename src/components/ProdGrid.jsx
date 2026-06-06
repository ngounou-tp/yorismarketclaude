import { useState, useCallback, lazy, Suspense } from "react";
import { OptimizedImage } from "./OptimizedImage";
import { MadeInCameroonBadge } from "./MadeInCameroonBadge";
import { resolveMadeInCameroon } from "../lib/madeInCameroon";
import { Stars } from "./Stars";
import { ModalCommander } from "./ModalCommander";
import { SocialProofLine } from "./conversion/SocialProofLine";
import { buildProductWhatsAppText, openWhatsAppShare } from "../lib/shareUtils";
import { isPurchasable } from "../lib/stockStatus";
import { effectiveProductPrice, isPromoActive, productPromoListPrice } from "../lib/productPricing";

const LazyFicheProduit = lazy(() =>
  import("./FicheProduit").then((m) => ({ default: m.FicheProduit }))
);

// ─────────────────────────────────────────────────────────────
// COMPOSANT : GRILLE PRODUITS (avec images optimisées Cloudinary)
// ─────────────────────────────────────────────────────────────
export function ProdGrid({
  prods,
  user,
  userData,
  onAddToCart,
  onWish,
  wishlist,
  onOpenProd,
  onOpenProductUrl,
  siteLocale = "fr",
  showShare = false,
}) {
  const [ficheOpen, setFicheOpen] = useState(null);
  const [cmdOpen, setCmdOpen]     = useState(null);
  const [addedIds, setAddedIds]   = useState(new Set());

  const handleAdd = useCallback((p) => {
    if (!isPurchasable(p)) return;
    onAddToCart(p);
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.add(p.id);
      setTimeout(() => setAddedIds((s) => { const c = new Set(s); c.delete(p.id); return c; }), 1200);
      return next;
    });
  }, [onAddToCart]);

  // ── Image sécurisée
  const getSafeImg = (p) => {
    if (p.image && p.image.startsWith("http")) return p.image;
    if (p.image_urls && p.image_urls[0] && p.image_urls[0].startsWith("http")) return p.image_urls[0];
    return null;
  };

  // ── Badges vendeur
  const getVendeurBadges = (p) => {
    const badges = [];
    if (p.sponsorise)                   badges.push({ label: "⭐ Top Vendeur",   cls: "badge-top" });
    if (p.verifie || p.vendeur_verifie) badges.push({ label: "✅ Vérifié",        cls: "badge-verif" });
    if (isPromoActive(p))               badges.push({ label: "🔥 Promo du jour", cls: "badge-promo" });
    if (p.flash)                        badges.push({ label: "⚡ Offre flash",   cls: "badge-flash" });
    if (p.vente_total > 50)             badges.push({ label: "🏆 Best seller",   cls: "badge-best" });
    return badges;
  };

  return (
    <>
      <div className="prod-grid">
        {prods.map(p => {
          const safeImg    = getSafeImg(p);
          const stockClass = p.stock > 5 ? "stock-ok" : p.stock > 0 ? "stock-low" : "stock-out";
          const vendBadges = getVendeurBadges(p);
          const prixPromo  = isPromoActive(p) ? effectiveProductPrice(p) : null;
          const prixBarre  = productPromoListPrice(p);
          const buyable    = isPurchasable(p);

          return (
            <div key={p.id} className={`prod-card${p.flash ? " prod-card-flash" : ""}`}>
              {/* ── IMAGE OPTIMISÉE (lazy + WebP + compression auto) ── */}
              <div
                className="prod-img-wrap"
                onClick={() => {
                  if (onOpenProductUrl) onOpenProductUrl(p);
                  else setFicheOpen(p);
                }}
              >
                <OptimizedImage
                  src={safeImg}
                  alt={p.name_fr || "Produit Yorix"}
                  width={400}
                  fallbackEmoji="📦"
                  style={{ width: "100%", height: "100%" }}
                />
                {p.flash                             && <span className="pbadge-flash">⚡ Flash</span>}
                {!p.flash && isPromoActive(p)        && <span className="pbadge-promo">-{p.promo_pct || 15}%</span>}
                {!p.flash && !p.promo && p.sponsorise && <span className="pbadge-r">⭐ Top</span>}
                {resolveMadeInCameroon(p).show && <MadeInCameroonBadge product={p} size="sm" />}
                {p.escrow                            && <span className="escrow-badge">🔐</span>}
                {!buyable && (
                  <span
                    style={{
                      position: "absolute", top: 8, left: 8, zIndex: 3,
                      background: "rgba(206,17,38,.92)", color: "#fff",
                      padding: "3px 9px", borderRadius: 999, fontSize: ".62rem",
                      fontFamily: "'Syne',sans-serif", fontWeight: 800, letterSpacing: ".02em",
                      boxShadow: "0 4px 12px rgba(206,17,38,.35)",
                    }}
                  >
                    Rupture
                  </span>
                )}
                <button
                  className="wish-btn"
                  onClick={e => { e.stopPropagation(); onWish(p.id); }}
                >
                  {wishlist.has(p.id) ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#e11d48" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  )}
                </button>
              </div>

              {/* ── INFOS ── */}
              <div
                className="prod-info"
                onClick={() => {
                  if (onOpenProductUrl) onOpenProductUrl(p);
                  else setFicheOpen(p);
                }}
              >
                {vendBadges.length > 0 && (
                  <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 4 }}>
                    {vendBadges.map(b => (
                      <span key={b.label} className={`vendor-badge ${b.cls}`}>{b.label}</span>
                    ))}
                  </div>
                )}

                <div className="prod-name">{p.name_fr}</div>
                <div className="prod-loc">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {p.ville || "Cameroun"}{p.vendeur_nom ? ` · ${p.vendeur_nom}` : ""}
                </div>
                <SocialProofLine product={p} locale={siteLocale} />

                <div className="prod-badge-row">
                  {p.stock > 0 && p.stock <= 5 && <span className="pb pb-fire">🔥 Stock limité</span>}
                  <span className="pb pb-truck">🚚 Livraison rapide</span>
                  <span className="pb pb-cash">💰 Paiement livraison</span>
                </div>

                {p.description_fr && <div className="prod-desc">{p.description_fr}</div>}

                {p.stock !== undefined && p.stock !== null && (
                  <div className={`prod-stock ${stockClass}`} style={{ fontSize: ".65rem" }}>
                    {p.stock > 5
                      ? `${p.stock} en stock`
                      : p.stock > 0
                        ? `${p.stock} restant(s)`
                        : "Rupture de stock"}
                  </div>
                )}

                <div className="prod-rating">
                  <Stars value={Math.round(p.note || 0)} />
                  <span className="rcount">({p.nombre_avis || 0})</span>
                </div>

                <div className="prod-price-row">
                  <div>
                    {prixPromo ? (
                      <>
                        <span className="price">
                          {prixPromo.toLocaleString()} <span className="price-unit">FCFA</span>
                        </span>
                        <span style={{ fontSize: ".65rem", color: "var(--gray)", textDecoration: "line-through", marginLeft: 5 }}>
                          {p.prix?.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <span className="price">
                        {p.prix?.toLocaleString()} <span className="price-unit">FCFA</span>
                      </span>
                    )}
                  </div>
                  <button
                    className="add-btn"
                    disabled={!buyable}
                    aria-disabled={!buyable}
                    title={buyable ? "Ajouter au panier" : "Produit indisponible"}
                    style={!buyable ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                    onClick={e => { e.stopPropagation(); handleAdd(p); }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ── BOUTON PANIER ── */}
              <div className="prod-actions" style={{ padding: "0 11px 11px", display: "flex", flexDirection: "column", gap: 6 }}>
                <button
                  className="add-btn"
                  disabled={!buyable}
                  aria-disabled={!buyable}
                  style={{
                    width: "100%", padding: "8px", borderRadius: 8, fontSize: ".78rem",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700,
                    background: addedIds.has(p.id) ? "#0f4a28" : buyable ? "var(--green)" : "var(--surface2)",
                    color: buyable ? "#fff" : "var(--gray)",
                    border: buyable ? "none" : "1px solid var(--border)",
                    cursor: buyable ? "pointer" : "not-allowed",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    opacity: buyable ? 1 : 0.75,
                    transform: addedIds.has(p.id) ? "scale(.97)" : "none",
                    transition: "background .2s, transform .15s",
                  }}
                  onClick={e => { e.stopPropagation(); handleAdd(p); }}
                >
                  {addedIds.has(p.id) ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                      Ajouté !
                    </>
                  ) : buyable ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      Ajouter au panier
                    </>
                  ) : "Indisponible"}
                </button>
                {showShare && (
                  <button
                    type="button"
                    className="prod-share-mini"
                    onClick={(e) => {
                      e.stopPropagation();
                      openWhatsAppShare(buildProductWhatsAppText(p, siteLocale));
                    }}
                  >
                    💬 {siteLocale === "en" ? "Share" : "Partager"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {ficheOpen && (
        <Suspense
          fallback={
            <div className="loading" style={{ justifyContent: "center", padding: 40 }}>
              <div className="spinner" /> Chargement...
            </div>
          }
        >
          <LazyFicheProduit
            product={ficheOpen}
            user={user}
            userData={userData}
            onClose={() => setFicheOpen(null)}
            onAddToCart={onAddToCart}
            siteLocale={siteLocale}
          />
        </Suspense>
      )}
      {cmdOpen && (
        <ModalCommander
          product={cmdOpen}
          user={user}
          userData={userData}
          onClose={() => setCmdOpen(null)}
        />
      )}
    </>
  );
}
