// ══════════════════════════════════════════════════════════════
//  YORIX CM — VERSION PROFESSIONNELLE COMPLÈTE
//  ✅ WhatsApp Commander
//  ✅ Upload multiple Cloudinary
//  ✅ Commandes Supabase (orders)
//  ✅ Avis / Étoiles / Commentaires
//  ✅ Commission automatique 5%
//  ✅ Livraison avec statuts
//  ✅ Escrow simulé
//  ✅ Dashboard vendeur complet
//  ✅ Notifications temps réel
//  ✅ 4 rôles : buyer / seller / delivery / provider
//  ✅ Contrat d'acceptation obligatoire pour pros
//  ✅ Password input premium avec œil
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import {
  parsePathname,
  pathForPage,
  buildEntitySlug,
  parseEntitySlug,
  slugToCategoryName,
  categoryNameFromTaxonomySlug,
  CITY_BY_SLUG,
  METIER_SLUG_TO_CATEGORY,
  SEO_CITIES,
  SITE_URL,
  getSearchActionUrl,
  PAGE_PATH,
  localePath,
  canonicalFromSeoAlias,
  buildHrefLangAlternates,
  ensureLocalePath,
  parseLocaleSegments,
} from "./lib/seoRoutes";
import { SEO_URL_ALIASES, getBlogArticle } from "./lib/seoProgrammatic.js";
import { filterProductsByMerchHub, getMerchHub } from "./lib/merchHubs.js";
import {
  resolveCategoryFilter,
  productMatchesCategoryFilter,
} from "./lib/marketplaceCategories.js";
import { useCategoryTaxonomy } from "./hooks/useCategoryTaxonomy.js";
import { SeoHead } from "./components/seo/SeoHead";
import i18n from "./i18n/index.js";
import {
  supabase,
  YORIX_WA_NUMBER,
  CLOUD_NAME,
  UPLOAD_PRESET,
} from "./lib/supabase";

import {
  CATS,
  ROLE_LABELS,
  DELIVERY_STATUSES,
  ESCROW_STATUSES,
  PREST_DATA,
  COURSES_DATA,
  REWARDS_DATA,
} from "./lib/constants";

import {
  uploadSingleImage,
  updateLivraisonStatut,
  genererCodeSuivi,
} from "./utils/helpers";
import { isAdminViewer } from "./lib/roles";
import { makeCSS } from "./utils/styles";
import { Stars } from "./components/Stars";
import { ModalCommander } from "./components/ModalCommander";
import { LevelBadge } from "./components/LevelBadge";
import { PointsAnimation } from "./components/PointsAnimation";
import { ModalDemandeLivraison } from "./components/ModalDemandeLivraison";
import { CartDrawer } from "./components/CartDrawer";
import { UserMenuDrawer } from "./components/UserMenuDrawer";
import { getDefaultPolicyFromEnv, normalizeDeliveryPolicy } from "./domain/deliveryPolicy";
import { enrichNotification, showBrowserNotificationIfPossible } from "./domain/notificationsDomain";
import { applyNotificationOpen, getNotificationOpenAction } from "./lib/notificationNavigation.js";
import { ensureNotificationPrefsSynced, loadNotificationPrefs } from "./lib/notificationPrefs";
import { OptimizedImage } from "./components/OptimizedImage";
import { PremiumSiteFooter } from "./components/layout/PremiumSiteFooter";
import { OnboardingModal } from "./components/OnboardingModal";
import { ContractAcceptance } from "./components/ContractAcceptance";
import { RouteErrorBoundary } from "./components/errors/AppErrorBoundary.jsx";
import { YorixAuthModal } from "./components/yorix/YorixAuthModal.jsx";
import { YorixHeader } from "./components/yorix/YorixHeader.jsx";
import { YorixPages } from "./components/yorix/YorixPages.jsx";
import { useYorixAuth } from "./hooks/useYorixAuth.js";
import { useYorixCart } from "./hooks/useYorixCart.js";

// ═══════════════════════════════════════════════════════════════
// APP PRINCIPALE (logique métier + layout)
// ═══════════════════════════════════════════════════════════════

