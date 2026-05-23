import { useEffect } from "react";
import { OptimizedImage } from "./OptimizedImage";
import { FreeShippingProgress } from "./FreeShippingProgress";

export function CartDrawer({
  open,
  onClose,
  cartItems,
  cartSummary,
  changeQty,
  removeItem,
  goPage,
  totalQty,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const goCheckout = () => {
    onClose();
    goPage("checkout");
  };

  const goFullCart = () => {
    onClose();
    goPage("cart");
  };

  return (
    <>
      <div
        className={`cart-overlay${open ? " open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`cart-drawer${open ? " open" : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Panier"
      >
        <div className="cart-header">
          <div className="cart-header-left">
            <div className="cart-header-icon">🛒</div>
            <div>
              <h2 className="cart-title">Mon panier</h2>
              <div className="cart-subtitle">
                {totalQty} article{totalQty !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <button type="button" className="cart-close" onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="cart-trust-bar">
          <span>🔒 Sécurisé</span>
          <span>🛡️ Protégé</span>
          <span>🚚 Suivi</span>
        </div>

        {cartItems.length > 0 && <FreeShippingProgress summary={cartSummary} variant="cart" />}

        {cartItems.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <div className="cart-empty-title">Panier vide</div>
            <p className="cart-empty-sub">Ajoutez des produits ou prestations pour commander.</p>
            <button
              type="button"
              className="cart-empty-btn"
              onClick={() => {
                onClose();
                goPage("produits");
              }}
            >
              Explorer le catalogue
            </button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cartItems.map((item) => {
                const subtotal = item.prix * item.qty;
                return (
                  <article key={`${item.kind}-${item.id}`} className="cart-item">
                    <button
                      type="button"
                      className="ci-del"
                      onClick={() => removeItem(item.id, item.kind)}
                      aria-label="Retirer"
                    >
                      ✕
                    </button>
                    <div className="ci-img">
                      <OptimizedImage
                        src={item.image}
                        alt={item.name}
                        width={156}
                        fallbackEmoji={item.kind === "service" ? "🛠️" : "📦"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div className="ci-info">
                      <div className="ci-name">{item.name}</div>
                      <div className="ci-meta">
                        <span className="ci-tag">{item.kind === "service" ? "Prestation" : "Produit"}</span>
                      </div>
                      <div className="ci-bottom">
                        <div className="ci-price-block">
                          <div className="ci-unit-price">{item.prix?.toLocaleString()} FCFA</div>
                          <div className="ci-total-price">{subtotal.toLocaleString()} FCFA</div>
                        </div>
                        <div className="ci-qty">
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => changeQty(item.id, -1, item.kind)}
                          >
                            −
                          </button>
                          <span className="qty-val">{item.qty}</span>
                          <button
                            type="button"
                            className="qty-btn"
                            onClick={() => changeQty(item.id, 1, item.kind)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-footer">
              <div className="cart-summary">
                <div className="cart-total-row">
                  <span>Sous-total</span>
                  <strong>{cartSummary.subtotal.toLocaleString()} FCFA</strong>
                </div>
                <div className="cart-total-row">
                  <span>Livraison</span>
                  <strong>
                    {!cartSummary.hasShippableProducts
                      ? "N/A"
                      : cartSummary.freeShippingUnlocked
                        ? "Offerte"
                        : `${cartSummary.delivery.toLocaleString()} FCFA`}
                  </strong>
                </div>
                <div className="cart-divider" />
                <div className="cart-total-row grand">
                  <span>Total</span>
                  <strong>{cartSummary.total.toLocaleString()} FCFA</strong>
                </div>
              </div>
              <button type="button" className="cart-wa-confirm" onClick={goCheckout}>
                Passer au paiement
              </button>
              <button
                type="button"
                className="btn-ghost"
                style={{ width: "100%", marginTop: 8 }}
                onClick={goFullCart}
              >
                Voir panier complet
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
