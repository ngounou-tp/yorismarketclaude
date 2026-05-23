import 'product.dart';

class CartLine {
  CartLine({required this.product, this.quantity = 1});

  final Product product;
  int quantity;

  int get lineTotal => product.price * quantity;
}
