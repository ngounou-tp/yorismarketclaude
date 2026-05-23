/**
 * Yorix.cm — Routage SEO + préfixes linguistiques /fr | /en
 * Une seule source de vérité pour paths marketing / Google.
 */

import { resolveSeoLandingFromPath, SEO_URL_ALIASES, slugHreflangTwin } from "./seoProgrammatic.js";
import { MERCH_HUB_SLUGS, MERCH_HUBS } from "./merchHubs.js";
import { ROOT_CATEGORY_SLUGS, CATEGORY_TAXONOMY } from "../data/categoryTaxonomy.js";

const DEFAULT_SITE_URL = "https://www.yorix.cm";

/** URL publique du site (canonical, OG). Surcharge : `VITE_PUBLIC_SITE_URL`. */
export const SITE_URL = (() => {
  try {
    const raw = import.meta.env.VITE_PUBLIC_SITE_URL;
    const s = String(raw || "").trim().replace(/\/$/, "");
    return s || DEFAULT_SITE_URL;
  } catch {
    return DEFAULT_SITE_URL;
  }
})();

/** @typedef {"fr"|"en"} SiteLocale */
export const SITE_LOCALES = /** @type {const} */ ["fr", "en"];
export const DEFAULT_SITE_LOCALE = /** @type {SiteLocale} */ ("fr");

/** Villes Cameroun — slug ASCII → libellé affiché */
export const SEO_CITIES = [
  { slug: "yaounde", name: "Yaoundé", region: "Centre" },
  { slug: "douala", name: "Douala", region: "Littoral" },
  { slug: "bafoussam", name: "Bafoussam", region: "Ouest" },
  { slug: "bamenda", name: "Bamenda", region: "Nord-Ouest" },
  { slug: "kribi", name: "Kribi", region: "Sud" },
  { slug: "bertoua", name: "Bertoua", region: "Est" },
  { slug: "garoua", name: "Garoua", region: "Nord" },
  { slug: "ngaoundere", name: "Ngaoundéré", region: "Adamaoua" },
  { slug: "maroua", name: "Maroua", region: "Extrême-Nord" },
  { slug: "ebolowa", name: "Ebolowa", region: "Sud" },
];

export const CITY_BY_SLUG = Object.fromEntries(SEO_CITIES.map((c) => [c.slug, c]));

export const NAME_TO_CITY_SLUG = Object.fromEntries(
  SEO_CITIES.map((c) => [c.name.toLowerCase(), c.slug]),
);

/** Métier (slug URL) → catégorie PrestPage / filtres */
export const METIER_SLUG_TO_CATEGORY = {
  plomberie: "Plomberie",
  electricite: "Électricité",
  menage: "Nettoyage",
  beaute: "Beauté",
  reparation: "Réparation",
  transport: "Transport",
  graphisme: "Graphisme",
  photographie: "Photographie",
  nettoyage: "Nettoyage",
  menuiserie: "Menuiserie",
  informatique: "Informatique",
  cuisine: "Cuisine",
  maconnerie: "Maçonnerie",
  peinture: "Peinture",
  couture: "Couture",
};

/** Slugs historiques → libellé actuel dans CATS */
export const CATEGORY_SLUG_LEGACY = {
  "mode-accesoires": "Mode & Accessoires",
};

/** @param {string} pathname */
export function parseLocaleSegments(pathname) {
  const raw = (pathname || "").replace(/\/+$/, "") || "/";
  const parts = raw.split("/").filter(Boolean);
  const first = parts[0]?.toLowerCase();
  if (first === "fr" || first === "en") {
    const locale = /** @type {SiteLocale} */ (first);
    const rest = "/" + parts.slice(1).join("/");
    const barePath = rest === "//" ? "/" : rest.replace(/\/+$/, "") || "/";
    return { locale, barePath, hasLocalePrefix: true };
  }
  return { locale: DEFAULT_SITE_LOCALE, barePath: raw, hasLocalePrefix: false };
}

/**
 * @param {SiteLocale} locale
 * @param {string} bare — chemin sans langue ; "/" pour accueil
 */
export function localePath(locale, bare) {
  const loc = SITE_LOCALES.includes(locale) ? locale : DEFAULT_SITE_LOCALE;
  if (!bare || bare === "/") return `/${loc}`;
  const b = bare.startsWith("/") ? bare : `/${bare}`;
  return `/${loc}${b}`;
}

/** Préfixe inverse pour passer de /fr/... ↔ /en/... (sans symétrie slug miroir) */
export function swapLocalePrefix(pathname, targetLocale = DEFAULT_SITE_LOCALE) {
  const { barePath } = parseLocaleSegments(pathname);
  return localePath(targetLocale, barePath);
}

