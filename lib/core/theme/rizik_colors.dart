import 'package:flutter/material.dart';

/// 🎨 Rizik OS Professional Color System
/// 
/// This color palette is built on reliability, savings, and efficiency.
/// Designed to reduce eye strain and create clear visual hierarchy.
class RizikColors {
  // ==========================================
  // 1. FOUNDATION COLORS (90% UI)
  // ==========================================
  
  /// Main background - softer than pure white, reduces eye strain
  static const Color background = Color(0xFFF8F8F8);
  
  /// Card/Surface color - floats above background, clean and deep feeling
  static const Color cardSurface = Color(0xFFFFFFFF);
  
  /// Primary text - not pure black, easier to read and elegant (Apple palette)
  static const Color primaryText = Color(0xFF1C1C1E);
  static const Color textPrimary = primaryText; // Alias for backward compatibility
  
  /// Secondary text - for timestamps, small descriptions. Creates hierarchy
  static const Color secondaryText = Color(0xFF8E8E93);
  
  /// Tertiary text - for very subtle information
  static const Color tertiaryText = Color(0xFFC7C7CC);
  
  /// Divider/border color
  static const Color divider = Color(0xFFE5E5EA);
  
  // ==========================================
  // 2. BRAND & ACTION COLORS (5% UI)
  // ==========================================
  
  /// Primary brand color - Green means: Money (Khata OS), Fresh (Bazar), Go (Action/Mover)
  /// Reliable and positive
  static const Color rizikGreen = Color(0xFF00A150);
  static const Color brandGreen = rizikGreen; // Alias for backward compatibility
  
  /// Accent/Info color - for informational messages, links, or scheduled task tags
  static const Color semanticBlue = Color(0xFF007AFF);
  
  // ==========================================
  // 3. SEMANTIC/ALERT COLORS (5% UI)
  // ==========================================
  
  /// Error/Urgent - MISSED ORDER, Decline, critical alerts, live orders
  static const Color semanticRed = Color(0xFFD32F2F);
  
  /// Warning/Attention - Inventory LOW, Payment Due, Unclaimed Order
  /// Use this amber color only in tags, not as card background
  static const Color semanticAmber = Color(0xFFFFA000);
  
  // ==========================================
  // HELPER METHODS
  // ==========================================
  
  /// Get priority color based on urgency level
  static Color getPriorityColor(PriorityLevel level) {
    switch (level) {
      case PriorityLevel.urgent:
        return semanticRed;
      case PriorityLevel.warning:
        return semanticAmber;
      case PriorityLevel.scheduled:
        return semanticBlue;
      case PriorityLevel.info:
        return secondaryText;
    }
  }
  
  /// Get color with opacity for backgrounds
  static Color withOpacity(Color color, double opacity) {
    return color.withValues(alpha: opacity);
  }
  
  /// Success color (derived from rizikGreen)
  static const Color success = rizikGreen;
  
  /// Light variants for backgrounds
  static Color get rizikGreenLight => withOpacity(rizikGreen, 0.1);
  static Color get semanticBlueLight => withOpacity(semanticBlue, 0.1);
  static Color get semanticRedLight => withOpacity(semanticRed, 0.1);
  static Color get semanticAmberLight => withOpacity(semanticAmber, 0.1);
}

/// Priority levels for visual hierarchy
enum PriorityLevel {
  urgent,    // Red - Handle immediately
  warning,   // Amber - Handle today
  scheduled, // Blue - Scheduled tasks
  info,      // Gray - General information
}

/// Card types for consistent styling
enum CardType {
  liveOrder,
  actionRequired,
  todaysKitchen,
  management,
  analytics,
  squad,
  inventory,
}

/// Extension to get priority level from card type
extension CardTypePriority on CardType {
  PriorityLevel get priority {
    switch (this) {
      case CardType.liveOrder:
        return PriorityLevel.urgent;
      case CardType.actionRequired:
        return PriorityLevel.warning;
      case CardType.todaysKitchen:
        return PriorityLevel.scheduled;
      case CardType.management:
      case CardType.analytics:
      case CardType.squad:
      case CardType.inventory:
        return PriorityLevel.info;
    }
  }
  
  Color get color => RizikColors.getPriorityColor(priority);
  
  IconData get icon {
    switch (this) {
      case CardType.liveOrder:
        return Icons.local_fire_department;
      case CardType.actionRequired:
        return Icons.warning_amber;
      case CardType.todaysKitchen:
        return Icons.restaurant;
      case CardType.management:
        return Icons.dashboard;
      case CardType.analytics:
        return Icons.analytics;
      case CardType.squad:
        return Icons.group;
      case CardType.inventory:
        return Icons.inventory;
    }
  }
}