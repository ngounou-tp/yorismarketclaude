import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/user_profile.dart';

class CatalogMutationResult {
  const CatalogMutationResult({
    required this.ok,
    this.error,
    this.mode,
    this.hasOrders = false,
    this.data,
  });

  final bool ok;
  final String? error;
  final String? mode;
  final bool hasOrders;
  final Map<String, dynamic>? data;
}

/// Mutations produits — aligné sur src/lib/catalogMutations.js (web).
class CatalogMutations {
  CatalogMutations(this._client);

  final SupabaseClient _client;

  static const _sellerFields = {
    'name_fr',
    'name_en',
    'description_fr',
    'prix',
    'stock',
    'categorie',
    'category_id',
    'ville',
    'image',
    'image_urls',
    'escrow',
  };

  bool _isAdmin(UserProfile? profile) =>
      profile?.role == 'admin' || profile?.role == 'superadmin';

  Future<CatalogMutationResult> updateProduct({
    required String productId,
    required Map<String, dynamic> payload,
    String? userId,
    UserProfile? profile,
  }) async {
    final admin = _isAdmin(profile);
    final clean = Map<String, dynamic>.from(payload);
    clean['updated_at'] = DateTime.now().toUtc().toIso8601String();

    if (!admin) {
      if (userId == null) {
        return const CatalogMutationResult(ok: false, error: 'Non authentifié');
      }
      final filtered = <String, dynamic>{};
      for (final key in _sellerFields) {
        if (clean.containsKey(key)) filtered[key] = clean[key];
      }
      try {
        final row = await _client
            .from('products')
            .update(filtered)
            .eq('id', productId)
            .eq('vendeur_id', userId)
            .select()
            .maybeSingle();
        if (row == null) {
          return const CatalogMutationResult(
            ok: false,
            error: 'Produit introuvable ou accès refusé',
          );
        }
        return CatalogMutationResult(
          ok: true,
          data: Map<String, dynamic>.from(row),
        );
      } on PostgrestException catch (e) {
        return CatalogMutationResult(ok: false, error: e.message);
      }
    }

    try {
      final row = await _client
          .from('products')
          .update(clean)
          .eq('id', productId)
          .select()
          .maybeSingle();
      return CatalogMutationResult(
        ok: true,
        data: row != null ? Map<String, dynamic>.from(row) : null,
      );
    } on PostgrestException catch (e) {
      return CatalogMutationResult(ok: false, error: e.message);
    }
  }

  Future<CatalogMutationResult> toggleProductActive({
    required String productId,
    required bool currentActive,
    String? userId,
    UserProfile? profile,
  }) {
    return updateProduct(
      productId: productId,
      payload: {'actif': !currentActive},
      userId: userId,
      profile: profile,
    );
  }

  Future<CatalogMutationResult> deleteProduct({
    required String productId,
    String? userId,
    UserProfile? profile,
    bool hardDelete = false,
  }) async {
    if (userId == null && !_isAdmin(profile)) {
      return const CatalogMutationResult(ok: false, error: 'Non authentifié');
    }
    try {
      final data = await _client.rpc(
        'fn_delete_product',
        params: {
          'p_product_id': productId,
          'p_hard_delete': hardDelete && _isAdmin(profile),
        },
      );
      final map = data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};
      return CatalogMutationResult(
        ok: true,
        mode: map['mode']?.toString(),
        hasOrders: map['has_orders'] == true,
      );
    } on PostgrestException catch (e) {
      return CatalogMutationResult(ok: false, error: e.message);
    }
  }

  Future<bool> productHasOrders(String productId) async {
    try {
      final data = await _client.rpc(
        'fn_product_has_orders',
        params: {'p_product_id': productId},
      );
      return data == true;
    } catch (_) {
      return false;
    }
  }
}
