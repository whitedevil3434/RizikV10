import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/source/inventory/logic/inventory_provider.dart';

class WidgetInventoryStatsDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetInventoryStatsDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Consumer<InventoryProvider>(
      builder: (context, provider, child) {
        final itemCount = provider.inventory.length;
        final lowStock = provider.lowStockItems.length;
        final totalValue = provider.totalInventoryValue;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.green, width: 2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Inventory',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildStat('Items', itemCount, Icons.inventory_2),
                  _buildStat('Low Stock', lowStock, Icons.warning, color: Colors.orange),
                  _buildStat('Value', '৳${totalValue.toStringAsFixed(0)}', Icons.attach_money, color: Colors.green),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStat(String label, dynamic value, IconData icon, {Color? color}) {
    return Column(
      children: [
        Icon(icon, color: color ?? Colors.blue, size: 24),
        const SizedBox(height: 4),
        Text(
          value.toString(),
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: color ?? Colors.black),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 10, color: Colors.grey),
        ),
      ],
    );
  }
}
