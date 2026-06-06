import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { DASHBOARD_ORDERS_LIMIT } from "../lib/queryLimits";
import { DELIVERY_STATUSES, REWARDS_DATA } from "../lib/constants";
import { OrderCardWithTracking } from "./OrderCardWithTracking";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : DASHBOARD ACHETEUR (BUYER)
// ─────────────────────────────────────────────────────────────
export function BuyerDashboard({ user, userData, wishlist, totalQty, loyaltyPts, setLoyaltyPts, dashTab, goPage }) {
  const [mesCommandes, setMesCommandes] = useState([]);

  useEffect(() => {
    supabase
      .from("orders")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(DASHBOARD_ORDERS_LIMIT)
      .then(({ data }) => setMesCommandes(data || []));
  }, [user.id]);

  return (
    <>
      {dashTab === "overview" && (
        <>
          <div className="dash-page-title">
            Bonjour {userData?.nom || user.email?.split("@")[0] || "cher client"} 🛍️
          </div>
          <div className="dash-stats">
            {[
              { icon: "📦", val: mesCommandes.length, lbl: "Commandes", trend: mesCommandes.length > 0 ? "↑ Actif" : "— Aucune" },
              { icon: "❤️", val: wishlist.size,       lbl: "Favoris",   trend: wishlist.size > 0 ? `${wishlist.size} sauvegardé${wishlist.size > 1 ? "s" : ""}` : "— Vide" },
              { icon: "🛒", val: totalQty,            lbl: "Panier",    trend: totalQty > 0 ? "↑ En cours" : "— Vide" },
              { icon: "🌟", val: `${loyaltyPts} pts`, lbl: "Points fidélité", trend: loyaltyPts > 0 ? "↑ Cumulés" : "— Démarrer" },
            ].map(s => (
              <div key={s.lbl} className="dstat">
                <div className="dstat-icon">{s.icon}</div>
                <div className="dstat-val">{s.val}</div>
                <div className="dstat-lbl">{s.lbl}</div>
                {s.trend && (
                  <div className="dstat-trend" style={{
                    fontSize: ".65rem", fontWeight: 600, marginTop: 4,
                    color: s.trend.startsWith("↑") ? "var(--green)" : "var(--ink-light,#888)",
                    letterSpacing: ".02em",
                  }}>{s.trend}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".95rem",
            color: "var(--ink)", marginBottom: 12,
          }}>
            Mes dernières commandes
          </div>
          {mesCommandes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <p>Aucune commande</p>
              <button
                className="form-submit"
                style={{ width: "auto", padding: "10px 24px", marginTop: 12 }}
                onClick={() => goPage("produits")}
              >
                Voir les produits
              </button>
            </div>
          ) : (
            mesCommandes.slice(0, 5).map(c => (
              <div key={c.id} className="order-card">
                <div className="oc-icon">📦</div>
                <div className="oc-info">
                  <div className="oc-name">#{String(c.id).slice(-8)}</div>
                  <div className="oc-meta">
                    {c.montant?.toLocaleString()} FCFA ·{" "}
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : ""}
                  </div>
                </div>
                <div className="oc-actions">
                  <span className={`status-badge s-${c.status}`}>{c.status}</span>
                  <span className={`status-badge s-${c.livraison_status}`}>
                    {DELIVERY_STATUSES[c.livraison_status] || c.livraison_status}
                  </span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {dashTab === "commandes" && (
        <>
          <div className="dash-page-title">📦 Mes commandes</div>
          {mesCommandes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <p>Aucune commande</p>
            </div>
          ) : (
            mesCommandes.map(c => (
              <OrderCardWithTracking key={c.id} commande={c} goPage={goPage} />
            ))
          )}
        </>
      )}

      {dashTab === "loyalty" && (
        <>
          <div className="dash-page-title">🌟 Programme fidélité</div>
          <div style={{
            background: "linear-gradient(135deg,#1a3a24,var(--green))",
            borderRadius: 14, padding: 22, color: "#fff", marginBottom: 18,
          }}>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, marginBottom: 4 }}>
              Mes points
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--yellow)" }}>
              {loyaltyPts} pts
            </div>
            <div style={{ fontSize: ".71rem", opacity: .62, marginBottom: 12 }}>
              Niveau Or · {1000 - loyaltyPts} pts pour Platine
            </div>
            <div style={{ background: "rgba(255,255,255,.2)", borderRadius: 50, height: 7 }}>
              <div style={{
                background: "var(--yellow)", borderRadius: 50, height: 7,
                width: `${Math.min((loyaltyPts % 1000) / 10, 100)}%`,
                transition: "width .6s",
              }} />
            </div>
          </div>
          <div className="rewards-grid">
            {REWARDS_DATA.map(r => (
              <div key={r.name} className="reward-card">
                <div className="reward-icon">{r.icon}</div>
                <div className="reward-name">{r.name}</div>
                <div className="reward-pts">{r.pts} pts</div>
                <button
                  className="reward-btn"
                  onClick={() => setLoyaltyPts(p => Math.max(0, p - r.pts))}
                >
                  Échanger
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
