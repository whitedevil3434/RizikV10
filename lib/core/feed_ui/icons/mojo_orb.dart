import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// MojoOrb - 🔮 Liquid Plasma Blob
/// Central AI orb with organic morphing shape, plasma trails, and state-based animations
class MojoOrb extends StatefulWidget {
  final MojoOrbState orbState;
  final VoidCallback? onTap;
  final VoidCallback? onDoubleTap;
  final VoidCallback? onLongPress;
  final Color primaryColor;
  final double size;

  const MojoOrb({
    super.key,
    this.orbState = MojoOrbState.idle,
    this.onTap,
    this.onDoubleTap,
    this.onLongPress,
    this.primaryColor = const Color(0xFF8B5CF6),
    this.size = 64,
  });

  @override
  State<MojoOrb> createState() => _MojoOrbState();
}

enum MojoOrbState {
  idle,       // Subtle pulsing, waiting
  listening,  // Expanded, sound waves
  thinking,   // Rotating particles
  roleSwitch, // Color morphing
}

class _MojoOrbState extends State<MojoOrb> with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _morphController;
  late AnimationController _particleController;
  
  late Animation<double> _pulseAnimation;
  late Animation<double> _morphAnimation;
  
  @override
  void initState() {
    super.initState();
    
    // Pulsing glow (idle state)
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
    
    // Organic morph (blob shape change)
    _morphController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat();
    
    // Particle rotation (thinking state)
    _particleController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 4000),
    )..repeat();
    
    _pulseAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    
    _morphAnimation = Tween<double>(begin: 0.0, end: 2 * math.pi).animate(
      CurvedAnimation(parent: _morphController, curve: Curves.linear),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _morphController.dispose();
    _particleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        widget.onTap?.call();
      },
      onDoubleTap: () {
        HapticFeedback.heavyImpact();
        widget.onDoubleTap?.call();
      },
      onLongPress: () {
        HapticFeedback.heavyImpact();
        widget.onLongPress?.call();
      },
      child: AnimatedBuilder(
        animation: Listenable.merge([
          _pulseController,
          _morphController,
          _particleController,
        ]),
        builder: (context, child) {
          return Container(
            width: widget.size + 20,
            height: widget.size + 20,
            child: CustomPaint(
              painter: _MojoOrbPainter(
                primaryColor: widget.primaryColor,
                pulseValue: _pulseAnimation.value,
                morphPhase: _morphAnimation.value,
                particlePhase: _particleController.value,
                state: widget.orbState,
                size: widget.size,
              ),
              size: Size(widget.size + 20, widget.size + 20),
            ),
          );
        },
      ),
    );
  }
}

/// CustomPainter for Liquid Plasma Orb
class _MojoOrbPainter extends CustomPainter {
  final Color primaryColor;
  final double pulseValue;
  final double morphPhase;
  final double particlePhase;
  final MojoOrbState state;
  final double size;

  _MojoOrbPainter({
    required this.primaryColor,
    required this.pulseValue,
    required this.morphPhase,
    required this.particlePhase,
    required this.state,
    required this.size,
  });

  @override
  void paint(Canvas canvas, Size canvasSize) {
    final center = Offset(canvasSize.width / 2, canvasSize.height / 2);
    final baseRadius = size / 2;
    
    // Outer glow
    _drawOuterGlow(canvas, center, baseRadius);
    
    // Main orb (organic blob shape)
    _drawOrganicBlob(canvas, center, baseRadius);
    
    // Inner eye/core
    _drawInnerCore(canvas, center, baseRadius);
    
    // State-specific effects
    switch (state) {
      case MojoOrbState.listening:
        _drawSoundWaves(canvas, center, baseRadius);
        break;
      case MojoOrbState.thinking:
        _drawRotatingParticles(canvas, center, baseRadius);
        break;
      case MojoOrbState.roleSwitch:
        _drawColorMorphRing(canvas, center, baseRadius);
        break;
      case MojoOrbState.idle:
        _drawPlasmaTrails(canvas, center, baseRadius);
        break;
    }
  }

  void _drawOuterGlow(Canvas canvas, Offset center, double radius) {
    final glowPaint = Paint()
      ..color = primaryColor.withValues(alpha: 0.3 * pulseValue)
      ..maskFilter = MaskFilter.blur(BlurStyle.normal, 20 * pulseValue);
    
    canvas.drawCircle(center, radius * 1.2 * pulseValue, glowPaint);
  }

