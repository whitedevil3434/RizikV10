import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';

/// TopHudLayer - Avatar, Balance, Search, Notifications
class TopHudLayer extends StatelessWidget {
  final String? userAvatarUrl;
  final String balanceText;
  final VoidCallback? onAvatarTap;
  final VoidCallback? onBalanceTap;
  final VoidCallback? onSearchTap;
  final VoidCallback? onNotificationTap;
  final int notificationCount;

  const TopHudLayer({
    super.key,
    this.userAvatarUrl,
    this.balanceText = '৳0',
    this.onAvatarTap,
    this.onBalanceTap,
    this.onSearchTap,
    this.onNotificationTap,
    this.notificationCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // User Avatar
        _buildGlassCircle(
          onTap: onAvatarTap,
          child: userAvatarUrl != null
              ? CircleAvatar(
                  backgroundImage: NetworkImage(userAvatarUrl!),
                  radius: 18,
                )
              : const Icon(Icons.person, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 12),
        // Balance Capsule
        _buildGlassCapsule(
          onTap: onBalanceTap,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.account_balance_wallet,
                  color: Color(0xFF10B981), size: 16),
              const SizedBox(width: 6),
              Text(
                balanceText,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
        const Spacer(),
        // Search
        _buildGlassCircle(
          onTap: onSearchTap,
          child: const Icon(Icons.search, color: Colors.white, size: 20),
        ),
        const SizedBox(width: 12),
        // Notifications
        _buildGlassCircle(
          onTap: onNotificationTap,
          child: Stack(
            children: [
              const Icon(Icons.notifications_outlined, color: Colors.white, size: 20),
              if (notificationCount > 0)
                Positioned(
                  right: -2,
                  top: -2,
                  child: Container(
                    width: 14,
                    height: 14,
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        notificationCount > 9 ? '9+' : notificationCount.toString(),
                        style: const TextStyle(color: Colors.white, fontSize: 8),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildGlassCircle({required Widget child, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap?.call();
      },
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

  Widget _buildGlassCapsule({required Widget child, VoidCallback? onTap}) {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap?.call();
      },
      child: ClipRRect(
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
      ),
    );
  }
}
