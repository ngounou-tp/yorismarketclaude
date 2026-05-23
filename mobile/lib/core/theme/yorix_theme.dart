import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

abstract final class YorixColors {
  static const green = Color(0xFF1A6B3A);
  static const greenDark = Color(0xFF0D4A25);
  static const greenLight = Color(0xFF2D8F52);
  static const greenPale = Color(0xFFE8F5E9);
  static const gold = Color(0xFFF59E0B);
  static const goldPale = Color(0xFFFFF7E6);
  static const cyan = Color(0xFF0891B2);
  static const purple = Color(0xFF7C3AED);
  static const ink = Color(0xFF111827);
  static const inkSoft = Color(0xFF374151);
  static const gray = Color(0xFF6B7280);
  static const border = Color(0xFFE5E7EB);
  static const surface = Color(0xFFF3F4F6);
  static const card = Colors.white;
  static const danger = Color(0xFFDC2626);
}

ThemeData buildYorixTheme() {
  final textTheme = GoogleFonts.plusJakartaSansTextTheme();
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: YorixColors.surface,
    textTheme: textTheme.apply(
      bodyColor: YorixColors.ink,
      displayColor: YorixColors.ink,
    ),
    colorScheme: ColorScheme.fromSeed(
      seedColor: YorixColors.green,
      primary: YorixColors.green,
      onPrimary: Colors.white,
      secondary: YorixColors.gold,
      surface: YorixColors.card,
    ),
    appBarTheme: AppBarTheme(
      elevation: 0,
      scrolledUnderElevation: 0,
      backgroundColor: Colors.transparent,
      foregroundColor: YorixColors.ink,
      systemOverlayStyle: SystemUiOverlayStyle.dark,
      titleTextStyle: textTheme.titleLarge?.copyWith(
        fontWeight: FontWeight.w800,
        color: YorixColors.ink,
      ),
    ),
    cardTheme: CardThemeData(
      elevation: 0,
      color: YorixColors.card,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: YorixColors.border, width: 0.5),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: YorixColors.card,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: YorixColors.border),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: YorixColors.border),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(14),
        borderSide: const BorderSide(color: YorixColors.green, width: 1.5),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: YorixColors.green,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      elevation: 0,
      height: 68,
      backgroundColor: YorixColors.card,
      indicatorColor: YorixColors.greenPale,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        final selected = states.contains(WidgetState.selected);
        return TextStyle(
          fontSize: 11,
          fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
          color: selected ? YorixColors.green : YorixColors.gray,
        );
      }),
    ),
    snackBarTheme: SnackBarThemeData(
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
    ),
  );
}
