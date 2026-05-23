/**
 * Sécurité messagerie Yorix — filtrage envoi + masquage affichage PII.
 * Escrow : aucun contact personnel avant transaction sécurisée sur la plateforme.
 */

/** Message affiché quand un utilisateur tente de partager des coordonnées. */
export const CHAT_ESCROW_BLOCK_TITLE = "Échange sécurisé Yorix";

export const CHAT_ESCROW_GUIDANCE =
  "Restez dans la messagerie Yorix et payez sur la plateforme pour bénéficier de l'escrow (séquestre) : vos fonds sont protégés jusqu'à la livraison, les litiges sont pris en charge et vous évitez les arnaques.";

export const CHAT_ESCROW_HINT =
  "Le partage de numéro de téléphone, e-mail, adresse ou tout autre contact personnel est interdit avant une transaction sécurisée.";

const CONTACT_BLOCK_RULES = [
  {
    pattern: /(\+?237[\s.-]?[0-9]{8,9})/gi,
    raison: "Les numéros de téléphone ne peuvent pas être partagés ici.",
  },
  {
    pattern: /\b6[0-9]{2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}\b/g,
    raison: "Les numéros de téléphone ne peuvent pas être partagés ici.",
  },
  {
    pattern: /(\+?[0-9]{1,3}[\s.-]?[0-9]{9,12})/g,
    raison: "Les numéros de téléphone ne peuvent pas être partagés ici.",
  },
  {
    pattern: /(?:mon\s+)?(?:num[ée]ro|num|n°|tel|tél|telephone|téléphone|phone|gsm|mobile|whatsapp|whats\s*app)\s*[:\s]?\s*[+\d][\d\s.\-/]{6,}/gi,
    raison: "Les numéros de téléphone ne peuvent pas être partagés ici.",
  },
  {
    pattern: /(whatsapp|wa\.me|t\.me|telegram|signal|viber|snapchat|tiktok|messenger\.com)/gi,
    raison: "Les liens ou apps de contact externe sont interdits.",
  },
  {
    pattern: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    raison: "Les adresses e-mail ne peuvent pas être partagées ici.",
  },
  {
    pattern: /(?:mon\s+)?(?:mail|e-?mail|courriel|adresse\s+mail)\s*[:\s]/gi,
    raison: "Les adresses e-mail ne peuvent pas être partagées ici.",
  },
  {
    pattern: /(facebook\.com|instagram\.com|fb\.com|ig\.me|linkedin\.com\/in|twitter\.com|x\.com)/gi,
    raison: "Les profils ou réseaux sociaux personnels sont interdits.",
  },
  {
    pattern: /(?:appelle|appele|call|contacte|contacter|écris|ecris|write|msg|message)[\s-]?(?:moi|me|m'|nous|on)\s*(?:sur|on|via|par|at|@)?/gi,
    raison: "Les invitations à échanger en dehors de Yorix sont interdites.",
  },
  {
    pattern: /(?:viens|venez|rejoins|join)\s+(?:sur|on|chez)\s+(?:whatsapp|telegram|signal|insta|facebook|fb)/gi,
    raison: "Les invitations à échanger en dehors de Yorix sont interdites.",
  },
  {
    pattern: /(?:mon\s+)?(?:adresse|domicile|quartier|rue|avenue|boulevard|bp\s*\d+|bo[iî]te\s+postale)/gi,
    raison: "Les adresses personnelles ne peuvent pas être partagées ici.",
  },
  {
    pattern: /(?:mailto:|tel:|sms:)/gi,
    raison: "Les liens de contact direct sont interdits.",
  },
  {
    pattern: /(?:paye|payer|paiement|virement|om|orange\s*money|mtn\s*momo|momo)\s*(?:en\s+)?(?:direct|dehors|hors|cash|esp[eè]ces|main\s+[aà]\s+main)/gi,
    raison: "Les paiements hors plateforme sont interdits — utilisez l'escrow Yorix.",
  },
];

const PII_MASK_RULES = CONTACT_BLOCK_RULES.map((r) => r.pattern);

/**
 * @returns {{ bloque: boolean, raison?: string, guidance?: string, hint?: string, title?: string }}
 */
export function filtrerMsg(texte) {
  if (!texte || typeof texte !== "string") return { bloque: false };
  const t = texte.trim();
  if (!t) return { bloque: false };

  for (const rule of CONTACT_BLOCK_RULES) {
    rule.pattern.lastIndex = 0;
    if (rule.pattern.test(t)) {
      return {
        bloque: true,
        raison: rule.raison,
        title: CHAT_ESCROW_BLOCK_TITLE,
        guidance: CHAT_ESCROW_GUIDANCE,
        hint: CHAT_ESCROW_HINT,
      };
    }
  }
  return { bloque: false };
}

/** Texte complet pour bannière / toast blocage. */
export function formatChatBlockMessage(filtre) {
  if (!filtre?.bloque) return "";
  return [filtre.raison, filtre.guidance, filtre.hint].filter(Boolean).join(" ");
}

/**
 * Masque PII à l'affichage (utilisateurs non-admin).
 * @param {string} text
 * @param {{ reveal?: boolean }} opts
 */
export function maskPIIForDisplay(text, opts = {}) {
  if (!text || opts.reveal) return text || "";
  let out = String(text);
  for (const pattern of PII_MASK_RULES) {
    const re = new RegExp(pattern.source, pattern.flags);
    out = out.replace(re, "[coordonnée masquée]");
  }
  return out;
}

/** Libellé public sans email/téléphone brut */
export function publicDisplayName(profile, fallbackId = "") {
  if (!profile) {
    const short = fallbackId ? String(fallbackId).slice(0, 8) : "Membre";
    return `Membre Yorix · ${short}`;
  }
  const nom = (profile.nom || profile.display_name || "").trim();
  if (nom) return nom;
  return `Membre Yorix · ${String(profile.id || fallbackId).slice(0, 8)}`;
}

/** Fiche contact complète réservée admin */
export function adminContactLines(profile) {
  if (!profile) return [];
  const lines = [];
  if (profile.nom) lines.push({ k: "Nom", v: profile.nom });
  if (profile.email) lines.push({ k: "E-mail", v: profile.email });
  if (profile.telephone) lines.push({ k: "Téléphone", v: profile.telephone });
  if (profile.ville) lines.push({ k: "Ville", v: profile.ville });
  return lines;
}
