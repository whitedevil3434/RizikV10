import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/user_role.dart';

/// 🌿 Rizik Unified Green Brand Color System
/// 
/// This comprehensive color palette establishes green as the core brand identity
/// while providing semantic variations for different contexts and features.
/// 
/// Philosophy: Green represents Money, Growth, Fresh Food, Trust, Reliability, Action
/// Benchmark: Professional fintech and food delivery platforms
class RizikBrandColors {
  // ==========================================
  // 1. PRIMARY BRAND COLORS (Green Family)
  // ==========================================
  
  /// Core brand green - The heart of Rizik identity
  /// Used for: Primary actions, success states, brand elements
  static const Color primary = Color(0xFF00A150);
  static const Color primaryDark = Color(0xFF008F42);
  static const Color primaryLight = Color(0xFF00C46A);
  
  /// Secondary Brand Color
  static const Color brandPurple = Color(0xFF9C27B0);
  
  /// Green tonal scale (Material Design 3 approach)
  /// Provides consistent visual hierarchy and accessibility
  static const Color green50 = Color(0xFFE8F5E9);   // Lightest - backgrounds
  static const Color green100 = Color(0xFFC8E6C9);  // Very light - containers
  static const Color green200 = Color(0xFFA5D6A7);  // Light - borders
  static const Color green300 = Color(0xFF81C784);  // Medium light - disabled
  static const Color green400 = Color(0xFF66BB6A);  // Medium - secondary actions
  static const Color green500 = Color(0xFF00A150);  // Primary - main brand
  static const Color green600 = Color(0xFF008F42);  // Medium dark - hover states
  static const Color green700 = Color(0xFF00703A);  // Dark - pressed states
  static const Color green800 = Color(0xFF005C2F);  // Very dark - text on light
  static const Color green900 = Color(0xFF003D20);  // Darkest - high contrast
  
  // ==========================================
  // 2. SEMANTIC GREEN APPLICATIONS
  // ==========================================
  
  /// Success & Positive States
  static const Color success = primary;
  static const Color successBackground = green50;
  static const Color successBorder = green200;
  static const Color successText = green700;
  
  /// Money & Financial Elements
  static const Color money = Color(0xFF00B16A);      // Slightly warmer for currency
  static const Color profit = Color(0xFF06D6A0);     // Growth and earnings
  static const Color income = primary;               // Income indicators
  static const Color balance = Color(0xFF2E7D32);    // Account balances
  
  /// Fresh & Food Related
  static const Color fresh = Color(0xFF4CAF50);      // Fresh food indicators
  static const Color organic = Color(0xFF2E7D32);    // Organic/natural products
  static const Color available = Color(0xFF66BB6A);  // Item availability
  static const Color inStock = primary;              // Stock status
  
  /// Trust & Verification
  static const Color trust = Color(0xFF00965A);      // Trust scores
  static const Color verified = Color(0xFF66BB6A);   // Verification badges
  static const Color secure = green700;              // Security indicators
  static const Color reliable = primary;             // Reliability markers
  
  // ==========================================
  // 3. ROLE-SPECIFIC GREENS
  // ==========================================
  
  /// Consumer role - Primary brand green
  static const Color consumer = primary;
  static const Color consumerLight = green100;
  static const Color consumerDark = green600;
  
  /// Partner role - Slightly warmer for business
  static const Color partner = Color(0xFF00B16A);
  static const Color partnerLight = Color(0xFFE6F4EE);
  static const Color partnerDark = Color(0xFF00965A);
  
  /// Rider role - Action-oriented green
  static const Color rider = Color(0xFF4CAF50);
  static const Color riderLight = Color(0xFFE8F5E9);
  static const Color riderDark = Color(0xFF388E3C);
  
  // ==========================================
  // 4. FEATURE-SPECIFIC GREENS
  // ==========================================
  
  /// Khata OS - Traditional ledger green
  static const Color khata = Color(0xFF2E7D32);
  static const Color khataLight = Color(0xFFE8F5E9);
  static const Color khataDark = Color(0xFF1B5E20);
  
  /// Bazar/Fooddrobe - Fresh market green
  static const Color bazar = Color(0xFF00C46A);
  static const Color bazarLight = Color(0xFFE6F7ED);
  static const Color bazarDark = Color(0xFF00A150);
  
  /// Wallet - Financial green
  static const Color wallet = primary;
  static const Color walletLight = green100;
  static const Color walletDark = green600;
  
  /// Squad - Community green
  static const Color squad = Color(0xFF66BB6A);
  static const Color squadLight = Color(0xFFE8F5E9);
  static const Color squadDark = Color(0xFF4CAF50);
  
  /// Orders - Status green
  static const Color orders = primary;
  static const Color ordersLight = green50;
  static const Color ordersDark = green700;
  
  // ==========================================
  // 5. INTERACTION STATES
  // ==========================================
  
  /// Button states
  static const Color buttonPrimary = primary;
  static const Color buttonHover = green600;
  static const Color buttonPressed = green700;
  static const Color buttonDisabled = green300;
  
