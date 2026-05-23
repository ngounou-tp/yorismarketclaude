import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/user_profile.dart';

class ProfileRepository {
  ProfileRepository(this._client);

  final SupabaseClient _client;

  Future<UserProfile?> fetchById(String id) async {
    final row = await _client.from('profiles').select().eq('id', id).maybeSingle();
    if (row == null) return null;
    return UserProfile.fromJson(Map<String, dynamic>.from(row));
  }

  Future<UserProfile?> fetchCurrent() async {
    final uid = _client.auth.currentUser?.id;
    if (uid == null) return null;
    return fetchById(uid);
  }
}
