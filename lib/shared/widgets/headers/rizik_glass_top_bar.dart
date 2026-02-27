import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rizik_v4/core/theme/morph_engine.dart';
import 'package:provider/provider.dart' as provider_pkg;
import 'package:rizik_v4/features/connect/logic/chat_badge_provider.dart';
import 'package:rizik_v4/features/squad/logic/squad_alert_provider.dart';

/// RizikGlassTopBar - MIT-Level Minimalist Header
///
/// Design Philosophy:
/// - Pure glassmorphism with subtle gradient
/// - Context-aware title (changes based on role)
/// - Minimal action buttons (notification + avatar)
/// - Inspired by iOS status bar blur + visionOS
class RizikGlassTopBar extends ConsumerWidget implements PreferredSizeWidget {
  const RizikGlassTopBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight + 16);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final morph = ref.watch(morphEngineProvider);
    final statusBarHeight = MediaQuery.of(context).padding.top;
    final chatUnread = _readProvider<ChatBadgeProvider>(
      context,
      (p) => p.unreadCount,
    );
    final squadAlerts = _readProvider<SquadAlertProvider>(
      context,
      (p) => p.alertCount,
    );
    final notificationCount = chatUnread + squadAlerts;

    return SizedBox(
      height: preferredSize.height + statusBarHeight,
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Colors.black.withValues(alpha: 0.22),
                  Colors.black.withValues(alpha: 0.08),
                ],
              ),
              border: Border(
                bottom: BorderSide(
                  color: Colors.white.withValues(alpha: 0.16),
                  width: 0.5,
                ),
              ),
            ),
            padding: EdgeInsets.only(
              top: statusBarHeight + 9,
              left: 16,
              right: 16,
              bottom: 10,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                // Logo & Role
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        'Rizik',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 21,
                          color: Colors.white,
                          letterSpacing: -0.3,
                          height: 1.0,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 7,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(7),
                          border: Border.all(
                            color: Colors.white.withValues(alpha: 0.18),
                            width: 0.8,
                          ),
                        ),
                        child: Text(
                          morph.roleSubtitle,
                          style: TextStyle(
                            fontWeight: FontWeight.w500,
                            fontSize: 10,
                            color: Colors.white.withValues(alpha: 0.82),
                            letterSpacing: 0.1,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Actions
                Row(
                  children: [
                    // Notification Bell
                    _buildActionButton(
                      icon: Icons.notifications_none_rounded,
                      notificationCount: notificationCount,
                      onTap: () => context.push('/alerts'),
                    ),
                    const SizedBox(width: 12),
                    // Profile Avatar
                    _buildProfileAvatar(),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required VoidCallback onTap,
    int notificationCount = 0,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        height: 36,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: Colors.white.withValues(alpha: 0.12),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.2),
            width: 0.8,
          ),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            Icon(
              icon,
              size: 20,
              color: Colors.white.withValues(alpha: 0.93),
            ),
            if (notificationCount > 0)
              Positioned(
                right: 3,
                top: 3,
                child: Container(
                  constraints:
                      const BoxConstraints(minWidth: 16, minHeight: 16),
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF453A),
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(
                      color: Colors.black.withValues(alpha: 0.26),
                      width: 0.8,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      notificationCount > 99
                          ? '99+'
                          : notificationCount.toString(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                        height: 1.0,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileAvatar() {
    return Container(
      width: 36,
      height: 36,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: Colors.white.withValues(alpha: 0.14),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.22),
          width: 0.8,
        ),
      ),
      child: const Icon(
        Icons.person_outline,
        size: 18,
        color: Colors.white,
      ),
    );
  }

  int _readProvider<T>(BuildContext context, int Function(T) selector) {
    try {
      return selector(provider_pkg.Provider.of<T>(context, listen: true));
    } catch (_) {
      return 0;
    }
  }
}