export function categoryToSlug(cat) {
  return slugify(cat || "");
}

export function slugify(str) {
  if (!str) return "yorix";
  const s = String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return (s || "yorix").slice(0, 80);
}

export function buildEntitySlug(name, id) {
  const base = slugify(name);
  return `${base}--${id}`;
}

export function parseEntitySlug(segment) {
  if (!segment || typeof segment !== "string") return { base: "", id: "" };
  const idx = segment.lastIndexOf("--");
  if (idx === -1) return { base: segment, id: "" };
  return { base: segment.slice(0, idx), id: segment.slice(idx + 2) };
}

/** Pages internes → chemin canonique SANS préfixe /fr | /en */
export const PAGE_PATH = {
  home: "/",
  produits: "/produits",
  livraison: "/livraison",
  escrow: "/escrow",
  prestataires: "/prestataires",
  inscription: "/devenir-prestataire",
  business: "/business",
  academy: "/academy",
  blog: "/blog",
  loyalty: "/fidelite",
  contact: "/contact",
  aide: "/aide",
  faq: "/faq",
  cgv: "/cgv",
  mentions: "/mentions-legales",
  confidentialite: "/politique-confidentialite",
  dashboard: "/dashboard",
  admin: "/admin",
  checkout: "/checkout",
  cart: "/panier",
  bonsPlans: "/bons-plans",
  notifications: "/notifications",
  devenirVendeur: "/devenir-vendeur",
  devenirLivreur: "/devenir-livreur",
};

/** Navigation interne : chemins relatifs avec préfixe langue */
export function pathForPage(page, opts = {}) {
  const locale = opts.locale === "en" || opts.locale === "fr" ? opts.locale : DEFAULT_SITE_LOCALE;
  const innerOpts = { ...opts };
  delete innerOpts.locale;
  return localePath(locale, pathForPageBare(page, innerOpts));
}

/** @param {SiteLocale|string} locale */
export function pathForPageWithLocale(locale, page, opts = {}) {
  return pathForPage(page, { ...opts, locale });
}

/** Chemin métier sans /fr | /en (router redirect + parsers) */
export function pathForPageBare(page, opts = {}) {
  if (page === "blog" && opts.blogSlug && /^[a-z0-9-]{1,80}$/.test(opts.blogSlug)) {
    return `/blog/${opts.blogSlug}`;
  }
  if (page === "productDetail" && opts.productSlug) {
    return `/produit/${opts.productSlug}`;
  }
  if (page === "prestDetail" && opts.prestSlug) {
    return `/prestataire/${opts.prestSlug}`;
  }
  if (page === "merchHub" && opts.merchHub && MERCH_HUBS[opts.merchHub]) {
    return `/${opts.merchHub}`;
  }
  if (page === "produits" && opts.categorySlug) {
    if (opts.subCategorySlug) {
      return `/categories/${opts.categorySlug}/${opts.subCategorySlug}`;
    }
    if (ROOT_CATEGORY_SLUGS.includes(opts.categorySlug)) {
      return `/${opts.categorySlug}`;
    }
    return `/categories/${opts.categorySlug}`;
  }
  if (page === "livraison" && opts.citySlug && CITY_BY_SLUG[opts.citySlug]) {
    return `/livraison/${opts.citySlug}`;
  }
  if (page === "prestataires" && opts.metierSlug && opts.villeSlug) {
    return `/prestataires/${opts.metierSlug}/${opts.villeSlug}`;
  }
  if (page === "seoCity") {
    const { citySlug, mode = "hub" } = opts;
    if (!citySlug || !CITY_BY_SLUG[citySlug]) return "/";
    if (mode === "acheter") return `/acheter-a-${citySlug}`;
    if (mode === "livraison") return `/livraison-a-${citySlug}`;
    if (mode === "prestataires") return `/prestataires-a-${citySlug}`;
    return `/${citySlug}`;
  }
  if (page === "academyDetail" && opts.courseId) {
    return `/academy/${opts.courseId}`;
  }
  if (page === "academyContact" && opts.courseId) {
    return `/academy/${opts.courseId}/contact`;
  }
  return PAGE_PATH[page] ?? "/";
}

/** @param {(typeof SEO_URL_ALIASES)[string]} alias */
export function canonicalFromSeoAlias(alias) {
  if (!alias?.pathBare) return "/";
  const lang =
    alias.lang === "fr" || alias.lang === "en"
      ? /** @type {SiteLocale} */ (alias.lang)
      : DEFAULT_SITE_LOCALE;
  return localePath(lang, alias.pathBare);
}

