import 'dart:math';
import 'package:flutter/foundation.dart';

/// Variable reward distributor for surprise coupons and bonuses
/// Uses probability distribution to create excitement and unpredictability
class VariableRewardDistributor {
  final Random _random = Random();
  final Map<String, List<DateTime>> _rewardHistory = {};
  
  // Reward cooldown to prevent abuse
  static const Duration rewardCooldown = Duration(hours: 1);
  static const int maxRewardsPerDay = 5;

  /// Generate a surprise reward based on probability distribution
  SurpriseReward? generateReward({
    required String userId,
    required RewardTrigger trigger,
    double? trustScoreMultiplier,
    int? auraLevel,
  }) {
    // Check if user is eligible for reward
    if (!_isEligibleForReward(userId)) {
      debugPrint('🚫 User $userId not eligible for reward (cooldown or limit)');
      return null;
    }

    // Calculate probability based on trigger and user stats
    final baseProbability = _getBaseProbability(trigger);
    final adjustedProbability = _adjustProbability(
      baseProbability,
      trustScoreMultiplier,
      auraLevel,
    );

    // Roll for reward
    final roll = _random.nextDouble();
    if (roll > adjustedProbability) {
      debugPrint('🎲 No reward: roll $roll > probability $adjustedProbability');
      return null;
    }

    // Generate reward type based on weighted distribution
    final rewardType = _selectRewardType();
    final reward = _createReward(rewardType, userId, trigger);

    // Track reward history
    _trackReward(userId);

    debugPrint('🎁 Reward generated: ${reward.type.label} for $userId');
    return reward;
  }

  /// Check if user is eligible for a new reward
  bool _isEligibleForReward(String userId) {
    final history = _rewardHistory[userId] ?? [];
    
    // Check daily limit
    final today = DateTime.now();
    final todayRewards = history.where((timestamp) {
      return timestamp.year == today.year &&
             timestamp.month == today.month &&
             timestamp.day == today.day;
    }).length;

    if (todayRewards >= maxRewardsPerDay) {
      return false;
    }

    // Check cooldown
    if (history.isNotEmpty) {
      final lastReward = history.last;
      final timeSinceLastReward = DateTime.now().difference(lastReward);
      if (timeSinceLastReward < rewardCooldown) {
        return false;
      }
    }

    return true;
  }

  /// Get base probability for reward trigger
  double _getBaseProbability(RewardTrigger trigger) {
    switch (trigger) {
      case RewardTrigger.videoView:
        return 0.05; // 5% chance per video view
      case RewardTrigger.videoLike:
        return 0.10; // 10% chance per like
      case RewardTrigger.videoShare:
        return 0.20; // 20% chance per share
      case RewardTrigger.orderPlaced:
        return 0.15; // 15% chance per order
      case RewardTrigger.firstOrderOfDay:
        return 0.30; // 30% chance for first order
      case RewardTrigger.streakMaintained:
        return 0.25; // 25% chance for streak
      case RewardTrigger.referralComplete:
        return 0.50; // 50% chance for referral
      case RewardTrigger.levelUp:
        return 0.80; // 80% chance for level up
      case RewardTrigger.random:
        return 0.03; // 3% chance random
    }
  }

  /// Adjust probability based on user stats
  double _adjustProbability(
    double baseProbability,
    double? trustScoreMultiplier,
    int? auraLevel,
  ) {
    double adjusted = baseProbability;

    // Trust Score bonus (up to +50%)
    if (trustScoreMultiplier != null) {
      adjusted *= trustScoreMultiplier;
    }

    // Aura Level bonus (+5% per level, max +50%)
    if (auraLevel != null) {
      final auraBonus = 1.0 + (auraLevel * 0.05).clamp(0.0, 0.5);
      adjusted *= auraBonus;
    }

    // Cap at 95% to maintain some unpredictability
    return adjusted.clamp(0.0, 0.95);
  }

