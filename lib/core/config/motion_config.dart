import 'package:flutter/animation.dart';

/// Rizik V4.1 Motion System Configuration
/// R-HIG compliant animation constants
class MotionConfig {
  MotionConfig._();

  // Duration constants
  static const Duration micro = Duration(milliseconds: 100);
  static const Duration small = Duration(milliseconds: 200);
  static const Duration medium = Duration(milliseconds: 280);
  static const Duration standard = Duration(milliseconds: 380);
  static const Duration large = Duration(milliseconds: 480);
  static const Duration macro = Duration(milliseconds: 600);

  // Easing curves
  static const Curve scrollAppear = Curves.easeOutCubic;
  static const Curve transition = Curves.easeInOut;
  static const Curve bottomSheet = Curves.easeOutCubic;
  static const Curve fadeIn = Curves.easeIn;
  static const Curve fadeOut = Curves.easeOut;

  // Spring configurations
  static const SpringDescription heroSpring = SpringDescription(
    mass: 1.0,
    stiffness: 320.0,
    damping: 24.0,
  );

  static const SpringDescription roleSwitch = SpringDescription(
    mass: 1.0,
    stiffness: 400.0,
    damping: 20.0,
  );

  static const SpringDescription cardBounce = SpringDescription(
    mass: 1.0,
    stiffness: 500.0,
    damping: 30.0,
  );

  // Scale values
  static const double cardFocusScale = 0.96;
  static const double cardRestScale = 1.00;
  static const double buttonTapScale = 0.95;
  static const double favoriteScale = 1.15;

  // Parallax
  static const double parallaxMultiplier = -0.2;

  // Bottom sheet
  static const double bottomSheetRadius = 24.0;
  static const Duration bottomSheetDuration = Duration(milliseconds: 380);

  // Hero transitions
  static Duration get heroTransitionDuration => standard;

  // Tab switching
  static const Duration tabSwitchDuration = Duration(milliseconds: 300);
  static const Curve tabSwitchCurve = Curves.easeInOutCubic;

  // Cart animation
  static const Duration cartFlyDuration = Duration(milliseconds: 800);
  static const Curve cartFlyCurve = Curves.easeInOutCubic;

  // Shimmer
  static const Duration shimmerDuration = Duration(milliseconds: 1500);
  static const Color shimmerBaseColor = Color(0xFFE0E0E0);
  static const Color shimmerHighlightColor = Color(0xFFF5F5F5);

  // Aura glow
  static const Duration auraGlowDuration = Duration(milliseconds: 2000);
  static const Duration confettiDuration = Duration(milliseconds: 3000);

  // Scroll physics
  static const double scrollVelocityThreshold = 100.0;
}
