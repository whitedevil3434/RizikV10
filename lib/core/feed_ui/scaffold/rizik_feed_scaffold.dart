import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';
import 'package:rizik_v4/core/feed_ui/components/cinematic_video_backdrop.dart';
import 'package:rizik_v4/core/feed_ui/components/edge_animations.dart';

/// RizikFeedScaffold - Main 5-Layer Feed Container
/// 
/// Layer Architecture:
/// - Layer 5: Top HUD (Avatar, Balance, Search, Notifications)
/// - Layer 4: Category Bar (Following/Live, Balance Pill, Flow Chips)
/// - Layer 3: Action Rail (Like, Comment, Share, More)
/// - Layer 2: Bottom Metadata (Flow Badge, Username, Description, Audio)
/// - Layer 1: Video Backdrop (AI-generated loop)
/// - Layer 0: Anchor (Mojo Orb)
class RizikFeedScaffold extends StatefulWidget {
  // Video/Image backdrop
  final String? videoUrl;
  
  // Creator info
  final String creatorUsername;
  final String? creatorAvatarUrl;
  final bool isVerified;
  
  // Content info
  final String description;
  final String? flowBadge;
  final String? audioTitle;
  
  // Engagement stats
  final int likeCount;
  final int commentCount;
  final int shareCount;
  final bool isLiked;
  final bool isBookmarked;
  
  // User info
  final String? userAvatarUrl;
  final String balanceText;
  
  // Callbacks
  final VoidCallback? onLikeTap;
  final VoidCallback? onCommentTap;
  final VoidCallback? onShareTap;
  final VoidCallback? onMoreTap;
  final VoidCallback? onOrbTap;
  final VoidCallback? onOrbLongPress;
  final VoidCallback? onSearchTap;
  final VoidCallback? onNotificationTap;
  
  // Categories
  final List<String> flowCategories;
  final int selectedCategoryIndex;
  final ValueChanged<int>? onCategorySelected;
  
  // Layout options
  final bool showBottomOrb;
  final bool showTopHUD;
  
  // Playback Control
  final bool isActive;
  final bool shouldBuffer; // Resource Control

  const RizikFeedScaffold({
    super.key,
    this.videoUrl,
    required this.creatorUsername,
    this.creatorAvatarUrl,
    this.isVerified = false,
    required this.description,
    this.flowBadge,
    this.audioTitle,
    this.likeCount = 0,
    this.commentCount = 0,
    this.shareCount = 0,
    this.isLiked = false,
    this.isBookmarked = false,
    this.userAvatarUrl,
    this.balanceText = '৳0',
    this.onLikeTap,
    this.onCommentTap,
    this.onShareTap,
    this.onMoreTap,
    this.onOrbTap,
    this.onOrbLongPress,
    this.onSearchTap,
    this.onNotificationTap,
    this.flowCategories = const ['Trending', 'Food', 'Tech', 'Music'],
    this.selectedCategoryIndex = 0,
    this.onCategorySelected,
    this.showBottomOrb = true,
    this.showTopHUD = true,
    this.isActive = true,
    this.shouldBuffer = true, // Default Keep Resource
  });

  @override
  State<RizikFeedScaffold> createState() => _RizikFeedScaffoldState();
}

