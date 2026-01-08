import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// AnchorOrbLayer - Central Mojo Orb with pulsing glow animation
class AnchorOrbLayer extends StatefulWidget {
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final Color primaryColor;
  final double size;

  const AnchorOrbLayer({
    super.key,
    this.onTap,
    this.onLongPress,
    this.primaryColor = const Color(0xFF8B5CF6),
    this.size = 56,
  });

  @override
  State<AnchorOrbLayer> createState() => _AnchorOrbLayerState();
}

class _AnchorOrbLayerState extends State<AnchorOrbLayer>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _pulseAnimation,
      builder: (context, child) {
        return GestureDetector(
          onTap: () {
            HapticFeedback.mediumImpact();
            widget.onTap?.call();
          },
          onLongPress: () {
            HapticFeedback.heavyImpact();
            widget.onLongPress?.call();
          },
          child: Transform.scale(
            scale: _pulseAnimation.value,
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    widget.primaryColor,
                    widget.primaryColor.withValues(alpha: 0.8),
                  ],
                ),
                boxShadow: [
                  BoxShadow(
                    color: widget.primaryColor.withValues(alpha: 0.6 * _pulseAnimation.value),
                    blurRadius: 20 * _pulseAnimation.value,
                    spreadRadius: 4 * _pulseAnimation.value,
                  ),
                ],
              ),
              child: Icon(Icons.add, color: Colors.white, size: widget.size * 0.5),
            ),
          ),
        );
      },
    );
  }
}
