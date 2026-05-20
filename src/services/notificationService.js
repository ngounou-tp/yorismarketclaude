/**
 * Moteur de notifications Yorix — couche unique côté SPA.
 *
 * - `publishInAppNotification` : insert temps réel (Supabase + Realtime).
 * - Web Push : `dispatch_notification` (trigger auto après insert).
 * - Email Resend : uniquement via webhook critique si catégorie éligible
 *   (messages, commandes, paiements, livraison, sécurité) + opt-in `email_critical`.
 *   Catalogue, nouveaux produits, stock, packs : in-app seulement.
 * - Ne jamais exposer `NOTIFY_DISPATCH_SECRET` dans le bundle client.
 */

import { defaultCategoryForType, defaultPriorityForType } from "../lib/notificationChannels.js";

/** @typedef {"in_app"|"push"|"email"|"whatsapp"} NotifyChannel */

export const NOTIFY_CHANNEL = /** @type {const} */ ({
  inApp: "in_app",
  push: "push",
  email: "email",
  whatsapp: "whatsapp",
});

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @param {object} p
 * @param {string} p.userId
 * @param {string} [p.type]
 * @param {string} [p.title]
 * @param {string} [p.titre]
 * @param {string} [p.message]
 * @param {string|null} [p.link]
 * @param {string} [p.priority]
 * @param {string} [p.category]
 * @param {Record<string, unknown>|null} [p.payload]
 * @param {Record<string, unknown>|null} [p.metadata]
 */
export async function publishInAppNotification(client, p) {
  const userId = p.userId;
  if (!userId) return { ok: false, error: "no userId" };

  const finalTitle = (p.titre || p.title || "Yorix").trim();
  const meta = p.metadata ?? p.payload ?? null;

  const row = {
    user_id: userId,
    type: p.type || "system",
    title: finalTitle,
    message: p.message ?? "",
    link: p.link ?? null,
    lu: false,
    priority: p.priority || defaultPriorityForType(p.type),
    category: p.category || defaultCategoryForType(p.type),
    payload: meta,
  };

  const { data, error } = await client.from("notifications").insert(row).select("id").maybeSingle();
  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data?.id };
}

/**
 * Point d’entrée métier (SPA) : pour l’instant seul le canal in-app est fiable sans backend dédié.
 *
 * @param {import("@supabase/supabase-js").SupabaseClient} client
 * @param {object} opts
 * @param {string} opts.userId
 * @param {string} [opts.type]
 * @param {NotifyChannel[]} [opts.channels]
 * @param {string} [opts.title]
 * @param {string} [opts.titre]
 * @param {string} [opts.message]
 * @param {string|null} [opts.link]
 * @param {string} [opts.priority]
 * @param {string} [opts.category]
 * @param {Record<string, unknown>|null} [opts.metadata]
 */
export async function sendNotification(client, opts) {
  const channels = opts.channels?.length ? opts.channels : [NOTIFY_CHANNEL.inApp];
  /** @type {Record<string, boolean>} */
  const report = { in_app: false, push: false, email: false, whatsapp: false };

  if (channels.includes(NOTIFY_CHANNEL.inApp)) {
    const r = await publishInAppNotification(client, {
      userId: opts.userId,
      type: opts.type,
      title: opts.title,
      titre: opts.titre,
      message: opts.message,
      link: opts.link,
      priority: opts.priority,
      category: opts.category,
      metadata: opts.metadata,
    });
    report.in_app = Boolean(r.ok);
  }

  if (channels.some((c) => c !== NOTIFY_CHANNEL.inApp)) {
    // push/email/whatsapp : réservés aux workflows serveur (queue, webhooks, autres Edge Functions)
    console.info(
      "[notificationService] canaux serveur demandés — brancher dispatch / send-email / WhatsApp Business côté Edge.",
      channels.filter((c) => c !== NOTIFY_CHANNEL.inApp),
    );
  }

  return report;
}
