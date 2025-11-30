import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/squad.dart';

/// Service for splitting income among squad members
/// Implements role-based weightage and automatic distribution
class IncomeSplittingService {
  /// Default role weightages for Maker squads
  static const Map<SquadRole, double> defaultMakerWeightage = {
    SquadRole.chef: 45.0,
    SquadRole.buyer: 30.0,
    SquadRole.cutter: 25.0,
    SquadRole.leader: 40.0,
    SquadRole.helper: 20.0,
    SquadRole.member: 15.0,
  };

  /// Default role weightages for Mover squads
  static const Map<SquadRole, double> defaultMoverWeightage = {
    SquadRole.driver: 50.0,
    SquadRole.helper: 30.0,
    SquadRole.leader: 45.0,
    SquadRole.member: 20.0,
  };

  /// Default role weightages for Family squads (equal split)
  static const Map<SquadRole, double> defaultFamilyWeightage = {
    SquadRole.leader: 25.0,
    SquadRole.member: 25.0,
  };

  /// Calculate income distribution based on squad type and roles
  static Map<String, double> calculateDistribution({
    required Squad squad,
    required double totalAmount,
    Map<SquadRole, double>? customWeightage,
  }) {
    // Get weightage based on squad type or use custom
    final weightage = customWeightage ?? _getDefaultWeightage(squad.type);

    // Calculate total weight points
    double totalWeight = 0.0;
    for (final member in squad.members.where((m) => m.isActive)) {
      totalWeight += weightage[member.role] ?? 0.0;
    }

    // If no weight, distribute equally
    if (totalWeight == 0.0) {
      return _distributeEqually(squad, totalAmount);
    }

    // Calculate distribution
    final distribution = <String, double>{};
    for (final member in squad.members.where((m) => m.isActive)) {
      final memberWeight = weightage[member.role] ?? 0.0;
      final percentage = (memberWeight / totalWeight) * 100;
      distribution[member.userId] = percentage;
    }

    return distribution;
  }

  /// Calculate actual amounts from percentages
  static Map<String, double> calculateAmounts({
    required Map<String, double> distribution,
    required double totalAmount,
  }) {
    final amounts = <String, double>{};
    for (final entry in distribution.entries) {
      amounts[entry.key] = (totalAmount * entry.value) / 100;
    }
    return amounts;
  }

  /// Distribute equally among active members
  static Map<String, double> _distributeEqually(Squad squad, double totalAmount) {
    final activeMembers = squad.members.where((m) => m.isActive).toList();
    if (activeMembers.isEmpty) return {};

    final percentage = 100.0 / activeMembers.length;
    return {
      for (final member in activeMembers) member.userId: percentage,
    };
  }

  /// Get default weightage for squad type
  static Map<SquadRole, double> _getDefaultWeightage(SquadType type) {
    switch (type) {
      case SquadType.maker:
        return defaultMakerWeightage;
      case SquadType.mover:
        return defaultMoverWeightage;
      case SquadType.family:
        return defaultFamilyWeightage;
    }
  }

  /// Validate distribution (should sum to 100%)
  static bool validateDistribution(Map<String, double> distribution) {
    final total = distribution.values.fold(0.0, (sum, val) => sum + val);
    return (total - 100.0).abs() < 0.01; // Allow small floating point errors
  }

  /// Adjust distribution to ensure it sums to exactly 100%
  static Map<String, double> normalizeDistribution(
    Map<String, double> distribution,
  ) {
    final total = distribution.values.fold(0.0, (sum, val) => sum + val);
    if (total == 0.0) return distribution;

    return distribution.map((key, value) => MapEntry(key, (value / total) * 100));
  }

  /// Calculate bonus distribution for completing mission chains
  static Map<String, double> calculateBonusDistribution({
    required Squad squad,
    required double bonusAmount,
    required List<String> participantIds,
  }) {
    // Only participants get bonus, split equally
    if (participantIds.isEmpty) return {};

    final percentage = 100.0 / participantIds.length;
    return {
      for (final userId in participantIds) userId: percentage,
    };
  }

