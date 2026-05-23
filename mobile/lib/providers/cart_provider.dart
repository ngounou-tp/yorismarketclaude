import 'package:flutter/foundation.dart';

import '../models/cart_line.dart';
import '../models/product.dart';

class CartProvider extends ChangeNotifier {
  final List<CartLine> _lines = [];

  List<CartLine> get lines => List.unmodifiable(_lines);
  int get itemCount => _lines.fold(0, (s, l) => s + l.quantity);
  int get subtotal => _lines.fold(0, (s, l) => s + l.lineTotal);

  void add(Product product, {int quantity = 1}) {
    final idx = _lines.indexWhere((l) => l.product.id == product.id);
    if (idx >= 0) {
      _lines[idx].quantity += quantity;
    } else {
      _lines.add(CartLine(product: product, quantity: quantity));
    }
    notifyListeners();
  }

  void setQuantity(String productId, int qty) {
    final idx = _lines.indexWhere((l) => l.product.id == productId);
    if (idx < 0) return;
    if (qty <= 0) {
      _lines.removeAt(idx);
    } else {
      _lines[idx].quantity = qty;
    }
    notifyListeners();
  }

  void remove(String productId) {
    _lines.removeWhere((l) => l.product.id == productId);
    notifyListeners();
  }

  void clear() {
    _lines.clear();
    notifyListeners();
  }
}
