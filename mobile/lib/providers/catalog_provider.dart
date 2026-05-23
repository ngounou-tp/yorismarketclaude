import 'package:flutter/foundation.dart';

import '../models/category.dart';
import '../models/product.dart';
import '../services/category_repository.dart';
import '../services/product_repository.dart';

class CatalogProvider extends ChangeNotifier {
  CatalogProvider(this._products, this._categoryRepo);

  final ProductRepository _products;
  final CategoryRepository _categoryRepo;

  List<Product> _all = [];
  List<MarketplaceCategory> _categories = List.of(kDefaultCategories);
  bool _loading = true;
  String? _error;
  String _query = '';
  String? _categoryFilter;

  List<Product> get all => _all;
  List<MarketplaceCategory> get categories => _categories;
  bool get loading => _loading;
  String? get error => _error;
  String get query => _query;
  String? get categoryFilter => _categoryFilter;

  List<Product> get flashDeals =>
      _all.where((p) => p.promo || p.flash).take(12).toList();

  List<Product> get filtered {
    var list = _all;
    if (_categoryFilter != null && _categoryFilter!.isNotEmpty) {
      final cat = _categoryFilter!.toLowerCase();
      list = list.where((p) {
        final c = (p.category ?? '').toLowerCase();
        return c.contains(cat) || cat.contains(c);
      }).toList();
    }
    if (_query.trim().isNotEmpty) {
      final q = _query.trim().toLowerCase();
      list = list
          .where(
            (p) =>
                p.name.toLowerCase().contains(q) ||
                (p.description ?? '').toLowerCase().contains(q),
          )
          .toList();
    }
    return list;
  }

  Future<void> load() async {
    _loading = true;
    _error = null;
    notifyListeners();
    try {
      final productsFuture = _products.fetchCatalog(limit: 120);
      final categoriesFuture = _categoryRepo.fetchFeatured();
      _all = await productsFuture;
      final cats = await categoriesFuture;
      if (cats.isNotEmpty) _categories = cats;
      _error = null;
    } catch (e) {
      _error = 'Connexion impossible. Vérifiez votre réseau.';
      if (kDebugMode) _error = '$_error\n$e';
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void setQuery(String q) {
    _query = q;
    notifyListeners();
  }

  void setCategory(String? slugOrName) {
    _categoryFilter = slugOrName;
    notifyListeners();
  }

  void clearFilters() {
    _query = '';
    _categoryFilter = null;
    notifyListeners();
  }
}
