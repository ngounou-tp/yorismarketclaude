import {
  supabase,
  COMMISSION_RATE,
  CLOUD_NAME,
  UPLOAD_PRESET,
  YORIX_WA_NUMBER,
  SUPABASE_ANON_KEY,
} from "../lib/supabase";
import { SUPABASE_PROJECT_URL } from "../lib/supabaseDefaults.js";
// ═══════════════════════════════════════════════════════════════
// 🚀 OPTIMISATION CLOUDINARY — Auto-compression + WebP + Lazy
// ═══════════════════════════════════════════════════════════════

/**
 * Optimise automatiquement une URL Cloudinary pour le Cameroun (3G/4G).
 * Ajoute : qualité auto, format auto (WebP/AVIF), largeur responsive, compression.
 *
 * Exemple :
 *   Input  : https://res.cloudinary.com/dulwb03nf/image/upload/v123/produit.jpg
 *   Output : https://res.cloudinary.com/dulwb03nf/image/upload/w_400,q_auto:low,f_auto,dpr_auto/v123/produit.jpg
 *
 * @param {string} url - URL Cloudinary originale
 * @param {object} options - { width, quality, format }
 * @returns {string} URL optimisée
 */
export function optimizeCloudinaryUrl(url, options = {}) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("cloudinary.com")) return url; // Pas Cloudinary, on touche pas

  const {
    width = 400,          // Largeur par défaut pour mobile
    quality = "auto:low", // Qualité adaptative (plus agressive pour Cameroun)
    format = "auto",      // WebP/AVIF automatique selon le navigateur
    dpr = "auto",         // Retina auto
  } = options;

  // Si déjà optimisée, on retourne tel quel
  if (url.includes("/w_") || url.includes("/q_")) return url;

  // Transformation Cloudinary
  const transforms = [
    `w_${width}`,
    `q_${quality}`,
    `f_${format}`,
    `dpr_${dpr}`,
    "c_limit", // Ne jamais agrandir, juste réduire
  ].join(",");

  // Insère les transformations après /upload/
  return url.replace(/\/upload\//, `/upload/${transforms}/`);
}

/**
 * Génère un srcset responsive pour images haute résolution
 * @param {string} url - URL Cloudinary originale
 * @returns {string} srcset pour <img>
 */
export function cloudinarySrcset(url) {
  if (!url || !url.includes("cloudinary.com")) return "";
  return [
    `${optimizeCloudinaryUrl(url, { width: 400 })} 400w`,
    `${optimizeCloudinaryUrl(url, { width: 800 })} 800w`,
    `${optimizeCloudinaryUrl(url, { width: 1200 })} 1200w`,
  ].join(", ");
}

/**
 * Placeholder blur très léger (5Ko max) pour lazy loading
 * @param {string} url - URL Cloudinary originale
 * @returns {string} URL d'un placeholder blurré minuscule
 */
export function cloudinaryPlaceholder(url) {
  if (!url || !url.includes("cloudinary.com")) return "";
  return optimizeCloudinaryUrl(url, { width: 20, quality: "auto:low" });
}
const getOptimizedImageUrl = (url, width = 400) => {
  if (!url || !url.includes('cloudinary.com')) return url
  // Si l'URL a déjà des transformations, on ne les duplique pas
  if (url.includes('f_auto')) return url
  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width},c_limit/`
  )
}

export async function uploadSingleImage(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res  = await fetch(`https://api.cloudinary.com/v1_1/dulwb03nf/image/upload`, { method:"POST", body:fd });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
}

export async function uploadMultipleImages(files) {
  const uploads = Array.from(files).map(f => uploadSingleImage(f));
  return Promise.all(uploads);
}

