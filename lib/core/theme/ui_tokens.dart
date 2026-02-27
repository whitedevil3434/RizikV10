import 'package:flutter/material.dart';

/// Shared UI tokens for cross-screen consistency.
class UiTokens {
  static const double pagePadding = 16;
  static const double sectionGap = 14;
  static const double cardRadius = 14;
  static const double chipRadius = 999;

  static BorderRadius get cardBorderRadius => BorderRadius.circular(cardRadius);
  static BorderRadius get chipBorderRadius => BorderRadius.circular(chipRadius);

  static Color borderColor(BuildContext context) =>
      Colors.black.withValues(alpha: 0.08);
}
