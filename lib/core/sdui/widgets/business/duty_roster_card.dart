import 'package:flutter/material.dart';

/// Duty Roster Card for family duty calendar
class DutyRosterCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const DutyRosterCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final weekDuties = (data['weekDuties'] as List?)?.cast<Map<String, dynamic>>() ?? [];
    final weekOf = data['weekOf'] ?? 'This Week';

    return Card(
      margin: const EdgeInsets.all(16),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(Icons.calendar_month, color: Colors.purple.shade700),
                const SizedBox(width: 8),
                Text(
                  'Family Duty Roster',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: Colors.purple.shade700,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              weekOf,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
            const Divider(height: 24),

            // Weekly Duties
            if (weekDuties.isEmpty)
              Center(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Text(
                    'No duties assigned this week',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                ),
              )
            else
              ...weekDuties.map((duty) => _buildDutyRow(duty)),
          ],
        ),
      ),
    );
  }

  Widget _buildDutyRow(Map<String, dynamic> duty) {
    final day = duty['day'] ?? 'Mon';
    final taskType = duty['taskType'] ?? 'Task';
    final assignedTo = duty['assignedTo'] ?? 'Member';
    final time = duty['time'] ?? '';
    final isCompleted = duty['isCompleted'] ?? false;

    IconData taskIcon;
    Color taskColor;

    switch (taskType.toLowerCase()) {
      case 'child_pickup':
        taskIcon = Icons.child_care;
        taskColor = Colors.purple;
        break;
      case 'doctor':
        taskIcon = Icons.local_hospital;
        taskColor = Colors.red;
        break;
      case 'cooking':
        taskIcon = Icons.restaurant;
        taskColor = Colors.orange;
        break;
      case 'cleaning':
        taskIcon = Icons.cleaning_services;
        taskColor = Colors.blue;
        break;
      default:
        taskIcon = Icons.assignment;
        taskColor = Colors.grey;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isCompleted ? Colors.green.shade50 : Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: isCompleted ? Colors.green.shade200 : Colors.grey.shade200,
        ),
      ),
      child: Row(
        children: [
          // Day Badge
          Container(
            width: 50,
            padding: const EdgeInsets.symmetric(vertical: 6),
            decoration: BoxDecoration(
              color: taskColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Text(
                  day,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: taskColor,
                  ),
                  textAlign: TextAlign.center,
                ),
                if (time.isNotEmpty)
                  Text(
                    time,
                    style: TextStyle(
                      fontSize: 9,
                      color: Colors.grey.shade600,
                    ),
                    textAlign: TextAlign.center,
                  ),
              ],
            ),
          ),
          const SizedBox(width: 12),

          // Task Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(taskIcon, size: 16, color: taskColor),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        taskType.replaceAll('_', ' ').toUpperCase(),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.person, size: 12, color: Colors.grey.shade600),
                    const SizedBox(width: 4),
                    Text(
                      assignedTo,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade700,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Status Icon
          Icon(
            isCompleted ? Icons.check_circle : Icons.circle_outlined,
            color: isCompleted ? Colors.green : Colors.grey,
            size: 24,
          ),
        ],
      ),
    );
  }
}
