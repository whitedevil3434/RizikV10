import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/squad_tribunal.dart';

/// Service for handling squad tribunal operations
class SquadTribunalService {
  /// Validate if a dispute can be filed
  static DisputeValidationResult validateDispute({
    required String squadId,
    required String filedBy,
    required List<String> defendants,
    required DisputeType type,
  }) {
    if (defendants.contains(filedBy)) {
      return DisputeValidationResult(
        isValid: false,
        reason: 'Cannot file dispute against yourself',
        reasonBn: 'নিজের বিরুদ্ধে বিরোধ দায়ের করতে পারবেন না',
      );
    }

    if (defendants.isEmpty) {
      return DisputeValidationResult(
        isValid: false,
        reason: 'At least one defendant is required',
        reasonBn: 'কমপক্ষে একজন বিবাদীর প্রয়োজন',
      );
    }

    if (defendants.length > 3) {
      return DisputeValidationResult(
        isValid: false,
        reason: 'Maximum 3 defendants allowed per dispute',
        reasonBn: 'প্রতি বিরোধে সর্বোচ্চ ৩ জন বিবাদী অনুমোদিত',
      );
    }

    return DisputeValidationResult(isValid: true);
  }

  /// Calculate voting weight for a member
  static double calculateVotingWeight({
    required String memberId,
    required Map<String, double> memberContributions,
    required Map<String, DateTime> memberJoinDates,
  }) {
    double weight = 1.0;

    final contribution = memberContributions[memberId] ?? 0.0;
    final avgContribution = memberContributions.values.isNotEmpty
        ? memberContributions.values.reduce((a, b) => a + b) / memberContributions.length
        : 0.0;

    if (avgContribution > 0) {
      final contributionRatio = contribution / avgContribution;
      weight *= (0.5 + contributionRatio).clamp(0.5, 2.0);
    }

    final joinDate = memberJoinDates[memberId];
    if (joinDate != null) {
      final daysInSquad = DateTime.now().difference(joinDate).inDays;
      final seniorityMultiplier = (1.0 + (daysInSquad / 365) * 0.1).clamp(1.0, 1.5);
      weight *= seniorityMultiplier;
    }

    return weight.clamp(0.1, 3.0);
  }

  /// Process a vote
  static VoteProcessingResult processVote({
    required SquadDispute dispute,
    required String voterId,
    required VoteType voteType,
    required double voterWeight,
    String? reason,
  }) {
    if (dispute.status != DisputeStatus.voting) {
      return VoteProcessingResult(
        success: false,
        reason: 'Dispute is not in voting phase',
        reasonBn: 'বিরোধ ভোটিং পর্যায়ে নেই',
      );
    }

    final existingVote = dispute.votes.where((v) => v.voterId == voterId).firstOrNull;
    if (existingVote != null) {
      return VoteProcessingResult(
        success: false,
        reason: 'You have already voted on this dispute',
        reasonBn: 'আপনি ইতিমধ্যে এই বিরোধে ভোট দিয়েছেন',
      );
    }

    if (dispute.filedBy == voterId || dispute.defendants.contains(voterId)) {
      return VoteProcessingResult(
        success: false,
        reason: 'Involved parties cannot vote',
        reasonBn: 'জড়িত পক্ষরা ভোট দিতে পারবেন না',
      );
    }

    final vote = TribunalVote(
      id: 'vote_${DateTime.now().millisecondsSinceEpoch}',
      disputeId: dispute.id,
      voterId: voterId,
      voteType: voteType,
      reason: reason,
      votedAt: DateTime.now(),
      weight: voterWeight,
    );

    return VoteProcessingResult(
      success: true,
      vote: vote,
    );
  }

