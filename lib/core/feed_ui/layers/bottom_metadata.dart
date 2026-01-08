import 'package:flutter/material.dart';

/// BottomMetadataLayer - Flow Badge, Username, Description, Audio Ticker
class BottomMetadataLayer extends StatelessWidget {
  final String? flowBadge;
  final String username;
  final bool isVerified;
  final String description;
  final String? audioTitle;
  final VoidCallback? onUsernameTap;
  final VoidCallback? onAudioTap;

  const BottomMetadataLayer({
    super.key,
    this.flowBadge,
    required this.username,
    this.isVerified = false,
    required this.description,
    this.audioTitle,
    this.onUsernameTap,
    this.onAudioTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        // Flow Badge
        if (flowBadge != null) _buildFlowBadge(),
        
        // Username
        _buildUsernameRow(),
        const SizedBox(height: 6),
        
        // Description
        Text(
          description,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            height: 1.4,
            shadows: [
              Shadow(color: Colors.black54, blurRadius: 4),
            ],
          ),
        ),
        
        // Audio Ticker
        if (audioTitle != null) ...[
          const SizedBox(height: 10),
          _buildAudioTicker(),
        ],
      ],
    );
  }

  Widget _buildFlowBadge() {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(
          color: const Color(0xFF8B5CF6).withValues(alpha: 0.5),
          width: 1,
        ),
      ),
      child: Text(
        flowBadge!,
        style: const TextStyle(
          color: Color(0xFFA78BFA),
          fontSize: 11,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildUsernameRow() {
    return GestureDetector(
      onTap: onUsernameTap,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            username,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
              shadows: [
                Shadow(color: Colors.black54, blurRadius: 4),
              ],
            ),
          ),
          if (isVerified) ...[
            const SizedBox(width: 4),
            const Icon(Icons.verified, color: Colors.blue, size: 16),
          ],
        ],
      ),
    );
  }

  Widget _buildAudioTicker() {
    return GestureDetector(
      onTap: onAudioTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: Colors.black.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.music_note, color: Colors.white, size: 14),
            const SizedBox(width: 6),
            Flexible(
              child: Text(
                audioTitle!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  shadows: [
                    Shadow(color: Colors.black54, blurRadius: 4),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
