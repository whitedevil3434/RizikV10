import 'package:flutter/material.dart';

/// Group Expense Card for squad expense splitting
class GroupExpenseCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const GroupExpenseCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final expenseName = data['expenseName'] ?? 'Group Expense';
    final totalAmount = data['totalAmount'] ?? 0;
    final paidBy = data['paidBy'] ?? 'Someone';
    final splits = (data['splits'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final category = data['category'] ?? 'General';
    final date = data['date'] ?? 'Today';

    return Card(
      margin: const EdgeInsets.all(8),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(Icons.receipt_long, color: Colors.blue.shade700),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        expenseName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                      Text(
                        category,
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '৳$totalAmount',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF4CAF50),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // Paid By
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.credit_card, size: 18, color: Colors.green.shade700),
                  const SizedBox(width: 8),
                  Text(
                    'Paid by $paidBy',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                      color: Colors.green.shade700,
                    ),
                  ),
                  const Spacer(),
                  Text(
                    date,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // Split Breakdown
            if (splits.isNotEmpty) ...[
              Text(
                'Split Breakdown',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade700,
                ),
              ),
              const SizedBox(height: 8),
              ...splits.map((split) => _buildSplitRow(split)),
            ],
            const SizedBox(height: 8),

            // Action Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () => print('View Expense Details'),
                icon: const Icon(Icons.info_outline, size: 16),
                label: const Text('View Details', style: TextStyle(fontSize: 13)),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.blue,
                  side: const BorderSide(color: Colors.blue),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSplitRow(Map<String, dynamic> split) {
    final name = split['name'] ?? 'Member';
    final amount = split['amount'] ?? 0;
    final isPaid = split['isPaid'] ?? false;

    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Row(
        children: [
          Icon(
            isPaid ? Icons.check_circle : Icons.circle_outlined,
            size: 16,
            color: isPaid ? Colors.green : Colors.grey,
          ),
          const SizedBox(width: 8),
         Expanded(
            child: Text(
              name,
              style: const TextStyle(fontSize: 13),
            ),
          ),
          Text(
            '৳$amount',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: isPaid ? Colors.green : Colors.red,
            ),
          ),
        ],
      ),
    );
  }
}
