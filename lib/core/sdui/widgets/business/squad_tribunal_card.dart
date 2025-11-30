import 'package:flutter/material.dart';
import 'package:rizik_v4/data/remote/api_service.dart';

class SquadTribunalCard extends StatefulWidget {
  final Map<String, dynamic> data;

  const SquadTribunalCard({super.key, required this.data});

  @override
  State<SquadTribunalCard> createState() => _SquadTribunalCardState();
}

class _SquadTribunalCardState extends State<SquadTribunalCard> {
  bool _isVoting = false;
  bool _hasVoted = false;

  Future<void> _castVote(String vote) async {
    setState(() => _isVoting = true);
    
    final disputeId = widget.data['disputeId'];
    // In a real app, we'd get the current user ID from a provider
    final voterId = "user-123"; // Mock for now, or fetch from UserProvider

    try {
      await ApiService.post('/api/squad/tribunal/vote', {
        'dispute_id': disputeId,
        'voter_id': voterId,
        'vote': vote
      });

      if (mounted) {
        setState(() => _hasVoted = true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Vote Cast: $vote'),
            backgroundColor: vote == 'GUILTY' ? Colors.red : Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Voting Failed: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isVoting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.data['title'] ?? 'Tribunal Active';
    final subtitle = widget.data['subtitle'] ?? '';
    final accused = widget.data['accusedName'] ?? 'Unknown';
    final reason = widget.data['reason'] ?? 'Unspecified Violation';
    final votes = widget.data['votes'] ?? {};

    return Card(
      margin: const EdgeInsets.all(16),
      color: Colors.red.shade50,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.red.shade200, width: 2),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.gavel, color: Colors.red),
                const SizedBox(width: 8),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.red,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.red.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    widget.data['timeLeft'] ?? 'Urgent',
                    style: const TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
            const Divider(color: Colors.red),
            const SizedBox(height: 8),
            Text(
              subtitle,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Accused: $accused', style: const TextStyle(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 4),
                  Text('Violation: $reason', style: TextStyle(color: Colors.grey.shade800)),
                ],
              ),
            ),
            const SizedBox(height: 16),
            if (_hasVoted)
              const Center(
                child: Text(
                  'Vote Recorded. Waiting for consensus.',
                  style: TextStyle(color: Colors.grey, fontStyle: FontStyle.italic),
                ),
              )
            else if (_isVoting)
              const Center(child: CircularProgressIndicator())
            else
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton.icon(
                    onPressed: () => _castVote('GUILTY'),
                    icon: const Icon(Icons.thumb_down, size: 18),
                    label: const Text('GUILTY'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red, 
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                  ),
                  ElevatedButton.icon(
                    onPressed: () => _castVote('INNOCENT'),
                    icon: const Icon(Icons.thumb_up, size: 18),
                    label: const Text('INNOCENT'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green, 
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                    ),
                  ),
                ],
              ),
            const SizedBox(height: 16),
            // Vote Progress
            LinearProgressIndicator(
              value: (votes['guilty'] ?? 0) / ((votes['required'] ?? 1) * 2), // Rough progress
              backgroundColor: Colors.grey.shade200,
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.red),
            ),
            const SizedBox(height: 4),
            Text(
              '${votes['guilty']} Guilty votes (Need ${votes['required']} for penalty)',
              style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
            ),
          ],
        ),
      ),
    );
  }
}
