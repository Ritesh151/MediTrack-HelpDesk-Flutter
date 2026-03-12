import 'package:flutter/material.dart';

/// Professional Medical Design System Colors
/// Off-White based theme suitable for healthcare applications
class AppColors {
  // Primary Colors - Professional Medical Blue
  static const Color primary = Color(0xFF0066CC);
  static const Color primaryLight = Color(0xFFE6F3FF);
  static const Color primaryDark = Color(0xFF0052A3);
  
  // Secondary Colors - Soft Teal
  static const Color secondary = Color(0xFF00A896);
  static const Color secondaryLight = Color(0xFFE6F9F5);
  static const Color secondaryDark = Color(0xFF00867A);
  
  // Background Colors - Off-White System
  static const Color background = Color(0xFFFAFBFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardBackground = Color(0xFFFFFFFF);
  static const Color scaffoldBackground = Color(0xFFF8F9FA);
  
  // Text Colors - High Contrast but Soft
  static const Color textPrimary = Color(0xFF1A1D23);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  static const Color textOnSecondary = Color(0xFFFFFFFF);
  
  // Status Colors - Medical Grade
  static const Color success = Color(0xFF10B981);
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color warning = Color(0xFFF59E0B);
  static const Color warningLight = Color(0xFFFEF3C7);
  static const Color error = Color(0xFFEF4444);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color info = Color(0xFF3B82F6);
  static const Color infoLight = Color(0xFFDBEAFE);
  
  // Neutral Colors - Professional Grays
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);
  
  // Border and Divider Colors
  static const Color border = Color(0xFFE5E7EB);
  static const Color divider = Color(0xFFF3F4F6);
  static const Color outline = Color(0xFFD1D5DB);
  
  // Shadow Colors
  static const Color shadow = Color(0x0A000000);
  static const Color shadowLight = Color(0x05000000);
  
  // Chat Specific Colors
  static const Color chatBubblePatient = Color(0xFFE6F3FF);
  static const Color chatBubbleAdmin = Color(0xFFF3F4F6);
  static const Color chatBubbleMe = Color(0xFF0066CC);
  static const Color chatTimestamp = Color(0xFF9CA3AF);
  
  // Role-based Colors
  static const Color patientRole = Color(0xFF0066CC);
  static const Color adminRole = Color(0xFF00A896);
  static const Color superRole = Color(0xFF7C3AED);
  
  // Hospital Type Colors
  static const Color govHospital = Color(0xFF0066CC);
  static const Color privateHospital = Color(0xFF00A896);
  static const Color semiHospital = Color(0xFF7C3AED);
}

/// Extension methods for color manipulation
extension ColorExtensions on Color {
  Color withOpacity(double opacity) {
    return Color.fromARGB(
      (255 * opacity).round(),
      red,
      green,
      blue,
    );
  }
  
  Color lighten([double amount = 0.1]) {
    final hsl = HSLColor.fromColor(this);
    return hsl.withLightness((hsl.lightness + amount).clamp(0.0, 1.0)).toColor();
  }
  
  Color darken([double amount = 0.1]) {
    final hsl = HSLColor.fromColor(this);
    return hsl.withLightness((hsl.lightness - amount).clamp(0.0, 1.0)).toColor();
  }
}
