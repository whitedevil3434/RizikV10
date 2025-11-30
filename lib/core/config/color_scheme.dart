import 'package:flutter/material.dart';

/// Rizik Bengali-Inspired Color Scheme
/// A culturally relevant color palette that incorporates traditional Bengali colors
/// while maintaining the brand identity with Rizik Green as the primary color.
class RizikColorScheme {
  // Primary Brand Color - Rizik Green (unchanged)
  static const Color primary = Color(0xFF00B16A);
  static const Color primaryDark = Color(0xFF00965A);
  static const Color primaryLight = Color(0xFFE6F4EE);

  // Secondary Colors - Bengali Cultural Palette
  /// Traditional craft brown, representing handmade items and local markets
  static const Color craftBrown = Color(0xFF8B4513);
  
  /// Festive gold, representing Eid and celebrations
  static const Color festiveGold = Color(0xFFFFD700);
  
  /// Holi/Spring colors for festivals and joyful moments
  static const Color holiRed = Color(0xFFDC143C); // Crimson
  static const Color holiGreen = Color(0xFF228B22); // Forest Green
  static const Color holiYellow = Color(0xFFFFD700); // Golden Yellow
  static const Color holiBlue = Color(0xFF1E90FF); // Dodger Blue
  
  /// Traditional textile colors
  static const Color textileRed = Color(0xFFB22222); // Fire Brick
  static const Color textileBlue = Color(0xFF4169E1); // Royal Blue
  static const Color textileGreen = Color(0xFF2E8B57); // Sea Green
  
  /// Nature-inspired colors for agricultural themes
  static const Color paddyGreen = Color(0xFF32CD32); // Lime Green
  static const Color soilBrown = Color(0xFF8B4513); // Saddle Brown
  static const Color riverBlue = Color(0xFF4682B4); // Steel Blue
  
  /// Neutral colors for backgrounds and text
  static const Color backgroundLight = Color(0xFFF8F9FA);
  static const Color backgroundCard = Color(0xFFFFFFFF);
  static const Color textPrimary = Color(0xFF212529);
  static const Color textSecondary = Color(0xFF6C757D);
  static const Color textTertiary = Color(0xFFADB5BD);
  
  /// Status colors
  static const Color success = Color(0xFF28A745);
  static const Color warning = Color(0xFFFFC107);
  static const Color error = Color(0xFFDC3545);
  static const Color info = Color(0xFF17A2B8);
  
  /// Khata (ledger) metaphor colors
  static const Color khataPaper = Color(0xFFFFF8DC); // Cornsilk - paper-like color
  static const Color khataLines = Color(0xFFD3D3D3); // Light Gray - for ledger lines
  static const Color khataInk = Color(0xFF000000); // Black - for writing
  static const Color khataStamp = Color(0xFFDC143C); // Crimson - for official stamps
  
  /// Celebration and gamification colors
  static const Color celebrationFirework = Color(0xFFFFD700); // Gold
  static const Color celebrationConfetti1 = Color(0xFFFF6347); // Tomato
  static const Color celebrationConfetti2 = Color(0xFF9370DB); // Medium Purple
  static const Color celebrationConfetti3 = Color(0xFF32CD32); // Lime Green
  static const Color celebrationConfetti4 = Color(0xFF1E90FF); // Dodger Blue
  
  /// Social and community colors
  static const Color socialBlue = Color(0xFF1877F2); // Facebook Blue
  static const Color socialGreen = Color(0xFF25D366); // WhatsApp Green
  static const Color socialRed = Color(0xFFCD201F); // YouTube Red
  
  /// Gradient definitions for cards and backgrounds
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF00B16A), Color(0xFF00965A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient festiveGradient = LinearGradient(
    colors: [Color(0xFFFFD700), Color(0xFFFFA500)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  static const LinearGradient khataGradient = LinearGradient(
    colors: [Color(0xFFFFF8DC), Color(0xFFF5DEB3)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  /// Shadow colors for depth
  static const Color shadowLight = Color(0x1A000000); // 10% black
  static const Color shadowMedium = Color(0x33000000); // 20% black
  static const Color shadowHeavy = Color(0x4D000000); // 30% black
}