export function slugToCategoryName(slug, categories = []) {
  if (!slug) return "";
  const fromTax = categoryNameFromTaxonomySlug(slug);
  if (fromTax) return fromTax;
  const legacyName = CATEGORY_SLUG_LEGACY[slug];
  if (legacyName && categories.includes(legacyName)) return legacyName;
  const hit = categories.find((c) => categoryToSlug(c) === slug);
  return hit || "";
}

/** Libellé FR depuis slug racine ou enfant (taxonomie statique). */
export function categoryNameFromTaxonomySlug(slug, parentSlug = null) {
  if (!slug) return "";
  if (parentSlug) {
    const parent = CATEGORY_TAXONOMY.find((p) => p.slug === parentSlug);
    const child = parent?.children?.find((c) => c.slug === slug);
    return child?.name_fr || "";
  }
  const root = CATEGORY_TAXONOMY.find((p) => p.slug === slug);
  if (root) return root.name_fr;
  for (const p of CATEGORY_TAXONOMY) {
    const ch = p.children?.find((c) => c.slug === slug);
    if (ch) return ch.name_fr;
  }
  return "";
}

/**
 * Bare pathname → état (canonicalPathBare sans /fr | /en)
 * @returns {Record<string, unknown>}
 */
export function parsePathnameBare(rawIn) {
  const raw = rawIn.replace(/\/+$/, "") || "/";

  const parts = raw.split("/").filter(Boolean);
  const [a, b, c] = parts;

  if (raw === "/" || raw === "") {
    return { page: "home", canonicalPathBare: "/" };
  }

  if (a === "blog") {
    if (b && /^[a-z0-9-]{1,80}$/.test(b)) {
      return { page: "blog", blogSlug: b, canonicalPathBare: raw, seoAliasKey: null };
    }
    return { page: "blog", canonicalPathBare: "/blog", seoAliasKey: null };
  }

  if (parts.length === 1 && MERCH_HUB_SLUGS.includes(a)) {
    return {
      page: "merchHub",
      merchHub: a,
      categorySlug: MERCH_HUBS[a]?.categorySlug || a,
      canonicalPathBare: raw,
      seoAliasKey: null,
    };
  }

  if (parts.length === 1) {
    const landing = resolveSeoLandingFromPath(a);
    if (landing) {
      if (landing.page === "seoCity" && landing.citySlug && CITY_BY_SLUG[landing.citySlug]) {
        return {
          page: "seoCity",
          citySlug: landing.citySlug,
          cityMode: landing.cityMode || "acheter",
          canonicalPathBare: landing.pathBare,
          seoAliasKey: String(a),
        };
      }
      if (landing.page === "home") {
        return { page: "home", canonicalPathBare: landing.pathBare, seoAliasKey: String(a) };
      }
      if (landing.page === "produits") {
        return { page: "produits", canonicalPathBare: landing.pathBare, seoAliasKey: String(a) };
      }
      if (landing.page === "livraison") {
        return { page: "livraison", canonicalPathBare: landing.pathBare, seoAliasKey: String(a) };
      }
      const pg = landing.page;
      if (PAGE_PATH[pg]) {
        return { page: pg, canonicalPathBare: landing.pathBare, seoAliasKey: String(a) };
      }
    }
  }

  if (a === "produit" && b) {
    return { page: "productDetail", productSlug: b, canonicalPathBare: raw };
  }
  if (a === "categories" && b) {
    if (c && /^[a-z0-9-]{1,80}$/.test(c)) {
      return {
        page: "produits",
        categorySlug: b,
        subCategorySlug: c,
        canonicalPathBare: raw,
      };
    }
    return { page: "produits", categorySlug: b, canonicalPathBare: raw };
  }

  if (parts.length === 1 && ROOT_CATEGORY_SLUGS.includes(a)) {
    return {
      page: "produits",
      categorySlug: a,
      canonicalPathBare: raw,
    };
  }

  if (parts.length === 2 && ROOT_CATEGORY_SLUGS.includes(a) && /^[a-z0-9-]{1,80}$/.test(b)) {
    return {
      page: "produits",
      categorySlug: a,
      subCategorySlug: b,
      canonicalPathBare: raw,
    };
  }
  if (a === "livraison") {
    if (!b) return { page: "livraison", canonicalPathBare: "/livraison" };
    if (CITY_BY_SLUG[b]) {
      return { page: "livraison", citySlug: b, canonicalPathBare: raw };
    }
    return { page: "livraison", canonicalPathBare: "/livraison" };
  }
  if (a === "prestataire" && b) {
    return { page: "prestDetail", prestSlug: b, canonicalPathBare: raw };
  }
  if (a === "prestataires" && b && c) {
    if (METIER_SLUG_TO_CATEGORY[b] && CITY_BY_SLUG[c]) {
      return {
        page: "prestataires",
        metierSlug: b,
        villeSlug: c,
        canonicalPathBare: raw,
      };
    }
  }
  if (a === "prestataires") {
    return { page: "prestataires", canonicalPathBare: "/prestataires" };
  }

  if (a === "academy" && b) {
    if (c === "contact") {
      return { page: "academyContact", courseId: b, canonicalPathBare: raw };
    }
    return { page: "academyDetail", courseId: b, canonicalPathBare: raw };
  }

  const hubMatch = CITY_BY_SLUG[a];
  if (parts.length === 1 && hubMatch) {
    return { page: "seoCity", citySlug: a, cityMode: "hub", canonicalPathBare: raw };
  }

  if (a?.startsWith("acheter-a-")) {
    const slugCity = a.replace(/^acheter-a-/, "");
    if (CITY_BY_SLUG[slugCity]) {
      return {
        page: "seoCity",
        citySlug: slugCity,
        cityMode: "acheter",
        canonicalPathBare: raw,
      };
    }
  }
  if (a?.startsWith("livraison-a-")) {
    const slugCity = a.replace(/^livraison-a-/, "");
    if (CITY_BY_SLUG[slugCity]) {
      return {
        page: "seoCity",
        citySlug: slugCity,
        cityMode: "livraison",
        canonicalPathBare: raw,
      };
    }
  }
  if (a?.startsWith("prestataires-a-")) {
    const slugCity = a.replace(/^prestataires-a-/, "");
    if (CITY_BY_SLUG[slugCity]) {
      return {
        page: "seoCity",
        citySlug: slugCity,
        cityMode: "prestataires",
        canonicalPathBare: raw,
      };
    }
  }

  const staticMap = {
    produits: "produits",
    livraison: "livraison",
    escrow: "escrow",
    prestataires: "prestataires",
    business: "business",
    academy: "academy",
    blog: "blog",
    fidelite: "loyalty",
    contact: "contact",
    aide: "aide",
    faq: "faq",
    cgv: "cgv",
    mentions: "mentions",
    "mentions-legales": "mentions",
    confidentialite: "confidentialite",
    "politique-confidentialite": "confidentialite",
    dashboard: "dashboard",
    admin: "admin",
    checkout: "checkout",
    panier: "cart",
    cart: "cart",
    "bons-plans": "bonsPlans",
    notifications: "notifications",
    "devenir-vendeur": "devenirVendeur",
    "devenir-livreur": "devenirLivreur",
    "devenir-prestataire": "inscription",
    inscription: "inscription",
  };

  if (parts.length === 1 && staticMap[a]) {
    const pg = staticMap[a];
    return {
      page: pg,
      canonicalPathBare: PAGE_PATH[pg] ?? `/${a}`,
      seoAliasKey: null,
    };
  }

  return { page: "home", canonicalPathBare: "/" };
}

