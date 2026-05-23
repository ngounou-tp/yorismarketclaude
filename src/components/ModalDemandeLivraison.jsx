import { useState } from "react";
import { YORIX_WA_NUMBER } from "../lib/supabase";
import { CITIES } from "../lib/constants";
import { deliveryTrackingPath } from "../lib/seoRoutes";
import { creerDemandeLivraison } from "../utils/deliveryWorkflow";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : MODAL DEMANDE DE LIVRAISON
// ─────────────────────────────────────────────────────────────
export function ModalDemandeLivraison({ user, userData, siteLocale = "fr", onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nom:               userData?.nom || "",
    telephone:         userData?.telephone || "",
    adresse_collecte:  "",
    adresse_livraison: "",
    ville:             userData?.ville || "Douala",
    colis_description: "",
    vehicule:          "Moto",
    budget:            "",
    urgence:           "normal",
  });
  const [errors, setErrors]     = useState({});
  const [loading, setLoading]   = useState(false);
  const [codeGenere, setCodeGenere] = useState("");

  const validate = () => {
    const e = {};
    if (!form.nom.trim())                e.nom = "Nom obligatoire";
    if (!form.telephone.trim())          e.telephone = "Téléphone obligatoire";
    if (!form.adresse_collecte.trim())   e.adresse_collecte = "Adresse de collecte obligatoire";
    if (!form.adresse_livraison.trim())  e.adresse_livraison = "Adresse de livraison obligatoire";
    if (!form.colis_description.trim())  e.colis_description = "Description du colis obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const { delivery: created, code } = await creerDemandeLivraison({
        clientId: user?.id || null,
        form: {
          nom:               form.nom,
          telephone:         form.telephone,
          adresse_collecte:  form.adresse_collecte,
          adresse_livraison: form.adresse_livraison,
          ville:             form.ville,
          colis_description: form.colis_description,
          vehicule:          form.vehicule,
          urgence:           form.urgence,
          budget:            form.budget,
        },
      });

      const urgenceLabel = {
        normal:  "🟢 Normal (30-60 min)",
        urgent:  "🟠 Urgent (15-30 min)",
        express: "🔴 Express (< 15 min)",
      };

      const msg = [
        "🚚 *NOUVELLE DEMANDE DE LIVRAISON YORIX*",
        "",
        "📦 *CODE DE SUIVI : " + code + "*",
        "",
        "👤 *CLIENT*",
        "Nom : " + form.nom,
        "Téléphone : " + form.telephone,
        "Ville : " + form.ville,
        "",
        "📍 *TRAJET*",
        "🔴 Collecte : " + form.adresse_collecte,
        "🟢 Livraison : " + form.adresse_livraison,
        "",
        "📦 *COLIS*",
        "Description : " + form.colis_description,
        "Véhicule : " + form.vehicule,
        "Urgence : " + (urgenceLabel[form.urgence] || form.urgence),
        form.budget ? "Budget proposé : " + form.budget + " FCFA" : "Budget : À définir",
        "",
        "✅ *ACTIONS À FAIRE*",
        "1. Assigner un livreur disponible",
        "2. Confirmer le prix au client",
        "3. Le client suit sa livraison sur yorix.cm/livraison avec le code " + code,
        "",
        "Merci Yorix ! 🇨🇲",
      ].join("\n");

      const waUrl = "https://wa.me/" + YORIX_WA_NUMBER + "?text=" + encodeURIComponent(msg);
      window.open(waUrl, "_blank", "noopener,noreferrer");

      setCodeGenere(code);
      setStep(2);
      onSuccess?.(code, created);

    } catch (err) {
      console.error("ModalDemandeLivraison:", err);
      alert("Erreur : " + (err?.message || "Impossible de créer la livraison"));
    }
    setLoading(false);
  };

  if (step === 2) {
    return (
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal" style={{ maxWidth: 480, textAlign: "center" }}>
          <button className="modal-close" onClick={onClose}>✕</button>

          <div style={{ fontSize: "4rem", marginBottom: 12 }}>🎉</div>

          <h2 style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.4rem",
            color: "var(--green)", marginBottom: 8, letterSpacing: "-.3px",
          }}>
            Demande envoyée !
          </h2>

          <p style={{
            fontSize: ".88rem", color: "var(--gray)",
            lineHeight: 1.7, marginBottom: 20,
          }}>
            Notre équipe va assigner un livreur et vous recontacter dans les <strong>5 minutes</strong> pour confirmer.
          </p>

          <div style={{
            background: "linear-gradient(135deg, var(--green-pale), #fef9e0)",
            border: "2px dashed var(--green)", borderRadius: 12,
            padding: 18, marginBottom: 18,
          }}>
            <div style={{
              fontSize: ".7rem", color: "var(--gray)", fontWeight: 700,
              marginBottom: 5, letterSpacing: ".05em",
            }}>
              VOTRE CODE DE SUIVI
            </div>
            <div style={{
              fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800,
              color: "var(--green)", letterSpacing: ".08em", marginBottom: 10,
            }}>
              {codeGenere}
            </div>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(codeGenere);
                alert("✅ Code copié !");
              }}
              style={{
                background: "var(--surface)", color: "var(--ink)",
                border: "1.5px solid var(--border)", borderRadius: 8,
                padding: "6px 14px", fontSize: ".75rem", fontWeight: 600,
                cursor: "pointer",
              }}
            >
              📋 Copier le code
            </button>
          </div>

          <p style={{
            fontSize: ".78rem", color: "var(--gray)",
            marginBottom: 18, lineHeight: 1.6,
          }}>
            💡 Conservez ce code pour suivre votre livraison en temps réel sur la page Livraison.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <button
              onClick={onClose}
              style={{
                background: "var(--surface2)", color: "var(--ink)",
                border: "1.5px solid var(--border)", borderRadius: 9,
                padding: "11px", cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".82rem",
              }}
            >
              Fermer
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = deliveryTrackingPath(codeGenere, siteLocale);
              }}
              style={{
                background: "var(--green)", color: "#fff", border: "none",
                padding: "11px", borderRadius: 9, cursor: "pointer",
                fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".82rem",
              }}
            >
              📍 Suivre maintenant
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <button className="modal-close" onClick={onClose}>✕</button>

        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div style={{
            fontSize: "2.8rem", marginBottom: 6,
            background: "var(--green-pale)", width: 72, height: 72,
            borderRadius: "50%", display: "inline-flex",
            alignItems: "center", justifyContent: "center",
          }}>
            📦
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", fontWeight: 800,
            color: "var(--ink)", marginTop: 8, letterSpacing: "-.3px",
          }}>
            Demander une livraison
          </div>
          <p style={{ fontSize: ".82rem", color: "var(--gray)", marginTop: 4 }}>
            Remplissez le formulaire, un livreur sera assigné en quelques minutes
          </p>
        </div>

        <div style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".85rem",
          color: "var(--green)", marginBottom: 8, marginTop: 4,
        }}>
          👤 Vos coordonnées
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nom <span>*</span></label>
            <input
              className={"form-input" + (errors.nom ? " error" : "")}
              placeholder="Votre nom"
              value={form.nom}
              onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
            />
            {errors.nom && <span className="form-error-text">{errors.nom}</span>}
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Téléphone <span>*</span></label>
            <input
              className={"form-input" + (errors.telephone ? " error" : "")}
              placeholder="+237 6XX XXX XXX"
              value={form.telephone}
              onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
            />
            {errors.telephone && <span className="form-error-text">{errors.telephone}</span>}
          </div>
        </div>

        <div style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".85rem",
          color: "var(--green)", marginBottom: 8,
        }}>
          📍 Adresses
        </div>

        <div className="form-group">
          <label className="form-label">🔴 Adresse de collecte <span>*</span></label>
          <input
            className={"form-input" + (errors.adresse_collecte ? " error" : "")}
            placeholder="Ex: Marché Central, Douala"
            value={form.adresse_collecte}
            onChange={e => setForm(f => ({ ...f, adresse_collecte: e.target.value }))}
          />
          {errors.adresse_collecte && <span className="form-error-text">{errors.adresse_collecte}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">🟢 Adresse de livraison <span>*</span></label>
          <input
            className={"form-input" + (errors.adresse_livraison ? " error" : "")}
            placeholder="Ex: Akwa Nord, Rue Bonanjo, Douala"
            value={form.adresse_livraison}
            onChange={e => setForm(f => ({ ...f, adresse_livraison: e.target.value }))}
          />
          {errors.adresse_livraison && <span className="form-error-text">{errors.adresse_livraison}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Ville</label>
          <select
            className="form-select"
            value={form.ville}
            onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}
          >
            {CITIES.filter(c => c !== "Toutes les villes").map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{
          fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".85rem",
          color: "var(--green)", marginBottom: 8, marginTop: 4,
        }}>
          📦 Détails du colis
        </div>

        <div className="form-group">
          <label className="form-label">Description du colis <span>*</span></label>
          <textarea
            className={"form-textarea" + (errors.colis_description ? " error" : "")}
            style={{ minHeight: 60 }}
            placeholder="Ex: Enveloppe de documents, Carton de 5kg, Sac à main..."
            value={form.colis_description}
            onChange={e => setForm(f => ({ ...f, colis_description: e.target.value }))}
          />
          {errors.colis_description && <span className="form-error-text">{errors.colis_description}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Type de véhicule</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              { id: "Moto",       icon: "🏍️", label: "Moto",    sub: "Petits colis" },
              { id: "Voiture",    icon: "🚗", label: "Voiture", sub: "Colis moyens" },
              { id: "Minibus",    icon: "🚐", label: "Minibus", sub: "Gros volume" },
            ].map(v => (
              <div
                key={v.id}
                onClick={() => setForm(f => ({ ...f, vehicule: v.id }))}
                style={{
                  border: "2px solid " + (form.vehicule === v.id ? "var(--green)" : "var(--border)"),
                  background: form.vehicule === v.id ? "var(--green-pale)" : "var(--surface)",
                  borderRadius: 9, padding: "10px 6px", cursor: "pointer",
                  textAlign: "center", transition: "all .2s",
                }}
              >
                <div style={{ fontSize: "1.4rem", marginBottom: 3 }}>{v.icon}</div>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem",
                  color: "var(--ink)",
                }}>
                  {v.label}
                </div>
                <div style={{ fontSize: ".62rem", color: "var(--gray)" }}>{v.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Niveau d'urgence</label>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[
              { id: "normal",  icon: "🟢", label: "Normal",  time: "30-60 min" },
              { id: "urgent",  icon: "🟠", label: "Urgent",  time: "15-30 min" },
              { id: "express", icon: "🔴", label: "Express", time: "< 15 min" },
            ].map(u => (
              <div
                key={u.id}
                onClick={() => setForm(f => ({ ...f, urgence: u.id }))}
                style={{
                  border: "2px solid " + (form.urgence === u.id ? "var(--green)" : "var(--border)"),
                  background: form.urgence === u.id ? "var(--green-pale)" : "var(--surface)",
                  borderRadius: 9, padding: "10px 6px", cursor: "pointer",
                  textAlign: "center", transition: "all .2s",
                }}
              >
                <div style={{ fontSize: "1.1rem", marginBottom: 2 }}>{u.icon}</div>
                <div style={{
                  fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".76rem",
                  color: "var(--ink)",
                }}>
                  {u.label}
                </div>
                <div style={{ fontSize: ".62rem", color: "var(--gray)" }}>{u.time}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Budget proposé (FCFA) <span style={{ color: "var(--gray)", fontSize: ".7rem" }}>— optionnel</span></label>
          <input
            className="form-input"
            type="number"
            placeholder="Ex: 2000 (laisser vide = à définir avec livreur)"
            value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
          />
          <div style={{ fontSize: ".68rem", color: "var(--gray)", marginTop: 4, lineHeight: 1.5 }}>
            💡 Tarifs indicatifs : Intra-ville 500-1500 F · Inter-quartiers 1500-3000 F · Inter-villes 3000-8000 F
          </div>
        </div>

        <button
          className="form-submit"
          onClick={handleSubmit}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading
            ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}/>Envoi en cours...</>
            : "📦 Envoyer ma demande"
          }
        </button>

        <p style={{
          fontSize: ".7rem", color: "var(--gray)", textAlign: "center",
          marginTop: 10, lineHeight: 1.5,
        }}>
          🔒 Vos informations sont sécurisées · Paiement à la livraison
        </p>
      </div>
    </div>
  );
}
