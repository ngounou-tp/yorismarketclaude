import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CITIES } from "../lib/constants";
import { DASHBOARD_SERVICES_LIMIT } from "../lib/queryLimits";
import { showAppToast } from "../lib/appToast";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : DASHBOARD PROVIDER (PRESTATAIRE)
// ─────────────────────────────────────────────────────────────
export function ProviderDashboard({ user, userData, dashTab, setDashTab }) {
  const [demandes, setDemandes] = useState([]);
  const [serviceForm, setServiceForm]     = useState({ nom: "", categorie: "", description: "", prix: "", tarif_type: "projet", ville: "", disponible: true });
  const [serviceSaved, setServiceSaved]   = useState(false);
  const [mesServices, setMesServices]     = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    const loadMesServices = async () => {
      const [{ data: servicesData, error: serviceErr }, { data: bookingData, error: bookingErr }] =
        await Promise.all([
          supabase.from("services").select("*").eq("provider_id", user.id).order("created_at", { ascending: false }).limit(DASHBOARD_SERVICES_LIMIT),
          supabase
            .from("service_bookings")
            .select("*")
            .eq("provider_id", user.id)
            .order("created_at", { ascending: false })
            .limit(100),
        ]);
      if (!serviceErr) setMesServices(servicesData || []);
      if (!bookingErr) {
        setDemandes(
          (bookingData || []).map((b) => ({
            id: b.id,
            client: b.client_nom || "Client Yorix",
            service: b.notes || "Prestation",
            date: `${b.booking_date || "Date à confirmer"} ${b.booking_time || ""}`.trim(),
            adresse: b.location_address || "Adresse à confirmer",
            budget: "Selon service",
            status: b.status || "reserved",
          }))
        );
      }
    };
    loadMesServices();
  }, [user?.id]);

  const supprimerService = async (id) => {
    if (!confirm("Supprimer ce service ?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) { showAppToast("Erreur : " + error.message); return; }
    const { data: refreshed } = await supabase
      .from("services")
      .select("*")
      .eq("provider_id", user.id)
      .order("created_at", { ascending: false })
      .limit(DASHBOARD_SERVICES_LIMIT);
    if (refreshed) setMesServices(refreshed);
  };

  const toggleDispo = async (id, current) => {
    const { error } = await supabase
      .from("services")
      .update({ disponible: !current })
      .eq("id", id);
    if (error) { showAppToast("Erreur : " + error.message); return; }
    setMesServices(prev => prev.map(s => s.id === id ? { ...s, disponible: !current } : s));
  };

  const repondre = async (id, accepte) => {
    const nextStatus = accepte ? "accepted" : "refused";
    const { error } = await supabase.from("service_bookings").update({ status: nextStatus }).eq("id", id);
    if (error) {
      showAppToast("Erreur : " + error.message);
      return;
    }
    setDemandes((prev) => prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d)));
  };

  const saveService = async () => {
    if (!serviceForm.nom || !serviceForm.prix) {
      showAppToast("Nom et prix obligatoires !");
      return;
    }
    const { error } = await supabase.from("services").insert({
      ...serviceForm,
      prix: Number(serviceForm.prix),
      tarif_type: serviceForm.tarif_type || "projet",
      provider_id: user.id,
      provider_nom: userData?.nom,
    });

    if (error) {
      console.error("Erreur publication service:", error);
      showAppToast("Erreur : " + error.message);
      return;
    }
    setServiceForm({ nom: "", categorie: "", description: "", prix: "", ville: "", disponible: true });
    setServiceSaved(true);
    setTimeout(() => setServiceSaved(false), 3000);
  };

  return (
    <>
      {dashTab === "overview" && (
        <>
          <div className="dash-page-title">Bonjour {userData?.nom} 👷</div>
          <div className="dash-stats">
            {[
              { icon: "📋", val: demandes.filter(d => d.status === "reserved" || d.status === "pending").length,  lbl: "Demandes" },
              { icon: "✅", val: demandes.filter(d => d.status === "accepted").length, lbl: "Acceptées" },
              { icon: "💰", val: "85 000 F", lbl: "Ce mois", trend: "+12%" },
              { icon: "⭐", val: "4.9/5",    lbl: "Ma note", trend: "" },
            ].map(s => (
              <div key={s.lbl} className="dstat">
                <div className="dstat-icon">{s.icon}</div>
                <div className="dstat-val">{s.val}</div>
                <div className="dstat-lbl">{s.lbl}</div>
                {s.trend && <div className="dstat-trend">{s.trend}</div>}
              </div>
            ))}
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".95rem",
            color: "var(--ink)", marginBottom: 12,
          }}>
            Demandes en attente
          </div>
          {demandes.filter(d => d.status === "reserved" || d.status === "pending").map(d => (
            <div key={d.id} className="order-card" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div className="oc-icon">🔧</div>
                <div className="oc-info">
                  <div className="oc-name">{d.client} — {d.service}</div>
                  <div className="oc-meta">📅 {d.date} · 📍 {d.adresse} · 💰 {d.budget}</div>
                </div>
                <span className="status-badge s-pending">⏳</span>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button className="btn-cmd-sm" onClick={() => repondre(d.id, true)}>✅ Accepter</button>
                <button className="btn-ghost" style={{ flex: 1, fontSize: ".78rem" }} onClick={() => repondre(d.id, false)}>
                  ❌ Refuser
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {dashTab === "ajouterService" && (
        <>
          <div className="dash-page-title">➕ Ajouter un service</div>
          {serviceSaved && <div className="success-msg">✅ Service publié !</div>}
          <div className="prod-form">
            <div className="form-row">
             <div className="form-group">
                <label className="form-label">Type de tarification *</label>
                <select
                  className="form-select"
                  value={serviceForm.tarif_type}
                  onChange={e => setServiceForm(f => ({ ...f, tarif_type: e.target.value }))}
                >
                  <option value="projet">📋 Forfait projet (recommandé : 10 000 FCFA)</option>
                  <option value="heure">⏱ Tarif horaire (recommandé : 5 000 FCFA/h)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  Prix (FCFA) {serviceForm.tarif_type === "heure" ? "/h" : "/projet"} *
                </label>
                <input
                  className="form-input"
                  type="number"
                  placeholder={serviceForm.tarif_type === "heure" ? "Ex: 5000" : "Ex: 10000"}
                  value={serviceForm.prix}
                  onChange={e => setServiceForm(f => ({ ...f, prix: e.target.value }))}
                />
                <div style={{fontSize:".7rem", color:"var(--gray)", marginTop:5}}>
                  💡 Tarifs Yorix recommandés : <strong>10 000 FCFA/projet</strong> ou <strong>5 000 FCFA/heure</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Catégorie</label>
                <select
                  className="form-select"
                  value={serviceForm.categorie}
                  onChange={e => setServiceForm(f => ({ ...f, categorie: e.target.value }))}
                >
                  <option value="">Choisir...</option>
                  {["Beauté", "Réparation", "Cuisine", "Transport", "Nettoyage", "Informatique", "Photographie", "Autre"].map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  placeholder="Décrivez votre service..."
                  value={serviceForm.description}
                  onChange={e => setServiceForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Prix (FCFA) *</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Ex: 5000"
                  value={serviceForm.prix}
                  onChange={e => setServiceForm(f => ({ ...f, prix: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Ville</label>
                <select
                  className="form-select"
                  value={serviceForm.ville}
                  onChange={e => setServiceForm(f => ({ ...f, ville: e.target.value }))}
                >
                  <option value="">Choisir...</option>
                  {CITIES.filter(c => c !== "Toutes les villes").map(c => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group full">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: ".82rem", fontWeight: 600, color: "var(--ink)" }}>
                  <input
                    type="checkbox"
                    checked={serviceForm.disponible}
                    onChange={e => setServiceForm(f => ({ ...f, disponible: e.target.checked }))}
                  />
                  ✅ Disponible maintenant
                </label>
              </div>
            </div>
            <button className="form-submit" onClick={saveService}>
              ✅ Publier le service
            </button>
          </div>
        </>
      )}

      {dashTab === "mesServices" && (
        <>
          <div className="dash-page-title">📋 Mes services ({mesServices.length})</div>
          {mesServices.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--gray)" }}>
              Aucun service publié.<br />
              Clique sur "Ajouter service" pour commencer.
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {mesServices.map(s => (
                <div key={s.id} className="order-card" style={{
                  display: "flex", flexDirection: "column", gap: 10,
                  opacity: s.disponible ? 1 : 0.5,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{s.nom}</div>
                      <div style={{ fontSize: ".82rem", color: "var(--gray)", marginTop: 4 }}>
                        📂 {s.categorie || "—"} · 📍 {s.ville || "—"}
                      </div>
                      {s.description && (
                        <div style={{ fontSize: ".85rem", marginTop: 6, color: "var(--ink)" }}>
                          {s.description}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--green)" }}>
                        {Number(s.prix).toLocaleString()} F
                      </div>
                      <div style={{ fontSize: ".7rem", color: s.disponible ? "var(--green)" : "var(--red)", marginTop: 4 }}>
                        {s.disponible ? "✅ Disponible" : "⛔ Indisponible"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      className="btn-ghost"
                      style={{ flex: 1, fontSize: ".82rem", padding: "8px" }}
                      onClick={() => toggleDispo(s.id, s.disponible)}
                    >
                      {s.disponible ? "⏸️ Désactiver" : "▶️ Activer"}
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ flex: 1, fontSize: ".82rem", padding: "8px", color: "var(--red)" }}
                      onClick={() => supprimerService(s.id)}
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
