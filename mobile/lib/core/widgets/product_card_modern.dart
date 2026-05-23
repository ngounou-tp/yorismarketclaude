import 'package:flutter/material.dart';

import '../../models/product.dart';
import '../../utils/format.dart';
import '../theme/yorix_theme.dart';
import 'yorix_network_image.dart';

class ProductCardModern extends StatelessWidget {
  const ProductCardModern({
    super.key,
    required this.product,
    required this.onTap,
    this.compact = false,
  });

  final Product product;
  final VoidCallback onTap;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: YorixColors.card,
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: compact ? _buildCompact(context) : _buildGrid(context),
      ),
    );
  }

  Widget _buildGrid(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AspectRatio(
          aspectRatio: 1,
          child: Stack(
            fit: StackFit.expand,
            children: [
              YorixNetworkImage(url: product.imageUrl),
              if (product.promo || product.flash) _PromoRibbon(product: product),
              if (product.sponsored)
                Positioned(
                  top: 8,
                  right: 8,
                  child: _Chip(label: 'Top', color: YorixColors.gold),
                ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(10, 10, 10, 12),
          child: _Info(product: product),
        ),
      ],
    );
  }

  Widget _buildCompact(BuildContext context) {
    return SizedBox(
      width: 156,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AspectRatio(
            aspectRatio: 0.95,
            child: Stack(
              fit: StackFit.expand,
              children: [
                YorixNetworkImage(
                  url: product.imageUrl,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                ),
                if (product.promo) _PromoRibbon(product: product),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(10),
            child: _Info(product: product, dense: true),
          ),
        ],
      ),
    );
  }
}

class _Info extends StatelessWidget {
  const _Info({required this.product, this.dense = false});

  final Product product;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          product.name,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: dense ? 12 : 13,
            height: 1.25,
            color: YorixColors.ink,
          ),
        ),
        SizedBox(height: dense ? 4 : 6),
        Row(
          children: [
            Text(
              formatFcfa(product.price),
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: dense ? 13 : 14,
                color: YorixColors.green,
              ),
            ),
            if (product.listPrice != null) ...[
              const SizedBox(width: 4),
              Flexible(
                child: Text(
                  formatFcfa(product.listPrice!),
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    decoration: TextDecoration.lineThrough,
                    color: YorixColors.gray,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ],
        ),
        if (!dense) ...[
          const SizedBox(height: 4),
          Row(
            children: [
              Icon(
                product.inStock ? Icons.check_circle : Icons.cancel,
                size: 12,
                color: product.inStock ? YorixColors.green : YorixColors.danger,
              ),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  product.inStock
                      ? (product.lowStock ? 'Stock limité' : 'En stock')
                      : 'Rupture',
                  style: TextStyle(fontSize: 11, color: product.inStock ? YorixColors.gray : YorixColors.danger),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

class _PromoRibbon extends StatelessWidget {
  const _PromoRibbon({required this.product});

  final Product product;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: 8,
      left: 8,
      child: _Chip(
        label: product.flash ? '⚡ Flash' : '🔥 Promo',
        color: product.flash ? YorixColors.gold : YorixColors.danger,
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.label, required this.color});

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
        boxShadow: [
          BoxShadow(color: color.withValues(alpha: 0.35), blurRadius: 8, offset: const Offset(0, 2)),
        ],
      ),
      child: Text(
        label,
        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w800),
      ),
    );
  }
}
