import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/theme/yorix_theme.dart';
import '../../models/product.dart';
import '../../models/user_profile.dart';
import '../../providers/catalog_provider.dart';
import '../../services/catalog_mutations.dart';
import '../../services/product_repository.dart';
import '../../services/profile_repository.dart';
import '../../utils/format.dart';

/// Gestion produits vendeur — mutations Supabase (aligné web).
class SellerProductsScreen extends StatefulWidget {
  const SellerProductsScreen({super.key});

  @override
  State<SellerProductsScreen> createState() => _SellerProductsScreenState();
}

class _SellerProductsScreenState extends State<SellerProductsScreen> {
  final _repo = ProductRepository(Supabase.instance.client);
  final _mutations = CatalogMutations(Supabase.instance.client);
  final _profiles = ProfileRepository(Supabase.instance.client);

  UserProfile? _profile;
  List<Product> _items = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final profile = await _profiles.fetchCurrent();
      final uid = Supabase.instance.client.auth.currentUser?.id;
      if (profile == null || uid == null) {
        setState(() => _error = 'Connectez-vous en tant que vendeur.');
        return;
      }
      _profile = profile;
      _items = await _repo.fetchSellerProducts(uid);
    } catch (e) {
      _error = '$e';
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleActive(Product p) async {
    final uid = Supabase.instance.client.auth.currentUser?.id;
    final res = await _mutations.toggleProductActive(
      productId: p.id,
      currentActive: p.actif,
      userId: uid,
      profile: _profile,
    );
    if (!mounted) return;
    if (!res.ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.error ?? 'Erreur')),
      );
      return;
    }
    await _load();
    if (mounted) context.read<CatalogProvider>().load();
  }

  Future<void> _deleteProduct(Product p) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Supprimer ce produit ?'),
        content: Text(
          '« ${p.name} » sera archivé s\'il a des commandes, sinon supprimé définitivement.',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Confirmer')),
        ],
      ),
    );
    if (confirm != true) return;

    final uid = Supabase.instance.client.auth.currentUser?.id;
    final res = await _mutations.deleteProduct(
      productId: p.id,
      userId: uid,
      profile: _profile,
    );
    if (!mounted) return;
    if (!res.ok) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(res.error ?? 'Erreur suppression')),
      );
      return;
    }
    final msg = res.mode == 'soft'
        ? (res.hasOrders ? 'Produit archivé (commandes existantes)' : 'Produit désactivé')
        : 'Produit supprimé';
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
    await _load();
    if (mounted) context.read<CatalogProvider>().load();
  }

  Future<void> _editPriceStock(Product p) async {
    final priceCtrl = TextEditingController(text: '${p.price}');
    final stockCtrl = TextEditingController(text: '${p.stock}');
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Modifier — ${p.name}'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: priceCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Prix (FCFA)'),
            ),
            TextField(
              controller: stockCtrl,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Stock'),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Annuler')),
          FilledButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Enregistrer')),
        ],
      ),
    );
    if (ok != true) return;

    final uid = Supabase.instance.client.auth.currentUser?.id;
    final res = await _mutations.updateProduct(
      productId: p.id,
      payload: {
        'prix': int.tryParse(priceCtrl.text.trim()) ?? p.price,
        'stock': int.tryParse(stockCtrl.text.trim()) ?? p.stock,
      },
      userId: uid,
      profile: _profile,
    );
    priceCtrl.dispose();
    stockCtrl.dispose();
    if (!mounted) return;
    if (!res.ok) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(res.error ?? 'Erreur')));
      return;
    }
    await _load();
    if (mounted) context.read<CatalogProvider>().load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Mes produits')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, textAlign: TextAlign.center))
              : _items.isEmpty
                  ? const Center(child: Text('Aucun produit. Ajoutez-en depuis yorix.cm/dashboard'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: _items.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (context, i) {
                          final p = _items[i];
                          return Card(
                            child: ListTile(
                              title: Text(p.name, maxLines: 2, overflow: TextOverflow.ellipsis),
                              subtitle: Text(
                                '${formatFcfa(p.price)} · Stock ${p.stock}'
                                '${p.isArchived ? ' · Archivé' : ''}'
                                '${!p.actif ? ' · Inactif' : ''}',
                              ),
                              isThreeLine: true,
                              trailing: PopupMenuButton<String>(
                                onSelected: (v) {
                                  if (v == 'edit') _editPriceStock(p);
                                  if (v == 'toggle') _toggleActive(p);
                                  if (v == 'delete') _deleteProduct(p);
                                },
                                itemBuilder: (_) => [
                                  const PopupMenuItem(value: 'edit', child: Text('Modifier prix/stock')),
                                  PopupMenuItem(
                                    value: 'toggle',
                                    child: Text(p.actif ? 'Désactiver' : 'Activer'),
                                  ),
                                  const PopupMenuItem(
                                    value: 'delete',
                                    child: Text('Supprimer', style: TextStyle(color: YorixColors.danger)),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
