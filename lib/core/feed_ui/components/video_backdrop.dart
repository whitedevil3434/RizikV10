import 'package:flutter/material.dart';

/// RizikVideoBackdrop - Full-screen animated WebP/image player
/// 
/// Supports:
/// - Animated WebP (via Image.network)
/// - Network URLs (R2, Cloudflare)
/// - Fade-in loading effect
class RizikVideoBackdrop extends StatelessWidget {
  final String? videoUrl;
  final BoxFit fit;

  const RizikVideoBackdrop({
    super.key,
    this.videoUrl,
    this.fit = BoxFit.cover,
  });

  @override
  Widget build(BuildContext context) {
    if (videoUrl == null || videoUrl!.isEmpty) {
      return _buildPlaceholder();
    }

    return Image.network(
      videoUrl!,
      fit: fit,
      width: double.infinity,
      height: double.infinity,
      frameBuilder: (context, child, frame, wasSynchronouslyLoaded) {
        if (wasSynchronouslyLoaded) return child;
        return AnimatedOpacity(
          opacity: frame == null ? 0 : 1,
          duration: const Duration(milliseconds: 500),
          curve: Curves.easeOut,
          child: child,
        );
      },
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Stack(
          fit: StackFit.expand,
          children: [
            _buildPlaceholder(),
            Center(
              child: CircularProgressIndicator(
                value: loadingProgress.expectedTotalBytes != null
                    ? loadingProgress.cumulativeBytesLoaded /
                        loadingProgress.expectedTotalBytes!
                    : null,
                color: const Color(0xFF8B5CF6),
                strokeWidth: 2,
              ),
            ),
          ],
        );
      },
      errorBuilder: (context, error, stackTrace) {
        debugPrint('Image load error: $error');
        return _buildPlaceholder(showError: true);
      },
    );
  }

  Widget _buildPlaceholder({bool showError = false}) {
    return Container(
      color: const Color(0xFF0A0A0F),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    Colors.purple.withValues(alpha: 0.5),
                    Colors.blue.withValues(alpha: 0.3),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              showError ? 'Failed to load' : 'Loading Flow...',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
