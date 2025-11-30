import 'package:flutter/material.dart';

/// Custom page transitions for Rizik V7.1
/// Provides consistent animation styles across the app

class RouteTransitions {
  /// Tab switch transition - Subtle fade + micro slide
  /// Duration: 300ms
  /// Use case: Bottom navigation tab switches
  static Widget tabSwitch(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurveTween(curve: Curves.easeInOut).animate(animation),
      child: SlideTransition(
        position: Tween<Offset>(
          begin: const Offset(0.0, 0.02),
          end: Offset.zero,
        ).animate(CurvedAnimation(
          parent: animation,
          curve: Curves.easeOutCubic,
        )),
        child: child,
      ),
    );
  }

  /// Screen push transition - Slide from right
  /// Duration: 400ms
  /// Use case: Navigating to detail screens
  static Widget screenPush(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    const begin = Offset(1.0, 0.0);
    const end = Offset.zero;
    const curve = Curves.easeInOutCubic;

    var tween = Tween(begin: begin, end: end)
        .chain(CurveTween(curve: curve));

    return SlideTransition(
      position: animation.drive(tween),
      child: child,
    );
  }

  /// Modal bottom sheet transition - Slide from bottom
  /// Duration: 350ms
  /// Use case: Modal screens
  static Widget modalSheet(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    const begin = Offset(0.0, 1.0);
    const end = Offset.zero;
    const curve = Curves.easeOutCubic;

    var tween = Tween(begin: begin, end: end)
        .chain(CurveTween(curve: curve));

    return SlideTransition(
      position: animation.drive(tween),
      child: child,
    );
  }

  /// Hero transition builder
  /// Duration: 600ms
  /// Use case: Shared element animations
  static Widget heroTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: Curves.easeInOut,
      ),
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.95, end: 1.0).animate(
          CurvedAnimation(
            parent: animation,
            curve: Curves.easeOutCubic,
          ),
        ),
        child: child,
      ),
    );
  }

  /// Role morph transition - Color shift + fade
  /// Duration: 500ms  
  /// Use case: Role switching animation
  static Widget roleMorph(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: const Interval(0.0, 0.5, curve: Curves.easeOut),
      ),
      child: FadeTransition(
        opacity: Tween<double>(begin: 0.0, end: 1.0).animate(
          CurvedAnimation(
            parent: animation,
            curve: const Interval(0.5, 1.0, curve: Curves.easeIn),
          ),
        ),
        child: child,
      ),
    );
  }

  /// Role morph builder for AnimatedSwitcher
  /// Signature matches AnimatedSwitcher.transitionBuilder
  static Widget roleMorphBuilder(Widget child, Animation<double> animation) {
    return FadeTransition(
      opacity: CurvedAnimation(
        parent: animation,
        curve: const Interval(0.0, 1.0, curve: Curves.easeInOut),
      ),
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.95, end: 1.0).animate(
          CurvedAnimation(
            parent: animation,
            curve: Curves.easeOutCubic,
          ),
        ),
        child: child,
      ),
    );
  }

  /// Scale fade transition
  /// Duration: 400ms
  /// Use case: Cards expanding to full screens
  static Widget scaleFade(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return FadeTransition(
      opacity: animation,
      child: ScaleTransition(
        scale: Tween<double>(begin: 0.9, end: 1.0).animate(
          CurvedAnimation(
            parent: animation,
            curve: Curves.easeOutCubic,
          ),
        ),
        child: child,
      ),
    );
  }

  /// No transition - Instant
  /// Duration: 0ms
  /// Use case: When animation should be skipped
  static Widget noTransition(
    BuildContext context,
    Animation<double> animation,
    Animation<double> secondaryAnimation,
    Widget child,
  ) {
    return child;
  }
}

/// Duration constants for transitions
class TransitionDurations {
  static const Duration tabSwitch = Duration(milliseconds: 300);
  static const Duration screenPush = Duration(milliseconds: 400);
  static const Duration modalSheet = Duration(milliseconds: 350);
  static const Duration heroAnimation = Duration(milliseconds: 600);
  static const Duration roleMorph = Duration(milliseconds: 500);
  static const Duration scaleFade = Duration(milliseconds: 400);
}

/// Curve constants for transitions
class TransitionCurves {
  static const Curve standard = Curves.easeInOutCubic;
  static const Curve emphasized = Curves.easeOutCubic;
  static const Curve decelerated = Curves.easeOut;
  static const Curve accelerated = Curves.easeIn;
}
