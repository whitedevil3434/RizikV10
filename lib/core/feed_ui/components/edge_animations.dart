import 'package:flutter/material.dart';

/// EdgeAnimations - 4-side animated overlays for cinematic effect
/// 
/// Adds subtle motion to all 4 edges of the screen:
/// - Top: Gradient pulse (status/notifications)
/// - Bottom: Wave shimmer (audio visualizer feel)
/// - Left: Slide-in hints (navigation aid)
/// - Right: Glow trail (action feedback)
class EdgeAnimations extends StatefulWidget {
  final bool enabled;
  final Color primaryColor;
  final Color secondaryColor;

  const EdgeAnimations({
    super.key,
    this.enabled = true,
    this.primaryColor = const Color(0xFF8B5CF6),
    this.secondaryColor = const Color(0xFF06B6D4),
  });

  @override
  State<EdgeAnimations> createState() => _EdgeAnimationsState();
}

class _EdgeAnimationsState extends State<EdgeAnimations>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _shimmerController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _shimmerAnimation;

  @override
  void initState() {
    super.initState();
    
    // Pulse animation for top/bottom edges
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
    _pulseAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    
    // Shimmer animation for left/right edges
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    );
    _shimmerAnimation = Tween<double>(begin: -1.0, end: 2.0).animate(
      CurvedAnimation(parent: _shimmerController, curve: Curves.linear),
    );

    if (widget.enabled) {
      _pulseController.repeat(reverse: true);
      _shimmerController.repeat();
    }
  }

  @override
  void didUpdateWidget(EdgeAnimations oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.enabled && !oldWidget.enabled) {
      _pulseController.repeat(reverse: true);
      _shimmerController.repeat();
    } else if (!widget.enabled && oldWidget.enabled) {
      _pulseController.stop();
      _shimmerController.stop();
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _shimmerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) return const SizedBox.shrink();

    return IgnorePointer(
      child: Stack(
        children: [
          // Top edge glow
          _buildTopEdge(),
          
          // Bottom edge shimmer
          _buildBottomEdge(),
          
          // Left edge accent
          _buildLeftEdge(),
          
          // Right edge accent
          _buildRightEdge(),
        ],
      ),
    );
  }

  Widget _buildTopEdge() {
    return Positioned(
      top: 0,
      left: 0,
      right: 0,
      height: 3,
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  widget.primaryColor.withValues(alpha: 0.0),
                  widget.primaryColor.withValues(alpha: 0.3 * _pulseAnimation.value),
                  widget.secondaryColor.withValues(alpha: 0.3 * _pulseAnimation.value),
                  widget.primaryColor.withValues(alpha: 0.0),
                ],
                stops: const [0.0, 0.3, 0.7, 1.0],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBottomEdge() {
    return Positioned(
      bottom: 0,
      left: 0,
      right: 0,
      height: 2,
      child: AnimatedBuilder(
        animation: _shimmerAnimation,
        builder: (context, child) {
          return ShaderMask(
            shaderCallback: (bounds) {
              return LinearGradient(
                begin: Alignment.centerLeft,
                end: Alignment.centerRight,
                colors: [
                  Colors.transparent,
                  widget.primaryColor,
                  widget.secondaryColor,
                  Colors.transparent,
                ],
                stops: [
                  (_shimmerAnimation.value - 0.3).clamp(0.0, 1.0),
                  (_shimmerAnimation.value - 0.15).clamp(0.0, 1.0),
                  (_shimmerAnimation.value + 0.15).clamp(0.0, 1.0),
                  (_shimmerAnimation.value + 0.3).clamp(0.0, 1.0),
                ],
              ).createShader(bounds);
            },
            child: Container(
              color: Colors.white,
            ),
          );
        },
      ),
    );
  }

  Widget _buildLeftEdge() {
    return Positioned(
      top: 100,
      bottom: 100,
      left: 0,
      width: 2,
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  widget.primaryColor.withValues(alpha: 0.15 * _pulseAnimation.value),
                  widget.primaryColor.withValues(alpha: 0.15 * _pulseAnimation.value),
                  Colors.transparent,
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildRightEdge() {
    return Positioned(
      top: 100,
      bottom: 100,
      right: 0,
      width: 2,
      child: AnimatedBuilder(
        animation: _pulseAnimation,
        builder: (context, child) {
          return Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.transparent,
                  widget.secondaryColor.withValues(alpha: 0.15 * _pulseAnimation.value),
                  widget.secondaryColor.withValues(alpha: 0.15 * _pulseAnimation.value),
                  Colors.transparent,
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
