import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/design_system.dart';

/// ✨ RizikIcon - Base Icon Component
/// 
/// A consistent icon wrapper using Rizik Design System.
/// Supports semantic colors and animation.
class RizikIcon extends StatelessWidget {
  final IconData icon;
  final Color? color;
  final double? size;
  final bool animate;

  const RizikIcon({
    super.key,
    required this.icon,
    this.color,
    this.size,
    this.animate = false,
  });

  /// Named constructor for semantic icons
  const RizikIcon.primary({
    super.key,
    required this.icon,
    this.size,
    this.animate = false,
  }) : color = RizikDesign.primary;

  const RizikIcon.accent({
    super.key,
    required this.icon,
    this.size,
    this.animate = false,
  }) : color = RizikDesign.accent;

  const RizikIcon.success({
    super.key,
    required this.icon,
    this.size,
    this.animate = false,
  }) : color = RizikDesign.success;

  const RizikIcon.error({
    super.key,
    required this.icon,
    this.size,
    this.animate = false,
  }) : color = RizikDesign.error;

  const RizikIcon.warning({
    super.key,
    required this.icon,
    this.size,
    this.animate = false,
  }) : color = RizikDesign.warning;

  @override
  Widget build(BuildContext context) {
    final iconWidget = Icon(
      icon,
      color: color ?? RizikDesign.textPrimary,
      size: size ?? 24,
    );

    if (!animate) {
      return iconWidget;
    }

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: 1.0),
      duration: RizikDesign.durationNormal,
      curve: RizikDesign.curveDefault,
      builder: (context, value, child) {
        return Transform.scale(
          scale: value,
          child: Opacity(
            opacity: value,
            child: child,
          ),
        );
      },
      child: iconWidget,
    );
  }
}

/// 🎯 RizikIconButton - Interactive Icon Button
class RizikIconButton extends StatefulWidget {
  final IconData icon;
  final VoidCallback? onTap;
  final Color? color;
  final double? size;
  final String? tooltip;

  const RizikIconButton({
    super.key,
    required this.icon,
    this.onTap,
    this.color,
    this.size,
    this.tooltip,
  });

  @override
  State<RizikIconButton> createState() => _RizikIconButtonState();
}

class _RizikIconButtonState extends State<RizikIconButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final button = GestureDetector(
      onTapDown: (_) => setState(() => _isPressed = true),
      onTapUp: (_) => setState(() => _isPressed = false),
      onTapCancel: () => setState(() => _isPressed = false),
      onTap: widget.onTap,
      child: AnimatedScale(
        scale: _isPressed ? 0.9 : 1.0,
        duration: RizikDesign.durationFast,
        curve: RizikDesign.curveSnappy,
        child: Container(
          padding: const EdgeInsets.all(RizikDesign.spacing8),
          decoration: BoxDecoration(
            color: _isPressed
                ? RizikDesign.overlay
                : Colors.transparent,
            borderRadius: RizikDesign.radiusSmall,
          ),
          child: RizikIcon(
            icon: widget.icon,
            color: widget.color,
            size: widget.size,
          ),
        ),
      ),
    );

    if (widget.tooltip != null) {
      return Tooltip(
        message: widget.tooltip!,
        child: button,
      );
    }

    return button;
  }
}
