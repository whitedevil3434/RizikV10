import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// RizikGlassNav - MIT-Level Minimalist Navigation
///
/// Design Philosophy:
/// - Only 2 essential actions: Orders (left) & Wallet (right)
/// - Center: Mojo Orb (AI assistant) - handled by FloatingActionButton
/// - Glass morphism with subtle edge indicators
/// - Inspired by iOS dock + Material 3 + Dieter Rams principles
class RizikGlassNav extends StatelessWidget {
  final int selectedIndex;
  final Function(int) onIndexChanged;

  const RizikGlassNav({
    super.key,
    required this.selectedIndex,
    required this.onIndexChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 18, sigmaY: 18),
          child: Container(
            height: 62,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(22),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withValues(alpha: 0.17),
                  Colors.white.withValues(alpha: 0.09),
                ],
              ),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.24),
                width: 0.9,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.12),
                  blurRadius: 14,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Stack(
              children: [
                // Edge Indicators
                _buildEdgeIndicators(),

                // Navigation Items
                Row(
                  children: [
                    // Left: Orders
                    Expanded(
                      child: _buildNavItem(
                        icon: Icons.grid_view_rounded,
                        label: 'Orders',
                        index: 0,
                        isLeft: true,
                      ),
                    ),

                    // Center spacer for Mojo Orb
                    const SizedBox(width: 80),

                    // Right: Wallet
                    Expanded(
                      child: _buildNavItem(
                        icon: Icons.credit_card_rounded,
                        label: 'Wallet',
                        index: 1,
                        isLeft: false,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEdgeIndicators() {
    return Positioned.fill(
      child: Row(
        children: [
          // Left edge indicator
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutCubic,
            width: 2,
            margin: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(3),
              color: selectedIndex == 0
                  ? const Color(0xFF9AC4FF)
                  : Colors.transparent,
            ),
          ),

          const Spacer(),

          // Right edge indicator
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeOutCubic,
            width: 2,
            margin: const EdgeInsets.symmetric(vertical: 14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(3),
              color: selectedIndex == 1
                  ? const Color(0xFF9AC4FF)
                  : Colors.transparent,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required int index,
    required bool isLeft,
  }) {
    final isSelected = selectedIndex == index;
    const activeColor = Color(0xFFEAF2FF);

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onIndexChanged(index);
      },
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        child: Row(
          mainAxisAlignment:
              isLeft ? MainAxisAlignment.start : MainAxisAlignment.end,
          children: [
            if (!isLeft) ...[
              // Label first for right side
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  color: isSelected
                      ? activeColor
                      : Colors.white.withValues(alpha: 0.6),
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  letterSpacing: -0.1,
                ),
                child: Text(label),
              ),
              const SizedBox(width: 8),
            ],

            // Icon with glow effect
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isSelected
                    ? Colors.white.withValues(alpha: 0.16)
                    : Colors.transparent,
              ),
              child: Icon(
                icon,
                size: 21,
                color: isSelected
                    ? activeColor
                    : Colors.white.withValues(alpha: 0.6),
              ),
            ),

            if (isLeft) ...[
              // Label after for left side
              const SizedBox(width: 8),
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  color: isSelected
                      ? activeColor
                      : Colors.white.withValues(alpha: 0.6),
                  fontSize: 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w500,
                  letterSpacing: -0.1,
                ),
                child: Text(label),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
