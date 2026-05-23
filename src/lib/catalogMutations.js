import { supabase } from "./supabase";
import { canWriteAdmin, isAdminFull } from "./roles";

function normalizeError(error) {
  if (!error) return null;
  return error.message || String(error);
}

/**
 * @param {{ userId?: string, profile?: object|null }} actor
 */
export function buildProductActor(actor = {}) {
  const profile = actor.profile ?? null;
  const userId = actor.userId ?? null;
  return {
    userId,
    isAdmin: isAdminFull(profile),
    canWriteAdmin: canWriteAdmin(profile),
  };
}

const SELLER_EDITABLE_FIELDS = [
  "name_fr",
  "name_en",
  "description_fr",
  "prix",
  "stock",
  "categorie",
  "category_id",
  "ville",
  "image",
  "image_urls",
  "escrow",
];

/**
 * Met à jour un produit (vendeur = champs limités + vendeur_id ; admin = tous champs passés).
 */
export async function updateProduct({ productId, payload, actor }) {
  if (!productId) return { ok: false, error: "ID produit manquant" };

  const { userId, isAdmin } = buildProductActor(actor);
  const clean = { ...payload, updated_at: new Date().toISOString() };

  if (!isAdmin) {
    if (!userId) return { ok: false, error: "Non authentifié" };
    const filtered = {};
    for (const key of SELLER_EDITABLE_FIELDS) {
      if (clean[key] !== undefined) filtered[key] = clean[key];
    }
    const { data, error } = await supabase
      .from("products")
      .update(filtered)
      .eq("id", productId)
      .eq("vendeur_id", userId)
      .select()
      .maybeSingle();

    if (error) return { ok: false, error: normalizeError(error) };
    if (!data) return { ok: false, error: "Produit introuvable ou accès refusé" };
    return { ok: true, data };
  }

  const { data, error } = await supabase
    .from("products")
    .update(clean)
    .eq("id", productId)
    .select()
    .maybeSingle();

  if (error) return { ok: false, error: normalizeError(error) };
  return { ok: true, data };
}

/**
 * Active / désactive un produit.
 */
export async function toggleProductActive({ productId, currentActive, actor }) {
  return updateProduct({
    productId,
    payload: { actif: !currentActive },
    actor,
  });
}

/**
 * Supprime un produit via RPC (soft si commandes, hard sinon).
 * @param {{ hardDelete?: boolean }} opts — hardDelete réservé admin sans commandes
 */
export async function deleteProduct({ productId, actor, hardDelete = false }) {
  if (!productId) return { ok: false, error: "ID produit manquant" };

  const { isAdmin, userId } = buildProductActor(actor);
  if (!isAdmin && !userId) return { ok: false, error: "Non authentifié" };

  const { data, error } = await supabase.rpc("fn_delete_product", {
    p_product_id: productId,
    p_hard_delete: Boolean(hardDelete && isAdmin),
  });

  if (error) return { ok: false, error: normalizeError(error) };
  return { ok: true, mode: data?.mode || "unknown", hasOrders: data?.has_orders === true, data };
}

/**
 * Vérifie si un produit a des commandes (via RPC).
 */
export async function productHasOrders(productId) {
  const { data, error } = await supabase.rpc("fn_product_has_orders", {
    p_product_id: productId,
  });
  if (error) return { ok: false, error: normalizeError(error), hasOrders: false };
  return { ok: true, hasOrders: Boolean(data) };
}
