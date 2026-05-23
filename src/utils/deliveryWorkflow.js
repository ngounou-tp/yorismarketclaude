// ═══════════════════════════════════════════════════════════════════════════
// 🚚 YORIX — DELIVERY WORKFLOW
// ═══════════════════════════════════════════════════════════════════════════
// Module central de la logique métier des livraisons Yorix.
// - Statuts officiels + libellés + couleurs
// - Notifications automatiques (WhatsApp + in-app)
// - Helpers actions admin / livreur / client
// - Audit trail (delivery_logs)
//
// ⚠️ Aucune dépendance UI : utilisable depuis n'importe quel composant.
// ═══════════════════════════════════════════════════════════════════════════

import { supabase, YORIX_WA_NUMBER } from "../lib/supabase";
import {
  absoluteSiteUrl,
  adminDeliveriesPath,
  deliveryTrackingPath,
  livreurDashboardPath,
} from "../lib/seoRoutes";
import { publishInAppNotification } from "../services/notificationService";

// ─── 1. CATALOGUE OFFICIEL DES STATUTS ──────────────────────────────────────
export const DELIVERY_STATUTS = {
  commande_recue:  { label: "En attente",            short: "En attente",     icon: "⏳", color: "#f59e0b", bg: "#fef3c7", order: 1 },
  livreur_assigne: { label: "Livreur assigné",       short: "Assignée",       icon: "🏍️", color: "#0ea5e9", bg: "#e0f2fe", order: 2 },
  accepte:         { label: "Acceptée par livreur",  short: "Acceptée",       icon: "✅", color: "#10b981", bg: "#d1fae5", order: 3 },
  refuse:          { label: "Refusée par livreur",   short: "Refusée",        icon: "❌", color: "#ef4444", bg: "#fee2e2", order: 0 },
  preparation:     { label: "Préparation",           short: "Préparation",    icon: "📦", color: "#3b82f6", bg: "#dbeafe", order: 4 },
  collecte:        { label: "Colis collecté",        short: "Collecté",       icon: "🏪", color: "#8b5cf6", bg: "#ede9fe", order: 5 },
  en_route:        { label: "En route",              short: "En route",       icon: "🏍️", color: "#10b981", bg: "#d1fae5", order: 6 },
  livre:           { label: "Livré",                 short: "Livré",          icon: "✅", color: "#22c55e", bg: "#dcfce7", order: 7 },
  annule:          { label: "Annulé",                short: "Annulé",         icon: "❌", color: "#ef4444", bg: "#fee2e2", order: -1 },
};

export const STATUT_KEYS_PUBLIC = [
  "commande_recue",
  "livreur_assigne",
  "accepte",
  "preparation",
  "collecte",
  "en_route",
  "livre",
];

export function getStatutConfig(statut) {
  return (
    DELIVERY_STATUTS[statut] ||
    { label: statut || "—", short: "—", icon: "•", color: "#64748b", bg: "#f1f5f9", order: 0 }
  );
}

// ─── 2. CODE DE SUIVI ───────────────────────────────────────────────────────
export const genererCodeSuivi = () => {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-3).toUpperCase();
  return `YX-${random}${timestamp}`;
};

// ─── 3. AUDIT LOG ───────────────────────────────────────────────────────────
async function logAction({ delivery, acteurId, acteurRole, action, ancienStatut, nouveauStatut, payload }) {
  try {
    await supabase.from("delivery_logs").insert({
      delivery_id:   delivery?.id || null,
      code_suivi:    delivery?.code_suivi || null,
      acteur_id:     acteurId || null,
      acteur_role:   acteurRole || "system",
      action,
      ancien_statut: ancienStatut || null,
      nouveau_statut: nouveauStatut || null,
      payload:       payload || null,
    });
  } catch (e) {
    console.warn("[deliveryWorkflow] log skipped:", e?.message);
  }
}

// ─── 4. NOTIFICATIONS IN-APP ────────────────────────────────────────────────
export async function pushNotification({ userId, type, title, message, link, payload }) {
  if (!userId) return { ok: false, reason: "no-user" };
  const r = await publishInAppNotification(supabase, {
    userId,
    type: type || "delivery",
    title: title || "Notification Yorix",
    message: message || "",
    link: link || null,
    priority: "important",
    category: "delivery",
    payload: payload || null,
  });
  if (!r.ok) {
    console.warn("[deliveryWorkflow] notification skipped:", r.error);
    return { ok: false, reason: r.error };
  }
  return { ok: true };
}

