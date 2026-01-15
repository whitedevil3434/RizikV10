import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Twitter-Style Action Rail - EXACT Twitter UI Icons
/// Heart (like), Chat Bubble (reply), Repeat (retweet), Share, Bookmark
class TwitterActionRail extends StatelessWidget {
  // Creator Avatar
  final String? creatorAvatarUrl;
  final VoidCallback? onCreatorTap;
  
  // Heart (Like)
  final bool isLiked;
  final int likeCount;
  final VoidCallback? onLikeTap;
  
  // Chat Bubble (Reply/Comment)
  final int commentCount;
  final VoidCallback? onCommentTap;
  
  // Repeat (Retweet/Share)
  final int retweetCount;
  final VoidCallback? onRetweetTap;
  
  // Bookmark (Save)
  final bool isBookmarked;
  final VoidCallback? onBookmarkTap;
  
  // More Options
  final VoidCallback? onMoreTap;

  const TwitterActionRail({
    super.key,
    this.creatorAvatarUrl,
    this.onCreatorTap,
    this.isLiked = false,
    this.likeCount = 0,
    this.onLikeTap,
    this.commentCount = 0,
    this.onCommentTap,
    this.retweetCount = 0,
    this.onRetweetTap,
    this.isBookmarked = false,
    this.onBookmarkTap,
    this.onMoreTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Creator Avatar with Follow Badge
          if (creatorAvatarUrl != null) ...[
            _buildCreatorAvatar(),
            const SizedBox(height: 20),
          ],
          
          // ❤️ HEART (Like) - Twitter Style
          _TwitterActionButton(
            icon: isLiked ? Icons.favorite : Icons.favorite_border,
            count: likeCount,
            color: isLiked ? const Color(0xFFF91880) : Colors.white, // Twitter pink
            onTap: onLikeTap,
          ),
          const SizedBox(height: 18),
          
          // 💬 CHAT BUBBLE (Reply/Comment)
          _TwitterActionButton(
            icon: Icons.chat_bubble_outline,
            count: commentCount,
            color: Colors.white,
            onTap: onCommentTap,
          ),
          const SizedBox(height: 18),
          
          // 🔁 REPEAT (Retweet/Share)
          _TwitterActionButton(
            icon: Icons.repeat,
            count: retweetCount,
            color: Colors.white,
            activeColor: const Color(0xFF00BA7C), // Twitter green
            onTap: onRetweetTap,
          ),
          const SizedBox(height: 18),
          
          // 🔖 BOOKMARK (Save)
          _TwitterActionButton(
            icon: isBookmarked ? Icons.bookmark : Icons.bookmark_border,
            color: isBookmarked ? const Color(0xFF1D9BF0) : Colors.white, // Twitter blue
            onTap: onBookmarkTap,
          ),
          const SizedBox(height: 18),
          
          // ⋯ MORE OPTIONS
          _TwitterActionButton(
            icon: Icons.more_horiz,
            color: Colors.white,
            onTap: onMoreTap,
          ),
        ],
      ),
    );
  }

  Widget _buildCreatorAvatar() {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onCreatorTap?.call();
      },
      child: Stack(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
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
                ? const Icon(Icons.person, color: Colors.white54, size: 28)
                : null,
          ),
          // Follow button
          Positioned(
            bottom: -2,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                width: 20,
                height: 20,
                decoration: const BoxDecoration(
                  color: Color(0xFF1D9BF0), // Twitter blue
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Individual Twitter Action Button with Animation
class _TwitterActionButton extends StatefulWidget {
  final IconData icon;
  final int? count;
  final Color color;
  final Color? activeColor;
  final VoidCallback? onTap;

  const _TwitterActionButton({
    required this.icon,
    this.count,
    required this.color,
    this.activeColor,
    this.onTap,
  });

  @override
  State<_TwitterActionButton> createState() => _TwitterActionButtonState();
}

class _TwitterActionButtonState extends State<_TwitterActionButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 150),
    );
    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 1.0, end: 1.3), weight: 50),
      TweenSequenceItem(tween: Tween(begin: 1.3, end: 1.0), weight: 50),
    ]).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleTap() {
    _controller.forward().then((_) => _controller.reset());
    HapticFeedback.lightImpact();
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _handleTap,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  widget.icon,
                  color: widget.color,
                  size: 28,
                ),
                if (widget.count != null && widget.count! > 0) ...[
                  const SizedBox(height: 2),
                  Text(
                    _formatCount(widget.count!),
                    style: TextStyle(
                      color: widget.color,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ],
            ),
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
