import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/rizik_colors.dart';
import '../../../../data/models/squad.dart';

class CapacityToggleWidget extends ConsumerWidget {
  final CapacityStatus currentStatus;
  final Function(CapacityStatus) onStatusChanged;
  final int currentOrderCount;
  final int maxCapacity;

  const CapacityToggleWidget({
    super.key,
    required this.currentStatus,
    required this.onStatusChanged,
    this.currentOrderCount = 0,
    this.maxCapacity = 20,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: RizikColors.cardSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: RizikColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Kitchen Capacity',
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: _getStatusColor(currentStatus).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: _getStatusColor(currentStatus)),
                ),
                child: Text(
                  '$currentOrderCount / $maxCapacity Orders',
                  style: TextStyle(
                    color: _getStatusColor(currentStatus),
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              _buildToggleButton(context, CapacityStatus.open, Colors.green),
              const SizedBox(width: 8),
              _buildToggleButton(context, CapacityStatus.busy, Colors.orange),
              const SizedBox(width: 8),
              _buildToggleButton(context, CapacityStatus.full, Colors.red),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildToggleButton(
      BuildContext context, CapacityStatus status, Color color) {
    final isSelected = currentStatus == status;
    return Expanded(
      child: InkWell(
        onTap: () => onStatusChanged(status),
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? color : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected ? color : RizikColors.divider,
              width: isSelected ? 0 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(
                _getStatusIcon(status),
                color: isSelected ? Colors.white : RizikColors.secondaryText,
                size: 20,
              ),
              const SizedBox(height: 4),
              Text(
                status.nameBn,
                style: TextStyle(
                  color: isSelected ? Colors.white : RizikColors.secondaryText,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getStatusIcon(CapacityStatus status) {
    switch (status) {
      case CapacityStatus.open:
        return Icons.check_circle_outline;
      case CapacityStatus.busy:
        return Icons.access_time;
      case CapacityStatus.full:
        return Icons.block;
    }
  }

  Color _getStatusColor(CapacityStatus status) {
    switch (status) {
      case CapacityStatus.open:
        return Colors.green;
      case CapacityStatus.busy:
        return Colors.orange;
      case CapacityStatus.full:
        return Colors.red;
    }
  }
}
