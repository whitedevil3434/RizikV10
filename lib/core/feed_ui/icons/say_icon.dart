import 'dart:math' as math;
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
                child: CustomPaint(
                  painter: _LoudspeakerPainter(
                    color: widget.inactiveColor,
                  ),
                  size: Size(widget.size + 8, widget.size + 4),
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

/// Hand-Held Loudspeaker/Megaphone Painter 📢
class _LoudspeakerPainter extends CustomPainter {
  final Color color;

  _LoudspeakerPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final cx = size.width / 2;
    final cy = size.height / 2;
    
    // ====== MEGAPHONE BODY (cone shape) 📢 ======
    // The cone from left (narrow) to right (wide)
    final megaphonePath = Path();
    
    // Handle/narrow end (left side)
    final handleX = cx - size.width * 0.35;
    final handleTopY = cy - size.height * 0.12;
    final handleBottomY = cy + size.height * 0.12;
    
    // Bell/wide end (right side)
    final bellX = cx + size.width * 0.35;
    final bellTopY = cy - size.height * 0.35;
    final bellBottomY = cy + size.height * 0.35;
    
    // Draw cone shape
    megaphonePath.moveTo(handleX, handleTopY);
    megaphonePath.lineTo(bellX, bellTopY);
    megaphonePath.lineTo(bellX, bellBottomY);
    megaphonePath.lineTo(handleX, handleBottomY);
    megaphonePath.close();
    
    canvas.drawPath(megaphonePath, paint);
    
    // Bell rim (edge at wide end)
    final rimPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5;
    
    canvas.drawLine(
      Offset(bellX, bellTopY),
      Offset(bellX, bellBottomY),
      rimPaint,
    );
    
    // ====== HANDLE (grip on left) ======
    final handleRect = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(handleX - size.width * 0.08, cy),
        width: size.width * 0.12,
        height: size.height * 0.35,
      ),
      Radius.circular(size.width * 0.06),
    );
    canvas.drawRRect(handleRect, paint);
    
    // ====== HAND (holding the handle) ======
    // Fingers wrapped around handle
    final fingerWidth = size.width * 0.06;
    final fingerHeight = size.height * 0.08;
    
    // 3 fingers
    for (int i = 0; i < 3; i++) {
      final fingerY = cy - size.height * 0.12 + (i * fingerHeight * 1.4);
      canvas.drawRRect(
        RRect.fromRectAndRadius(
          Rect.fromCenter(
            center: Offset(handleX - size.width * 0.18, fingerY),
            width: fingerWidth * 1.5,
            height: fingerHeight,
          ),
          Radius.circular(fingerWidth / 2),
        ),
        paint,
      );
    }
    
    // Thumb (on top)
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(handleX - size.width * 0.04, cy - size.height * 0.2),
          width: fingerWidth * 1.2,
          height: fingerHeight * 0.9,
        ),
        Radius.circular(fingerWidth / 2),
      ),
      paint,
    );
    
    // ====== SOUND WAVES (right side) ======
    final wavePaint = Paint()
      ..color = color.withValues(alpha: 0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0
      ..strokeCap = StrokeCap.round;
    
    // Draw 2 curved sound wave lines
    for (int i = 0; i < 2; i++) {
      final waveRadius = size.width * 0.12 + (i * size.width * 0.1);
      canvas.drawArc(
        Rect.fromCenter(
          center: Offset(bellX + 4, cy),
          width: waveRadius,
          height: size.height * 0.5 + (i * size.height * 0.15),
        ),
        -math.pi / 2.5,
        math.pi / 1.25,
        false,
        wavePaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _LoudspeakerPainter oldDelegate) {
    return oldDelegate.color != color;
  }
}
