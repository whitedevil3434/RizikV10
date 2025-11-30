import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/order_provider.dart';

class WidgetOrderStatsDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetOrderStatsDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Consumer<OrderProvider>(
      builder: (context, provider, child) {
        final totalOrders = provider.orders.length;
        final activeOrders = provider.activeOrders.length;
        final completedOrders = provider.completedOrders.length;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStat('Total', totalOrders, Colors.blue),
              _buildStat('Active', activeOrders, Colors.orange),
              _buildStat('Done', completedOrders, Colors.green),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStat(String label, int count, Color color) {
    return Column(
      children: [
        Text(
          count.toString(),
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
      ],
    );
  }
}
