import { useState } from "react";
import {
  supabase,
  MOMO_NUMBER,
  ORANGE_NUMBER,
  PAYMENT_WA_NUMBER,
} from "../lib/supabase";
import { showAppToast } from "../lib/appToast";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : MODAL ACHAT PACK POINTS
// ─────────────────────────────────────────────────────────────
export function LoyaltyPackModal({ pack, user, userData, onClose, onSuccess }) {
  const [nom, setNom]         = useState(userData?.nom || "");
  const [tel, setTel]         = useState(userData?.telephone || "");
  const [moyen, setMoyen]     = useState("momo");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});

  if (!pack) return null;

  const bonusPoints = pack.bonus_pct ? Math.round(pack.points * (pack.bonus_pct / 100)) : 0;
  const totalPoints = pack.points + bonusPoints;
  const ratio       = pack.prix_fcfa / totalPoints;

  const validate = () => {
    const e = {};
    if (!nom.trim()) e.nom = "Nom obligatoire";
    if (!tel.trim()) e.tel = "Téléphone obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const acheter = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("loyalty_pack_purchases")
        .insert({
          user_id:        user.id,
          pack_id:        pack.id,
          pack_nom:       pack.nom,
          points:         totalPoints,
          prix_fcfa:      pack.prix_fcfa,
          telephone:      tel,
          nom:            nom,
          moyen_paiement: moyen,
          status:         "pending",
        })
        .select()
        .single();

      if (error) throw error;

      const numero    = moyen === "momo" ? MOMO_NUMBER : ORANGE_NUMBER;
      const operateur = moyen === "momo" ? "MTN Mobile Money" : "Orange Money";
      const msg = [
        "🌟 *ACHAT DE POINTS YORIX*",
        "",
        `📦 *Pack :* ${pack.nom} ${pack.emoji}`,
        `⭐ *Points :* ${pack.points}${bonusPoints > 0 ? ` + ${bonusPoints} bonus = *${totalPoints} pts*` : ""}`,
        `💰 *Prix :* ${pack.prix_fcfa.toLocaleString("fr-FR")} FCFA`,
        "",
        `💳 *Mode de paiement :* ${operateur}`,
        `📱 *Numéro :* ${numero}`,
        "",
        "👤 *Acheteur :*",
        `Nom : ${nom}`,
        `Téléphone : ${tel}`,
        `ID : ${data.id.slice(0, 8)}`,
        "",
        "✅ *Instructions :*",
        `1. J'effectue le paiement au ${numero}`,
        "2. J'envoie la capture ici",
        "3. Mes points sont crédités sous 1h",
        "",
        "Merci Yorix ! 🇨🇲",
      ].join("\n");

      window.open(`https://wa.me/${PAYMENT_WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
      onSuccess?.();
      onClose();
    } catch (err) {
      showAppToast("Erreur : " + err.message, "error");
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 460 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            fontSize: "3rem", marginBottom: 4,
            background: pack.color_bg, width: 72, height: 72,
            borderRadius: "50%", display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            {pack.emoji}
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: "1.25rem", fontWeight: 800,
            color: "var(--ink)", marginTop: 8,
          }}>
            Pack {pack.nom}
          </div>
        </div>

        <div style={{
          background: "var(--green-pale)", border: "1px solid var(--green-light)",
          borderRadius: 11, padding: 14, marginBottom: 16,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", marginBottom: 4 }}>
            <span style={{ color: "var(--gray)" }}>Points de base</span>
            <strong>{pack.points.toLocaleString("fr-FR")} pts</strong>
          </div>
          {bonusPoints > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: ".82rem", marginBottom: 4 }}>
              <span style={{ color: "var(--green)" }}>🎁 Bonus (+{pack.bonus_pct}%)</span>
              <strong style={{ color: "var(--green)" }}>+{bonusPoints.toLocaleString("fr-FR")} pts</strong>
            </div>
          )}
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: ".95rem", fontFamily: "'Syne',sans-serif", fontWeight: 800,
            borderTop: "1px dashed var(--green-light)", paddingTop: 6, marginTop: 4, color: "var(--green)",
          }}>
            <span>TOTAL POINTS</span>
            <span>{totalPoints.toLocaleString("fr-FR")} pts</span>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            fontSize: ".95rem", fontFamily: "'Syne',sans-serif", fontWeight: 800,
            marginTop: 6, color: "var(--ink)",
          }}>
            <span>À PAYER</span>
            <span>{pack.prix_fcfa.toLocaleString("fr-FR")} FCFA</span>
          </div>
          <div style={{ fontSize: ".68rem", color: "var(--gray)", marginTop: 4, textAlign: "center" }}>
            Soit {ratio.toFixed(1)} FCFA / point
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Nom complet <span>*</span></label>
          <input
            className={`form-input${errors.nom ? " error" : ""}`}
            value={nom}
            onChange={e => setNom(e.target.value)}
            placeholder="Raisa Kouekam"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Téléphone <span>*</span></label>
          <input
            className={`form-input${errors.tel ? " error" : ""}`}
            value={tel}
            onChange={e => setTel(e.target.value)}
            placeholder="+237 6XX XXX XXX"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Moyen de paiement <span>*</span></label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div
              onClick={() => setMoyen("momo")}
              style={{
                border: `2px solid ${moyen === "momo" ? "var(--green)" : "var(--border)"}`,
                background: moyen === "momo" ? "var(--green-pale)" : "var(--surface)",
                borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: 3 }}>📱</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem" }}>MTN MoMo</div>
              <div style={{ fontSize: ".65rem", color: "var(--gray)" }}>{MOMO_NUMBER}</div>
            </div>
            <div
              onClick={() => setMoyen("orange")}
              style={{
                border: `2px solid ${moyen === "orange" ? "var(--green)" : "var(--border)"}`,
                background: moyen === "orange" ? "var(--green-pale)" : "var(--surface)",
                borderRadius: 10, padding: 12, cursor: "pointer", textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1.4rem", marginBottom: 3 }}>🔶</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem" }}>Orange Money</div>
              <div style={{ fontSize: ".65rem", color: "var(--gray)" }}>{ORANGE_NUMBER}</div>
            </div>
          </div>
        </div>

        <button className="form-submit" onClick={acheter} disabled={loading}>
          {loading ? (
            <>
              <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Traitement...
            </>
          ) : (
            `💳 Payer ${pack.prix_fcfa.toLocaleString("fr-FR")} FCFA via WhatsApp`
          )}
        </button>

        <p style={{ fontSize: ".68rem", color: "var(--gray)", textAlign: "center", marginTop: 8 }}>
          🔒 Paiement sécurisé · Points crédités sous 1h après confirmation
        </p>
      </div>
    </div>
  );
}
