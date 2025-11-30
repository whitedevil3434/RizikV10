import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:rizik_v4/core/theme/rizik_colors.dart';

class SquadVoteTab extends StatelessWidget {
  final String squadId;

  const SquadVoteTab({Key? key, required this.squadId}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSectionHeader('Active Proposals', Icons.how_to_vote, Colors.purple),
        const SizedBox(height: 12),
        _buildVoteCard(
          title: 'Buy New Delivery Bag',
          description: 'We need a larger thermal bag for catering orders.',
          proposer: 'Rahim',
          yesVotes: 3,
          noVotes: 1,
          timeLeft: '2h left',
        ),
        _buildVoteCard(
          title: 'Change Shift Schedule',
          description: 'Proposal to shift morning start time to 7 AM.',
          proposer: 'Karim',
          yesVotes: 2,
          noVotes: 2,
          timeLeft: '5h left',
        ),
        const SizedBox(height: 24),
        _buildSectionHeader('Past Decisions', Icons.check_circle_outline, Colors.grey),
        const SizedBox(height: 12),
        _buildPastDecisionCard('Purchase Bike Maintenance Kit', 'Approved', Colors.green),
        _buildPastDecisionCard('Weekend Trip', 'Rejected', Colors.red),
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

  Widget _buildVoteCard({
    required String title,
    required String description,
    required String proposer,
    required int yesVotes,
    required int noVotes,
    required String timeLeft,
  }) {
    final totalVotes = yesVotes + noVotes;
    final yesPercentage = totalVotes == 0 ? 0.0 : yesVotes / totalVotes;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 3,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.purple.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    timeLeft,
                    style: const TextStyle(color: Colors.purple, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(description, style: TextStyle(color: Colors.grey[700])),
            const SizedBox(height: 8),
            Text('Proposed by: $proposer', style: TextStyle(color: Colors.grey[500], fontSize: 12)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildVoteButton(Icons.thumb_up, 'Yes ($yesVotes)', Colors.green),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildVoteButton(Icons.thumb_down, 'No ($noVotes)', Colors.red),
                ),
              ],
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: yesPercentage,
                backgroundColor: Colors.red.withOpacity(0.2),
                valueColor: AlwaysStoppedAnimation<Color>(Colors.green),
                minHeight: 6,
              ),
            ),
          ],
        ),
      ),
    ).animate().fadeIn().slideY(begin: 0.1);
  }

  Widget _buildVoteButton(IconData icon, String label, Color color) {
    return OutlinedButton.icon(
      onPressed: () {},
      icon: Icon(icon, size: 18, color: color),
      label: Text(label, style: TextStyle(color: color)),
      style: OutlinedButton.styleFrom(
        side: BorderSide(color: color.withOpacity(0.5)),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
      ),
    );
  }

  Widget _buildPastDecisionCard(String title, String status, Color color) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 0,
      color: Colors.grey[50],
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w500)),
        trailing: Container(
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
      ),
    );
  }
}
