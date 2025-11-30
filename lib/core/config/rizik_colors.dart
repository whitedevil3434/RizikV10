/// 🎨 Rizik OS Professional Color Palette
/// 
/// Philosophy: Reliability, Savings, Efficiency
/// Benchmark: Apple, Amazon, Facebook
/// 
/// This is a UTILITY platform (Finance + Logistics + Management)
/// It will NOT be flashy. It WILL be reliable.

import 'package:flutter/material.dart';

class RizikColors {
  // ==========================================
  // 1. FOUNDATION (90% of UI)
  // ==========================================
  
  /// Main background - Reduces eye strain, clean feeling
  static const Color background = Color(0xFFF9F9F9);
  
  /// Card/Surface - Floats above background, creates depth
  static const Color surface = Color(0xFFFFFFFF);
  
  /// Primary text - Less harsh than pure black (Apple's palette)
  static const Color textPrimary = Color(0xFF1D1D1F);
  
  /// Secondary text - For descriptions, timestamps. Creates hierarchy
  static const Color textSecondary = Color(0xFF6E6E73);
  
  /// Tertiary text - For subtle hints, disabled states
  static const Color textTertiary = Color(0xFF8E8E93);
  
  /// Divider/Border - Subtle separation
  static const Color divider = Color(0xFFE5E5EA);
  
  // ==========================================
  // 2. BRAND & ACTION (5% of UI)
  // ==========================================
  
  /// Rizik Green - Our signature
  /// Used for: All primary action buttons (Accept, Bid, Buy)
  /// Meaning: Money (Khata OS), Fresh (Bazar), Go (Action)
  /// It's reliable and positive
  static const Color brandGreen = Color(0xFF00A150);

  
  /// Brand Green with opacity variations
  static const Color brandGreenLight = Color(0xFF00C46A);
  static const Color brandGreenDark = Color(0xFF008F42);
  
  // ==========================================
  // 3. SEMANTIC/ALERT (5% of UI)
  // ==========================================
  // These colors SHOUT. Use ONLY when necessary, NOT for decoration.
  
  /// Semantic Red - MISSED ORDER, Decline, Critical alerts
  static const Color semanticRed = Color(0xFFD32F2F);
  static const Color semanticRedLight = Color(0xFFFFEBEE);
  
  /// Semantic Amber - Inventory LOW, Payment Due, Unclaimed Order
  /// Use this ONLY in tags, NOT as card background
  static const Color semanticAmber = Color(0xFFFFA000);
  static const Color semanticAmberLight = Color(0xFFFFF8E1);
  
  /// Success/Done - Order Accepted, Delivery Completed
  /// Reuse brand green for consistency
  static const Color semanticSuccess = brandGreen;
  static const Color semanticSuccessLight = Color(0xFFE8F5E9);
  
  /// Info - Neutral information, scheduled items
  static const Color semanticInfo = Color(0xFF007AFF); // Apple blue
  static const Color semanticInfoLight = Color(0xFFE3F2FD);
  
  // ==========================================
  // 4. ROLE-SPECIFIC ACCENTS (Minimal use)
  // ==========================================
  
  /// Consumer accent - For consumer-specific features
  static const Color consumerAccent = Color(0xFF007AFF);
  
  /// Partner accent - For partner-specific features
  static const Color partnerAccent = brandGreen;
  
  /// Rider accent - For rider-specific features
  static const Color riderAccent = Color(0xFFFF6B35);
  
  // ==========================================
  // 5. SHADOWS & OVERLAYS
  // ==========================================
  
  /// Card shadow - Subtle depth
  static Color cardShadow = Colors.black.withValues(alpha: 0.05);
  
  /// Premium Card Shadow - For "Market Leading" feel
  static List<BoxShadow> premiumShadow = [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.04),
      blurRadius: 12,
      offset: const Offset(0, 4),
    ),
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.02),
      blurRadius: 2,
      offset: const Offset(0, 1),
    ),
  ];

  /// Glassmorphism
  static Color surfaceGlass = Colors.white.withValues(alpha: 0.7);
  static Color surfaceGlassDark = Colors.black.withValues(alpha: 0.6);

  /// Modal overlay
  static Color modalOverlay = Colors.black.withValues(alpha: 0.4);
  
  /// Shimmer base
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);
  
  // ==========================================
  // 6. ANIMATION CONSTANTS
  // ==========================================
  static const Duration animateFast = Duration(milliseconds: 200);
  static const Duration animateNormal = Duration(milliseconds: 300);
  static const Duration animateSlow = Duration(milliseconds: 500);
  
  // ==========================================
  // 7. STATUS TAGS (Small badges, chips)
  // ==========================================
  
  /// Status colors for order states
  static const Color statusPending = semanticAmber;
  static const Color statusConfirmed = semanticInfo;
  static const Color statusPreparing = Color(0xFFFF9800);
  static const Color statusReady = brandGreen;
  static const Color statusDelivering = Color(0xFF2196F3);
  static const Color statusCompleted = semanticSuccess;
  static const Color statusCancelled = semanticRed;
}
