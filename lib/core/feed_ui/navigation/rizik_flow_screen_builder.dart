import 'package:flutter/material.dart';
import 'rizik_flow_navigator.dart';

/// RizikFlowScreenBuilder - Builds role-specific screens for each direction
/// 
/// This provides default placeholder screens for each role's LEFT management feed
class RizikFlowScreenBuilder {
  
  /// Build LEFT (Management) screens based on role
  static List<Widget> buildLeftScreens(RizikRole role) {
    switch (role) {
      case RizikRole.seeker:
        return _buildSeekerManagementScreens();
      case RizikRole.force:
        return _buildForceManagementScreens();
      case RizikRole.source:
        return _buildSourceManagementScreens();
    }
  }
  
  /// Build UP (Future/Marketing) screens
  static List<Widget> buildUpScreens() {
    return [
      _buildPlaceholderScreen(
        title: 'Upcoming Quests',
        icon: Icons.rocket_launch_rounded,
        color: const Color(0xFFFFD93D),
        subtitle: 'New opportunities coming soon',
      ),
      _buildPlaceholderScreen(
        title: 'Flash Sales',
        icon: Icons.flash_on_rounded,
        color: const Color(0xFFFF6B6B),
        subtitle: 'Limited time deals',
      ),
      _buildPlaceholderScreen(
        title: 'New Promos',
        icon: Icons.local_offer_rounded,
        color: const Color(0xFF4ECDC4),
        subtitle: 'Special offers for you',
      ),
    ];
  }
  
  /// Build DOWN (History/Past) screens
  static List<Widget> buildDownScreens() {
    return [
      _buildPlaceholderScreen(
        title: 'Recent Orders',
        icon: Icons.receipt_long_rounded,
        color: const Color(0xFF6B7280),
        subtitle: 'Your order history',
      ),
      _buildPlaceholderScreen(
        title: 'Completed Quests',
        icon: Icons.check_circle_rounded,
        color: const Color(0xFF22C55E),
        subtitle: 'Achievement unlocked!',
      ),
      _buildPlaceholderScreen(
        title: 'Transaction Log',
        icon: Icons.account_balance_wallet_rounded,
        color: const Color(0xFF8B5CF6),
        subtitle: 'Payment history',
      ),
    ];
  }
  
  /// Build RIGHT (Discovery/Marketplace) screens
  static List<Widget> buildRightScreens() {
    return [
      _buildPlaceholderScreen(
        title: 'Products',
        icon: Icons.shopping_bag_rounded,
        color: const Color(0xFF4ECDC4),
        subtitle: 'Browse marketplace',
      ),
      _buildPlaceholderScreen(
        title: 'Gig Listings',
        icon: Icons.work_rounded,
        color: const Color(0xFF6366F1),
        subtitle: 'Find opportunities',
      ),
      _buildPlaceholderScreen(
        title: 'User Profiles',
        icon: Icons.people_rounded,
        color: const Color(0xFFF59E0B),
        subtitle: 'Connect with others',
      ),
    ];
  }
  
  // === SEEKER MANAGEMENT SCREENS ===
  static List<Widget> _buildSeekerManagementScreens() {
    return [
      _buildPlaceholderScreen(
        title: 'Squad Overview',
        icon: Icons.groups_rounded,
        color: const Color(0xFF6366F1),
        subtitle: 'Manage your squad members',
      ),
      _buildPlaceholderScreen(
        title: 'Mess Toggle',
        icon: Icons.restaurant_rounded,
        color: const Color(0xFF22C55E),
        subtitle: 'Meal planning & schedule',
      ),
      _buildPlaceholderScreen(
        title: 'Chat Hub',
        icon: Icons.chat_bubble_rounded,
        color: const Color(0xFF4ECDC4),
        subtitle: 'Squad conversations',
      ),
      _buildPlaceholderScreen(
        title: 'Alerts Center',
        icon: Icons.notifications_rounded,
        color: const Color(0xFFFF6B6B),
        subtitle: 'Important notifications',
      ),
      _buildPlaceholderScreen(
        title: 'Social Quest',
        icon: Icons.emoji_events_rounded,
        color: const Color(0xFFFFD93D),
        subtitle: 'Challenges & rewards',
      ),
      _buildPlaceholderScreen(
        title: 'Rizik Major',
        icon: Icons.map_rounded,
        color: const Color(0xFF8B5CF6),
        subtitle: 'Nearby gigs & services',
      ),
    ];
  }
  
