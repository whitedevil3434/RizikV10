import 'package:flutter/material.dart';

class FamilyCareAlert extends StatelessWidget {
  final Map<String, dynamic> data;

  const FamilyCareAlert({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final taskType = data['taskType'] ?? 'Task';
    final childName = data['childName'] ?? 'Child';
    final time = data['time'] ?? 'Not specified';
    final location = data['location'] ?? '';

    IconData icon;
    Color color;

    switch (taskType.toLowerCase()) {
      case 'child_pickup':
        icon = Icons.child_care;
        color = Colors.purple;
        break;
      case 'doctor_appointment':
        icon = Icons.local_hospital;
        color = Colors.red;
        break;
      default:
        icon = Icons.assignment;
        color = Colors.blue;
    }

    return Card(
      margin: const EdgeInsets.all(16),
      color: color.withOpacity(0.1),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: color.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, color: color),
                const SizedBox(width: 8),
                Text(
                  'Family Care Duty',
                  style: TextStyle(
                    color: color,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              taskType.replaceAll('_', ' ').toUpperCase(),
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 4),
            Text('Child: $childName'),
            Text('Time: $time'),
            if (location.isNotEmpty) Text('Location: $location'),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton.icon(
                  onPressed: () => print('Request Swap'),
                  icon: const Icon(Icons.swap_horiz, size: 18),
                  label: const Text('Request Swap'),
                  style: TextButton.styleFrom(foregroundColor: color),
                ),
                const SizedBox(width: 8),
                ElevatedButton.icon(
                  onPressed: () => print('Confirm Duty'),
                  icon: const Icon(Icons.check, size: 18),
                  label: const Text('Confirm'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: color,
                    foregroundColor: Colors.white,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
