import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/design_system.dart';
import 'package:rizik_v4/core/sdui/widgets/base/index.dart';

/// 📦 OrderTracker - Order Status with Progress
/// 
/// A clean card showing current order status and progress.
class OrderTracker extends StatelessWidget {
  final Map<String, dynamic> data;

  const OrderTracker({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final status = data['status'] as String? ?? 'Processing';
    final progress = (data['progress'] as num?)?.toDouble() ?? 0.5;
    final orderId = data['order_id'] as String? ?? '#12345';

    return RizikCard(
      margin: const EdgeInsets.symmetric(
        horizontal: RizikDesign.spacing16,
        vertical: RizikDesign.spacing8,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Active Order',
                    style: RizikDesign.textCaption.copyWith(
                      color: RizikDesign.textSecondary,
                    ),
                  ),
                  const SizedBox(height: RizikDesign.spacing4),
                  Text(
                    orderId,
                    style: RizikDesign.textSubheader,
                  ),
                ],
              ),
              _StatusPill(status: status),
            ],
          ),
          const SizedBox(height: RizikDesign.spacing16),
          _ProgressBar(progress: progress),
          const SizedBox(height: RizikDesign.spacing12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _getProgressText(progress),
                style: RizikDesign.textCaption.copyWith(
                  color: RizikDesign.textTertiary,
                ),
              ),
              Text(
                '${(progress * 100).toInt()}%',
                style: RizikDesign.textCaption.copyWith(
                  color: RizikDesign.primary,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getProgressText(double progress) {
    if (progress < 0.25) return 'Order confirmed';
    if (progress < 0.5) return 'Preparing your order';
    if (progress < 0.75) return 'Out for delivery';
    return 'Arriving soon';
  }
}

/// Status Pill Widget
class _StatusPill extends StatelessWidget {
  final String status;

  const _StatusPill({required this.status});

  @override
  Widget build(BuildContext context) {
    final color = _getStatusColor();

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: RizikDesign.spacing12,
        vertical: RizikDesign.spacing4,
      ),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: RizikDesign.radiusPill,
        border: Border.all(color: color, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: RizikDesign.spacing4),
          Text(
            status,
            style: RizikDesign.textCaption.copyWith(
              color: color,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor() {
    switch (status.toLowerCase()) {
      case 'cooking':
      case 'preparing':
        return const Color(0xFFFF9800);
      case 'delivered':
        return RizikDesign.success;
      case 'cancelled':
        return RizikDesign.error;
      default:
        return RizikDesign.primary;
    }
  }
}

/// Progress Bar Widget
class _ProgressBar extends StatelessWidget {
  final double progress;

  const _ProgressBar({required this.progress});

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          height: 6,
          decoration: BoxDecoration(
            color: RizikDesign.border,
            borderRadius: RizikDesign.radiusSmall,
          ),
        ),
        FractionallySizedBox(
          widthFactor: progress.clamp(0.0, 1.0),
          child: Container(
            height: 6,
            decoration: BoxDecoration(
              gradient: RizikDesign.primaryGradient,
              borderRadius: RizikDesign.radiusSmall,
              boxShadow: [
                BoxShadow(
                  color: RizikDesign.primary.withOpacity(0.3),
                  blurRadius: 4,
                  offset: const Offset(0, 1),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
