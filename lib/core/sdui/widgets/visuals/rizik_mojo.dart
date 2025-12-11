import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
import 'package:rizik_v4/core/wrappers/haptic_feedback_wrapper.dart';

/// The "Rizik Liquid Soul" - A generative art visualizer for the AI.
/// Replaces the static Lottie animation with a physics-based, reactive orb.
class RizikMojo extends StatefulWidget {
  final double amplitude; // 0.0 to 1.0, drives the wave intensity
  final VoidCallback? onTap;

  const RizikMojo({
    super.key,
    this.amplitude = 0.0,
    this.onTap,
  });

  @override
  State<RizikMojo> createState() => _RizikMojoState();
}

class _RizikMojoState extends State<RizikMojo> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  // Wave parameters
  double _phase = 0.0;

  @override
  void initState() {
    super.initState();
    // Drives the continuous wave animation
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        final provider = ref.watch(mojoProvider);
        final state = provider.state;
        
        // Haptic Feedback Trigger (Side Effect)
        ref.listen(mojoProvider, (previous, next) {
          if (previous?.state != next.state) {
            switch (next.state) {
              case MojoState.listening:
              case MojoState.warning:
                HapticFeedbackWrapper().heavy();
                break;
              case MojoState.processing:
                HapticFeedbackWrapper().medium();
                break;
              case MojoState.speaking:
                HapticFeedbackWrapper().light();
                break;
              default:
                break;
            }
          }
        });

        // Determine target visual parameters based on state
        double targetAmplitude = widget.amplitude;
        Color coreColor = RizikBrandColors.brandPurple;
        double speedMultiplier = 1.0;

        switch (state) {
          case MojoState.listening:
            // High energy, reacting to input
            targetAmplitude = math.max(0.3, widget.amplitude * 1.5); 
            coreColor = Colors.cyanAccent;
            speedMultiplier = 2.0;
            break;
          case MojoState.speaking:
            // Rhythmic, expanding
            targetAmplitude = 0.4;
            coreColor = Colors.purpleAccent;
            speedMultiplier = 1.5;
            break;
          case MojoState.processing:
             // Deep thought, rotating colors
            targetAmplitude = 0.1;
            coreColor = Colors.deepPurple;
            speedMultiplier = 0.5;
            break;
          case MojoState.warning:
            // Spiky, Alert, Red
            targetAmplitude = 0.6; // High amplitude for spikes
            coreColor = Colors.redAccent;
            speedMultiplier = 3.0; // Fast jitter
            break;
          case MojoState.idle:
          default:
            // Gentle breathing
            targetAmplitude = 0.05;
            coreColor = RizikBrandColors.brandPurple;
            speedMultiplier = 0.8;
            break;
        }

        return GestureDetector(
          onTap: widget.onTap, // Keep existing interaction hook if needed
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              _phase += 0.05 * speedMultiplier; // Advance phase
              
              return CustomPaint(
                size: const Size(120, 120), // Standard size, scalable
                painter: _LiquidOrbPainter(
                  phase: _phase,
                  amplitude: targetAmplitude,
                  coreColor: coreColor,
                  state: state,
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class _LiquidOrbPainter extends CustomPainter {
  final double phase;
  final double amplitude;
  final Color coreColor;
  final MojoState state;

  _LiquidOrbPainter({
    required this.phase,
    required this.amplitude,
    required this.coreColor,
    required this.state,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // --- Layer 1: Background Glow (The Aura) ---
    final glowPaint = Paint()
      ..shader = RadialGradient(
        colors: [
          coreColor.withOpacity(0.4),
          Colors.transparent,
        ],
        stops: const [0.2, 1.0],
      ).createShader(Rect.fromCircle(center: center, radius: radius * 1.5));

    canvas.drawCircle(center, radius * 1.2, glowPaint);

    // --- Layer 2: Liquid Waves (The Ethereal Flow) ---
    // We draw 3 overlapping sine waves with different phases and colors
    
    _drawWave(canvas, size, center, radius, 
      color: Colors.cyan.withOpacity(0.3), 
      wavePhase: phase, 
      waveFrequency: 2.0, 
      waveAmplitude: amplitude * 10,
      radiusScale: 0.9
    );

    _drawWave(canvas, size, center, radius, 
      color: RizikBrandColors.brandPurple.withOpacity(0.5), 
      wavePhase: phase + math.pi / 3, 
      waveFrequency: 3.0, 
      waveAmplitude: amplitude * 15,
      radiusScale: 0.85
    );

    _drawWave(canvas, size, center, radius, 
      color: Colors.deepPurpleAccent.withOpacity(0.7), 
      wavePhase: phase + math.pi / 1.5, 
      waveFrequency: 1.5, 
      waveAmplitude: amplitude * 8,
      radiusScale: 0.8
    );

    // --- Layer 3: The Nucleus (The Core) ---
    // A solid but glowing core that pulses
    
    // Breathing Effect for Idle State
    double breathingFactor = 1.0;
    if (state == MojoState.idle) {
      breathingFactor = 1.0 + 0.05 * math.sin(phase);
    }
    
    // Nebula Rotation for Processing State
    if (state == MojoState.processing) {
      canvas.save();
      canvas.translate(center.dx, center.dy);
      canvas.rotate(phase * 0.5); // Slow rotation
      canvas.translate(-center.dx, -center.dy);
    }

    final coreRadius = ((radius * 0.4) + (amplitude * 10)) * breathingFactor;
    final corePaint = Paint()
      ..color = coreColor
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8.0); // Neon glow effect

    canvas.drawCircle(center, coreRadius, corePaint);
    
    // Inner bright core (hotspot)
    canvas.drawCircle(center, coreRadius * 0.6, Paint()..color = Colors.white.withOpacity(0.8));

    if (state == MojoState.processing) {
      canvas.restore(); // Restore rotation
    }
  }

  void _drawWave(Canvas canvas, Size size, Offset center, double baseRadius, {
    required Color color,
    required double wavePhase,
    required double waveFrequency,
    required double waveAmplitude,
    required double radiusScale,
  }) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
      // ..blendMode = BlendMode.srcOver; // Default is fine, 'plus' can be too bright

    final path = Path();
    final steps = 100;
    final angleStep = (math.pi * 2) / steps;
    final effectiveRadius = baseRadius * radiusScale;

    // Start point
    final r0 = effectiveRadius + math.sin(wavePhase * waveFrequency) * waveAmplitude;
    final x0 = center.dx + r0 * math.cos(0);
    final y0 = center.dy + r0 * math.sin(0);
    path.moveTo(x0, y0);

    for (int i = 1; i <= steps; i++) {
      final angle = i * angleStep;
      // Physics: y = A * sin(wt + phi) mapped to polar coordinates
      // We modulate the radius based on the angle to create the "blob" shape
      final r = effectiveRadius + 
                math.sin(angle * 3 + wavePhase * waveFrequency) * waveAmplitude +
                math.cos(angle * 2 - wavePhase) * (waveAmplitude * 0.5); // Add complexity

      final x = center.dx + r * math.cos(angle);
      final y = center.dy + r * math.sin(angle);
      
      // Use quadratic bezier for smoother curves if points are sparse, 
      // but with 100 steps, lineTo is smooth enough and faster.
      
      // For Warning state, make it spiky
      if (state == MojoState.warning) {
        // Add random jitter to radius for "glitch" effect
        // Since we are in a loop, we can't use Random() directly to keep shape closed/smooth-ish
        // So we use high frequency sin waves
        final spike = math.sin(angle * 20 + wavePhase * 5) * (waveAmplitude * 0.5);
        path.lineTo(x + spike, y + spike);
      } else {
        path.lineTo(x, y);
      }
    }

    path.close();
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _LiquidOrbPainter oldDelegate) {
    return oldDelegate.phase != phase || 
           oldDelegate.amplitude != amplitude ||
           oldDelegate.state != state;
  }
}
