import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/cart_line.dart';

class OrderService {
  OrderService(this._client);

  final SupabaseClient _client;
  static const commissionRate = 0.05;

  Future<void> placeOrder({
    required CartLine line,
    required String clientName,
    required String phone,
    String? userId,
  }) async {
    final p = line.product;
    final amount = line.lineTotal;
    final commission = (amount * commissionRate).round();
    final vendorAmount = amount - commission;

    final payload = {
      'product_id': p.id,
      if (p.vendeurId != null) 'vendeur_id': p.vendeurId,
      'client_nom': clientName,
      'telephone': phone,
      if (userId != null) 'client_id': userId,
      'montant': amount,
      'commission': commission,
      'montant_vendeur': vendorAmount,
      'status': 'pending',
      'livraison_status': 'pending',
      'escrow_status': 'pending',
      'livreur_id': null,
    };

    final response = await _client.from('orders').insert(payload).select();
    if (response.isEmpty) {
      throw Exception('Commande non enregistrée');
    }
  }
}