// ─── 5. WHATSAPP HELPERS ────────────────────────────────────────────────────
function cleanPhone(tel) {
  if (!tel) return "";
  const clean = String(tel).replace(/[^0-9]/g, "");
  if (!clean) return "";
  return clean.startsWith("237") ? clean : `237${clean.replace(/^0+/, "")}`;
}

export function buildWaUrl(tel, msg) {
  const phone = cleanPhone(tel);
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg || "")}`;
}

export function openWhatsApp(tel, msg) {
  const url = buildWaUrl(tel, msg);
  if (!url) return false;
  try {
    window.open(url, "_blank", "noopener,noreferrer");
    return true;
  } catch {
    return false;
  }
}

// ─── 6. TEMPLATES DE MESSAGES ───────────────────────────────────────────────
function fmtMontant(n) {
  if (n == null || isNaN(n)) return "À définir";
  return Number(n).toLocaleString("fr-FR") + " FCFA";
}

export function buildMsgLivreurAssignation(delivery) {
  const link = absoluteSiteUrl(livreurDashboardPath({ code: delivery.code_suivi }));
  return [
    "🚚 *NOUVELLE COURSE YORIX DISPONIBLE*",
    "",
    "📦 *Code mission :* " + (delivery.code_suivi || "—"),
    "",
    "👤 *CLIENT*",
    "Nom : " + (delivery.client_nom || "N/A"),
    "Téléphone : " + (delivery.client_tel || "N/A"),
    "",
    "📍 *TRAJET*",
    "🔴 Collecte : " + (delivery.adresse_collecte || "N/A"),
    "🟢 Livraison : " + (delivery.adresse_livraison || "N/A"),
    "Ville : " + (delivery.ville || "N/A"),
    "",
    "💰 Montant : " + fmtMontant(delivery.montant),
    delivery.commission_livreur
      ? "🎁 Votre gain : " + fmtMontant(delivery.commission_livreur)
      : "",
    "📏 Distance : ~" + (delivery.distance_km || 3.5) + " km",
    "⏱️ Temps estimé : ~" + (delivery.temps_estime_min || 25) + " min",
    delivery.instructions ? "" : "",
    delivery.instructions ? "📝 Instructions : " + delivery.instructions : "",
    "",
    "👉 Connectez-vous à votre dashboard Yorix pour ACCEPTER ou REFUSER cette livraison :",
    link,
    "",
    "Yorix CM 🇨🇲",
  ].filter(Boolean).join("\n");
}

export function buildMsgClientAcceptation(delivery) {
  const link = absoluteSiteUrl(deliveryTrackingPath(delivery.code_suivi));
  return [
    "✅ *VOTRE LIVRAISON YORIX EST PRISE EN CHARGE*",
    "",
    "📦 Code de suivi : *" + delivery.code_suivi + "*",
    "",
    "🏍️ *Votre livreur*",
    "Nom : " + (delivery.livreur_nom || "Livreur Yorix"),
    "Téléphone : " + (delivery.livreur_tel || "—"),
    "Véhicule : " + (delivery.livreur_vehicule || "Moto"),
    "",
    "⏱️ ETA estimée : ~" + (delivery.temps_estime_min || 25) + " min",
    "📏 Distance : ~" + (delivery.distance_km || 3.5) + " km",
    "",
    "📍 Suivez votre livreur en temps réel :",
    link,
    "",
    "Merci de votre confiance ! 💚",
    "Yorix CM 🇨🇲",
  ].join("\n");
}

export function buildMsgAdminRefus(delivery, livreurNom, motif) {
  return [
    "⚠️ *REFUS DE COURSE YORIX*",
    "",
    "📦 Code : " + delivery.code_suivi,
    "👤 Client : " + (delivery.client_nom || "—"),
    "📍 Trajet : " + (delivery.adresse_collecte || "?") + " → " + (delivery.adresse_livraison || "?"),
    "",
    "🏍️ Livreur refusant : " + (livreurNom || "Inconnu"),
    motif ? "📝 Motif : " + motif : "",
    "",
    "👉 La mission est de nouveau disponible. Réassignez-la rapidement.",
  ].filter(Boolean).join("\n");
}

export function buildMsgAdminAcceptation(delivery, livreurNom) {
  return [
    "✅ *MISSION ACCEPTÉE*",
    "",
    "📦 " + delivery.code_suivi,
    "🏍️ " + (livreurNom || "Livreur") + " a accepté la course.",
    "📍 " + (delivery.adresse_collecte || "?") + " → " + (delivery.adresse_livraison || "?"),
  ].join("\n");
}

export function buildMsgClientStatusChange(delivery, nouveauStatut) {
  const cfg = getStatutConfig(nouveauStatut);
  const link = absoluteSiteUrl(deliveryTrackingPath(delivery.code_suivi));
  return [
    `${cfg.icon} *Mise à jour de votre livraison Yorix*`,
    "",
    "📦 Code : " + delivery.code_suivi,
    "Statut : *" + cfg.label + "*",
    "",
    delivery.livreur_nom ? "🏍️ Livreur : " + delivery.livreur_nom : "",
    "",
    "📍 Suivi : " + link,
  ].filter(Boolean).join("\n");
}

// ─── 7. ACTIONS ADMIN ───────────────────────────────────────────────────────

/**
 * Admin : assigner un livreur enregistré (ou en saisie manuelle)
 * @param {object} params
 *   - delivery: row de la livraison
 *   - livreur: { id|uid, nom, telephone, vehicule? }
 *   - acteurId: id de l'admin qui assigne
 *   - openWhatsAppFallback: ouvre WhatsApp si possible (par défaut true)
 */
export async function adminAssignerLivreur({ delivery, livreur, acteurId, openWhatsAppFallback = true }) {
  if (!delivery?.id) throw new Error("Livraison invalide");
  if (!livreur?.nom)  throw new Error("Livreur invalide");

  const updates = {
    livreur_id:        livreur.id || livreur.uid || null,
    livreur_nom:       livreur.nom,
    livreur_tel:       livreur.telephone || livreur.tel || "",
    livreur_vehicule:  livreur.vehicule || livreur.livreur_vehicule || "Moto",
    statut:            "livreur_assigne",
    assigne_at:        new Date().toISOString(),
    refuse_at:         null,
    refus_motif:       null,
    accepte_at:        null,
    notif_livreur_sent: false,
  };

  const { data, error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", delivery.id)
    .select()
    .single();

  if (error) throw error;
  const newDelivery = data || { ...delivery, ...updates };

  // Notif in-app livreur (si compte connu)
  if (updates.livreur_id) {
    await pushNotification({
      userId:  updates.livreur_id,
      type:    "delivery_assigned",
      title:   "🚚 Nouvelle course Yorix",
      message: `Mission ${newDelivery.code_suivi} : ${newDelivery.adresse_collecte || ""} → ${newDelivery.adresse_livraison || ""}`,
      link:    livreurDashboardPath({ code: newDelivery.code_suivi }),
      payload: { delivery_id: newDelivery.id, code: newDelivery.code_suivi },
    });
  }

  // WhatsApp livreur
  let waOpened = false;
  if (openWhatsAppFallback && updates.livreur_tel) {
    waOpened = openWhatsApp(updates.livreur_tel, buildMsgLivreurAssignation(newDelivery));
  }

  // Marque la notif comme envoyée si WA ou in-app a réussi
  if (waOpened || updates.livreur_id) {
    await supabase
      .from("deliveries")
      .update({ notif_livreur_sent: true })
      .eq("id", newDelivery.id);
  }

  await logAction({
    delivery:      newDelivery,
    acteurId,
    acteurRole:    "admin",
    action:        delivery.livreur_id ? "reassigned" : "assigned",
    ancienStatut:  delivery.statut,
    nouveauStatut: "livreur_assigne",
    payload:       { livreur_id: updates.livreur_id, livreur_nom: updates.livreur_nom, wa: waOpened },
  });

  return { delivery: newDelivery, waOpened };
}

/**
 * Admin : édition complète d'une livraison
 */
export async function adminEditerLivraison({ delivery, patch, acteurId }) {
  if (!delivery?.id) throw new Error("Livraison invalide");
  const updates = { ...patch };

  // Si on change le statut, on synchronise les timestamps
  const now = new Date().toISOString();
  if (patch.statut && patch.statut !== delivery.statut) {
    if (patch.statut === "preparation" && !delivery.preparation_at) updates.preparation_at = now;
    if (patch.statut === "collecte"    && !delivery.collecte_at)    updates.collecte_at    = now;
    if (patch.statut === "en_route"    && !delivery.en_route_at)    updates.en_route_at    = now;
    if (patch.statut === "livre"       && !delivery.livre_at)       updates.livre_at       = now;
    if (patch.statut === "annule"      && !delivery.annule_at)      updates.annule_at      = now;
  }

  const { data, error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", delivery.id)
    .select()
    .single();
  if (error) throw error;

  await logAction({
    delivery:      data,
    acteurId,
    acteurRole:    "admin",
    action:        "edited",
    ancienStatut:  delivery.statut,
    nouveauStatut: data.statut,
    payload:       { patch },
  });

  return data;
}

/**
 * Admin : changer le statut + notifier client si pertinent
 */
export async function adminChangerStatut({ delivery, nouveauStatut, acteurId, notifyClient = true }) {
  const updated = await adminEditerLivraison({
    delivery,
    patch: { statut: nouveauStatut },
    acteurId,
  });

  if (notifyClient) {
    if (delivery.client_id) {
      await pushNotification({
        userId:  delivery.client_id,
        type:    "delivery_status",
        title:   `Livraison ${delivery.code_suivi} : ${getStatutConfig(nouveauStatut).label}`,
        message: `Votre livraison est maintenant : ${getStatutConfig(nouveauStatut).label}.`,
        link:    deliveryTrackingPath(delivery.code_suivi),
        payload: { delivery_id: delivery.id, statut: nouveauStatut },
      });
    }
  }

  return updated;
}

/**
 * Admin : annuler une livraison (et notifier client + livreur si présents)
 */
export async function adminAnnulerLivraison({ delivery, motif, acteurId }) {
  const updated = await adminEditerLivraison({
    delivery,
    patch: { statut: "annule", refus_motif: motif || null, annule_at: new Date().toISOString() },
    acteurId,
  });

  if (delivery.client_id) {
    await pushNotification({
      userId:  delivery.client_id,
      type:    "delivery_cancelled",
      title:   "❌ Livraison annulée",
      message: `Votre livraison ${delivery.code_suivi} a été annulée. ${motif ? "Motif : " + motif : ""}`,
      link:    deliveryTrackingPath(delivery.code_suivi),
      payload: { delivery_id: delivery.id, motif },
    });
  }

  return updated;
}

// ─── 8. ACTIONS LIVREUR ─────────────────────────────────────────────────────

/**
 * Livreur : accepter une mission (via RPC pour atomicité).
 * Fallback sur UPDATE direct si la RPC n'existe pas encore (migration non passée).
 */
export async function livreurAccepter({ delivery, user, userData }) {
  if (!delivery?.id) throw new Error("Mission invalide");
  if (!user?.id)     throw new Error("Authentification requise");

  let updated = null;

  // Tentative RPC
  const { data: rpcData, error: rpcError } = await supabase
    .rpc("accepter_livraison", { p_delivery_id: delivery.id });

  if (!rpcError && rpcData) {
    updated = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  } else {
    if (rpcError) console.warn("[livreurAccepter] RPC fallback:", rpcError.message);
    // Fallback : update direct (si RLS permet)
    const { data, error } = await supabase
      .from("deliveries")
      .update({
        statut:     "accepte",
        accepte_at: new Date().toISOString(),
      })
      .eq("id", delivery.id)
      .eq("livreur_id", user.id)
      .select()
      .single();
    if (error) throw error;
    updated = data;

    await logAction({
      delivery:      updated,
      acteurId:      user.id,
      acteurRole:    "delivery",
      action:        "accepted",
      ancienStatut:  delivery.statut,
      nouveauStatut: "accepte",
    });
  }

  // Notif client (in-app)
  if (updated?.client_id) {
    await pushNotification({
      userId:  updated.client_id,
      type:    "delivery_accepted",
      title:   "✅ Votre livraison a un livreur !",
      message: `${updated.livreur_nom || "Votre livreur"} a accepté votre livraison ${updated.code_suivi}.`,
      link:    deliveryTrackingPath(updated.code_suivi),
      payload: { delivery_id: updated.id },
    });
  }

  // WA client (ouvre côté livreur — gestionnaire de course voit ce qui se passe)
  // Ne pas spammer : on ouvre WhatsApp UNIQUEMENT si l'utilisateur le demande explicitement
  // depuis le bouton "Contacter client" dans le dashboard.

  return updated;
}

/**
 * Livreur : refuser une mission
 */
export async function livreurRefuser({ delivery, user, userData, motif }) {
  if (!delivery?.id) throw new Error("Mission invalide");
  if (!user?.id)     throw new Error("Authentification requise");

  let updated = null;

  const { data: rpcData, error: rpcError } = await supabase
    .rpc("refuser_livraison", { p_delivery_id: delivery.id, p_motif: motif || null });

  if (!rpcError && rpcData) {
    updated = Array.isArray(rpcData) ? rpcData[0] : rpcData;
  } else {
    if (rpcError) console.warn("[livreurRefuser] RPC fallback:", rpcError.message);
    const previousLivreurNom = delivery.livreur_nom;
    const previousHistory = Array.isArray(delivery.historique_refus) ? delivery.historique_refus : [];
    const newHistory = [
      ...previousHistory,
      {
        livreur_id:  user.id,
        livreur_nom: previousLivreurNom,
        motif:       motif || "",
        refuse_at:   new Date().toISOString(),
      },
    ];

    const { data, error } = await supabase
      .from("deliveries")
      .update({
        statut:           "commande_recue",
        livreur_id:       null,
        livreur_nom:      null,
        livreur_tel:      null,
        livreur_vehicule: null,
        assigne_at:       null,
        accepte_at:       null,
        refuse_at:        new Date().toISOString(),
        refus_motif:      motif || null,
        historique_refus: newHistory,
      })
      .eq("id", delivery.id)
      .eq("livreur_id", user.id)
      .select()
      .single();
    if (error) throw error;
    updated = data;

    await logAction({
      delivery:      updated,
      acteurId:      user.id,
      acteurRole:    "delivery",
      action:        "refused",
      ancienStatut:  delivery.statut,
      nouveauStatut: "commande_recue",
      payload:       { motif },
    });
  }

  // Pas de user_id admin direct : on émet une notif générique "system"
  // (à récupérer dans AdminDashboard via filtre type=delivery_refused)
  await pushNotification({
    userId:  null, // broadcast (admin la verra via realtime ou filtre custom)
    type:    "delivery_refused",
    title:   "⚠️ Mission refusée",
    message: `${userData?.nom || "Un livreur"} a refusé la mission ${delivery.code_suivi}. ${motif ? "Motif : " + motif : ""}`,
    link:    adminDeliveriesPath(),
    payload: { delivery_id: delivery.id, motif },
  });

  return updated;
}

/**
 * Livreur : faire évoluer son statut (collecte → en_route → livre)
 */
export async function livreurAvancerStatut({ delivery, user, nouveauStatut }) {
  if (!delivery?.id || !user?.id) throw new Error("Paramètres invalides");

  const allowed = ["preparation", "collecte", "en_route", "livre"];
  if (!allowed.includes(nouveauStatut)) throw new Error("Statut non autorisé pour le livreur : " + nouveauStatut);

  const updates = { statut: nouveauStatut };
  const now = new Date().toISOString();
  if (nouveauStatut === "preparation") updates.preparation_at = now;
  if (nouveauStatut === "collecte")    updates.collecte_at    = now;
  if (nouveauStatut === "en_route")    updates.en_route_at    = now;
  if (nouveauStatut === "livre")       updates.livre_at       = now;

  const { data, error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", delivery.id)
    .eq("livreur_id", user.id)
    .select()
    .single();
  if (error) throw error;

  // Notif client
  if (data?.client_id) {
    await pushNotification({
      userId:  data.client_id,
      type:    "delivery_status",
      title:   `${getStatutConfig(nouveauStatut).icon} Livraison ${data.code_suivi}`,
      message: getStatutConfig(nouveauStatut).label,
      link:    deliveryTrackingPath(data.code_suivi),
      payload: { delivery_id: data.id, statut: nouveauStatut },
    });
  }

  await logAction({
    delivery:      data,
    acteurId:      user.id,
    acteurRole:    "delivery",
    action:        "status_change",
    ancienStatut:  delivery.statut,
    nouveauStatut: nouveauStatut,
  });

  return data;
}

// ─── 9. CRÉATION D'UNE DEMANDE (par client) ─────────────────────────────────

export async function creerDemandeLivraison({
  clientId = null,
  clientNom = "",
  clientTel = "",
  adresseCollecte = "",
  adresseLivraison = "",
  ville = "",
  colisDescription = "",
  vehicule = "Moto",
  urgence = "normal",
  montant = 0,
  distanceKm = 3.5,
  tempsEstimeMin = 30,
  instructions = "",
  orderId = null,
}) {
  const code = genererCodeSuivi();
  const insertData = {
    code_suivi:         code,
    order_id:           orderId,
    client_id:          clientId,
    client_nom:         clientNom,
    client_tel:         clientTel,
    adresse_collecte:   adresseCollecte || "Boutique Yorix",
    adresse_livraison:  adresseLivraison,
    ville:              ville || null,
    colis_description:  colisDescription || null,
    livreur_vehicule:   vehicule,
    urgence:            urgence,
    montant:            Number(montant) || 0,
    distance_km:        distanceKm,
    temps_estime_min:   tempsEstimeMin,
    instructions:       instructions || null,
    statut:             "commande_recue",
    commande_at:        new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("deliveries")
    .insert(insertData)
    .select()
    .single();

  if (error) throw error;

  // Notif admin (broadcast)
  await pushNotification({
    userId:  null,
    type:    "delivery_request",
    title:   "🚚 Nouvelle demande de livraison",
    message: `${clientNom || "Client"} → ${adresseLivraison} (${code})`,
    link:    adminDeliveriesPath(),
    payload: { delivery_id: data.id, code },
  });

  await logAction({
    delivery:      data,
    acteurId:      clientId,
    acteurRole:    clientId ? "client" : "system",
    action:        "created",
    nouveauStatut: "commande_recue",
  });

  return { code, delivery: data };
}

// ─── 10. CALCUL DES STATS LIVREUR (fallback côté client si la vue n'existe pas) ─

export function computeLivreurStats(deliveries) {
  const list = Array.isArray(deliveries) ? deliveries : [];
  const livrees = list.filter(d => d.statut === "livre");
  const refusees = list.filter(d => d.statut === "refuse" || d.refus_motif);
  const enCours = list.filter(d => ["accepte", "preparation", "collecte", "en_route"].includes(d.statut));
  const disponibles = list.filter(d => d.statut === "livreur_assigne");

  const sumGains = arr =>
    arr.reduce((s, d) => s + Number(d.commission_livreur || 0), 0);

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startWeek  = new Date(now.getTime() - 7 * 86400000);
  const startDay   = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const livresInRange = (since) =>
    livrees.filter(d => d.livre_at && new Date(d.livre_at) >= since);

  const decided = list.filter(d =>
    ["accepte", "refuse", "preparation", "collecte", "en_route", "livre"].includes(d.statut) || d.refus_motif
  );
  const accepted = list.filter(d =>
    ["accepte", "preparation", "collecte", "en_route", "livre"].includes(d.statut) && !d.refus_motif
  );
  const tauxAcceptation =
    decided.length === 0
      ? 0
      : Math.round((accepted.length / decided.length) * 1000) / 10;

  return {
    total_missions:    list.length,
    missions_livrees:  livrees.length,
    missions_refusees: refusees.length,
    missions_en_cours: enCours.length,
    missions_dispos:   disponibles.length,
    gains_total:       sumGains(livrees),
    gains_mois:        sumGains(livresInRange(startMonth)),
    gains_semaine:     sumGains(livresInRange(startWeek)),
    gains_jour:        sumGains(livresInRange(startDay)),
    taux_acceptation:  tauxAcceptation,
    derniere_livraison: livrees[0]?.livre_at || null,
  };
}

// ─── 11. UTIL : COMMISSION SUGGÉRÉE ─────────────────────────────────────────
/**
 * Calcule une commission livreur suggérée selon le montant et la distance.
 * - Base 500 F + 100 F/km (plafond 50% du montant)
 */
export function suggererCommissionLivreur({ montant = 0, distanceKm = 3 }) {
  const base = 500 + 100 * (Number(distanceKm) || 3);
  const cap  = Math.max(500, Math.round((Number(montant) || 0) * 0.5));
  return Math.max(500, Math.min(Math.round(base), cap || base));
}