  /// Get suggested weightage for a role
  static double getSuggestedWeightage(SquadType type, SquadRole role) {
    final weightage = _getDefaultWeightage(type);
    return weightage[role] ?? 20.0;
  }

  /// Create income split record
  static IncomeSplitRecord createSplitRecord({
    required String squadId,
    required double totalAmount,
    required Map<String, double> distribution,
    required String source, // 'order', 'mission', 'bonus'
    String? referenceId,
  }) {
    final amounts = calculateAmounts(
      distribution: distribution,
      totalAmount: totalAmount,
    );

    return IncomeSplitRecord(
      id: 'split_${DateTime.now().millisecondsSinceEpoch}',
      squadId: squadId,
      totalAmount: totalAmount,
      distribution: distribution,
      amounts: amounts,
      source: source,
      referenceId: referenceId,
      timestamp: DateTime.now(),
    );
  }

  /// Calculate member's share from multiple splits
  static double calculateMemberTotal(
    String userId,
    List<IncomeSplitRecord> splits,
  ) {
    return splits.fold(0.0, (sum, split) {
      return sum + (split.amounts[userId] ?? 0.0);
    });
  }

  /// Get member's earning history
  static List<IncomeSplitRecord> getMemberHistory(
    String userId,
    List<IncomeSplitRecord> allSplits,
  ) {
    return allSplits
        .where((split) => split.amounts.containsKey(userId))
        .toList();
  }

  /// Calculate average earnings per member
  static Map<String, double> calculateAverageEarnings(
    Squad squad,
    List<IncomeSplitRecord> splits,
  ) {
    final totals = <String, double>{};
    final counts = <String, int>{};

    for (final split in splits) {
      for (final entry in split.amounts.entries) {
        totals[entry.key] = (totals[entry.key] ?? 0.0) + entry.value;
        counts[entry.key] = (counts[entry.key] ?? 0) + 1;
      }
    }

    return totals.map((userId, total) {
      final count = counts[userId] ?? 1;
      return MapEntry(userId, total / count);
    });
  }

  /// Suggest role adjustments based on performance
  static Map<String, String> suggestRoleAdjustments(
    Squad squad,
    List<IncomeSplitRecord> recentSplits,
  ) {
    final suggestions = <String, String>{};
    final averages = calculateAverageEarnings(squad, recentSplits);

    // Find top performers
    final sortedMembers = averages.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));

    if (sortedMembers.length >= 2) {
      final topPerformer = sortedMembers.first;
      final member = squad.members.firstWhere(
        (m) => m.userId == topPerformer.key,
        orElse: () => squad.members.first,
      );

      if (member.role != SquadRole.leader &&
          topPerformer.value > averages.values.reduce((a, b) => a + b) /
              averages.length *
              1.5) {
        suggestions[member.userId] =
            'Consider promoting to a higher role based on performance';
      }
    }

    return suggestions;
  }
  /// Calculate dynamic distribution based on Role, Performance, and Equality
  static Map<String, double> calculateDynamicDistribution({
    required Squad squad,
    required double totalAmount,
    double roleWeight = 0.5, // 50%
    double taskWeight = 0.3, // 30%
    double equalityWeight = 0.2, // 20%
  }) {
    final activeMembers = squad.members.where((m) => m.isActive).toList();
    if (activeMembers.isEmpty) return {};

    final distribution = <String, double>{};
    final roleBase = _getDefaultWeightage(squad.type);
    
    // 1. Calculate Total Role Points
    double totalRolePoints = 0.0;
    for (final member in activeMembers) {
      totalRolePoints += roleBase[member.role] ?? 0.0;
    }

    // 2. Calculate Total Tasks
    int totalTasks = 0;
    for (final member in activeMembers) {
      totalTasks += member.completedTasks;
    }

    // 3. Calculate Shares
    for (final member in activeMembers) {
      double share = 0.0;

      // A. Role Component
      if (totalRolePoints > 0) {
        final rolePoints = roleBase[member.role] ?? 0.0;
        share += (rolePoints / totalRolePoints) * roleWeight * 100;
      }

      // B. Task Component
      if (totalTasks > 0) {
        share += (member.completedTasks / totalTasks) * taskWeight * 100;
      } else {
        // If no tasks recorded, fallback to equal split for this portion
        share += (1.0 / activeMembers.length) * taskWeight * 100;
      }

      // C. Equality Component
      share += (1.0 / activeMembers.length) * equalityWeight * 100;

      distribution[member.userId] = share;
    }

    return normalizeDistribution(distribution);
  }

  /// Simulate distribution to preview amounts
  static Map<String, double> simulateDistribution({
    required Squad squad,
    required double totalAmount,
    bool useDynamic = false,
  }) {
    final distribution = useDynamic
        ? calculateDynamicDistribution(squad: squad, totalAmount: totalAmount)
        : calculateDistribution(squad: squad, totalAmount: totalAmount);
        
    return calculateAmounts(
      distribution: distribution,
      totalAmount: totalAmount,
    );
  }
}

