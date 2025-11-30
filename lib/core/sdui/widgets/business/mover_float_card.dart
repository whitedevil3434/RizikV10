import 'package:flutter/material.dart';

class MoverFloatCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const MoverFloatCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final floatBalance = data['floatBalance'] ?? 0.0;
    final maxFloat = data['maxFloat'] ?? 1000.0;
    final currency = data['currency'] ?? '৳';
    
    final progress = (floatBalance / maxFloat).clamp(0.0, 1.0);
    final isCritical = progress > 0.8;

    return Card(
      margin: const EdgeInsets.all(16),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Float Balance',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Text(
                  '$currency$floatBalance / $currency$maxFloat',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: isCritical ? Colors.red : Colors.black,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey.shade200,
              color: isCritical ? Colors.red : Colors.blue,
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 8),
            Text(
              isCritical 
                  ? 'Warning: Please deposit cash soon to continue receiving cash orders.'
                  : 'You are in good standing.',
              style: TextStyle(
                fontSize: 12,
                color: isCritical ? Colors.red : Colors.green,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
