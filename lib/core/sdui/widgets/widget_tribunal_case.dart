import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/squad_tribunal.dart';

/// SDUI Widget: Squad Tribunal Case
/// Displays dispute resolution voting card
class WidgetTribunalCase extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetTribunalCase({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    final disputeId = data['disputeId'] as String? ?? 'default_dispute';
    final showEvidence = data['showEvidence'] as bool? ?? true;
    final userId = data['userId'] as String? ?? 'user_123';

    final dispute = _getMockDispute(disputeId);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.red.shade200, width: 2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.gavel, color: Colors.red, size: 24),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'মামলা #${dispute.id.substring(8)}',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      _getTypeName(dispute.type),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              _buildStatusBadge(dispute.status),
            ],
          ),

          const SizedBox(height: 12),
          const Divider(),
          const SizedBox(height: 12),

          // Vote Tally
          _buildVoteTally(dispute),

          const SizedBox(height: 12),

          // Voting Deadline
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.orange.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.access_time, color: Colors.orange, size: 16),
                    SizedBox(width: 6),
                    Text(
                      'ভোটের সময়সীমা',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                Text(
                  _getTimeRemaining(dispute.votingStartedAt?.add(const Duration(hours: 24))),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Colors.orange,
                  ),
                ),
              ],
            ),
          ),

          if (showEvidence) ...[
            const SizedBox(height: 12),
            const Divider(),
            const SizedBox(height: 12),
            _buildEvidenceSection(dispute),
          ],

          const SizedBox(height: 16),

          // Action Buttons
          _buildActionButtons(context, dispute),
        ],
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, SquadDispute dispute) {
    if (dispute.status != DisputeStatus.voting) return const SizedBox.shrink();

    return Row(
      children: [
        Expanded(
          child: ElevatedButton(
            onPressed: () => _castVote(context, dispute, VoteType.favor),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
            ),
            child: const Text('পক্ষে (In Favor)'),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: ElevatedButton(
            onPressed: () => _castVote(context, dispute, VoteType.against),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white,
            ),
            child: const Text('বিপক্ষে (Against)'),
          ),
        ),
      ],
    );
  }

  Color _getStatusColor(DisputeStatus status) {
    switch (status) {
      case DisputeStatus.filed:
        return Colors.blue;
      case DisputeStatus.underReview:
        return Colors.orange;
      case DisputeStatus.voting:
        return Colors.purple;
      case DisputeStatus.resolved:
        return Colors.green;
      case DisputeStatus.appealed:
        return Colors.red;
      case DisputeStatus.closed:
        return Colors.grey;
    }
  }

  String _getStatusText(DisputeStatus status) {
    switch (status) {
      case DisputeStatus.filed:
        return 'Filed';
      case DisputeStatus.underReview:
        return 'Under Review';
      case DisputeStatus.voting:
        return 'Voting Active';
      case DisputeStatus.resolved:
        return 'Resolved';
      case DisputeStatus.appealed:
        return 'Appealed';
      case DisputeStatus.closed:
        return 'Closed';
    }
  }

  Widget _buildVoteTally(SquadDispute dispute) {
    // Mock tally
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildTallyItem('পক্ষে', 5, Colors.green),
          _buildTallyItem('বিপক্ষে', 2, Colors.red),
          _buildTallyItem('মোট', 7, Colors.blue),
        ],
      ),
    );
  }

  Widget _buildTallyItem(String label, int count, Color color) {
    return Column(
      children: [
        Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
        const SizedBox(height: 4),
        Text(
          count.toString(),
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
      ],
    );
  }

  void _castVote(BuildContext context, SquadDispute dispute, VoteType vote) {
    // TODO: Implement voting logic via ActionEngine
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Voted ${vote.nameBn}')),
    );
  }

  String _getTimeRemaining(DateTime? deadline) {
    if (deadline == null) return 'N/A';
    final now = DateTime.now();
    if (deadline.isBefore(now)) return 'শেষ';
    final diff = deadline.difference(now);
    return '${diff.inHours}ঘ ${diff.inMinutes.remainder(60)}মি';
  }

  IconData _getTypeIcon(DisputeType type) {
    switch (type) {
      case DisputeType.incomeSplit:
        return Icons.attach_money;
      case DisputeType.workDistribution:
        return Icons.work;
      case DisputeType.memberConduct:
        return Icons.person;
      case DisputeType.resourceUsage:
        return Icons.inventory;
      case DisputeType.decisionMaking:
        return Icons.gavel;
      case DisputeType.other:
        return Icons.help_outline;
    }
  }

  String _getTypeName(DisputeType type) {
    switch (type) {
      case DisputeType.incomeSplit:
        return 'আয় বন্টন';
      case DisputeType.workDistribution:
        return 'কাজ বন্টন';
      case DisputeType.memberConduct:
        return 'সদস্য আচরণ';
      case DisputeType.resourceUsage:
        return 'সম্পদ ব্যবহার';
      case DisputeType.decisionMaking:
        return 'সিদ্ধান্ত গ্রহণ';
      case DisputeType.other:
        return 'অন্যান্য';
    }
  }

  Widget _buildStatusBadge(DisputeStatus status) {
    final color = _getStatusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withOpacity(0.5)),
      ),
      child: Text(
        status.nameBn,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }

  Widget _buildEvidenceSection(SquadDispute dispute) {
    if (dispute.evidence.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'প্রমাণ (Evidence)',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 80,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: dispute.evidence.length,
            separatorBuilder: (context, index) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final evidence = dispute.evidence[index];
              return Container(
                width: 80,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.grey.shade300),
                  image: evidence.fileUrl != null 
                      ? DecorationImage(
                          image: NetworkImage(evidence.fileUrl!),
                          fit: BoxFit.cover,
                        )
                      : null,
                ),
                child: evidence.fileUrl == null
                    ? const Center(child: Icon(Icons.description))
                    : null,
              );
            },
          ),
        ),
      ],
    );
  }

  SquadDispute _getMockDispute(String id) {
    return SquadDispute(
      id: 'disp_123',
      squadId: 'sq_456',
      title: 'পেমেন্ট নিয়ে বিরোধ',
      type: DisputeType.incomeSplit,
      description: 'গতকালের ডেলিভারি পেমেন্ট সঠিকভাবে ভাগ করা হয়নি।',
      filedBy: 'usr_789',
      defendants: ['usr_101'],
      status: DisputeStatus.voting,
      filedAt: DateTime.now().subtract(const Duration(days: 1)),
      votingStartedAt: DateTime.now().subtract(const Duration(hours: 12)),
      evidence: [
        DisputeEvidence(
          id: 'ev_1',
          type: EvidenceType.image,
          title: 'Receipt',
          description: 'Payment receipt',
          submittedBy: 'usr_789',
          submittedAt: DateTime.now(),
          fileUrl: 'https://example.com/receipt1.jpg',
        ),
        DisputeEvidence(
          id: 'ev_2',
          type: EvidenceType.image,
          title: 'Chat Log',
          description: 'Chat screenshot',
          submittedBy: 'usr_789',
          submittedAt: DateTime.now(),
          fileUrl: 'https://example.com/chat_log.png',
        ),
      ],
      votes: [],
    );
  }
}
