import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/order_provider.dart';
import 'package:rizik_v4/core/sdui/widgets/business/order_tracker.dart';
import 'package:rizik_v4/data/models/order.dart';

class WidgetOrderTrackerDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetOrderTrackerDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, child) {
        final currentOrder = provider.currentOrder;

        // Priority 1: Provider Data (Real App State)
        if (currentOrder != null) {
          final progress = _calculateProgress(currentOrder.status);
          final statusText = _getStatusText(currentOrder.status);
          return OrderTracker(data: {
            'status': statusText,
            'progress': progress,
            'order_id': '#${currentOrder.id.substring(0, 8)}',
            'title': currentOrder.items.first.name,
            'subtitle': currentOrder.items.isNotEmpty ? currentOrder.items.first.restaurantName : 'Unknown Restaurant',
          });
        }

        // Priority 2: SDUI Data (Demo/Fallback)
        if (data['data'] != null) {
           return OrderTracker(data: data['data']);
        }

        // Priority 3: Empty State
        return const SizedBox.shrink();
      },
    );
  }

  double _calculateProgress(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending: return 0.1;
      case OrderStatus.confirmed: return 0.25;
      case OrderStatus.preparing: return 0.5;
      case OrderStatus.readyForPickup: return 0.75;
      case OrderStatus.outForDelivery: return 0.9;
      case OrderStatus.delivered: return 1.0;
      case OrderStatus.cancelled: return 0.0;
    }
  }

  String _getStatusText(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending: return 'Pending';
      case OrderStatus.confirmed: return 'Confirmed';
      case OrderStatus.preparing: return 'Preparing';
      case OrderStatus.readyForPickup: return 'Ready for Pickup';
      case OrderStatus.outForDelivery: return 'Out for Delivery';
      case OrderStatus.delivered: return 'Delivered';
      case OrderStatus.cancelled: return 'Cancelled';
    }
  }
}
