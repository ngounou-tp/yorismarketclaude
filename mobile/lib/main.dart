import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'app/main_shell.dart';
import 'core/config/env.dart';
import 'core/theme/yorix_theme.dart';
import 'features/splash/splash_screen.dart';
import 'providers/cart_provider.dart';
import 'providers/catalog_provider.dart';
import 'services/category_repository.dart';
import 'services/product_repository.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(url: Env.supabaseUrl, anonKey: Env.supabaseAnonKey);
  runApp(const YorixMarketApp());
}

class YorixMarketApp extends StatelessWidget {
  const YorixMarketApp({super.key});

  @override
  Widget build(BuildContext context) {
    final client = Supabase.instance.client;

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartProvider()),
        ChangeNotifierProvider(
          create: (_) => CatalogProvider(
            ProductRepository(client),
            CategoryRepository(client),
            client,
          )..load(),
        ),
      ],
      child: MaterialApp(
        title: 'Yorix Market',
        debugShowCheckedModeBanner: false,
        theme: buildYorixTheme(),
        home: const _Root(),
      ),
    );
  }
}

class _Root extends StatefulWidget {
  const _Root();

  @override
  State<_Root> createState() => _RootState();
}

class _RootState extends State<_Root> {
  bool _showSplash = true;

  @override
  Widget build(BuildContext context) {
    if (_showSplash) {
      return SplashScreen(onDone: () => setState(() => _showSplash = false));
    }
    return const MainShell();
  }
}
