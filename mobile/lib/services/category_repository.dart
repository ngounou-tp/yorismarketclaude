import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/category.dart';

class CategoryRepository {
  CategoryRepository(this._client);

  final SupabaseClient _client;

  Future<List<MarketplaceCategory>> fetchFeatured() async {
    try {
      final response = await _client
          .from('marketplace_categories')
          .select()
          .eq('active', true)
          .eq('category_type', 'product')
          .eq('is_featured_homepage', true)
          .order('sort_order', ascending: true)
          .limit(12);
      final rows = response as List<dynamic>;
      if (rows.isEmpty) return kDefaultCategories;
      return rows
          .map(
            (r) => MarketplaceCategory.fromJson(
              Map<String, dynamic>.from(r as Map),
            ),
          )
          .toList();
    } catch (_) {
      return kDefaultCategories;
    }
  }
}
