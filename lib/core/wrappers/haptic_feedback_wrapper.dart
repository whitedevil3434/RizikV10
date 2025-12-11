import 'package:flutter/services.dart';

/// HapticFeedbackWrapper - Tactile Feedback System
/// Provides physical feedback for user interactions
class HapticFeedbackWrapper {
  static final HapticFeedbackWrapper _instance = HapticFeedbackWrapper._internal();
  factory HapticFeedbackWrapper() => _instance;
  HapticFeedbackWrapper._internal();

  /// Light impact (for buttons, tabs)
  Future<void> light() async {
    await HapticFeedback.lightImpact();
  }

  /// Medium impact (for cards, lists)
  Future<void> medium() async {
    await HapticFeedback.mediumImpact();
  }

  /// Heavy impact (for errors, success)
  Future<void> heavy() async {
    await HapticFeedback.heavyImpact();
  }

  /// Selection click (for pickers, sliders)
  Future<void> selection() async {
    await HapticFeedback.selectionClick();
  }

  /// Vibrate (generic)
  Future<void> vibrate() async {
    await HapticFeedback.vibrate();
  }
}

/// Global instance
final hapticWrapper = HapticFeedbackWrapper();
