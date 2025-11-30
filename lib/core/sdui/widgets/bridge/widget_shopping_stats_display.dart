import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/shopping_provider.dart';

class WidgetShoppingStatsDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetShoppingStatsDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final khataId = data['khata_id'] as String? ?? 'default';

    return Consumer<ShoppingProvider>(
      builder: (context, provider, child) {
        final pendingCount = provider.getPendingItems(khataId).length;
        final totalEstimated = provider.getTotalEstimated(khataId);

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFFFFF3E0),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.orange, width: 2),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.shopping_cart, color: Colors.orange, size: 32),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '$pendingCount Items',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Text(
                        'Shopping List',
                        style: TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    ],
                  ),
                ],
              ),
              Text(
                '৳${totalEstimated.toStringAsFixed(0)}',
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.orange,
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
