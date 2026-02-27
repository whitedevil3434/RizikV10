import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// SpreadIcon - ↗️ Paper Airplane With Particle Trail
/// Share icon that launches with particle trail animation
class SpreadIcon extends StatefulWidget {
  final int shareCount;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final Color activeColor;
  final Color inactiveColor;
  final double size;

  const SpreadIcon({
    super.key,
    this.shareCount = 0,
    this.onTap,
    this.onLongPress,
    this.activeColor = const Color(0xFF6366F1),
    this.inactiveColor = const Color(0xFFACACAE),
    this.size = 28,
  });

  @override
  State<SpreadIcon> createState() => _SpreadIconState();
}

class _SpreadIconState extends State<SpreadIcon> with TickerProviderStateMixin {
  late AnimationController _launchController;
  late AnimationController _trailController;

  late Animation<double> _rotationAnimation;
  late Animation<double> _translateAnimation;
  late Animation<double> _scaleAnimation;

  bool _isLaunching = false;

  @override
  void initState() {
    super.initState();

    // Launch animation
    _launchController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );

    // Trail particles
    _trailController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    // Rotation: 0° → 15° → 0°
    _rotationAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 15.0), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 15.0, end: 0.0), weight: 50),
    ]).animate(
        CurvedAnimation(parent: _launchController, curve: Curves.easeOutBack));

    // Translation: slight move up-right
    _translateAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: -5.0), weight: 50),
      TweenSequenceItem(tween: Tween(begin: -5.0, end: 0.0), weight: 50),
    ]).animate(
        CurvedAnimation(parent: _launchController, curve: Curves.easeOutCubic));

    // Scale pulse
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.9), weight: 20),
      TweenSequenceItem(tween: Tween(begin: 0.9, end: 1.1), weight: 40),
      TweenSequenceItem(tween: Tween(begin: 1.1, end: 1.0), weight: 40),
    ]).animate(
        CurvedAnimation(parent: _launchController, curve: Curves.easeOutBack));
  }

  @override
  void dispose() {
    _launchController.dispose();
    _trailController.dispose();
    super.dispose();
  }

  void _handleTap() {
    setState(() => _isLaunching = true);
    HapticFeedback.mediumImpact();

    _launchController.forward().then((_) {
      _launchController.reset();
      _trailController.forward().then((_) {
        _trailController.reset();
        setState(() => _isLaunching = false);
      });
    });

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
        animation: Listenable.merge([_launchController, _trailController]),
        builder: (context, child) {
          return Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Transform.translate(
                offset: Offset(
                    _translateAnimation.value, _translateAnimation.value),
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Transform.rotate(
                    angle: _rotationAnimation.value * (math.pi / 180),
                    child: Image.asset(
                      'assets/icons/spread_icon.png',
                      width: widget.size,
                      height: widget.size,
                      fit: BoxFit.contain,
                      color: _isLaunching
                          ? widget.activeColor
                          : widget.inactiveColor,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 4),
              Text(
                _formatCount(widget.shareCount),
                style: TextStyle(
                  color: widget.inactiveColor,
                  fontSize: 11,
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
