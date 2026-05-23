import { useState } from "react";
import { createCheckoutIntent, confirmCheckout } from "../lib/checkoutApi";
import { showAppToast } from "../lib/appToast";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : MODAL COMMANDER (Commande + WhatsApp)
// ─────────────────────────────────────────────────────────────
export function ModalCommander({ product, user, userData, onClose, onSuccess }) {
  const [nom, setNom]         = useState(userData?.nom || "");
  const [tel, setTel]         = useState(userData?.telephone || "");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [done, setDone]       = useState(false);
  const [deliveryTracking, setDeliveryTracking] = useState([]);

  const validate = () => {
    const e = {};
    if (!nom.trim()) e.nom = "Nom obligatoire";
    if (!tel.trim()) e.tel = "Téléphone obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleCommander = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const subtotal = Number(product?.prix || 0);
      const intent = await createCheckoutIntent({
        checkoutType: "product_only",
        customer: {
          id: user?.id || null,
          nom,
          telephone: tel,
          email: user?.email || "",
          ville: userData?.ville || "",
        },
        items: [
          {
            id: product.id,
            kind: "product",
            qty: 1,
            price: subtotal,
            fulfillmentMode: "delivery",
            vendeur_id: product.vendeur_id ?? null,
            vendeur_nom: product.vendeur_nom || "",
            ville: product.ville || "",
          },
        ],
        summary: { subtotal, delivery: 0, total: subtotal },
      });
      const confirmation = await confirmCheckout({
        checkout_intent_id: intent.checkout_intent_id,
        payment_method: "whatsapp_backup",
        address: userData?.adresse || userData?.ville || "",
      });
      const codes = Array.isArray(confirmation?.delivery_tracking)
        ? confirmation.delivery_tracking
        : [];
      setDeliveryTracking(codes);
      setDone(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, codes.length > 0 ? 5000 : 2000);
    } catch (err) {
      console.error("creerCommande:", err);
      showAppToast("Erreur lors de la commande : " + err.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">📦 Commander ce produit</div>
        <p className="modal-sub">{product.name_fr}</p>

        {done ? (
          <div className="success-msg">
            <div>✅ Commande créée avec succès ! Vous serez contacté(e) sous peu.</div>
            {deliveryTracking.length > 0 && (
              <div style={{ marginTop: 10, fontSize: ".85rem" }}>
                📦 Suivi :{" "}
                <strong>{deliveryTracking.map((t) => t.code_suivi).join(", ")}</strong>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Résumé prix */}
            <div style={{ background:"var(--surface2)", borderRadius:10, padding:"12px 14px", marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:".82rem", marginBottom:4 }}>
                <span style={{ color:"var(--gray)" }}>Prix produit</span>
                <strong>{product.prix?.toLocaleString()} FCFA</strong>
              </div>
              <div style={{ fontSize: ".75rem", color: "var(--gray)" }}>Paiement sécurisé, montant final confirmé au checkout.</div>
            </div>

            <div className="form-group">
              <label className="form-label">Votre nom <span>*</span></label>
              <input className={`form-input${errors.nom ? " error" : ""}`} placeholder="Ex: Amina Bello" value={nom} onChange={e => setNom(e.target.value)} />
              {errors.nom && <span className="form-error-text">{errors.nom}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone <span>*</span></label>
              <input className={`form-input${errors.tel ? " error" : ""}`} placeholder="+237 6XX XXX XXX" value={tel} onChange={e => setTel(e.target.value)} />
              {errors.tel && <span className="form-error-text">{errors.tel}</span>}
            </div>

            <button className="form-submit" onClick={handleCommander} disabled={loading}>
              {loading ? <><div className="spinner" style={{ width:16, height:16, borderWidth:2 }}/>Enregistrement...</> : "✅ Confirmer la commande"}
            </button>

            <div className="divider">ou</div>
            <p style={{textAlign:"center",fontSize:".75rem",color:"var(--gray)"}}>
              💡 Tu peux aussi ajouter au panier et commander tout en une fois via WhatsApp
            </p>
          </>
        )}
      </div>
    </div>
  );
}