  /// Check if voting should be concluded
  static VotingConclusionResult checkVotingConclusion({
    required SquadDispute dispute,
    required int totalEligibleVoters,
    int minimumVotingPeriodHours = 24,
    double minimumParticipationRate = 0.6,
  }) {
    if (dispute.status != DisputeStatus.voting || dispute.votingStartedAt == null) {
      return VotingConclusionResult(shouldConclude: false);
    }

    final votingDuration = DateTime.now().difference(dispute.votingStartedAt!);
    final hasMinimumTime = votingDuration.inHours >= minimumVotingPeriodHours;
    final participationRate = dispute.totalVotes / totalEligibleVoters;
    final hasMinimumParticipation = participationRate >= minimumParticipationRate;

    final maxVotingHours = 72;
    final hasMaxTime = votingDuration.inHours >= maxVotingHours;

    final shouldConclude = hasMaxTime || (hasMinimumTime && hasMinimumParticipation);

    return VotingConclusionResult(
      shouldConclude: shouldConclude,
      participationRate: participationRate,
      votingDurationHours: votingDuration.inHours,
      reason: hasMaxTime
          ? 'Maximum voting time reached'
          : hasMinimumParticipation
              ? 'Minimum participation achieved'
              : 'Waiting for more votes',
    );
  }

  /// Generate tribunal decision
  static TribunalDecision generateDecision({
    required SquadDispute dispute,
    required String reasoning,
  }) {
    final favorVotes = dispute.favorVotes;
    final againstVotes = dispute.againstVotes;
    final abstainVotes = dispute.abstainVotes;

    final isPassed = favorVotes > againstVotes;
    final decision = isPassed ? 'Dispute upheld' : 'Dispute rejected';

    final enforcement = _generateEnforcementActions(dispute, isPassed);

    return TribunalDecision(
      id: 'decision_${DateTime.now().millisecondsSinceEpoch}',
      disputeId: dispute.id,
      decision: decision,
      reasoning: reasoning,
      enforcement: enforcement,
      decidedAt: DateTime.now(),
      favorVotes: favorVotes,
      againstVotes: againstVotes,
      abstainVotes: abstainVotes,
      appealDeadline: DateTime.now().add(const Duration(days: 7)),
    );
  }

  /// Generate enforcement actions based on dispute type and outcome
  static Map<String, dynamic> _generateEnforcementActions(
    SquadDispute dispute,
    bool isPassed,
  ) {
    if (!isPassed) {
      return {
        'type': 'no_action',
        'description': 'No enforcement action required',
        'actions': [],
      };
    }

    switch (dispute.type) {
      case DisputeType.incomeSplit:
        return {
          'type': 'income_adjustment',
          'description': 'Adjust income split as per tribunal decision',
          'actions': [
            {'action': 'recalculate_splits', 'effective_date': DateTime.now().toIso8601String()},
            {'action': 'notify_members', 'message': 'Income split has been adjusted'},
          ],
        };
      case DisputeType.workDistribution:
        return {
          'type': 'work_reallocation',
          'description': 'Redistribute work assignments',
          'actions': [
            {'action': 'reassign_tasks', 'effective_date': DateTime.now().toIso8601String()},
            {'action': 'update_responsibilities', 'notify': true},
          ],
        };
      case DisputeType.memberConduct:
        return {
          'type': 'conduct_penalty',
          'description': 'Apply conduct penalty to member',
          'actions': [
            {'action': 'trust_score_penalty', 'amount': -0.5},
            {'action': 'warning_issued', 'severity': 'formal'},
            {'action': 'probation_period', 'duration_days': 30},
          ],
        };
      case DisputeType.resourceUsage:
        return {
          'type': 'resource_restriction',
          'description': 'Restrict resource access',
          'actions': [
            {'action': 'limit_resource_access', 'duration_days': 14},
            {'action': 'require_approval', 'for_resources': true},
          ],
        };
      case DisputeType.decisionMaking:
        return {
          'type': 'decision_override',
          'description': 'Override previous decision',
          'actions': [
            {'action': 'reverse_decision', 'decision_id': dispute.metadata?['decision_id']},
            {'action': 'implement_new_process', 'notify': true},
          ],
        };
      case DisputeType.other:
        return {
          'type': 'custom_action',
          'description': 'Custom enforcement as per tribunal decision',
          'actions': [
            {'action': 'manual_review', 'required': true},
            {'action': 'follow_up', 'in_days': 7},
          ],
        };
    }
  }

