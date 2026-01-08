import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:ui';

/// CategoryBarLayer - Following/Live tabs, RZK balance, Flow chips
class CategoryBarLayer extends StatelessWidget {
  final bool isFollowingSelected;
  final ValueChanged<bool>? onTabChanged;
  final String rzkBalance;
  final List<String> flowCategories;
  final int selectedCategoryIndex;
  final ValueChanged<int>? onCategorySelected;

  const CategoryBarLayer({
    super.key,
    this.isFollowingSelected = true,
    this.onTabChanged,
    this.rzkBalance = '1.2K',
    this.flowCategories = const ['Trending', 'Food', 'Tech', 'Music', 'Gaming'],
    this.selectedCategoryIndex = 0,
    this.onCategorySelected,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Following / Live tabs + RZK Balance
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Flexible(child: _buildTabs()),
              const SizedBox(width: 8),
              _buildRzkPill(),
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
            itemCount: flowCategories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) => _buildChip(index),
          ),
        ),
      ],
    );
  }

  Widget _buildTabs() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        GestureDetector(
          onTap: () {
            HapticFeedback.selectionClick();
            onTabChanged?.call(true);
          },
          child: Text(
            'Following',
            style: TextStyle(
              color: isFollowingSelected ? Colors.white : Colors.white54,
              fontSize: 16,
              fontWeight: isFollowingSelected ? FontWeight.w700 : FontWeight.w400,
            ),
          ),
        ),
        const SizedBox(width: 16),
        GestureDetector(
          onTap: () {
            HapticFeedback.selectionClick();
            onTabChanged?.call(false);
          },
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Live',
                style: TextStyle(
                  color: !isFollowingSelected ? Colors.white : Colors.white54,
                  fontSize: 16,
                  fontWeight: !isFollowingSelected ? FontWeight.w700 : FontWeight.w400,
                ),
              ),
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
          ),
        ),
      ],
    );
  }

  Widget _buildRzkPill() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: const Color(0xFF8B5CF6).withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF8B5CF6).withValues(alpha: 0.5)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.token, color: Color(0xFF8B5CF6), size: 14),
          const SizedBox(width: 4),
          Text(
            '$rzkBalance RZK',
            style: const TextStyle(
              color: Color(0xFFA78BFA),
              fontSize: 12,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip(int index) {
    final isSelected = index == selectedCategoryIndex;
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onCategorySelected?.call(index);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.white.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Text(
          flowCategories[index],
          style: TextStyle(
            color: isSelected ? Colors.black : Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }
}