export function commanderWhatsApp(product, clientNom = "") {
  const msg = [
    `🛍️ *Bonjour Yorix !*`,
    ``,
    `Je souhaite commander ce produit :`,
    `📦 *${product.name_fr}*`,
    `💰 Prix : *${product.prix?.toLocaleString()} FCFA*`,
    `📍 Ville : ${product.ville || "Cameroun"}`,
    `🏪 Vendeur : ${product.vendeur_nom || ""}`,
    ``,
    clientNom ? `👤 Mon nom : ${clientNom}` : "",
    ``,
    `Merci de me confirmer la disponibilité ! ✅`,
  ].filter(Boolean).join("\n");

  window.open(`https://wa.me/${YORIX_WA_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank");
}

export async function creerCommandeSupabase({ product, clientNom, telephone, userId = null }) {
  const commission = product.prix * COMMISSION_RATE;
  const montantVendeur = product.prix - commission;

  const { data, error } = await supabase.from("orders").insert({
    product_id:       product.id,
    vendeur_id:       product.vendeur_id,
    client_nom:       clientNom,
    telephone:        telephone,
    client_id:        userId || null,
    montant:          product.prix,
    commission:       commission,
    montant_vendeur:  montantVendeur,
    status:           "pending",
    livraison_status: "pending",
    escrow_status:    "pending",
    livreur_id:       null,
  }).select().single();

  if (error) throw error;
  return data;
}

export async function getUserProfile(uid) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (error) { console.error("getUserProfile ERROR:", error); return null; }
  return data;
}

export { getUserRole, isAdminFull, isAdminViewer, canWriteAdmin, getProfileRole, ROLE_ADMIN_PARTNER, ADMIN_ROLE_LABELS } from "../lib/roles";

export { filtrerMsg, maskPIIForDisplay, CHAT_ESCROW_GUIDANCE, CHAT_ESCROW_HINT, CHAT_ESCROW_BLOCK_TITLE, formatChatBlockMessage } from "../lib/chatSecurity";
// ═══════════════════════════════════════════════════════════════
// ✅ EMAILS AUTOMATIQUES — Resend via Supabase Edge Function
// ═══════════════════════════════════════════════════════════════

/** URL complète de l’Edge Function, ou dérivée de VITE_SUPABASE_URL / défaut projet. */
export function resolveSendEmailFunctionUrl() {
  const explicit = import.meta.env.VITE_SEND_EMAIL_URL;
  if (explicit && String(explicit).trim()) {
    return String(explicit).trim().replace(/\/$/, "");
  }
  const base = String(import.meta.env.VITE_SUPABASE_URL || SUPABASE_PROJECT_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (!base) return "";
  return `${base}/functions/v1/send-email`;
}

const EMAIL_LOCAL_PART = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Envoie un email via l'Edge Function send-email (JWT utilisateur obligatoire).
 * @param {Object} opts - { to, subject, html, from } (from ignoré côté serveur — expéditeur RESEND_FROM)
 * @returns {Promise<{success: boolean, id?: string, error?: string}>}
 */
export async function sendEmail({ to, subject, html, from }) {
  const url = resolveSendEmailFunctionUrl();
  if (!url || !/^https:\/\//i.test(url)) {
    console.error("sendEmail: URL Edge invalide (VITE_SUPABASE_URL / VITE_SEND_EMAIL_URL)");
    return { success: false, error: "Configuration email manquante" };
  }
  if (!to || typeof to !== "string" || !EMAIL_LOCAL_PART.test(to.trim())) {
    return { success: false, error: "Destinataire invalide" };
  }
  if (!subject || typeof subject !== "string" || !html || typeof html !== "string") {
    return { success: false, error: "Sujet ou contenu manquant" };
  }

  const {
    data: { session },
    error: sessionErr,
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (sessionErr || !token) {
    console.warn("sendEmail: session requise", sessionErr?.message);
    return { success: false, error: "Authentification requise pour envoyer un e-mail." };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ to: to.trim(), subject, html, from }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("sendEmail error:", data);
      return { success: false, error: data.error || data.message || `HTTP ${res.status}` };
    }
    return { success: true, id: data.id };
  } catch (err) {
    console.error("sendEmail exception:", err);
    return { success: false, error: err.message };
  }
}

// ── Template de base réutilisable ──
function emailWrapper(title, bodyHtml) {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#f5f1e8;padding:0">
      <div style="background:linear-gradient(135deg,#1a6b3a,#0d4a25);padding:24px 32px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-.5px">Yo<span style="color:#fcd116">rix</span> CM</h1>
        <p style="color:rgba(255,255,255,.8);margin:4px 0 0;font-size:13px">Marketplace du Cameroun 🇨🇲</p>
      </div>
      <div style="background:#fff;padding:32px;border-left:1px solid #e2ddd6;border-right:1px solid #e2ddd6">
        <h2 style="color:#1a6b3a;margin:0 0 16px;font-size:20px">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="background:#0d1f14;padding:20px 32px;text-align:center;color:rgba(255,255,255,.6);font-size:12px">
        <p style="margin:0 0 8px"><strong style="color:#fff">Yorix CM</strong> — RC DOUALA/2026/B237</p>
        <p style="margin:0">📱 +237 696 56 56 54 · ✉️ support@yorix.cm · 🌐 <a href="https://www.yorix.cm" style="color:#4fd17d">yorix.cm</a></p>
        <p style="margin:12px 0 0;font-size:11px;opacity:.5">Vous recevez cet email car vous êtes utilisateur de Yorix CM.</p>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
// Templates d'emails spécifiques
// ═══════════════════════════════════════════════════════════════

/** Email de bienvenue à l'inscription */
export function emailBienvenue(nom, role = "client") {
  const roleLabels = {
    buyer:    "acheteur",
    seller:   "vendeur",
    delivery: "livreur",
    provider: "prestataire",
    client:   "client",
  };
  const label = roleLabels[role] || "client";
  return emailWrapper(
    `Bienvenue sur Yorix, ${nom} ! 🎉`,
    `
      <p style="font-size:15px;line-height:1.7;color:#0d1f14">Nous sommes ravis de vous compter parmi nos <strong>${label}s</strong> sur Yorix CM, la marketplace camerounaise #1.</p>
      <p style="font-size:15px;line-height:1.7;color:#0d1f14">Voici ce que vous pouvez faire dès maintenant :</p>
      <ul style="font-size:14px;line-height:1.9;color:#4a5048;padding-left:20px">
        <li>🛍️ Explorer des milliers de produits locaux et importés</li>
        <li>🚚 Commander avec livraison rapide à Yaoundé & Douala</li>
        <li>💳 Payer en toute sécurité via MTN MoMo ou Orange Money</li>
        <li>🔐 Bénéficier de la protection Escrow Yorix</li>
      </ul>
      <div style="text-align:center;margin:24px 0">
        <a href="https://www.yorix.cm" style="display:inline-block;background:#1a6b3a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">🚀 Explorer Yorix</a>
      </div>
      <p style="font-size:13px;color:#888;margin-top:24px">Des questions ? Répondez à cet email ou écrivez-nous sur WhatsApp au +237 696 56 56 54.</p>
    `
  );
}

/** Email de confirmation de commande au client */
export function emailCommandeClient(nom, commande) {
  const { numero, produits = [], total, livraison, adresse, moyenPaiement } = commande;
  const lignes = produits.map(p => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #e2ddd6">${p.name} <span style="color:#888">× ${p.qty}</span></td>
      <td style="padding:8px 0;border-bottom:1px solid #e2ddd6;text-align:right;font-weight:600">${(p.prix * p.qty).toLocaleString()} FCFA</td>
    </tr>
  `).join("");
  return emailWrapper(
    `Commande confirmée ✅`,
    `
      <p style="font-size:15px;line-height:1.7">Bonjour <strong>${nom}</strong>,</p>
      <p style="font-size:15px;line-height:1.7">Merci pour votre commande <strong>#${numero}</strong> ! Nous la préparons avec soin.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
        ${lignes}
        <tr><td style="padding:8px 0">Sous-total</td><td style="padding:8px 0;text-align:right">${(total - (livraison||0)).toLocaleString()} FCFA</td></tr>
        <tr><td style="padding:8px 0">🚚 Livraison</td><td style="padding:8px 0;text-align:right">${livraison ? livraison.toLocaleString() + " FCFA" : "Offerte"}</td></tr>
        <tr style="font-weight:800;color:#1a6b3a"><td style="padding:12px 0;border-top:2px solid #1a6b3a;font-size:16px">TOTAL</td><td style="padding:12px 0;border-top:2px solid #1a6b3a;text-align:right;font-size:16px">${total.toLocaleString()} FCFA</td></tr>
      </table>
      <div style="background:#f0faf4;border-left:4px solid #1a6b3a;padding:14px 18px;margin:16px 0;border-radius:4px">
        <p style="margin:0;font-size:13px;color:#0d1f14"><strong>💳 Paiement :</strong> ${moyenPaiement || "À confirmer"}</p>
        ${adresse ? `<p style="margin:6px 0 0;font-size:13px;color:#0d1f14"><strong>📍 Livraison :</strong> ${adresse}</p>` : ""}
      </div>
      <p style="font-size:13px;color:#1a6b3a;background:#f0faf4;padding:12px;border-radius:6px;margin:16px 0">🔐 Votre paiement est <strong>protégé par Escrow Yorix</strong> jusqu'à la réception du produit.</p>
      <p style="font-size:13px;color:#888;margin-top:24px">Questions ? WhatsApp : <a href="https://wa.me/237696565654" style="color:#1a6b3a">+237 696 56 56 54</a></p>
    `
  );
}

