import 'package:flutter/material.dart';

class AppTheme {
  // Triple Themes based on role
  static ThemeData getTheme(String role) {
    switch (role) {
      case 'admin':
        return _baseTheme(Colors.orange, Brightness.light);
      case 'super':
        return _baseTheme(Colors.purple, Brightness.light);
      case 'patient':
      default:
        return _baseTheme(Colors.blue, Brightness.light);
    }
  }

  static ThemeData getDarkTheme(String role) {
    switch (role) {
      case 'admin': return _baseTheme(Colors.orange, Brightness.dark);
      case 'super': return _baseTheme(Colors.purple, Brightness.dark);
      case 'patient':
      default: return _baseTheme(Colors.blue, Brightness.dark);
    }
  }

  static ThemeData _baseTheme(Color color, Brightness brightness) {
    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: ColorScheme.fromSeed(
        seedColor: color,
        brightness: brightness,
      ),
      appBarTheme: AppBarTheme(
        centerTitle: true,
        backgroundColor: brightness == Brightness.dark ? null : color,
        foregroundColor: brightness == Brightness.dark ? null : Colors.white,
      ),
    );
  }

  static final lightTheme = _baseTheme(Colors.blue, Brightness.light);
  static final darkTheme = _baseTheme(Colors.blue, Brightness.dark);
}
