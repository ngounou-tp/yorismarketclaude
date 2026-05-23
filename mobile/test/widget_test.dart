import 'package:flutter_test/flutter_test.dart';

import 'package:yorix_mobile/models/product.dart';

void main() {
  test('Product.fromJson calcule le prix promo', () {
    final product = Product.fromJson({
      'id': 1,
      'name_fr': 'Téléphone',
      'prix': 100000,
      'promo': true,
      'promo_pct': 10,
      'stock': 3,
      'image': 'https://example.com/a.jpg',
    });

    expect(product.name, 'Téléphone');
    expect(product.price, 90000);
    expect(product.listPrice, 100000);
    expect(product.inStock, isTrue);
  });
}
