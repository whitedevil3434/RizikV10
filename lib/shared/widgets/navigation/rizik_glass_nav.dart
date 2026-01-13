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
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(32),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 25, sigmaY: 25),
          child: Container(
            height: 72,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(32),
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withValues(alpha: 0.15),
                  Colors.white.withValues(alpha: 0.05),
                ],
              ),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.2),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
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
                        icon: Icons.receipt_long_rounded,
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
                        icon: Icons.account_balance_wallet_rounded,
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
            curve: Curves.easeInOutCubic,
            width: 4,
            margin: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              color: selectedIndex == 0
                  ? const Color(0xFF10B981) // Emerald green
                  : Colors.transparent,
              boxShadow: selectedIndex == 0
                  ? [
                      BoxShadow(
                        color: const Color(0xFF10B981).withValues(alpha: 0.5),
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ]
                  : null,
            ),
          ),
          
          const Spacer(),
          
          // Right edge indicator
          AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOutCubic,
            width: 4,
            margin: const EdgeInsets.symmetric(vertical: 16),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(2),
              color: selectedIndex == 1
                  ? const Color(0xFF8B5CF6) // Purple
                  : Colors.transparent,
              boxShadow: selectedIndex == 1
                  ? [
                      BoxShadow(
                        color: const Color(0xFF8B5CF6).withValues(alpha: 0.5),
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ]
                  : null,
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
    final activeColor = isLeft 
        ? const Color(0xFF10B981)  // Emerald for Orders
        : const Color(0xFF8B5CF6); // Purple for Wallet
    
    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onIndexChanged(index);
      },
      behavior: HitTestBehavior.opaque,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOutCubic,
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
        child: Row(
          mainAxisAlignment: isLeft 
              ? MainAxisAlignment.start 
              : MainAxisAlignment.end,
          children: [
            if (!isLeft) ...[
              // Label first for right side
              AnimatedDefaultTextStyle(
                duration: const Duration(milliseconds: 200),
                style: TextStyle(
                  color: isSelected 
                      ? activeColor 
                      : Colors.white.withValues(alpha: 0.6),
                  fontSize: isSelected ? 13 : 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  letterSpacing: 0.5,
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
                    ? activeColor.withValues(alpha: 0.15) 
                    : Colors.transparent,
              ),
              child: Icon(
                icon,
                size: isSelected ? 26 : 24,
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
                  fontSize: isSelected ? 13 : 12,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  letterSpacing: 0.5,
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
