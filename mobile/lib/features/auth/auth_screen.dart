import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import '../../core/theme/yorix_theme.dart';
import '../../models/user_profile.dart';
import '../../services/profile_repository.dart';
import '../../services/user_mutations.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _profiles = ProfileRepository(Supabase.instance.client);
  bool _signUp = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<bool> _enforceProfileAccess(String uid) async {
    final profile = await _profiles.fetchById(uid);
    if (isProfileAccessible(profile)) return true;
    await Supabase.instance.client.auth.signOut();
    setState(() {
      _error = 'Ce compte est suspendu ou supprimé. Contactez le support Yorix.';
    });
    return false;
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final auth = Supabase.instance.client.auth;
      if (_signUp) {
        final res = await auth.signUp(
          email: _email.text.trim(),
          password: _password.text,
        );
        final uid = res.user?.id;
        if (uid != null) {
          await Supabase.instance.client.from('profiles').upsert({
            'id': uid,
            'email': _email.text.trim(),
            'role': 'buyer',
            'actif': true,
            'verifie': false,
            'langue': 'fr',
          });
        }
      } else {
        final res = await auth.signInWithPassword(
          email: _email.text.trim(),
          password: _password.text,
        );
        final uid = res.user?.id;
        if (uid != null && !await _enforceProfileAccess(uid)) return;
      }
      if (mounted) Navigator.of(context).pop(true);
    } on AuthException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = '$e';
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Connexion')),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [YorixColors.greenDark, YorixColors.green]),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Compte Yorix', style: TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
                SizedBox(height: 6),
                Text('Même identifiant que sur yorix.cm', style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          const SizedBox(height: 24),
          TextField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email')),
          const SizedBox(height: 12),
          TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Mot de passe')),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: YorixColors.danger)),
          ],
          const SizedBox(height: 24),
          FilledButton(
            onPressed: _loading ? null : _submit,
            child: Text(_signUp ? 'Créer mon compte' : 'Se connecter'),
          ),
          TextButton(
            onPressed: _loading ? null : () => setState(() => _signUp = !_signUp),
            child: Text(_signUp ? 'J\'ai déjà un compte' : 'Créer un compte'),
          ),
        ],
      ),
    );
  }
}
