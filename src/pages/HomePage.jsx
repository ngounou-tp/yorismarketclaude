// ═══════════════════════════════════════════════════════════════
//  YORIX CM — HOMEPAGE PREMIUM v3 (+ fusion : promo strip, wa mobile,
//  classe home-premium pour hovers ProdGrid, CSS externe + reduced-motion)
// ═══════════════════════════════════════════════════════════════

import { useCallback, useState, useEffect, useRef } from "react";
import { FlashCountdown } from "../components/FlashCountdown";
import { ProdGrid } from "../components/ProdGrid";
import { CITIES } from "../lib/constants";
import { HomePremiumMerch } from "../components/home/HomePremiumMerch";
import { HomeCategoryGrid } from "../components/categories/HomeCategoryGrid";
import { HomeTrendingProducts } from "../components/home/HomeTrendingProducts";
import { HomeBuyerSellerCta } from "../components/home/HomeBuyerSellerCta";
import { categoryLabel } from "../lib/marketplaceCategories";
import { SEO_CITIES } from "../lib/seoRoutes";
import { supabase, YORIX_WA_NUMBER } from "../lib/supabase";
import homePremiumCss from "./homePageV3Premium.css?raw";

const QUICK_LINKS = [
  { key: "produits", label: "Produits", icon: "🛍️", desc: "Catalogue vérifié", color: "#1a6b3a" },
  { key: "prestataires", label: "Services", icon: "🛠️", desc: "Pros & freelances", color: "#f59e0b" },
  { key: "livraison", label: "Livraison", icon: "🚚", desc: "Yorix Ride · suivi", color: "#0891b2" },
  { key: "business", label: "Business", icon: "💼", desc: "B2B & croissance", color: "#7c3aed" },
  { key: "academy", label: "Academy", icon: "🎓", desc: "Monter en compétence", color: "#dc2626" },
];

const ECOSYSTEM = [
  {
    key: "produits",
    icon: "🛍️",
    title: "Marketplace produits",
    desc: "Découverte fluide, panier universel, checkout sécurisé — comme les grandes marketplaces africaines.",
    wide: true,
  },
  {
    key: "prestataires",
    icon: "🛠️",
    title: "Services & talents",
    desc: "Réservez des pros vérifiés : beauté, tech, BTP… expérience marketplace de services.",
  },
  {
    key: "livraison",
    icon: "🚚",
    title: "Livraison & logistique",
    desc: "Suivi, zones prioritaires Douala · Yaoundé, objectifs clairs comme une app de delivery moderne.",
  },
  {
    key: "business",
    icon: "💼",
    title: "Yorix Business",
    desc: "Outils et crédibilité pour VSE, corners digitaux et partenaires B2B.",
  },
  {
    key: "academy",
    icon: "🎓",
    title: "Yorix Academy",
    desc: "Former vos équipes et vos clients aux bonnes pratiques e-commerce & logistique.",
  },
];

const WHY = [
  { icon: "🚀", title: "Vitesse & clarté", desc: "Moins de friction entre l'intention et le paiement — tunnel optimisé mobile." },
  { icon: "🌍", title: "Local first", desc: "Conçu au Cameroun pour les usages MoMo, WhatsApp et la logistique réelle." },
  { icon: "🎯", title: "Multi-canal", desc: "Achat catalogue, réservation pros, livraison, business & formation — tout-en-un." },
  { icon: "💬", title: "Humain accessible", desc: "Support WhatsApp 7j/7 quand il faut trancher vite." },
];

const KPIS = [
  { val: "10+", lbl: "Villes & hubs", color: "#1a6b3a", icon: "🏙️" },
  { val: "24/7", lbl: "Support WhatsApp", color: "#f59e0b", icon: "💬" },
  { val: "100%", lbl: "Mobile money ready", color: "#0891b2", icon: "📱" },
  { val: "5%", lbl: "Commission plateforme", color: "#7c3aed", icon: "💎" },
];

