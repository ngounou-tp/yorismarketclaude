import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/product.dart';

class ProductRepository {
  ProductRepository(this._client);

  final SupabaseClient _client;

  Future<List<Product>> fetchCatalog({int limit = 80}) async {
    final response = await _client
        .from('products')
        .select()
        .or('actif.eq.true,actif.is.null')
        .order('sponsorise', ascending: false)
        .order('created_at', ascending: false)
        .limit(limit);

    final rows = response as List<dynamic>;
    return rows
        .map((row) => Product.fromJson(Map<String, dynamic>.from(row as Map)))
        .where((p) => p.isVisibleOnMarketplace)
        .toList();
  }

  Future<List<Product>> fetchSellerProducts(String vendeurId, {int limit = 100}) async {
    final response = await _client
        .from('products')
        .select()
        .eq('vendeur_id', vendeurId)
        .order('created_at', ascending: false)
        .limit(limit);

    final rows = response as List<dynamic>;
    return rows
        .map((row) => Product.fromJson(Map<String, dynamic>.from(row as Map)))
        .toList();
  }

  Future<Product?> fetchById(String id) async {
    final response = await _client
        .from('products')
        .select()
        .eq('id', id)
        .maybeSingle();
    if (response == null) return null;
    final product = Product.fromJson(Map<String, dynamic>.from(response));
    if (!product.isVisibleOnMarketplace) return null;
    return product;
  }
}