  /// Link states
  static const Color link = green600;
  static const Color linkHover = green700;
  static const Color linkVisited = green800;
  
  /// Focus states
  static const Color focus = primary;
  static const Color focusRing = green200;
  
  // ==========================================
  // 6. GRADIENTS & EFFECTS
  // ==========================================
  
  /// Primary gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF00A150), Color(0xFF00C46A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  /// Success gradient
  static const LinearGradient successGradient = LinearGradient(
    colors: [Color(0xFF66BB6A), Color(0xFF4CAF50)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  /// Money gradient
  static const LinearGradient moneyGradient = LinearGradient(
    colors: [Color(0xFF00B16A), Color(0xFF06D6A0)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  /// Fresh gradient
  static const LinearGradient freshGradient = LinearGradient(
    colors: [Color(0xFF4CAF50), Color(0xFF66BB6A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
  
  // ==========================================
  // 7. HELPER METHODS
  // ==========================================
  
  /// Get green shade by intensity (50-900)
  static Color getGreenShade(int shade) {
    switch (shade) {
      case 50: return green50;
      case 100: return green100;
      case 200: return green200;
      case 300: return green300;
      case 400: return green400;
      case 500: return green500;
      case 600: return green600;
      case 700: return green700;
      case 800: return green800;
      case 900: return green900;
      default: return primary;
    }
  }
  
  /// Get role-specific green color
  static Color getRoleGreen(UserRole role) {
    switch (role) {
      case UserRole.consumer: return consumer;
      case UserRole.partner: return partner;
      case UserRole.rider: return rider;
    }
  }
  
  /// Get role-specific light variant
  static Color getRoleGreenLight(UserRole role) {
    switch (role) {
      case UserRole.consumer: return consumerLight;
      case UserRole.partner: return partnerLight;
      case UserRole.rider: return riderLight;
    }
  }
  
  /// Get role-specific dark variant
  static Color getRoleGreenDark(UserRole role) {
    switch (role) {
      case UserRole.consumer: return consumerDark;
      case UserRole.partner: return partnerDark;
      case UserRole.rider: return riderDark;
    }
  }
  
  /// Get feature-specific green color
  static Color getFeatureGreen(String feature) {
    switch (feature.toLowerCase()) {
      case 'khata': return khata;
      case 'bazar': 
      case 'fooddrobe': return bazar;
      case 'wallet': return wallet;
      case 'squad': return squad;
      case 'orders': return orders;
      default: return primary;
    }
  }
  
  /// Get semantic green for specific contexts
  static Color getSemanticGreen(String context) {
    switch (context.toLowerCase()) {
      case 'success': return success;
      case 'money': 
      case 'currency': return money;
      case 'profit': 
      case 'earnings': return profit;
      case 'fresh': 
      case 'food': return fresh;
      case 'organic': 
      case 'natural': return organic;
      case 'trust': 
      case 'reliable': return trust;
      case 'verified': 
      case 'confirmed': return verified;
      case 'available': 
      case 'in-stock': return available;
      default: return primary;
    }
  }
  
  /// Get green with opacity for backgrounds
  static Color withOpacity(Color color, double opacity) {
    return color.withValues(alpha: opacity);
  }
  
  /// Check if color meets accessibility contrast requirements
  static bool meetsContrastRequirement(Color foreground, Color background) {
    final fgLuminance = foreground.computeLuminance();
    final bgLuminance = background.computeLuminance();
    final contrast = (fgLuminance + 0.05) / (bgLuminance + 0.05);
    return contrast >= 4.5; // WCAG AA standard
  }
  
  /// Get appropriate text color for green background
  static Color getTextColorForGreenBackground(Color greenBackground) {
    if (meetsContrastRequirement(Colors.white, greenBackground)) {
      return Colors.white;
    } else if (meetsContrastRequirement(green900, greenBackground)) {
      return green900;
    } else {
      return Colors.black;
    }
  }
}

/// Extension for easy access to brand colors
extension RizikBrandColorsExtension on BuildContext {
  RizikBrandColors get brandColors => RizikBrandColors();
}

/// Color constants for backward compatibility
class RizikColors {
  // Legacy support - redirect to new brand colors
  static const Color rizikGreen = RizikBrandColors.primary;
  static const Color success = RizikBrandColors.success;
  static const Color money = RizikBrandColors.money;
  static const Color fresh = RizikBrandColors.fresh;
  static const Color trust = RizikBrandColors.trust;
  
  // Foundation colors (unchanged)
  static const Color background = Color(0xFFF8F8F8);
  static const Color cardSurface = Color(0xFFFFFFFF);
  static const Color primaryText = Color(0xFF1C1C1E);
  static const Color secondaryText = Color(0xFF8E8E93);
  static const Color tertiaryText = Color(0xFFC7C7CC);
  static const Color divider = Color(0xFFE5E5EA);
  
  // Semantic colors (non-green)
  static const Color semanticRed = Color(0xFFD32F2F);
  static const Color semanticAmber = Color(0xFFFFA000);
  static const Color semanticBlue = Color(0xFF007AFF);
}