  void _drawOrganicBlob(Canvas canvas, Offset center, double radius) {
    final path = Path();
    final points = 60;
    
    for (int i = 0; i <= points; i++) {
      final angle = (i / points) * 2 * math.pi;
      
      // Organic wobble based on morphPhase
      final wobble = math.sin(angle * 3 + morphPhase) * 3 +
                     math.cos(angle * 2 - morphPhase * 0.7) * 2;
      
      final r = radius + wobble * pulseValue;
      final x = center.dx + r * math.cos(angle);
      final y = center.dy + r * math.sin(angle);
      
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    
    // Gradient fill
    final gradient = RadialGradient(
      colors: [
        primaryColor.withValues(alpha: 0.9),
        primaryColor.withValues(alpha: 0.7),
        primaryColor.withValues(alpha: 0.5),
      ],
      stops: const [0.0, 0.6, 1.0],
    );
    
    final paint = Paint()
      ..shader = gradient.createShader(
        Rect.fromCircle(center: center, radius: radius),
      );
    
    canvas.drawPath(path, paint);
    
    // Subtle border glow
    final borderPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    
    canvas.drawPath(path, borderPaint);
  }

  void _drawInnerCore(Canvas canvas, Offset center, double radius) {
    // Bright center "eye"
    final corePaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.9 * pulseValue);
    
    canvas.drawCircle(center, radius * 0.15, corePaint);
    
    // Inner ring
    final ringPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    
    canvas.drawCircle(center, radius * 0.3, ringPaint);
  }

  void _drawPlasmaTrails(Canvas canvas, Offset center, double radius) {
    final trailPaint = Paint()
      ..color = Colors.white.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;
    
    // 3 plasma trails orbiting
    for (int i = 0; i < 3; i++) {
      final angle = morphPhase + (i * 2 * math.pi / 3);
      final trailRadius = radius * 0.6;
      
      final start = Offset(
        center.dx + trailRadius * math.cos(angle),
        center.dy + trailRadius * math.sin(angle),
      );
      final end = Offset(
        center.dx + trailRadius * math.cos(angle + 0.5),
        center.dy + trailRadius * math.sin(angle + 0.5),
      );
      
      canvas.drawLine(start, end, trailPaint);
    }
  }

  void _drawSoundWaves(Canvas canvas, Offset center, double radius) {
    for (int i = 0; i < 3; i++) {
      final waveProgress = (particlePhase + i * 0.33) % 1.0;
      final waveRadius = radius + (waveProgress * radius * 0.5);
      final alpha = (1.0 - waveProgress) * 0.5;
      
      final wavePaint = Paint()
        ..color = primaryColor.withValues(alpha: alpha)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;
      
      canvas.drawCircle(center, waveRadius, wavePaint);
    }
  }

  void _drawRotatingParticles(Canvas canvas, Offset center, double radius) {
    final particlePaint = Paint()..style = PaintingStyle.fill;
    
    final colors = [
      const Color(0xFFFFD93D),
      const Color(0xFF4ECDC4),
      primaryColor,
    ];
    
    for (int i = 0; i < 8; i++) {
      final angle = (particlePhase * 2 * math.pi) + (i * math.pi / 4);
      final distance = radius * 0.7;
      
      final px = center.dx + distance * math.cos(angle);
      final py = center.dy + distance * math.sin(angle);
      
      particlePaint.color = colors[i % colors.length].withValues(alpha: 0.8);
      canvas.drawCircle(Offset(px, py), 3, particlePaint);
    }
  }

  void _drawColorMorphRing(Canvas canvas, Offset center, double radius) {
    final ringPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4.0;
    
    // Gradient ring that shifts color
    final colors = [
      const Color(0xFF6366F1), // Seeker
      const Color(0xFF22C55E), // Force
      const Color(0xFFF59E0B), // Source
    ];
    
    final colorIndex = (particlePhase * 3).floor() % 3;
    ringPaint.color = colors[colorIndex].withValues(alpha: 0.8);
    
    canvas.drawCircle(center, radius * 0.9, ringPaint);
  }

  @override
  bool shouldRepaint(covariant _MojoOrbPainter oldDelegate) {
    return oldDelegate.pulseValue != pulseValue ||
           oldDelegate.morphPhase != morphPhase ||
           oldDelegate.particlePhase != particlePhase ||
           oldDelegate.state != state;
  }
}