  /// Select reward type based on weighted distribution
  RewardType _selectRewardType() {
    final roll = _random.nextDouble() * 100;
    
    // Weighted distribution (total = 100%)
    if (roll < 30) {
      return RewardType.discount10; // 30% chance
    } else if (roll < 50) {
      return RewardType.discount20; // 20% chance
    } else if (roll < 65) {
      return RewardType.discount30; // 15% chance
    } else if (roll < 75) {
      return RewardType.discount50; // 10% chance
    } else if (roll < 85) {
      return RewardType.freeDelivery; // 10% chance
    } else if (roll < 92) {
      return RewardType.buyOneGetOne; // 7% chance
    } else if (roll < 97) {
      return RewardType.cashback; // 5% chance
    } else if (roll < 99) {
      return RewardType.mysteryBox; // 2% chance
    } else {
      return RewardType.jackpot; // 1% chance (rare!)
    }
  }

  /// Create reward instance
  SurpriseReward _createReward(
    RewardType type,
    String userId,
    RewardTrigger trigger,
  ) {
    final now = DateTime.now();
    final expiresAt = now.add(_getRewardDuration(type));

    return SurpriseReward(
      id: _generateRewardId(),
      userId: userId,
      type: type,
      trigger: trigger,
      value: _getRewardValue(type),
      expiresAt: expiresAt,
      createdAt: now,
      isUsed: false,
    );
  }

  /// Get reward duration based on type
  Duration _getRewardDuration(RewardType type) {
    switch (type) {
      case RewardType.discount10:
      case RewardType.discount20:
        return const Duration(hours: 24); // 24 hours
      case RewardType.discount30:
      case RewardType.discount50:
        return const Duration(hours: 12); // 12 hours (more urgent)
      case RewardType.freeDelivery:
        return const Duration(hours: 48); // 48 hours
      case RewardType.buyOneGetOne:
        return const Duration(hours: 6); // 6 hours (very urgent)
      case RewardType.cashback:
        return const Duration(days: 7); // 7 days
      case RewardType.mysteryBox:
        return const Duration(hours: 24); // 24 hours
      case RewardType.jackpot:
        return const Duration(hours: 3); // 3 hours (super urgent!)
    }
  }

  /// Get reward value based on type
  double _getRewardValue(RewardType type) {
    switch (type) {
      case RewardType.discount10:
        return 10.0;
      case RewardType.discount20:
        return 20.0;
      case RewardType.discount30:
        return 30.0;
      case RewardType.discount50:
        return 50.0;
      case RewardType.freeDelivery:
        return 50.0; // Typical delivery fee
      case RewardType.buyOneGetOne:
        return 100.0; // Percentage
      case RewardType.cashback:
        return _random.nextInt(100) + 50.0; // 50-150 taka
      case RewardType.mysteryBox:
        return _random.nextInt(200) + 100.0; // 100-300 taka
      case RewardType.jackpot:
        return _random.nextInt(500) + 500.0; // 500-1000 taka!
    }
  }

  /// Track reward in history
  void _trackReward(String userId) {
    if (!_rewardHistory.containsKey(userId)) {
      _rewardHistory[userId] = [];
    }
    _rewardHistory[userId]!.add(DateTime.now());
  }

  /// Generate unique reward ID
  String _generateRewardId() {
    return 'RWD_${DateTime.now().millisecondsSinceEpoch}_${_random.nextInt(9999)}';
  }

  /// Get user's reward history
  List<DateTime> getRewardHistory(String userId) {
    return _rewardHistory[userId] ?? [];
  }

  /// Get time until next eligible reward
  Duration? getTimeUntilNextReward(String userId) {
    final history = _rewardHistory[userId];
    if (history == null || history.isEmpty) {
      return Duration.zero;
    }

    final lastReward = history.last;
    final timeSinceLastReward = DateTime.now().difference(lastReward);
    
    if (timeSinceLastReward >= rewardCooldown) {
      return Duration.zero;
    }

    return rewardCooldown - timeSinceLastReward;
  }

  /// Get remaining rewards for today
  int getRemainingRewardsToday(String userId) {
    final history = _rewardHistory[userId] ?? [];
    final today = DateTime.now();
    
    final todayRewards = history.where((timestamp) {
      return timestamp.year == today.year &&
             timestamp.month == today.month &&
             timestamp.day == today.day;
    }).length;

    return maxRewardsPerDay - todayRewards;
  }

  /// Clear reward history (for testing)
  void clearHistory() {
    _rewardHistory.clear();
  }
}

