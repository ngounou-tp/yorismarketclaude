class Product {
  Product({
    required this.id,
    required this.name,
    this.description,
    this.price = 0,
    this.listPrice,
    this.stock = 0,
    this.imageUrl,
    this.category,
    this.sponsored = false,
    this.verified = false,
    this.promo = false,
    this.flash = false,
    this.city,
    this.vendeurId,
    this.imageUrls = const [],
    this.actif = true,
    this.isArchived = false,
    this.hiddenFromMarketplace = false,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    final now = DateTime.now();
    final base = _num(json['prix'] ?? json['price']);
    final promoActive = _isPromoActive(json, now);
    final effective = promoActive ? _effectivePrice(json, now) : base.round();
    final list = promoActive && effective < base ? base.round() : null;

    return Product(
      id: '${json['id']}',
      name: '${json['name_fr'] ?? json['name'] ?? 'Produit'}',
      description: json['description_fr']?.toString() ??
          json['description']?.toString(),
      price: effective,
      listPrice: list,
      stock: _num(json['stock']).round(),
      imageUrl: _imageUrl(json),
      category: json['categorie']?.toString(),
      sponsored: json['sponsorise'] == true,
      verified: json['verifie'] == true || json['vendeur_verifie'] == true,
      promo: promoActive,
      flash: json['flash'] == true,
      city: json['ville']?.toString(),
      vendeurId: json['vendeur_id']?.toString(),
      imageUrls: _imageUrls(json),
      actif: json['actif'] != false,
      isArchived: json['is_archived'] == true,
      hiddenFromMarketplace: json['hidden_from_marketplace'] == true,
    );
  }

  final String id;
  final String name;
  final String? description;
  final int price;
  final int? listPrice;
  final int stock;
  final String? imageUrl;
  final String? category;
  final bool sponsored;
  final bool verified;
  final bool promo;
  final bool flash;
  final String? city;
  final String? vendeurId;
  final List<String> imageUrls;
  final bool actif;
  final bool isArchived;
  final bool hiddenFromMarketplace;

  bool get inStock => stock > 0;
  bool get lowStock => stock > 0 && stock <= 5;

  /// Aligné catalogue web — exclut soft-deleted / archivés.
  bool get isVisibleOnMarketplace =>
      actif && !isArchived && !hiddenFromMarketplace;

  static List<String> _imageUrls(Map<String, dynamic> json) {
    final out = <String>[];
    final direct = json['image']?.toString();
    if (direct != null && direct.startsWith('http')) out.add(direct);
    final urls = json['image_urls'];
    if (urls is List) {
      for (final u in urls) {
        final s = u?.toString();
        if (s != null && s.startsWith('http') && !out.contains(s)) out.add(s);
      }
    }
    return out;
  }

  static String? _imageUrl(Map<String, dynamic> json) {
    final urls = _imageUrls(json);
    return urls.isEmpty ? null : urls.first;
  }

  static double _num(dynamic v) {
    if (v == null) return 0;
    if (v is num) return v.toDouble();
    return double.tryParse('$v') ?? 0;
  }

  static bool _isPromoActive(Map<String, dynamic> p, DateTime now) {
    final pct = _num(p['promo_pct']);
    if (p['promo'] != true && pct <= 0) return false;
    final t = now.millisecondsSinceEpoch;
    final start = p['promo_starts_at'];
    if (start != null && '$start'.isNotEmpty) {
      final ms = DateTime.tryParse('$start')?.millisecondsSinceEpoch;
      if (ms != null && t < ms) return false;
    }
    final end = p['promo_ends_at'];
    if (end != null && '$end'.isNotEmpty) {
      final ms = DateTime.tryParse('$end')?.millisecondsSinceEpoch;
      if (ms != null && t > ms) return false;
    }
    return p['promo'] == true || pct > 0;
  }

  static int _effectivePrice(Map<String, dynamic> p, DateTime now) {
    final base = _num(p['prix'] ?? p['price']);
    if (!_isPromoActive(p, now)) return base.round();
    final pct = _num(p['promo_pct']).clamp(0, 100);
    if (pct <= 0) return base.round();
    return (base * (1 - pct / 100)).round();
  }
}
