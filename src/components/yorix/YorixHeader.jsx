import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { roleLabel } from "../../i18n/index.js";
import { EMOTIONAL_NAV } from "../../lib/merchHubs";
import { categoryLabel } from "../../lib/marketplaceCategories";
import { CategoryMegaMenu } from "../categories/CategoryMegaMenu";
import { CategoryMobileNav } from "../categories/CategoryMobileNav";
import { NotificationBell } from "../NotificationBell";
import "../categories/categoryUi.css";

export function YorixHeader({
  navCompact,
  dark,
  setDark,
  user,
  userData,
  userRole,
  goPage,
  siteLocale = "fr",
  switchLocale,
  filterCat,
  setFilterCat,
  categoryTree = [],
  goToCategory,
  search,
  setSearch,
  produits,
  setOnboardingOpen,
  onNotifsSync,
  onOpenNotification,
  onMarkNotifRead,
  totalQty,
  openCart,
  setAuthTab,
  setAuthOpen,
  setSelectedRole,
  doLogout,
  navQuickRef,
  navQuickOpen,
  setNavQuickOpen,
  TABS,
  tabActive,
  commerceDeliveryPolicy,
  roleChipClass,
}) {
  const { t } = useTranslation("nav");
  const localeTag = siteLocale === "en" ? "en-FR" : "fr-FR";
  const freeShip = commerceDeliveryPolicy.freeShippingThresholdXaf.toLocaleString(localeTag);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const close = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenuOpen]);

  return (
    <div className={`header-sticky-stack${navCompact ? " header-sticky-stack--compact" : ""}`}>
      <div className="topbar">
        <div className="topbar-l">
          <div className="flag-wrap">
            <span className="flag">
              <span className="fg" />
              <span className="fr" />
              <span className="fy" />
            </span>
            <span>{t("topbar.cameroon")} 🇨🇲</span>
          </div>
          <span
            role="group"
            aria-label={t("sticky_lang_hint", { ns: "common" })}
            style={{ display: "inline-flex", gap: 6, alignItems: "center", userSelect: "none" }}
          >
            <span
              role="button"
              tabIndex={0}
              onClick={() => switchLocale?.("fr")}
              onKeyDown={(e) => e.key === "Enter" && switchLocale?.("fr")}
              style={{
                cursor: "pointer",
                fontWeight: siteLocale === "fr" ? 700 : 500,
                opacity: siteLocale === "fr" ? 1 : 0.7,
              }}
            >
              FR
            </span>
            <span aria-hidden style={{ opacity: 0.45 }}>
              |
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={() => switchLocale?.("en")}
              onKeyDown={(e) => e.key === "Enter" && switchLocale?.("en")}
              style={{
                cursor: "pointer",
                fontWeight: siteLocale === "en" ? 700 : 500,
                opacity: siteLocale === "en" ? 1 : 0.7,
              }}
            >
              EN
            </span>
          </span>
          <span>📞 +237 696 56 56 54</span>
        </div>
        <div className="topbar-r">
          <span onClick={() => goPage("aide")}>🆘 {t("topbar.help")}</span>
          <span onClick={() => goPage("contact")}>📞 {t("topbar.contact")}</span>
          {user ? (
            <span style={{ color: "#b7e4c7" }}>👤 {userData?.nom || user.email?.split("@")[0]}</span>
          ) : (
            <span
              onClick={() => {
                setAuthTab("login");
                setAuthOpen(true);
              }}
            >
              🔑 {t("topbar.login")}
            </span>
          )}
        </div>
      </div>

      <nav className="navbar">
        <div className="logo-wrap" onClick={() => goPage("home")}>
          <div className="logo-txt">
            Yo<span>rix</span>
            <sup>CM</sup>
          </div>
        </div>

        <span className="nav-lang-mobile" role="group" aria-label={t("sticky_lang_hint", { ns: "common" })}>
          <button
            type="button"
            className={siteLocale === "fr" ? "active" : ""}
            onClick={() => switchLocale?.("fr")}
          >
            FR
          </button>
          <span aria-hidden>|</span>
          <button
            type="button"
            className={siteLocale === "en" ? "active" : ""}
            onClick={() => switchLocale?.("en")}
          >
            EN
          </button>
        </span>

        {categoryTree.length > 0 && (
          <CategoryMegaMenu tree={categoryTree} locale={siteLocale} onNavigate={(v) => goToCategory?.(v)} />
        )}

        <div className="nav-search-wrap">
          <div className="nav-search">
            <select
              value={filterCat}
              onChange={(e) => {
                const v = e.target.value;
                setFilterCat(v);
                const root = categoryTree.find((r) => categoryLabel(r, siteLocale) === v);
                if (root) goToCategory?.({ parentSlug: root.slug });
                else if (!v) goPage("produits");
              }}
              aria-label={t("search.ariaCategory")}
            >
              <option value="">{t("search.allCategories")}</option>
              {categoryTree.map((r) => (
                <option key={r.id || r.slug} value={categoryLabel(r, siteLocale)}>
                  {categoryLabel(r, siteLocale)}
                </option>
              ))}
            </select>
            <input
              placeholder={t("search.placeholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goPage("produits")}
              autoComplete="off"
              aria-label={t("search.ariaSearch")}
              aria-expanded={search.trim().length >= 2}
              aria-haspopup="listbox"
            />
            {search.trim().length >= 2 && (
              <div className="nav-search-dd" role="listbox" aria-label={t("search.ariaSuggestions")}>
                {produits
                  .filter(
                    (p) =>
                      (p.name_fr || "").toLowerCase().includes(search.toLowerCase()) ||
                      (p.description_fr || "").toLowerCase().includes(search.toLowerCase()),
                  )
                  .slice(0, 8)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className="nav-search-dd-item"
                      role="option"
                      onClick={() => {
                        setSearch("");
                        goPage("produits");
                      }}
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          className="nav-search-dd-img"
                          alt=""
                          onError={(e) => {
                            e.currentTarget.style.visibility = "hidden";
                          }}
                        />
                      ) : (
                        <span className="nav-search-dd-img nav-search-dd-ph" aria-hidden>
                          📦
                        </span>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div className="nav-search-dd-t">{p.name_fr}</div>
                        <div className="nav-search-dd-p">{p.prix?.toLocaleString(localeTag)} FCFA</div>
                      </div>
                    </button>
                  ))}
                {produits.filter((p) => (p.name_fr || "").toLowerCase().includes(search.toLowerCase())).length === 0 && (
                  <div className="nav-search-dd-empty">
                    Aucun résultat pour « {search} » — touche Entrée pour ouvrir le catalogue filtré.
                  </div>
                )}
              </div>
            )}
            <button type="button" onClick={() => goPage("produits")} aria-label={t("search.ariaSubmit")}>
              🔍
            </button>
          </div>
        </div>

        <div className="nav-actions">
          <button type="button" className="nav-cta-onboard" onClick={() => setOnboardingOpen(true)} title={t("actions.getStartedTitle")}>
            🚀 {t("actions.getStarted")}
          </button>

          <button type="button" className="dark-toggle" onClick={() => setDark((d) => !d)} title={dark ? t("actions.lightMode") : t("actions.darkMode")}>
            {dark ? "☀️" : "🌙"}
          </button>

          {user && (
            <NotificationBell
              user={user}
              goPage={goPage}
              siteLocale={siteLocale}
              onSync={onNotifsSync}
              onOpenNotification={onOpenNotification}
              onMarkNotifRead={onMarkNotifRead}
            />
          )}

          <button type="button" className="icon-btn" onClick={openCart} title={t("actions.cart")}>
            🛒
            {totalQty > 0 && <span className="ibadge">{totalQty}</span>}
          </button>

          <div className="user-menu-mobile" ref={userMenuRef}>
            <button
              type="button"
              className="user-menu-trigger"
              aria-expanded={userMenuOpen}
              aria-label={user ? t("actions.mySpace") : t("topbar.login")}
              onClick={() => setUserMenuOpen((o) => !o)}
            >
              {user ? (userData?.nom || user.email || "?")[0].toUpperCase() : "☰"}
            </button>
            {userMenuOpen && (
              <div className="user-menu-dropdown">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        goPage("dashboard");
                      }}
                    >
                      📊 {t("actions.mySpace")}
                    </button>
                    <button
                      type="button"
                      className="logout-btn"
                      onClick={() => {
                        setUserMenuOpen(false);
                        doLogout();
                      }}
                    >
                      🚪 {t("actions.logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setAuthTab("login");
                        setAuthOpen(true);
                      }}
                    >
                      🔑 Connexion
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setAuthTab("register");
                        setSelectedRole("buyer");
                        setAuthOpen(true);
                      }}
                    >
                      🚀 {t("actions.register")}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="nav-auth-desktop">
            {!user ? (
              <>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setAuthTab("login");
                    setAuthOpen(true);
                  }}
                >
                  🔑 Connexion
                </button>
                <button
                  type="button"
                  className="btn-green"
                  onClick={() => {
                    setAuthTab("register");
                    setSelectedRole("buyer");
                    setAuthOpen(true);
                  }}
                >
                  🚀 {t("actions.register")}
                </button>
              </>
            ) : (
              <>
                <span className={`role-chip ${roleChipClass()}`}>{roleLabel(t, userRole || "buyer")}</span>
                <div className="user-av" onClick={() => goPage("dashboard")} title={t("actions.mySpace")}>
                  {(userData?.nom || user.email || "?")[0].toUpperCase()}
                </div>
                <button type="button" className="btn-red" onClick={doLogout} title={t("actions.logout")}>
                  🚪 {t("actions.logout")}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="nav-tabs-row" ref={navQuickRef}>
        <nav className="nav-tabs" aria-label={t("actions.navigation")}>
          {TABS.map((t) => (
            <div
              key={t.p}
              className={`tab${tabActive(t.p) ? " active" : ""}`}
              onClick={() => {
                setNavQuickOpen(false);
                goPage(t.p);
              }}
              role="presentation"
            >
              {t.l}
            </div>
          ))}
        </nav>
        <div className="nav-quick-wrap">
          <button type="button" className="nav-quick-btn" aria-expanded={navQuickOpen} onClick={() => setNavQuickOpen((o) => !o)}>
            ☰ {t("actions.navigation")}
          </button>
          {navQuickOpen && (
            <div className="nav-quick-panel" role="dialog" aria-label={t("actions.navDialog")}>
              <div className="nav-quick-mega-cols">
                {categoryTree.length > 0 && (
                  <div className="nav-quick-section" style={{ gridColumn: "1 / -1" }}>
                    <CategoryMobileNav
                      tree={categoryTree}
                      locale={siteLocale}
                      onNavigate={(v) => {
                        setNavQuickOpen(false);
                        goToCategory?.(v);
                      }}
                    />
                  </div>
                )}
                <div className="nav-quick-section">
                  <h4>{t("quickNav.marketplace")}</h4>
                  <div className="nav-quick-links">
                    {[
                      { ic: "🏠", l: t("quickNav.home"), p: "home" },
                      { ic: "🛍️", l: t("quickNav.catalog"), p: "produits" },
                      { ic: "🛒", l: t("quickNav.cartSecure"), p: "cart" },
                      { ic: "🏷️", l: t("quickNav.dealsNow"), p: "bonsPlans" },
                      { ic: "🚚", l: t("quickNav.deliveryTrack"), p: "livraison" },
                    ].map((x) => (
                      <button
                        key={x.p}
                        type="button"
                        onClick={() => {
                          setNavQuickOpen(false);
                          goPage(x.p);
                        }}
                      >
                        <span className="nav-quick-ico">{x.ic}</span>
                        <span>{x.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="nav-quick-section">
                  <h4>{t("quickNav.trust")}</h4>
                  <div className="nav-quick-links">
                    {[
                      { ic: "🔐", l: t("quickNav.escrowBuyer"), p: "escrow" },
                      { ic: "🧑‍🔧", l: t("quickNav.providersVerified"), p: "prestataires" },
                      { ic: "💼", l: t("tabs.business"), p: "business" },
                      { ic: "🎓", l: t("tabs.academy"), p: "academy" },
                      { ic: "📰", l: t("quickNav.blogTrends"), p: "blog" },
                      { ic: "⭐", l: t("quickNav.loyaltyProgram"), p: "loyalty" },
                    ].map((x) => (
                      <button
                        key={x.p}
                        type="button"
                        onClick={() => {
                          setNavQuickOpen(false);
                          goPage(x.p);
                        }}
                      >
                        <span className="nav-quick-ico">{x.ic}</span>
                        <span>{x.l}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="nav-quick-section">
                  <h4>{t("quickNav.support")}</h4>
                  <div className="nav-quick-links">
                    <button
                      type="button"
                      onClick={() => {
                        setNavQuickOpen(false);
                        goPage("contact");
                      }}
                    >
                      <span className="nav-quick-ico">📞</span>
                      <span>{t("quickNav.contactSupport")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNavQuickOpen(false);
                        goPage("aide");
                      }}
                    >
                      <span className="nav-quick-ico">🆘</span>
                      <span>{t("quickNav.helpSos")}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setNavQuickOpen(false);
                        goPage("faq");
                      }}
                    >
                      <span className="nav-quick-ico">❓</span>
                      <span>{t("quickNav.faqMarketplace")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="yorix-emotional-nav" aria-label={siteLocale === "en" ? "Shop highlights" : "Sélections marketplace"}>
        {EMOTIONAL_NAV.map((item) => {
          const label = siteLocale === "en" ? item.labelEn : item.labelFr;
          const onClick = () => {
            if (item.hub) goPage("merchHub", { merchHub: item.hub });
            else if (item.page === "seoAlias" && item.alias) goPage("business");
            else goPage(item.page);
          };
          return (
            <button key={item.hub || item.page || item.alias} type="button" className="yorix-emotional-nav-btn" onClick={onClick}>
              <span aria-hidden>{item.icon}</span> {label}
            </button>
          );
        })}
      </nav>

      <div className="pay-strip">
        <b style={{ color: "var(--ink)" }}>{t("payStrip.payment")}</b>
        <div className="pay-methods">
          <span className="pm mtn-b">📱 {t("payStrip.momo")}</span>
          <span className="pm ora-b">🔶 {t("payStrip.orange")}</span>
          <span className="pm">💳 {t("payStrip.card")}</span>
          <span className="pm">💵 {t("payStrip.cash")}</span>
        </div>
        <div className="strip-right">
          <span>🚚 {t("payStrip.deliveryJ1")}</span>
          <span
            role="link"
            tabIndex={0}
            onClick={() => goPage("bonsPlans")}
            onKeyDown={(e) => e.key === "Enter" && goPage("bonsPlans")}
            style={{
              cursor: "pointer",
              fontWeight: 700,
              color: "var(--green)",
              textDecoration: "underline",
            }}
          >
            {t("payStrip.freeShippingFrom", { amount: freeShip })}
          </span>
          <span>🔐 {t("payStrip.escrowSecure")}</span>
          {user && <span style={{ color: "var(--gold)" }}>👤 {userData?.nom || user.email}</span>}
        </div>
      </div>
    </div>
  );
}
