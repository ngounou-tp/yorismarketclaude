import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { OptimizedImage } from "./OptimizedImage";
import { Stars } from "./Stars";
import { FormulaireAvis } from "./FormulaireAvis";
import { ModalCommander } from "./ModalCommander";
import { ChatUsers } from "./ChatUsers";
import { optimizeCloudinaryUrl } from "../utils/helpers";
import { TrustStrip } from "./conversion/TrustStrip";
import { ShareWhatsAppButton } from "./conversion/ShareWhatsAppButton";
import { SocialProofLine } from "./conversion/SocialProofLine";
import { isPurchasable } from "../lib/stockStatus";
import { effectiveProductPrice, isPromoActive, productPromoListPrice } from "../lib/productPricing";
import { YorixToast, useYorixToast } from "./ui/YorixToast";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : FICHE PRODUIT DÉTAIL
// ✅ Bouton "Contacter le vendeur" intégré (ouvre un modal chat)
// ✅ Pas besoin de modifier App.jsx
// ─────────────────────────────────────────────────────────────
export function FicheProduit({ product, user, userData, onClose, onAddToCart, siteLocale = "fr" }) {
  const [activeImg, setActiveImg]           = useState(0);
  const [avis, setAvis]                     = useState([]);
  const [showCmdModal, setShowCmdModal]     = useState(false);
  const [showChatModal, setShowChatModal]   = useState(false);
  const { toast, showToast, clearToast } = useYorixToast();

  const parseImageUrls = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; }
    catch { return []; }
  };

  const imgArr = parseImageUrls(product.image_urls);
  const rawImgs = product.image && product.image.startsWith("http")
    ? [product.image, ...imgArr.filter(u => u && u.startsWith("http") && u !== product.image)]
    : imgArr.filter(u => u && u.startsWith("http"));
  const images = rawImgs.length > 0 ? rawImgs : [];

  const currentImage = images[activeImg] || images[0] || product.image;

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*")
      .eq("product_id", product.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAvis(data || []));
  }, [product.id]);

  const avgNote = avis.length
    ? (avis.reduce((a, r) => a + r.note, 0) / avis.length).toFixed(1)
    : product.note || 0;

  // Le bouton "Contacter vendeur" s'affiche si :
  // - Utilisateur connecté
  // - Produit a un vendeur_id
  // - Ce n'est pas son propre produit
  const canContactSeller = 
    user?.id && 
    product.vendeur_id && 
    user.id !== product.vendeur_id;

  const buyable = isPurchasable(product);
  const [restockState, setRestockState] = useState("idle"); // 'idle' | 'pending' | 'done' | 'error'
  const [restockError, setRestockError] = useState(null);

  const handleNotifyWhenAvailable = async () => {
    if (!user?.id) {
      setRestockError("Connectez-vous pour être notifié quand le produit revient en stock.");
      setRestockState("error");
      return;
    }
    setRestockState("pending");
    setRestockError(null);
    try {
      const { error } = await supabase
        .from("product_restock_subscriptions")
        .upsert(
          { product_id: product.id, user_id: user.id, email: user.email || null },
          { onConflict: "product_id,user_id" },
        );
      if (error) throw error;
      setRestockState("done");
    } catch (e) {
      setRestockError(e?.message || "Erreur inconnue");
      setRestockState("error");
    }
  };

  const handleContactClick = () => {
    if (!user) {
      showToast("Connectez-vous pour contacter le vendeur.", "error");
      return;
    }
    if (!product.vendeur_id) {
      showToast("Ce vendeur n'est pas disponible pour le chat.", "error");
      return;
    }
    if (user.id === product.vendeur_id) {
      showToast("C'est votre propre produit !", "info");
      return;
    }
    setShowChatModal(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 40 }}>
      <YorixToast toast={toast} onClose={clearToast} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px" }}>
        <button
          onClick={onClose}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "none", cursor: "pointer",
            color: "var(--gray)", fontSize: "14px",
            marginBottom: 16, padding: "8px 0",
          }}
        >
          ← Retour
        </button>

        <div className="fiche-produit-grid">

          {/* COLONNE GAUCHE : IMAGES */}
          {images.length > 0 ? (
            <div style={{ marginBottom: 16 }}>
            <div className="fiche-produit-hero-img" style={{
                background: "var(--surface2)",
                borderRadius: 12, overflow: "hidden",
                marginBottom: 12, minHeight: 300,
              }}>
                <OptimizedImage
                  src={currentImage}
                  alt={product.name_fr || "Produit Yorix"}
                  width={800}
                  priority={true}
                  fallbackEmoji="📦"
                  objectFit="contain"
                  className="img-main"
                  style={{
                    width: "100%", height: "auto",
                    minHeight: 300, maxHeight: 500,
                  }}
                />
              </div>

              {images.length > 1 && (
                <div className="img-gallery" style={{
                  display: "flex", gap: 8, flexWrap: "wrap",
                  overflowX: "auto", paddingBottom: 4,
                }}>
                  {images.map((url, i) => (
                    <div
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`img-gallery-thumb${i === activeImg ? " active" : ""}`}
                      style={{
                        width: 70, height: 70, borderRadius: 8,
                        overflow: "hidden", cursor: "pointer",
                        border: i === activeImg ? "2.5px solid var(--green)" : "2px solid var(--border)",
                        flexShrink: 0, transition: "border-color .15s",
                      }}
                    >
                      <OptimizedImage
                        src={url}
                        alt={`Photo ${i + 1}`}
                        width={140}
                        fallbackEmoji="📦"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{
              height: 300, background: "var(--surface2)",
              borderRadius: 12, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: "4rem", marginBottom: 16,
            }}>
              📦
            </div>
          )}

          {/* COLONNE DROITE : INFOS */}
          <div>
            <TrustStrip compact />
            <div className="modal-title fp-title">{product.name_fr}</div>
            <SocialProofLine product={product} locale={siteLocale} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 10px", flexWrap: "wrap" }}>
              <Stars value={Math.round(avgNote)} />
              <span style={{ fontSize: ".75rem", color: "var(--gray)" }}>
                {avgNote} / 5 ({avis.length} avis)
              </span>
              {product.ville && <span className="tag">📍 {product.ville}</span>}
              {product.categorie && <span className="tag">{product.categorie}</span>}
            </div>

            {product.description_fr && (
              <p className="fp-description" style={{ fontSize: ".82rem", color: "var(--gray)", lineHeight: 1.75, marginBottom: 12 }}>
                {product.description_fr}
              </p>
            )}

            {product.stock !== undefined && product.stock !== null && (
              <div style={{ marginBottom: 10 }}>
                <span className={`prod-stock ${product.stock > 5 ? "stock-ok" : product.stock > 0 ? "stock-low" : "stock-out"}`}>
                  {product.stock > 5
                    ? `✅ En stock (${product.stock})`
                    : product.stock > 0
                      ? `⚠️ Plus que ${product.stock} en stock !`
                      : "❌ Rupture de stock"}
                </span>
              </div>
            )}

            <div className="fp-price product-price" style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "var(--green)", marginBottom: 14 }}>
              {isPromoActive(product) ? (
                <>
                  {effectiveProductPrice(product).toLocaleString()}{" "}
                  <span style={{ fontSize: ".8rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: "var(--gray)" }}>FCFA</span>
                  {productPromoListPrice(product) != null && (
                    <span style={{ marginLeft: 8, fontSize: ".85rem", color: "var(--gray)", textDecoration: "line-through", fontWeight: 500 }}>
                      {productPromoListPrice(product).toLocaleString()} FCFA
                    </span>
                  )}
                  <span style={{ display: "block", marginTop: 4, fontSize: ".72rem", fontWeight: 700, color: "#d4520a" }}>
                    🔥 -{product.promo_pct || 15}% · Alimentation
                  </span>
                </>
              ) : (
                <>
                  {product.prix?.toLocaleString()}{" "}
                  <span style={{ fontSize: ".8rem", fontFamily: "'DM Sans',sans-serif", fontWeight: 400, color: "var(--gray)" }}>FCFA</span>
                </>
              )}
            </div>

            {product.escrow && (
              <div className="commission-box" style={{ marginBottom: 12 }}>
                <span>🔐 Paiement protégé Escrow Yorix</span>
                <span style={{ fontSize: ".68rem" }}>Fonds libérés à la livraison</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button
                className="btn-cmd-sm"
                disabled={!buyable}
                aria-disabled={!buyable}
                style={{
                  flex: 2, padding: "11px", borderRadius: 9,
                  opacity: buyable ? 1 : 0.55,
                  cursor: buyable ? "pointer" : "not-allowed",
                }}
                onClick={() => { if (buyable) setShowCmdModal(true); }}
              >
                {buyable ? "✅ Commander" : "❌ Produit indisponible"}
              </button>
              {onAddToCart && (
                <button
                  disabled={!buyable}
                  aria-disabled={!buyable}
                  className="fp-add-cart product-add-cart"
                  onClick={() => { if (buyable) { onAddToCart(product); onClose(); } }}
                  style={{
                    background: buyable ? "var(--green)" : "var(--surface2)",
                    color: buyable ? "#fff" : "var(--gray)",
                    border: buyable ? "none" : "1px solid var(--border)",
                    borderRadius: 9, padding: "11px 16px",
                    cursor: buyable ? "pointer" : "not-allowed",
                    fontSize: ".85rem", fontWeight: 700,
                    opacity: buyable ? 1 : 0.7,
                  }}
                >
                  🛒
                </button>
              )}
            </div>

            {!buyable && (
              <div style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  onClick={handleNotifyWhenAvailable}
                  disabled={restockState === "pending" || restockState === "done"}
                  style={{
                    width: "100%",
                    background: restockState === "done" ? "var(--green-pale)" : "transparent",
                    color: restockState === "done" ? "var(--green)" : "var(--ink)",
                    border: `1.5px dashed ${restockState === "done" ? "var(--green)" : "var(--border)"}`,
                    borderRadius: 9,
                    padding: "10px 12px",
                    fontFamily: "'Syne',sans-serif",
                    fontWeight: 700,
                    fontSize: ".8rem",
                    cursor: restockState === "done" ? "default" : "pointer",
                  }}
                >
                  {restockState === "done"
                    ? "✅ Vous serez prévenu(e) dès le retour en stock"
                    : restockState === "pending"
                      ? "Enregistrement..."
                      : "🔔 Me notifier quand disponible"}
                </button>
                {restockState === "error" && restockError && (
                  <p style={{ marginTop: 6, fontSize: ".72rem", color: "#ce1126" }}>{restockError}</p>
                )}
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <ShareWhatsAppButton product={product} locale={siteLocale} variant="ghost" className="share-wa-btn--block" />
            </div>

            {/* ═══ BOUTON CONTACTER LE VENDEUR ═══ */}
            {canContactSeller && (
              <button
                onClick={handleContactClick}
                style={{
                  width: "100%",
                  background: "var(--surface2)",
                  color: "var(--ink)",
                  border: "1.5px solid var(--green)",
                  borderRadius: 9,
                  padding: "11px",
                  cursor: "pointer",
                  fontSize: ".85rem",
                  fontWeight: 700,
                  fontFamily: "'Syne',sans-serif",
                  marginBottom: 16,
                  transition: "all .2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
                onMouseOver={e => { 
                  e.currentTarget.style.background = "var(--green)"; 
                  e.currentTarget.style.color = "#fff"; 
                }}
                onMouseOut={e => { 
                  e.currentTarget.style.background = "var(--surface2)"; 
                  e.currentTarget.style.color = "var(--ink)"; 
                }}
              >
                💬 Contacter le vendeur{product.vendeur_nom ? ` (${product.vendeur_nom})` : ""}
              </button>
            )}

            {/* Si c'est son propre produit, afficher un message informatif */}
            {user?.id && product.vendeur_id === user.id && (
              <div style={{
                background: "var(--green-pale)",
                border: "1px solid var(--green-light)",
                borderRadius: 9,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: ".78rem",
                color: "var(--green)",
                textAlign: "center",
                fontWeight: 600,
              }}>
                🏪 C'est votre produit
              </div>
            )}

            <div className="divider-h" />

            <div className="avis-section">
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".95rem", color: "var(--ink)", marginBottom: 12 }}>
                💬 Avis clients ({avis.length})
              </div>
              {user && (
                <FormulaireAvis
                  productId={product.id}
                  userId={user.id}
                  userName={userData?.nom || user.email}
                  onSubmit={newAvis => setAvis(prev => [{ ...newAvis, id: Date.now() }, ...prev])}
                />
              )}
              {avis.length === 0 ? (
                <div style={{ fontSize: ".8rem", color: "var(--gray)", textAlign: "center", padding: "12px 0" }}>
                  Aucun avis pour l'instant.
                </div>
              ) : (
                avis.map(a => (
                  <div key={a.id} className="avis-card">
                    <div className="avis-header">
                      <div>
                        <span className="avis-auteur">{a.auteur}</span>
                        <Stars value={a.note} />
                      </div>
                      <span className="avis-date">
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("fr-FR") : ""}
                      </span>
                    </div>
                    <p className="avis-texte">{a.texte}</p>
                  </div>
                ))
              )}
            </div>

            {showCmdModal && (
              <ModalCommander
                product={product}
                user={user}
                userData={userData}
                onClose={() => setShowCmdModal(false)}
              />
            )}
          </div>
        </div>

        {/* ═══ MODAL CHAT VENDEUR ═══ */}
        {showChatModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              padding: 16,
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowChatModal(false);
            }}
          >
            <div style={{
              width: "100%",
              maxWidth: 800,
              background: "var(--surface)",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,.3)",
            }}>
              <ChatUsers
                user={user}
                userData={userData}
                initialProduct={product}
                onClose={() => setShowChatModal(false)}
                isModal={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
