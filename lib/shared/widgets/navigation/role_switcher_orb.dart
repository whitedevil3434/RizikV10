import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';

class RoleSwitcherOrb extends ConsumerWidget {
  const RoleSwitcherOrb({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // This widget is actually invoked via a modal bottom sheet, 
    // so we expose a static method to show it.
    return const SizedBox.shrink();
  }

  static void show(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (context) => const RoleSwitcherSheet(),
    );
  }
}

class RoleSwitcherSheet extends ConsumerWidget {
  const RoleSwitcherSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentRole = ref.watch(userRoleProvider);

    return Container(
      height: 450,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.95),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 20,
            spreadRadius: 5,
          ),
        ],
      ),
      child: Column(
        children: [
          const SizedBox(height: 12),
          // Handle bar
          Container(
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.grey.shade300,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'Choose Your Identity',
            style: GoogleFonts.hindSiliguri(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 32),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              children: [
                _buildRoleCard(
                  context,
                  ref,
                  title: 'বাজার করুন',
                  subtitle: 'Seeker Mode',
                  icon: Icons.shopping_bag_outlined,
                  gradientColors: [Colors.green.shade400, Colors.green.shade700],
                  role: UserRole.seeker,
                  currentRole: currentRole,
                ),
                const SizedBox(height: 16),
                _buildRoleCard(
                  context,
                  ref,
                  title: 'আয় করুন',
                  subtitle: 'Force Mode',
                  icon: Icons.rocket_launch_outlined,
                  gradientColors: [Colors.blue.shade400, Colors.blue.shade700],
                  role: UserRole.force,
                  currentRole: currentRole,
                ),
                const SizedBox(height: 16),
                _buildRoleCard(
                  context,
                  ref,
                  title: 'ব্যবসা করুন',
                  subtitle: 'Source Mode',
                  icon: Icons.storefront_outlined,
                  gradientColors: [Colors.amber.shade400, Colors.amber.shade700],
                  role: UserRole.source,
                  currentRole: currentRole,
                ),
                const SizedBox(height: 32),
                Text(
                  'Quick Actions',
                  style: GoogleFonts.hindSiliguri(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 16),
                _buildActionCard(
                  context,
                  title: 'Rizik Connect',
                  subtitle: 'Video & Audio Calls',
                  icon: Icons.video_call,
                  color: Colors.purple,
                  onTap: () {
                    Navigator.pop(context);
                    GoRouter.of(context).push('/connect');
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleCard(
    BuildContext context,
    WidgetRef ref, {
    required String title,
    required String subtitle,
    required IconData icon,
    required List<Color> gradientColors,
    required UserRole role,
    required UserRole currentRole,
  }) {
    final isSelected = currentRole == role;
    
    return GestureDetector(
      onTap: () {
        ref.read(userRoleProvider.notifier).setRole(role);
        Navigator.pop(context);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 90,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: gradientColors,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: gradientColors.last.withOpacity(0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 6),
                  )
                ]
              : [],
          border: isSelected ? Border.all(color: Colors.white, width: 3) : null,
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.hindSiliguri(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.hindSiliguri(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
            ),
            if (isSelected)
              const Icon(Icons.check_circle, color: Colors.white, size: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildActionCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 80,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
          border: Border.all(color: Colors.grey.shade200),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.hindSiliguri(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.hindSiliguri(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: Colors.grey.shade400, size: 16),
          ],
        ),
      ),
    );
  }
}