class _RizikFeedScaffoldState extends State<RizikFeedScaffold> 
    with SingleTickerProviderStateMixin {
  late AnimationController _fadeController;
  bool _showUI = true;

  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
      value: 1.0,
    );
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  void _toggleUI() {
    setState(() {
      _showUI = !_showUI;
      if (_showUI) {
        _fadeController.forward();
      } else {
        _fadeController.reverse();
      }
    });
    HapticFeedback.selectionClick();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTap: _toggleUI,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Layer 1: Cinematic Video Backdrop (Living UI)
            _buildVideoBackdrop(),
            
            // Layer 1.5: 4-Side Edge Animations
            const EdgeAnimations(),
            
            // UI Layers with fade animation
            AnimatedOpacity(
              opacity: _showUI ? 1.0 : 0.0,
              duration: const Duration(milliseconds: 300),
              child: IgnorePointer(
                ignoring: !_showUI,
                child: Stack(
                  children: [
                    // Layer 5: Top HUD
                    Positioned(
                      top: MediaQuery.of(context).padding.top + 8,
                      left: 16,
                      right: 16,
                      child: _buildTopHUD(),
                    ),
                    
                    // Layer 4: Category Bar
                    Positioned(
                      top: MediaQuery.of(context).padding.top + 60,
                      left: 0,
                      right: 0,
                      child: _buildCategoryBar(),
                    ),
                    
                    // Layer 3: Action Rail
                    Positioned(
                      right: 12,
                      bottom: 160,
                      child: _buildActionRail(),
                    ),
                    
                    // Layer 2: Bottom Metadata
                    Positioned(
                      left: 16,
                      right: 80,
                      bottom: 90,
                      child: _buildBottomMetadata(),
                    ),
                  ],
                ),
              ),
            ),
            
            // Layer 0: Anchor Orb (optional - hide when using external nav)
            if (widget.showBottomOrb)
              Positioned(
                bottom: 24,
                left: 0,
                right: 0,
                child: Center(child: _buildAnchorOrb()),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildVideoBackdrop() {
    // Cinematic Video Backdrop - The Living UI Engine
    // Uses real video player for looping backgrounds
    return CinematicVideoBackdrop(
      videoUrl: widget.videoUrl,
      looping: true,
      showGlassOverlay: false, // Glass overlay handled by individual layers
      fallbackWidget: Container(
        color: const Color(0xFF0A0A0F),
        child: const Center(
          child: Icon(Icons.play_circle_outline, size: 64, color: Colors.white24),
        ),
      ),
      shouldMute: false, // Enable Audio for Feed
      isActive: widget.isActive, // Control Playback
      shouldBuffer: widget.shouldBuffer, // Control Resource
    );
  }


  Widget _buildTopHUD() {
    return Row(
      children: [
        // User Avatar
        _buildGlassCircle(
          child: widget.userAvatarUrl != null
              ? CircleAvatar(
                  backgroundImage: NetworkImage(widget.userAvatarUrl!),
                  radius: 18,
                )
              : const Icon(Icons.person, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 12),
        // Balance Capsule
        _buildGlassCapsule(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.account_balance_wallet, 
                color: Color(0xFF10B981), size: 16),
              const SizedBox(width: 6),
              Text(widget.balanceText,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                )),
            ],
          ),
        ),
        const Spacer(),
        // Search
        _buildGlassCircle(
          onTap: widget.onSearchTap,
          child: const Icon(Icons.search, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 12),
        // Notifications
        _buildGlassCircle(
          onTap: widget.onNotificationTap,
          child: const Icon(Icons.notifications_outlined, 
            color: Colors.white, size: 20),
        ),
      ],
    );
  }

  Widget _buildCategoryBar() {
    return Column(
      children: [
        // Following / Live tabs
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Flexible(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    _buildTabButton('Following', isSelected: true),
                    const SizedBox(width: 16),
                    _buildTabButton('Live', isSelected: false, hasLiveDot: true),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // RZK Balance pill
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: const Color(0xFF8B5CF6).withValues(alpha: 0.5)),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.token, color: Color(0xFF8B5CF6), size: 14),
                    SizedBox(width: 4),
                    Text('1.2K RZK', style: TextStyle(
                      color: Color(0xFFA78BFA),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    )),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        // Flow category chips
        SizedBox(
          height: 32,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: widget.flowCategories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final isSelected = index == widget.selectedCategoryIndex;
              return GestureDetector(
                onTap: () => widget.onCategorySelected?.call(index),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: isSelected 
                        ? Colors.white 
                        : Colors.white.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Text(
                    widget.flowCategories[index],
                    style: TextStyle(
                      color: isSelected ? Colors.black : Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildTabButton(String text, {bool isSelected = false, bool hasLiveDot = false}) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          text,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.white54,
            fontSize: 16,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w400,
          ),
        ),
        if (hasLiveDot) ...[
          const SizedBox(width: 4),
          Container(
            width: 6,
            height: 6,
            decoration: const BoxDecoration(
              color: Colors.red,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildActionRail() {
    return Column(
      children: [
        // Creator Avatar
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2),
            image: widget.creatorAvatarUrl != null
                ? DecorationImage(
                    image: NetworkImage(widget.creatorAvatarUrl!),
                    fit: BoxFit.cover,
                  )
                : null,
            color: widget.creatorAvatarUrl == null ? Colors.grey : null,
          ),
          child: widget.creatorAvatarUrl == null
              ? const Icon(Icons.person, color: Colors.white, size: 24)
              : null,
        ),
        // Follow button (positioned to overlap avatar)
        Transform.translate(
          offset: const Offset(0, -8),
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
        const SizedBox(height: 20),
        // Like
        _buildActionButton(
          icon: widget.isLiked ? Icons.favorite : Icons.favorite_border,
          count: widget.likeCount,
          color: widget.isLiked ? Colors.red : Colors.white,
          onTap: widget.onLikeTap,
        ),
        const SizedBox(height: 16),
        // Comment
        _buildActionButton(
          icon: Icons.chat_bubble_outline,
          count: widget.commentCount,
          onTap: widget.onCommentTap,
        ),
        const SizedBox(height: 16),
        // Share
        _buildActionButton(
          icon: Icons.reply,
          count: widget.shareCount,
          onTap: widget.onShareTap,
          flipIcon: true,
        ),
        const SizedBox(height: 16),
        // More
        _buildActionButton(
          icon: Icons.more_horiz,
          onTap: widget.onMoreTap,
        ),
      ],
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
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBottomMetadata() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Flow Badge
        if (widget.flowBadge != null)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF8B5CF6).withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              widget.flowBadge!,
              style: const TextStyle(
                color: Color(0xFFA78BFA),
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        // Username
        Row(
          children: [
            Text(
              widget.creatorUsername,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            if (widget.isVerified) ...[
              const SizedBox(width: 4),
              const Icon(Icons.verified, color: Colors.blue, size: 16),
            ],
          ],
        ),
        const SizedBox(height: 6),
        // Description
        Text(
          widget.description,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
          ),
        ),
        // Audio
        if (widget.audioTitle != null) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.music_note, color: Colors.white, size: 14),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  widget.audioTitle!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildAnchorOrb() {
    return GestureDetector(
      onTap: () {
        HapticFeedback.mediumImpact();
        widget.onOrbTap?.call();
      },
      onLongPress: () {
        HapticFeedback.heavyImpact();
        widget.onOrbLongPress?.call();
      },
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          gradient: const RadialGradient(
            colors: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
          ),
          boxShadow: [
            BoxShadow(
              color: const Color(0xFF8B5CF6).withValues(alpha: 0.6),
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: const Icon(Icons.add, color: Colors.white, size: 28),
      ),
    );
  }

  Widget _buildGlassCircle({required Widget child, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: ClipOval(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.15),
              shape: BoxShape.circle,
            ),
            child: Center(child: child),
          ),
        ),
      ),
    );
  }

  Widget _buildGlassCapsule({required Widget child}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
          ),
          child: child,
        ),
      ),
    );
  }

  String _formatCount(int count) {
    if (count >= 1000000) return '${(count / 1000000).toStringAsFixed(1)}M';
    if (count >= 1000) return '${(count / 1000).toStringAsFixed(1)}K';
    return count.toString();
  }
}
