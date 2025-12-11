import 'package:flutter/material.dart';

/// Knowledge Card Widget
/// Displays sourcing intelligence (price range, best locations)
class KnowledgeCardWidget extends StatelessWidget {
  final Map<String, dynamic> data;

  const KnowledgeCardWidget({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final productName = data['product_name'] ?? 'Unknown Product';
    final avgPrice = data['average_price'] ?? 0;
    final bestLocation = data['best_location'] ?? 'Unknown';
    final lastUpdated = data['updated_at'] != null 
        ? DateTime.parse(data['updated_at']).toString().split(' ')[0] 
        : 'Recently';

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.lightbulb, color: Colors.amber),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Rizik Intelligence: $productName',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
              ],
            ),
            const Divider(),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.attach_money, 'Avg. Price', '৳$avgPrice'),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.location_on, 'Best Location', bestLocation),
            const SizedBox(height: 8),
            _buildInfoRow(Icons.history, 'Last Updated', lastUpdated),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Text('$label: ', style: const TextStyle(color: Colors.grey)),
        Text(value, style: const TextStyle(fontWeight: FontWeight.w600)),
      ],
    );
  }
}
