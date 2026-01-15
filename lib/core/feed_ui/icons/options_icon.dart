import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// OptionsIcon - ⋯ Creative Three-Dot Menu
/// Animated dots with morphing effect
class OptionsIcon extends StatefulWidget {
  final VoidCallback? onTap;
  final VoidCallback? onLongPress;
  final Color color;
  final double size;

  const OptionsIcon({
    super.key,
    this.onTap,
    this.onLongPress,
    this.color = const Color(0xFFACACAE),
    this.size = 28,
  });

  @override
  State<OptionsIcon> createState() => _OptionsIconState();
}

class _OptionsIconState extends State<OptionsIcon> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _rotateAnimation;
  
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 200),
    );
    
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.85).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
    
    _rotateAnimation = Tween<double>(begin: 0.0, end: 0.25).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    setState(() => _isPressed = true);
    _controller.forward();
    HapticFeedback.lightImpact();
  }

  void _handleTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _controller.reverse();
    widget.onTap?.call();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: _handleTapDown,
      onTapUp: _handleTapUp,
      onTapCancel: _handleTapCancel,
      onLongPress: () {
        HapticFeedback.heavyImpact();
        widget.onLongPress?.call();
      },
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Transform.rotate(
              angle: _rotateAnimation.value,
              child: CustomPaint(
                painter: _OptionsDotsPainter(
                  color: widget.color,
                  isPressed: _isPressed,
                ),
                size: Size(widget.size, widget.size),
              ),
            ),
          );
        },
      ),
    );
  }
}

/// CustomPainter for Three Dots
class _OptionsDotsPainter extends CustomPainter {
  final Color color;
  final bool isPressed;

  _OptionsDotsPainter({
    required this.color,
    required this.isPressed,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    
    final dotRadius = size.width * 0.12;
    final spacing = size.width * 0.25;
    final centerY = size.height / 2;
    final centerX = size.width / 2;
    
    // Three horizontal dots
    for (int i = -1; i <= 1; i++) {
      final x = centerX + (i * spacing);
      
      // Slightly larger middle dot when pressed
      final radius = isPressed && i == 0 ? dotRadius * 1.2 : dotRadius;
      
      canvas.drawCircle(Offset(x, centerY), radius, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _OptionsDotsPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.isPressed != isPressed;
  }
}
