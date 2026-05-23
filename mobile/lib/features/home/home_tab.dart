import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';

import '../../core/theme/yorix_theme.dart';
import '../../core/widgets/product_card_modern.dart';
import '../../core/widgets/section_header.dart';
import '../../models/category.dart';
import '../../models/product.dart';
import '../../providers/catalog_provider.dart';
import '../search/search_screen.dart';

class HomeTab extends StatelessWidget {
  const HomeTab({
    super.key,
    required this.onProductTap,
    required this.onExplore,
  });

  final void Function(Product) onProductTap;
  final VoidCallback onExplore;

  @override
  Widget build(BuildContext context) {
    final catalog = context.watch<CatalogProvider>();

    return RefreshIndicator(
      color: YorixColors.green,
      onRefresh: catalog.load,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(child: _HomeHeader(onSearch: () => _openSearch(context))),
          SliverToBoxAdapter(child: _PromoBanner()),
          SliverToBoxAdapter(child: _TrustRow()),
          if (catalog.loading && catalog.all.isEmpty)
            const SliverToBoxAdapter(child: _HomeShimmer())
          else if (catalog.error != null && catalog.all.isEmpty)
            SliverFillRemaining(child: _ErrorState(message: catalog.error!, onRetry: catalog.load))
          else ...[
            SliverToBoxAdapter(
              child: _CategoryStrip(
                categories: catalog.categories,
                onSelect: (c) {
                  catalog.setCategory(c.name);
                  onExplore();
                },
              ),
            ),
            if (catalog.flashDeals.isNotEmpty) ...[
              const SliverToBoxAdapter(
                child: SectionHeader(title: 'Offres flash', subtitle: 'Promos limitées'),
              ),
              SliverToBoxAdapter(
                child: SizedBox(
                  height: 248,
                  child: ListView.separated(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    scrollDirection: Axis.horizontal,
                    itemCount: catalog.flashDeals.length,
                    separatorBuilder: (_, __) => const SizedBox(width: 12),
                    itemBuilder: (context, i) => ProductCardModern(
                      product: catalog.flashDeals[i],
                      compact: true,
                      onTap: () => onProductTap(catalog.flashDeals[i]),
                    ),
                  ),
                ),
              ),
            ],
            SliverToBoxAdapter(
              child: SectionHeader(
                title: 'Tendances',
                subtitle: '${catalog.filtered.length} produits',
                actionLabel: 'Tout voir',
                onAction: onExplore,
              ),
            ),
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 100),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.58,
                ),
                delegate: SliverChildBuilderDelegate(
                  (context, index) {
                    final list = catalog.filtered.take(20).toList();
                    if (index >= list.length) return null;
                    return ProductCardModern(
                      product: list[index],
                      onTap: () => onProductTap(list[index]),
                    );
                  },
                  childCount: catalog.filtered.length.clamp(0, 20),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _openSearch(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => const SearchScreen()),
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.onSearch});

  final VoidCallback onSearch;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(colors: [YorixColors.green, YorixColors.greenDark]),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: const Text('Y', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 22)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Bonjour 👋', style: TextStyle(color: YorixColors.gray, fontSize: 13)),
                      Text(
                        'Yorix Market',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800),
                      ),
                    ],
                  ),
                ),
                IconButton.filledTonal(
                  onPressed: () {},
                  icon: const Icon(Icons.notifications_outlined, size: 22),
                  style: IconButton.styleFrom(backgroundColor: YorixColors.card),
                ),
              ],
            ),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: onSearch,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: YorixColors.card,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: YorixColors.border),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 12, offset: const Offset(0, 4)),
                  ],
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search, color: YorixColors.gray),
                    SizedBox(width: 12),
                    Expanded(child: Text('Rechercher produits, marques…', style: TextStyle(color: YorixColors.gray))),
                    Icon(Icons.tune, color: YorixColors.green, size: 20),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PromoBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF0D4A25), Color(0xFF1A6B3A), Color(0xFF2D8F52)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(color: YorixColors.green.withValues(alpha: 0.35), blurRadius: 20, offset: const Offset(0, 8)),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text('ESCROW YORIX', style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800)),
                ),
                const SizedBox(height: 10),
                const Text(
                  'Achetez en confiance',
                  style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800, height: 1.2),
                ),
                const SizedBox(height: 6),
                Text(
                  'Paiement sécurisé · MoMo · livraison suivie',
                  style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 12),
                ),
              ],
            ),
          ),
          const Text('🛡️', style: TextStyle(fontSize: 48)),
        ],
      ),
    );
  }
}

class _TrustRow extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    const items = [
      ('📱', 'MoMo ready'),
      ('🚚', 'Livraison'),
      ('✅', 'Vendeurs vérifiés'),
      ('💬', 'Support WA'),
    ];
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 4),
      child: Row(
        children: items
            .map(
              (e) => Expanded(
                child: Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 6),
                  decoration: BoxDecoration(
                    color: YorixColors.card,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: YorixColors.border),
                  ),
                  child: Column(
                    children: [
                      Text(e.$1, style: const TextStyle(fontSize: 18)),
                      const SizedBox(height: 4),
                      Text(e.$2, textAlign: TextAlign.center, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w600, color: YorixColors.inkSoft)),
                    ],
                  ),
                ),
              ),
            )
            .toList(),
      ),
    );
  }
}

class _CategoryStrip extends StatelessWidget {
  const _CategoryStrip({required this.categories, required this.onSelect});

  final List<MarketplaceCategory> categories;
  final void Function(MarketplaceCategory) onSelect;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SectionHeader(title: 'Catégories', subtitle: 'Explorer le catalogue'),
        SizedBox(
          height: 96,
          child: ListView.separated(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (context, i) {
              final c = categories[i];
              return GestureDetector(
                onTap: () => onSelect(c),
                child: Container(
                  width: 76,
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Color(c.color).withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Color(c.color).withValues(alpha: 0.25)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(c.icon, style: const TextStyle(fontSize: 26)),
                      const SizedBox(height: 6),
                      Text(
                        c.name,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(c.color)),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _HomeShimmer extends StatelessWidget {
  const _HomeShimmer();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Shimmer.fromColors(
        baseColor: YorixColors.border,
        highlightColor: Colors.white,
        child: Column(
          children: List.generate(
            3,
            (_) => Container(
              height: 120,
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(color: YorixColors.border, borderRadius: BorderRadius.circular(16)),
            ),
          ),
        ),
      ),
    );
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_off, size: 56, color: YorixColors.gray),
            const SizedBox(height: 16),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 20),
            FilledButton(onPressed: onRetry, child: const Text('Réessayer')),
          ],
        ),
      ),
    );
  }
}
