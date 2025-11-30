import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rizik_v4/data/models/squad.dart';
import 'package:rizik_v4/data/remote/income_splitting_service.dart';
import 'package:rizik_v4/data/remote/supabase/squad_service.dart';
import 'package:rizik_v4/data/remote/supabase/wallet_service.dart';

/// Provider for managing squads using Supabase
class SquadProvider with ChangeNotifier {
  final SquadService _squadService = SquadService();
  final WalletService _walletService = WalletService();
  
  List<Squad> _squads = [];
  bool _isLoading = false;
  String? _error;

  List<Squad> get squads => _squads;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Get current user ID from Supabase Auth
  String? get _currentUserId {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      return user?.id ?? 'user_001'; // Fallback for testing
    } catch (e) {
      debugPrint('Supabase not initialized: $e');
      return null; // Return null if Supabase not initialized
    }
  }

  SquadProvider() {
    // Don't load immediately - wait for Supabase initialization
    // Call loadSquads() manually after Supabase is ready
  }

  /// Load squads from Supabase
  Future<void> loadSquads() async {
    try {
      if (_currentUserId == null) {
        _error = 'Supabase not initialized';
        debugPrint(_error);
        return;
      }
      
      _isLoading = true;
      notifyListeners();

      _squads = await _squadService.getUserSquads(_currentUserId!);
      _error = null;
    } catch (e) {
      _error = 'Failed to load squads: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get squad by ID
  Squad? getSquadById(String id) {
    try {
      return _squads.firstWhere((s) => s.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Get squads where user is a member
  List<Squad> getUserSquads(String userId) {
    return _squads.where((s) => s.isMember(userId)).toList();
  }

  /// Get squads by type
  List<Squad> getSquadsByType(SquadType type) {
    return _squads.where((s) => s.type == type).toList();
  }

  /// Create a new squad
  Future<Squad> createSquad({
    required String name,
    required String nameBn,
    required SquadType type,
    required SquadMember leader,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final squad = await _squadService.createSquad(
        name: name,
        nameBn: nameBn,
        type: type,
        creatorId: leader.userId,
      );

      _squads.add(squad);
      _error = null;
      return squad;
    } catch (e) {
      _error = 'Failed to create squad: $e';
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Add member to squad
  Future<bool> addMember({
    required String squadId,
    required SquadMember member,
  }) async {
    try {
      await _squadService.addMember(
        squadId: squadId,
        userId: member.userId,
        role: member.role,
      );
      
      // Refresh squads to get updated list
      await loadSquads();
      return true;
    } catch (e) {
      _error = 'Failed to add member: $e';
      notifyListeners();
      return false;
    }
  }

  /// Remove member from squad
  Future<bool> removeMember({
    required String squadId,
    required String userId,
  }) async {
    try {
      await _squadService.removeMember(
        squadId: squadId,
        userId: userId,
      );
      
      await loadSquads();
      return true;
    } catch (e) {
      _error = 'Failed to remove member: $e';
      notifyListeners();
      return false;
    }
  }

  /// Update member role
  Future<bool> updateMemberRole({
    required String squadId,
    required String userId,
    required SquadRole newRole,
  }) async {
    try {
      await _squadService.updateMemberRole(
        squadId: squadId,
        userId: userId,
        newRole: newRole,
      );
      
      await loadSquads();
      return true;
    } catch (e) {
      _error = 'Failed to update role: $e';
      notifyListeners();
      return false;
    }
  }

  /// Add contribution to shared wallet
  Future<bool> addContribution({
    required String squadId,
    required String memberId,
    required double amount,
  }) async {
    try {
      final squad = getSquadById(squadId);
      if (squad == null) return false;
      
      final wallet = squad.safeWallet;
      
      await _walletService.addTransaction(
        walletId: wallet.id,
        amount: amount,
        type: 'deposit',
        performedBy: memberId,
        description: 'Member contribution',
      );

      await loadSquads(); // Refresh to get updated balance
      return true;
    } catch (e) {
      _error = 'Failed to add contribution: $e';
      notifyListeners();
      return false;
    }
  }

  /// Withdraw from shared wallet (requires approval)
  Future<bool> requestWithdrawal({
    required String squadId,
    required String memberId,
    required double amount,
    required String description,
  }) async {
    try {
      final squad = getSquadById(squadId);
      if (squad == null) return false;
      
      final wallet = squad.safeWallet;

      await _walletService.addTransaction(
        walletId: wallet.id,
        amount: amount,
        type: 'withdrawal',
        performedBy: memberId,
        description: description,
        metadata: {
          'requires_approval': true,
          'approved_by': [memberId], // Requester auto-approves
        },
      );

      await loadSquads();
      return true;
    } catch (e) {
      _error = 'Failed to request withdrawal: $e';
      notifyListeners();
      return false;
    }
  }

  /// Approve withdrawal
  Future<bool> approveWithdrawal({
    required String squadId,
    required String transactionId,
    required String approverId,
  }) async {
    // TODO: Implement approval logic in WalletService or via DB function
    // For now, this is a placeholder as approval logic is complex and might need a separate table or metadata update
    return false; 
  }

  /// Lock funds for rent/utilities
  Future<bool> lockFunds({
    required String squadId,
    required double amount,
    required String description,
  }) async {
    // TODO: Implement lock funds logic in WalletService
    return false;
  }

  /// Distribute earnings to squad members
  Future<bool> distributeEarnings({
    required String squadId,
    required double totalAmount,
    required Map<String, double> distribution, // userId -> percentage
  }) async {
    try {
      final squad = getSquadById(squadId);
      if (squad == null) return false;
      
      final wallet = squad.safeWallet;

      // 1. Add earning to wallet
      await _walletService.addTransaction(
        walletId: wallet.id,
        amount: totalAmount,
        type: 'earning',
        performedBy: 'system',
        description: 'Squad earnings distribution',
      );

      // 2. Distribute to members (create individual transactions or update member stats)
      // This part needs more complex logic or a batch operation
      
      await loadSquads();
      return true;
    } catch (e) {
      _error = 'Failed to distribute earnings: $e';
      notifyListeners();
      return false;
    }
  }

  /// Delete squad
  Future<bool> deleteSquad(String squadId) async {
    // TODO: Implement delete in SquadService
    return false;
  }

  /// Split income among squad members
  Future<bool> splitIncome({
    required String squadId,
    required double totalAmount,
    required String source,
    String? referenceId,
    Map<SquadRole, double>? customWeightage,
    bool useDynamic = false, // New parameter
  }) async {
    final squadIndex = _squads.indexWhere((s) => s.id == squadId);
    if (squadIndex == -1) return false;

    final squad = _squads[squadIndex];

    // Calculate distribution
    final distribution = useDynamic
        ? IncomeSplittingService.calculateDynamicDistribution(
            squad: squad,
            totalAmount: totalAmount,
          )
        : IncomeSplittingService.calculateDistribution(
            squad: squad,
            totalAmount: totalAmount,
            customWeightage: customWeightage,
          );

    // Distribute earnings
    return await distributeEarnings(
      squadId: squadId,
      totalAmount: totalAmount,
      distribution: distribution,
    );
  }

  /// Preview income split
  Map<String, double> previewIncomeSplit({
    required String squadId,
    required double totalAmount,
    bool useDynamic = false,
  }) {
    final squad = getSquadById(squadId);
    if (squad == null) return {};

    return IncomeSplittingService.simulateDistribution(
      squad: squad,
      totalAmount: totalAmount,
      useDynamic: useDynamic,
    );
  }

  /// Get income split history for squad
  List<IncomeSplitRecord> getIncomeSplitHistory(String squadId) {
    final squad = getSquadById(squadId);
    if (squad == null) return [];

    final splits = squad.metadata?['income_splits'] as List<dynamic>?;
    if (splits == null) return [];

    return splits
        .map((json) => IncomeSplitRecord.fromJson(json as Map<String, dynamic>))
        .toList();
  }

  /// Get member's earning history
  List<IncomeSplitRecord> getMemberEarningHistory(
    String squadId,
    String userId,
  ) {
    final allSplits = getIncomeSplitHistory(squadId);
    return IncomeSplittingService.getMemberHistory(userId, allSplits);
  }

  /// Calculate member's total earnings
  double getMemberTotalEarnings(String squadId, String userId) {
    final splits = getIncomeSplitHistory(squadId);
    return IncomeSplittingService.calculateMemberTotal(userId, splits);
  }

  /// Update income split configuration
  Future<bool> updateSplitConfig({
    required String squadId,
    required Map<SquadRole, double> customWeightage,
    bool? autoSplit,
    bool? requiresApproval,
  }) async {
    // TODO: Implement update config in SquadService
    return false;
  }

  /// Get income split configuration
  IncomeSplitConfig? getSplitConfig(String squadId) {
    final squad = getSquadById(squadId);
    if (squad == null) return null;

    final configJson = squad.metadata?['split_config'] as Map<String, dynamic>?;
    if (configJson == null) {
      return IncomeSplitConfig.createDefault(squadId, squad.type);
    }

    return IncomeSplitConfig.fromJson(configJson);
  }
}