/** Email d'alerte nouvelle commande au vendeur */
export function emailNouvelleCommandeVendeur(vendeurNom, clientNom, produits, total) {
  const lignes = produits.map(p => `<li style="margin-bottom:4px">${p.name} × ${p.qty} — ${(p.prix*p.qty).toLocaleString()} FCFA</li>`).join("");
  return emailWrapper(
    `🛒 Nouvelle commande à préparer !`,
    `
      <p style="font-size:15px;line-height:1.7">Bonjour <strong>${vendeurNom}</strong>,</p>
      <p style="font-size:15px;line-height:1.7">Vous avez une nouvelle commande de <strong>${clientNom}</strong> !</p>
      <div style="background:#fff9e6;border-left:4px solid #fcd116;padding:14px 18px;margin:16px 0;border-radius:4px">
        <p style="margin:0 0 8px;font-size:13px;color:#0d1f14;font-weight:600">📦 Produits commandés :</p>
        <ul style="margin:0;padding-left:20px;color:#4a5048;font-size:13px">${lignes}</ul>
        <p style="margin:10px 0 0;font-size:14px;color:#1a6b3a;font-weight:700">💰 Montant total : ${total.toLocaleString()} FCFA</p>
      </div>
      <p style="font-size:14px;line-height:1.7">Merci de <strong>préparer la commande rapidement</strong> et de contacter le client pour la livraison.</p>
      <div style="text-align:center;margin:24px 0">
        <a href="https://www.yorix.cm" style="display:inline-block;background:#1a6b3a;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Voir la commande</a>
      </div>
    `
  );
}

