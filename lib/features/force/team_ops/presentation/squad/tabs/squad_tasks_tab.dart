import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:rizik_v4/core/theme/rizik_colors.dart';

class SquadTasksTab extends StatelessWidget {
  final String squadId;

  const SquadTasksTab({Key? key, required this.squadId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Active Missions', Icons.rocket_launch, Colors.orange),
        const SizedBox(height: 12),
        _buildMissionCard(
          title: 'Uttara Sector 7 Delivery',
          assignee: 'Rahim',
          status: 'In Progress',
          progress: 0.7,
          color: Colors.orange,
        ),
        _buildMissionCard(
          title: 'Gulshan 1 Pickup',
          assignee: 'Karim',
          status: 'Pending',
          progress: 0.0,
          color: Colors.blue,
        ),
        const SizedBox(height: 24),
        _buildSectionHeader('Duty Roster', Icons.calendar_today, Colors.green),
        const SizedBox(height: 12),
        _buildRosterCard('Today', ['Rahim (Morning)', 'Karim (Evening)']),
        _buildRosterCard('Tomorrow', ['Sabbir (Morning)', 'Rahim (Evening)']),
      ],
    );
  }

  Widget _buildSectionHeader(String title, IconData icon, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: RizikColors.textPrimary,
          ),
        ),
      ],
    );
  }

  Widget _buildMissionCard({
    required String title,
    required String assignee,
    required String status,
    required double progress,
    required Color color,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    status,
                    style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Assigned to: $assignee', style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 12),
            LinearProgressIndicator(
              value: progress,
              backgroundColor: Colors.grey[200],
              valueColor: AlwaysStoppedAnimation<Color>(color),
              borderRadius: BorderRadius.circular(4),
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideX();
  }

  Widget _buildRosterCard(String day, List<String> shifts) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      color: Colors.grey[50],
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[300]!),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              day,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            ...shifts.map((shift) => Padding(
                  padding: const EdgeInsets.only(bottom: 4),
                  child: Row(
                    children: [
                      const Icon(Icons.person_outline, size: 16, color: Colors.grey),
                      const SizedBox(width: 8),
                      Text(shift),
                    ],
                  ),
                )),
          ],
        ),
      ),
    );
  }
}
