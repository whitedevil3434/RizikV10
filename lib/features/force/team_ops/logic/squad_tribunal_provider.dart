import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/squad_tribunal.dart';
import 'package:rizik_v4/data/remote/squad_tribunal_service.dart';

/// Provider for managing squad tribunal state
class SquadTribunalProvider with ChangeNotifier {
  List<SquadDispute> _disputes = [];
  bool _isLoading = false;
  String? _error;

  List<SquadDispute> get disputes => _disputes;
  bool get isLoading => _isLoading;
  String? get error => _error;

  SquadTribunalProvider() {
    _loadDisputes();
  }

  /// Get disputes for a specific squad
  List<SquadDispute> getDisputesForSquad(String squadId) {
    return _disputes.where((d) => d.squadId == squadId).toList();
  }

  /// Get active disputes
  List<SquadDispute> get activeDisputes {
    return _disputes.where((d) => d.isActive).toList();
  }

  /// Get resolved disputes
  List<SquadDispute> get resolvedDisputes {
    return _disputes.where((d) => d.isResolved).toList();
  }

  /// Get disputes where user can vote
  List<SquadDispute> getVotableDisputes(String userId) {
    return _disputes.where((d) => 
      d.canVote && 
      !d.votes.any((v) => v.voterId == userId) &&
      d.filedBy != userId &&
      !d.defendants.contains(userId)
    ).toList();
  }

  /// Load disputes from storage
  Future<void> _loadDisputes() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final disputesJson = prefs.getStringList('squad_disputes') ?? [];
      
      _disputes = disputesJson
          .map((json) => SquadDispute.fromJson(jsonDecode(json) as Map<String, dynamic>))
          .toList();