/** Email de confirmation de livraison */
export function emailLivraisonConfirmee(nom, numero) {
  return emailWrapper(
    `Votre commande est livrée ! 📦✅`,
    `
      <p style="font-size:15px;line-height:1.7">Bonjour <strong>${nom}</strong>,</p>
      <p style="font-size:15px;line-height:1.7">Votre commande <strong>#${numero}</strong> vous a été livrée avec succès.</p>
      <p style="font-size:15px;line-height:1.7">Nous espérons que tout est parfait ! 🌟</p>
      <div style="background:#f0faf4;padding:16px;border-radius:8px;margin:20px 0;text-align:center">
        <p style="margin:0 0 10px;font-size:14px;color:#0d1f14">Un moment pour laisser votre avis ?</p>
        <a href="https://www.yorix.cm" style="display:inline-block;background:#1a6b3a;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px">⭐ Laisser un avis</a>
      </div>
      <p style="font-size:13px;color:#888;margin-top:20px">Un problème ? Contactez-nous immédiatement sur WhatsApp : <a href="https://wa.me/237696565654" style="color:#1a6b3a">+237 696 56 56 54</a></p>
    `
  );
}
// ═══════════════════════════════════════════════════════════════
// 🚚 CRÉATION AUTOMATIQUE DE LIVRAISON (Option A)
// ═══════════════════════════════════════════════════════════════