/**
 * pathname complet → état + canonical URL avec préfixe langue attendu
 */
export function parsePathname(pathname) {
  const seg = parseLocaleSegments(pathname);
  const inner = parsePathnameBare(seg.barePath);
  /** @type {SiteLocale} */
  const urlLocale =
    seg.locale === "fr" || seg.locale === "en"
      ? /** @type {SiteLocale} */ (seg.locale)
      : DEFAULT_SITE_LOCALE;

  const alias =
    typeof inner.seoAliasKey === "string" && SEO_URL_ALIASES[inner.seoAliasKey]
      ? SEO_URL_ALIASES[inner.seoAliasKey]
      : null;

  const authorityLocale =
    alias && (alias.lang === "fr" || alias.lang === "en")
      ? /** @type {SiteLocale} */ (alias.lang)
      : urlLocale;

  const canonicalPath = localePath(authorityLocale, inner.canonicalPathBare);

  /** Rediriger si l’alias est défini dans une langue différente du segment URL */
  const localeRewriteTo =
    alias && (alias.lang === "fr" || alias.lang === "en") && urlLocale !== alias.lang
      ? canonicalFromSeoAlias(alias)
      : null;

  return {
    ...inner,
    locale: urlLocale,
    canonicalPath,
    localeRewriteTo,
    seoAliasCanonicalLocale: alias ? authorityLocale : null,
    hasLocalePrefix: seg.hasLocalePrefix,
  };
}

/** Schema.org SearchAction URL absolue */
export function getSearchActionUrl(locale = DEFAULT_SITE_LOCALE) {
  return `${SITE_URL}${localePath(locale, "/produits")}`;
}

