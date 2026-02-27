import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/data/models/order.dart';
import 'package:rizik_v4/data/models/payment_method.dart';
import 'package:rizik_v4/core/theme/ui_tokens.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/order_provider.dart';

class OrderDetailsScreen extends StatelessWidget {
  final String orderId;

  const OrderDetailsScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<OrderProvider>();
    final order = provider.getOrderById(orderId);

    if (order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Order Details')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text(
              'Order #$orderId not found in local order store.',
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Order Details')),
      body: Padding(
        padding: const EdgeInsets.all(UiTokens.pagePadding),
        child: ListView(
          children: [
            Text(
              'Order #${order.id}',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              '${order.statusEmoji} ${order.statusText}',
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: UiTokens.sectionGap),
            _sectionCard(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Delivery',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 6),
                    Text(order.deliveryAddress),
                    if (order.estimatedDeliveryTime != null) ...[
                      const SizedBox(height: 6),
                      Text('ETA: ${order.estimatedDeliveryTime}'),
                    ],
                    if (order.specialInstructions != null &&
                        order.specialInstructions!.trim().isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text('Note: ${order.specialInstructions}'),
                    ],
                  ],
                ),
              ),
            ).animate().fade(duration: 260.ms).slideY(begin: 0.08, end: 0),
            const SizedBox(height: UiTokens.sectionGap),
            _sectionCard(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Items',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ...order.items.map(
                      (item) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Expanded(
                              child: Text('${item.quantity}x ${item.name}'),
                            ),
                            Text('৳${item.subtotal.toStringAsFixed(0)}'),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            )
                .animate(delay: 70.ms)
                .fade(duration: 260.ms)
                .slideY(begin: 0.08, end: 0),
            const SizedBox(height: UiTokens.sectionGap),
            _sectionCard(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Payment',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    _line('Subtotal', order.subtotal),
                    _line('Delivery Fee', order.deliveryFee),
                    _line('Tax', order.tax),
                    const Divider(),
                    _line('Total', order.total, bold: true),
                    const SizedBox(height: 6),
                    Text('Method: ${_paymentLabel(order.paymentMethod)}'),
                  ],
                ),
              ),
            )
                .animate(delay: 120.ms)
                .fade(duration: 260.ms)
                .slideY(begin: 0.08, end: 0),
            const SizedBox(height: UiTokens.sectionGap),
            _buildStatusTimeline(order.status)
                .animate(delay: 170.ms)
                .fade(duration: 260.ms)
                .slideY(begin: 0.08, end: 0),
          ],
        ),
      ),
    );
  }

  Widget _sectionCard({required Widget child}) {
    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: UiTokens.cardBorderRadius,
      ),
      child: child,
    );
  }

  Widget _line(String label, double amount, {bool bold = false}) {
    final style = TextStyle(
      fontWeight: bold ? FontWeight.bold : FontWeight.normal,
      fontSize: bold ? 16 : 14,
    );
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Expanded(child: Text(label, style: style)),
          Text('৳${amount.toStringAsFixed(0)}', style: style),
        ],
      ),
    );
  }

  String _paymentLabel(PaymentMethodType method) {
    switch (method) {
      case PaymentMethodType.cash:
        return 'Cash on Delivery';
      case PaymentMethodType.card:
        return 'Card';
      case PaymentMethodType.mobileBanking:
        return 'Mobile Banking';
      case PaymentMethodType.wallet:
        return 'Rizik Wallet';
    }
  }

  Widget _buildStatusTimeline(OrderStatus current) {
    const flow = [
      OrderStatus.pending,
      OrderStatus.confirmed,
      OrderStatus.preparing,
      OrderStatus.readyForPickup,
      OrderStatus.outForDelivery,
      OrderStatus.delivered,
    ];
    final currentIdx = flow.indexOf(current);

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: UiTokens.cardBorderRadius,
      ),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Order Progress',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ...List.generate(flow.length, (i) {
              final status = flow[i];
              final done = i <= currentIdx;
              return Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  children: [
                    Icon(
                      done ? Icons.check_circle : Icons.radio_button_unchecked,
                      size: 18,
                      color: done ? Colors.green : Colors.grey,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _statusLabel(status),
                      style: TextStyle(
                        color: done ? Colors.black : Colors.grey,
                        fontWeight: done ? FontWeight.w600 : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ],
        ),
      ),
    );
  }

  String _statusLabel(OrderStatus status) {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.preparing:
        return 'Preparing';
      case OrderStatus.readyForPickup:
        return 'Ready for Pickup';
      case OrderStatus.outForDelivery:
        return 'Out for Delivery';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }
}
