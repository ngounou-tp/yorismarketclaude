import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import { DASHBOARD_ORDERS_LIMIT, DASHBOARD_PRODUCTS_LIMIT } from "../lib/queryLimits";
import { uploadSingleImage } from "../utils/helpers";
import { buildMadeInCameroonPayload } from "../lib/madeInCameroon";
import { buildProductCategoryPayload } from "../lib/marketplaceCategories";
import { CategoryPicker } from "./categories/CategoryPicker";
import {
  computeStockStatus,
  daysUntilAutoRemoval,
  daysSinceOutOfStock,
  STOCK_STATUS,
} from "../lib/stockStatus";
import {
  updateProduct,
  toggleProductActive,
  deleteProduct,
} from "../lib/catalogMutations";

// ─────────────────────────────────────────────────────────────
// COMPOSANT : SELLER DASHBOARD — Yorix CM (version complète)
// ─────────────────────────────────────────────────────────────
export function SellerDashboard({
  user,
  userData,
  dashTab,
  setDashTab,
  categoryTree = [],
  categoryFlat = [],
  categoryLoading = false,
  onReloadCategories,
}) {
  const { t } = useTranslation("seller");
  const [mesProduits, setMesProduits]     = useState([]);
  const [mesCommandes, setMesCommandes]   = useState([]);
  const [wallet, setWallet]               = useState({ solde: 0, total_gagne: 0 });
  const [stockSettings, setStockSettings] = useState({ stock_low_threshold: 5, stock_out_grace_days: 30 });
  const [loadingData, setLoadingData]     = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);
  const [saveMsg, setSaveMsg]             = useState(null);
  const [quickRestock, setQuickRestock]   = useState({}); // { [productId]: stockValue }

  // ── Formulaire ajout produit ──
  const [form, setForm]         = useState({
    name_fr: "",
    name_en: "",
    description_fr: "",
    prix: "",
    stock: "",
    categorie: "",
    parentSlug: "",
    subSlug: "",
    ville: "",
    escrow: true,
    madeInChoice: "no",
    localBrandName: "",
    countryOfOrigin: "CM",
    isPack: false,
    packDescription: "",
    linkedProductIds: [],
  });
  const [images, setImages]     = useState([]);
  const [previews, setPreviews] = useState([]);
  const [progress, setProgress] = useState(0);
  const [saving, setSaving]     = useState(false);
  const inputRef                = useRef(null);

  // ── Édition inline produit ──
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm]   = useState({});

  // ── Confirmation suppression ──
  const [pendingDelete, setPendingDelete] = useState(null);

  // ── Confirmation action commande ──
  const [pendingConfirm, setPendingConfirm] = useState(null);

  const VILLES = ["Yaoundé", "Douala", "Bafoussam", "Bamenda", "Garoua", "Maroua", "Ngaoundéré", "Bertoua", "Ebolowa", "Kribi"];

  const statusLabel = (s) => t(`orders.status.${s}`, { defaultValue: s });
  const STATUS_COLORS = { pending: "#888", paid: "#2563eb", shipped: "#d97706", delivered: "#16a34a", cancelled: "#dc2626" };

  // ── CHARGEMENT DONNÉES ──
  const loadAll = async () => {
    if (!user?.id) return;
    setLoadingData(true);

    const [prodsRes, cmdsRes, walRes, settingsRes] = await Promise.all([
      supabase.from("products").select("*").eq("vendeur_id", user.id).order("created_at", { ascending: false }).limit(DASHBOARD_PRODUCTS_LIMIT),
      supabase.from("orders").select("*").eq("vendeur_id", user.id).order("created_at", { ascending: false }).limit(DASHBOARD_ORDERS_LIMIT),
      supabase.from("wallets").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("commerce_settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (prodsRes.error) console.error("products:", prodsRes.error);
    if (cmdsRes.error)  console.error("orders:",   cmdsRes.error);
    if (walRes.error)   console.error("wallets:",  walRes.error);

    setMesProduits(prodsRes.data || []);
    setMesCommandes(cmdsRes.data || []);
    if (walRes.data) setWallet(walRes.data);
    if (settingsRes?.data) setStockSettings(settingsRes.data);
    setLoadingData(false);
  };

  // ── RUPTURE STOCK : helpers ──
  const ruptureProducts = useMemo(() => {
    return mesProduits
      .filter((p) => {
        const status = computeStockStatus(p, stockSettings);
        return status === STOCK_STATUS.OUT_OF_STOCK || status === STOCK_STATUS.ARCHIVED;
      })
      .map((p) => ({
        ...p,
        _daysOut: daysSinceOutOfStock(p) ?? 0,
        _daysLeft: daysUntilAutoRemoval(p, stockSettings),
        _isArchived: computeStockStatus(p, stockSettings) === STOCK_STATUS.ARCHIVED,
      }))
      .sort((a, b) => (a._daysLeft ?? 999) - (b._daysLeft ?? 999));
  }, [mesProduits, stockSettings]);

  const quickRestockProduct = async (productId) => {
    const raw = quickRestock[productId];
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      alert("Saisissez un stock supérieur à 0 pour réapprovisionner.");
      return;
    }
    setLoadingAction(true);
    const { error } = await supabase
      .from("products")
      .update({ stock: value, actif: true })
      .eq("id", productId)
      .eq("vendeur_id", user.id);
    setLoadingAction(false);
    if (error) {
      alert("Erreur réapprovisionnement : " + error.message);
      return;
    }
    setQuickRestock((q) => ({ ...q, [productId]: "" }));
    loadAll();
  };

  const reactivateArchivedProduct = async (productId, currentStock) => {
    const restock = Number(quickRestock[productId]);
    const newStock = Number.isFinite(restock) && restock > 0
      ? restock
      : (Number(currentStock) > 0 ? Number(currentStock) : 1);
    setLoadingAction(true);
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock, actif: true, is_archived: false, hidden_from_marketplace: false })
      .eq("id", productId)
      .eq("vendeur_id", user.id);
    setLoadingAction(false);
    if (error) {
      alert("Erreur réactivation : " + error.message);
      return;
    }
    setQuickRestock((q) => ({ ...q, [productId]: "" }));
    loadAll();
  };

  useEffect(() => { loadAll(); }, [user?.id]);

  // ── AJOUT PRODUIT ──
  const handleFiles = (files) => {
    const arr = Array.from(files).slice(0, 8);
    setImages(prev  => [...prev, ...arr].slice(0, 8));
    const urls = arr.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...urls].slice(0, 8));
  };

  const removePreview = (i) => {
    setImages(prev   => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const resetForm = () => {
    setForm({
      name_fr: "",
      name_en: "",
      description_fr: "",
      prix: "",
      stock: "",
      categorie: "",
      parentSlug: "",
      subSlug: "",
      ville: "",
      escrow: true,
      madeInChoice: "no",
      localBrandName: "",
      countryOfOrigin: "CM",
      isPack: false,
      packDescription: "",
      linkedProductIds: [],
    });
    setImages([]); setPreviews([]); setProgress(0);
  };

  const saveNewProduct = async () => {
    if (!form.name_fr.trim() || !form.prix || isNaN(Number(form.prix))) {
      setSaveMsg({ type: "error", text: t("products.saveErrorNamePrice") });
      setTimeout(() => setSaveMsg(null), 3000);
      return;
    }
    if (!form.isPack && !form.parentSlug) {
      setSaveMsg({
        type: "error",
        text: "Choisissez une catégorie (et une sous-catégorie si proposée).",
      });
      setTimeout(() => setSaveMsg(null), 3000);
      return;
    }
    const parentNode = form.isPack
      ? null
      : categoryTree.find((n) => n.slug === form.parentSlug);
    const needsSub = !form.isPack && (parentNode?.children?.length ?? 0) > 0;
    if (needsSub && !form.subSlug) {
      setSaveMsg({ type: "error", text: "Choisissez une sous-catégorie pour ce rayon." });
      setTimeout(() => setSaveMsg(null), 3000);
      return;
    }
    if (form.isPack) {
      if (!form.packDescription.trim()) {
        setSaveMsg({ type: "error", text: "Décrivez le contenu du pack (ex. poisson + riz)." });
        setTimeout(() => setSaveMsg(null), 4000);
        return;
      }
      if ((form.linkedProductIds || []).length < 2) {
        setSaveMsg({ type: "error", text: "Liez au moins 2 produits existants à ce pack." });
        setTimeout(() => setSaveMsg(null), 4000);
        return;
      }
    }
    setSaving(true); setProgress(10);
    try {
      let imageUrls = [];
      if (images.length > 0) {
        setProgress(20);
        const uploads = images.map((f, i) =>
          uploadSingleImage(f).then(url => {
            setProgress(20 + Math.round((i + 1) / images.length * 50));
            return url;
          })
        );
        imageUrls = (await Promise.all(uploads)).filter(Boolean);
      }
      setProgress(80);

      const catPayload = buildProductCategoryPayload(categoryFlat, {
        parentSlug: form.parentSlug,
        subSlug: form.subSlug,
        legacyLabel: form.categorie,
      });

      const micPayload = buildMadeInCameroonPayload(
        {
          madeInChoice: form.madeInChoice,
          localBrandName: form.localBrandName,
          countryOfOrigin: form.countryOfOrigin,
        },
        { ville: form.ville, categorie: catPayload.categorie, name_fr: form.name_fr },
        userData,
      );

      const isPack = Boolean(form.isPack);
      const packParentSlug = isPack ? "packs-ensemble" : form.parentSlug;
      const packCatPayload = isPack
        ? buildProductCategoryPayload(categoryFlat, {
            parentSlug: packParentSlug,
            subSlug: "",
            legacyLabel: "Packs & ensembles",
          })
        : catPayload;

      const { error } = await supabase.from("products").insert({
        name_fr:        form.name_fr,
        name_en:        form.name_en || form.name_fr,
        description_fr: form.description_fr,
        prix:           Number(form.prix),
        stock:          Number(form.stock || 0),
        categorie:      packCatPayload.categorie || "Autre",
        category_id:    packCatPayload.category_id,
        ville:          form.ville || "Douala",
        image:          imageUrls[0] || null,
        image_urls:     imageUrls,
        vendeur_id:     user.id,
        vendeur_nom:    userData?.nom || "",
        actif:          isPack ? false : true,
        escrow:         form.escrow,
        is_pack:        isPack,
        pack_status:    isPack ? "pending" : null,
        pack_description: isPack ? form.packDescription.trim() : null,
        pack_linked_product_ids: isPack ? form.linkedProductIds : [],
        pack_submitted_at: isPack ? new Date().toISOString() : null,
        ...micPayload,
        vues: 0, clics: 0, vente_total: 0, note: 0, nombre_avis: 0,
      });
      if (error) throw error;

      setProgress(100);
      setSaveMsg({
        type: "success",
        text: isPack
          ? "Pack envoyé — publication après validation admin (24–48 h)."
          : t("products.saved"),
      });
      resetForm();
      setTimeout(() => { setSaveMsg(null); setProgress(0); }, 3000);
      loadAll();
    } catch (err) {
      setSaveMsg({ type: "error", text: "Erreur : " + err.message });
    }
    setSaving(false);
  };

  // ── MODIFICATION PRODUIT ──
  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({
      name_fr:        p.name_fr || "",
      description_fr: p.description_fr || "",
      prix:           p.prix || "",
      stock:          p.stock ?? 0,
      categorie:      p.categorie || "",
      ville:          p.ville || "",
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    if (!editForm.name_fr?.trim() || !editForm.prix || isNaN(Number(editForm.prix))) {
      alert("Nom et prix sont obligatoires."); return;
    }
    setLoadingAction(true);
    const res = await updateProduct({
      productId: id,
      payload: {
        name_fr: editForm.name_fr,
        description_fr: editForm.description_fr,
        prix: Number(editForm.prix),
        stock: Number(editForm.stock || 0),
        categorie: editForm.categorie,
        ville: editForm.ville,
      },
      actor: { userId: user?.id, profile: userData },
    });

    if (!res.ok) {
      alert("Erreur modification : " + res.error);
      setLoadingAction(false);
      return;
    }
    setMesProduits(prev => prev.map(p => p.id === id ? { ...p, ...editForm, prix: Number(editForm.prix), stock: Number(editForm.stock || 0) } : p));
    setEditingId(null); setEditForm({});
    setLoadingAction(false);
  };

  // ── ACTIVER / DÉSACTIVER PRODUIT ──
  const toggleActif = async (id, current) => {
    const prod = mesProduits.find((p) => p.id === id);
    if (prod?.is_pack && prod.pack_status !== "approved" && !current) {
      alert("Ce pack doit être validé par l'admin avant publication.");
      return;
    }
    setLoadingAction(true);
    const res = await toggleProductActive({
      productId: id,
      currentActive: current,
      actor: { userId: user?.id, profile: userData },
    });
    if (!res.ok) { alert("Erreur : " + res.error); setLoadingAction(false); return; }
    setMesProduits(prev => prev.map(p => p.id === id ? { ...p, actif: !current } : p));
    setLoadingAction(false);
  };

  // ── SUPPRESSION PRODUIT ──
  const deleteProductHandler = async (id) => {
    setLoadingAction(true);
    const res = await deleteProduct({
      productId: id,
      actor: { userId: user?.id, profile: userData },
    });
    if (!res.ok) {
      alert("Erreur suppression : " + res.error);
      setLoadingAction(false);
      return;
    }
    if (res.mode === "soft") {
      setMesProduits(prev => prev.map(p => p.id === id ? {
        ...p,
        actif: false,
        is_archived: true,
        hidden_from_marketplace: true,
      } : p));
    } else {
      setMesProduits(prev => prev.filter(p => p.id !== id));
    }
    setPendingDelete(null);
    setLoadingAction(false);
  };

  // ── COMMANDES ──
  const updateOrderStatus = async (orderId, field, value) => {
    const { error } = await supabase.from("orders").update({ [field]: value }).eq("id", orderId);
    if (error) { console.error(error); alert("Erreur : " + error.message); setPendingConfirm(null); return; }
    setMesCommandes(prev => prev.map(c => c.id === orderId ? { ...c, [field]: value } : c));
    setPendingConfirm(null);
  };

  // ── UTILS ──
  const revenusTotal     = mesCommandes.reduce((t, c) => c.status === "delivered" ? t + (Number(c.montant_vendeur) || 0) : t, 0);
  const commandesActives = mesCommandes.filter(c => ["pending", "paid", "shipped"].includes(c.status)).length;

  // ── STYLES INLINE PARTAGÉS ──
  const S = {
    card:     { background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: 20, marginBottom: 14 },
    input:    { border: "1.5px solid var(--border)", borderRadius: 8, padding: "8px 11px", fontFamily: "'DM Sans',sans-serif", fontSize: ".82rem", background: "var(--surface)", color: "var(--ink)", outline: "none", width: "100%" },
    label:    { fontSize: ".72rem", fontWeight: 600, color: "var(--ink)", marginBottom: 4, display: "block" },
    btnGreen: { background: "var(--green)", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".78rem" },
    btnGhost: { background: "var(--surface2)", color: "var(--ink)", border: "1.5px solid var(--border)", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".78rem" },
    btnRed:   { background: "transparent", color: "#ce1126", border: "1.5px solid #fecaca", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".75rem" },
    btnBlue:  { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "'DM Sans',sans-serif", fontWeight: 600, fontSize: ".75rem" },
    row:      { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
    secTitle: { fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--ink)", marginBottom: 14 },
  };

  if (loadingData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, gap: 12, color: "var(--green)" }}>
        <div className="spinner" style={{ width: 30, height: 30, borderWidth: 3 }} /> {t("loading")}
      </div>
    );
  }

  return (
    <>
      {/* ── MODAL CONFIRMATION SUPPRESSION ── */}
      {pendingDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", borderRadius: 14, padding: 28, maxWidth: 340, width: "90%", textAlign: "center", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>🗑️</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--ink)", marginBottom: 8 }}>{t("products.deleteTitle")}</div>
            <p style={{ fontSize: ".82rem", color: "var(--gray)", marginBottom: 20, lineHeight: 1.6 }}>
              {t("products.deleteBody", { name: pendingDelete.nom })}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button style={S.btnGhost} onClick={() => setPendingDelete(null)}>{t("products.cancel")}</button>
              <button
                disabled={loadingAction}
                style={{ ...S.btnRed, background: "#ce1126", color: "#fff", border: "none", padding: "8px 20px" }}
                onClick={() => deleteProductHandler(pendingDelete.id)}
              >
                {loadingAction ? t("products.deleting") : t("products.delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL CONFIRMATION COMMANDE ── */}
      {pendingConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "var(--surface)", borderRadius: 14, padding: 24, maxWidth: 320, width: "90%", textAlign: "center", border: "1px solid var(--border)" }}>
            <p style={{ marginBottom: 18, fontSize: ".85rem", lineHeight: 1.6 }}>{pendingConfirm.label}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button style={S.btnGhost} onClick={() => setPendingConfirm(null)}>{t("products.cancel")}</button>
              <button style={S.btnGreen} onClick={() => updateOrderStatus(pendingConfirm.id, pendingConfirm.field, pendingConfirm.value)}>
                {t("products.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ OVERVIEW ════ */}
      {dashTab === "overview" && (
        <>
          <div className="dash-page-title">{t("greeting", { name: userData?.nom || "" })}</div>

          <div className="dash-stats">
            {[
              { icon: "📦", val: mesProduits.length, lbl: t("stats.published") },
              { icon: "🛒", val: commandesActives, lbl: t("stats.activeOrders") },
              { icon: "✅", val: mesCommandes.filter(c => c.status === "delivered").length, lbl: t("stats.delivered") },
              { icon: "💰", val: `${revenusTotal.toLocaleString("fr-FR")} FCFA`, lbl: t("stats.netRevenue") },
            ].map(s => (
              <div key={s.lbl} className="dstat">
                <div className="dstat-icon">{s.icon}</div>
                <div className="dstat-val">{s.val}</div>
                <div className="dstat-lbl">{s.lbl}</div>
              </div>
            ))}
          </div>

          {ruptureProducts.length > 0 && (
            <div style={{ ...S.card, border: "1.5px solid #ce1126", background: "linear-gradient(180deg,#fff5f5 0%,var(--surface) 60%)" }}>
              <div style={S.row}>
                <div style={S.secTitle}>⚠️ Produits en rupture ({ruptureProducts.length})</div>
                <span style={{ fontSize: ".7rem", color: "var(--gray)" }}>
                  Archivage auto après {stockSettings.stock_out_grace_days || 30}j sans stock
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ruptureProducts.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 12px", background: "var(--surface)",
                      borderRadius: 10, border: "1px solid var(--border)",
                      flexWrap: "wrap",
                    }}
                  >
                    {p.image ? (
                      <img src={p.image} alt="" style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={(e) => (e.currentTarget.style.display = "none")} />
                    ) : (
                      <div style={{ width: 46, height: 46, borderRadius: 8, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>📦</div>
                    )}
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <div style={{ fontWeight: 700, fontSize: ".82rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name_fr}</div>
                      <div style={{ fontSize: ".68rem", color: "var(--gray)", marginTop: 2, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <span>📅 En rupture depuis {p._daysOut}j</span>
                        {p._isArchived ? (
                          <span style={{ color: "#888" }}>🗄️ Archivé</span>
                        ) : p._daysLeft != null ? (
                          <span style={{ color: p._daysLeft <= 5 ? "#ce1126" : p._daysLeft <= 15 ? "#d97706" : "var(--gray)" }}>
                            ⏳ {Math.max(0, p._daysLeft)}j avant retrait auto
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <input
                      type="number"
                      min={1}
                      placeholder="Stock"
                      value={quickRestock[p.id] || ""}
                      onChange={(e) => setQuickRestock((q) => ({ ...q, [p.id]: e.target.value }))}
                      style={{ ...S.input, width: 80, padding: "6px 9px", fontSize: ".75rem" }}
                    />
                    {p._isArchived ? (
                      <button
                        style={{ ...S.btnGreen, fontSize: ".72rem", padding: "6px 11px" }}
                        disabled={loadingAction}
                        onClick={() => reactivateArchivedProduct(p.id, p.stock)}
                      >
                        ♻️ Réactiver
                      </button>
                    ) : (
                      <button
                        style={{ ...S.btnGreen, fontSize: ".72rem", padding: "6px 11px" }}
                        disabled={loadingAction}
                        onClick={() => quickRestockProduct(p.id)}
                      >
                        ➕ Réapprovisionner
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {ruptureProducts.length > 6 && (
                <button style={{ ...S.btnGhost, marginTop: 10 }} onClick={() => setDashTab("mesProduits")}>
                  Voir les {ruptureProducts.length - 6} autres produits en rupture →
                </button>
              )}
            </div>
          )}

          <div style={S.card}>
            <div style={S.row}>
              <div style={S.secTitle}>📦 {t("products.recent")}</div>
              <button style={S.btnGhost} onClick={() => setDashTab("mesProduits")}>{t("products.seeAll")}</button>
            </div>
            {mesProduits.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p>{t("products.empty")}</p>
                <button style={{ ...S.btnGreen, marginTop: 12 }} onClick={() => setDashTab("ajouterProduit")}>+ {t("products.addFirst")}</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mesProduits.slice(0, 4).map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                    {p.image ? (
                      <img src={p.image} alt="" style={{ width: 46, height: 46, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                    ) : (
                      <div style={{ width: 46, height: 46, borderRadius: 8, background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>📦</div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: ".83rem", color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name_fr}</div>
                      <div style={{ fontSize: ".7rem", color: "var(--gray)", marginTop: 2 }}>{p.categorie} · {p.ville}</div>
                    </div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".88rem", color: "var(--green)", flexShrink: 0 }}>{p.prix?.toLocaleString()} F</div>
                    <span style={{ fontSize: ".65rem", padding: "2px 8px", borderRadius: 20, background: p.actif ? "var(--green-pale)" : "var(--surface2)", color: p.actif ? "var(--green)" : "var(--gray)", border: `1px solid ${p.actif ? "var(--green-light)" : "var(--border)"}`, flexShrink: 0 }}>
                      {p.actif ? t("products.active") : t("products.inactive")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={S.card}>
            <div style={S.row}>
              <div style={S.secTitle}>🛒 {t("orders.recent")}</div>
              <button style={S.btnGhost} onClick={() => setDashTab("commandes")}>{t("products.seeAll")}</button>
            </div>
            {mesCommandes.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">🛒</div><p>{t("orders.empty")}</p></div>
            ) : (
              mesCommandes.slice(0, 3).map(c => (
                <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: ".82rem" }}>{c.client_nom || "Client"}</div>
                    <div style={{ fontSize: ".7rem", color: "var(--gray)", marginTop: 2 }}>{(c.montant_vendeur || 0).toLocaleString()} FCFA</div>
                  </div>
                  <span style={{ fontSize: ".68rem", padding: "2px 10px", borderRadius: 20, background: (STATUS_COLORS[c.status] || "#888") + "22", color: STATUS_COLORS[c.status] || "#888", fontWeight: 600 }}>
                    {statusLabel(c.status)}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* ════ MES PRODUITS ════ */}
      {dashTab === "mesProduits" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="dash-page-title" style={{ marginBottom: 0 }}>📦 {t("products.titleCount", { count: mesProduits.length })}</div>
            <button style={S.btnGreen} onClick={() => setDashTab("ajouterProduit")}>+ {t("products.add")}</button>
          </div>

          {mesProduits.length === 0 ? (
            <div style={S.card}>
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p>{t("products.empty")}</p>
                <button style={{ ...S.btnGreen, marginTop: 12 }} onClick={() => setDashTab("ajouterProduit")}>+ {t("products.addFirst")}</button>
              </div>
            </div>
          ) : (
            mesProduits.map(p => (
              <div key={p.id} style={{ ...S.card, opacity: p.actif ? 1 : 0.65, transition: "opacity .2s" }}>
                {editingId === p.id ? (
                  <>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".9rem", color: "var(--green)", marginBottom: 14 }}>✏️ {t("products.edit")}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={S.label}>Nom (FR) *</label>
                        <input style={S.input} value={editForm.name_fr} onChange={e => setEditForm(f => ({ ...f, name_fr: e.target.value }))} />
                      </div>
                      <div>
                        <label style={S.label}>Prix (FCFA) *</label>
                        <input style={S.input} type="number" value={editForm.prix} onChange={e => setEditForm(f => ({ ...f, prix: e.target.value }))} />
                      </div>
                      <div>
                        <label style={S.label}>Stock</label>
                        <input style={S.input} type="number" value={editForm.stock} onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))} />
                      </div>
                      <div>
                        <label style={S.label}>Catégorie</label>
                        <select style={S.input} value={editForm.categorie} onChange={e => setEditForm(f => ({ ...f, categorie: e.target.value }))}>
                          <option value="">Choisir...</option>
                          {categoryFlat.filter((r) => r.parent_id).map((c) => (
                            <option key={c.id || c.slug} value={c.name_fr}>{c.name_fr}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={S.label}>Ville</label>
                        <select style={S.input} value={editForm.ville} onChange={e => setEditForm(f => ({ ...f, ville: e.target.value }))}>
                          <option value="">Choisir...</option>
                          {VILLES.map(v => <option key={v}>{v}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn: "1/-1" }}>
                        <label style={S.label}>Description</label>
                        <textarea style={{ ...S.input, minHeight: 65, resize: "vertical" }} value={editForm.description_fr} onChange={e => setEditForm(f => ({ ...f, description_fr: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btnGreen} disabled={loadingAction} onClick={() => saveEdit(p.id)}>
                        {loadingAction ? "Sauvegarde..." : "✅ Sauvegarder"}
                      </button>
                      <button style={S.btnGhost} onClick={cancelEdit}>{t("products.cancel")}</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      {p.image ? (
                        <img src={p.image} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: "cover", flexShrink: 0 }} onError={e => e.currentTarget.style.display = "none"} />
                      ) : (
                        <div style={{ width: 64, height: 64, borderRadius: 10, background: "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>📦</div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: ".92rem", color: "var(--ink)" }}>{p.name_fr}</div>
                          <span style={{ fontSize: ".62rem", padding: "2px 8px", borderRadius: 20, background: p.actif ? "var(--green-pale)" : "var(--surface2)", color: p.actif ? "var(--green)" : "var(--gray)", border: `1px solid ${p.actif ? "var(--green-light)" : "var(--border)"}` }}>
                            {p.actif ? "✅ Actif" : "⛔ Inactif"}
                          </span>
                          {p.is_pack && (
                            <span
                              style={{
                                fontSize: ".62rem",
                                padding: "2px 8px",
                                borderRadius: 20,
                                background: p.pack_status === "approved" ? "#ede9fe" : "#fef3c7",
                                color: p.pack_status === "approved" ? "#5b21b6" : "#92400e",
                                border: "1px solid #c4b5fd",
                              }}
                            >
                              📦 Pack ·{" "}
                              {p.pack_status === "approved"
                                ? "Publié"
                                : p.pack_status === "correction"
                                  ? "À corriger"
                                  : "En validation"}
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: ".75rem", color: "var(--gray)", marginBottom: 6 }}>
                          <span>💰 <strong style={{ color: "var(--green)" }}>{p.prix?.toLocaleString()} FCFA</strong></span>
                          <span>📦 Stock : <strong style={{ color: !p.stock || p.stock === 0 ? "#ce1126" : p.stock <= 5 ? "#d97706" : "var(--ink)" }}>{p.stock ?? 0}</strong></span>
                          {p.categorie && <span>🏷️ {p.categorie}</span>}
                          {p.ville     && <span>📍 {p.ville}</span>}
                        </div>
                        {p.description_fr && (
                          <div style={{ fontSize: ".72rem", color: "var(--gray)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {p.description_fr}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <button style={S.btnGreen} onClick={() => startEdit(p)}>✏️ {t("products.edit")}</button>
                      {p.is_pack && p.pack_status === "correction" && (
                        <button
                          style={S.btnBlue}
                          disabled={loadingAction}
                          onClick={async () => {
                            setLoadingAction(true);
                            const { error } = await supabase
                              .from("products")
                              .update({
                                pack_status: "pending",
                                pack_submitted_at: new Date().toISOString(),
                                actif: false,
                              })
                              .eq("id", p.id)
                              .eq("vendeur_id", user.id);
                            setLoadingAction(false);
                            if (error) alert(error.message);
                            else loadAll();
                          }}
                        >
                          📤 Renvoyer en validation
                        </button>
                      )}
                      <button
                        style={S.btnGhost}
                        disabled={loadingAction || (p.is_pack && p.pack_status !== "approved" && !p.actif)}
                        onClick={() => toggleActif(p.id, p.actif)}
                        title={
                          p.is_pack && p.pack_status !== "approved" && !p.actif
                            ? "En attente de validation admin"
                            : undefined
                        }
                      >
                        {p.actif ? "⛔ Désactiver" : "✅ Activer"}
                      </button>
                      <button style={S.btnRed} onClick={() => setPendingDelete({ id: p.id, nom: p.name_fr })}>
                        🗑️ {t("products.delete")}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ════ AJOUTER PRODUIT ════ */}
      {dashTab === "ajouterProduit" && (
        <div className="prod-form">
          <div className="pf-title">➕ Nouveau produit</div>

          {saveMsg && (
            <div className={saveMsg.type === "success" ? "success-msg" : "error-msg"} style={{ marginBottom: 14 }}>
              {saveMsg.text}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom du produit (FR) <span>*</span></label>
              <input className="form-input" placeholder="Ex: Sac tissé Bamoun" value={form.name_fr} onChange={e => setForm(f => ({ ...f, name_fr: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Nom (EN)</label>
              <input className="form-input" placeholder="Ex: Bamoun woven bag" value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label className="form-label">Description détaillée</label>
              <textarea className="form-textarea" placeholder="Matière, dimensions, utilisation..." value={form.description_fr} onChange={e => setForm(f => ({ ...f, description_fr: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Prix (FCFA) <span>*</span></label>
              <input className="form-input" type="number" min="0" placeholder="Ex: 25000" value={form.prix} onChange={e => setForm(f => ({ ...f, prix: e.target.value }))} />
              {form.prix && !isNaN(Number(form.prix)) && (
                <span style={{ fontSize: ".67rem", color: "var(--gray)", marginTop: 3 }}>
                  Commission Yorix (5%) : {Math.round(Number(form.prix) * 0.05).toLocaleString()} FCFA · Vous recevez : <strong style={{ color: "var(--green)" }}>{Math.round(Number(form.prix) * 0.95).toLocaleString()} FCFA</strong>
                </span>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Stock disponible</label>
              <input className="form-input" type="number" min="0" placeholder="Ex: 10" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} />
            </div>
            {!form.isPack ? (
              <div className="form-group full">
                <label className="form-label">Catégorie <span>*</span></label>
                <CategoryPicker
                  tree={categoryTree}
                  locale="fr"
                  loading={categoryLoading}
                  required
                  sellerMode
                  onRetry={onReloadCategories}
                  value={{ parentSlug: form.parentSlug, subSlug: form.subSlug, label: form.categorie }}
                  onChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      parentSlug: v.parentSlug,
                      subSlug: v.subSlug || "",
                      categorie: v.label,
                    }))
                  }
                />
              </div>
            ) : (
              <p className="cat-picker-seller-note" style={{ margin: 0 }}>
                Catégorie automatique : <strong>Packs &amp; ensembles</strong> (après validation admin).
              </p>
            )}
            <div className="form-group">
              <label className="form-label">Ville</label>
              <select className="form-select" value={form.ville} onChange={e => setForm(f => ({ ...f, ville: e.target.value }))}>
                <option value="">Choisir...</option>
                {VILLES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>

            <div className="form-group full">
              <label className="form-label">📸 Photos du produit (max 8, via Cloudinary)</label>
              <div
                className="img-upload-area"
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add("dragover"); }}
                onDragLeave={e => e.currentTarget.classList.remove("dragover")}
                onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove("dragover"); handleFiles(e.dataTransfer.files); }}
              >
                <div className="img-upload-icon">📸</div>
                <div className="img-upload-text">Cliquer pour choisir ou glisser-déposer</div>
                <div className="img-upload-hint">JPEG, PNG, WebP · Max 8 images · La 1ère sera la photo principale</div>
              </div>
              <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleFiles(e.target.files)} />

              {previews.length > 0 && (
                <div className="img-previews">
                  {previews.map((url, i) => (
                    <div key={i} className="img-preview-item">
                      <img
                        src={url}
                        alt={`preview ${i}`}
                        onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = "https://via.placeholder.com/70?text=📦"; }}
                      />
                      <button className="img-preview-del" onClick={() => removePreview(i)}>×</button>
                      {i === 0 && (
                        <span style={{ position: "absolute", bottom: 2, left: 2, background: "var(--green)", color: "#fff", fontSize: ".5rem", fontWeight: 700, padding: "1px 4px", borderRadius: 3 }}>
                          PRINCIPALE
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {saving && progress > 0 && (
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>

            <div className="form-group full">
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: ".82rem", fontWeight: 600, color: "var(--ink)" }}>
                <input type="checkbox" checked={form.escrow} onChange={e => setForm(f => ({ ...f, escrow: e.target.checked }))} />
                🔐 Activer la protection Escrow (recommandé)
              </label>
            </div>

            <div className="form-group full seller-pack-panel">
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: ".82rem", fontWeight: 700, color: "var(--ink)" }}>
                <input
                  type="checkbox"
                  checked={form.isPack}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setForm((f) => ({
                      ...f,
                      isPack: checked,
                      linkedProductIds: checked ? f.linkedProductIds : [],
                      parentSlug: checked ? "packs-ensemble" : "",
                      subSlug: "",
                      categorie: checked ? "Packs & ensembles" : "",
                    }));
                  }}
                />
                📦 Créer un pack (ensemble de produits — validation admin obligatoire)
              </label>
              {form.isPack && (
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
                  <textarea
                    className="form-textarea"
                    placeholder="Ex. Pack déjeuner : poisson braisé + riz + sauce…"
                    value={form.packDescription}
                    onChange={(e) => setForm((f) => ({ ...f, packDescription: e.target.value }))}
                  />
                  <p style={{ fontSize: ".72rem", color: "var(--gray)", margin: 0 }}>
                    Liez au moins 2 de vos produits déjà publiés (le pack sera invisible jusqu&apos;à validation).
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 180, overflowY: "auto" }}>
                    {mesProduits
                      .filter((p) => !p.is_pack && p.actif !== false)
                      .map((p) => {
                        const checked = form.linkedProductIds.includes(p.id);
                        return (
                          <label
                            key={p.id}
                            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: ".78rem", cursor: "pointer" }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setForm((f) => {
                                  const ids = f.linkedProductIds || [];
                                  const next = checked ? ids.filter((x) => x !== p.id) : [...ids, p.id];
                                  return { ...f, linkedProductIds: next.slice(0, 8) };
                                });
                              }}
                            />
                            {p.name_fr} — {Number(p.prix).toLocaleString()} F
                          </label>
                        );
                      })}
                    {mesProduits.filter((p) => !p.is_pack && p.actif !== false).length === 0 && (
                      <span style={{ fontSize: ".72rem", color: "var(--gray)" }}>
                        Publiez d&apos;abord au moins 2 produits simples pour les lier au pack.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button className="form-submit" onClick={saveNewProduct} disabled={saving}>
            {saving ? (
              <>
                <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Publication... ({progress}%)
              </>
            ) : (
              t("form.publish")
            )}
          </button>
        </div>
      )}

      {/* ════ COMMANDES ════ */}
      {dashTab === "commandes" && (
        <>
          <div className="dash-page-title">🛒 {t("orders.titleCount", { count: mesCommandes.length })}</div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { label: "⏳ En attente", filter: "pending",   color: "#d97706" },
              { label: "💳 Payées",     filter: "paid",      color: "#2563eb" },
              { label: "🚚 Expédiées",  filter: "shipped",   color: "#7c3aed" },
              { label: "✅ Livrées",    filter: "delivered", color: "#16a34a" },
            ].map(s => (
              <div key={s.label} style={{ background: s.color + "18", border: `1px solid ${s.color}33`, borderRadius: 8, padding: "6px 12px", fontSize: ".72rem", fontWeight: 700, color: s.color }}>
                {s.label} : {mesCommandes.filter(c => c.status === s.filter).length}
              </div>
            ))}
          </div>

          {mesCommandes.length === 0 ? (
            <div style={S.card}>
              <div className="empty-state"><div className="empty-icon">🛒</div><p>{t("orders.empty")}</p></div>
            </div>
          ) : (
            mesCommandes.map(c => (
              <div key={c.id} style={{ ...S.card, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".88rem", color: "var(--ink)" }}>{c.client_nom || "Client"}</div>
                    <div style={{ fontSize: ".7rem", color: "var(--gray)", marginTop: 2 }}>
                      📞 {c.telephone || "—"} · #{String(c.id).slice(-8)}
                    </div>
                  </div>
                  <span style={{ fontSize: ".68rem", padding: "3px 10px", borderRadius: 20, background: (STATUS_COLORS[c.status] || "#888") + "22", color: STATUS_COLORS[c.status] || "#888", fontWeight: 700 }}>
                    {statusLabel(c.status)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 12, fontSize: ".75rem", color: "var(--gray)", marginBottom: 10, flexWrap: "wrap" }}>
                  <span>💰 <strong style={{ color: "var(--green)" }}>{(c.montant_vendeur || 0).toLocaleString()} FCFA</strong> nets</span>
                  <span>📅 {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR") : "—"}</span>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {c.status === "pending" && (
                    <button style={S.btnBlue} onClick={() => setPendingConfirm({ id: c.id, field: "status", value: "paid", label: "Marquer cette commande comme payée ?" })}>
                      💳 Marquer payée
                    </button>
                  )}
                  {c.status === "paid" && (
                    <button style={S.btnGreen} onClick={() => setPendingConfirm({ id: c.id, field: "status", value: "shipped", label: "Marquer cette commande comme expédiée ?" })}>
                      🚚 Marquer expédiée
                    </button>
                  )}
                  {c.status === "shipped" && (
                    <button style={S.btnGreen} onClick={() => setPendingConfirm({ id: c.id, field: "status", value: "delivered", label: "Marquer cette commande comme livrée ?" })}>
                      ✅ Marquer livrée
                    </button>
                  )}
                  {c.telephone && (
                    <button
                      style={{ background: "#25D366", color: "#fff", border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".75rem" }}
                      onClick={() => window.open(`https://wa.me/${c.telephone.replace(/[^0-9]/g, "").replace(/^0/, "237")}?text=${encodeURIComponent(`Bonjour ${c.client_nom || ""}! Votre commande Yorix est en cours. 📦`)}`, "_blank")}
                    >
                      📱 WhatsApp
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ════ WALLET ════ */}
      {dashTab === "wallet" && (
        <>
          <div className="dash-page-title">💰 Mon portefeuille</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={{ padding: 20, background: "var(--green-pale)", border: "1px solid var(--green-light)", borderRadius: 12 }}>
              <div style={{ fontSize: ".72rem", color: "var(--gray)", fontWeight: 600, marginBottom: 6 }}>SOLDE DISPONIBLE</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "var(--green)" }}>
                {Number(wallet.solde).toLocaleString("fr-FR")} <span style={{ fontSize: ".8rem", fontWeight: 400, color: "var(--gray)" }}>FCFA</span>
              </div>
            </div>
            <div style={{ padding: 20, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12 }}>
              <div style={{ fontSize: ".72rem", color: "var(--gray)", fontWeight: 600, marginBottom: 6 }}>TOTAL GAGNÉ</div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: "1.8rem", fontWeight: 800, color: "#2563eb" }}>
                {Number(wallet.total_gagne).toLocaleString("fr-FR")} <span style={{ fontSize: ".8rem", fontWeight: 400, color: "var(--gray)" }}>FCFA</span>
              </div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.secTitle}>💸 Retrait</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <button style={{ ...S.btnGhost, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: "1.4rem" }}>📱</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".82rem" }}>MTN MoMo</span>
                <span style={{ fontSize: ".7rem", color: "var(--gray)" }}>676 935 195</span>
              </button>
              <button style={{ ...S.btnGhost, padding: 14, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: "1.4rem" }}>🔶</span>
                <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: ".82rem" }}>Orange Money</span>
                <span style={{ fontSize: ".7rem", color: "var(--gray)" }}>696 565 654</span>
              </button>
            </div>
            <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "10px 14px", fontSize: ".75rem", color: "var(--gray)" }}>
              ℹ️ Retrait minimum : 5 000 FCFA · Commission Yorix (5%) déduite automatiquement à la vente
            </div>
          </div>
        </>
      )}
    </>
  );
}
