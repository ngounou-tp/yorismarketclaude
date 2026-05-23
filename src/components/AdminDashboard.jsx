import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { ROLE_LABELS, CATS } from "../lib/constants";
import { deliveryTrackingPath } from "../lib/seoRoutes";
import {
  isAdminViewer,
  canWriteAdmin,
  ROLE_ADMIN_PARTNER,
  ADMIN_ROLE_LABELS,
} from "../lib/roles";
import { LoyaltyAdminTab } from "./LoyaltyAdminTab";
import { ModalEditDelivery } from "./ModalEditDelivery";
import { useCategoryTaxonomy } from "../hooks/useCategoryTaxonomy";
import { AdminCategoryManager } from "./admin/AdminCategoryManager";
import { AdminBroadcastPanel } from "./admin/AdminBroadcastPanel";
import { AdminPackModeration } from "./admin/AdminPackModeration";
import "./admin/adminPackModeration.css";
import {
  getStatutConfig,
  adminAssignerLivreur,
  adminEditerLivraison,
  adminChangerStatut,
  adminAnnulerLivraison,
  openWhatsApp,
  buildMsgLivreurAssignation,
} from "../utils/deliveryWorkflow";
import {
  updateProduct,
  toggleProductActive,
  deleteProduct,
} from "../lib/catalogMutations";
import {
  updateUserRole,
  toggleUserActive,
  toggleUserVerified,
  softBanUser,
  hardDeleteUser,
} from "../lib/userMutations";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : ADMIN DASHBOARD — Yorix CM (version pro complète)
// ─────────────────────────────────────────────────────────────
export function AdminDashboard({ user, userData, goPage }) {
  const { t } = useTranslation("admin");
  const location = useLocation();
  const { flat: categoryFlat, tree: categoryTree, loading: catLoading } = useCategoryTaxonomy();
  const [catReload, setCatReload] = useState(0);
  // ═══════════ ÉTATS PRINCIPAUX ═══════════
  const [adminTab, setAdminTab]     = useState("overview");

  const ADMIN_TABS = useMemo(
    () => [
      "overview", "deliveries", "livreurs", "categories", "packs", "produits",
      "commandes", "utilisateurs", "vendeurs", "prestataires", "revenus",
      "commerce_promo", "loyalty", "messagerie", "notif_center", "alertes",
    ],
    [],
  );

  useEffect(() => {
    try {
      const tab = new URLSearchParams(location.search).get("tab");
      if (tab && ADMIN_TABS.includes(tab)) setAdminTab(tab);
    } catch {
      /* ignore */
    }
  }, [location.search, ADMIN_TABS]);
  const [loading, setLoading]       = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast]           = useState(null);
  const [loadError, setLoadError]   = useState(null);

  // ═══════════ DONNÉES ═══════════
  const [stats, setStats] = useState({
    users: 0, products: 0, orders: 0, deliveries: 0,
    revenue: 0, revenueToday: 0, revenueWeek: 0, commissionTotal: 0,
    vendeurs: 0, livreurs: 0, buyers: 0, providers: 0,
    ruptures: 0, enAttente: 0, livrees: 0,
  });
  const [produits, setProduits]                 = useState([]);
  const [utilisateurs, setUtilisateurs]         = useState([]);
  const [commandes, setCommandes]               = useState([]);
  const [adminDeliveries, setAdminDeliveries]   = useState([]);
  const [adminLivreurs, setAdminLivreurs]       = useState([]);
  const [prestatairesList, setPrestatairesList] = useState([]);
  const [chartVentes, setChartVentes]           = useState([]);
  const [chartInscrits, setChartInscrits]       = useState([]);
  const [topProduits, setTopProduits]           = useState([]);
  const [paymentTx, setPaymentTx]               = useState([]);
  const [deliveryPromoStats, setDeliveryPromoStats] = useState({
    ordersWithShippable: 0,
    freeShippingOrders: 0,
    paidShippingOrders: 0,
    avgBasketShippable: 0,
    estimatedLogisticsSubsidy: 0,
  });
  const [notifStackStats, setNotifStackStats] = useState({
    notifsWeek: 0,
    pushDevices: 0,
    deliveryLogsWeek: 0,
  });
  const [commerceForm, setCommerceForm]         = useState({
    threshold: 50000,
    fee: 1500,
    stockOutGraceDays: 30,
    stockLowThreshold: 5,
    stockAutoArchive: true,
    stockHardDelete: false,
    stockReminderDaysCsv: "1,15,25",
    stockPremiumSellerExempt: true,
  });

  // ═══════════ FILTRES ═══════════
  const [searchProd, setSearchProd]             = useState("");
  const [filterProdCat, setFilterProdCat]       = useState("");
  const [filterProdStatut, setFilterProdStatut] = useState("");
  const [searchUser, setSearchUser]             = useState("");
  const [filterRole, setFilterRole]             = useState("");
  const [filterOrder, setFilterOrder]           = useState("");
  const [sortOrder, setSortOrder]               = useState("desc");
  const [adminDelivFilter, setAdminDelivFilter] = useState("all");
  const [prestFilter, setPrestFilter]           = useState("pending");

  // ═══════════ MODALS ═══════════
  const [selectedProd, setSelectedProd]       = useState(null);
  const [selectedOrder, setSelectedOrder]     = useState(null);
  const [selectedUser, setSelectedUser]       = useState(null);
  const [selectedPrest, setSelectedPrest]     = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(null);
  const [editDelivery, setEditDelivery]       = useState(null);

  const isAuthorized = Boolean(user && isAdminViewer(userData));
  const canWrite = canWriteAdmin(userData);
  const isPartnerReadOnly = isAuthorized && !canWrite;

  // ═══════════ TOAST ═══════════
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const requireWrite = () => {
    if (canWrite) return true;
    showToast("Mode partenaire — consultation uniquement", "error");
    return false;
  };

  // ═══════════ CHARGEMENT DES DONNÉES ═══════════
  useEffect(() => {
    if (!isAuthorized) return;
    loadAll();
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- loadAll stable enough pour refreshKey */
  }, [refreshKey, isAuthorized]);

  const loadAll = async () => {
    setLoading(true);
    setLoadError(null);

    try {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);

      const results = await Promise.allSettled([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("products").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase.from("deliveries").select("*").order("commande_at", { ascending: false }).limit(500),
        supabase.from("prestataires").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("admin_finance_kpis").select("*").maybeSingle(),
        supabase.from("payment_transactions").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase
          .from("checkout_intents")
          .select("subtotal,delivery_fee,total,status,payload,created_at")
          .order("created_at", { ascending: false })
          .limit(650),
        supabase.from("commerce_settings").select("*").eq("id", 1).maybeSingle(),
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
        supabase
          .from("notification_delivery_log")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
      ]);

      const [
        profilesR,
        prodsR,
        ordersR,
        delivsR,
        prestsR,
        financeKpiR,
        paymentsR,
        intentsR,
        commerceSetR,
        notifsWeekR,
        pushSubsR,
        delivLogR,
      ] = results;

      const rawProfiles = profilesR.status === "fulfilled" ? (profilesR.value.data || []) : [];
      const prodsData   = prodsR.status    === "fulfilled" ? (prodsR.value.data    || []) : [];
      const ordersData  = ordersR.status   === "fulfilled" ? (ordersR.value.data   || []) : [];
      const delivsData  = delivsR.status   === "fulfilled" ? (delivsR.value.data   || []) : [];
      const prestsData  = prestsR.status   === "fulfilled" ? (prestsR.value.data   || []) : [];
      const financeKpi =
        financeKpiR.status === "fulfilled" ? (financeKpiR.value.data || null) : null;
      const paymentsData = paymentsR.status === "fulfilled" ? (paymentsR.value.data || []) : [];
      const intentsData = intentsR.status === "fulfilled" ? (intentsR.value.data || []) : [];
      const commerceRow = commerceSetR.status === "fulfilled" ? commerceSetR.value.data : null;

      const pickCount = (r) => {
        if (r.status !== "fulfilled") return 0;
        const v = r.value;
        if (v?.error) return 0;
        return typeof v.count === "number" ? v.count : 0;
      };
      setNotifStackStats({
        notifsWeek: pickCount(notifsWeekR),
        pushDevices: pickCount(pushSubsR),
        deliveryLogsWeek: pickCount(delivLogR),
      });

      let freeShip = 0;
      let paidShip = 0;
      let withShippable = 0;
      let subShipAgg = 0;
      for (const r of intentsData) {
        const items = Array.isArray(r.payload?.items) ? r.payload.items : [];
        if (!items.some((i) => i.kind === "product")) continue;
        withShippable++;
        subShipAgg += Number(r.subtotal || 0);
        if (Number(r.delivery_fee || 0) === 0) freeShip++;
        else paidShip++;
      }
      const feeBench = Number(commerceRow?.standard_delivery_fee_xaf) || 1500;
      setDeliveryPromoStats({
        ordersWithShippable: withShippable,
        freeShippingOrders: freeShip,
        paidShippingOrders: paidShip,
        avgBasketShippable: withShippable ? Math.round(subShipAgg / withShippable) : 0,
        estimatedLogisticsSubsidy: freeShip * feeBench,
      });
      if (commerceRow) {
        setCommerceForm({
          threshold: Number(commerceRow.free_shipping_threshold_xaf) || 50000,
          fee: Number(commerceRow.standard_delivery_fee_xaf) || 1500,
          stockOutGraceDays: Number(commerceRow.stock_out_grace_days) || 30,
          stockLowThreshold: Number(commerceRow.stock_low_threshold) || 5,
          stockAutoArchive: commerceRow.stock_auto_archive !== false,
          stockHardDelete: commerceRow.stock_hard_delete === true,
          stockReminderDaysCsv: commerceRow.stock_reminder_days_csv || "1,15,25",
          stockPremiumSellerExempt: commerceRow.stock_premium_seller_exempt !== false,
        });
      }

      const usersData = rawProfiles.map((p) => ({ ...p, uid: p.id }));

      const livreursData = usersData.filter(u => u.role === "delivery");

      const commissionTotal = financeKpi?.yorix_commission_total ?? ordersData.reduce((s, o) => s + (o.commission || 0), 0);
      const revenueTotal    = financeKpi?.volume_total ?? ordersData.reduce((s, o) => s + (o.montant || 0), 0);
      const revenueToday    = ordersData.filter(o => new Date(o.created_at) >= today).reduce((s, o) => s + (o.commission || 0), 0);
      const revenueWeek     = ordersData.filter(o => new Date(o.created_at) >= weekAgo).reduce((s, o) => s + (o.commission || 0), 0);

      const chartV = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - 6 + i); d.setHours(0, 0, 0, 0);
        const next = new Date(d); next.setDate(next.getDate() + 1);
        const orders = ordersData.filter(o => { const t = new Date(o.created_at); return t >= d && t < next; });
        return {
          label:   d.toLocaleDateString("fr-FR", { weekday: "short" }),
          orders:  orders.length,
          revenue: orders.reduce((s, o) => s + (o.commission || 0), 0),
        };
      });

      const chartI = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - 6 + i); d.setHours(0, 0, 0, 0);
        const next = new Date(d); next.setDate(next.getDate() + 1);
        const cnt = usersData.filter(u => { const t = new Date(u.created_at); return t >= d && t < next; }).length;
        return { label: d.toLocaleDateString("fr-FR", { weekday: "short" }), val: cnt };
      });

      const topP = prodsData
        .filter(p => (p.vente_total || 0) > 0)
        .sort((a, b) => (b.vente_total || 0) - (a.vente_total || 0))
        .slice(0, 5);

      setStats({
        users:          usersData.length,
        products:       prodsData.length,
        orders:         ordersData.length,
        deliveries:     delivsData.length,
        revenue:        revenueTotal,
        commissionTotal,
        revenueToday,
        revenueWeek,
        vendeurs:       usersData.filter(u => u.role === "seller").length,
        livreurs:       livreursData.length,
        buyers:         usersData.filter(u => u.role === "buyer" || !u.role).length,
        providers:      usersData.filter(u => u.role === "provider").length,
        ruptures:       prodsData.filter(p => (p.stock || 0) === 0).length,
        enAttente:      ordersData.filter(o => o.status === "pending").length,
        livrees:        ordersData.filter(o => o.status === "livre").length,
      });
      setUtilisateurs(usersData);
      setProduits(prodsData);
      setCommandes(ordersData);
      setAdminDeliveries(delivsData);
      setAdminLivreurs(livreursData);
      setPrestatairesList(prestsData);
      setChartVentes(chartV);
      setChartInscrits(chartI);
      setTopProduits(topP);
      setPaymentTx(paymentsData);

      if (usersData.length === 0 && prodsData.length === 0 && ordersData.length === 0) {
        setLoadError("⚠️ Aucune donnée chargée. Vérifiez les politiques RLS Supabase (profiles, products, orders).");
      }
    } catch (e) {
      console.error("[Admin] ❌ Erreur critique:", e);
      setLoadError("Erreur : " + e.message);
      showToast("Erreur de chargement", "error");
    }
    setLoading(false);
  };

  // ═══════════ REALTIME DELIVERIES ═══════════
  useEffect(() => {
    if (!isAuthorized) return undefined;
    const channel = supabase
      .channel("admin-deliveries-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "deliveries" }, () => {
        supabase.from("deliveries").select("*").order("commande_at", { ascending: false }).limit(500)
          .then(({ data }) => { if (data) setAdminDeliveries(data); });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [isAuthorized]);

  // ═══════════ ACTIONS LIVRAISONS (workflow centralisé) ═══════════
  const assignerLivreur = async (delivery, livreur) => {
    if (!requireWrite()) return;
    try {
      const { delivery: updated, waOpened } = await adminAssignerLivreur({
        delivery,
        livreur,
        acteurId: user?.id,
        openWhatsAppFallback: true,
      });
      setAdminDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast(
        waOpened
          ? `✅ ${livreur.nom} assigné · WhatsApp envoyé`
          : `✅ ${livreur.nom} assigné · notification in-app envoyée`
      );
      setAssignModalOpen(null);
      setEditDelivery(null);
    } catch (err) {
      showToast("Erreur : " + (err.message || "Assignation impossible"), "error");
    }
  };

  const assignerLivreurManuel = async (delivery) => {
    if (!requireWrite()) return;
    const nom = window.prompt("Nom du livreur :");
    if (!nom || !nom.trim()) return;
    const tel = window.prompt("Téléphone du livreur (+237...) :");
    if (!tel || !tel.trim()) return;

    try {
      const { delivery: updated, waOpened } = await adminAssignerLivreur({
        delivery,
        livreur: { id: null, nom: nom.trim(), telephone: tel.trim(), vehicule: "Moto" },
        acteurId: user?.id,
        openWhatsAppFallback: true,
      });
      setAdminDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast(
        waOpened
          ? `✅ ${nom} assigné manuellement · WhatsApp envoyé`
          : `✅ ${nom} assigné manuellement`
      );
      setAssignModalOpen(null);
    } catch (err) {
      showToast("Erreur : " + (err.message || "Assignation impossible"), "error");
    }
  };

  const changerStatutLivraison = async (delivery, newStatut) => {
    if (!requireWrite()) return;
    try {
      const updated = await adminChangerStatut({
        delivery,
        nouveauStatut: newStatut,
        acteurId: user?.id,
        notifyClient: true,
      });
      setAdminDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast(`✅ Statut → ${getStatutConfig(newStatut).label}`);
    } catch (err) {
      showToast("Erreur : " + (err.message || "Mise à jour impossible"), "error");
    }
  };

  const sauvegarderEditionLivraison = async (form) => {
    if (!requireWrite()) return;
    if (!editDelivery) return;
    try {
      const updated = await adminEditerLivraison({
        delivery: editDelivery,
        patch:    form,
        acteurId: user?.id,
      });
      setAdminDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast("✅ Livraison mise à jour");
      setEditDelivery(updated);
    } catch (err) {
      showToast("Erreur : " + (err.message || "Mise à jour impossible"), "error");
    }
  };

  const retirerLivreur = async () => {
    if (!requireWrite()) return;
    if (!editDelivery) return;
    if (!window.confirm(`Retirer le livreur ${editDelivery.livreur_nom || ""} de la mission ${editDelivery.code_suivi} ?`)) return;
    try {
      const updated = await adminEditerLivraison({
        delivery: editDelivery,
        patch: {
          livreur_id:       null,
          livreur_nom:      null,
          livreur_tel:      null,
          livreur_vehicule: null,
          assigne_at:       null,
          accepte_at:       null,
          statut:           "commande_recue",
        },
        acteurId: user?.id,
      });
      setAdminDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast("Livreur retiré · mission disponible");
      setEditDelivery(updated);
    } catch (err) {
      showToast("Erreur : " + (err.message || "Impossible de retirer"), "error");
    }
  };

  const annulerLivraisonAdmin = async (motif) => {
    if (!requireWrite()) return;
    if (!editDelivery) return;
    try {
      const updated = await adminAnnulerLivraison({
        delivery: editDelivery,
        motif,
        acteurId: user?.id,
      });
      setAdminDeliveries(prev => prev.map(d => d.id === updated.id ? updated : d));
      showToast("❌ Livraison annulée");
      setEditDelivery(null);
    } catch (err) {
      showToast("Erreur : " + (err.message || "Annulation impossible"), "error");
    }
  };

  const renvoyerWhatsAppLivreur = (delivery) => {
    if (!delivery?.livreur_tel) {
      showToast("Aucun numéro de livreur", "error");
      return;
    }
    const ok = openWhatsApp(delivery.livreur_tel, buildMsgLivreurAssignation(delivery));
    showToast(ok ? "📱 WhatsApp ouvert" : "Numéro invalide", ok ? "success" : "error");
  };

  // ═══════════ ACTIONS PRODUITS ═══════════
  const supprimerProduit = async (id, nom) => {
    if (!requireWrite()) return;
    if (!window.confirm(`Supprimer / archiver le produit "${nom}" ?`)) return;
    const hardDelete = window.confirm(
      "Suppression DÉFINITIVE de la base ?\n\nOK = supprimer (si aucune commande)\nAnnuler = archiver uniquement",
    );
    const res = await deleteProduct({
      productId: id,
      actor: { userId: user?.id, profile: userData },
      hardDelete,
    });
    if (!res.ok) { showToast("Erreur : " + res.error, "error"); return; }
    if (res.mode === "soft") {
      setProduits(p => p.map(x => x.id === id ? {
        ...x,
        actif: false,
        is_archived: true,
        hidden_from_marketplace: true,
      } : x));
      showToast(res.hasOrders ? `Produit archivé (commandes existantes)` : `Produit "${nom}" désactivé`);
    } else {
      setProduits(p => p.filter(x => x.id !== id));
      showToast(`Produit "${nom}" supprimé définitivement`);
    }
  };

  const toggleActifProduit = async (id, actif) => {
    if (!requireWrite()) return;
    const res = await toggleProductActive({
      productId: id,
      currentActive: actif,
      actor: { userId: user?.id, profile: userData },
    });
    if (!res.ok) { showToast("Erreur : " + res.error, "error"); return; }
    setProduits(p => p.map(x => x.id === id ? { ...x, actif: !actif } : x));
    showToast(actif ? "Produit désactivé" : "Produit activé");
  };

  const setMadeInCameroonStatus = async (id, status) => {
    if (!requireWrite()) return;
    const payload = {
      made_in_cameroon_status: status,
      is_made_in_cameroon: status === "verified" || status === "declared" || status === "auto",
      local: status === "verified" || status === "declared" || status === "auto",
      made_in_cameroon_verified_at: status === "verified" ? new Date().toISOString() : null,
    };
    const res = await updateProduct({
      productId: id,
      payload,
      actor: { userId: user?.id, profile: userData },
    });
    if (!res.ok) {
      showToast("Erreur MIC : " + res.error, "error");
      return;
    }
    setProduits((p) => p.map((x) => (x.id === id ? { ...x, ...payload } : x)));
    showToast(
      status === "verified"
        ? "🇨🇲✔ Made in Cameroun vérifié"
        : status === "rejected"
          ? "Badge Made in Cameroun refusé"
          : "Statut Made in Cameroun mis à jour",
    );
  };

  // ═══════════ ACTIONS UTILISATEURS (profiles uniquement) ═══════════
  const changerRole = async (uid, newRole) => {
    if (!requireWrite()) return;
    const res = await updateUserRole({ userId: uid, newRole, actorProfile: userData });
    if (!res.ok) { showToast("Erreur changement rôle : " + res.error, "error"); return; }
    setUtilisateurs(u => u.map(x => (x.uid || x.id) === uid ? { ...x, role: newRole } : x));
    showToast(`Rôle changé → ${ADMIN_ROLE_LABELS[newRole] || newRole}`);
  };

  const supprimerUser = async (uid, email) => {
    if (!requireWrite()) return;
    const hard = window.confirm(
      `Suppression DÉFINITIVE de "${email}" ?\n\nOK = anonymisation irréversible\nAnnuler = suspension réversible uniquement`,
    );
    if (hard) {
      if (!window.confirm(`Confirmer la suppression définitive de "${email}" ?`)) return;
      const res = await hardDeleteUser({ userId: uid, actorProfile: userData });
      if (!res.ok) { showToast("Erreur : " + res.error, "error"); return; }
      setUtilisateurs(u => u.map(x => (x.uid || x.id) === uid ? {
        ...x,
        actif: false,
        deleted_at: new Date().toISOString(),
        nom: "Utilisateur supprimé",
        email: `deleted+${uid}@yorix.local`,
      } : x));
      showToast("Utilisateur supprimé définitivement (profil anonymisé)");
      return;
    }
    if (!window.confirm(`Suspendre "${email}" ? (réversible)`)) return;
    const res = await softBanUser({ userId: uid, actorProfile: userData });
    if (!res.ok) { showToast("Erreur : " + res.error, "error"); return; }
    setUtilisateurs(u => u.map(x => (x.uid || x.id) === uid ? { ...x, actif: false } : x));
    showToast(`Utilisateur "${email}" suspendu`);
  };

  const toggleVendeur = async (uid, actif) => {
    if (!requireWrite()) return;
    const res = await toggleUserActive({ userId: uid, currentlyActive: actif, actorProfile: userData });
    if (!res.ok) { showToast("Erreur : " + res.error, "error"); return; }
    setUtilisateurs(u => u.map(x => (x.uid || x.id) === uid ? { ...x, actif: !actif } : x));
    showToast(actif ? "Compte suspendu" : "Compte réactivé");
  };

  const verifierUser = async (uid, verifie) => {
    if (!requireWrite()) return;
    const res = await toggleUserVerified({ userId: uid, currentlyVerified: verifie, actorProfile: userData });
    if (!res.ok) { showToast("Erreur vérification", "error"); return; }
    setUtilisateurs(u => u.map(x => (x.uid || x.id) === uid ? { ...x, verifie: !verifie } : x));
    showToast(verifie ? "Vérification retirée" : "Utilisateur vérifié ✅");
  };

  // ═══════════ ACTIONS COMMANDES ═══════════
  const validerCommande = async (id) => {
    if (!requireWrite()) return;
    const { error } = await supabase.from("orders").update({ status: "validee" }).eq("id", id);
    if (error) { showToast("Erreur : " + error.message, "error"); return; }
    setCommandes(c => c.map(x => x.id === id ? { ...x, status: "validee" } : x));
    showToast("Commande validée ✅");
  };

  const marquerLivre = async (id) => {
    if (!requireWrite()) return;
    const { error } = await supabase.from("orders").update({ status: "livre", livraison_status: "livre", escrow_status: "libere" }).eq("id", id);
    if (error) { showToast("Erreur : " + error.message, "error"); return; }
    setCommandes(c => c.map(x => x.id === id ? { ...x, status: "livre", livraison_status: "livre", escrow_status: "libere" } : x));
    showToast("Commande marquée livrée 📦");
  };

  const annulerCommande = async (id) => {
    if (!requireWrite()) return;
    if (!window.confirm("Annuler cette commande ?")) return;
    const { error } = await supabase.from("orders").update({ status: "annulee" }).eq("id", id);
    if (error) { showToast("Erreur : " + error.message, "error"); return; }
    setCommandes(c => c.map(x => x.id === id ? { ...x, status: "annulee" } : x));
    showToast("Commande annulée");
  };

  // ═══════════ EXPORT CSV ═══════════
  const exportCSV = (data, filename) => {
    if (!data.length) { showToast("Aucune donnée à exporter", "error"); return; }
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(row => keys.map(k => `"${(row[k] || "").toString().replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
    showToast(`Export ${filename} téléchargé`);
  };

  // ═══════════ FILTRES CALCULÉS ═══════════
  const produitsFiltres = produits
    .filter(p => !searchProd || (p.name_fr || "").toLowerCase().includes(searchProd.toLowerCase()) || (p.vendeur_nom || "").toLowerCase().includes(searchProd.toLowerCase()))
    .filter(p => !filterProdCat || p.categorie === filterProdCat)
    .filter(p => filterProdStatut === "" ? true : filterProdStatut === "actif" ? p.actif : !p.actif);

  const usersFiltres = utilisateurs
    .filter(u => !searchUser || (u.email || "").toLowerCase().includes(searchUser.toLowerCase()) || (u.nom || "").toLowerCase().includes(searchUser.toLowerCase()))
    .filter(u => !filterRole || u.role === filterRole);

  const commandesFiltrees = [...commandes]
    .filter(o => !filterOrder || o.status === filterOrder)
    .sort((a, b) => sortOrder === "desc" ? new Date(b.created_at) - new Date(a.created_at) : new Date(a.created_at) - new Date(b.created_at));

  const sellers       = utilisateurs.filter(u => u.role === "seller");
  const livreursDispo = utilisateurs.filter(u => u.role === "delivery");

  const alertes = [
    ...produits.filter(p => (p.stock || 0) === 0).map(p => ({ type: "red", label: "Stock 0", msg: `📦 ${p.name_fr || "Produit"} — ${p.vendeur_nom || "?"}` })),
    ...commandes.filter(o => o.status === "pending").map(o => ({ type: "yellow", label: "Commande", msg: `⏳ ${o.client_nom || "Client"} — ${(o.montant || 0).toLocaleString()} FCFA` })),
    ...adminDeliveries.filter(d => d.statut === "commande_recue" && !d.livreur_id).map(d => ({ type: "yellow", label: "Livraison", msg: `🚚 ${d.code_suivi} attend un livreur` })),
    ...adminDeliveries.filter(d => d.statut === "livreur_assigne" && d.assigne_at && (Date.now() - new Date(d.assigne_at).getTime() > 10 * 60000)).map(d => ({ type: "yellow", label: "Relance", msg: `⏰ ${d.code_suivi} : ${d.livreur_nom} n'a toujours pas répondu` })),
    ...utilisateurs.filter(u => new Date() - new Date(u.created_at) < 86400000).map(u => ({ type: "green", label: "Nouveau", msg: `🆕 ${u.nom || u.email || "User"} — ${u.role || "buyer"}` })),
    ...paymentTx.filter((p) => p.status === "failed").slice(0, 8).map((p) => ({ type: "red", label: "Paiement", msg: `❌ Échec ${p.provider || "N/A"} — ${p.provider_ref || p.id}` })),
  ];

  const maxChartV   = Math.max(...chartVentes.map(d => d.orders), 1);
  const maxChartRev = Math.max(...chartVentes.map(d => d.revenue), 1);
  const maxChartI   = Math.max(...chartInscrits.map(d => d.val), 1);

  const CATS_LIST = CATS;

  // ═══════════ NAVIGATION ═══════════
  const deliveriesEnAttente = adminDeliveries.filter(d =>
    (d.statut === "commande_recue" && !d.livreur_id) ||
    (d.statut === "livreur_assigne")
  ).length;
  const prestPending = prestatairesList.filter(p => p.status === "pending").length;

  const persistCommercePromo = async () => {
    if (!requireWrite()) return;
    try {
      const thr = Number(commerceForm.threshold);
      const fee = Number(commerceForm.fee);
      const graceDays = Number(commerceForm.stockOutGraceDays);
      const lowThreshold = Number(commerceForm.stockLowThreshold);
      if (!(thr >= 0) || !(fee >= 0)) {
        showToast("Seuil et frais doivent être des nombres positifs.", "error");
        return;
      }
      if (!(graceDays >= 1 && graceDays <= 365)) {
        showToast("Délai d'archivage : 1 à 365 jours.", "error");
        return;
      }
      if (!(lowThreshold >= 0 && lowThreshold <= 1000)) {
        showToast("Seuil stock bas : 0 à 1000.", "error");
        return;
      }
      const reminderCsv = String(commerceForm.stockReminderDaysCsv || "1,15,25").trim();
      if (!/^\d+(\s*,\s*\d+)*$/.test(reminderCsv)) {
        showToast("Rappels stock : liste d'entiers séparés par virgules (ex. 1,15,25).", "error");
        return;
      }
      const { error } = await supabase
        .from("commerce_settings")
        .update({
          free_shipping_threshold_xaf: thr,
          standard_delivery_fee_xaf: fee,
          stock_out_grace_days: graceDays,
          stock_low_threshold: lowThreshold,
          stock_auto_archive: !!commerceForm.stockAutoArchive,
          stock_hard_delete: !!commerceForm.stockHardDelete,
          stock_reminder_days_csv: reminderCsv,
          stock_premium_seller_exempt: !!commerceForm.stockPremiumSellerExempt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);
      if (error) throw error;
      showToast("Paramètres marketplace enregistrés.");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      showToast("Erreur : " + (e?.message || e), "error");
    }
  };

  const pendingPacksCount = useMemo(
    () =>
      produits.filter(
        (p) => p.is_pack && (p.pack_status === "pending" || p.pack_status === "correction"),
      ).length,
    [produits],
  );

  const NAV = useMemo(
    () => {
      const items = [
        { id: "overview", icon: "📊", label: t("nav.overview") },
        { id: "deliveries", icon: "🚚", label: t("nav.deliveries"), badge: deliveriesEnAttente || null },
        { id: "categories", icon: "🏷️", label: "Catégories" },
        { id: "packs", icon: "📦", label: "Packs à modérer", badge: pendingPacksCount || null },
        { id: "produits", icon: "📦", label: t("nav.products"), badge: produits.filter((p) => (p.stock || 0) === 0).length || null },
        { id: "commandes", icon: "🛍️", label: t("nav.orders"), badge: commandes.filter((o) => o.status === "pending").length || null },
        { id: "utilisateurs", icon: "👥", label: t("nav.users") },
        { id: "vendeurs", icon: "🏪", label: t("nav.sellers") },
        { id: "livreurs", icon: "🏍️", label: t("nav.couriers") },
        { id: "prestataires", icon: "👷", label: t("nav.providers"), badge: prestPending || null },
        { id: "revenus", icon: "💰", label: t("nav.revenue") },
        { id: "commerce_promo", icon: "🎁", label: t("nav.promoShipping") },
        { id: "messagerie", icon: "💬", label: "Messagerie" },
        { id: "notif_center", icon: "📣", label: t("nav.notifNetwork") },
        { id: "loyalty", icon: "🌟", label: t("nav.loyalty") },
        { id: "alertes", icon: "🔔", label: t("nav.alerts"), badge: alertes.length || null },
      ];
      return items.filter((n) => canWrite || n.id !== "messagerie");
    },
    [t, deliveriesEnAttente, produits, commandes, prestPending, alertes.length, canWrite, pendingPacksCount],
  );

  const ROLE_ASSIGN_OPTIONS = useMemo(
    () => ["buyer", "seller", "delivery", "provider", "admin", ROLE_ADMIN_PARTNER],
    [],
  );

  // ═══════════ HELPERS UI ═══════════
  const StatCard = ({ icon, val, lbl, trend, col, ic, onClick }) => (
    <div
      className="stat-card"
      style={{ cursor: onClick ? "pointer" : "default", transition: "transform .15s,box-shadow .15s" }}
      onClick={onClick}
      onMouseOver={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,.1)"; } }}
      onMouseOut={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
    >
      <div className="stat-card-icon" style={{ background: col || "var(--surface2)" }}><span>{icon}</span></div>
      <div className="stat-card-val">{val}</div>
      <div className="stat-card-lbl">{lbl}</div>
      {trend && <div className="stat-card-trend" style={{ color: ic || "var(--green)" }}>{trend}</div>}
    </div>
  );

  const BadgeStatut = ({ statut }) => {
    const map = {
      livre: "green", validee: "blue", pending: "yellow", annulee: "red",
      libere: "green", securise: "blue", rembourse: "gray",
      en_cours: "yellow", echec: "red",
    };
    return <span className={`admin-badge admin-badge-${map[statut] || "gray"}`}>{statut || "—"}</span>;
  };

  const StatutLivraison = ({ statut }) => {
    const cfg = getStatutConfig(statut);
    return (
      <span style={{
        padding: "3px 10px", borderRadius: 20,
        background: cfg.bg, color: cfg.color,
        fontSize: ".72rem", fontWeight: 700,
        border: "1px solid " + cfg.color,
        display: "inline-flex", alignItems: "center", gap: 4,
        whiteSpace: "nowrap",
      }}>
        <span>{cfg.icon}</span><span>{cfg.label}</span>
      </span>
    );
  };

  // ═══════════ SÉCURITÉ (après tous les hooks) ═══════════
  if (!isAuthorized) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 16, padding: 40 }}>
        <div style={{ fontSize: "4rem" }}>🔒</div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "var(--ink)" }}>Accès refusé</div>
        <p style={{ color: "var(--gray)", textAlign: "center", maxWidth: 400, lineHeight: 1.7 }}>
          Cette page est réservée aux administrateurs Yorix et aux partenaires autorisés.<br />
          Connectez-vous avec un compte habilité pour y accéder.
        </p>
        <button className="form-submit" style={{ width: "auto", padding: "10px 24px" }} onClick={() => goPage("home")}>
          ← Retour à l'accueil
        </button>
      </div>
    );
  }

  // ═══════════ LOADING ═══════════
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 14, color: "var(--green)", flexDirection: "column" }}>
        <div style={{ width: 46, height: 46, border: "4px solid var(--border)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin .7s linear infinite" }} />
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem" }}>{t("loading")}</div>
        <div style={{ fontSize: ".8rem", color: "var(--gray)" }}>Récupération des données Supabase</div>
      </div>
    );
  }

  // ═══════════ RENDU PRINCIPAL ═══════════
  return (
    <div className={`admin-layout${isPartnerReadOnly ? " admin-layout--readonly" : ""}`} style={{ minHeight: "calc(100vh - 130px)" }}>

      {isPartnerReadOnly && (
        <div className="admin-partner-banner" role="status">
          <span className="admin-partner-banner-icon">👁️</span>
          <div>
            <strong>Mode Admin partenaire</strong>
            <p>Consultation uniquement — exports CSV autorisés. Aucune modification possible.</p>
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#ce1126" : "var(--green)",
          color: "#fff", padding: "12px 20px", borderRadius: 10,
          fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".85rem",
          boxShadow: "0 4px 20px rgba(0,0,0,.2)",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* ── MODAL ÉDITION COMPLÈTE LIVRAISON ── */}
      {editDelivery && (
        <ModalEditDelivery
          delivery={editDelivery}
          livreurs={adminLivreurs}
          onClose={() => setEditDelivery(null)}
          onSave={sauvegarderEditionLivraison}
          onReassign={(liv) => assignerLivreur(editDelivery, liv)}
          onUnassign={retirerLivreur}
          onCancel={annulerLivraisonAdmin}
        />
      )}

      {/* ── MODAL ASSIGNATION LIVREUR ── */}
      {assignModalOpen && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setAssignModalOpen(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <button className="modal-close" onClick={() => setAssignModalOpen(null)}>✕</button>

            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>
              🏍️ Assigner un livreur
            </h2>
            <p style={{ fontSize: ".82rem", color: "var(--gray)", marginBottom: 16 }}>
              Livraison <strong style={{ color: "var(--green)" }}>{assignModalOpen.code_suivi}</strong> · {assignModalOpen.client_nom}
            </p>

            <div style={{ background: "var(--surface2)", borderRadius: 10, padding: 12, marginBottom: 14, fontSize: ".78rem", lineHeight: 1.7 }}>
              <div>🔴 <strong>Collecte :</strong> {assignModalOpen.adresse_collecte}</div>
              <div>🟢 <strong>Livraison :</strong> {assignModalOpen.adresse_livraison}</div>
              <div>📞 <strong>Client :</strong> {assignModalOpen.client_tel}</div>
            </div>

            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".92rem", color: "var(--green)", marginBottom: 10 }}>
              Livreurs disponibles ({adminLivreurs.length})
            </div>

            {adminLivreurs.length === 0 ? (
              <div style={{ textAlign: "center", padding: 30, background: "var(--surface2)", borderRadius: 10, color: "var(--gray)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 6 }}>😕</div>
                <p style={{ fontSize: ".85rem", marginBottom: 10 }}>Aucun livreur inscrit.</p>
                <button
                  onClick={() => { setAssignModalOpen(null); assignerLivreurManuel(assignModalOpen); }}
                  style={{
                    background: "var(--green)", color: "#fff", border: "none",
                    padding: "10px 18px", borderRadius: 8, cursor: "pointer",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".82rem",
                  }}
                >
                  ➕ Assigner manuellement
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8, maxHeight: 360, overflowY: "auto" }}>
                {adminLivreurs.map(liv => (
                  <div key={liv.uid || liv.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "var(--surface)", border: "1.5px solid var(--border)",
                    borderRadius: 10, padding: 10,
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%",
                      background: "var(--green-pale)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "1.3rem",
                    }}>🏍️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".88rem" }}>
                        {liv.nom || "Livreur"}
                        {liv.verifie && <span style={{ marginLeft: 6, color: "var(--green)" }}>✓</span>}
                      </div>
                      <div style={{ fontSize: ".7rem", color: "var(--gray)" }}>
                        {liv.telephone || "N/A"}
                        {liv.note ? " · ⭐ " + liv.note : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => assignerLivreur(assignModalOpen, liv)}
                      style={{
                        background: "var(--green)", color: "#fff", border: "none",
                        padding: "8px 14px", borderRadius: 8, cursor: "pointer",
                        fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".75rem",
                      }}
                    >
                      Assigner
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <button
                onClick={() => { setAssignModalOpen(null); assignerLivreurManuel(assignModalOpen); }}
                style={{
                  width: "100%", background: "var(--surface2)", color: "var(--ink)",
                  border: "1.5px solid var(--border)",
                  padding: "10px", borderRadius: 8, cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".82rem",
                }}
              >
                ➕ Assigner un livreur externe (saisie manuelle)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout-inner">
      {/* ── SIDEBAR ── */}
      <div className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, background: "var(--green)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>⚙️</div>
            <div>
              <div className="admin-sidebar-logo-txt">{t("brand")}</div>
              <div className="admin-sidebar-logo-sub">Panneau de contrôle</div>
            </div>
          </div>
          <div style={{ fontSize: ".67rem", color: "rgba(255,255,255,.4)", marginTop: 6, padding: "6px 8px", background: "rgba(255,255,255,.04)", borderRadius: 6 }}>
            👤 {userData?.nom || user?.email?.split("@")[0] || "Admin"}
          </div>
        </div>

        {NAV.map(n => (
          <div key={n.id} className={`admin-nav-item${adminTab === n.id ? " active" : ""}`} onClick={() => setAdminTab(n.id)}>
            <span style={{ fontSize: "1rem" }}>{n.icon}</span>
            <span style={{ flex: 1 }}>{n.label}</span>
            {n.badge ? <span style={{ background: "#ce1126", color: "#fff", fontSize: ".6rem", fontWeight: 800, padding: "1px 6px", borderRadius: 50, minWidth: 18, textAlign: "center" }}>{n.badge}</span> : null}
          </div>
        ))}

        <div style={{ padding: "14px 16px 0", borderTop: "1px solid rgba(255,255,255,.07)", marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={() => setRefreshKey(k => k + 1)} style={{ width: "100%", background: "rgba(79,209,125,.12)", color: "#4fd17d", border: "1px solid rgba(79,209,125,.2)", borderRadius: 7, padding: "8px", fontSize: ".75rem", cursor: "pointer" }}>
            🔄 Actualiser les données
          </button>
          <button onClick={() => goPage("home")} style={{ width: "100%", background: "rgba(255,255,255,.05)", color: "rgba(255,255,255,.5)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 7, padding: "8px", fontSize: ".75rem", cursor: "pointer" }}>
            ← Retour au site
          </button>
        </div>

        {/* Mini stats */}
        <div style={{ padding: "14px 16px", marginTop: 12, borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <div style={{ fontSize: ".62rem", color: "rgba(255,255,255,.3)", fontWeight: 700, letterSpacing: ".1em", marginBottom: 6 }}>
            STATS RAPIDES
          </div>
          {[
            { l: "👥 Utilisateurs", v: stats.users,    c: "#4fd17d" },
            { l: "🏪 Vendeurs",    v: stats.vendeurs, c: "#60a5fa" },
            { l: "🏍️ Livreurs",   v: stats.livreurs, c: "#fbbf24" },
            { l: "🚚 Livraisons",  v: stats.deliveries, c: "#a78bfa" },
            { l: "📦 Produits",    v: stats.products, c: "#fb7185" },
            { l: "🛍️ Commandes",  v: stats.orders,   c: "#34d399" },
          ].map(s => (
            <div key={s.l} style={{ display: "flex", justifyContent: "space-between", fontSize: ".72rem", padding: "4px 0" }}>
              <span style={{ color: "rgba(255,255,255,.55)" }}>{s.l}</span>
              <span style={{ color: s.c, fontWeight: 700 }}>{s.v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTENU PRINCIPAL ── */}
      <div className="admin-content">

        {/* Banner erreur */}
        {loadError && (
          <div style={{
            background: "#fff0f0", border: "1px solid #fecaca", color: "#ce1126",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 10, fontSize: ".85rem",
          }}>
            <span style={{ fontSize: "1.3rem" }}>⚠️</span>
            <div style={{ flex: 1 }}>{loadError}</div>
            <button onClick={() => setRefreshKey(k => k + 1)} style={{ background: "#ce1126", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: ".78rem", fontWeight: 700 }}>
              🔄 Réessayer
            </button>
          </div>
        )}

        {/* ════════ VUE D'ENSEMBLE ════════ */}
        {adminTab === "overview" && (
          <>
            <div className="admin-page-title">
              📊 {t("overviewTitle")}
              <span style={{ fontSize: ".72rem", color: "var(--gray)", fontWeight: 400, marginLeft: "auto" }}>
                {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            <div className="stat-cards-grid">
              <StatCard icon="👥" val={stats.users.toLocaleString()} lbl="Utilisateurs total" trend={`${stats.buyers} acheteurs · ${stats.vendeurs} vendeurs`} col="#e6f0ff" ic="#1a4a9a" onClick={() => setAdminTab("utilisateurs")} />
              <StatCard icon="🏍️" val={stats.livreurs} lbl="Livreurs inscrits" trend={`${adminDeliveries.filter(d => !d.livreur_id).length} en attente d'assignation`} col="#fff9e6" ic="#b8860b" onClick={() => setAdminTab("livreurs")} />
              <StatCard icon="📦" val={stats.products.toLocaleString()} lbl="Produits" trend={`${produits.filter(p => p.actif).length} actifs · ${stats.ruptures} en rupture`} col="#e6fff0" ic="#1a6b3a" onClick={() => setAdminTab("produits")} />
              <StatCard icon="🚚" val={stats.deliveries.toLocaleString()} lbl="Livraisons" trend={`${adminDeliveries.filter(d => d.statut === "livre").length} livrées`} col="#f3e8ff" ic="#7c3aed" onClick={() => setAdminTab("deliveries")} />
              <StatCard icon="🛍️" val={stats.orders.toLocaleString()} lbl="Commandes" trend={`${stats.enAttente} en attente · ${stats.livrees} livrées`} col="#ecfdf5" ic="#059669" onClick={() => setAdminTab("commandes")} />
              <StatCard icon="💰" val={`${stats.commissionTotal.toLocaleString()} F`} lbl="Commissions Yorix" trend="5% par transaction" col="#fff0f6" ic="#a0105a" onClick={() => setAdminTab("revenus")} />
              <StatCard icon="📅" val={`${stats.revenueToday.toLocaleString()} F`} lbl="Revenus aujourd'hui" trend="Commissions du jour" col="#f0fff4" ic="#276749" />
              <StatCard icon="📈" val={`${stats.revenueWeek.toLocaleString()} F`} lbl="Revenus 7 jours" trend="Cette semaine" col="#fef9f0" ic="#7b5a10" />
            </div>

            {pendingPacksCount > 0 && (
              <div className="admin-overview-alert admin-overview-alert--pack" role="alert">
                <div style={{ fontSize: "2.2rem" }}>📦</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#5b21b6" }}>
                    {pendingPacksCount} pack{pendingPacksCount > 1 ? "s" : ""} en attente de validation
                  </div>
                  <div style={{ fontSize: ".8rem", color: "#6d28d9", marginTop: 3 }}>
                    Valider, corriger et publier, ou supprimer avec motif (message automatique au vendeur).
                  </div>
                </div>
                <button
                  type="button"
                  className="admin-overview-alert__btn"
                  style={{ background: "#7c3aed", color: "#fff" }}
                  onClick={() => setAdminTab("packs")}
                >
                  Modérer →
                </button>
              </div>
            )}

            {deliveriesEnAttente > 0 && (
              <div style={{
                background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                border: "2px solid #f59e0b", borderRadius: 12,
                padding: 16, marginBottom: 18,
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ fontSize: "2.2rem" }}>🚚</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem", color: "#92400e" }}>
                    {deliveriesEnAttente} livraison{deliveriesEnAttente > 1 ? "s" : ""} en attente d'assignation !
                  </div>
                  <div style={{ fontSize: ".8rem", color: "#78350f", marginTop: 3 }}>
                    Assigne un livreur rapidement pour satisfaire tes clients.
                  </div>
                </div>
                <button onClick={() => setAdminTab("deliveries")} style={{
                  background: "#f59e0b", color: "#fff", border: "none",
                  padding: "10px 20px", borderRadius: 9, cursor: "pointer",
                  fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".85rem",
                }}>
                  🏍️ Assigner maintenant →
                </button>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="admin-section">
                <div className="admin-section-title">
                  📈 Commandes / jour
                  <span style={{ fontSize: ".69rem", color: "var(--gray)", fontWeight: 400 }}>7 derniers jours</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 100, marginBottom: 6 }}>
                  {chartVentes.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ fontSize: ".6rem", color: "var(--gray)" }}>{d.orders || ""}</div>
                      <div style={{
                        width: "100%", borderRadius: "3px 3px 0 0",
                        height: `${Math.max((d.orders / maxChartV) * 80, d.orders > 0 ? 8 : 3)}px`,
                        background: i === chartVentes.length - 1 ? "var(--green)" : "var(--green-mid, #4fd17d)",
                        opacity: .85, transition: "height .5s",
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {chartVentes.map((d, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: ".6rem", color: "var(--gray)" }}>{d.label}</div>)}
                </div>
              </div>

              <div className="admin-section">
                <div className="admin-section-title">
                  👥 Inscriptions / jour
                  <span style={{ fontSize: ".69rem", color: "var(--gray)", fontWeight: 400 }}>7 derniers jours</span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 100, marginBottom: 6 }}>
                  {chartInscrits.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ fontSize: ".6rem", color: "var(--gray)" }}>{d.val || ""}</div>
                      <div style={{
                        width: "100%", borderRadius: "3px 3px 0 0",
                        height: `${Math.max((d.val / maxChartI) * 80, d.val > 0 ? 8 : 3)}px`,
                        background: "#818cf8", opacity: .85, transition: "height .5s",
                      }} />
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  {chartInscrits.map((d, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: ".6rem", color: "var(--gray)" }}>{d.label}</div>)}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
              <div className="admin-section">
                <div className="admin-section-title">
                  🚚 Dernières livraisons
                  <button className="admin-action-btn" style={{ background: "var(--green)", color: "#fff", fontSize: ".65rem" }} onClick={() => setAdminTab("deliveries")}>
                    Voir tout →
                  </button>
                </div>
                {adminDeliveries.length === 0 ? (
                  <div style={{ fontSize: ".78rem", color: "var(--gray)", padding: "12px 0", textAlign: "center" }}>Aucune livraison</div>
                ) : (
                  adminDeliveries.slice(0, 4).map(d => (
                    <div key={d.id} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 0", borderBottom: "1px solid var(--border)",
                    }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "var(--green-pale)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1rem", flexShrink: 0,
                      }}>🚚</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem", color: "var(--green)" }}>
                          {d.code_suivi}
                        </div>
                        <div style={{ fontSize: ".68rem", color: "var(--gray)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {d.client_nom} → {d.adresse_livraison}
                        </div>
                      </div>
                      <StatutLivraison statut={d.statut} />
                    </div>
                  ))
                )}
              </div>

              <div className="admin-section">
                <div className="admin-section-title">
                  🔔 Alertes actives
                  <button className="admin-action-btn" style={{ background: "var(--red)", color: "#fff", fontSize: ".65rem" }} onClick={() => setAdminTab("alertes")}>
                    {alertes.length} →
                  </button>
                </div>
                {alertes.length === 0
                  ? <div className="admin-alert admin-alert-green">✅ Aucune alerte — tout va bien !</div>
                  : alertes.slice(0, 4).map((a, i) => (
                    <div key={i} className={`admin-alert admin-alert-${a.type}`} style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: ".65rem", fontWeight: 700, background: "rgba(0,0,0,.1)", padding: "1px 5px", borderRadius: 4, marginRight: 6 }}>{a.label}</span>
                      <span style={{ flex: 1, fontSize: ".75rem" }}>{a.msg}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </>
        )}

        {/* ════════ LIVRAISONS ════════ */}
        {adminTab === "deliveries" && (
          <>
            <div className="admin-page-title">
              🚚 {t("sections.deliveries")}
              <span style={{ fontSize: ".75rem", background: "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>
                {adminDeliveries.length}
              </span>
            </div>

            <div className="stat-cards-grid" style={{ marginBottom: 18 }}>
              <StatCard icon="⏳" val={adminDeliveries.filter(d => d.statut === "commande_recue").length} lbl="En attente livreur" col="#fef3c7" ic="#f59e0b" />
              <StatCard icon="🏍️" val={adminDeliveries.filter(d => d.statut === "livreur_assigne").length} lbl="Assignées" col="#e0f2fe" ic="#0ea5e9" />
              <StatCard icon="✅" val={adminDeliveries.filter(d => ["accepte","preparation","collecte","en_route"].includes(d.statut)).length} lbl="En cours" col="#d1fae5" ic="#10b981" />
              <StatCard icon="🏁" val={adminDeliveries.filter(d => d.statut === "livre").length} lbl="Livrées" col="#dcfce7" ic="#22c55e" />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18, background: "var(--surface)", padding: 10, borderRadius: 10, border: "1px solid var(--border)" }}>
              {[
                { id: "all",             label: "📋 Toutes",         color: "#64748b" },
                { id: "commande_recue",  label: "⏳ En attente",     color: "#f59e0b" },
                { id: "livreur_assigne", label: "🏍️ Assignée",       color: "#0ea5e9" },
                { id: "accepte",         label: "✅ Acceptée",       color: "#10b981" },
                { id: "preparation",     label: "📦 Préparation",    color: "#3b82f6" },
                { id: "collecte",        label: "🏪 Collecté",       color: "#8b5cf6" },
                { id: "en_route",        label: "🚀 En route",       color: "#10b981" },
                { id: "livre",           label: "🏁 Livrées",        color: "#22c55e" },
                { id: "annule",          label: "❌ Annulées",       color: "#ef4444" },
              ].map(f => {
                const count = f.id === "all" ? adminDeliveries.length : adminDeliveries.filter(d => d.statut === f.id).length;
                const active = adminDelivFilter === f.id;
                return (
                  <button key={f.id} onClick={() => setAdminDelivFilter(f.id)} style={{
                    padding: "7px 13px", borderRadius: 20,
                    border: "2px solid " + (active ? f.color : "var(--border)"),
                    background: active ? f.color : "var(--surface2)",
                    color: active ? "#fff" : "var(--ink)",
                    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem",
                    cursor: "pointer", transition: "all .2s",
                  }}>
                    {f.label} ({count})
                  </button>
                );
              })}
            </div>

            {adminDeliveries.filter(d => adminDelivFilter === "all" || d.statut === adminDelivFilter).length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, background: "var(--surface)", borderRadius: 12, color: "var(--gray)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: 10 }}>📭</div>
                <p style={{ fontSize: ".9rem" }}>Aucune livraison dans cette catégorie</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {adminDeliveries
                  .filter(d => adminDelivFilter === "all" || d.statut === adminDelivFilter)
                  .map(d => (
                    <div key={d.id} style={{
                      background: "var(--surface)", border: "1px solid var(--border)",
                      borderRadius: 12, padding: 14,
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.05rem", color: "var(--green)", letterSpacing: ".05em" }}>
                            {d.code_suivi}
                          </div>
                          <StatutLivraison statut={d.statut} />
                        </div>
                        <div style={{ fontSize: ".72rem", color: "var(--gray)" }}>
                          {d.commande_at ? new Date(d.commande_at).toLocaleString("fr-FR") : "-"}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 12, fontSize: ".78rem" }}>
                        <div>
                          <div style={{ fontSize: ".65rem", color: "var(--gray)", fontWeight: 700, marginBottom: 3 }}>👤 CLIENT</div>
                          <div style={{ fontWeight: 600, color: "var(--ink)" }}>{d.client_nom || "—"}</div>
                          <div style={{ color: "var(--gray)" }}>{d.client_tel || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: ".65rem", color: "var(--gray)", fontWeight: 700, marginBottom: 3 }}>🔴 COLLECTE</div>
                          <div style={{ color: "var(--ink)" }}>{d.adresse_collecte || "—"}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: ".65rem", color: "var(--gray)", fontWeight: 700, marginBottom: 3 }}>🟢 LIVRAISON</div>
                          <div style={{ color: "var(--ink)" }}>{d.adresse_livraison || "—"}</div>
                        </div>
                      </div>

                      {d.livreur_nom ? (
                        <div style={{ background: "var(--green-pale)", borderRadius: 8, padding: "9px 12px", marginBottom: 10, fontSize: ".82rem", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: "1.2rem" }}>🏍️</span>
                          <div style={{ flex: 1 }}>
                            <strong>Livreur :</strong> {d.livreur_nom}
                            <span style={{ color: "var(--gray)", marginLeft: 8 }}>· {d.livreur_tel}</span>
                          </div>
                          {d.livreur_tel && (
                            <a href={`https://wa.me/${d.livreur_tel.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                              style={{ background: "#25D366", color: "#fff", padding: "4px 10px", borderRadius: 6, fontSize: ".7rem", fontWeight: 700, textDecoration: "none" }}>
                              💬 WhatsApp
                            </a>
                          )}
                        </div>
                      ) : (
                        <div style={{ background: "#fef3c7", border: "1px dashed #f59e0b", borderRadius: 8, padding: "9px 12px", marginBottom: 10, fontSize: ".82rem", color: "#92400e" }}>
                          ⚠️ Aucun livreur assigné
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button onClick={() => setEditDelivery(d)} style={{
                          background: "var(--green)", color: "#fff", border: "none",
                          padding: "8px 14px", borderRadius: 8,
                          fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem", cursor: "pointer",
                        }}>
                          🛠️ Modifier
                        </button>

                        {!d.livreur_id && !d.livreur_nom && (
                          <button onClick={() => setAssignModalOpen(d)} style={{
                            background: "var(--green)", color: "#fff", border: "none",
                            padding: "8px 14px", borderRadius: 8,
                            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem", cursor: "pointer",
                          }}>
                            🏍️ Assigner
                          </button>
                        )}

                        {d.livreur_nom && d.statut === "livreur_assigne" && (
                          <button onClick={() => renvoyerWhatsAppLivreur(d)}
                            style={{ background: "#25D366", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>
                            🔁 Relancer WhatsApp
                          </button>
                        )}
                        {d.livreur_nom && d.statut === "accepte" && (
                          <button onClick={() => changerStatutLivraison(d, "preparation")}
                            style={{ background: "#3b82f6", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>
                            📦 Démarrer préparation
                          </button>
                        )}
                        {d.livreur_nom && d.statut === "preparation" && (
                          <button onClick={() => changerStatutLivraison(d, "collecte")}
                            style={{ background: "#8b5cf6", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>
                            🏪 Marquer Collecté
                          </button>
                        )}
                        {d.livreur_nom && d.statut === "collecte" && (
                          <button onClick={() => changerStatutLivraison(d, "en_route")}
                            style={{ background: "#10b981", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>
                            🏍️ En route
                          </button>
                        )}
                        {d.livreur_nom && d.statut === "en_route" && (
                          <button onClick={() => changerStatutLivraison(d, "livre")}
                            style={{ background: "#22c55e", color: "#fff", border: "none", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 700, cursor: "pointer" }}>
                            ✅ Livré
                          </button>
                        )}

                        <button onClick={() => window.open(deliveryTrackingPath(d.code_suivi), "_blank")}
                          style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--border)", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 600, cursor: "pointer" }}>
                          👁️ Tracker
                        </button>

                        <button onClick={() => { navigator.clipboard?.writeText(d.code_suivi); showToast("Code copié : " + d.code_suivi); }}
                          style={{ background: "var(--surface2)", color: "var(--ink)", border: "1px solid var(--border)", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 600, cursor: "pointer" }}>
                          📋 Copier
                        </button>

                        {d.client_tel && (
                          <a href={`https://wa.me/${d.client_tel.replace(/\D/g, "")}?text=${encodeURIComponent(`Bonjour ${d.client_nom || ""} ! Concernant votre livraison ${d.code_suivi}...`)}`}
                            target="_blank" rel="noreferrer"
                            style={{ background: "#25D366", color: "#fff", padding: "7px 12px", borderRadius: 8, fontSize: ".75rem", fontWeight: 700, textDecoration: "none" }}>
                            📱 Client
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}

        {/* ════════ LIVREURS ════════ */}
        {adminTab === "livreurs" && (
          <>
            <div className="admin-page-title">
              🏍️ {t("sections.couriers")}
              <span style={{ fontSize: ".75rem", background: "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>
                {livreursDispo.length}
              </span>
            </div>

            <div className="stat-cards-grid" style={{ marginBottom: 18 }}>
              <StatCard icon="🏍️" val={livreursDispo.length} lbl="Livreurs inscrits" col="#fff9e6" ic="#b8860b" />
              <StatCard icon="✅" val={livreursDispo.filter(l => l.actif !== false).length} lbl="Actifs" col="#e6fff0" ic="#1a6b3a" />
              <StatCard icon="✔️" val={livreursDispo.filter(l => l.verifie).length} lbl="Vérifiés" col="#e6f0ff" ic="#1a4a9a" />
              <StatCard icon="📦" val={adminDeliveries.filter(d => d.livreur_id).length} lbl="Livraisons assignées" col="#f3e8ff" ic="#7c3aed" />
            </div>

            {livreursDispo.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60, background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "4rem", marginBottom: 14 }}>🏍️</div>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1.1rem", color: "var(--ink)", marginBottom: 8 }}>
                  Aucun livreur inscrit
                </h3>
                <p style={{ color: "var(--gray)", fontSize: ".88rem", marginBottom: 16, maxWidth: 420, margin: "0 auto 16px" }}>
                  Tu peux encore assigner des livreurs manuellement sur chaque livraison. Ou invite des livreurs à s'inscrire via le lien :
                </p>
                <div style={{ background: "var(--green-pale)", padding: "8px 14px", borderRadius: 8, display: "inline-block", fontSize: ".82rem" }}>
                  🔗 <a href="https://www.yorix.cm/?authTab=register&role=delivery" style={{ color: "var(--green)", fontWeight: 700 }}>yorix.cm/inscription-livreur</a>
                </div>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Livreur</th><th>Contact</th><th>Ville</th><th>Livraisons</th><th>Statut</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livreursDispo.map(l => {
                      const uid = l.uid || l.id;
                      const mesLivraisons = adminDeliveries.filter(d => d.livreur_id === uid);
                      const livresCount = mesLivraisons.filter(d => d.statut === "livre").length;
                      return (
                        <tr key={uid}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--green-pale)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                                🏍️
                              </div>
                              <div>
                                <strong style={{ fontSize: ".85rem" }}>{l.nom || "—"}</strong>
                                {l.verifie && <span style={{ marginLeft: 4, fontSize: ".6rem", background: "#e6fff0", color: "#1a6b3a", padding: "1px 4px", borderRadius: 3 }}>✅</span>}
                                <div style={{ fontSize: ".66rem", color: "var(--gray)" }}>{l.email || "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: ".78rem" }}>{l.telephone || "—"}</td>
                          <td style={{ fontSize: ".78rem" }}>{l.ville || "—"}</td>
                          <td>
                            <span className="admin-badge admin-badge-blue">{mesLivraisons.length}</span>
                            {livresCount > 0 && <span style={{ fontSize: ".63rem", color: "var(--green)", marginLeft: 4 }}>{livresCount} livrées</span>}
                          </td>
                          <td>
                            <span className={`admin-badge admin-badge-${l.actif !== false ? "green" : "red"}`}>
                              {l.actif !== false ? "🟢 Actif" : "⛔ Suspendu"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 3 }}>
                              {l.telephone && (
                                <a href={`https://wa.me/${l.telephone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer"
                                  className="admin-action-btn" style={{ background: "#dcfce7", color: "#166534", textDecoration: "none" }}>
                                  📱
                                </a>
                              )}
                              <button onClick={() => verifierUser(uid, l.verifie)} className="admin-action-btn"
                                style={{ background: l.verifie ? "#fff9e6" : "#e6fff0", color: l.verifie ? "#b8860b" : "#1a6b3a" }}>
                                {l.verifie ? "❌" : "✅"}
                              </button>
                              <button onClick={() => toggleVendeur(uid, l.actif !== false)} className="admin-action-btn"
                                style={{ background: l.actif !== false ? "#fff0f0" : "#e6fff0", color: l.actif !== false ? "#ce1126" : "#1a6b3a" }}>
                                {l.actif !== false ? "⛔" : "✅"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {adminTab === "categories" && (
          <>
            <div className="admin-page-title">🏷️ Catégories marketplace</div>
            {catLoading ? (
              <div className="loading"><div className="spinner" /> Chargement taxonomie...</div>
            ) : (
              <AdminCategoryManager
                key={catReload}
                tree={categoryTree}
                flat={categoryFlat}
                onReload={() => setCatReload((k) => k + 1)}
                readOnly={!canWrite}
              />
            )}
          </>
        )}

        {/* ════════ PACKS (modération) ════════ */}
        {adminTab === "packs" && (
          <>
            <div className="admin-page-title">
              📦 Packs vendeur — modération
              {pendingPacksCount > 0 && (
                <span
                  style={{
                    fontSize: ".75rem",
                    background: "#7c3aed",
                    color: "#fff",
                    padding: "3px 10px",
                    borderRadius: 50,
                    fontWeight: 600,
                    marginLeft: 8,
                  }}
                >
                  {pendingPacksCount} en attente
                </span>
              )}
            </div>
            <AdminPackModeration
              produits={produits}
              showToast={showToast}
              requireWrite={requireWrite}
              onDone={() => setRefreshKey((k) => k + 1)}
            />
          </>
        )}

        {/* ════════ PRODUITS ════════ */}
        {adminTab === "produits" && (
          <>
            <div className="admin-page-title">
              📦 {t("sections.products")}
              <span style={{ fontSize: ".75rem", background: "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>
                {produitsFiltres.length} / {produits.length}
              </span>
            </div>

            <div className="admin-filter-row" style={{ flexWrap: "wrap", gap: 8 }}>
              <input className="admin-search" style={{ maxWidth: 240 }} placeholder="🔍 Nom ou vendeur..." value={searchProd} onChange={e => setSearchProd(e.target.value)} />
              <select className="admin-search" style={{ maxWidth: 160 }} value={filterProdCat} onChange={e => setFilterProdCat(e.target.value)}>
                <option value="">Toutes catégories</option>
                {CATS_LIST.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="admin-search" style={{ maxWidth: 140 }} value={filterProdStatut} onChange={e => setFilterProdStatut(e.target.value)}>
                <option value="">Tous statuts</option>
                <option value="actif">✅ Actif</option>
                <option value="inactif">⛔ Inactif</option>
              </select>
              <button className="admin-action-btn" style={{ background: "var(--surface2)", color: "var(--ink)", padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)" }} onClick={() => { setSearchProd(""); setFilterProdCat(""); setFilterProdStatut(""); }}>✕ Reset</button>
              <button className="admin-action-btn" style={{ background: "#e6f0ff", color: "#1a4a9a", padding: "7px 12px", borderRadius: 8, marginLeft: "auto" }}
                data-readonly-ok="1"
                onClick={() => exportCSV(produitsFiltres.map(p => ({ id: p.id, nom: p.name_fr, prix: p.prix, vendeur: p.vendeur_nom, ville: p.ville, stock: p.stock, categorie: p.categorie, actif: p.actif })), "produits-yorix.csv")}>
                📤 Export CSV
              </button>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr><th>Produit</th><th>Prix</th><th>Vendeur</th><th>Cat.</th><th>Ville</th><th>🇨🇲</th><th>Stock</th><th>Statut</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {produitsFiltres.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          {(p.image || p.image_urls?.[0]) && (
                            <img src={p.image || p.image_urls?.[0]} alt="" style={{ width: 38, height: 38, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                          )}
                          <strong style={{ fontSize: ".79rem" }}>{p.name_fr || "—"}</strong>
                        </div>
                      </td>
                      <td><strong style={{ color: "var(--green)" }}>{(p.prix || 0).toLocaleString()} F</strong></td>
                      <td style={{ fontSize: ".75rem" }}>{p.vendeur_nom || "—"}</td>
                      <td><span className="admin-badge admin-badge-gray">{p.categorie || "—"}</span></td>
                      <td style={{ fontSize: ".72rem" }}>{p.ville || "—"}</td>
                      <td style={{ fontSize: ".65rem" }}>
                        {p.made_in_cameroon_status === "verified" ? (
                          <span title="Vérifié admin">🇨🇲✔</span>
                        ) : p.is_made_in_cameroon && ["declared", "auto"].includes(p.made_in_cameroon_status) ? (
                          <span title={p.made_in_cameroon_status || "declared"}>🇨🇲</span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td>
                        <span className={`admin-badge admin-badge-${(p.stock || 0) === 0 ? "red" : (p.stock || 0) <= 5 ? "yellow" : "green"}`}>
                          {p.stock || 0}
                        </span>
                      </td>
                      <td><span className={`admin-badge admin-badge-${p.actif ? "green" : "gray"}`}>{p.actif ? "Actif" : "Inactif"}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 3 }}>
                          <button className="admin-action-btn" title="Vérifier Made in CM" style={{ background: "#e8f8f0", color: "#007a5e" }} onClick={() => setMadeInCameroonStatus(p.id, "verified")}>🇨🇲✔</button>
                          <button className="admin-action-btn" title="Refuser badge" style={{ background: "#f3f4f6", color: "#666" }} onClick={() => setMadeInCameroonStatus(p.id, "rejected")}>✖</button>
                          <button className="admin-action-btn" style={{ background: p.actif ? "#fff9e6" : "#e6fff0", color: p.actif ? "#b8860b" : "#1a6b3a" }} onClick={() => toggleActifProduit(p.id, p.actif)}>
                            {p.actif ? "⛔" : "✅"}
                          </button>
                          <button className="admin-action-btn" style={{ background: "#fff0f0", color: "#ce1126" }} onClick={() => supprimerProduit(p.id, p.name_fr)}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {produitsFiltres.length === 0 && (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 28, color: "var(--gray)" }}>Aucun produit trouvé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ════════ COMMANDES ════════ */}
        {adminTab === "commandes" && (
          <>
            <div className="admin-page-title">
              🛍️ Gestion des commandes
              <span style={{ fontSize: ".75rem", background: "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>
                {commandesFiltrees.length}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { l: "⏳ En attente", v: commandes.filter(o => o.status === "pending").length,   c: "#b8860b", bg: "#fff9e6", f: "pending" },
                { l: "✅ Validées",   v: commandes.filter(o => o.status === "validee").length,   c: "#1a4a9a", bg: "#e6f0ff", f: "validee" },
                { l: "📦 Livrées",    v: commandes.filter(o => o.status === "livre").length,     c: "#1a6b3a", bg: "#e6fff0", f: "livre" },
                { l: "❌ Annulées",   v: commandes.filter(o => o.status === "annulee").length,   c: "#ce1126", bg: "#fff0f0", f: "annulee" },
              ].map(s => (
                <div key={s.l} onClick={() => setFilterOrder(s.f === filterOrder ? "" : s.f)} style={{
                  background: s.bg, border: `1.5px solid ${filterOrder === s.f ? s.c : s.c + "30"}`,
                  borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: ".75rem",
                }}>
                  <span style={{ color: "var(--gray)" }}>{s.l} : </span>
                  <strong style={{ color: s.c }}>{s.v}</strong>
                </div>
              ))}
            </div>

            {commandesFiltrees.length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, background: "var(--surface)", borderRadius: 12, color: "var(--gray)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "3rem", marginBottom: 10 }}>📭</div>
                <p>Aucune commande {filterOrder ? `"${filterOrder}"` : ""}</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Client</th><th>Montant</th><th>Commission</th><th>Statut</th><th>Date</th><th>Actions</th></tr></thead>
                  <tbody>
                    {commandesFiltrees.map(o => (
                      <tr key={o.id}>
                        <td>
                          <strong style={{ fontSize: ".8rem" }}>{o.client_nom || "—"}</strong>
                          {o.telephone && <div style={{ fontSize: ".65rem", color: "var(--gray)" }}>{o.telephone}</div>}
                        </td>
                        <td><strong>{(o.montant || 0).toLocaleString()} F</strong></td>
                        <td style={{ color: "var(--green)", fontWeight: 700 }}>{(o.commission || 0).toLocaleString()} F</td>
                        <td><BadgeStatut statut={o.status} /></td>
                        <td style={{ fontSize: ".7rem", color: "var(--gray)", whiteSpace: "nowrap" }}>{o.created_at ? new Date(o.created_at).toLocaleDateString("fr-FR") : "-"}</td>
                        <td>
                          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                            {o.status === "pending" && <button className="admin-action-btn" style={{ background: "#e6f0ff", color: "#1a4a9a" }} onClick={() => validerCommande(o.id)}>✅</button>}
                            {o.status === "validee" && <button className="admin-action-btn" style={{ background: "#e6fff0", color: "#1a6b3a" }} onClick={() => marquerLivre(o.id)}>📦</button>}
                            {!["livre", "annulee"].includes(o.status) && <button className="admin-action-btn" style={{ background: "#fff0f0", color: "#ce1126" }} onClick={() => annulerCommande(o.id)}>❌</button>}
                            {o.telephone && <a href={`https://wa.me/${o.telephone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="admin-action-btn" style={{ background: "#dcfce7", color: "#166534", textDecoration: "none" }}>📱</a>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════ UTILISATEURS ════════ */}
        {adminTab === "utilisateurs" && (
          <>
            <div className="admin-page-title">
              👥 {t("sections.users")}
              <span style={{ fontSize: ".75rem", background: "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>
                {usersFiltres.length} / {utilisateurs.length}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {["buyer", "seller", "delivery", "provider", "admin", ROLE_ADMIN_PARTNER].map(r => {
                const cnt = utilisateurs.filter(u => u.role === r).length;
                const colors = { buyer: "#1a4a9a", seller: "#1a6b3a", delivery: "#b8860b", provider: "#6a1b9a", admin: "#ce1126", [ROLE_ADMIN_PARTNER]: "#0e7490" };
                return (
                  <div key={r} onClick={() => setFilterRole(r === filterRole ? "" : r)} style={{
                    background: "var(--surface)", border: `1.5px solid ${filterRole === r ? colors[r] : "var(--border)"}`,
                    borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: ".73rem",
                  }}>
                    <span style={{ color: colors[r] || "var(--gray)", fontWeight: 700 }}>{ADMIN_ROLE_LABELS[r] || ROLE_LABELS[r] || r}</span>
                    <span style={{ color: "var(--gray)", marginLeft: 6 }}>{cnt}</span>
                  </div>
                );
              })}
            </div>

            <div className="admin-filter-row">
              <input className="admin-search" style={{ maxWidth: 260 }} placeholder="🔍 Nom ou email..." value={searchUser} onChange={e => setSearchUser(e.target.value)} />
              <button className="admin-action-btn" style={{ background: "var(--surface2)", color: "var(--ink)", padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border)" }} onClick={() => { setSearchUser(""); setFilterRole(""); }}>✕ Reset</button>
              <button className="admin-action-btn" style={{ background: "#e6f0ff", color: "#1a4a9a", padding: "7px 12px", borderRadius: 8, marginLeft: "auto" }}
                data-readonly-ok="1"
                onClick={() => exportCSV(usersFiltres.map(u => ({ uid: u.uid, nom: u.nom, email: u.email, role: u.role, ville: u.ville, telephone: u.telephone })), "utilisateurs-yorix.csv")}>
                📤 Export CSV
              </button>
            </div>

            {usersFiltres.length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, background: "var(--surface)", borderRadius: 12, color: "var(--gray)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: "3rem", marginBottom: 10 }}>👥</div>
                <p>Aucun utilisateur trouvé</p>
                {utilisateurs.length === 0 && (
                  <p style={{ fontSize: ".78rem", marginTop: 10, color: "#ce1126" }}>
                    💡 Source unique : table profiles (RLS admin). Legacy users migrée automatiquement.
                  </p>
                )}
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Utilisateur</th><th>Email</th><th>Rôle</th><th>Ville</th><th>Téléphone</th><th>Actions</th></tr></thead>
                  <tbody>
                    {usersFiltres.map(u => {
                      const uid = u.uid || u.id;
                      return (
                        <tr key={uid}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: `hsl(${(uid || "").toString().charCodeAt(0) * 7 % 360},50%,50%)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: ".8rem" }}>
                                {(u.nom || u.email || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ fontSize: ".8rem" }}>{u.nom || "—"}</strong>
                                {u.verifie && <span style={{ marginLeft: 4, fontSize: ".6rem", background: "#e6fff0", color: "#1a6b3a", padding: "1px 4px", borderRadius: 3 }}>✅</span>}
                              </div>
                            </div>
                          </td>
                          <td style={{ fontSize: ".75rem", color: "var(--gray)" }}>{u.email || "—"}</td>
                          <td>
                            <select
                              value={u.role || "buyer"}
                              disabled={!canWrite}
                              style={{ border: "1px solid var(--border)", background: "var(--surface)", borderRadius: 6, padding: "3px 8px", fontSize: ".72rem", cursor: canWrite ? "pointer" : "not-allowed", color: "var(--ink)", opacity: canWrite ? 1 : 0.75 }}
                              onChange={e => changerRole(uid, e.target.value)}
                            >
                              {ROLE_ASSIGN_OPTIONS.map(r => (
                                <option key={r} value={r}>{ADMIN_ROLE_LABELS[r] || r}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ fontSize: ".73rem" }}>{u.ville || "—"}</td>
                          <td style={{ fontSize: ".73rem" }}>{u.telephone || "—"}</td>
                          <td>
                            <div style={{ display: "flex", gap: 3 }}>
                              {u.telephone && <a href={`https://wa.me/${u.telephone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="admin-action-btn" style={{ background: "#dcfce7", color: "#166534", textDecoration: "none" }}>📱</a>}
                              <button className="admin-action-btn" style={{ background: "#fff0f0", color: "#ce1126" }} onClick={() => supprimerUser(uid, u.email)}>🗑️</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════ VENDEURS ════════ */}
        {adminTab === "vendeurs" && (
          <>
            <div className="admin-page-title">
              🏪 {t("sections.sellers")}
              <span style={{ fontSize: ".75rem", background: "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>{sellers.length}</span>
            </div>

            <div className="stat-cards-grid" style={{ marginBottom: 16 }}>
              <StatCard icon="🏪" val={sellers.length} lbl="Vendeurs total" col="#e6fff0" ic="#1a6b3a" />
              <StatCard icon="✅" val={sellers.filter(s => s.actif !== false).length} lbl="Actifs" col="#e6f0ff" ic="#1a4a9a" />
              <StatCard icon="⛔" val={sellers.filter(s => s.actif === false).length} lbl="Suspendus" col="#fff0f0" ic="#ce1126" />
              <StatCard icon="✔️" val={sellers.filter(s => s.verifie).length} lbl="Vérifiés" col="#fff9e6" ic="#b8860b" />
            </div>

            {sellers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 50, background: "var(--surface)", borderRadius: 12, color: "var(--gray)" }}>
                <div style={{ fontSize: "3rem", marginBottom: 10 }}>🏪</div>
                <p>Aucun vendeur inscrit</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Vendeur</th><th>Email</th><th>Produits</th><th>Ventes</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {sellers.map(u => {
                      const uid = u.uid || u.id;
                      const mesProds  = produits.filter(p => p.vendeur_id === uid);
                      const mesVentes = commandes.filter(o => o.vendeur_id === uid);
                      return (
                        <tr key={uid}>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--green)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: ".8rem" }}>
                                {(u.nom || "?")[0].toUpperCase()}
                              </div>
                              <strong style={{ fontSize: ".8rem" }}>{u.nom || "—"}</strong>
                            </div>
                          </td>
                          <td style={{ fontSize: ".72rem", color: "var(--gray)" }}>{u.email || "—"}</td>
                          <td><span className="admin-badge admin-badge-blue">{mesProds.length}</span></td>
                          <td><span className="admin-badge admin-badge-green">{mesVentes.length}</span></td>
                          <td><span className={`admin-badge admin-badge-${u.actif !== false ? "green" : "red"}`}>{u.actif !== false ? "Actif" : "Suspendu"}</span></td>
                          <td>
                            <div style={{ display: "flex", gap: 3 }}>
                              <button className="admin-action-btn" style={{ background: u.actif !== false ? "#fff0f0" : "#e6fff0", color: u.actif !== false ? "#ce1126" : "#1a6b3a" }} onClick={() => toggleVendeur(uid, u.actif !== false)}>
                                {u.actif !== false ? "⛔" : "✅"}
                              </button>
                              {u.telephone && <a href={`https://wa.me/${u.telephone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="admin-action-btn" style={{ background: "#dcfce7", color: "#166534", textDecoration: "none" }}>📱</a>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════ PRESTATAIRES ════════ */}
        {adminTab === "prestataires" && (
          <>
            <div className="admin-page-title">
              👷 Candidatures prestataires
              <span style={{ fontSize: ".75rem", background: prestPending > 0 ? "#ce1126" : "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>
                {prestPending} en attente
              </span>
            </div>

            <div className="stat-cards-grid" style={{ marginBottom: 18 }}>
              <StatCard icon="⏳" val={prestatairesList.filter(p => p.status === "pending").length} lbl="En attente" col="#fff9e6" ic="#b8860b" />
              <StatCard icon="✅" val={prestatairesList.filter(p => p.status === "approved").length} lbl="Approuvés" col="#e6fff0" ic="#1a6b3a" />
              <StatCard icon="❌" val={prestatairesList.filter(p => p.status === "rejected").length} lbl="Refusés" col="#fff0f0" ic="#ce1126" />
              <StatCard icon="📋" val={prestatairesList.length} lbl="Total" col="#e6f0ff" ic="#1a4a9a" />
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {[
                { id: "pending",  label: "⏳ En attente" },
                { id: "approved", label: "✅ Approuvés" },
                { id: "rejected", label: "❌ Refusés" },
                { id: "all",      label: "📋 Tous" },
              ].map(f => (
                <button key={f.id} onClick={() => setPrestFilter(f.id)} style={{
                  background: prestFilter === f.id ? "var(--green)" : "var(--surface)",
                  color: prestFilter === f.id ? "#fff" : "var(--ink)",
                  border: `1.5px solid ${prestFilter === f.id ? "var(--green)" : "var(--border)"}`,
                  borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".78rem",
                }}>
                  {f.label} ({f.id === "all" ? prestatairesList.length : prestatairesList.filter(p => p.status === f.id).length})
                </button>
              ))}
            </div>

            {prestatairesList.filter(p => prestFilter === "all" || p.status === prestFilter).length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--gray)", background: "var(--surface)", borderRadius: 12 }}>
                <div style={{ fontSize: "3rem", marginBottom: 10 }}>👷</div>
                <p>Aucune candidature {prestFilter !== "all" ? prestFilter : ""}</p>
              </div>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Candidat</th><th>Métier</th><th>Ville</th><th>Téléphone</th><th>Statut</th><th>Actions</th></tr></thead>
                  <tbody>
                    {prestatairesList
                      .filter(p => prestFilter === "all" || p.status === prestFilter)
                      .map(p => (
                        <tr key={p.id}>
                          <td><strong style={{ fontSize: ".82rem" }}>{p.nom}{p.prenom ? " " + p.prenom : ""}</strong></td>
                          <td><span className="admin-badge admin-badge-blue">{p.metier}</span></td>
                          <td style={{ fontSize: ".75rem" }}>{p.ville || "—"}</td>
                          <td style={{ fontSize: ".75rem", color: "var(--gray)" }}>{p.telephone}</td>
                          <td>
                            <span className={`admin-badge admin-badge-${p.status === "approved" ? "green" : p.status === "rejected" ? "red" : "yellow"}`}>
                              {p.status === "approved" ? "✅ Approuvé" : p.status === "rejected" ? "❌ Refusé" : "⏳ En attente"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {p.status === "pending" && (
                                <>
                                  <button className="admin-action-btn" style={{ background: "#e6fff0", color: "#1a6b3a" }} onClick={async () => {
                                    if (!window.confirm(`Approuver ${p.nom} ?`)) return;
                                    await supabase.from("prestataires").update({ status: "approved", verifie: true }).eq("id", p.id);
                                    setPrestatairesList(prev => prev.map(x => x.id === p.id ? { ...x, status: "approved" } : x));
                                    showToast(`✅ ${p.nom} approuvé`);
                                  }}>✅</button>
                                  <button className="admin-action-btn" style={{ background: "#fff0f0", color: "#ce1126" }} onClick={async () => {
                                    if (!window.confirm(`Refuser ${p.nom} ?`)) return;
                                    await supabase.from("prestataires").update({ status: "rejected" }).eq("id", p.id);
                                    setPrestatairesList(prev => prev.map(x => x.id === p.id ? { ...x, status: "rejected" } : x));
                                    showToast(`❌ Refusé`);
                                  }}>❌</button>
                                </>
                              )}
                              {p.telephone && <a href={`https://wa.me/${p.telephone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="admin-action-btn" style={{ background: "#dcfce7", color: "#166534", textDecoration: "none" }}>📱</a>}
                            </div>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════════ REVENUS ════════ */}
        {adminTab === "revenus" && (
          <>
            <div className="admin-page-title">💰 Revenus & Finances</div>
            <div className="stat-cards-grid" style={{ marginBottom: 20 }}>
              <StatCard icon="💵" val={`${stats.commissionTotal.toLocaleString()} F`} lbl="Commissions totales (5%)" col="#e6fff0" ic="#1a6b3a" />
              <StatCard icon="💰" val={`${stats.revenue.toLocaleString()} F`} lbl="Volume total" col="#fff9e6" ic="#b8860b" />
              <StatCard icon="📅" val={`${stats.revenueToday.toLocaleString()} F`} lbl="Aujourd'hui" col="#f0fff4" ic="#276749" />
              <StatCard icon="📈" val={`${stats.revenueWeek.toLocaleString()} F`} lbl="7 jours" col="#fef9f0" ic="#7b5a10" />
            </div>

            <div className="admin-section">
              <div className="admin-section-title">📈 Commissions journalières (7 derniers jours)</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginBottom: 8 }}>
                {chartVentes.map((d, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    {d.revenue > 0 && <div style={{ fontSize: ".6rem", color: "var(--gray)" }}>{d.revenue.toLocaleString()}</div>}
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      height: `${Math.max((d.revenue / maxChartRev) * 90, d.revenue > 0 ? 8 : 3)}px`,
                      background: i === chartVentes.length - 1 ? "var(--yellow, #fcd116)" : "var(--green)",
                      opacity: .85,
                    }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {chartVentes.map((d, i) => <div key={i} style={{ flex: 1, textAlign: "center", fontSize: ".63rem", color: "var(--gray)" }}>{d.label}</div>)}
              </div>
            </div>
          </>
        )}

        {/* ════════ PROMO LIVRAISON ════════ */}
        {adminTab === "commerce_promo" && (
          <>
            <div className="admin-page-title">🎁 Livraison offerte au seuil</div>
            <p style={{ color: "var(--gray)", fontSize: ".82rem", lineHeight: 1.55, marginTop: -6, marginBottom: 18 }}>
              Pilotage conversion : KPI issus des derniers <strong>checkout préparés</strong>{" "}
              (échantillon chargé depuis Supabase — à rapprocher des paiements confirmés).
            </p>
            <div className="stat-cards-grid" style={{ marginBottom: 22 }}>
              <StatCard
                icon="🎉"
                val={deliveryPromoStats.freeShippingOrders.toLocaleString()}
                lbl="Checkouts livraison offerte"
                trend={`Dont ${deliveryPromoStats.ordersWithShippable.toLocaleString()} paniers avec produits`}
                col="#eafaf1"
                ic="#146635"
              />
              <StatCard
                icon="🚚"
                val={deliveryPromoStats.paidShippingOrders.toLocaleString()}
                lbl="Checkouts avec frais livraison"
                trend="Référence politique catalogue colis"
                col="#fff9e6"
                ic="#946200"
              />
              <StatCard
                icon="📊"
                val={`${deliveryPromoStats.avgBasketShippable.toLocaleString()} F`}
                lbl="Panier moyen (avec produits)"
                trend={`Coût logistique théorique subventionné ≥ ${deliveryPromoStats.estimatedLogisticsSubsidy.toLocaleString()} F`}
                col="#e6f0ff"
                ic="#1a4a9a"
              />
            </div>

            <div className="admin-section">
              <div className="admin-section-title">Réglages publics — seuils & frais standards</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: ".75rem", fontWeight: 700 }}>
                  Seuil livraison gratuite (FCFA · produits livrés)
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    step={500}
                    value={commerceForm.threshold}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, threshold: e.target.value }))}
                    style={{ maxWidth: 200 }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: ".75rem", fontWeight: 700 }}>
                  Frais livraison standard (FCFA)
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    step={100}
                    value={commerceForm.fee}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, fee: e.target.value }))}
                    style={{ maxWidth: 200 }}
                  />
                </label>
                <button type="button" className="admin-action-btn" style={{ background: "var(--green)", color: "#fff" }} onClick={persistCommercePromo}>
                  Enregistrer
                </button>
              </div>
              <p style={{ marginTop: 12, fontSize: ".7rem", color: "var(--gray)", lineHeight: 1.45 }}>
                Les fonctions Edge <code style={{ fontSize: ".68rem" }}>create_checkout_intent</code> et{" "}
                <code style={{ fontSize: ".68rem" }}>confirm_checkout</code> relisent automatiquement cette table.
                Fallback env : FREE_SHIPPING_THRESHOLD_XAF · STANDARD_DELIVERY_FEE_XAF.
              </p>
            </div>

            <div className="admin-section">
              <div className="admin-section-title">Politique catalogue — gestion automatique des ruptures</div>
              <p style={{ fontSize: ".75rem", color: "var(--gray)", marginBottom: 14, lineHeight: 1.55 }}>
                Quand un produit tombe à stock = 0, le vendeur est notifié, relancé puis le produit est archivé ou supprimé après le délai configuré.
                L'Edge Function <code style={{ fontSize: ".68rem" }}>stock_lifecycle</code> doit être planifiée en cron quotidien.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: ".75rem", fontWeight: 700 }}>
                  Délai d'archivage (jours)
                  <input
                    className="form-input"
                    type="number"
                    min={1}
                    max={365}
                    step={1}
                    value={commerceForm.stockOutGraceDays}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, stockOutGraceDays: e.target.value }))}
                    style={{ maxWidth: 130 }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: ".75rem", fontWeight: 700 }}>
                  Seuil stock bas (badge ⚠️)
                  <input
                    className="form-input"
                    type="number"
                    min={0}
                    max={1000}
                    step={1}
                    value={commerceForm.stockLowThreshold}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, stockLowThreshold: e.target.value }))}
                    style={{ maxWidth: 130 }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: ".75rem", fontWeight: 700 }}>
                  Rappels (j séparés par virgules)
                  <input
                    className="form-input"
                    type="text"
                    value={commerceForm.stockReminderDaysCsv}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, stockReminderDaysCsv: e.target.value }))}
                    placeholder="1,15,25"
                    style={{ maxWidth: 180 }}
                  />
                </label>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 14, alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={commerceForm.stockAutoArchive}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, stockAutoArchive: e.target.checked }))}
                  />
                  Archiver automatiquement (soft delete) après le délai
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={commerceForm.stockPremiumSellerExempt}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, stockPremiumSellerExempt: e.target.checked }))}
                  />
                  Exempter les vendeurs premium
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", fontWeight: 600, color: commerceForm.stockHardDelete ? "#ce1126" : "var(--ink)" }}>
                  <input
                    type="checkbox"
                    checked={commerceForm.stockHardDelete}
                    onChange={(e) => setCommerceForm((f) => ({ ...f, stockHardDelete: e.target.checked }))}
                  />
                  Suppression définitive (après 2× le délai) — DANGER
                </label>
                <button type="button" className="admin-action-btn" style={{ background: "var(--green)", color: "#fff" }} onClick={persistCommercePromo}>
                  Enregistrer
                </button>
              </div>
              <p style={{ marginTop: 12, fontSize: ".7rem", color: "var(--gray)", lineHeight: 1.45 }}>
                Audit complet dans la table <code style={{ fontSize: ".68rem" }}>stock_lifecycle_log</code> (réservée aux admins).
                Les notifications passent par <code style={{ fontSize: ".68rem" }}>notifications</code> +{" "}
                <code style={{ fontSize: ".68rem" }}>dispatch_notification</code>.
              </p>
            </div>
          </>
        )}

        {/* ════════ YORIX POINTS ════════ */}
        {adminTab === "loyalty" && (
          <LoyaltyAdminTab user={user} userData={userData} showToast={showToast} readOnly={!canWrite} />
        )}

        {adminTab === "messagerie" && canWrite && (
          <>
            <div className="admin-page-title">💬 Messagerie communauté</div>
            <AdminBroadcastPanel showToast={showToast} />
          </>
        )}

        {adminTab === "notif_center" && (
          <>
            <div className="admin-page-title">📣 Réseau notifications</div>
            <p style={{ color: "var(--gray)", fontSize: ".85rem", marginBottom: 18, maxWidth: 720, lineHeight: 1.65 }}>
              Agrégats Supabase (fenêtre 7 jours + appareils Web Push). E-mails Resend uniquement pour messages,
              commandes, paiements, livraison et sécurité (opt-in utilisateur). Nouveaux produits, stock et packs :
              notification in-app seulement — pas d&apos;email automatique.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16 }}>
              <div className="stat-card" style={{ padding: "18px 16px" }}>
                <div className="stat-card-icon" style={{ background: "#e6fff0" }}><span>🔔</span></div>
                <div className="stat-card-val">{notifStackStats.notifsWeek.toLocaleString("fr-FR")}</div>
                <div className="stat-card-lbl">Notifications créées (7 j)</div>
              </div>
              <div className="stat-card" style={{ padding: "18px 16px" }}>
                <div className="stat-card-icon" style={{ background: "#e0f2fe" }}><span>📱</span></div>
                <div className="stat-card-val">{notifStackStats.pushDevices.toLocaleString("fr-FR")}</div>
                <div className="stat-card-lbl">Appareils push enregistrés</div>
              </div>
              <div className="stat-card" style={{ padding: "18px 16px" }}>
                <div className="stat-card-icon" style={{ background: "#fff9e6" }}><span>📡</span></div>
                <div className="stat-card-val">{notifStackStats.deliveryLogsWeek.toLocaleString("fr-FR")}</div>
                <div className="stat-card-lbl">Logs envois push (7 j)</div>
              </div>
            </div>
            <div style={{ marginTop: 22, padding: 16, background: "var(--surface2)", borderRadius: 12, border: "1px solid var(--border)", fontSize: ".78rem", color: "var(--gray)", lineHeight: 1.55 }}>
              <strong style={{ color: "var(--ink)" }}>Production</strong> : configurer VAPID sur le projet, déployer{" "}
              <code>dispatch_notification</code>, brancher webhooks critiques. Les inserts in-app depuis le checkout passent par{" "}
              <code>confirm_checkout</code> (service role) puis dispatch automatique.
            </div>
          </>
        )}

        {/* ════════ ALERTES ════════ */}
        {adminTab === "alertes" && (
          <>
            <div className="admin-page-title">
              🔔 Alertes & Notifications
              <span style={{ fontSize: ".75rem", background: alertes.length > 0 ? "var(--red)" : "var(--green)", color: "#fff", padding: "3px 10px", borderRadius: 50, fontWeight: 600, marginLeft: 8 }}>
                {alertes.length}
              </span>
            </div>

            {alertes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray)" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: 12 }}>✅</div>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "1rem", marginBottom: 6, color: "var(--ink)" }}>Tout va bien !</div>
                <p>Aucune alerte sur Yorix.</p>
              </div>
            ) : (
              <>
                <div className="admin-section">
                  <div className="admin-section-title">
                    🚚 Livraisons à assigner
                    <span className="admin-badge admin-badge-yellow">{adminDeliveries.filter(d => d.statut === "commande_recue" && !d.livreur_id).length}</span>
                  </div>
                  {adminDeliveries.filter(d => d.statut === "commande_recue" && !d.livreur_id).length === 0
                    ? <div className="admin-alert admin-alert-green">✅ Toutes les livraisons ont un livreur</div>
                    : adminDeliveries.filter(d => d.statut === "commande_recue" && !d.livreur_id).map(d => (
                      <div key={d.id} className="admin-alert admin-alert-yellow" style={{ flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <strong>{d.code_suivi}</strong>
                          <div style={{ fontSize: ".7rem", marginTop: 2 }}>{d.client_nom} → {d.adresse_livraison}</div>
                        </div>
                        <button onClick={() => { setAdminTab("deliveries"); setAssignModalOpen(d); }} style={{ marginLeft: "auto", background: "var(--green)", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: ".72rem", fontWeight: 700 }}>
                          🏍️ Assigner
                        </button>
                      </div>
                    ))
                  }
                </div>

                <div className="admin-section">
                  <div className="admin-section-title">
                    📦 Ruptures de stock
                    <span className="admin-badge admin-badge-red">{produits.filter(p => (p.stock || 0) === 0).length}</span>
                  </div>
                  {produits.filter(p => (p.stock || 0) === 0).length === 0
                    ? <div className="admin-alert admin-alert-green">✅ Aucun produit en rupture</div>
                    : produits.filter(p => (p.stock || 0) === 0).slice(0, 8).map(p => (
                      <div key={p.id} className="admin-alert admin-alert-red">
                        <div>
                          <strong>{p.name_fr || "Produit"}</strong>
                          <div style={{ fontSize: ".7rem", marginTop: 2 }}>Vendeur : {p.vendeur_nom || "—"}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>

                <div className="admin-section">
                  <div className="admin-section-title">
                    ⏳ Commandes en attente
                    <span className="admin-badge admin-badge-yellow">{commandes.filter(o => o.status === "pending").length}</span>
                  </div>
                  {commandes.filter(o => o.status === "pending").length === 0
                    ? <div className="admin-alert admin-alert-green">✅ Aucune commande en attente</div>
                    : commandes.filter(o => o.status === "pending").slice(0, 6).map(o => (
                      <div key={o.id} className="admin-alert admin-alert-yellow" style={{ flexWrap: "wrap", gap: 8 }}>
                        <div>
                          <strong>{o.client_nom || "Client"}</strong>
                          <div style={{ fontSize: ".7rem", marginTop: 2 }}>{(o.montant || 0).toLocaleString()} FCFA</div>
                        </div>
                        <button onClick={() => validerCommande(o.id)} style={{ marginLeft: "auto", background: "var(--green)", color: "#fff", border: "none", padding: "5px 10px", borderRadius: 6, cursor: "pointer", fontSize: ".7rem", fontWeight: 700 }}>
                          ✅ Valider
                        </button>
                      </div>
                    ))
                  }
                </div>
              </>
            )}
          </>
        )}

      </div>
      </div>
    </div>
  );
}
