import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// SaveIcon - 🔖 Ribbon That Folds
/// Bookmark icon with fold animation and star reveal
class SaveIcon extends StatefulWidget {
  final bool isSaved;
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final Color activeColor;
  final Color inactiveColor;
  final double size;

  const SaveIcon({
    super.key,
    this.isSaved = false,
    this.onTap,
    this.onLongPress,
    this.activeColor = const Color(0xFFFFD700),
    this.inactiveColor = const Color(0xFFACACAE),
    this.size = 28,
  });

  @override
  State<SaveIcon> createState() => _SaveIconState();
}

class _SaveIconState extends State<SaveIcon> with TickerProviderStateMixin {
  late AnimationController _foldController;
  late AnimationController _starController;
  
  late Animation<double> _foldAnimation;
  late Animation<double> _starScaleAnimation;
  late Animation<double> _starRotateAnimation;

  @override
  void initState() {
    super.initState();
    
    // Fold animation
    _foldController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    
    // Star reveal animation
    _starController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    
    // Fold inward: 0 → 1 (ribbon folds in)
    _foldAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _foldController, curve: Curves.easeInOutCubic),
    );
    
    // Star pops in
    _starScaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 1.3), weight: 60),
      TweenSequenceItem(tween: Tween(begin: 1.3, end: 1.0), weight: 40),
    ]).animate(CurvedAnimation(parent: _starController, curve: Curves.elasticOut));
    
    // Star rotates slightly
    _starRotateAnimation = Tween<double>(begin: -0.2, end: 0.0).animate(
      CurvedAnimation(parent: _starController, curve: Curves.easeOutBack),
    );
    
    if (widget.isSaved) {
      _foldController.value = 1.0;
      _starController.value = 1.0;
    }
  }

  @override
  void didUpdateWidget(SaveIcon oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isSaved != oldWidget.isSaved) {
      if (widget.isSaved) {
        _foldController.forward();
        Future.delayed(const Duration(milliseconds: 150), () {
          _starController.forward();
        });
      } else {
        _starController.reverse();
        Future.delayed(const Duration(milliseconds: 150), () {
          _foldController.reverse();
        });
      }
    }
  }

  @override
  void dispose() {
    _foldController.dispose();
    _starController.dispose();
    super.dispose();
  }

  void _handleTap() {
    HapticFeedback.mediumImpact();
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
        animation: Listenable.merge([_foldController, _starController]),
        builder: (context, child) {
          return CustomPaint(
            painter: _SaveRibbonPainter(
              activeColor: widget.activeColor,
              inactiveColor: widget.inactiveColor,
              foldProgress: _foldAnimation.value,
              starScale: _starScaleAnimation.value,
              starRotation: _starRotateAnimation.value,
              isSaved: widget.isSaved,
            ),
            size: Size(widget.size, widget.size * 1.2),
          );
        },
      ),
    );
  }
}

/// CustomPainter for Ribbon Bookmark with Star
class _SaveRibbonPainter extends CustomPainter {
  final Color activeColor;
  final Color inactiveColor;
  final double foldProgress;
  final double starScale;
  final double starRotation;
  final bool isSaved;

  _SaveRibbonPainter({
    required this.activeColor,
    required this.inactiveColor,
    required this.foldProgress,
    required this.starScale,
    required this.starRotation,
    required this.isSaved,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final color = Color.lerp(inactiveColor, activeColor, foldProgress)!;
    
    final fillPaint = Paint()
      ..color = color.withValues(alpha: 0.3 + foldProgress * 0.7)
      ..style = PaintingStyle.fill;
    
    final strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    // Ribbon shape
    final ribbonPath = Path();
    
    // Top edge
    ribbonPath.moveTo(size.width * 0.15, 0);
    ribbonPath.lineTo(size.width * 0.85, 0);
    
    // Right edge
    ribbonPath.lineTo(size.width * 0.85, size.height * 0.75);
    
    // Bottom V-notch (folds inward based on progress)
    final notchDepth = size.height * 0.25 * (1.0 - foldProgress * 0.5);
    ribbonPath.lineTo(size.width * 0.5, size.height * 0.75 - notchDepth);
    
    // Left side of V
    ribbonPath.lineTo(size.width * 0.15, size.height * 0.75);
    
    // Close path
    ribbonPath.close();
    
    // Draw ribbon
    canvas.drawPath(ribbonPath, fillPaint);
    canvas.drawPath(ribbonPath, strokePaint);
    
    // Draw star when saved
    if (isSaved && starScale > 0) {
      canvas.save();
      canvas.translate(size.width * 0.5, size.height * 0.35);
      canvas.rotate(starRotation);
      canvas.scale(starScale);
      
      _drawStar(canvas, Size(size.width * 0.4, size.width * 0.4));
      
      canvas.restore();
    }
  }

  void _drawStar(Canvas canvas, Size starSize) {
    final paint = Paint()
      ..color = activeColor
      ..style = PaintingStyle.fill;
    
    final path = Path();
    final cx = 0.0;
    final cy = 0.0;
    final outerRadius = starSize.width / 2;
    final innerRadius = outerRadius * 0.4;
    
    for (int i = 0; i < 10; i++) {
      final angle = (i * 36 - 90) * (3.14159 / 180);
      final radius = i.isEven ? outerRadius : innerRadius;
      final x = cx + radius * _cos(angle);
      final y = cy + radius * _sin(angle);
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    
    canvas.drawPath(path, paint);
  }
  
  double _cos(double angle) => angle == 0 ? 1 : (angle * 180 / 3.14159).abs() < 0.0001 ? 1 : _cosine(angle);
  double _sin(double angle) => angle == 0 ? 0 : _sine(angle);
  double _cosine(double x) {
    double result = 1;
    double term = 1;
    for (int i = 1; i <= 10; i++) {
      term *= -x * x / ((2 * i - 1) * (2 * i));
      result += term;
    }
    return result;
  }
  double _sine(double x) {
    double result = x;
    double term = x;
    for (int i = 1; i <= 10; i++) {
      term *= -x * x / ((2 * i) * (2 * i + 1));
      result += term;
    }
    return result;
  }

  @override
  bool shouldRepaint(covariant _SaveRibbonPainter oldDelegate) {
    return oldDelegate.foldProgress != foldProgress ||
           oldDelegate.starScale != starScale ||
           oldDelegate.starRotation != starRotation ||
           oldDelegate.isSaved != isSaved;
  }
}
