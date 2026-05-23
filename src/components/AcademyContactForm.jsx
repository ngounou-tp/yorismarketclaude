import { useState } from "react";
import { supabase } from "../lib/supabase";
import { showAppToast } from "../lib/appToast";

// ┌────────────────────────────────────────────────────────────┐
// │ COMPOSANT : AcademyContactForm (formulaire inscription)    │
// └────────────────────────────────────────────────────────────┘
export function AcademyContactForm({ course, user, userData, goPage }) {
  const [form, setForm] = useState({
    nom: userData?.nom || "",
    email: user?.email || "",
    telephone: userData?.telephone || "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!course) {
    return (
      <div className="empty-state anim" style={{ padding: "60px 0" }}>
        <div className="empty-icon">❓</div>
        <p>Formation introuvable</p>
        <button
          className="form-submit"
          style={{ width: "auto", padding: "10px 24px", marginTop: 16 }}
          onClick={() => goPage("academy")}
        >
          ← Retour à l'Academy
        </button>
      </div>
    );
  }

  const validate = () => {
    const e = {};
    if (!form.nom.trim()) e.nom = "Nom obligatoire";
    if (!form.email.trim()) e.email = "Email obligatoire";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
    if (!form.telephone.trim()) e.telephone = "Téléphone obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("academy_requests").insert({
        course_slug:  course.slug,
        course_title: course.title,
        course_prix:  course.prix,
        nom:          form.nom,
        email:        form.email,
        telephone:    form.telephone,
        message:      form.message || null,
        user_id:      user?.id || null,
        status:       "pending",
      });

      if (error) throw error;

      const sujet = `🎓 Nouvelle demande Academy — ${course.title}`;
      const corps = [
        `Bonjour,`,
        ``,
        `Nouvelle inscription Academy sur Yorix CM :`,
        ``,
        `📚 Formation : ${course.title}`,
        `💰 Prix : ${course.prix.toLocaleString("fr-FR")} FCFA`,
        ``,
        `👤 Nom : ${form.nom}`,
        `📧 Email : ${form.email}`,
        `📞 Téléphone : ${form.telephone}`,
        ``,
        form.message ? `💬 Message :\n${form.message}\n` : "",
        `---`,
        `Yorix Academy — yorix.cm`,
      ].filter(Boolean).join("\n");

      const mailto = `mailto:raisaodin1@gmail.com?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
      window.open(mailto, "_blank");

      setSent(true);
    } catch (err) {
      showAppToast("Erreur : " + err.message, "error");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <section className="sec anim">
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "40px 30px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎉</div>
            <h2
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: "1.4rem",
                color: "var(--green)",
                marginBottom: 12,
              }}
            >
              Demande envoyée avec succès !
            </h2>
            <p
              style={{
                fontSize: ".9rem",
                color: "var(--gray)",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              Merci pour votre intérêt ! Notre équipe vous contactera dans les{" "}
              <strong style={{ color: "var(--ink)" }}>24 heures</strong> pour finaliser
              votre inscription à la formation{" "}
              <strong style={{ color: "var(--ink)" }}>{course.title}</strong>.
            </p>

            <div
              style={{
                background: "var(--green-pale)",
                border: "1px solid var(--green-light)",
                borderRadius: 11,
                padding: "16px 18px",
                marginBottom: 20,
              }}
            >
              <p style={{ fontSize: ".78rem", color: "var(--gray)", marginBottom: 10 }}>
                Besoin d'une réponse rapide ?
              </p>
              <a
                href={`https://wa.me/237696565654?text=${encodeURIComponent(
                  `Bonjour, je viens de faire une demande pour "${course.title}". Mon nom : ${form.nom}`
                )}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: "#25D366",
                  color: "#fff",
                  padding: "10px 20px",
                  borderRadius: 9,
                  textDecoration: "none",
                  fontFamily: "'Syne',sans-serif",
                  fontWeight: 700,
                  fontSize: ".82rem",
                }}
              >
                💬 Nous contacter sur WhatsApp
              </a>
            </div>

            <button
              onClick={() => goPage("academy")}
              style={{
                background: "var(--surface2)",
                color: "var(--ink)",
                border: "1.5px solid var(--border)",
                borderRadius: 8,
                padding: "10px 24px",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                fontWeight: 600,
                fontSize: ".82rem",
              }}
            >
              ← Retour à l'Academy
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sec anim">
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <button
          onClick={() => goPage("academyDetail")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--gray)",
            fontSize: 14,
            marginBottom: 20,
            padding: "8px 0",
          }}
        >
          ← Retour à la formation
        </button>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: 18,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <span style={{ fontSize: "2.5rem" }}>{course.emoji || "🎓"}</span>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: ".65rem",
                fontWeight: 800,
                color: "var(--gray)",
                letterSpacing: "0.05em",
              }}
            >
              {course.category}
            </div>
            <div
              style={{
                fontFamily: "'Syne',sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--ink)",
                marginTop: 2,
              }}
            >
              {course.title}
            </div>
          </div>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: "1.2rem",
              color: "var(--green)",
            }}
          >
            {course.prix === 0 ? "Gratuit" : `${course.prix.toLocaleString("fr-FR")} F`}
          </div>
        </div>

        <h1
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "var(--ink)",
            marginBottom: 6,
            letterSpacing: "-.5px",
          }}
        >
          Je suis intéressé(e) 🎯
        </h1>
        <p style={{ color: "var(--gray)", fontSize: ".86rem", marginBottom: 20 }}>
          Laissez-nous vos coordonnées, nous vous recontactons rapidement pour finaliser.
        </p>

        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: 24,
          }}
        >
          <div className="form-row">
            <div className="form-group full">
              <label className="form-label">
                Nom complet <span>*</span>
              </label>
              <input
                className={`form-input${errors.nom ? " error" : ""}`}
                placeholder="Ex: Raisa Kouekam"
                value={form.nom}
                onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              />
              {errors.nom && <span className="form-error-text">{errors.nom}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Email <span>*</span>
              </label>
              <input
                className={`form-input${errors.email ? " error" : ""}`}
                type="email"
                placeholder="vous@email.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <span className="form-error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Téléphone (WhatsApp) <span>*</span>
              </label>
              <input
                className={`form-input${errors.telephone ? " error" : ""}`}
                placeholder="+237 6XX XXX XXX"
                value={form.telephone}
                onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))}
              />
              {errors.telephone && (
                <span className="form-error-text">{errors.telephone}</span>
              )}
            </div>

            <div className="form-group full">
              <label className="form-label">Message (optionnel)</label>
              <textarea
                className="form-textarea"
                style={{ minHeight: 80 }}
                placeholder="Questions, disponibilités, attentes..."
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              />
            </div>
          </div>

          <button className="form-submit" onClick={submit} disabled={loading}>
            {loading ? (
              <>
                <div
                  className="spinner"
                  style={{ width: 16, height: 16, borderWidth: 2 }}
                />
                Envoi...
              </>
            ) : (
              "✉️ Envoyer ma demande"
            )}
          </button>

          <p
            style={{
              fontSize: ".7rem",
              color: "var(--gray)",
              textAlign: "center",
              marginTop: 10,
            }}
          >
            En soumettant, vous acceptez d'être contacté(e) par Yorix Academy.
          </p>
        </div>
      </div>
    </section>
  );
}