  /// Execute enforcement actions
  static Future<EnforcementResult> executeEnforcement({
    required TribunalDecision decision,
    required String squadId,
  }) async {
    try {
      final enforcement = decision.enforcement;
      final actions = enforcement['actions'] as List<dynamic>? ?? [];
      final executedActions = <String>[];

      for (final actionData in actions) {
        final action = actionData as Map<String, dynamic>;
        final actionType = action['action'] as String;

        switch (actionType) {
          case 'trust_score_penalty':
            executedActions.add('Applied trust score penalty');
            break;
          case 'recalculate_splits':
            executedActions.add('Recalculated income splits');
            break;
          case 'notify_members':
            executedActions.add('Notified squad members');
            break;
          case 'warning_issued':
            executedActions.add('Issued formal warning');
            break;
          default:
            executedActions.add('Executed: $actionType');
        }
      }

      return EnforcementResult(
        success: true,
        executedActions: executedActions,
        executedAt: DateTime.now(),
      );
    } catch (e) {
      return EnforcementResult(
        success: false,
        error: e.toString(),
        executedAt: DateTime.now(),
      );
    }
  }

  /// Calculate dispute statistics
  static DisputeStatistics calculateStatistics(List<SquadDispute> disputes) {
    final total = disputes.length;
    final resolved = disputes.where((d) => d.isResolved).length;
    final active = disputes.where((d) => d.isActive).length;
    final appealed = disputes.where((d) => d.status == DisputeStatus.appealed).length;

    final avgResolutionTime = disputes
        .where((d) => d.isResolved && d.resolvedAt != null)
        .map((d) => d.resolvedAt!.difference(d.filedAt).inDays)
        .fold(0, (sum, days) => sum + days) / 
        (resolved > 0 ? resolved : 1);

    final typeDistribution = <DisputeType, int>{};
    for (final dispute in disputes) {
      typeDistribution[dispute.type] = (typeDistribution[dispute.type] ?? 0) + 1;
    }

    return DisputeStatistics(
      totalDisputes: total,
      resolvedDisputes: resolved,
      activeDisputes: active,
      appealedDisputes: appealed,
      resolutionRate: total > 0 ? (resolved / total * 100) : 0,
      averageResolutionDays: avgResolutionTime.round(),
      typeDistribution: typeDistribution,
    );
  }
}

/// Dispute validation result
class DisputeValidationResult {
  final bool isValid;
  final String? reason;
  final String? reasonBn;

  DisputeValidationResult({
    required this.isValid,
    this.reason,
    this.reasonBn,
  });

  String getMessage(bool bengali) {
    if (isValid) return '';
    return bengali ? (reasonBn ?? reason ?? '') : (reason ?? '');
  }
}

/// Vote processing result
class VoteProcessingResult {
  final bool success;
  final TribunalVote? vote;
  final String? reason;
  final String? reasonBn;

  VoteProcessingResult({
    required this.success,
    this.vote,
    this.reason,
    this.reasonBn,
  });

  String getMessage(bool bengali) {
    if (success) return '';
    return bengali ? (reasonBn ?? reason ?? '') : (reason ?? '');
  }
}

/// Voting conclusion result
class VotingConclusionResult {
  final bool shouldConclude;
  final double? participationRate;
  final int? votingDurationHours;
  final String? reason;

  VotingConclusionResult({
    required this.shouldConclude,
    this.participationRate,
    this.votingDurationHours,
    this.reason,
  });
}

/// Enforcement result
class EnforcementResult {
  final bool success;
  final List<String>? executedActions;
  final DateTime executedAt;
  final String? error;

  EnforcementResult({
    required this.success,
    this.executedActions,
    required this.executedAt,
    this.error,
  });
}

/// Dispute statistics
class DisputeStatistics {
  final int totalDisputes;
  final int resolvedDisputes;
  final int activeDisputes;
  final int appealedDisputes;
  final double resolutionRate;
  final int averageResolutionDays;
  final Map<DisputeType, int> typeDistribution;

  DisputeStatistics({
    required this.totalDisputes,
    required this.resolvedDisputes,
    required this.activeDisputes,
    required this.appealedDisputes,
    required this.resolutionRate,
    required this.averageResolutionDays,
    required this.typeDistribution,
  });
}
