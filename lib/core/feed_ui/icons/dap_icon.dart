import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// DapIcon - 🤜🏻💥🤛🏻 Exact Fist Bump from Asset
/// Uses processed asset image directly for 100% accuracy
class DapIcon extends StatefulWidget {
  final bool isDapped;
  final int dapCount;
  final VoidCallback? onDap;
  final VoidCallback? onLongPress;
  final Color activeColor;
  final Color inactiveColor;
  final double size;

  const DapIcon({
    super.key,
    this.isDapped = false,
    this.dapCount = 0,
    this.onDap,
    this.onLongPress,
    this.activeColor = const Color(0xFFFF6B6B),
    this.inactiveColor = Colors.white,
    this.size = 38,
  });

  @override
  State<DapIcon> createState() => _DapIconState();
}

class _DapIconState extends State<DapIcon> with TickerProviderStateMixin {
  late AnimationController _impactController;
  late AnimationController _glowController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    
    _impactController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.3), weight: 50), // Bigger bounce
      TweenSequenceItem(tween: Tween(begin: 1.3, end: 1.0), weight: 50),
    ]).animate(CurvedAnimation(parent: _impactController, curve: Curves.easeOutBack));
    
    _glowAnimation = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );
    
    if (widget.isDapped) {
      _glowController.repeat(reverse: true);
    }
  }

  @override
  void didUpdateWidget(DapIcon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isDapped != oldWidget.isDapped) {
      if (widget.isDapped) {
        _glowController.repeat(reverse: true);
      } else {
        _glowController.stop();
        _glowController.reset();
      }
    }
  }

  @override
  void dispose() {
    _impactController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  void _handleTap() {
    _impactController.forward().then((_) => _impactController.reset());
    HapticFeedback.mediumImpact();
    widget.onDap?.call();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.isDapped ? widget.activeColor : widget.inactiveColor;
    
    return GestureDetector(
      onTap: _handleTap,
      onLongPress: () {
        HapticFeedback.heavyImpact();
        widget.onLongPress?.call();
      },
      child: AnimatedBuilder(
        animation: Listenable.merge([_impactController, _glowController]),
        builder: (context, child) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Transform.scale(
                scale: _scaleAnimation.value,
                child: Container(
                  width: widget.size + 14,
                  height: widget.size + 10,
                  decoration: widget.isDapped
                      ? BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: color.withValues(alpha: 0.4 * _glowAnimation.value),
                              blurRadius: 25,
                              spreadRadius: 2,
                            ),
                          ],
                        )
                      : null,
                  // Using Image Asset Directly
                  child: Image.asset(
                    'assets/icons/dap_green_circle.png',
                    fit: BoxFit.contain,
                    width: widget.size + 14,
                    height: widget.size + 14,
                  ),
                ),
              ),
              const SizedBox(height: 2),
              Text(
                _formatCount(widget.dapCount),
                style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
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
