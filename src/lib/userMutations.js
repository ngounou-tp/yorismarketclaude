import { supabase } from "./supabase";
import { canWriteAdmin } from "./roles";

function normalizeError(error) {
  if (!error) return null;
  return error.message || String(error);
}

function assertAdminWrite(profile) {
  if (!canWriteAdmin(profile)) {
    return { ok: false, error: "Accès refusé — droits admin requis" };
  }
  return null;
}

/**
 * Change le rôle d'un utilisateur (profiles uniquement).
 */
export async function updateUserRole({ userId, newRole, actorProfile }) {
  const denied = assertAdminWrite(actorProfile);
  if (denied) return denied;

  const { data, error } = await supabase.rpc("fn_admin_update_user_role", {
    p_user_id: userId,
    p_new_role: newRole,
  });

  if (error) return { ok: false, error: normalizeError(error) };
  return { ok: true, role: data?.role || newRole };
}

/**
 * Suspendre un utilisateur (soft ban, réversible).
 */
export async function softBanUser({ userId, reason, actorProfile }) {
  const denied = assertAdminWrite(actorProfile);
  if (denied) return denied;

  const { data, error } = await supabase.rpc("fn_admin_soft_ban_user", {
    p_user_id: userId,
    p_reason: reason || null,
  });

  if (error) return { ok: false, error: normalizeError(error) };
  return { ok: true, mode: data?.mode || "soft_ban" };
}

/**
 * Réactiver un utilisateur suspendu.
 */
export async function reactivateUser({ userId, actorProfile }) {
  const denied = assertAdminWrite(actorProfile);
  if (denied) return denied;

  const { data, error } = await supabase.rpc("fn_admin_reactivate_user", {
    p_user_id: userId,
  });

  if (error) return { ok: false, error: normalizeError(error) };
  return { ok: true, mode: data?.mode || "reactivated" };
}

/**
 * Suppression définitive (anonymisation du profil).
 */
export async function hardDeleteUser({ userId, actorProfile }) {
  const denied = assertAdminWrite(actorProfile);
  if (denied) return denied;

  const { data, error } = await supabase.rpc("fn_admin_hard_delete_user", {
    p_user_id: userId,
  });

  if (error) return { ok: false, error: normalizeError(error) };
  return { ok: true, mode: data?.mode || "hard_delete" };
}

/**
 * Bascule actif / suspendu (soft ban ou réactivation).
 */
export async function toggleUserActive({ userId, currentlyActive, actorProfile }) {
  if (currentlyActive !== false) {
    return softBanUser({ userId, actorProfile });
  }
  return reactivateUser({ userId, actorProfile });
}

/**
 * Bascule vérification utilisateur (profiles).
 */
export async function toggleUserVerified({ userId, currentlyVerified, actorProfile }) {
  const denied = assertAdminWrite(actorProfile);
  if (denied) return denied;

  const { error } = await supabase
    .from("profiles")
    .update({ verifie: !currentlyVerified, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .is("deleted_at", null);

  if (error) return { ok: false, error: normalizeError(error) };
  return { ok: true, verifie: !currentlyVerified };
}

/** Profil actif et non supprimé */
export function isProfileAccessible(profile) {
  if (!profile) return false;
  if (profile.deleted_at) return false;
  if (profile.actif === false) return false;
  return true;
}
