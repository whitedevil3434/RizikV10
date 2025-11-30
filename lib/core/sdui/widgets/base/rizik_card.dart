import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/design_system.dart';

/// 🎴 RizikCard - Base Card Component
/// 
/// A beautiful, consistent card widget using Rizik Design System.
/// All cards in the app should use this component.
class RizikCard extends StatelessWidget {
  final Widget child;
  final Color? color;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final bool elevated;
  final double? width;
  final double? height;

  const RizikCard({
    super.key,
    required this.child,
    this.color,
    this.padding,
    this.margin,
    this.onTap,
    this.elevated = false,
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final decoration = elevated
        ? RizikDesign.cardElevated
        : RizikDesign.cardDecoration;

    final cardContent = Container(
      width: width,
      height: height,
      padding: padding ?? const EdgeInsets.all(RizikDesign.spacing16),
      margin: margin,
      decoration: color != null
          ? decoration.copyWith(color: color)
          : decoration,
      child: child,
    );

    if (onTap != null) {
      return Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: RizikDesign.radiusLarge,
          child: cardContent,
        ),
      );
    }

    return cardContent;
  }
}
