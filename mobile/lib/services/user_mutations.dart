import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/user_profile.dart';

class UserMutationResult {
  const UserMutationResult({required this.ok, this.error, this.mode});

  final bool ok;
  final String? error;
  final String? mode;
}

bool isProfileAccessible(UserProfile? profile) {
  if (profile == null) return false;
  if (profile.deletedAt != null) return false;
  if (!profile.actif) return false;
  return true;
}

bool canWriteAdmin(UserProfile? profile) =>
    profile?.role == 'admin' || profile?.role == 'superadmin';

/// Mutations utilisateurs — profiles uniquement (aligné web).
class UserMutations {
  UserMutations(this._client);

  final SupabaseClient _client;

  UserMutationResult _denied() =>
      const UserMutationResult(ok: false, error: 'Accès admin requis');

  Future<UserMutationResult> updateUserRole({
    required String userId,
    required String newRole,
    required UserProfile? actorProfile,
  }) async {
    if (!canWriteAdmin(actorProfile)) return _denied();
    try {
      await _client.rpc('fn_admin_update_user_role', params: {
        'p_user_id': userId,
        'p_new_role': newRole,
      });
      return UserMutationResult(ok: true, mode: 'role_updated');
    } on PostgrestException catch (e) {
      return UserMutationResult(ok: false, error: e.message);
    }
  }

  Future<UserMutationResult> softBanUser({
    required String userId,
    required UserProfile? actorProfile,
    String? reason,
  }) async {
    if (!canWriteAdmin(actorProfile)) return _denied();
    try {
      await _client.rpc('fn_admin_soft_ban_user', params: {
        'p_user_id': userId,
        'p_reason': reason,
      });
      return const UserMutationResult(ok: true, mode: 'soft_ban');
    } on PostgrestException catch (e) {
      return UserMutationResult(ok: false, error: e.message);
    }
  }

  Future<UserMutationResult> reactivateUser({
    required String userId,
    required UserProfile? actorProfile,
  }) async {
    if (!canWriteAdmin(actorProfile)) return _denied();
    try {
      await _client.rpc('fn_admin_reactivate_user', params: {
        'p_user_id': userId,
      });
      return const UserMutationResult(ok: true, mode: 'reactivated');
    } on PostgrestException catch (e) {
      return UserMutationResult(ok: false, error: e.message);
    }
  }

  Future<UserMutationResult> hardDeleteUser({
    required String userId,
    required UserProfile? actorProfile,
  }) async {
    if (!canWriteAdmin(actorProfile)) return _denied();
    try {
      await _client.rpc('fn_admin_hard_delete_user', params: {
        'p_user_id': userId,
      });
      return const UserMutationResult(ok: true, mode: 'hard_delete');
    } on PostgrestException catch (e) {
      return UserMutationResult(ok: false, error: e.message);
    }
  }

  Future<UserMutationResult> toggleUserActive({
    required String userId,
    required bool currentlyActive,
    required UserProfile? actorProfile,
  }) {
    if (currentlyActive) {
      return softBanUser(userId: userId, actorProfile: actorProfile);
    }
    return reactivateUser(userId: userId, actorProfile: actorProfile);
  }

  Future<UserMutationResult> toggleUserVerified({
    required String userId,
    required bool currentlyVerified,
    required UserProfile? actorProfile,
  }) async {
    if (!canWriteAdmin(actorProfile)) return _denied();
    try {
      await _client
          .from('profiles')
          .update({
            'verifie': !currentlyVerified,
            'updated_at': DateTime.now().toUtc().toIso8601String(),
          })
          .eq('id', userId)
          .filter('deleted_at', 'is', null);
      return UserMutationResult(ok: true, mode: 'verified_toggled');
    } on PostgrestException catch (e) {
      return UserMutationResult(ok: false, error: e.message);
    }
  }
}