/**
 * Génère un code de suivi unique au format YX-XXXXX
 */
export const genererCodeSuivi = () => {
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  const timestamp = Date.now().toString(36).slice(-3).toUpperCase();
  return `YX-${random}${timestamp}`;
};

/**
 * Crée automatiquement une livraison dans la table `deliveries`
 * lorsqu'une commande est passée ou qu'un livreur est assigné.
 *
 * @param {Object} params
 * @param {string} params.orderId - ID de la commande
 * @param {string} params.clientNom - Nom du client
 * @param {string} params.clientTel - Téléphone du client
 * @param {string} params.adresseLivraison - Adresse de livraison
 * @param {string} params.adresseCollecte - Adresse de collecte (boutique)
 * @param {string} [params.livreurId] - ID du livreur (optionnel si pas encore assigné)
 * @param {string} [params.livreurNom] - Nom du livreur
 * @param {string} [params.livreurTel] - Téléphone livreur
 * @returns {Promise<{code: string, delivery: Object}>}
 */
export const creerLivraisonAutomatique = async ({
  supabase,
  orderId,
  clientNom = "",
  clientTel = "",
  adresseLivraison = "",
  adresseCollecte = "",
  livreurId = null,
  livreurNom = null,
  livreurTel = null,
  livreurVehicule = "Moto",
  distanceKm = 3.5,
  tempsEstimeMin = 25,
}) => {
  const code = genererCodeSuivi();

  const insertData = {
    code_suivi:         code,
    order_id:           orderId,
    client_nom:         clientNom,
    client_tel:         clientTel,
    adresse_livraison:  adresseLivraison,
    adresse_collecte:   adresseCollecte || "Boutique Yorix",
    statut:             "commande_recue",
    distance_km:        distanceKm,
    temps_estime_min:   tempsEstimeMin,
    commande_at:        new Date().toISOString(),
  };

  // Ajouter le livreur si déjà assigné
  if (livreurId) {
    insertData.livreur_id       = livreurId;
    insertData.livreur_nom      = livreurNom;
    insertData.livreur_tel      = livreurTel;
    insertData.livreur_vehicule = livreurVehicule;
  }

  const { data, error } = await supabase
    .from("deliveries")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error("creerLivraisonAutomatique error:", error);
    throw error;
  }

  return { code, delivery: data };
};

/**
 * Met à jour le statut d'une livraison avec le timestamp approprié.
 * Utilisé par le dashboard livreur.
 */
export const updateLivraisonStatut = async ({ supabase, deliveryId, newStatut }) => {
  const updates = { statut: newStatut };

  // Ajouter le timestamp correspondant à l'étape
  const now = new Date().toISOString();
  if (newStatut === "preparation") updates.preparation_at = now;
  if (newStatut === "collecte")    updates.collecte_at    = now;
  if (newStatut === "en_route")    updates.en_route_at    = now;
  if (newStatut === "livre")       updates.livre_at       = now;

  const { data, error } = await supabase
    .from("deliveries")
    .update(updates)
    .eq("id", deliveryId)
    .select()
    .single();

  if (error) {
    console.error("updateLivraisonStatut error:", error);
    throw error;
  }

  return data;
};
