class MarketplaceCategory {
  MarketplaceCategory({
    required this.id,
    required this.slug,
    required this.name,
    this.icon = '🛍️',
    this.color = 0xFF1A6B3A,
  });

  factory MarketplaceCategory.fromJson(Map<String, dynamic> json) {
    return MarketplaceCategory(
      id: '${json['id']}',
      slug: '${json['slug'] ?? ''}',
      name: '${json['name_fr'] ?? json['name'] ?? 'Catégorie'}',
      icon: '${json['icon_emoji'] ?? json['icon'] ?? '🛍️'}',
      color: _parseColor(json['accent_color']),
    );
  }

  final String id;
  final String slug;
  final String name;
  final String icon;
  final int color;

  static int _parseColor(dynamic v) {
    if (v is int) return v;
    final s = '$v';
    if (s.startsWith('#') && s.length >= 7) {
      return int.parse(s.substring(1, 7), radix: 16) + 0xFF000000;
    }
    return 0xFF1A6B3A;
  }
}

final kDefaultCategories = [
  MarketplaceCategory(id: '1', slug: 'alimentation', name: 'Alimentation', icon: '🍎', color: 0xFF16A34A),
  MarketplaceCategory(id: '2', slug: 'mode', name: 'Mode', icon: '👗', color: 0xFF7C3AED),
  MarketplaceCategory(id: '3', slug: 'high-tech', name: 'High-Tech', icon: '📱', color: 0xFF0891B2),
  MarketplaceCategory(id: '4', slug: 'maison', name: 'Maison', icon: '🏠', color: 0xFFF59E0B),
  MarketplaceCategory(id: '5', slug: 'beaute', name: 'Beauté', icon: '💄', color: 0xFFEC4899),
  MarketplaceCategory(id: '6', slug: 'sport', name: 'Sport', icon: '⚽', color: 0xFF2563EB),
];
