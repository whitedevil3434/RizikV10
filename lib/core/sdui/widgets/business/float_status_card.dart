import 'package:flutter/material.dart';

class FloatStatusCard extends StatefulWidget {
  final Map<String, dynamic> data;

  const FloatStatusCard({super.key, required this.data});

  @override
  State<FloatStatusCard> createState() => _FloatStatusCardState();
}

class _FloatStatusCardState extends State<FloatStatusCard> {
  @override
  Widget build(BuildContext context) {
    final balance = widget.data['balance'] ?? 0;
    final limit = widget.data['limit'] ?? 0;
    final status = widget.data['status'] ?? 'UNKNOWN';
    final action = widget.data['action'];

    final double progress = limit > 0 ? (balance / limit).clamp(0.0, 1.0) : 0.0;
    final Color statusColor = _getStatusColor(status);

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Micro-Float Status',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(
                      color: statusColor,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '৳$balance',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                Text(
                  'Limit: ৳$limit',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(statusColor),
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
            ),
            const SizedBox(height: 16),
            if (action != null)
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    // Handle action (e.g., show modal)
                    // For now, just print or show a simple dialog if it's a modal type
                    if (action['type'] == 'modal') {
                      showDialog(
                        context: context,
                        builder: (context) => AlertDialog(
                          content: Text(action['child']?['text'] ?? 'Action'),
                          actions: [
                            TextButton(
                              onPressed: () => Navigator.pop(context),
                              child: const Text('Close'),
                            ),
                          ],
                        ),
                      );
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text('Manage Float'),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return Colors.green;
      case 'WARNING':
        return Colors.orange;
      case 'BLOCKED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }
}
