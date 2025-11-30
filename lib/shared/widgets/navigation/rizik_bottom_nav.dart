import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';

class RizikBottomNav extends ConsumerWidget {
  final int selectedIndex;
  final Function(int) onIndexChanged;

  const RizikBottomNav({
    super.key,
    required this.selectedIndex,
    required this.onIndexChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final role = ref.watch(userRoleProvider);

    return BottomAppBar(
      shape: const CircularNotchedRectangle(),
      notchMargin: 8.0,
      color: Colors.white,
      elevation: 10,
      child: SizedBox(
        height: 60,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildNavItem(Icons.home_rounded, 'Home', 0),
            _buildNavItem(Icons.shopping_bag_outlined, _getTab2Label(role), 1),
            const SizedBox(width: 48), // Space for Mojo
            _buildNavItem(Icons.receipt_long_rounded, _getTab3Label(role), 3),
            _buildNavItem(Icons.person_outline_rounded, 'Profile', 4),
          ],
        ),
      ),
    );
  }

  String _getTab2Label(UserRole role) {
    switch (role) {
      case UserRole.force:
        return 'Gigs';
      case UserRole.source:
        return 'Inventory';
      case UserRole.seeker:
      default:
        return 'Bazar';
    }
  }

  String _getTab3Label(UserRole role) {
    switch (role) {
      case UserRole.force:
        return 'Earnings';
      case UserRole.source:
        return 'Sales';
      case UserRole.seeker:
      default:
        return 'Orders';
    }
  }

  Widget _buildNavItem(IconData icon, String label, int index) {
    final isSelected = selectedIndex == index;
    return InkWell(
      onTap: () => onIndexChanged(index),
      borderRadius: BorderRadius.circular(30),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? RizikColors.rizikGreen : Colors.grey,
              size: 26,
            ),
          ],
        ),
      ),
    );
  }
}