      _error = null;
    } catch (e) {
      _error = 'Failed to load disputes: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save disputes to storage
  Future<void> _saveDisputes() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final disputesJson = _disputes
          .map((dispute) => jsonEncode(dispute.toJson()))
          .toList();
      await prefs.setStringList('squad_disputes', disputesJson);
    } catch (e) {
      debugPrint('Error saving disputes: $e');
    }
  }

  /// File a new dispute
  Future<void> fileDispute({
    required String squadId,
    required DisputeType type,
    required String title,
    required String description,
    required String filedBy,
    required List<String> defendants,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Validate dispute
      final validation = SquadTribunalService.validateDispute(
        squadId: squadId,
        filedBy: filedBy,
        defendants: defendants,
        type: type,
      );

      if (!validation.isValid) {
        throw Exception(validation.reason ?? 'Invalid dispute');
      }

      // Create dispute
      final dispute = SquadDispute.create(
        squadId: squadId,
        type: type,
        title: title,
        description: description,
        filedBy: filedBy,
        defendants: defendants,
      );

      _disputes.add(dispute);
      await _saveDisputes();

      // Auto-start review after 24 hours (simulated)
      _scheduleReviewStart(dispute.id);

      _error = null;
    } catch (e) {
      _error = 'Failed to file dispute: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Add evidence to a dispute
  Future<void> addEvidence({
    required String disputeId,
    required EvidenceType type,
    required String title,
    required String description,
    required String submittedBy,
    String? filePath,
    String? fileUrl,
    Map<String, dynamic>? metadata,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final disputeIndex = _disputes.indexWhere((d) => d.id == disputeId);
      if (disputeIndex == -1) {
        throw Exception('Dispute not found');
      }

      final dispute = _disputes[disputeIndex];

      // Check if dispute allows evidence submission
      if (dispute.status == DisputeStatus.resolved || dispute.status == DisputeStatus.closed) {
        throw Exception('Cannot add evidence to resolved dispute');
      }

      final evidence = DisputeEvidence(
        id: 'evidence_${DateTime.now().millisecondsSinceEpoch}',
        type: type,
        title: title,
        description: description,
        filePath: filePath,
        fileUrl: fileUrl,
        submittedBy: submittedBy,
        submittedAt: DateTime.now(),
        metadata: metadata,
      );

      final updatedEvidence = [...dispute.evidence, evidence];
      _disputes[disputeIndex] = dispute.copyWith(evidence: updatedEvidence);

      await _saveDisputes();
      _error = null;
    } catch (e) {
      _error = 'Failed to add evidence: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Start voting phase
  Future<void> startVoting(String disputeId) async {
    try {
      _isLoading = true;
      notifyListeners();

      final disputeIndex = _disputes.indexWhere((d) => d.id == disputeId);
      if (disputeIndex == -1) {
        throw Exception('Dispute not found');
      }

      final dispute = _disputes[disputeIndex];
      if (dispute.status != DisputeStatus.underReview) {
        throw Exception('Dispute must be under review to start voting');
      }

      _disputes[disputeIndex] = dispute.copyWith(
        status: DisputeStatus.voting,
        votingStartedAt: DateTime.now(),
      );

      await _saveDisputes();

      // Schedule voting conclusion check
      _scheduleVotingConclusion(disputeId);

      _error = null;
    } catch (e) {
      _error = 'Failed to start voting: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Submit a vote
  Future<void> submitVote({
    required String disputeId,
    required String voterId,
    required VoteType voteType,
    required double voterWeight,
    String? reason,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final disputeIndex = _disputes.indexWhere((d) => d.id == disputeId);
      if (disputeIndex == -1) {
        throw Exception('Dispute not found');
      }

      final dispute = _disputes[disputeIndex];

      // Process vote
      final voteResult = SquadTribunalService.processVote(
        dispute: dispute,
        voterId: voterId,
        voteType: voteType,
        voterWeight: voterWeight,
        reason: reason,
      );

      if (!voteResult.success) {
        throw Exception(voteResult.reason ?? 'Failed to process vote');
      }

      // Add vote to dispute
      final updatedVotes = [...dispute.votes, voteResult.vote!];
      _disputes[disputeIndex] = dispute.copyWith(votes: updatedVotes);

      await _saveDisputes();
      _error = null;
    } catch (e) {
      _error = 'Failed to submit vote: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Conclude voting and generate decision
  Future<void> concludeVoting({
    required String disputeId,
    required int totalEligibleVoters,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final disputeIndex = _disputes.indexWhere((d) => d.id == disputeId);
      if (disputeIndex == -1) {
        throw Exception('Dispute not found');
      }

      final dispute = _disputes[disputeIndex];

      // Check if voting can be concluded
      final conclusion = SquadTribunalService.checkVotingConclusion(
        dispute: dispute,
        totalEligibleVoters: totalEligibleVoters,
      );

      if (!conclusion.shouldConclude) {
        throw Exception('Voting cannot be concluded yet');
      }

      // Generate decision
      final reasoning = _generateDecisionReasoning(dispute, conclusion);
      final decision = SquadTribunalService.generateDecision(
        dispute: dispute,
        reasoning: reasoning,
      );

      // Update dispute
      _disputes[disputeIndex] = dispute.copyWith(
        status: DisputeStatus.resolved,
        resolvedAt: DateTime.now(),
        decision: decision,
      );

      await _saveDisputes();

      // Execute enforcement
      await _executeEnforcement(decision, dispute.squadId);

      _error = null;
    } catch (e) {
      _error = 'Failed to conclude voting: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// File an appeal
  Future<void> fileAppeal({
    required String disputeId,
    required String appealReason,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final disputeIndex = _disputes.indexWhere((d) => d.id == disputeId);
      if (disputeIndex == -1) {
        throw Exception('Dispute not found');
      }

      final dispute = _disputes[disputeIndex];
      if (dispute.decision == null || !dispute.decision!.canAppeal) {
        throw Exception('This dispute cannot be appealed');
      }

      _disputes[disputeIndex] = dispute.copyWith(
        status: DisputeStatus.appealed,
        appealReason: appealReason,
        appealedAt: DateTime.now(),
      );

      await _saveDisputes();
      _error = null;
    } catch (e) {
      _error = 'Failed to file appeal: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get dispute statistics
  DisputeStatistics getStatistics() {
    return SquadTribunalService.calculateStatistics(_disputes);
  }

  /// Get dispute by ID
  SquadDispute? getDisputeById(String disputeId) {
    try {
      return _disputes.firstWhere((d) => d.id == disputeId);
    } catch (e) {
      return null;
    }
  }

  /// Schedule review start (simulated)
  void _scheduleReviewStart(String disputeId) {
    // In a real app, this would be handled by a background service
    Future.delayed(const Duration(seconds: 5), () {
      final disputeIndex = _disputes.indexWhere((d) => d.id == disputeId);
      if (disputeIndex != -1) {
        _disputes[disputeIndex] = _disputes[disputeIndex].copyWith(
          status: DisputeStatus.underReview,
          reviewStartedAt: DateTime.now(),
        );
        _saveDisputes();
        notifyListeners();
      }
    });
  }

  /// Schedule voting conclusion check (simulated)
  void _scheduleVotingConclusion(String disputeId) {
    // In a real app, this would be handled by a background service
    Future.delayed(const Duration(minutes: 1), () {
      final dispute = getDisputeById(disputeId);
      if (dispute != null && dispute.status == DisputeStatus.voting) {
        // Auto-conclude if conditions are met
        concludeVoting(disputeId: disputeId, totalEligibleVoters: 5); // Simulated
      }
    });
  }

  /// Generate decision reasoning
  String _generateDecisionReasoning(SquadDispute dispute, VotingConclusionResult conclusion) {
    final favorVotes = dispute.favorVotes;
    final againstVotes = dispute.againstVotes;
    final totalVotes = favorVotes + againstVotes + dispute.abstainVotes;
    final favorPercentage = totalVotes > 0 ? (favorVotes / totalVotes * 100) : 0;
    final againstPercentage = totalVotes > 0 ? (againstVotes / totalVotes * 100) : 0;

    final outcome = favorVotes > againstVotes ? 'upheld' : 'rejected';

    return '''
Tribunal Decision Reasoning:

Voting Summary:
- Total Votes Cast: ${totalVotes.toStringAsFixed(1)}
- In Favor: ${favorVotes.toStringAsFixed(1)} (${favorPercentage.toStringAsFixed(1)}%)
- Against: ${againstVotes.toStringAsFixed(1)} (${againstPercentage.toStringAsFixed(1)}%)
- Abstain: ${dispute.abstainVotes.toStringAsFixed(1)}

Participation Rate: ${((conclusion.participationRate ?? 0) * 100).toStringAsFixed(1)}%
Voting Duration: ${conclusion.votingDurationHours ?? 0} hours

Decision: The dispute is $outcome based on the majority vote of eligible squad members.

The tribunal has carefully considered all evidence submitted and the votes cast by squad members. This decision is binding and will be enforced according to squad policies.
''';
  }

  /// Execute enforcement actions
  Future<void> _executeEnforcement(TribunalDecision decision, String squadId) async {
    try {
      final result = await SquadTribunalService.executeEnforcement(
        decision: decision,
        squadId: squadId,
      );

      if (!result.success) {
        debugPrint('Enforcement failed: ${result.error}');
      } else {
        debugPrint('Enforcement executed: ${result.executedActions?.join(', ')}');
      }
    } catch (e) {
      debugPrint('Error executing enforcement: $e');
    }
  }

  /// Refresh disputes
  Future<void> refresh() async {
    await _loadDisputes();
  }

  /// Clear all disputes (for testing)
  @visibleForTesting
  Future<void> clearDisputes() async {
    _disputes.clear();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('squad_disputes');
    notifyListeners();
  }
}
