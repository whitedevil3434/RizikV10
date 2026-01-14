import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'dart:ui';
import 'dart:io';
import 'package:flutter/foundation.dart';
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
  final bool shouldMute;
  final bool isActive;
  final bool shouldBuffer; // Create/Destroy Resource

  const CinematicVideoBackdrop({
    super.key,
    this.videoUrl,
    this.assetPath,
    this.looping = true,
    this.showGlassOverlay = false,
    this.glassBlur = 5.0,
    this.glassOpacity = 0.3,
    this.fallbackWidget,
    this.shouldMute = true,
    this.isActive = true,
    this.shouldBuffer = true, // Default Keep Resource
  });

  @override
  State<CinematicVideoBackdrop> createState() => _CinematicVideoBackdropState();
}

class _CinematicVideoBackdropState extends State<CinematicVideoBackdrop> 
    with AutomaticKeepAliveClientMixin {
  VideoPlayerController? _controller;
  bool _isInitialized = false;
  bool _hasError = false;

  @override
  bool get wantKeepAlive => true; // Keep Widget Alive (for state), but dispose Controller manually

  @override
  void initState() {
    super.initState();
    if (widget.shouldBuffer) {
      _initializeVideo();
    }
  }

  @override
  void dispose() {
    _disposeController();
    super.dispose();
  }

  void _disposeController() {
    _controller?.dispose();
    _controller = null;
    _isInitialized = false;
  }

  @override
  void didUpdateWidget(CinematicVideoBackdrop oldWidget) {
    super.didUpdateWidget(oldWidget);
    
    // 1. Handle Source Change
    if (oldWidget.videoUrl != widget.videoUrl || oldWidget.assetPath != widget.assetPath) {
      _disposeController();
      if (widget.shouldBuffer) _initializeVideo();
      return;
    }

    // 2. Handle Buffer State (Resource Managment)
    if (oldWidget.shouldBuffer != widget.shouldBuffer) {
      if (widget.shouldBuffer) {
        _initializeVideo();
      } else {
        _disposeController(); // Free up Decoder
        if (mounted) setState(() {}); // Trigger rebuild to show fallback
      }
    }
    
    // 3. Handle Play/Pause (Focus Management)
    // Only access controller if it exists and is initialized
    if (_isInitialized && _controller != null) {
       if (widget.isActive) {
         if (!_controller!.value.isPlaying) _controller?.play();
       } else {
         if (_controller!.value.isPlaying) _controller?.pause();
       }
       
       if (oldWidget.shouldMute != widget.shouldMute) {
         _controller?.setVolume(widget.shouldMute ? 0 : 1.0);
       }
    }
  }


  bool get _isImage => widget.videoUrl != null && 
      (widget.videoUrl!.toLowerCase().endsWith('.avif') ||
       widget.videoUrl!.toLowerCase().endsWith('.webp') ||
       widget.videoUrl!.toLowerCase().endsWith('.gif') ||
       widget.videoUrl!.toLowerCase().endsWith('.jpg') ||
       widget.videoUrl!.toLowerCase().endsWith('.png'));

  Future<void> _initializeVideo() async {
    if ((widget.videoUrl == null && widget.assetPath == null) || _isInitialized) {
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
      final videoOptions = VideoPlayerOptions(mixWithOthers: true);

      if (widget.assetPath != null) {
        _controller = VideoPlayerController.asset(widget.assetPath!, videoPlayerOptions: videoOptions);
      } else if (widget.videoUrl != null) {
        if (kIsWeb) {
           _controller = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl!), videoPlayerOptions: videoOptions);
        } else {
           final file = await DefaultCacheManager().getSingleFile(widget.videoUrl!);
           _controller = VideoPlayerController.file(file, videoPlayerOptions: videoOptions);
        }
      }

      // Guard before async init
      if (!mounted || !widget.shouldBuffer) return;

      // Add timeout to prevent hanging
      await _controller?.initialize().timeout(const Duration(seconds: 15));
      
      // Guard after async init
      if (!mounted || !widget.shouldBuffer) {
        _disposeController();
        return;
      }

      if (widget.looping) {
        _controller?.setLooping(true);
      }
      
      _controller?.setVolume(widget.shouldMute ? 0 : 1.0); 
      
      if (widget.isActive) {
        _controller?.play();
      }

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



  @override
  Widget build(BuildContext context) {
    super.build(context); // Required for AutomaticKeepAliveClientMixin
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
