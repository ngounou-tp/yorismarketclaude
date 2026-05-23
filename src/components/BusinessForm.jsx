import { useState } from "react";
import { supabase } from "../lib/supabase";
import { showAppToast } from "../lib/appToast";

// ═══════════════════════════════════════════════════════════════
// ✅ FORMULAIRE BUSINESS — Envoi email + enregistrement Supabase
// ═══════════════════════════════════════════════════════════════
export function BusinessForm() {
  const [form, setForm] = useState({ entreprise:"", contact:"", email:"", telephone:"", besoins:"" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.entreprise.trim()) e.entreprise = "Nom de l'entreprise obligatoire";
    if (!form.contact.trim())    e.contact    = "Nom du contact obligatoire";
    if (!form.email.trim())      e.email      = "Email obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (!form.telephone.trim())  e.telephone  = "Téléphone obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // 1. Enregistrement dans Supabase
      await supabase.from("business_requests").insert({
        entreprise: form.entreprise,
        contact:    form.contact,
        email:      form.email,
        telephone:  form.telephone,
        besoins:    form.besoins,
      });

      // 2. Ouvrir email pré-rempli vers raisaodin1@gmail.com
      const sujet = `Nouvelle demande d'accès Business — ${form.entreprise}`;
      const corps = [
        `Bonjour,`,
        ``,
        `Une nouvelle demande d'accès Business a été soumise sur Yorix CM :`,
        ``,
        `🏢 Entreprise : ${form.entreprise}`,
        `👤 Contact : ${form.contact}`,
        `📧 Email : ${form.email}`,
        `📞 Téléphone : ${form.telephone}`,
        ``,
        `📝 Besoins principaux :`,
        form.besoins || "(non précisé)",
        ``,
        `---`,
        `Envoyé depuis yorix.cm`,
      ].join("\n");

      const mailto = `mailto:raisaodin1@gmail.com?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
      window.open(mailto, "_blank");

      // 3. Afficher confirmation
      setSent(true);
      setForm({ entreprise:"", contact:"", email:"", telephone:"", besoins:"" });
    } catch (err) {
      showAppToast("Erreur : " + err.message, "error");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:"3.5rem", marginBottom:14 }}>✅</div>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1.2rem", color:"var(--green)", marginBottom:10 }}>
          Message envoyé avec succès !
        </h3>
        <p style={{ fontSize:".88rem", color:"var(--gray)", lineHeight:1.7, maxWidth:420, margin:"0 auto 20px" }}>
          Merci pour votre intérêt ! Notre équipe Yorix Business vous contactera très bientôt pour discuter de vos besoins professionnels.
        </p>
        <button
          onClick={() => setSent(false)}
          style={{ background:"var(--surface2)", color:"var(--ink)", border:"1.5px solid var(--border)", borderRadius:8, padding:"9px 20px", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:".82rem" }}
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:22 }}>
      <h3 style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:"1rem", color:"var(--ink)", marginBottom:4 }}>
        📋 Demande d'accès Business
      </h3>
      <p style={{ fontSize:".78rem", color:"var(--gray)", marginBottom:16 }}>
        Notre équipe B2B vous contacte sous 24h.
      </p>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Entreprise <span>*</span></label>
          <input
            className={`form-input${errors.entreprise ? " error" : ""}`}
            placeholder="Nom de l'entreprise"
            value={form.entreprise}
            onChange={e => setForm(f => ({ ...f, entreprise:e.target.value }))}
          />
          {errors.entreprise && <span className="form-error-text">{errors.entreprise}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Contact <span>*</span></label>
          <input
            className={`form-input${errors.contact ? " error" : ""}`}
            placeholder="Votre nom"
            value={form.contact}
            onChange={e => setForm(f => ({ ...f, contact:e.target.value }))}
          />
          {errors.contact && <span className="form-error-text">{errors.contact}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Email pro <span>*</span></label>
          <input
            className={`form-input${errors.email ? " error" : ""}`}
            type="email"
            placeholder="contact@entreprise.cm"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email:e.target.value }))}
          />
          {errors.email && <span className="form-error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Téléphone <span>*</span></label>
          <input
            className={`form-input${errors.telephone ? " error" : ""}`}
            placeholder="+237 6XX XXX XXX"
            value={form.telephone}
            onChange={e => setForm(f => ({ ...f, telephone:e.target.value }))}
          />
          {errors.telephone && <span className="form-error-text">{errors.telephone}</span>}
        </div>

        <div className="form-group full">
          <label className="form-label">Besoins principaux</label>
          <textarea
            className="form-textarea"
            style={{ minHeight:65 }}
            placeholder="Décrivez vos besoins..."
            value={form.besoins}
            onChange={e => setForm(f => ({ ...f, besoins:e.target.value }))}
          />
        </div>
      </div>

      <button className="form-submit" onClick={submit} disabled={loading}>
        {loading
          ? <><div className="spinner" style={{ width:16, height:16, borderWidth:2 }}/>Envoi...</>
          : "💼 Soumettre ma demande"
        }
      </button>
    </div>
  );
}
