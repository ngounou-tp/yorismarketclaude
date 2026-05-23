import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/theme/yorix_theme.dart';
import '../../models/user_profile.dart';
import '../../services/profile_repository.dart';
import '../../services/user_mutations.dart';

/// Admin — gestion utilisateurs (profiles uniquement).
class AdminUsersScreen extends StatefulWidget {
  const AdminUsersScreen({super.key});

  @override
  State<AdminUsersScreen> createState() => _AdminUsersScreenState();
}

class _AdminUsersScreenState extends State<AdminUsersScreen> {
  final _profiles = ProfileRepository(Supabase.instance.client);
  final _mutations = UserMutations(Supabase.instance.client);

  UserProfile? _actor;
  List<UserProfile> _users = [];
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
      _actor = await _profiles.fetchCurrent();
      if (!canWriteAdmin(_actor)) {
        setState(() => _error = 'Accès admin requis.');
        return;
      }
      final rows = await Supabase.instance.client
          .from('profiles')
          .select()
          .order('created_at', ascending: false)
          .limit(200);
      _users = (rows as List)
          .map((r) => UserProfile.fromJson(Map<String, dynamic>.from(r)))
          .toList();
    } catch (e) {
      _error = '$e';
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleActive(UserProfile u) async {
    final res = await _mutations.toggleUserActive(
      userId: u.id,
      currentlyActive: u.actif,
      actorProfile: _actor,
    );
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(res.ok ? 'Statut mis à jour' : (res.error ?? 'Erreur'))),
    );
    if (res.ok) _load();
  }

  Future<void> _banOrDelete(UserProfile u) async {
    final hard = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Utilisateur'),
        content: Text(
          '${u.email ?? u.id}\n\n'
          'OK = suppression définitive (anonymisation)\n'
          'Annuler = suspension réversible uniquement',
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Suspendre')),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: YorixColors.danger),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Supprimer'),
          ),
        ],
      ),
    );
    if (hard == null) return;

    final res = hard
        ? await _mutations.hardDeleteUser(userId: u.id, actorProfile: _actor)
        : await _mutations.softBanUser(userId: u.id, actorProfile: _actor);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(res.ok ? 'OK' : (res.error ?? 'Erreur'))),
    );
    if (res.ok) _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Utilisateurs')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.separated(
                    padding: const EdgeInsets.all(12),
                    itemCount: _users.length,
                    separatorBuilder: (_, __) => const Divider(height: 1),
                    itemBuilder: (context, i) {
                      final u = _users[i];
                      final suspended = !u.actif || u.deletedAt != null;
                      return ListTile(
                        title: Text(u.displayName),
                        subtitle: Text('${u.email ?? '—'} · ${u.role}'
                            '${u.deletedAt != null ? ' · supprimé' : ''}'),
                        trailing: u.deletedAt != null
                            ? null
                            : PopupMenuButton<String>(
                                onSelected: (v) {
                                  if (v == 'toggle') _toggleActive(u);
                                  if (v == 'ban') _banOrDelete(u);
                                },
                                itemBuilder: (_) => [
                                  PopupMenuItem(
                                    value: 'toggle',
                                    child: Text(u.actif ? 'Suspendre' : 'Réactiver'),
                                  ),
                                  const PopupMenuItem(value: 'ban', child: Text('Ban / Supprimer')),
                                ],
                              ),
                        leading: CircleAvatar(
                          backgroundColor: suspended ? Colors.grey : YorixColors.greenPale,
                          child: Icon(
                            suspended ? Icons.block : Icons.person,
                            color: suspended ? Colors.white : YorixColors.green,
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
