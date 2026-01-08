import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// ActionRailLayer - Right side action buttons (Like, Comment, Share, More)
class ActionRailLayer extends StatelessWidget {
  final String? creatorAvatarUrl;
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final bool isLiked;
  final bool isFollowing;
  final VoidCallback? onCreatorTap;
  final VoidCallback? onFollowTap;
  final VoidCallback? onLikeTap;
  final VoidCallback? onCommentTap;
  final VoidCallback? onShareTap;
  final VoidCallback? onMoreTap;

  const ActionRailLayer({
    super.key,
    this.creatorAvatarUrl,
    this.likeCount = 0,
    this.commentCount = 0,
    this.shareCount = 0,
    this.isLiked = false,
    this.isFollowing = false,
    this.onCreatorTap,
    this.onFollowTap,
    this.onLikeTap,
    this.onCommentTap,
    this.onShareTap,
    this.onMoreTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Creator Avatar with Follow button
        _buildCreatorAvatar(),
        const SizedBox(height: 20),
        // Like
        _buildActionButton(
          icon: isLiked ? Icons.favorite : Icons.favorite_border,
          count: likeCount,
          color: isLiked ? Colors.red : Colors.white,
          onTap: onLikeTap,
        ),
        const SizedBox(height: 16),
        // Comment
        _buildActionButton(
          icon: Icons.chat_bubble_outline,
          count: commentCount,
          onTap: onCommentTap,
        ),
        const SizedBox(height: 16),
        // Share (flipped arrow)
        _buildActionButton(
          icon: Icons.reply,
          count: shareCount,
          onTap: onShareTap,
          flipIcon: true,
        ),
        const SizedBox(height: 16),
        // More
        _buildActionButton(
          icon: Icons.more_horiz,
          onTap: onMoreTap,
        ),
      ],
    );
  }

  Widget _buildCreatorAvatar() {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onCreatorTap?.call();
      },
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(color: Colors.black54, blurRadius: 8, offset: const Offset(0, 2)),
              ],
              image: creatorAvatarUrl != null
                  ? DecorationImage(
                      image: NetworkImage(creatorAvatarUrl!),
                      fit: BoxFit.cover,
                    )
                  : null,
              color: creatorAvatarUrl == null ? Colors.grey.shade800 : null,
            ),
            child: creatorAvatarUrl == null
                ? const Icon(Icons.person, color: Colors.white54, size: 24)
                : null,
          ),
          // Follow button
          if (!isFollowing)
            Positioned(
              bottom: -6,
              left: 0,
              right: 0,
              child: Center(
                child: GestureDetector(
                  onTap: () {
                    HapticFeedback.mediumImpact();
                    onFollowTap?.call();
                  },
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: const BoxDecoration(
                      color: Color(0xFF8B5CF6),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.add, color: Colors.white, size: 14),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    int? count,
    Color color = Colors.white,
    VoidCallback? onTap,
    bool flipIcon = false,
  }) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap?.call();
      },
      child: Column(
        children: [
          Transform(
            transform: flipIcon
                ? (Matrix4.identity()..scale(-1.0, 1.0, 1.0))
                : Matrix4.identity(),
            alignment: Alignment.center,
            child: Icon(icon, color: color, size: 28),
          ),
          if (count != null) ...[
            const SizedBox(height: 2),
            Text(
              _formatCount(count),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }

  String _formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return count.toString();
  }
}
