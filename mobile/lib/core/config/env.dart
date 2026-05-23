/// Configuration Supabase (même projet que le site web Yorix).
/// Surcharge possible au build : --dart-define=SUPABASE_URL=... --dart-define=SUPABASE_ANON_KEY=...
class Env {
  static const supabaseUrl = String.fromEnvironment(
    'SUPABASE_URL',
    defaultValue: 'https://msrymchhhxitdevthvdi.supabase.co',
  );

  static const supabaseAnonKey = String.fromEnvironment(
    'SUPABASE_ANON_KEY',
    defaultValue:
        'sb_publishable_yJj7JNdn-r19Pjc070IOBg_y2VzGJXA',
  );

  static const siteUrl = 'https://www.yorix.cm';
  static const whatsAppNumber = '237696565654';
}