const TESTIMONIALS = [
  {
    quote: "Enfin une plateforme camerounaise qui ressemble aux géants — mais avec le sens du détail local.",
    author: "Acheteur vérifié",
    meta: "Douala · High-tech",
    avatar: "A",
    color: "#1a6b3a",
  },
  {
    quote: "Paiement MoMo fluide, escrow rassurant. Je recommande à mes clients de passer par Yorix.",
    author: "Vendeur pro",
    meta: "Mode & accessoires",
    avatar: "V",
    color: "#f59e0b",
  },
  {
    quote: "Les prestataires sont notés, la prise de contact est simple. Parfait pour nos urgences à Yaoundé.",
    author: "PME & services",
    meta: "Yaoundé",
    avatar: "P",
    color: "#7c3aed",
  },
];

const TRUST_BADGES = [
  { i: "🚚", t: "Livraison prioritaire" },
  { i: "📱", t: "Mobile money intégré" },
  { i: "🔐", t: "Escrow protection" },
  { i: "💬", t: "Support WhatsApp 7j/7" },
  { i: "🇨🇲", t: "100% Cameroun" },
];

const SEO_FAQS = [
  {
    q: "Quel site utiliser pour acheter en ligne au Cameroun ?",
    a: "Yorix.cm centralise produits, vendeurs, prestataires et livraison avec paiement MTN MoMo, Orange Money, cash ou carte selon les options disponibles.",
  },
  {
    q: "Comment commander rapidement sur Yorix.cm ?",
    a: "Recherchez un produit ou une ville, ajoutez au panier ou contactez le support WhatsApp express. L'objectif est de finaliser l'achat ou la demande en moins d'une minute.",
  },
  {
    q: "Comment vendre en ligne au Cameroun avec Yorix ?",
    a: "Créez un compte vendeur, publiez vos fiches avec photos, prix en FCFA et ville, puis suivez commandes, messages et paiements dans votre tableau de bord.",
  },
];

