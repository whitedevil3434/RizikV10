import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/force/logistics/logic/rider_mission_provider.dart';

class WidgetMissionStatsDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetMissionStatsDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Consumer<RiderMissionProvider>(
      builder: (context, provider, child) {
        final available = provider.totalAvailableMissions;
        final active = provider.totalActiveMissions;
        final completed = provider.completedMissions.length;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF667eea), Color(0xFF764ba2)],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildStat('Available', available, Icons.assignment),
              _buildStat('Active', active, Icons.local_shipping),
              _buildStat('Done', completed, Icons.check_circle),
            ],
          ),
        );
      },
    );
  }

  Widget _buildStat(String label, int count, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Colors.white, size: 32),
        const SizedBox(height: 4),
        Text(
          count.toString(),
          style: const TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.white70),
        ),
      ],
    );
  }
}
