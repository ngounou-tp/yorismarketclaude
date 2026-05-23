/**
 * Conversations peer-to-peer + recherche membres (RPC Supabase).
 */

/**
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} userId
 * @param {string} targetUserId
 * @param {string|null} [productId]
 */
export async function findOrCreateConversation(supabase, userId, targetUserId, productId = null) {
  if (!supabase?.from) throw new Error("Client Supabase indisponible");
  if (!userId || !targetUserId) throw new Error("Utilisateurs invalides");
  if (userId === targetUserId) throw new Error("Impossible de vous écrire à vous-même");

  const [u1, u2] = userId < targetUserId ? [userId, targetUserId] : [targetUserId, userId];

  let query = supabase.from("conversations").select("*").eq("user1_id", u1).eq("user2_id", u2);
  if (productId) query = query.eq("product_id", productId);
  else query = query.is("product_id", null);

  const { data: existing, error: findErr } = await query.maybeSingle();
  if (findErr) throw findErr;
  if (existing) return existing;

  const { data: created, error: createErr } = await supabase
    .from("conversations")
    .insert({ user1_id: u1, user2_id: u2, product_id: productId })
    .select()
    .single();

  if (createErr) {
    if (createErr.code === "23505") {
      const { data: retry } = await query.maybeSingle();
      if (retry) return retry;
    }
    throw createErr;
  }

  return created;
}

/**
 * Recherche par nom / début d'e-mail (min. 2 caractères).
 * @param {import("@supabase/supabase-js").SupabaseClient} supabase
 * @param {string} query
 * @param {number} [limit]
 */
export async function searchUsersForChat(supabase, query, limit = 8) {
  const q = String(query || "").trim();
  if (q.length < 2) return [];

  const { data, error } = await supabase.rpc("search_profiles_for_chat", {
    p_query: q,
    p_limit: limit,
  });

  if (error) throw error;
  return data || [];
}

/** Libellé rôle pour l'autocomplete */
export function chatRoleLabel(role) {
  const map = {
    seller: "Boutique",
    provider: "Prestataire",
    delivery: "Livreur",
    admin: "Admin",
    superadmin: "Admin",
    buyer: "Acheteur",
  };
  return map[String(role || "").toLowerCase()] || "Membre";
}