export default function YorixApp() {
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const route                     = useMemo(() => parsePathname(location.pathname), [location.pathname]);
  const page                      = route.page;

  useLayoutEffect(() => {
    if (route.localeRewriteTo && location.pathname !== route.localeRewriteTo) {
      navigate(
        route.localeRewriteTo + (location.search || "") + (location.hash || ""),
        { replace: true },
      );
    }
  }, [route.localeRewriteTo, location.pathname, location.search, location.hash, navigate]);

  useEffect(() => {
    void i18n.changeLanguage(route.locale === "en" ? "en" : "fr");
  }, [route.locale]);

  const hrefLangAlternates = useMemo(
    () => buildHrefLangAlternates(location.pathname),
    [location.pathname],
  );

  const switchLocale = useCallback(
    (lng) => {
      const { barePath } = parseLocaleSegments(location.pathname);
      const path =
        lng === "en" || lng === "fr" ? localePath(lng, barePath) : localePath("fr", barePath);
      navigate(path + (location.search || "") + (location.hash || ""));
    },
    [navigate, location.pathname, location.search, location.hash],
  );

  const [dashTab, setDashTab] = useState("overview");
  const [pendingChatConversationId, setPendingChatConversationId] = useState(null);
  const [demandeLivraisonOpen, setDemandeLivraisonOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  const [dark, setDark]           = useState(false);

  // Produits
  const [produits, setProduits]                 = useState([]);
  const [produitsLoading, setProduitsLoading]   = useState(true);
  const [sellerMerchProfiles, setSellerMerchProfiles] = useState([]);
  const [allServices, setAllServices]           = useState([]);

  useEffect(() => {
    const loadServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("actif", true)
        .eq("disponible", true)
        .order("created_at", { ascending: false });
      if (!error) setAllServices(data || []);
    };
    loadServices();
  }, []);

  const [search, setSearch]                     = useState("");
  const [filterCat, setFilterCat]               = useState("");
  const [categoryFilter, setCategoryFilter]     = useState(null);
  const {
    flat: categoryFlat,
    tree: categoryTree,
    loading: categoryLoading,
    reload: reloadCategories,
  } = useCategoryTaxonomy({ locale: route.locale });

  useEffect(() => {
    if (page !== "produits") return;
    const q = new URLSearchParams(location.search).get("q");
    if (q != null && q !== "") setSearch((prev) => (prev === q.trim() ? prev : q.trim()));
  }, [page, location.search]);

  // Notifs
  const [notifs, setNotifs]       = useState([]);
  const [notifRevision, setNotifRevision] = useState(0);
  const [notifPrefs, setNotifPrefs] = useState(() => loadNotificationPrefs());
  const notifPrefsRef = useRef(notifPrefs);
  notifPrefsRef.current = notifPrefs;

  const [navCompact, setNavCompact] = useState(false);
  const [navQuickOpen, setNavQuickOpen] = useState(false);
  const navQuickRef = useRef(null);

  const [commerceDeliveryPolicy, setCommerceDeliveryPolicy] = useState(() => getDefaultPolicyFromEnv());

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        setNavCompact(window.scrollY > 16);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!navQuickOpen) return undefined;
    const close = (e) => {
      if (navQuickRef.current && !navQuickRef.current.contains(e.target)) setNavQuickOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [navQuickOpen]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("commerce_settings")
          .select("free_shipping_threshold_xaf, standard_delivery_fee_xaf")
          .eq("id", 1)
          .maybeSingle();
        if (cancelled || error || !data) return;
        setCommerceDeliveryPolicy(
          normalizeDeliveryPolicy({
            freeShippingThresholdXaf: Number(data.free_shipping_threshold_xaf),
            standardDeliveryFeeXaf: Number(data.standard_delivery_fee_xaf),
          }),
        );
      } catch {
        /* pré-migration : valeurs env / défaut */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadNotifsForUser = useCallback(async (uid, limit = 40) => {
    if (!uid) return;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) console.warn("Notifications:", error.message);
    else setNotifs(data || []);
    setNotifRevision((v) => v + 1);
  }, []);

  const goPage = useCallback((p, opts = {}) => {
    navigate(pathForPage(p, { ...opts, locale: opts.locale ?? route.locale }));
    window.scrollTo(0, 0);
  }, [navigate, route.locale]);

  const openCart = useCallback(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) {
      setCartDrawerOpen(true);
    } else {
      goPage("cart");
    }
  }, [goPage]);

  const closeCartDrawer = useCallback(() => setCartDrawerOpen(false), []);

  const goDash = useCallback(
    (tab) => {
      setDashTab(tab);
      goPage("dashboard");
    },
    [goPage],
  );

  useEffect(() => {
    setCartDrawerOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (page !== "dashboard") return;
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab && tab !== dashTab) setDashTab(tab);
  }, [page, location.search, dashTab]);

  const goToCategory = useCallback(
    ({ parentSlug, subSlug }) => {
      if (!parentSlug) {
        goPage("produits");
        return;
      }
      goPage("produits", { categorySlug: parentSlug, subCategorySlug: subSlug || undefined });
    },
    [goPage],
  );

  const authSession = useYorixAuth({
    goPage,
    setDashTab,
    setDemandeLivraisonOpen,
    setNotifs,
    onProfileLoaded: loadNotifsForUser,
  });

  const {
    user,
    setUser,
    userData,
    setUserData,
    userRole,
    setUserRole,
    loading,
    authOpen,
    setAuthOpen,
    authTab,
    setAuthTab,
    selectedRole,
    setSelectedRole,
    authForm,
    setAuthForm,
    authError,
    setAuthError,
    authLoading,
    setAuthLoading,
    contractOpen,
    setContractOpen,
    contractAccepted,
    setContractAccepted,
    pendingAction,
    setPendingAction,
    doLogin,
    doRegister,
    doGoogle,
    doLogout,
    handleContractAccepted,
    executePendingAction,
  } = authSession;

  const {
    cartItems,
    setCartItems,
    addToCart,
    addServiceToCart,
    changeQty,
    removeItem,
    cartSummary,
    totalQty,
  } = useYorixCart(commerceDeliveryPolicy);

  useEffect(() => {
    if (!user?.id) {
      setOrderCount(0);
      return undefined;
    }
    let cancelled = false;
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("client_id", user.id)
      .then(({ count, error }) => {
        if (!cancelled && !error) setOrderCount(count || 0);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setNotifPrefs(loadNotificationPrefs());
      return undefined;
    }
    let cancelled = false;
    ensureNotificationPrefsSynced(supabase, user.id).then((p) => {
      if (!cancelled) setNotifPrefs(p);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Divers
  const [nlEmail, setNlEmail]                   = useState("");
  const [nlSent, setNlSent]                     = useState(false);
  const [wishlist, setWishlist]                 = useState(new Set());
  const [loyaltyPts, setLoyaltyPts]             = useState(320);
  const [blogFilter, setBlogFilter]             = useState("TOUT");
  const [selectedPrest, setSelectedPrest]       = useState(null);

  // ═══ ONBOARDING ═══
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Academy
  const [academyCourses, setAcademyCourses] = useState([]);
  const [academyLoading, setAcademyLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [detailProduct, setDetailProduct] = useState(null);
  const [detailProductLoading, setDetailProductLoading] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      setAcademyLoading(true);
      const { data, error } = await supabase
        .from("academy_courses")
        .select("*")
        .eq("actif", true)
        .order("prix", { ascending: true });
      if (!error) setAcademyCourses(data || []);
      setAcademyLoading(false);
    };
    loadCourses();
  }, []);

  const goAcademyDetail = useCallback((course) => {
    if (!course?.id) return;
    setSelectedCourse(course);
    navigate(pathForPage("academyDetail", { courseId: course.id, locale: route.locale }));
  }, [navigate, route.locale]);
  const goAcademyContact = useCallback((course) => {
    if (!course?.id) return;
    setSelectedCourse(course);
    navigate(pathForPage("academyContact", { courseId: course.id, locale: route.locale }));
  }, [navigate, route.locale]);

  const [inscriptionSent, setInscriptionSent]       = useState(false);
  const [inscriptionLoading, setInscriptionLoading] = useState(false);
  const [inscriptionError, setInscriptionError]     = useState("");
  const [inscriptionForm, setInscriptionForm] = useState({ nom:"",prenom:"",tel:"",email:"",metier:"",ville:"",experience:"",tarif:"",bio:"" });

  // ─────────────────────────────────────────────────────────────
  // SOUMETTRE CANDIDATURE PRESTATAIRE (avec Supabase + email + WA)
  // ─────────────────────────────────────────────────────────────
  const soumettreCandidaturePrestataire = async () => {
    setInscriptionError("");

    if (!inscriptionForm.nom.trim()) { setInscriptionError("Le nom est obligatoire"); return; }
    if (!inscriptionForm.tel.trim()) { setInscriptionError("Le téléphone est obligatoire"); return; }
    if (!inscriptionForm.metier)     { setInscriptionError("Veuillez choisir un métier"); return; }
    if (inscriptionForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inscriptionForm.email)) {
      setInscriptionError("Email invalide"); return;
    }

    setInscriptionLoading(true);

    try {
      const { data, error } = await supabase
        .from("prestataires")
        .insert({
          nom:        inscriptionForm.nom,
          prenom:     inscriptionForm.prenom || null,
          telephone:  inscriptionForm.tel,
          email:      inscriptionForm.email || null,
          metier:     inscriptionForm.metier,
          ville:      inscriptionForm.ville || null,
          experience: inscriptionForm.experience || null,
          tarif:      inscriptionForm.tarif || null,
          bio:        inscriptionForm.bio || null,
          status:     "pending",
          user_id:    user?.id || null,
        })
        .select()
        .single();

      if (error) console.warn("Table prestataires Supabase:", error.message);

      const wamsg = [
        "👷 *NOUVELLE CANDIDATURE PRESTATAIRE YORIX*",
        "",
        "👤 *Informations*",
        `Nom : ${inscriptionForm.nom}${inscriptionForm.prenom ? " " + inscriptionForm.prenom : ""}`,
        `Téléphone : ${inscriptionForm.tel}`,
        inscriptionForm.email ? `Email : ${inscriptionForm.email}` : "",
        "",
        "💼 *Profil professionnel*",
        `Métier : ${inscriptionForm.metier}`,
        inscriptionForm.ville ? `Ville : ${inscriptionForm.ville}` : "",
        inscriptionForm.experience ? `Expérience : ${inscriptionForm.experience}` : "",
        inscriptionForm.tarif ? `Tarif : ${inscriptionForm.tarif}` : "",
        "",
        inscriptionForm.bio ? `📝 *Présentation*\n${inscriptionForm.bio}` : "",
        "",
        "✅ *Actions à faire*",
        "1. Contacter le candidat sous 24h",
        "2. Vérifier les qualifications",
        "3. Valider ou refuser le profil",
        "",
        "Yorix CM 🇨🇲",
      ].filter(Boolean).join("\n");

      const waUrl = `https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent(wamsg)}`;
      window.open(waUrl, "_blank");

      const sujet = `Nouvelle candidature prestataire — ${inscriptionForm.nom} (${inscriptionForm.metier})`;
      const corps = [
        "Bonjour,",
        "",
        "Nouvelle candidature prestataire sur Yorix CM :",
        "",
        `👤 Nom : ${inscriptionForm.nom}${inscriptionForm.prenom ? " " + inscriptionForm.prenom : ""}`,
        `📞 Téléphone : ${inscriptionForm.tel}`,
        inscriptionForm.email ? `📧 Email : ${inscriptionForm.email}` : "",
        `💼 Métier : ${inscriptionForm.metier}`,
        inscriptionForm.ville ? `📍 Ville : ${inscriptionForm.ville}` : "",
        inscriptionForm.experience ? `⏱ Expérience : ${inscriptionForm.experience}` : "",
        inscriptionForm.tarif ? `💰 Tarif : ${inscriptionForm.tarif}` : "",
        "",
        inscriptionForm.bio ? `📝 Présentation :\n${inscriptionForm.bio}` : "",
        "",
        "---",
        "Envoyé depuis yorix.cm",
      ].filter(Boolean).join("\n");

      const mailtoUrl = `mailto:raisaodin1@gmail.com?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(corps)}`;
      setTimeout(() => window.open(mailtoUrl, "_blank"), 500);

      setInscriptionSent(true);

    } catch (err) {
      console.error("soumettreCandidaturePrestataire:", err);
      setInscriptionError("Erreur : " + (err.message || "Impossible d'envoyer la candidature. Réessayez."));
    }

    setInscriptionLoading(false);
  };

  // ── ONBOARDING : afficher au 1er chargement si jamais vu ──
  useEffect(() => {
    const seen = localStorage.getItem("yorix_onboarding_seen");
    if (!seen) {
      const t = setTimeout(() => setOnboardingOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  // ── HANDLER : choix d'une action onboarding ──
  const handleOnboardingAction = useCallback((actionId) => {
    localStorage.setItem("yorix_onboarding_seen", "1");
    setOnboardingOpen(false);

    const routes = {
      buy:      { needAuth: false, page: "produits" },
      sell:     { needAuth: true,  role: "seller",   page: "dashboard" },
      service:  { needAuth: false, page: "prestataires" },
      delivery: { needAuth: true,  role: "buyer",    action: "openDelivery" },
    };

    const target = routes[actionId];
    if (!target) return;

    if (target.needAuth && !user) {
      setPendingAction(actionId);
      setSelectedRole(target.role || "buyer");
      setAuthTab("register");
      setAuthOpen(true);
      return;
    }

    executePendingAction(actionId);
  }, [user, executePendingAction]);

  // ── Marquer onboarding comme vu lors de la fermeture manuelle ──
  const handleCloseOnboarding = useCallback(() => {
    localStorage.setItem("yorix_onboarding_seen", "1");
    setOnboardingOpen(false);
  }, []);

  /* Temps réel : nouvelles lignes notifications (+ alerte bureau si autorisée) */
  useEffect(() => {
    if (!user?.id) return undefined;
    const channel = supabase
      .channel(`notifications_rt_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new;
          setNotifs((prev) => {
            if (prev.some((x) => x.id === row.id)) return prev;
            return [row, ...prev].slice(0, 120);
          });
          setNotifRevision((v) => v + 1);
          try {
            showBrowserNotificationIfPossible(enrichNotification(row), notifPrefsRef.current);
          } catch {
            /* ignore */
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new;
          setNotifs((prev) => prev.map((n) => (n.id === row.id ? row : n)));
          setNotifRevision((v) => v + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const id = payload.old?.id;
          if (!id) return;
          setNotifs((prev) => prev.filter((n) => n.id !== id));
          setNotifRevision((v) => v + 1);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /* Deep link depuis une notification push (service worker) */
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return undefined;
    const onMsg = (event) => {
      if (event.data?.type !== "NOTIF_NAV") return;
      const url = typeof event.data.url === "string" ? event.data.url : "/";
      const path = url.startsWith("/") ? url : `/${url}`;
      navigate(ensureLocalePath(path, route.locale));
    };
    navigator.serviceWorker.addEventListener("message", onMsg);
    return () => navigator.serviceWorker.removeEventListener("message", onMsg);
  }, [navigate, route.locale]);

  // ── PRODUITS TEMPS RÉEL ──
  // Ne pas filtrer par filterCat côté API : ce libellé UI/URL est appliqué dans produitsFiltres.
  // Un filtre serveur trop strict (ex. « Téléphones & HighTech ») vidait tout le catalogue y compris l'accueil.
  useEffect(() => {
    setProduitsLoading(true);
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .or("actif.eq.true,actif.is.null")
        .order("sponsorise", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) console.warn("Produits:", error.message);
      setProduits(data || []);
      setProduitsLoading(false);
    };
    load();
    const channel = supabase
      .channel("prod_rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);


  const routePath = location.pathname;

  // ── SEO / Router : synchroniser filtres et fiches depuis l’URL indexable
  useEffect(() => {
    if (route.categorySlug && categoryFlat.length) {
      const resolved = resolveCategoryFilter(categoryFlat, {
        categorySlug: route.categorySlug,
        subCategorySlug: route.subCategorySlug,
      });
      setCategoryFilter(resolved);
      setFilterCat(resolved.filterLabel || categoryNameFromTaxonomySlug(route.categorySlug) || "");
    } else if (route.categorySlug) {
      setFilterCat(categoryNameFromTaxonomySlug(route.subCategorySlug || route.categorySlug) || "");
    } else if (route.page === "produits" && routePath === "/produits") {
      setFilterCat("");
      setCategoryFilter(null);
    } else if (route.page === "home") {
      setFilterCat("");
      setCategoryFilter(null);
    }
  }, [route.categorySlug, route.subCategorySlug, route.page, routePath, categoryFlat]);

  const seoCityName = useMemo(
    () => (route.citySlug ? CITY_BY_SLUG[route.citySlug]?.name : null),
    [route.citySlug]
  );

  const prestSyncFilters = useMemo(() => {
    if (route.page === "prestataires" && route.metierSlug && route.villeSlug) {
      return {
        cat: METIER_SLUG_TO_CATEGORY[route.metierSlug] || "",
        ville: CITY_BY_SLUG[route.villeSlug]?.name || "",
      };
    }
    if (route.page === "seoCity" && route.cityMode === "prestataires" && seoCityName) {
      return { cat: "", ville: seoCityName };
    }
    if (route.page === "prestataires" && routePath === "/prestataires") {
      return { cat: "", ville: "" };
    }
    return null;
  }, [route.page, route.metierSlug, route.villeSlug, route.cityMode, seoCityName, routePath]);

  useEffect(() => {
    if (route.page !== "academyDetail" && route.page !== "academyContact") return;
    const id = route.courseId;
    if (!id || !academyCourses.length) return;
    const c = academyCourses.find((x) => String(x.id) === String(id));
    if (c) setSelectedCourse(c);
  }, [route.page, route.courseId, academyCourses]);

  useEffect(() => {
    if (route.page !== "productDetail" || !route.productSlug) {
      setDetailProduct(null);
      setDetailProductLoading(false);
      return;
    }
    const { id } = parseEntitySlug(route.productSlug);
    if (!id) {
      setDetailProduct(null);
      setDetailProductLoading(false);
      return;
    }
    let cancelled = false;
    setDetailProductLoading(true);
    supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.warn("Détail produit:", error.message);
        setDetailProduct(data || null);
        setDetailProductLoading(false);
      })
      .catch((e) => {
        if (!cancelled) {
          console.warn("Détail produit:", e?.message || e);
          setDetailProduct(null);
          setDetailProductLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [route.page, route.productSlug]);

  useEffect(() => {
    if (route.page !== "prestDetail" || !route.prestSlug) {
      if (route.page !== "prestDetail") setSelectedPrest(null);
      return;
    }
    const { id } = parseEntitySlug(route.prestSlug);
    if (!id) {
      setSelectedPrest(null);
      return;
    }
    const demo = PREST_DATA.find((p) => p.id === id);
    if (demo) {
      setSelectedPrest(demo);
      return;
    }
    const matchReal = allServices.find((s) => `real-${s.id}` === id || String(s.id) === id);
    if (matchReal) {
      setSelectedPrest({
        id: `real-${matchReal.id}`,
        name: matchReal.provider_nom || "Prestataire Yorix",
        metier: matchReal.nom || "Service",
        categorie: matchReal.categorie || "Autre",
        ville: matchReal.ville || "Cameroun",
        quartier: "",
        emoji: "🛠️",
        photo: null,
        color_bg: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
        tags: [matchReal.categorie || "Service"].filter(Boolean),
        note: matchReal.note || 5,
        avis: matchReal.nombre_avis || 0,
        prix: matchReal.prix ? `${Number(matchReal.prix).toLocaleString("fr-FR")} FCFA` : "",
        verifie: true,
        dispo: matchReal.disponible !== false,
        bio: matchReal.description || "",
        telephone: "",
        realisations: 0,
        isReal: true,
      });
    } else {
      setSelectedPrest(null);
    }
  }, [route.page, route.prestSlug, allServices]);

  const persistCheckoutContact = useCallback(async (patch) => {
    if (!user?.id || !patch) return;
    const payload = {};
    if (patch.telephone != null && String(patch.telephone).trim() !== "") {
      payload.telephone = String(patch.telephone).trim();
    }
    if (patch.adresse != null) payload.adresse = String(patch.adresse).trim();
    if (patch.ville != null) payload.ville = String(patch.ville).trim();
    if (patch.nom != null) payload.nom = String(patch.nom).trim();
    if (!Object.keys(payload).length) return;
    const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
    if (error) {
      console.warn("Profil checkout non sauvegardé:", error.message || error);
      return;
    }
    setUserData((prev) => (prev ? { ...prev, ...payload } : prev));
  }, [user?.id]);


  const toggleWish = useCallback((id) => setWishlist(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }), []);

  const openNotificationTarget = useCallback(
    (notification) => {
      if (!notification) return false;
      const action = getNotificationOpenAction(notification, route.locale);
      return applyNotificationOpen(action, {
        navigate,
        goPage,
        setDashTab,
        setPendingChatConversationId,
      });
    },
    [navigate, route.locale, goPage, setDashTab],
  );

  const marquerNotifLue = async (notif, opts = { navigate: false, closeDrawer: false }) => {
    const id = typeof notif === "object" ? notif.id : notif;
    const notification = typeof notif === "object" ? notif : notifs.find((n) => n.id === id);

    try {
      const { error } = await supabase.from("notifications").update({ lu: true }).eq("id", id);
      if (error) console.warn("marquerNotifLue:", error.message);
    } catch (e) {
      console.warn("marquerNotifLue exception:", e?.message);
    }

    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
    setNotifRevision((v) => v + 1);

    if (opts.navigate && notification) {
      openNotificationTarget(notification);
    }
  };

  const supprimerNotif = async (id) => {
    if (!id) return;
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) console.warn("supprimerNotif:", error.message);
    } catch (e) {
      console.warn("supprimerNotif:", e?.message);
    }
    setNotifs((prev) => prev.filter((n) => n.id !== id));
    setNotifRevision((v) => v + 1);
  };

  const marquerToutesLues = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ lu: true })
        .eq("user_id", user.id)
        .eq("lu", false);
      if (error) console.warn("marquerToutesLues:", error.message);
    } catch (e) {
      console.warn("marquerToutesLues exception:", e?.message);
    }

    setNotifs((prev) => prev.map((n) => ({ ...n, lu: true })));
    setNotifRevision((v) => v + 1);
  };

  const unread = notifs.filter(n => !n.lu).length;

  useEffect(() => {
    const hub = page === "merchHub" && route.merchHub ? getMerchHub(route.merchHub) : null;
    if (!hub || !["new_sellers", "top_sellers"].includes(hub.filter)) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, role, created_at, nom")
        .or("role.eq.seller,role.eq.vendeur")
        .limit(3000);
      if (!cancelled && !error) setSellerMerchProfiles(data || []);
    })();
    return () => {
      cancelled = true;
    };
  }, [page, route.merchHub]);

  const produitsFiltres = useMemo(() => {
    let list = produits.filter(
      (p) =>
        !search ||
        p.name_fr?.toLowerCase().includes(search.toLowerCase()) ||
        p.description_fr?.toLowerCase().includes(search.toLowerCase())
    );
    if (page === "seoCity" && route.cityMode === "acheter" && seoCityName) {
      const sl = seoCityName.toLowerCase();
      list = list.filter((p) => {
        const v = (p.ville || "").toLowerCase();
        return !v || v.includes(sl) || sl.includes(v);
      });
    }
    if (page === "merchHub" && route.merchHub) {
      const hub = getMerchHub(route.merchHub);
      if (hub?.filter) {
        list = filterProductsByMerchHub(list, hub.filter, {
          citySlug: route.citySlug,
          sellerProfiles: sellerMerchProfiles,
        });
      }
    }
    if (categoryFilter?.filterLabel || categoryFilter?.categoryId) {
      list = list.filter((p) => productMatchesCategoryFilter(p, categoryFilter));
    } else if (filterCat) {
      const fc = filterCat.toLowerCase();
      list = list.filter((p) => (p.categorie || "").toLowerCase() === fc);
    }
    return list;
  }, [produits, search, page, route.cityMode, route.merchHub, route.citySlug, seoCityName, categoryFilter, filterCat, sellerMerchProfiles]);

  const showSeoLocal =
    page === "seoCity" || (page === "livraison" && !!route.citySlug);
  const showProduits = page === "produits" || (page === "seoCity" && route.cityMode === "acheter");
  const showLivraison =
    page === "livraison" || (page === "seoCity" && route.cityMode === "livraison");
  const showPrestataires =
    page === "prestataires" ||
    page === "prestDetail" ||
    (page === "seoCity" && route.cityMode === "prestataires");

  const needsProductListingChunk = showProduits || page === "escrow";
  const isSiteMarketingPage = useMemo(
    () =>
      [
        "faq",
        "devenirVendeur",
        "devenirLivreur",
        "inscription",
        "business",
        "academy",
        "blog",
        "contact",
        "aide",
        "cgv",
        "mentions",
        "confidentialite",
      ].includes(page),
    [page]
  );

  const tabActive = useCallback(
    (tabPage) => {
      if (tabPage === "produits") {
        return page === "produits" || (page === "seoCity" && route.cityMode === "acheter");
      }
      if (tabPage === "livraison") {
        return page === "livraison" || (page === "seoCity" && route.cityMode === "livraison");
      }
      if (tabPage === "prestataires") {
        return (
          page === "prestataires" ||
          page === "prestDetail" ||
          (page === "seoCity" && route.cityMode === "prestataires")
        );
      }
      if (tabPage === "cart") {
        return page === "cart" || cartDrawerOpen;
      }
      return page === tabPage;
    },
    [page, route.cityMode, cartDrawerOpen],
  );

  const openProductUrl = useCallback(
    (p) => {
      goPage("productDetail", {
        productSlug: buildEntitySlug(p.name_fr || p.name, p.id),
      });
    },
    [goPage]
  );

  const roleChipClass = () =>
    ({ buyer:"chip-buyer", seller:"chip-seller", delivery:"chip-delivery", provider:"chip-provider", admin:"chip-admin" }[userRole] || "chip-buyer");

  const { t: tNav } = useTranslation("nav");

  const getDashNav = useCallback(() => {
    const dn = (icon, id, key) => ({ icon, id, label: tNav(`dashNav.${key}`) });
    if (userRole === "seller") {
      return [
        dn("📊", "overview", "overview"),
        dn("🏪", "mesProduits", "myProducts"),
        dn("➕", "ajouterProduit", "addProduct"),
        dn("📦", "commandes", "orders"),
        dn("💰", "wallet", "wallet"),
      ];
    }
    if (userRole === "delivery") {
      return [
        dn("📊", "overview", "overview"),
        dn("🟡", "disponibles", "available"),
        dn("🚚", "enCours", "inProgress"),
        dn("✅", "historique", "history"),
        dn("💰", "wallet", "earnings"),
      ];
    }
    if (userRole === "provider") {
      return [
        dn("📊", "overview", "overview"),
        dn("📋", "demandes", "requests"),
        dn("🛠️", "mesServices", "myServices"),
        dn("+", "ajouterService", "addService"),
      ];
    }
    return [
      dn("📊", "overview", "overview"),
      dn("📦", "commandes", "myOrders"),
      dn("❤️", "favoris", "favorites"),
      dn("🌟", "loyalty", "loyalty"),
    ];
  }, [userRole, tNav]);

  const TABS = useMemo(() => {
    const tab = (icon, key, p) => ({ l: `${icon} ${tNav(`tabs.${key}`)}`, p });
    const base = [
      tab("🏠", "home", "home"),
      tab("🛍️", "products", "produits"),
      tab("🎁", "deals", "bonsPlans"),
      tab("🚚", "delivery", "livraison"),
      tab("🔐", "escrow", "escrow"),
      tab("👷", "providers", "prestataires"),
      tab("💼", "business", "business"),
      tab("🎓", "academy", "academy"),
      tab("📰", "blog", "blog"),
      tab("🌟", "loyalty", "loyalty"),
      tab("📞", "contact", "contact"),
      tab("🆘", "help", "aide"),
    ];
    if (user && isAdminViewer(userData)) {
      base.push(tab("⚙️", "admin", "admin"));
    }
    return base;
  }, [tNav, user, userData?.role]);

  const seoBundle = useMemo(() => {
    const canon = route.canonicalPath || location.pathname;
    const L = (bare) => localePath(route.locale, bare);
    const orgLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Yorix CM",
      alternateName: "Yorix Cameroun",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      image: `${SITE_URL}/og-image.svg`,
      email: "support@yorix.cm",
      telephone: "+237696565654",
      foundingDate: "2025",
      address: {
        "@type": "PostalAddress",
        addressCountry: "CM",
        addressLocality: "Douala",
        addressRegion: "Littoral",
      },
      areaServed: { "@type": "Country", name: "Cameroun" },
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+237696565654",
          contactType: "customer service",
          areaServed: "CM",
          availableLanguage: ["French", "English"],
        },
      ],
      sameAs: [
        "https://www.facebook.com/yorixcm",
        "https://www.instagram.com/yorixcm",
        "https://wa.me/237696565654",
      ],
    };

    // BreadcrumbList helper — Google rich snippet pour pages détail / sections
    const buildBreadcrumbLd = (segments) => {
      if (!segments?.length) return null;
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: segments.map((s, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: s.name,
          item: s.path?.startsWith("http") ? s.path : `${SITE_URL}${s.path || "/"}`,
        })),
      };
    };
    const webLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Yorix CM",
      url: SITE_URL,
        potentialAction: {
        "@type": "SearchAction",
        target: `${getSearchActionUrl(route.locale)}?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
    const marketplaceLd = {
      "@context": "https://schema.org",
      "@type": "OnlineStore",
      name: "Yorix.cm",
      url: SITE_URL,
      image: `${SITE_URL}/og-image.svg`,
      description:
        "Marketplace camerounaise pour acheter des produits, réserver des services et organiser la livraison avec paiement Mobile Money.",
      areaServed: [
        { "@type": "City", name: "Douala" },
        { "@type": "City", name: "Yaoundé" },
        { "@type": "City", name: "Bafoussam" },
        { "@type": "Country", name: "Cameroun" },
      ],
      paymentAccepted: ["MTN Mobile Money", "Orange Money", "Carte bancaire", "Cash"],
      currenciesAccepted: "XAF",
      contactPoint: orgLd.contactPoint,
      sameAs: orgLd.sameAs,
    };

    if (page === "blog" && route.blogSlug) {
      const art = getBlogArticle(route.blogSlug);
      if (art) {
        const articleLd = {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: art.headline,
          datePublished: art.datePublished,
          author: { "@type": "Organization", name: "Yorix CM" },
          publisher: {
            "@type": "Organization",
            name: "Yorix CM",
            logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
          },
        };
        const faqLd =
          art.faq?.length > 0
            ? {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                mainEntity: art.faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              }
            : null;
        const blogCrumb = buildBreadcrumbLd([
          { name: "Accueil", path: L("/") },
          { name: "Blog", path: L("/blog") },
          { name: art.headline.slice(0, 90), path: canon },
        ]);
        return {
          title: art.title,
          description: art.description,
          canonicalPath: canon,
          keywords: art.keywords,
          jsonLd: [articleLd, faqLd, blogCrumb, orgLd].filter(Boolean),
        };
      }
    }

    if (
      route.seoAliasKey &&
      SEO_URL_ALIASES[route.seoAliasKey] &&
      canonicalFromSeoAlias(SEO_URL_ALIASES[route.seoAliasKey]) === canon
    ) {
      const a = SEO_URL_ALIASES[route.seoAliasKey];
      const crumb = buildBreadcrumbLd([
        { name: "Accueil", path: L("/") },
        { name: (a.title && a.title.split("|")[0]?.trim()) || "Yorix.cm", path: canon },
      ]);
      const pieces = [crumb, orgLd];
      if (page === "home" || page === "produits") pieces.push(webLd);
      return {
        title: a.title,
        description: a.description,
        keywords: a.keywords,
        canonicalPath: canon,
        jsonLd: pieces.filter(Boolean),
      };
    }

    if (page === "dashboard" || page === "admin") {
      return {
        title: "Espace membre — Yorix CM",
        description: "Tableau de bord Yorix.",
        canonicalPath: canon,
        noindex: true,
        jsonLd: [],
      };
    }

    if (page === "home") {
      const homeFaqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Quel site utiliser pour acheter en ligne au Cameroun ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Yorix.cm centralise produits, vendeurs, prestataires et livraison avec paiement MTN MoMo, Orange Money, cash ou carte selon les options disponibles.",
            },
          },
          {
            "@type": "Question",
            name: "Comment commander rapidement sur Yorix.cm ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Recherchez un produit ou une ville, ajoutez au panier ou contactez le support WhatsApp express pour finaliser l'achat ou la demande rapidement.",
            },
          },
          {
            "@type": "Question",
            name: "Comment vendre en ligne au Cameroun avec Yorix ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Créez un compte vendeur, publiez vos fiches avec photos, prix en FCFA et ville, puis suivez commandes, messages et paiements dans votre tableau de bord.",
            },
          },
        ],
      };
      return {
        title: "Marketplace Cameroun | Achat en ligne, livraison & services | Yorix.cm",
        description:
          "Yorix.cm : marketplace camerounaise pour acheter, vendre, se faire livrer et trouver des prestataires. Paiement MTN MoMo, Orange Money, escrow et support WhatsApp.",
        canonicalPath: canon,
        keywords:
          "marketplace Cameroun, achat en ligne Cameroun, e-commerce Cameroun, livraison Douala, livraison Yaoundé, vendre en ligne Cameroun, MTN MoMo, Orange Money, prestataires Cameroun",
        jsonLd: [orgLd, webLd, marketplaceLd, homeFaqLd],
      };
    }

    if (page === "productDetail" && detailProduct) {
      const p = detailProduct;
      const img =
        p.image && String(p.image).startsWith("http")
          ? p.image
          : Array.isArray(p.image_urls) && p.image_urls[0]
            ? p.image_urls[0]
            : `${SITE_URL}/og-image.svg`;
      const desc =
        (p.description_fr && String(p.description_fr).slice(0, 158)) ||
        `Acheter ${p.name_fr || "ce produit"} sur Yorix — marketplace & livraison Cameroun.`;
      const productLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name_fr || "Produit Yorix",
        image: img,
        description: desc,
        brand: { "@type": "Brand", name: "Yorix CM" },
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}${canon}`,
          priceCurrency: "XAF",
          price: p.prix,
          availability: "https://schema.org/InStock",
        },
      };
      const productCrumb = buildBreadcrumbLd([
        { name: "Accueil", path: L("/") },
        { name: "Produits", path: L("/produits") },
        { name: p.name_fr || "Produit", path: canon },
      ]);
      return {
        title: `${p.name_fr || "Produit"} — achat en ligne Cameroun | Yorix.cm`,
        description: desc,
        canonicalPath: canon,
        ogType: "product",
        ogImage: img.startsWith("http") ? img : `${SITE_URL}/og-image.svg`,
        jsonLd: [productLd, productCrumb, orgLd],
      };
    }

    if (page === "notifications") {
      return {
        title: "Notifications — alertes commandes & messages | Yorix.cm",
        description:
          "Historique de vos alertes Yorix : commandes, paiements, livraisons, prestations et messages.",
        canonicalPath: L("/notifications"),
        noindex: true,
        jsonLd: [orgLd],
      };
    }

    if (page === "faq") {
      const faqLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Comment acheter sur Yorix au Cameroun ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Parcourez les produits, ajoutez au panier et finalisez via WhatsApp ou paiement mobile (MTN MoMo, Orange Money).",
            },
          },
          {
            "@type": "Question",
            name: "La livraison couvre quelles villes ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Douala, Yaoundé, Bafoussam, Bamenda, Kribi et un réseau national en expansion. Délais J+1 sur les grandes villes.",
            },
          },
          {
            "@type": "Question",
            name: "Comment fonctionne l’escrow Yorix ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Les fonds sont sécurisés jusqu’à confirmation de réception par l’acheteur, puis libérés au vendeur.",
            },
          },
        ],
      };
      return {
        title: "FAQ Yorix — marketplace, livraison, escrow Cameroun",
        description:
          "Réponses sur l’achat en ligne, la livraison, les prestataires, MTN MoMo, Orange Money et l’escrow sur Yorix.cm.",
        canonicalPath: L("/faq"),
        jsonLd: [faqLd, orgLd],
      };
    }

    if (page === "seoCity" && route.citySlug && CITY_BY_SLUG[route.citySlug]) {
      const cn = CITY_BY_SLUG[route.citySlug].name;
      const modes = {
        hub: {
          title: `Yorix ${cn} — marketplace, livraison & prestataires | Cameroun`,
          desc: `Marketplace à ${cn} : acheter en ligne, livraison, services et escrow. MTN MoMo, Orange Money — Yorix.cm.`,
        },
        acheter: {
          title: `Acheter en ligne à ${cn} — marketplace Yorix Cameroun`,
          desc: `Achat en ligne à ${cn} : produits vérifiés, paiement mobile, livraison. La marketplace camerounaise Yorix.`,
        },
        livraison: {
          title: `Livraison à ${cn} — livreur & colis | Yorix Ride Cameroun`,
          desc: `Service de livraison rapide à ${cn} et partout au Cameroun. Suivi, tarifs clairs — Yorix Ride.`,
        },
        prestataires: {
          title: `Prestataires à ${cn} — services à domicile | Yorix.cm`,
          desc: `Trouvez des prestataires vérifiés à ${cn} : plomberie, électricité, ménage, beauté, informatique…`,
        },
      };
      const m = modes[route.cityMode] || modes.hub;
      const localLd = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: `Yorix — ${cn}`,
        url: `${SITE_URL}${canon}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: cn,
          addressCountry: "CM",
        },
        areaServed: { "@type": "City", name: cn },
        parentOrganization: { "@type": "Organization", name: "Yorix CM" },
      };
      const cityCrumb = buildBreadcrumbLd([
        { name: "Accueil", path: L("/") },
        { name: cn, path: canon },
      ]);
      return {
        title: m.title,
        description: m.desc,
        canonicalPath: canon,
        keywords: `Yorix ${cn}, marketplace ${cn}, livraison ${cn}, e-commerce Cameroun`,
        jsonLd: [localLd, cityCrumb, orgLd],
      };
    }

    if (page === "merchHub" && route.merchHub) {
      const hub = getMerchHub(route.merchHub);
      const title = hub
        ? route.locale === "en"
          ? hub.titleEn
          : hub.titleFr
        : "Yorix.cm";
      const desc = hub ? (route.locale === "en" ? hub.descEn : hub.descFr) : "";
      const kw = hub?.keywordsFr || "marketplace Cameroun";
      const hubCrumb = buildBreadcrumbLd([
        { name: "Accueil", path: L("/") },
        { name: title.split("—")[0].trim(), path: canon },
      ]);
      return {
        title: `${title} | Yorix.cm`,
        description: desc,
        canonicalPath: canon,
        keywords: kw,
        jsonLd: [hubCrumb, orgLd, webLd],
      };
    }

    if (page === "produits" && route.categorySlug) {
      const catLabel =
        categoryFilter?.filterLabel ||
        slugToCategoryName(route.categorySlug, CATS) ||
        route.categorySlug.replace(/-/g, " ");
      const catCrumb = buildBreadcrumbLd([
        { name: "Accueil", path: L("/") },
        { name: "Produits", path: L("/produits") },
        { name: catLabel, path: canon },
      ]);
      return {
        title: `${catLabel} — achat en ligne Cameroun | Yorix.cm marketplace`,
        description: `Catégorie ${catLabel} sur Yorix.cm : e-commerce & marketplace Cameroun, livraison Douala, Yaoundé, paiement MTN MoMo & Orange Money.`,
        canonicalPath: canon,
        keywords: `${catLabel}, produits Cameroun, achat en ligne, marketplace Cameroun, e-commerce Cameroun`,
        jsonLd: [catCrumb, orgLd, webLd],
      };
    }

    if (page === "blog" && route.blogSlug && !getBlogArticle(route.blogSlug)) {
      return {
        title: "Article — Blog Yorix Cameroun",
        description:
          "Guides marketplace, livraison & e-commerce au Cameroun. Retrouvez les articles officiels sur le blog Yorix.cm.",
        canonicalPath: canon,
        noindex: true,
        jsonLd: [orgLd],
      };
    }

    const fallbackTitle = {
      produits: "Produits — marketplace en ligne Cameroun | Yorix.cm",
      livraison: "Livraison Cameroun — livreurs Yorix Ride | Douala, Yaoundé",
      escrow: "Escrow Cameroun — paiement sécurisé marketplace | Yorix.cm",
      prestataires: "Prestataires Cameroun — services à domicile vérifiés | Yorix.cm",
      business: "Yorix Business — solutions B2B marketplace Cameroun",
      blog: "Blog Yorix — guides marketplace & e-commerce Cameroun",
      academy: "Yorix Academy — formations e-commerce Cameroun",
      loyalty: "Fidélité Yorix — points & récompenses",
      contact: "Contact Yorix — support marketplace Cameroun",
      aide: "Centre d'aide Yorix — marketplace & livraison Cameroun",
      faq: "FAQ Yorix — achat, livraison, escrow, vendeurs | Cameroun",
      cgv: "CGV Yorix.cm — conditions générales de vente",
      confidentialite: "Politique de confidentialité — Yorix.cm",
      mentions: "Mentions légales — Yorix.cm",
      devenirVendeur: "Devenir vendeur sur Yorix — marketplace Cameroun",
      devenirLivreur: "Devenir livreur Yorix Ride — livraison Cameroun",
      inscription: "Devenir prestataire Yorix — services Cameroun",
    };
    const fallbackDescription = {
      produits:
        "Catalogue Yorix.cm : produits locaux et importés au Cameroun, vendeurs vérifiés, paiement MTN MoMo/Orange Money, escrow et livraison.",
      livraison:
        "Yorix Ride organise vos courses et colis au Cameroun avec suivi, livreurs assignés et couverture prioritaire Douala, Yaoundé, Bafoussam.",
      escrow:
        "Protection escrow Yorix : le paiement reste sécurisé jusqu'à réception, pour des achats marketplace plus fiables au Cameroun.",
      prestataires:
        "Trouvez des prestataires au Cameroun : beauté, réparation, IT, nettoyage, BTP et services à domicile avec profils vérifiés.",
      business:
        "Yorix Business accompagne vendeurs, marques et PME camerounaises avec visibilité marketplace, outils digitaux et programmes partenaires.",
      blog:
        "Guides Yorix sur l'e-commerce au Cameroun : vendre en ligne, livraison, Mobile Money, escrow, logistique et croissance locale.",
      academy:
        "Yorix Academy forme vendeurs et entrepreneurs camerounais : boutique en ligne, photos produits, ventes, data et marketing.",
      loyalty:
        "Programme fidélité Yorix : cumulez des points sur vos achats, services et interactions, puis débloquez des récompenses.",
      contact:
        "Contact Yorix.cm : WhatsApp (+237 696 56 56 54), téléphone, email support@yorix.cm — aide commande, remboursement, escrow, livraison Douala & Yaoundé.",
      aide:
        "Centre d'aide Yorix.cm : acheter, vendre, livraison Yorix Ride, fidélité points, escrow MoMo & Orange Money — guides et FAQ marketplace Cameroun.",
      cgv:
        "Conditions générales de vente Yorix.cm : commandes, paiements, livraison, escrow, litiges et responsabilités marketplace au Cameroun.",
      confidentialite:
        "Politique de confidentialité Yorix.cm : données collectées, finalités, sécurité Supabase, droits utilisateurs et contact DPO/support.",
      mentions:
        "Mentions légales Yorix.cm : éditeur, hébergement Vercel/Supabase/Cloudinary, propriété intellectuelle, cookies et contact.",
      devenirVendeur:
        "Devenir vendeur sur Yorix.cm : créez votre boutique marketplace, gagnez en visibilité et encaissez via Mobile Money au Cameroun.",
      devenirLivreur:
        "Devenir livreur Yorix Ride : rejoignez le réseau de livraison au Cameroun, recevez des missions et suivez vos gains.",
      inscription:
        "Devenir prestataire Yorix : proposez vos services au Cameroun, recevez des demandes clients et développez votre activité locale.",
      bonsPlans:
        "Bons plans Yorix.cm : promotions, livraison offerte, produits tendance et offres marketplace au Cameroun.",
    };
    const fallbackCrumbLabel = {
      produits: "Produits",
      livraison: "Livraison",
      escrow: "Escrow & sécurité",
      prestataires: "Prestataires",
      business: "Business",
      blog: "Blog",
      academy: "Academy",
      loyalty: "Fidélité",
      contact: "Contact",
      aide: "Centre d'aide",
      faq: "FAQ",
      cgv: "CGV",
      confidentialite: "Confidentialité",
      mentions: "Mentions légales",
      devenirVendeur: "Devenir vendeur",
      devenirLivreur: "Devenir livreur",
      inscription: "Devenir prestataire",
      bonsPlans: "Bons plans",
    };
    const ft = fallbackTitle[page];
    if (ft) {
      const crumbLabel = fallbackCrumbLabel[page];
      const pageBc = crumbLabel
        ? buildBreadcrumbLd([
            { name: "Accueil", path: L("/") },
            { name: crumbLabel, path: PAGE_PATH[page] ? L(PAGE_PATH[page]) : canon },
          ])
        : null;
      return {
        title: ft,
        description:
          fallbackDescription[page] ||
          "Yorix.cm — marketplace & super-app pour acheter, vendre, se faire livrer et trouver des prestataires au Cameroun. MTN MoMo, Orange Money, escrow.",
        canonicalPath:
          page === "blog" && route.blogSlug ? canon : PAGE_PATH[page] ? L(PAGE_PATH[page]) : canon,
        jsonLd: [pageBc, orgLd, page === "produits" ? webLd : null].filter(Boolean),
      };
    }

    return {
      title: "Yorix CM — Marketplace #1 au Cameroun",
      description:
        "Marketplace camerounaise : produits, livraison, prestataires, escrow MTN MoMo & Orange Money.",
      canonicalPath: canon,
      jsonLd: [orgLd],
    };
  }, [
    page,
    route.canonicalPath,
    route.citySlug,
    route.cityMode,
    route.blogSlug,
    route.seoAliasKey,
    route.categorySlug,
    route.locale,
    location.pathname,
    detailProduct,
  ]);

  const pagesCtx = {
    page,
    route,
    user,
    userData,
    userRole,
    dark,
    goPage,
    filterCat,
    setFilterCat,
    categoryFilter,
    setCategoryFilter,
    categoryTree,
    categoryFlat,
    categoryLoading,
    reloadCategories,
    goToCategory,
    search,
    setSearch,
    produits,
    produitsLoading,
    wishlist,
    addToCart,
    toggleWish,
    openProductUrl,
    setOnboardingOpen,
    allServices,
    nlEmail,
    setNlEmail,
    nlSent,
    setNlSent,
    commerceDeliveryPolicy,
    showSeoLocal,
    detailProduct,
    detailProductLoading,
    needsProductListingChunk,
    showProduits,
    seoCityName,
    produitsFiltres,
    showLivraison,
    showPrestataires,
    selectedPrest,
    setSelectedPrest,
    prestSyncFilters,
    addServiceToCart,
    cartItems,
    cartSummary,
    changeQty,
    removeItem,
    setCartItems,
    persistCheckoutContact,
    setAuthTab,
    setSelectedRole,
    setAuthOpen,
    setDemandeLivraisonOpen,
    notifs,
    marquerNotifLue,
    openNotificationTarget,
    marquerToutesLues,
    supprimerNotif,
    loadNotifsForUser,
    setNotifPrefs,
    isSiteMarketingPage,
    inscriptionSent,
    setInscriptionSent,
    inscriptionForm,
    setInscriptionForm,
    inscriptionError,
    inscriptionLoading,
    soumettreCandidaturePrestataire,
    academyCourses,
    academyLoading,
    goAcademyDetail,
    blogFilter,
    setBlogFilter,
    selectedCourse,
    goAcademyContact,
    dashTab,
    setDashTab,
    pendingChatConversationId,
    setPendingChatConversationId,
    getDashNav,
    roleChipClass,
    doLogout,
    loyaltyPts,
    setLoyaltyPts,
    totalQty,
    tabActive,
    unread,
    openCart,
    cartDrawerOpen,
    closeCartDrawer,
  };


  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"'DM Sans',sans-serif", color:"#1a6b3a", gap:12 }}>
      <div style={{ width:40, height:40, border:"4px solid #e2ddd6", borderTopColor:"#1a6b3a", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
      Chargement de Yorix...
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );

  return (
    <>
      <style>{makeCSS(dark)}</style>
      <SeoHead
        title={seoBundle.title}
        description={seoBundle.description}
        canonicalPath={seoBundle.canonicalPath}
        keywords={seoBundle.keywords}
        ogType={seoBundle.ogType || "website"}
        jsonLd={seoBundle.jsonLd}
        noindex={seoBundle.noindex}
        locale={route.locale}
        hrefLangAlternates={hrefLangAlternates}
      />

      {/* ── CONTRACT ACCEPTANCE MODAL ── */}
      <ContractAcceptance
        open={contractOpen}
        onClose={() => {
          setContractOpen(false);
          setAuthLoading(false);
          setAuthError("Vous devez accepter le contrat pour finaliser votre inscription.");
        }}
        onAccepted={handleContractAccepted}
        user={user}
        userData={userData}
        role={selectedRole}
        authForm={authForm}
      />

      {/* ── ONBOARDING MODAL ── */}
      <OnboardingModal
        open={onboardingOpen}
        onClose={handleCloseOnboarding}
        onSelectAction={handleOnboardingAction}
        user={user}
      />

      {/* ── MODAL DEMANDE LIVRAISON ── */}
      {demandeLivraisonOpen && (
        <ModalDemandeLivraison
          user={user}
          userData={userData}
          siteLocale={route.locale}
          onClose={() => setDemandeLivraisonOpen(false)}
          onSuccess={(code) => {
            console.log("Livraison créée avec code:", code);
          }}
        />
      )}

      <YorixAuthModal
        authOpen={authOpen}
        setAuthOpen={setAuthOpen}
        authTab={authTab}
        setAuthTab={setAuthTab}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        authForm={authForm}
        setAuthForm={setAuthForm}
        authError={authError}
        setAuthError={setAuthError}
        authLoading={authLoading}
        doLogin={doLogin}
        doRegister={doRegister}
        doGoogle={doGoogle}
      />

      {/* ── EN-TÊTE STICKY (marketplace fluide desktop + mobile) ── */}
      <YorixHeader
        navCompact={navCompact}
        dark={dark}
        setDark={setDark}
        user={user}
        userData={userData}
        userRole={userRole}
        goPage={goPage}
        siteLocale={route.locale}
        switchLocale={switchLocale}
        filterCat={filterCat}
        setFilterCat={setFilterCat}
        categoryTree={categoryTree}
        goToCategory={goToCategory}
        search={search}
        setSearch={setSearch}
        produits={produits}
        setOnboardingOpen={setOnboardingOpen}
        onNotifsSync={() => user?.id && loadNotifsForUser(user.id)}
        notifRevision={notifRevision}
        unreadNotifs={unread}
        onOpenNotification={openNotificationTarget}
        onMarkNotifRead={marquerNotifLue}
        totalQty={totalQty}
        openCart={openCart}
        onOpenUserMenu={() => setUserMenuOpen(true)}
        setAuthTab={setAuthTab}
        setAuthOpen={setAuthOpen}
        setSelectedRole={setSelectedRole}
        doLogout={doLogout}
        navQuickRef={navQuickRef}
        navQuickOpen={navQuickOpen}
        setNavQuickOpen={setNavQuickOpen}
        TABS={TABS}
        tabActive={tabActive}
        commerceDeliveryPolicy={commerceDeliveryPolicy}
        roleChipClass={roleChipClass}
      />

      <RouteErrorBoundary resetKeys={[page, location.pathname]}>
        <YorixPages ctx={pagesCtx} />
      </RouteErrorBoundary>

      <CartDrawer
        open={cartDrawerOpen}
        onClose={closeCartDrawer}
        cartItems={cartItems}
        cartSummary={cartSummary}
        changeQty={changeQty}
        removeItem={removeItem}
        goPage={goPage}
        totalQty={totalQty}
      />

      <UserMenuDrawer
        open={userMenuOpen}
        onClose={() => setUserMenuOpen(false)}
        user={user}
        userData={userData}
        userRole={userRole}
        orderCount={orderCount}
        loyaltyPoints={userData?.points ?? loyaltyPts}
        wishlistCount={wishlist.size}
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        siteLocale={route.locale}
        onChangeLocale={switchLocale}
        onLogout={doLogout}
        goPage={goPage}
        goDash={goDash}
        onOpenAuth={() => {
          setAuthTab("login");
          setAuthOpen(true);
        }}
        setOnboardingOpen={setOnboardingOpen}
      />

      <PremiumSiteFooter goPage={goPage} freeShippingThresholdXaf={commerceDeliveryPolicy.freeShippingThresholdXaf} />
    </>
  );
}