/**
 * Pour hreflang / switch UI : équivalent slug miroir (hubs FR↔EN) ou simple permutation /fr ↔ /en
 * @returns {string} chemin complet /fr|/en...
 */
export function alternateLocaleFullPath(currentPathname) {
  const seg = parseLocaleSegments(currentPathname);
  const urlLocale =
    seg.locale === "fr" || seg.locale === "en"
      ? /** @type {SiteLocale} */ (seg.locale)
      : DEFAULT_SITE_LOCALE;
  const other = urlLocale === "fr" ? "en" : "fr";
  const bare = seg.barePath.startsWith("/") ? seg.barePath : `/${seg.barePath}`;
  const parts = bare.split("/").filter(Boolean);
  if (parts.length === 1 && slugHreflangTwin(parts[0])) {
    const twin = /** @type {string} */ (slugHreflangTwin(parts[0]));
    return localePath(other, `/${twin}`);
  }
  return localePath(other, bare === "" ? "/" : bare);
}

/**
 * Garantit /fr ou /en en tête pour liens legacy (notifications, SW).
 */
export function ensureLocalePath(pathname, locale = DEFAULT_SITE_LOCALE) {
  const pRaw = pathname && pathname.startsWith("/") ? pathname : `/${pathname || ""}`;
  if (/^\/(fr|en)(\/|$)/.test(pRaw)) {
    return pRaw.replace(/\/+$/, "") || "/";
  }
  const norm = String(pathname || "/").replace(/\/+$/, "") || "/";
  return localePath(locale, norm === "/" ? "/" : norm);
}

/**
 * URLs absolues pour hreflang (slug miroir quand défini dans SEO_URL_ALIASES)
 * @returns {{ hrefLang: string, href: string }[]}
 */
export function buildHrefLangAlternates(pathname) {
  const base = SITE_URL.replace(/\/$/, "");
  const seg = parseLocaleSegments(pathname.startsWith("/") ? pathname : `/${pathname}`);
  const bareRaw = seg.barePath.startsWith("/") ? seg.barePath : `/${seg.barePath}`;
  const parts = bareRaw.split("/").filter(Boolean);
  let frBare = bareRaw;
  let enBare = bareRaw;
  if (parts.length === 1) {
    const s = parts[0];
    const twin = slugHreflangTwin(s);
    const alias = SEO_URL_ALIASES[s];
    if (twin && alias && (alias.lang === "fr" || alias.lang === "en")) {
      if (alias.lang === "fr") {
        frBare = `/${s}`;
        enBare = `/${twin}`;
      } else {
        enBare = `/${s}`;
        frBare = `/${twin}`;
      }
    }
  }
  const frPath = localePath("fr", frBare);
  const enPath = localePath("en", enBare);
  return [
    { hrefLang: "fr", href: `${base}${frPath}` },
    { hrefLang: "en", href: `${base}${enPath}` },
    { hrefLang: "fr-CM", href: `${base}${frPath}` },
    { hrefLang: "en-CM", href: `${base}${enPath}` },
    { hrefLang: "x-default", href: `${base}${frPath}` },
  ];
}

/**
 * Chemin interne avec query string (ex. /fr/livraison?code=YX-123).
 * @param {string} page
 * @param {{ locale?: SiteLocale, query?: Record<string, string|number|null|undefined> }} [opts]
 */
export function pathForPageWithQuery(page, { locale = DEFAULT_SITE_LOCALE, query = {} } = {}) {
  const base = pathForPage(page, { locale });
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null && value !== "") params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

/** URL absolue sur le domaine public (WhatsApp, emails). */
export function absoluteSiteUrl(pathWithSearch = "/") {
  const base = SITE_URL.replace(/\/$/, "");
  const path = pathWithSearch.startsWith("/") ? pathWithSearch : `/${pathWithSearch}`;
  return `${base}${path}`;
}

/** Suivi livraison client — /fr/livraison?code=… */
export function deliveryTrackingPath(code, locale = DEFAULT_SITE_LOCALE) {
  return pathForPageWithQuery("livraison", { locale, query: code ? { code } : {} });
}

/** Dashboard livreur — missions disponibles. */
export function livreurDashboardPath({ code, locale = DEFAULT_SITE_LOCALE } = {}) {
  return pathForPageWithQuery("dashboard", {
    locale,
    query: { tab: "disponibles", ...(code ? { code } : {}) },
  });
}

/** Admin — onglet livraisons. */
export function adminDeliveriesPath(locale = DEFAULT_SITE_LOCALE) {
  return pathForPageWithQuery("admin", { locale, query: { tab: "deliveries" } });
}

