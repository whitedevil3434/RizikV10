import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/design_system.dart';

/// 🔘 RizikButton - Base Button Component
/// 
/// A sleek, pill-shaped button using Rizik Design System.
/// Supports primary and secondary variants with haptic feedback.
class RizikButton extends StatefulWidget {
  final String text;
  final VoidCallback? onTap;
  final bool isPrimary;
  final bool isLoading;
  final IconData? icon;
  final double? width;

  const RizikButton({
    super.key,
    required this.text,
    this.onTap,
    this.isPrimary = true,
    this.isLoading = false,
    this.icon,
    this.width,
  });

  @override
  State<RizikButton> createState() => _RizikButtonState();
}

class _RizikButtonState extends State<RizikButton> {
  bool _isPressed = false;

  @override
  Widget build(BuildContext context) {
    final isDisabled = widget.onTap == null || widget.isLoading;
    
    final backgroundColor = widget.isPrimary
        ? RizikDesign.primary
        : RizikDesign.surface;
    
    final textColor = widget.isPrimary
        ? RizikDesign.textOnPrimary
        : RizikDesign.primary;

    return GestureDetector(
      onTapDown: isDisabled ? null : (_) => setState(() => _isPressed = true),
      onTapUp: isDisabled ? null : (_) => setState(() => _isPressed = false),
      onTapCancel: isDisabled ? null : () => setState(() => _isPressed = false),
      onTap: isDisabled ? null : widget.onTap,
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: RizikDesign.durationFast,
        curve: RizikDesign.curveSnappy,
        child: Container(
          width: widget.width,
          height: 48,
          decoration: BoxDecoration(
            color: isDisabled
                ? backgroundColor.withOpacity(0.5)
                : backgroundColor,
            borderRadius: RizikDesign.radiusPill,
            border: widget.isPrimary
                ? null
                : Border.all(color: RizikDesign.primary, width: 2),
            boxShadow: isDisabled || !widget.isPrimary
                ? null
                : [
                    BoxShadow(
                      color: RizikDesign.primary.withOpacity(0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
          ),
          child: Center(
            child: widget.isLoading
                ? SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation(textColor),
                    ),
                  )
                : Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (widget.icon != null) ...[
                        Icon(widget.icon, color: textColor, size: 20),
                        const SizedBox(width: RizikDesign.spacing8),
                      ],
                      Text(
                        widget.text,
                        style: RizikDesign.textButton.copyWith(color: textColor),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }
}
