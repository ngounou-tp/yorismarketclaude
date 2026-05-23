import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import '../theme/yorix_theme.dart';

class YorixNetworkImage extends StatelessWidget {
  const YorixNetworkImage({
    super.key,
    this.url,
    this.fit = BoxFit.cover,
    this.borderRadius,
  });

  final String? url;
  final BoxFit fit;
  final BorderRadius? borderRadius;

  @override
  Widget build(BuildContext context) {
    final child = url == null
        ? const _Placeholder()
        : CachedNetworkImage(
            imageUrl: url!,
            fit: fit,
            placeholder: (_, __) => const _ShimmerBox(),
            errorWidget: (_, __, ___) => const _Placeholder(),
          );

    if (borderRadius != null) {
      return ClipRRect(borderRadius: borderRadius!, child: child);
    }
    return child;
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: YorixColors.greenPale,
      alignment: Alignment.center,
      child: const Text('📦', style: TextStyle(fontSize: 36)),
    );
  }
}

class _ShimmerBox extends StatelessWidget {
  const _ShimmerBox();

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: YorixColors.border,
      highlightColor: Colors.white,
      child: Container(color: YorixColors.border),
    );
  }
}
