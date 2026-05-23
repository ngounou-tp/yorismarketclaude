import 'package:flutter/material.dart';

import '../../core/theme/yorix_theme.dart';

class ServicesHubScreen extends StatelessWidget {
  const ServicesHubScreen({super.key});

  @override
  Widget build(BuildContext context) {
    const services = [
      _HubItem('🛍️', 'Marketplace', 'Produits & checkout', YorixColors.green, true),
      _HubItem('🛠️', 'Prestataires', 'Services & freelances', YorixColors.gold, false),
      _HubItem('🚚', 'Livraison', 'Yorix Ride · suivi', YorixColors.cyan, false),
      _HubItem('💼', 'Business', 'B2B & partenaires', YorixColors.purple, false),
      _HubItem('🎓', 'Academy', 'Formation e-commerce', YorixColors.danger, false),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Écosystème Yorix')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Tout l\'univers Yorix, comme sur le web',
            style: TextStyle(color: YorixColors.gray, fontSize: 14),
          ),
          const SizedBox(height: 16),
          ...services.map(
            (s) => Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: YorixColors.card,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: YorixColors.border),
              ),
              child: Row(
                children: [
                  Text(s.emoji, style: const TextStyle(fontSize: 32)),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Text(s.title, style: const TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                            if (s.available) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: YorixColors.greenPale,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text('Actif', style: TextStyle(fontSize: 10, color: YorixColors.green, fontWeight: FontWeight.w700)),
                              ),
                            ],
                          ],
                        ),
                        Text(s.subtitle, style: const TextStyle(color: YorixColors.gray, fontSize: 13)),
                      ],
                    ),
                  ),
                  if (!s.available)
                    const Text('Bientôt', style: TextStyle(color: YorixColors.gray, fontSize: 12, fontWeight: FontWeight.w600)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _HubItem {
  const _HubItem(this.emoji, this.title, this.subtitle, this.color, this.available);
  final String emoji;
  final String title;
  final String subtitle;
  final Color color;
  final bool available;
}
