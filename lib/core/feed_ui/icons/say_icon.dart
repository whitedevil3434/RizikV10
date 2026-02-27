import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// SayIcon - 📢 Hand-Held Megaphone/Loudspeaker
/// A hand holding a megaphone - clear "announce/speak" indicator
class SayIcon extends StatefulWidget {
  final int commentCount;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final Color activeColor;
  final Color inactiveColor;
  final double size;

  const SayIcon({
    super.key,
    this.commentCount = 0,
    this.onTap,
    this.onLongPress,
    this.activeColor = const Color(0xFF4ECDC4),
    this.inactiveColor = Colors.white,
    this.size = 28,
  });

  @override
  State<SayIcon> createState() => _SayIconState();
}

class _SayIconState extends State<SayIcon> with SingleTickerProviderStateMixin {
  late AnimationController _scaleController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();

    _scaleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(parent: _scaleController, curve: Curves.easeOutBack),
    );
  }

  @override
  void dispose() {
    _scaleController.dispose();
    super.dispose();
  }

  void _handleTap() {
    _scaleController.forward().then((_) => _scaleController.reverse());
    HapticFeedback.lightImpact();
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      onLongPress: () {
        HapticFeedback.heavyImpact();
        widget.onLongPress?.call();
      },
      child: AnimatedBuilder(
        animation: _scaleController,
        builder: (context, child) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Transform.scale(
                scale: _scaleAnimation.value,
                child: Image.asset(
                  'assets/icons/say_icon.png',
                  width: widget.size + 8,
                  height: widget.size + 4,
                  fit: BoxFit.contain,
                  color: widget.inactiveColor,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _formatCount(widget.commentCount),
                style: TextStyle(
                  color: widget.inactiveColor,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  String _formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return count.toString();
  }
}
