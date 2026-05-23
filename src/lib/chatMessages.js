/**
 * Insertion message chat peer-to-peer (schéma Supabase : sender_id, content, …).
 * Fallback RPC si le trigger notifications bloque encore l'insert direct.
 */

/** @typedef {{ data: Record<string, unknown>, notificationOk: boolean|null, usedFallback: boolean }} ChatInsertResult */

const NOTIFICATION_ERROR_RE =
  /category|priority|expediteur_id|notifications|fn_notify_peer|fn_create_chat/i;

/**
 * @param {unknown} error
 */
export function isChatNotificationConfigError(error) {
  const msg = String(error?.message || error || "");
  return NOTIFICATION_ERROR_RE.test(msg);
}

/**
 * @param {unknown} error
 * @returns {{ kind: 'notification'|'auth'|'empty'|'network'|'unknown', userMessage: string }}
 */
export function classifyChatInsertError(error) {
  const msg = String(error?.message || error || "Erreur réseau");

  if (/non connecté|not authenticated|jwt/i.test(msg)) {
    return { kind: "auth", userMessage: "Connectez-vous pour envoyer un message." };
  }
  if (/vide|empty/i.test(msg)) {
    return { kind: "empty", userMessage: "Écrivez un message ou ajoutez une photo." };
  }
  if (/conversation|introuvable|accès refusé/i.test(msg)) {
    return { kind: "unknown", userMessage: "Conversation indisponible. Réessayez." };
  }
  if (isChatNotificationConfigError(msg)) {
    return {
      kind: "notification",
      userMessage:
        "Notification temporairement indisponible. Le message a peut-être été envoyé — vérifiez la conversation.",
    };
  }
  if (/fetch|network|timeout|failed/i.test(msg)) {
    return { kind: "network", userMessage: "Connexion instable. Réessayez dans un instant." };
  }
  return { kind: "unknown", userMessage: "Message non envoyé. Réessayez." };
}

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {{
 *   conversationId: string,
 *   senderId: string,
 *   content?: string,
 *   imageUrl?: string|null,
 *   linkUrl?: string|null,
 * }} params
 * @returns {Promise<ChatInsertResult>}
 */
export async function insertChatMessage(supabase, { conversationId, senderId, content, imageUrl, linkUrl }) {
  if (!supabase?.from) throw new Error("Client Supabase indisponible");
  if (!conversationId) throw new Error("Conversation introuvable");
  if (!senderId) throw new Error("Utilisateur non connecté");

  const trimmed = (content || "").trim();
  const hasImage = Boolean(imageUrl);
  const hasLink = Boolean(linkUrl);

  if (!trimmed && !hasImage && !hasLink) {
    throw new Error("Message vide");
  }

  const body = trimmed || (hasImage ? "📷 Photo" : hasLink ? "🔗 Lien" : "");

  const direct = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: body,
      image_url: imageUrl || null,
      link_url: linkUrl || null,
    })
    .select()
    .single();

  if (!direct.error) {
    return { data: direct.data, notificationOk: true, usedFallback: false };
  }

  const directMsg = direct.error.message || String(direct.error);
  console.warn("[chatMessages] insert direct failed:", directMsg);

  if (!isChatNotificationConfigError(direct.error)) {
    throw direct.error;
  }

  const { data: rpcData, error: rpcError } = await supabase.rpc("insert_chat_message_safe", {
    p_conversation_id: conversationId,
    p_content: body,
    p_image_url: imageUrl || null,
    p_link_url: linkUrl || null,
  });

  if (rpcError) {
    console.warn("[chatMessages] RPC insert_chat_message_safe failed:", rpcError.message);
    if (/could not find the function|PGRST202/i.test(rpcError.message || "")) {
      throw new Error(
        "Messagerie en maintenance — appliquez la migration SQL notifications_resilient_chat sur Supabase.",
      );
    }
    throw rpcError;
  }

  const message = rpcData?.message;
  if (!message?.id) {
    throw new Error("Réponse serveur invalide après envoi");
  }

  const notificationOk = rpcData?.notification_ok !== false;

  return {
    data: message,
    notificationOk,
    usedFallback: true,
  };
}

/** Retire chemins image/URL bruts du texte affiché dans une bulle. */
export function sanitizeChatDisplayText(text = "") {
  return String(text)
    .replace(/https?:\/\/[^\s]+/gi, " ")
    .replace(/\/image\/upload[^\s]*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