export function HomePage({
  siteLocale = "fr",
  filterCat = "",
  setFilterCat = () => {},
  search = "",
  setSearch = () => {},
  produitsLoading,
  produits = [],
  user,
  userData,
  wishlist = [],
  addToCart = () => {},
  toggleWish = () => {},
  openProductUrl = () => {},
  setOnboardingOpen = () => {},
  goPage = () => {},
  categoryTree = [],
  goToCategory = () => {},
  allServices = [],
  nlEmail = "",
  setNlEmail = () => {},
  nlSent,
  setNlSent = () => {},
  freeShippingThresholdXaf = 50000,
}) {
  const [quickCity, setQuickCity] = useState("");
  const safeProduits = Array.isArray(produits) ? produits : [];
  const safeServices = Array.isArray(allServices) ? allServices : [];

  const handleHeroSearch = useCallback(() => {
    const cityEntry = SEO_CITIES.find((c) => c.name === quickCity);
    if (cityEntry) {
      goPage("seoCity", { citySlug: cityEntry.slug, mode: "acheter" });
      return;
    }
    goPage("produits");
  }, [goPage, quickCity]);

  const th = Number(freeShippingThresholdXaf) || 50000;

  // ── Scroll-reveal : active tous les .yx-reveal de la page d'accueil
  const homeRef = useRef(null);
  useEffect(() => {
    const container = homeRef.current;
    if (!container) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      container.querySelectorAll(".yx-reveal").forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }),
      { threshold: 0.05, rootMargin: "60px 0px 0px 0px" }
    );
    const tid = setTimeout(() => {
      container.querySelectorAll(".yx-reveal").forEach((el) => io.observe(el));
    }, 50);
    return () => { clearTimeout(tid); io.disconnect(); };
  }, []);

  const submitNewsletter = async () => {
    const email = nlEmail?.trim();
    if (!email || !email.includes("@")) return;
    try {
      const { error } = await supabase.from("newsletter").insert({ email });
      if (error) console.warn(error.message);
    } catch (e) {
      console.warn(e?.message);
    }
    setNlSent(true);
  };

  return (
    <>
      <style>{homePremiumCss}</style>

      <div className="home-premium yorix-home-v3 anim" ref={homeRef}>
        <div className="yhm3-marquee" role="region" aria-label="Avantages Yorix">
          <div className="yhm3-marquee-track">
            {[...TRUST_BADGES, ...TRUST_BADGES].map((b, i) => (
              <span key={`${b.t}-${i}`} className="yhm3-marquee-item">
                <span aria-hidden>{b.i}</span> {b.t}
              </span>
            ))}
          </div>
        </div>

        <header className="yhm3-hero">
          <div className="yhm3-hero-inner">
            <div className="yhm3-hero-grid">
              <div>
                <span className="yhm3-eyebrow">
                  <span className="yhm3-eyebrow-dot" /> 🇨🇲 Super-app commerce · Cameroun
                </span>

                <h1 className="yhm3-h1">
                  Marketplace Cameroun
                  <br />
                  pour <em>acheter</em>, vendre
                  <br />
                  et livrer vite
                </h1>

                <p className="yhm3-sub">
                  Achat en ligne au Cameroun, livraison Douala & Yaoundé, prestataires locaux et paiement
                  <strong> MTN MoMo / Orange Money</strong> — un parcours rapide, mobile et rassurant.
                </p>

                <div className="yhm3-hero-ctas yx-reveal yx-reveal-d2">
                  <button type="button" className="yhm3-btn yhm3-btn--pri" onClick={() => setOnboardingOpen(true)}>
                    Acheter ou vendre
                  </button>
                  <button type="button" className="yhm3-btn yhm3-btn--sec" onClick={() => goPage("produits")}>
                    Voir le catalogue
                  </button>
                  <button
                    type="button"
                    className="yhm3-btn yhm3-btn--wa"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent("Bonjour Yorix ! Je veux commander rapidement.")}`,
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{flexShrink:0}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Commander via WhatsApp
                  </button>
                </div>

                <div className="yhm3-hero-trust yx-reveal yx-reveal-d3">
                  <div className="yhm3-trust-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--hm-yellow)" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Avis vérifiés
                  </div>
                  <div className="yhm3-trust-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Paiements sécurisés
                  </div>
                  <div className="yhm3-trust-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                    Vendeurs vérifiés
                  </div>
                  <div className="yhm3-trust-pill">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    MoMo &amp; Orange Money
                  </div>
                </div>

                <div className="yhm3-hero-stats">
                  <div>
                    <div className="yhm3-hero-stat-val">10+</div>
                    <div className="yhm3-hero-stat-lbl">Villes</div>
                  </div>
                  <div>
                    <div className="yhm3-hero-stat-val">24/7</div>
                    <div className="yhm3-hero-stat-lbl">Support</div>
                  </div>
                  <div>
                    <div className="yhm3-hero-stat-val">5%</div>
                    <div className="yhm3-hero-stat-lbl">Commission</div>
                  </div>
                  <div>
                    <div className="yhm3-hero-stat-val">5</div>
                    <div className="yhm3-hero-stat-lbl">Univers</div>
                  </div>
                </div>
              </div>

              <aside className="yhm3-search-panel" aria-label="Recherche rapide">
                <div className="yhm3-search-trust-bar">
                  <span className="yhm3-search-trust-dot" />
                  <span>Catalogue en ligne · mis à jour en temps réel</span>
                </div>
                <div className="yhm3-search-head">
                  <div className="yhm3-search-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--hm-green)" strokeWidth="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    Trouver en quelques secondes
                  </div>
                  <p className="yhm3-search-sub">Filtres synchronisés avec le catalogue live.</p>
                </div>

                <div className="yhm3-search-row">
                  <select
                    className="yhm3-search-select"
                    value={filterCat}
                    onChange={(e) => setFilterCat(e.target.value)}
                    aria-label="Catégorie"
                  >
                    <option value="">Toutes catégories</option>
                    {categoryTree.map((r) => (
                      <option key={r.id || r.slug} value={categoryLabel(r, siteLocale)}>
                        {categoryLabel(r, siteLocale)}
                      </option>
                    ))}
                  </select>
                  <input
                    className="yhm3-search-input"
                    placeholder="Produit, marque, mot-clé…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Recherche"
                  />
                </div>

                <div className="yhm3-search-row">
                  <select
                    className="yhm3-search-select"
                    value={quickCity}
                    onChange={(e) => setQuickCity(e.target.value)}
                    aria-label="Ville"
                  >
                    <option value="">Toutes les villes</option>
                    {CITIES.filter((c) => !/^toutes/i.test(c)).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    className="yhm3-search-input"
                    placeholder="Budget max (FCFA)"
                    readOnly
                    tabIndex={-1}
                    style={{ opacity: 0.65 }}
                  />
                </div>

                <button type="button" className="yhm3-search-cta" onClick={handleHeroSearch}>
                  🔍 Lancer la recherche
                </button>

                <div className="yhm3-search-trends">
                  <span className="yhm3-search-trends-lbl">Tendances</span>
                  {["Pagne wax", "iPhone", "Karité", "BTP"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="yhm3-search-tag"
                      onClick={() => {
                        setSearch(s);
                        goPage("produits");
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="yhm3-search-perks">
                  <div className="yhm3-perk-item">
                    <div className="yhm3-perk-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                    </div>
                    <div>
                      Livraison offerte dès{" "}
                      <strong>{th.toLocaleString("fr-FR")} FCFA</strong>
                      {" · "}
                      <button type="button" onClick={() => goPage("bonsPlans")}>
                        Détails
                      </button>
                    </div>
                  </div>
                  <div className="yhm3-perk-item">
                    <div className="yhm3-perk-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    </div>
                    <div>Paiement MTN MoMo &amp; Orange Money accepté</div>
                  </div>
                  <div className="yhm3-perk-item">
                    <div className="yhm3-perk-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div>Escrow protection · paiement à la livraison</div>
                  </div>
                  <div className="yhm3-perk-item">
                    <div className="yhm3-perk-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    </div>
                    <div>Support WhatsApp 7j/7 · réponse rapide</div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </header>

        {categoryTree.length > 0 && (
          <HomeCategoryGrid
            tree={categoryTree}
            locale={siteLocale}
            onCategoryClick={(v) => goToCategory?.(v)}
          />
        )}

        <HomeBuyerSellerCta
          locale={siteLocale}
          onBrowse={() => goPage("produits")}
          onSell={() => goPage("devenirVendeur")}
        />

        <HomePremiumMerch goPage={goPage} produits={safeProduits} locale={siteLocale} />

        <HomeTrendingProducts
          produits={safeProduits}
          locale={siteLocale}
          loading={produitsLoading}
          user={user}
          userData={userData}
          addToCart={addToCart}
          toggleWish={toggleWish}
          wishlist={wishlist}
          openProductUrl={openProductUrl}
          onSeeAll={() => goPage("merchHub", { merchHub: "produits-tendance" })}
        />

        <section className="yhm3-section">
          <div className="yhm3-section-head yhm3-section-head--center yx-reveal">
            <span className="yhm3-eyebrow-light">Accès rapides</span>
            <h2 className="yhm3-h2 yhm3-h2--center">
              Tout ce dont vous avez <em>besoin</em>
            </h2>
            <p className="yhm3-lead yhm3-lead--center">
              5 univers pour acheter, vendre, livrer, apprendre et faire grandir votre activité au Cameroun.
            </p>
          </div>

          <div className="yhm3-cats-grid">
            {QUICK_LINKS.map((l, i) => (
              <button
                key={l.key}
                type="button"
                className={`yhm3-cat-card yx-reveal yx-reveal-d${Math.min(i + 1, 4)}`}
                style={{ "--cat-color": l.color }}
                onClick={() => goPage(l.key)}
              >
                <div className="yhm3-cat-icon">{l.icon}</div>
                <div className="yhm3-cat-label">{l.label}</div>
                <div className="yhm3-cat-desc">{l.desc}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="yhm3-section--tinted">
          <div className="yhm3-section-head yhm3-section-head--center">
            <span className="yhm3-eyebrow-light">Statistiques Yorix</span>
            <h2 className="yhm3-h2 yhm3-h2--center">
              La plateforme commerce du <em>Cameroun</em>
            </h2>
            <p className="yhm3-lead yhm3-lead--center">
              Une infrastructure pensée pour la réalité locale et les ambitions internationales.
            </p>
          </div>

          <div className="yhm3-kpis">
            {KPIS.map((k) => (
              <article key={k.lbl} className="yhm3-kpi" style={{ "--kpi-color": k.color }}>
                <div className="yhm3-kpi-icon">{k.icon}</div>
                <div className="yhm3-kpi-val">{k.val}</div>
                <div className="yhm3-kpi-lbl">{k.lbl}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="yhm3-section">
          <div className="yhm3-flash-toolbar">
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="yhm3-flash-pill">⚡ Temps limité</span>
              <h2 className="yhm3-h2" style={{ marginBottom: 0, fontSize: "1.5rem" }}>
                Offres flash du <em>jour</em>
              </h2>
            </div>
            <div className="yhm3-flash-end">
              <span>Fin dans</span>
              <FlashCountdown />
            </div>
          </div>

          <div className="yhm3-flash-banner">
            <div className="yhm3-flash-banner-left">
              <div className="yhm3-flash-title">⚡ Sélection éclair · high-tech & lifestyle</div>
              <div className="yhm3-flash-sub">Paiement MoMo / Orange · stocks limités selon vendeurs partenaires</div>
            </div>
            <button
              type="button"
              className="yhm3-btn yhm3-btn--green"
              onClick={() => {
                setFilterCat("Téléphones & HighTech");
                goPage("produits");
              }}
            >
              Voir les promos →
            </button>
          </div>

          {!produitsLoading && safeProduits.length > 0 && (
            <ProdGrid
              prods={safeProduits.slice(0, 4).map((p, i) => ({
                ...p,
                flash: i < 2,
                promo: i >= 2 && i < 4,
                promo_pct: i === 2 ? 20 : i === 3 ? 15 : 0,
              }))}
              user={user}
              userData={userData}
              onAddToCart={addToCart}
              onWish={toggleWish}
              wishlist={wishlist}
              onOpenProductUrl={openProductUrl}
            />
          )}
        </section>

        <section className="yhm3-section">
          <div className="yhm3-section-head">
            <div>
              <span className="yhm3-eyebrow-light">Catalogue</span>
              <h2 className="yhm3-h2">
                Produits du <em>moment</em>
              </h2>
              <p className="yhm3-lead">Une sélection mise à jour quotidiennement par nos vendeurs.</p>
            </div>
            <button type="button" className="yhm3-section-link" onClick={() => goPage("produits")}>
              Tout voir <span>→</span>
            </button>
          </div>

          {produitsLoading ? (
            <div className="yhm3-loading">
              <div className="yhm3-spinner" />
              Chargement du marché…
            </div>
          ) : safeProduits.length === 0 ? (
            <div className="yhm3-empty">
              <div className="yhm3-empty-ico">🛍️</div>
              <p>Le catalogue se remplit — revenez très vite.</p>
            </div>
          ) : (
            <ProdGrid
              prods={safeProduits.slice(0, 10)}
              user={user}
              userData={userData}
              onAddToCart={addToCart}
              onWish={toggleWish}
              wishlist={wishlist}
              onOpenProductUrl={openProductUrl}
            />
          )}
        </section>

        <section className="yhm3-section--tinted">
          <div className="yhm3-section-head yhm3-section-head--center">
            <span className="yhm3-eyebrow-light">Écosystème Yorix</span>
            <h2 className="yhm3-h2 yhm3-h2--center">
              Une plateforme, tous vos <em>flux de revenus</em>
            </h2>
            <p className="yhm3-lead yhm3-lead--center">
              Inspiré des leaders mondiaux — adapté au réel du Cameroun francophone.
            </p>
          </div>

          <div className="yhm3-bento">
            {ECOSYSTEM.map((e, i) => (
              <article
                key={e.key}
                className={`yhm3-bento-card${e.wide ? " yhm3-bento-card--wide" : ""} yx-reveal yx-reveal-d${Math.min(i + 1, 4)}`}
                onClick={() => goPage(e.key)}
                role="link"
                tabIndex={0}
                onKeyDown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    ev.preventDefault();
                    goPage(e.key);
                  }
                }}
              >
                <div className="yhm3-bento-icon">{e.icon}</div>
                <h3>{e.title}</h3>
                <p>{e.desc}</p>
                <span className="yhm3-bento-link">
                  Explorer <span>→</span>
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="yhm3-section">
          <div className="yhm3-section-head yhm3-section-head--center">
            <span className="yhm3-eyebrow-light">Différenciation Yorix</span>
            <h2 className="yhm3-h2 yhm3-h2--center">
              Une expérience premium, <em>pensée conversion</em>
            </h2>
            <p className="yhm3-lead yhm3-lead--center">
              Clarté des prix · Parcours mobile irréprochable · Réassurance à chaque étape.
            </p>
          </div>

          <div className="yhm3-why-grid">
            {WHY.map((w, i) => (
              <article key={w.title} className={`yhm3-why-card yx-reveal yx-reveal-d${Math.min(i + 1, 4)}`}>
                <div className="yhm3-why-icon">{w.icon}</div>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="yhm3-section--tinted" aria-labelledby="seo-faq-title">
          <div className="yhm3-section-head yhm3-section-head--center">
            <span className="yhm3-eyebrow-light">Questions fréquentes</span>
            <h2 id="seo-faq-title" className="yhm3-h2 yhm3-h2--center">
              Réponses rapides avant de <em>commander</em>
            </h2>
            <p className="yhm3-lead yhm3-lead--center">
              Des réponses courtes pour rassurer les visiteurs venus de Google et accélérer la conversion.
            </p>
          </div>

          <div style={{ maxWidth: 860, margin: "0 auto", display: "grid", gap: 12 }}>
            {SEO_FAQS.map((item) => (
              <details
                key={item.q}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "14px 16px",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 800, color: "var(--ink)" }}>{item.q}</summary>
                <p style={{ color: "var(--gray)", fontSize: ".9rem", lineHeight: 1.7, marginTop: 10 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="yhm3-section">
          <div className="yhm3-section-head yhm3-section-head--center">
            <span className="yhm3-eyebrow-light">Témoignages</span>
            <h2 className="yhm3-h2 yhm3-h2--center">
              Ils <em>nous font confiance</em>
            </h2>
            <p className="yhm3-lead yhm3-lead--center">
              Acheteurs, vendeurs, professionnels — la communauté Yorix grandit chaque jour.
            </p>
          </div>

          <div className="yhm3-stories">
            {TESTIMONIALS.map((t, i) => (
              <figure key={t.author} className={`yhm3-story yx-reveal yx-reveal-d${Math.min(i + 1, 4)}`} style={{ "--story-color": t.color }}>
                <blockquote className="yhm3-story-quote">&ldquo;{t.quote}&rdquo;</blockquote>
                <figcaption className="yhm3-story-foot">
                  <div className="yhm3-story-av">{t.avatar}</div>
                  <div>
                    <div className="yhm3-story-name">{t.author}</div>
                    <div className="yhm3-story-meta">{t.meta}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="yhm3-section">
          <div className="yhm3-section-head">
            <div>
              <span className="yhm3-eyebrow-light">Prestataires</span>
              <h2 className="yhm3-h2">
                Prestataires <em>sélectionnés</em>
              </h2>
              <p className="yhm3-lead">Des talents camerounais vérifiés pour vos besoins du quotidien.</p>
            </div>
            <button type="button" className="yhm3-section-link" onClick={() => goPage("prestataires")}>
              Marketplace services <span>→</span>
            </button>
          </div>

          <div className="yhm3-prest-grid">
            {safeServices.length === 0 ? (
              <div className="yhm3-empty" style={{ gridColumn: "1/-1" }}>
                <div className="yhm3-empty-ico">🛠️</div>
                <p>Les talents arrivent — explorez bientôt la vitrine services.</p>
              </div>
            ) : (
              safeServices.slice(0, 3).map((s) => (
                <article key={s.id} className="yhm3-prest-card">
                  <div className="yhm3-prest-top">
                    <div className="yhm3-prest-av">🧑‍💼</div>
                    <div>
                      <div className="yhm3-prest-name">{s.provider_nom || "Prestataire"}</div>
                      <div className="yhm3-prest-meta">{s.nom}</div>
                    </div>
                  </div>
                  <div className="yhm3-prest-tags">
                    {s.categorie && <span className="yhm3-ptag">{s.categorie}</span>}
                    {s.ville && <span className="yhm3-ptag">📍 {s.ville}</span>}
                  </div>
                  <div className="yhm3-prest-foot">
                    <div>
                      <div className="yhm3-prest-price">{Number(s.prix).toLocaleString()} F</div>
                      <div className="yhm3-prest-note">
                        ⭐ {s.note || 0} · {s.nombre_avis || 0} avis
                      </div>
                    </div>
                    <button
                      type="button"
                      className="yhm3-btn-hire"
                      onClick={() =>
                        window.open(
                          `https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent(
                            `Bonjour Yorix ! Projet : ${s.nom} (${s.provider_nom})`,
                          )}`,
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      Contacter
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="yhm3-section">
          <div className="yhm3-nl">
            <div className="yhm3-nl-left">
              <span className="yhm3-eyebrow">
                <span className="yhm3-eyebrow-dot" /> Newsletter Yorix
              </span>
              <h2 className="yhm3-h2 yhm3-h2--on-dark">
                Restez dans la <em>momentum Yorix</em>
              </h2>
              <p className="yhm3-sub" style={{ color: "rgba(255,255,255,.78)" }}>
                Alertes bons plans, nouveaux hubs villes et masterclass Academy —
                <strong style={{ color: "#fff" }}> sans spam</strong>.
              </p>
              <ul className="yhm3-nl-perks">
                <li>
                  <span aria-hidden>🎁</span> Bons plans exclusifs
                </li>
                <li>
                  <span aria-hidden>📍</span> Nouveaux hubs villes
                </li>
                <li>
                  <span aria-hidden>🎓</span> Masterclass Academy
                </li>
              </ul>
            </div>

            <form
              className="yhm3-nl-form"
              onSubmit={(e) => {
                e.preventDefault();
                submitNewsletter();
              }}
              noValidate
            >
              {nlSent ? (
                <div className="yhm3-nl-success">🎉 Merci ! Vous êtes inscrit(e).</div>
              ) : (
                <>
                  <label htmlFor="yhm3-nl-email" className="yhm3-nl-lbl">
                    VOTRE MEILLEUR EMAIL
                  </label>
                  <div className="yhm3-nl-row">
                    <input
                      id="yhm3-nl-email"
                      type="email"
                      className="yhm3-nl-inp"
                      placeholder="vous@email.cm"
                      value={nlEmail}
                      onChange={(e) => setNlEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                    <button type="submit" className="yhm3-btn yhm3-btn--pri">
                      Rejoindre 🚀
                    </button>
                  </div>
                  <p className="yhm3-nl-note">🔒 RGPD · désinscription en un clic depuis chaque envoi.</p>
                </>
              )}
            </form>
          </div>
        </section>

        <section className="yhm3-section">
          <div className="yhm3-final">
            <div className="yhm3-final-inner">
              <span className="yhm3-eyebrow">
                <span className="yhm3-eyebrow-dot" /> Prêt à commencer ?
              </span>
              <h2 className="yhm3-h2 yhm3-h2--on-dark">
                Rejoignez la marketplace
                <br />
                du <em>Cameroun moderne</em>
              </h2>
              <p className="yhm3-sub" style={{ color: "rgba(255,255,255,.78)" }}>
                <strong style={{ color: "#fff" }}>Inscription gratuite</strong> · paiement MoMo & Orange Money · support
                WhatsApp 7j/7. Commencez à acheter, vendre ou prester en moins de 30 secondes.
              </p>

              <div className="yhm3-final-actions">
                <button type="button" className="yhm3-btn yhm3-btn--pri" onClick={() => setOnboardingOpen(true)}>
                  🚀 Démarrer maintenant
                </button>
                <button type="button" className="yhm3-btn yhm3-btn--sec" onClick={() => goPage("aide")}>
                  🆘 Centre d&apos;aide
                </button>
              </div>

              <ul className="yhm3-final-trust">
                <li>
                  <span aria-hidden>🇨🇲</span> 100% Cameroun
                </li>
                <li>
                  <span aria-hidden>🔐</span> Escrow inclus
                </li>
                <li>
                  <span aria-hidden>📱</span> Mobile money
                </li>
                <li>
                  <span aria-hidden>⚡</span> 30s d&apos;inscription
                </li>
              </ul>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