  // === FORCE MANAGEMENT SCREENS ===
  static List<Widget> _buildForceManagementScreens() {
    return [
      _buildPlaceholderScreen(
        title: 'Team Radar',
        icon: Icons.radar_rounded,
        color: const Color(0xFF22C55E),
        subtitle: 'Nearby team members',
      ),
      _buildPlaceholderScreen(
        title: 'Mission Chain',
        icon: Icons.link_rounded,
        color: const Color(0xFF4ECDC4),
        subtitle: 'Active delivery chain',
      ),
      _buildPlaceholderScreen(
        title: 'Handover QR',
        icon: Icons.qr_code_rounded,
        color: const Color(0xFF6366F1),
        subtitle: 'Quick handover scan',
      ),
      _buildPlaceholderScreen(
        title: 'Live Chat',
        icon: Icons.headset_mic_rounded,
        color: const Color(0xFFFF6B6B),
        subtitle: 'Support & customer chat',
      ),
      _buildPlaceholderScreen(
        title: 'Earnings',
        icon: Icons.attach_money_rounded,
        color: const Color(0xFFFFD93D),
        subtitle: 'Today\'s earnings',
      ),
      _buildPlaceholderScreen(
        title: 'Schedule',
        icon: Icons.calendar_today_rounded,
        color: const Color(0xFF8B5CF6),
        subtitle: 'Shift management',
      ),
    ];
  }
  
  // === SOURCE MANAGEMENT SCREENS ===
  static List<Widget> _buildSourceManagementScreens() {
    return [
      _buildPlaceholderScreen(
        title: 'Inventory',
        icon: Icons.inventory_2_rounded,
        color: const Color(0xFFF59E0B),
        subtitle: 'Stock management',
      ),
      _buildPlaceholderScreen(
        title: 'Orders Queue',
        icon: Icons.list_alt_rounded,
        color: const Color(0xFF22C55E),
        subtitle: 'Pending orders',
      ),
      _buildPlaceholderScreen(
        title: 'Analytics',
        icon: Icons.analytics_rounded,
        color: const Color(0xFF6366F1),
        subtitle: 'Sales & performance',
      ),
      _buildPlaceholderScreen(
        title: 'Staff',
        icon: Icons.badge_rounded,
        color: const Color(0xFF4ECDC4),
        subtitle: 'Team management',
      ),
      _buildPlaceholderScreen(
        title: 'Promotions',
        icon: Icons.campaign_rounded,
        color: const Color(0xFFFF6B6B),
        subtitle: 'Create offers',
      ),
      _buildPlaceholderScreen(
        title: 'Reviews',
        icon: Icons.star_rounded,
        color: const Color(0xFFFFD93D),
        subtitle: 'Customer feedback',
      ),
    ];
  }
  
  // === PLACEHOLDER SCREEN BUILDER ===
  static Widget _buildPlaceholderScreen({
    required String title,
    required IconData icon,
    required Color color,
    required String subtitle,
  }) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            color.withValues(alpha: 0.3),
            const Color(0xFF1A1A1A),
          ],
        ),
      ),
      child: SafeArea(
        child: Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  size: 64,
                  color: color,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                title,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 28,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                subtitle,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.7),
                  fontSize: 16,
                ),
              ),
              const SizedBox(height: 48),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  border: Border.all(color: color.withValues(alpha: 0.5)),
                  borderRadius: BorderRadius.circular(24),
                ),
                child: Text(
                  'Coming Soon',
                  style: TextStyle(
                    color: color,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