/// Reward trigger events
enum RewardTrigger {
  videoView('video_view', 'Watched Video'),
  videoLike('video_like', 'Liked Video'),
  videoShare('video_share', 'Shared Video'),
  orderPlaced('order_placed', 'Order Placed'),
  firstOrderOfDay('first_order_of_day', 'First Order Today'),
  streakMaintained('streak_maintained', 'Streak Maintained'),
  referralComplete('referral_complete', 'Referral Complete'),
  levelUp('level_up', 'Level Up'),
  random('random', 'Random Surprise');

  const RewardTrigger(this.key, this.label);
  final String key;
  final String label;
}

/// Reward types with different values and rarities
enum RewardType {
  discount10('discount_10', '10% OFF', '🎫', RewardRarity.common),
  discount20('discount_20', '20% OFF', '🎟️', RewardRarity.common),
  discount30('discount_30', '30% OFF', '🎗️', RewardRarity.uncommon),
  discount50('discount_50', '50% OFF', '🏆', RewardRarity.rare),
  freeDelivery('free_delivery', 'Free Delivery', '🚚', RewardRarity.common),
  buyOneGetOne('bogo', 'Buy 1 Get 1', '🎁', RewardRarity.uncommon),
  cashback('cashback', 'Cashback', '💰', RewardRarity.uncommon),
  mysteryBox('mystery_box', 'Mystery Box', '📦', RewardRarity.rare),
  jackpot('jackpot', 'JACKPOT!', '💎', RewardRarity.legendary);

  const RewardType(this.key, this.label, this.emoji, this.rarity);
  final String key;
  final String label;
  final String emoji;
  final RewardRarity rarity;
}

/// Reward rarity levels
enum RewardRarity {
  common('common', 'Common', 0xFFB0BEC5),
  uncommon('uncommon', 'Uncommon', 0xFF4CAF50),
  rare('rare', 'Rare', 0xFF2196F3),
  legendary('legendary', 'Legendary', 0xFFFFD700);

  const RewardRarity(this.key, this.label, this.colorValue);
  final String key;
  final String label;
  final int colorValue;
}

/// Surprise reward model
class SurpriseReward {
  final String id;
  final String userId;
  final RewardType type;
  final RewardTrigger trigger;
  final double value;
  final DateTime expiresAt;
  final DateTime createdAt;
  final bool isUsed;
  final DateTime? usedAt;

  const SurpriseReward({
    required this.id,
    required this.userId,
    required this.type,
    required this.trigger,
    required this.value,
    required this.expiresAt,
    required this.createdAt,
    required this.isUsed,
    this.usedAt,
  });

  /// Check if reward is expired
  bool get isExpired => DateTime.now().isAfter(expiresAt);

  /// Check if reward is active
  bool get isActive => !isUsed && !isExpired;

  /// Get time remaining
  Duration get timeRemaining {
    if (isExpired) return Duration.zero;
    return expiresAt.difference(DateTime.now());
  }

  /// Get formatted time remaining
  String get timeRemainingFormatted {
    final remaining = timeRemaining;
    if (remaining.inHours > 0) {
      return '${remaining.inHours}h ${remaining.inMinutes % 60}m';
    } else if (remaining.inMinutes > 0) {
      return '${remaining.inMinutes}m';
    } else {
      return '${remaining.inSeconds}s';
    }
  }

  SurpriseReward copyWith({
    String? id,
    String? userId,
    RewardType? type,
    RewardTrigger? trigger,
    double? value,
    DateTime? expiresAt,
    DateTime? createdAt,
    bool? isUsed,
    DateTime? usedAt,
  }) {
    return SurpriseReward(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      trigger: trigger ?? this.trigger,
      value: value ?? this.value,
      expiresAt: expiresAt ?? this.expiresAt,
      createdAt: createdAt ?? this.createdAt,
      isUsed: isUsed ?? this.isUsed,
      usedAt: usedAt ?? this.usedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type.key,
      'trigger': trigger.key,
      'value': value,
      'expires_at': expiresAt.toIso8601String(),
      'created_at': createdAt.toIso8601String(),
      'is_used': isUsed,
      'used_at': usedAt?.toIso8601String(),
    };
  }
}
