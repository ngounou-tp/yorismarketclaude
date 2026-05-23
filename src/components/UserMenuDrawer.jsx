import { useEffect } from "react";
import { YORIX_WA_NUMBER } from "../lib/supabase";
import { isAdminViewer } from "../lib/roles";

export function UserMenuDrawer({
  open = false,
  onClose = () => {},
  user = null,
  userData = null,
  userRole = "buyer",
  orderCount = 0,
  loyaltyPoints = 0,
  wishlistCount = 0,
  dark = false,
  onToggleDark = () => {},
  siteLocale = "fr",
  onChangeLocale = () => {},
  onLogout = () => {},
  goPage = () => {},
  goDash = () => {},
  onOpenAuth = () => {},
  setOnboardingOpen = () => {},
}) {
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const go = (page, params) => {
    onClose();
    setTimeout(() => goPage(page, params), 150);
  };

  const dash = (tab) => {
    onClose();
    setTimeout(() => goDash(tab), 150);
  };

  const userName =
    userData?.nom || userData?.full_name || user?.email?.split("@")[0] || "Mon compte";
  const userEmail = user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const roleConfig = {
    buyer: { label: "Acheteur", color: "#1565c0", bg: "#e3f2fd" },
    seller: { label: "Vendeur", color: "#1a6b3a", bg: "#c8f5d9" },
    delivery: { label: "Livreur", color: "#856404", bg: "#fff3cd" },
    provider: { label: "Prestataire", color: "#6a1b9a", bg: "#ede7f6" },
    admin: { label: "Admin", color: "#92400e", bg: "#fef3c7" },
    admin_partner: { label: "Admin", color: "#92400e", bg: "#fef3c7" },
    superadmin: { label: "Admin", color: "#92400e", bg: "#fef3c7" },
  };
  const role = roleConfig[userRole] || roleConfig.buyer;
  const localeTag = siteLocale === "en" ? "en-FR" : "fr-FR";

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent("Bonjour Yorix, j'ai besoin d'aide.")}`,
      "_blank",
      "noopener,noreferrer",
    );
    onClose();
  };

  return (
    <>
      <div className={`umd-overlay${open ? " open" : ""}`} onClick={onClose} aria-hidden="true" />

      <aside
        className={`umd-drawer${open ? " open" : ""}`}
        role="dialog"
        aria-label="Menu utilisateur"
        aria-hidden={!open}
      >
        <div className="umd-header">
          <button type="button" className="umd-close" onClick={onClose} aria-label="Fermer le menu">
            ✕
          </button>

          {user ? (
            <>
              <div className="umd-avatar-wrap">
                <div className="umd-avatar">{userInitial}</div>
                <span className="umd-role-pill" style={{ background: role.bg, color: role.color }}>
                  {role.label}
                </span>
              </div>
              <h3 className="umd-name">{userName}</h3>
              <p className="umd-email">{userEmail}</p>
            </>
          ) : (
            <>
              <div className="umd-avatar umd-avatar-guest">👤</div>
              <h3 className="umd-name">Bienvenue sur Yorix</h3>
              <p className="umd-email">Connectez-vous pour profiter de tout</p>
              <button
                type="button"
                className="umd-cta-login"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
              >
                🚀 Se connecter ou s&apos;inscrire
              </button>
            </>
          )}
        </div>

        {user && (
          <div className="umd-stats">
            <button type="button" className="umd-stat" onClick={() => dash("commandes")}>
              <div className="umd-stat-val">{orderCount}</div>
              <div className="umd-stat-lbl">Commandes</div>
            </button>
            <button type="button" className="umd-stat umd-stat-gold" onClick={() => go("loyalty")}>
              <div className="umd-stat-val">{loyaltyPoints.toLocaleString(localeTag)}</div>
              <div className="umd-stat-lbl">Points</div>
            </button>
            <button type="button" className="umd-stat" onClick={() => dash("overview")}>
              <div className="umd-stat-val">{wishlistCount}</div>
              <div className="umd-stat-lbl">Favoris</div>
            </button>
          </div>
        )}

        <nav className="umd-nav">
          {user && (
            <>
              <div className="umd-section-title">Mon compte</div>

              <button type="button" className="umd-nav-item" onClick={() => dash("overview")}>
                <span className="umd-nav-icon">👤</span>
                <span className="umd-nav-label">Mon profil</span>
                <span className="umd-nav-arrow">→</span>
              </button>

              <button type="button" className="umd-nav-item" onClick={() => dash("commandes")}>
                <span className="umd-nav-icon">📦</span>
                <span className="umd-nav-label">Mes commandes</span>
                {orderCount > 0 && <span className="umd-badge">{orderCount}</span>}
              </button>

              <button type="button" className="umd-nav-item" onClick={() => go("loyalty")}>
                <span className="umd-nav-icon">⭐</span>
                <span className="umd-nav-label">Mon portefeuille</span>
                <span className="umd-nav-meta">{loyaltyPoints.toLocaleString(localeTag)} pts</span>
              </button>

              <button type="button" className="umd-nav-item" onClick={() => dash("overview")}>
                <span className="umd-nav-icon">❤️</span>
                <span className="umd-nav-label">Mes favoris</span>
                <span className="umd-nav-arrow">→</span>
              </button>

              {userRole !== "buyer" && (
                <button
                  type="button"
                  className="umd-nav-item umd-nav-item-highlight"
                  onClick={() => go("dashboard")}
                >
                  <span className="umd-nav-icon">📊</span>
                  <span className="umd-nav-label">Mon tableau de bord</span>
                  <span className="umd-nav-arrow">→</span>
                </button>
              )}

              {isAdminViewer(userData) && (
                <button type="button" className="umd-nav-item umd-nav-item-admin" onClick={() => go("admin")}>
                  <span className="umd-nav-icon">⚙️</span>
                  <span className="umd-nav-label">Administration</span>
                  <span className="umd-nav-arrow">→</span>
                </button>
              )}
            </>
          )}

          <div className="umd-section-title">Explorer</div>

          <button type="button" className="umd-nav-item" onClick={() => go("produits")}>
            <span className="umd-nav-icon">🛍️</span>
            <span className="umd-nav-label">Produits</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("prestataires")}>
            <span className="umd-nav-icon">🛠️</span>
            <span className="umd-nav-label">Services</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("livraison")}>
            <span className="umd-nav-icon">🚚</span>
            <span className="umd-nav-label">Livraison</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("bonsPlans")}>
            <span className="umd-nav-icon">🔥</span>
            <span className="umd-nav-label">Bons plans</span>
            <span className="umd-nav-meta umd-nav-meta-hot">PROMO</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("business")}>
            <span className="umd-nav-icon">💼</span>
            <span className="umd-nav-label">Yorix Business</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("academy")}>
            <span className="umd-nav-icon">🎓</span>
            <span className="umd-nav-label">Yorix Academy</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <div className="umd-section-title">Préférences</div>

          <div className="umd-nav-item umd-nav-item-toggle">
            <span className="umd-nav-icon">{dark ? "🌙" : "☀️"}</span>
            <span className="umd-nav-label">Mode {dark ? "sombre" : "clair"}</span>
            <button
              type="button"
              className={`umd-toggle${dark ? " umd-toggle-on" : ""}`}
              onClick={onToggleDark}
              role="switch"
              aria-checked={dark}
              aria-label="Basculer le mode sombre"
            >
              <span className="umd-toggle-knob" />
            </button>
          </div>

          <div className="umd-nav-item umd-nav-item-toggle">
            <span className="umd-nav-icon">🌍</span>
            <span className="umd-nav-label">Langue</span>
            <div className="umd-lang-switch">
              <button
                type="button"
                className={siteLocale === "fr" ? "active" : ""}
                onClick={() => onChangeLocale("fr")}
              >
                FR
              </button>
              <button
                type="button"
                className={siteLocale === "en" ? "active" : ""}
                onClick={() => onChangeLocale("en")}
              >
                EN
              </button>
            </div>
          </div>

          <div className="umd-section-title">Support</div>

          <button type="button" className="umd-nav-item umd-nav-item-wa" onClick={handleWhatsApp}>
            <span className="umd-nav-icon">💬</span>
            <span className="umd-nav-label">WhatsApp Yorix</span>
            <span className="umd-nav-meta">+237 696 56 56 54</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("aide")}>
            <span className="umd-nav-icon">❓</span>
            <span className="umd-nav-label">Centre d&apos;aide</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("contact")}>
            <span className="umd-nav-icon">📧</span>
            <span className="umd-nav-label">Contact</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("faq")}>
            <span className="umd-nav-icon">ℹ️</span>
            <span className="umd-nav-label">À propos de Yorix</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("escrow")}>
            <span className="umd-nav-icon">🔐</span>
            <span className="umd-nav-label">Protection acheteur</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          <button type="button" className="umd-nav-item" onClick={() => go("confidentialite")}>
            <span className="umd-nav-icon">📜</span>
            <span className="umd-nav-label">Politique de confidentialité</span>
            <span className="umd-nav-arrow">→</span>
          </button>

          {user && userRole === "buyer" && (
            <button type="button" className="umd-cta-become-seller" onClick={() => go("devenirVendeur")}>
              🚀 Devenir vendeur sur Yorix
            </button>
          )}

          {!user && (
            <button
              type="button"
              className="umd-cta-become-seller"
              onClick={() => {
                onClose();
                setOnboardingOpen(true);
              }}
            >
              🚀 Découvrir Yorix
            </button>
          )}

          {user && (
            <button
              type="button"
              className="umd-logout"
              onClick={() => {
                if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
                  onClose();
                  onLogout();
                }
              }}
            >
              <span className="umd-nav-icon">🚪</span>
              <span>Se déconnecter</span>
            </button>
          )}
        </nav>

        <div className="umd-footer">
          <p className="umd-footer-text">
            <strong>Yorix CM</strong> · Marketplace #1 au Cameroun 🇨🇲
          </p>
          <p className="umd-footer-version">Version 1.0.0</p>
        </div>
      </aside>
    </>
  );
}