/// Income split record model
class IncomeSplitRecord {
  final String id;
  final String squadId;
  final double totalAmount;
  final Map<String, double> distribution; // userId -> percentage
  final Map<String, double> amounts; // userId -> actual amount
  final String source; // 'order', 'mission', 'bonus'
  final String? referenceId; // Order ID, Mission ID, etc.
  final DateTime timestamp;

  const IncomeSplitRecord({
    required this.id,
    required this.squadId,
    required this.totalAmount,
    required this.distribution,
    required this.amounts,
    required this.source,
    this.referenceId,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'squad_id': squadId,
      'total_amount': totalAmount,
      'distribution': distribution,
      'amounts': amounts,
      'source': source,
      'reference_id': referenceId,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory IncomeSplitRecord.fromJson(Map<String, dynamic> json) {
    return IncomeSplitRecord(
      id: json['id'] as String,
      squadId: json['squad_id'] as String,
      totalAmount: (json['total_amount'] as num).toDouble(),
      distribution: Map<String, double>.from(json['distribution']),
      amounts: Map<String, double>.from(json['amounts']),
      source: json['source'] as String,
      referenceId: json['reference_id'] as String?,
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}

/// Income splitting configuration
class IncomeSplitConfig {
  final String squadId;
  final Map<SquadRole, double> customWeightage;
  final bool autoSplit; // Auto-split on order completion
  final bool requiresApproval; // Leader must approve splits
  final DateTime lastUpdated;

  const IncomeSplitConfig({
    required this.squadId,
    required this.customWeightage,
    this.autoSplit = true,
    this.requiresApproval = false,
    required this.lastUpdated,
  });

  Map<String, dynamic> toJson() {
    return {
      'squad_id': squadId,
      'custom_weightage': customWeightage.map(
        (key, value) => MapEntry(key.key, value),
      ),
      'auto_split': autoSplit,
      'requires_approval': requiresApproval,
      'last_updated': lastUpdated.toIso8601String(),
    };
  }

  factory IncomeSplitConfig.fromJson(Map<String, dynamic> json) {
    final weightageMap = (json['custom_weightage'] as Map<String, dynamic>).map(
      (key, value) => MapEntry(
        SquadRole.values.firstWhere((r) => r.key == key),
        (value as num).toDouble(),
      ),
    );

    return IncomeSplitConfig(
      squadId: json['squad_id'] as String,
      customWeightage: weightageMap,
      autoSplit: json['auto_split'] as bool? ?? true,
      requiresApproval: json['requires_approval'] as bool? ?? false,
      lastUpdated: DateTime.parse(json['last_updated'] as String),
    );
  }

  factory IncomeSplitConfig.createDefault(String squadId, SquadType type) {
    return IncomeSplitConfig(
      squadId: squadId,
      customWeightage: IncomeSplittingService._getDefaultWeightage(type),
      autoSplit: true,
      requiresApproval: false,
      lastUpdated: DateTime.now(),
    );
  }
}
