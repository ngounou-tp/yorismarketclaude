import { useState } from "react";
import { supabase, YORIX_WA_NUMBER } from "../lib/supabase";
import { showAppToast } from "../lib/appToast";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : MODAL ÉCHANGE RÉCOMPENSE
// ─────────────────────────────────────────────────────────────
export function LoyaltyRedeemModal({ reward, userPoints, user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [code, setCode]       = useState("");

  if (!reward) return null;

  const canAfford = userPoints >= reward.cout_points;

  const echanger = async () => {
    if (!canAfford) return;
    setLoading(true);
    try {
      const newCode = `YX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

      const { error: errRedeem } = await supabase.from("loyalty_redemptions").insert({
        user_id:     user.id,
        reward_id:   reward.id,
        reward_nom:  reward.nom,
        cout_points: reward.cout_points,
        code:        newCode,
        status:      "validated",
        expire_at:   new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      });
      if (errRedeem) throw errRedeem;

      const { error: errDebit } = await supabase.rpc("add_loyalty_points", {
        p_user_id:        user.id,
        p_points:         -reward.cout_points,
        p_type:           "echange",
        p_description:    `Échange : ${reward.nom}`,
        p_reference_id:   null,
        p_reference_type: "reward",
      });
      if (errDebit) throw errDebit;

      setCode(newCode);
      setDone(true);
      onSuccess?.();
    } catch (err) {
      showAppToast("Erreur : " + err.message, "error");
    }
    setLoading(false);
  };

  if (done) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxWidth: 440, textAlign: "center" }}>
          <button className="modal-close" onClick={onClose}>✕</button>
          <div style={{ fontSize: "4rem", marginBottom: 12 }}>🎉</div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.25rem",
            color: "var(--green)", marginBottom: 8,
          }}>
            Échange réussi !
          </div>
          <p style={{ color: "var(--gray)", fontSize: ".85rem", marginBottom: 18, lineHeight: 1.6 }}>
            Votre récompense <strong style={{ color: "var(--ink)" }}>"{reward.nom}"</strong> est activée.
          </p>
          <div style={{
            background: "var(--green-pale)", border: "2px dashed var(--green)",
            borderRadius: 12, padding: 16, marginBottom: 16,
          }}>
            <div style={{ fontSize: ".7rem", color: "var(--gray)", fontWeight: 700, marginBottom: 4 }}>
              VOTRE CODE UNIQUE
            </div>
            <div style={{
              fontFamily: "'Syne',sans-serif", fontSize: "1.35rem", fontWeight: 800,
              color: "var(--green)", letterSpacing: "0.05em",
            }}>
              {code}
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(code)}
              style={{
                marginTop: 8, background: "var(--surface)", color: "var(--ink)",
                border: "1px solid var(--border)", borderRadius: 7,
                padding: "5px 14px", fontSize: ".72rem", fontWeight: 600, cursor: "pointer",
              }}
            >
              📋 Copier
            </button>
          </div>
          <p style={{ fontSize: ".72rem", color: "var(--gray)" }}>
            Donnez ce code lors de votre prochain achat. Valable 90 jours.
          </p>
          <button
            className="form-submit"
            style={{ marginTop: 14 }}
            onClick={() =>
              window.open(
                `https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent(
                  `Bonjour Yorix ! J'ai échangé ma récompense "${reward.nom}" avec le code ${code}`
                )}`,
                "_blank"
              )
            }
          >
            📱 Activer sur WhatsApp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{
            fontSize: "3rem", marginBottom: 4,
            background: reward.color_bg, width: 72, height: 72, borderRadius: "50%",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            {reward.emoji}
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: "1.15rem", fontWeight: 800,
            color: "var(--ink)", marginTop: 8,
          }}>
            {reward.nom}
          </div>
          {reward.description && (
            <p style={{ fontSize: ".8rem", color: "var(--gray)", marginTop: 6 }}>{reward.description}</p>
          )}
        </div>

        <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".82rem" }}>
            <span style={{ color: "var(--gray)" }}>Coût</span>
            <strong style={{ color: "var(--ink)" }}>{reward.cout_points.toLocaleString("fr-FR")} pts</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: ".82rem" }}>
            <span style={{ color: "var(--gray)" }}>Mon solde actuel</span>
            <strong style={{ color: "var(--ink)" }}>{userPoints.toLocaleString("fr-FR")} pts</strong>
          </div>
          <div style={{
            display: "flex", justifyContent: "space-between",
            borderTop: "1px dashed var(--border)", paddingTop: 6, fontSize: ".88rem",
            fontFamily: "'Syne',sans-serif", fontWeight: 800,
            color: canAfford ? "var(--green)" : "var(--red)",
          }}>
            <span>Après échange</span>
            <span>{(userPoints - reward.cout_points).toLocaleString("fr-FR")} pts</span>
          </div>
        </div>

        {canAfford ? (
          <button className="form-submit" onClick={echanger} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Traitement...
              </>
            ) : (
              `✅ Confirmer l'échange (${reward.cout_points} pts)`
            )}
          </button>
        ) : (
          <>
            <div style={{
              background: "#fff0f0", border: "1px solid #fecaca", color: "#ce1126",
              borderRadius: 8, padding: "10px 14px", fontSize: ".78rem",
              textAlign: "center", marginBottom: 10,
            }}>
              ⚠️ Il vous manque <strong>{(reward.cout_points - userPoints).toLocaleString("fr-FR")}</strong> points
            </div>
            <button
              className="form-submit"
              style={{ background: "var(--yellow)", color: "#0d1f14" }}
              onClick={onClose}
            >
              💰 Acheter des points
            </button>
          </>
        )}
      </div>
    </div>
  );
}
