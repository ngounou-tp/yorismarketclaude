import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/config/env.dart';
import '../../core/theme/yorix_theme.dart';
import '../auth/auth_screen.dart';
import '../hub/services_hub_screen.dart';

class ProfileTab extends StatelessWidget {
  const ProfileTab({super.key});

  Future<void> _signOut(BuildContext context) async {
    await Supabase.instance.client.auth.signOut();
  }

  Future<void> _openAuth(BuildContext context) async {
    await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const AuthScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = Supabase.instance.client.auth.currentUser;

    return ListView(
      padding: const EdgeInsets.fromLTRB(0, 0, 0, 100),
      children: [
        Container(
          width: double.infinity,
          padding: EdgeInsets.fromLTRB(24, MediaQuery.paddingOf(context).top + 24, 24, 28),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [YorixColors.greenDark, YorixColors.green],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 36,
                backgroundColor: Colors.white24,
                child: Text(
                  user != null ? (user.email?[0] ?? 'U').toUpperCase() : '?',
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w800, color: Colors.white),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                user?.email ?? 'Invité',
                style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              Text(
                user != null ? 'Compte connecté' : 'Connectez-vous pour commander',
                style: TextStyle(color: Colors.white.withValues(alpha: 0.85)),
              ),
              const SizedBox(height: 16),
              if (user == null)
                FilledButton(
                  style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: YorixColors.green),
                  onPressed: () => _openAuth(context),
                  child: const Text('Se connecter'),
                )
              else
                OutlinedButton(
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.white, side: const BorderSide(color: Colors.white54)),
                  onPressed: () => _signOut(context),
                  child: const Text('Déconnexion'),
                ),
            ],
          ),
        ),
        _MenuTile(
          icon: Icons.grid_view_rounded,
          title: 'Écosystème Yorix',
          subtitle: 'Livraison, Business, Academy',
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute(builder: (_) => const ServicesHubScreen()),
          ),
        ),
        _MenuTile(icon: Icons.language, title: 'Site web', subtitle: Env.siteUrl, onTap: () {}),
        _MenuTile(icon: Icons.help_outline, title: 'Aide & support', subtitle: 'WhatsApp 7j/7', onTap: () {}),
        _MenuTile(icon: Icons.info_outline, title: 'À propos', subtitle: 'Yorix Market v1.0', onTap: () {}),
      ],
    );
  }
}

class _MenuTile extends StatelessWidget {
  const _MenuTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
      leading: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: YorixColors.greenPale,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Icon(icon, color: YorixColors.green),
      ),
      title: Text(title, style: const TextStyle(fontWeight: FontWeight.w700)),
      subtitle: Text(subtitle, style: const TextStyle(fontSize: 12)),
      trailing: const Icon(Icons.chevron_right),
      onTap: onTap,
    );
  }
}
