import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/config/env.dart';
import '../../core/theme/yorix_theme.dart';
import '../../core/widgets/yorix_network_image.dart';
import '../../models/product.dart';
import '../../providers/cart_provider.dart';
import '../../utils/format.dart';

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key, required this.product});

  final Product product;

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _qty = 1;
  int _imageIndex = 0;
  late final PageController _pageController;

  Product get p => widget.product;

  List<String> get _images {
    if (p.imageUrls.isNotEmpty) return p.imageUrls;
    if (p.imageUrl != null) return [p.imageUrl!];
    return [];
  }

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _addToCart() {
    context.read<CartProvider>().add(p, quantity: _qty);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$_qty × ${p.name} ajouté au panier'),
        action: SnackBarAction(
          label: 'Voir',
          onPressed: () => Navigator.of(context).popUntil((r) => r.isFirst),
        ),
      ),
    );
  }

  Future<void> _whatsapp() async {
    final text = Uri.encodeComponent(
      'Bonjour Yorix, je commande : ${p.name} (${formatFcfa(p.price)} × $_qty)',
    );
    final uri = Uri.parse('https://wa.me/${Env.whatsAppNumber}?text=$text');
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('WhatsApp indisponible')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final images = _images;

    return Scaffold(
      backgroundColor: YorixColors.surface,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 340,
            pinned: true,
            backgroundColor: YorixColors.card,
            foregroundColor: YorixColors.ink,
            flexibleSpace: FlexibleSpaceBar(
              background: images.isEmpty
                  ? const YorixNetworkImage()
                  : Stack(
                      fit: StackFit.expand,
                      children: [
                        PageView.builder(
                          controller: _pageController,
                          itemCount: images.length,
                          onPageChanged: (i) => setState(() => _imageIndex = i),
                          itemBuilder: (_, i) => YorixNetworkImage(url: images[i]),
                        ),
                        if (images.length > 1)
                          Positioned(
                            bottom: 12,
                            left: 0,
                            right: 0,
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: List.generate(
                                images.length,
                                (i) => Container(
                                  width: 8,
                                  height: 8,
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  decoration: BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: i == _imageIndex ? YorixColors.green : Colors.white54,
                                  ),
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
            ),
          ),
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: YorixColors.card,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              transform: Matrix4.translationValues(0, -20, 0),
              padding: const EdgeInsets.fromLTRB(20, 24, 20, 120),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (p.promo) _Tag('Promo', YorixColors.danger),
                      if (p.flash) _Tag('Flash', YorixColors.gold),
                      if (p.verified) _Tag('Vérifié', YorixColors.green),
                      if (p.sponsored) _Tag('Top vendeur', YorixColors.purple),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Text(
                    p.name,
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        formatFcfa(p.price),
                        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900, color: YorixColors.green),
                      ),
                      if (p.listPrice != null) ...[
                        const SizedBox(width: 10),
                        Text(
                          formatFcfa(p.listPrice!),
                          style: const TextStyle(
                            decoration: TextDecoration.lineThrough,
                            color: YorixColors.gray,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 16),
                  _InfoTile(
                    icon: Icons.inventory_2_outlined,
                    title: 'Disponibilité',
                    value: p.inStock ? '${p.stock} en stock' : 'Rupture de stock',
                  ),
                  if (p.city != null)
                    _InfoTile(icon: Icons.location_on_outlined, title: 'Ville', value: p.city!),
                  const SizedBox(height: 16),
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: YorixColors.greenPale,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Row(
                      children: [
                        Icon(Icons.shield_outlined, color: YorixColors.green),
                        SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Paiement protégé Escrow Yorix jusqu\'à réception.',
                            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: YorixColors.greenDark),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (p.description != null && p.description!.trim().isNotEmpty) ...[
                    const SizedBox(height: 20),
                    Text('Description', style: Theme.of(context).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    Text(p.description!, style: const TextStyle(height: 1.55, color: YorixColors.inkSoft)),
                  ],
                  const SizedBox(height: 24),
                  Text('Quantité', style: Theme.of(context).textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      _QtyBtn(icon: Icons.remove, onTap: _qty > 1 ? () => setState(() => _qty--) : null),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: Text('$_qty', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800)),
                      ),
                      _QtyBtn(icon: Icons.add, onTap: p.inStock && _qty < p.stock ? () => setState(() => _qty++) : null),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.fromLTRB(16, 12, 16, 12 + MediaQuery.paddingOf(context).bottom),
        decoration: BoxDecoration(
          color: YorixColors.card,
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 16, offset: const Offset(0, -4))],
        ),
        child: Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _whatsapp,
                icon: const Icon(Icons.chat),
                label: const Text('WhatsApp'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: YorixColors.green,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              flex: 2,
              child: FilledButton.icon(
                onPressed: p.inStock ? _addToCart : null,
                icon: const Icon(Icons.shopping_bag_outlined),
                label: Text(p.inStock ? 'Ajouter · ${formatFcfa(p.price * _qty)}' : 'Indisponible'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  const _Tag(this.label, this.color);
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(8)),
      child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12)),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.icon, required this.title, required this.value});
  final IconData icon;
  final String title;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: [
          Icon(icon, size: 20, color: YorixColors.gray),
          const SizedBox(width: 12),
          Text(title, style: const TextStyle(color: YorixColors.gray, fontSize: 13)),
          const Spacer(),
          Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}

class _QtyBtn extends StatelessWidget {
  const _QtyBtn({required this.icon, this.onTap});
  final IconData icon;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: YorixColors.surface,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: SizedBox(width: 44, height: 44, child: Icon(icon, color: onTap == null ? YorixColors.border : YorixColors.ink)),
      ),
    );
  }
}
