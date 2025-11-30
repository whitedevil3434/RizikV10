import 'package:flutter/material.dart';
import 'dart:ui';

/// 🎨 Rizik Design System
/// World-class, premium design tokens for the Rizik super-app.
/// All UI components MUST use these tokens for consistency.
class RizikDesign {
  // ============================================================================
  // 🎨 COLOR PALETTE (Premium & Sophisticated)
  // ============================================================================
  
  /// Primary Brand Color - Deep Green (Trust, Growth, Prosperity)
  static const Color primary = Color(0xFF00695C);
  static const Color primaryLight = Color(0xFF2E7D6E);
  static const Color primaryDark = Color(0xFF004D40);
  
  /// Accent Color - Soft Gold (Rewards, Premium, Success)
  static const Color accent = Color(0xFFFFB300);
  static const Color accentLight = Color(0xFFFFCA28);
  static const Color accentDark = Color(0xFFF57C00);
  
  /// Surface & Background
  static const Color surface = Color(0xFFFFFFFF);
  static const Color background = Color(0xFFF5F7FA);
  static const Color surfaceVariant = Color(0xFFF0F2F5);
  
  /// Semantic Colors
  static const Color error = Color(0xFFE57373);
  static const Color success = Color(0xFF66BB6A);
  static const Color warning = Color(0xFFFFB74D);
  static const Color info = Color(0xFF42A5F5);
  
  /// Text Colors
  static const Color textPrimary = Color(0xFF1A1A1A);
  static const Color textSecondary = Color(0xFF666666);
  static const Color textTertiary = Color(0xFF999999);
  static const Color textOnPrimary = Color(0xFFFFFFFF);
  
  /// Overlay & Borders
  static const Color overlay = Color(0x1A000000);
  static const Color border = Color(0xFFE0E0E0);
  static const Color borderLight = Color(0xFFF0F0F0);
  
  // ============================================================================
  // 📏 SPACING (8pt Grid System)
  // ============================================================================
  
  static const double spacing2 = 2.0;
  static const double spacing4 = 4.0;
  static const double spacing8 = 8.0;
  static const double spacing12 = 12.0;
  static const double spacing16 = 16.0;
  static const double spacing24 = 24.0;
  static const double spacing32 = 32.0;
  static const double spacing48 = 48.0;
  static const double spacing64 = 64.0;
  
  // ============================================================================
  // 🔤 TYPOGRAPHY (Hind Siliguri - Bangla + English)
  // ============================================================================
  
  /// Header Text Style (Bold, 18pt)
  static const TextStyle textHeader = TextStyle(
    fontFamily: 'Hind Siliguri',
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: textPrimary,
    height: 1.2,
  );
  
  /// Subheader Text Style (SemiBold, 16pt)
  static const TextStyle textSubheader = TextStyle(
    fontFamily: 'Hind Siliguri',
    fontSize: 16,
    fontWeight: FontWeight.w600,
    color: textPrimary,
    height: 1.3,
  );
  
  /// Body Text Style (Regular, 14pt)
  static const TextStyle textBody = TextStyle(
    fontFamily: 'Hind Siliguri',
    fontSize: 14,
    fontWeight: FontWeight.w400,
    color: textSecondary,
    height: 1.5,
  );
  
  /// Caption Text Style (Regular, 12pt)
  static const TextStyle textCaption = TextStyle(
    fontFamily: 'Hind Siliguri',
    fontSize: 12,
    fontWeight: FontWeight.w400,
    color: textTertiary,
    height: 1.4,
  );
  
  /// Button Text Style (Medium, 14pt)
  static const TextStyle textButton = TextStyle(
    fontFamily: 'Hind Siliguri',
    fontSize: 14,
    fontWeight: FontWeight.w500,
    color: textOnPrimary,
    height: 1.2,
    letterSpacing: 0.5,
  );
  
  // ============================================================================
  // 🎴 CARD DECORATIONS
  // ============================================================================
  
  /// Standard Card Decoration (White background, rounded corners, subtle shadow)
  static BoxDecoration get cardDecoration => BoxDecoration(
    color: surface,
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.04),
        blurRadius: 8,
        offset: const Offset(0, 2),
      ),
      BoxShadow(
        color: Colors.black.withOpacity(0.02),
        blurRadius: 16,
        offset: const Offset(0, 4),
      ),
    ],
  );
  
  /// Elevated Card Decoration (Higher shadow for prominence)
  static BoxDecoration get cardElevated => BoxDecoration(
    color: surface,
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.08),
        blurRadius: 16,
        offset: const Offset(0, 4),
      ),
      BoxShadow(
        color: Colors.black.withOpacity(0.04),
        blurRadius: 32,
        offset: const Offset(0, 8),
      ),
    ],
  );
  
  /// Glass Morphism Decoration (Frosted glass effect)
  static BoxDecoration get glassDecoration => BoxDecoration(
    color: surface.withOpacity(0.8),
    borderRadius: BorderRadius.circular(16),
    border: Border.all(
      color: Colors.white.withOpacity(0.2),
      width: 1,
    ),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.1),
        blurRadius: 20,
        offset: const Offset(0, 8),
      ),
    ],
  );
  
  // ============================================================================
  // 🎭 GRADIENTS
  // ============================================================================
  
  /// Primary Gradient (Green shades)
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryLight, primaryDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  /// Accent Gradient (Gold shades)
  static const LinearGradient accentGradient = LinearGradient(
    colors: [accentLight, accentDark],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  /// Success Gradient
  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF66BB6A), Color(0xFF388E3C)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // ============================================================================
  // 📐 BORDER RADIUS
  // ============================================================================
  
  static const BorderRadius radiusSmall = BorderRadius.all(Radius.circular(8));
  static const BorderRadius radiusMedium = BorderRadius.all(Radius.circular(12));
  static const BorderRadius radiusLarge = BorderRadius.all(Radius.circular(16));
  static const BorderRadius radiusXLarge = BorderRadius.all(Radius.circular(24));
  static const BorderRadius radiusPill = BorderRadius.all(Radius.circular(999));
  
  // ============================================================================
  // ⚡ ANIMATIONS
  // ============================================================================
  
  static const Duration durationFast = Duration(milliseconds: 150);
  static const Duration durationNormal = Duration(milliseconds: 300);
  static const Duration durationSlow = Duration(milliseconds: 500);
  
  static const Curve curveDefault = Curves.easeInOutCubic;
  static const Curve curveSnappy = Curves.easeOutCubic;
  static const Curve curveSmooth = Curves.easeInOut;
}
