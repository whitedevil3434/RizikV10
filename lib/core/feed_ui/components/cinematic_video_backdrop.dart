import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'dart:ui';
import 'dart:io';
import 'package:flutter_cache_manager/flutter_cache_manager.dart';

/// CinematicVideoBackdrop - Full-screen looping video background
/// 
/// The "Living UI" engine - makes every screen feel alive.
/// Supports:
/// - Network video URLs (R2, Cloudflare CDN)
/// - Asset videos (micro-loops, 1-3 seconds)
/// - Glassmorphism overlay for text readability
/// - Gradient masks (top/bottom fade)
class CinematicVideoBackdrop extends StatefulWidget {
  final String? videoUrl;
  final String? assetPath;
  final bool looping;
  final bool showGlassOverlay;
  final double glassBlur;
  final double glassOpacity;
  final Widget? fallbackWidget;

  const CinematicVideoBackdrop({
    super.key,
    this.videoUrl,
    this.assetPath,
    this.looping = true,
    this.showGlassOverlay = false,
    this.glassBlur = 5.0,
    this.glassOpacity = 0.3,
    this.fallbackWidget,
  });

  @override
  State<CinematicVideoBackdrop> createState() => _CinematicVideoBackdropState();
}

class _CinematicVideoBackdropState extends State<CinematicVideoBackdrop> {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  @override
  void didUpdateWidget(CinematicVideoBackdrop oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.videoUrl != widget.videoUrl || 
        oldWidget.assetPath != widget.assetPath) {
      _disposeController();
      _initializeVideo();
    }
  }


  bool get _isImage => widget.videoUrl != null && 
      (widget.videoUrl!.toLowerCase().endsWith('.avif') ||
       widget.videoUrl!.toLowerCase().endsWith('.webp') ||
       widget.videoUrl!.toLowerCase().endsWith('.gif') ||
       widget.videoUrl!.toLowerCase().endsWith('.jpg') ||
       widget.videoUrl!.toLowerCase().endsWith('.png'));

  Future<void> _initializeVideo() async {
    if (widget.videoUrl == null && widget.assetPath == null) {
      return;
    }

    // Hybrid Player: Use Image widget for images/AVIF, VideoPlayer for MP4
    if (_isImage) {
      if (mounted) {
        setState(() {
          _isInitialized = true;
          _hasError = false;
        });
      }
      return;
    }

    try {
      if (widget.assetPath != null) {
        _controller = VideoPlayerController.asset(widget.assetPath!);
      } else if (widget.videoUrl != null) {
        // Smart Caching: Check cache -> Download -> Play File
        final file = await DefaultCacheManager().getSingleFile(widget.videoUrl!);
        _controller = VideoPlayerController.file(file);
      }

      await _controller?.initialize();
      
      if (widget.looping) {
        _controller?.setLooping(true);
      }
      
      _controller?.setVolume(0); // Mute background video
      _controller?.play();

      if (mounted) {
        setState(() {
          _isInitialized = true;
          _hasError = false;
        });
      }
    } catch (e) {
      debugPrint('CinematicVideoBackdrop: Error initializing video: $e');
      if (mounted) {
        setState(() {
          _hasError = true;
        });
      }
    }
  }

  void _disposeController() {
    _controller?.dispose();
    _controller = null;
    _isInitialized = false;
  }

  @override
  void dispose() {
    _disposeController();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Layer 1: Video or Fallback
        _buildVideoLayer(),
        
        // Layer 2: Glass Overlay (optional)
        if (widget.showGlassOverlay) _buildGlassOverlay(),
        
        // Layer 3: Gradient Masks
        _buildGradientMasks(),
      ],
    );
  }

  Widget _buildVideoLayer() {
    if (_hasError || (!_isInitialized && widget.fallbackWidget != null)) {
      return widget.fallbackWidget ?? _buildDefaultPlaceholder();
    }

    // Hybrid Render: Image
    if (_isImage && widget.videoUrl != null) {
       return Image.network(
         widget.videoUrl!,
         fit: BoxFit.cover,
         errorBuilder: (context, error, stackTrace) {
           debugPrint('Image render error: $error');
           return _buildDefaultPlaceholder();
         },
       );
    }

    if (!_isInitialized || _controller == null) {
      return _buildLoadingState();
    }

    // Handle case where video dimensions are not yet available
    final size = _controller!.value.size;
    if (size.width == 0 || size.height == 0) {
      return _buildLoadingState();
    }

    return SizedBox.expand(
      child: FittedBox(
        fit: BoxFit.cover,
        child: SizedBox(
          width: size.width,
          height: size.height,
          child: VideoPlayer(_controller!),
        ),
      ),
    );
  }

  Widget _buildGlassOverlay() {
    return BackdropFilter(
      filter: ImageFilter.blur(
        sigmaX: widget.glassBlur,
        sigmaY: widget.glassBlur,
      ),
      child: Container(
        color: Colors.black.withValues(alpha: widget.glassOpacity),
      ),
    );
  }

  Widget _buildGradientMasks() {
    return Stack(
      children: [
        // Top gradient (for status bar / HUD readability)
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          height: 180,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.7),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
        // Bottom gradient (for metadata / controls readability)
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          height: 280,
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.85),
                  Colors.transparent,
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return Container(
      color: const Color(0xFF0A0A0F),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Pulsing orb effect
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0.8, end: 1.2),
              duration: const Duration(milliseconds: 1000),
              curve: Curves.easeInOut,
              builder: (context, scale, child) {
                return Transform.scale(
                  scale: scale,
                  child: Container(
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: RadialGradient(
                        colors: [
                          const Color(0xFF8B5CF6).withValues(alpha: 0.6),
                          const Color(0xFF6D28D9).withValues(alpha: 0.3),
                          Colors.transparent,
                        ],
                      ),
                    ),
                  ),
                );
              },
              onEnd: () {
                if (mounted) setState(() {});
              },
            ),
            const SizedBox(height: 16),
            Text(
              'Loading Flow...',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                fontSize: 13,
                letterSpacing: 1.2,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDefaultPlaceholder() {
    return Container(
      color: const Color(0xFF0A0A0F),
      child: Center(
        child: Icon(
          Icons.play_circle_outline,
          size: 64,
          color: Colors.white.withValues(alpha: 0.2),
        ),
      ),
    );
  }
}
