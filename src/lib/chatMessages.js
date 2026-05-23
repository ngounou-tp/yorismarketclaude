/**
 * Insertion message chat peer-to-peer (schéma Supabase : sender_id, content, …).
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {{
 *   conversationId: string,
 *   senderId: string,
 *   content?: string,
 *   imageUrl?: string|null,
 *   linkUrl?: string|null,
 * }} params
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

  const { data, error } = await supabase
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

  if (error) throw error;
  return data;
}

/** Retire chemins image/URL bruts du texte affiché dans une bulle. */
export function sanitizeChatDisplayText(text = "") {
  return String(text)
    .replace(/https?:\/\/[^\s]+/gi, " ")
    .replace(/\/image\/upload[^\s]*/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
