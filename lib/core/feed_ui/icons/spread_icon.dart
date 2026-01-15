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
    ]).animate(CurvedAnimation(parent: _launchController, curve: Curves.easeOutBack));
    
    // Translation: slight move up-right
    _translateAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: -5.0), weight: 50),
      TweenSequenceItem(tween: Tween(begin: -5.0, end: 0.0), weight: 50),
    ]).animate(CurvedAnimation(parent: _launchController, curve: Curves.easeOutCubic));
    
    // Scale pulse
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 0.9), weight: 20),
      TweenSequenceItem(tween: Tween(begin: 0.9, end: 1.1), weight: 40),
      TweenSequenceItem(tween: Tween(begin: 1.1, end: 1.0), weight: 40),
    ]).animate(CurvedAnimation(parent: _launchController, curve: Curves.easeOutBack));
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
                offset: Offset(_translateAnimation.value, _translateAnimation.value),
                child: Transform.scale(
                  scale: _scaleAnimation.value,
                  child: Transform.rotate(
                    angle: _rotationAnimation.value * (math.pi / 180),
                    child: Image.asset(
                      'assets/icons/spread_icon.png',
                      width: widget.size,
                      height: widget.size,
                      fit: BoxFit.contain,
                      color: _isLaunching ? widget.activeColor : widget.inactiveColor,
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

/// CustomPainter for Paper Airplane
class _SpreadPlanePainter extends CustomPainter {
  final Color color;
  final double trailProgress;
  final bool isLaunching;

  _SpreadPlanePainter({
    required this.color,
    required this.trailProgress,
    required this.isLaunching,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill
      ..strokeCap = StrokeCap.round;

    final strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Paper airplane shape
    final path = Path();
    
    // Tip (top right)
    path.moveTo(size.width * 0.9, size.height * 0.1);
    
    // Bottom edge
    path.lineTo(size.width * 0.1, size.height * 0.55);
    
    // Fold line to center
    path.lineTo(size.width * 0.45, size.height * 0.5);
    
    // Bottom tip
    path.lineTo(size.width * 0.35, size.height * 0.85);
    
    // Back to fold
    path.lineTo(size.width * 0.45, size.height * 0.5);
    
    // Top edge back to tip
    path.lineTo(size.width * 0.9, size.height * 0.1);
    
    path.close();
    
    // Draw filled plane
    canvas.drawPath(path, paint);
    
    // Center fold line
    canvas.drawLine(
      Offset(size.width * 0.9, size.height * 0.1),
      Offset(size.width * 0.45, size.height * 0.5),
      strokePaint..color = color.withValues(alpha: 0.5),
    );

    // Particle trail when launching
    if (isLaunching && trailProgress > 0) {
      _drawTrailParticles(canvas, size);
    }
  }

  void _drawTrailParticles(Canvas canvas, Size size) {
    final sparkColors = [
      const Color(0xFFFFD93D),
      const Color(0xFF4ECDC4),
      Colors.white,
    ];
    
    for (int i = 0; i < 5; i++) {
      final progress = (trailProgress + i * 0.15) % 1.0;
      final alpha = (1.0 - progress) * 0.8;
      
      final paint = Paint()
        ..color = sparkColors[i % sparkColors.length].withValues(alpha: alpha)
        ..style = PaintingStyle.fill;
      
      // Trail behind the plane (bottom-left direction)
      final trailX = size.width * 0.3 - (progress * 15) - (i * 4);
      final trailY = size.height * 0.6 + (progress * 10) + (i * 3);
      
      canvas.drawCircle(
        Offset(trailX, trailY),
        3.0 * (1.0 - progress * 0.5),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _SpreadPlanePainter oldDelegate) {
    return oldDelegate.color != color ||
           oldDelegate.trailProgress != trailProgress ||
           oldDelegate.isLaunching != isLaunching;
  }
}
