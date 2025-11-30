// Rizik V5++ Game OS - Aura Progress Model
// Tracks user's progression through the game
// Integrates with existing TrustScore system

import 'package:rizik_v4/data/models/aura_level.dart';
import 'package:rizik_v4/data/models/trust_score.dart';

class AuraProgress {
  final String userId;
  final AuraLevel currentLevel;
  final int totalXP;
  final List<String> unlockedFeatures;
  final List<String> completedQuests;
  final List<Badge> earnedBadges; // Using existing Badge class
  final DateTime lastUpdated;

  AuraProgress({
    required this.userId,
    required this.currentLevel,
    required this.totalXP,
    required this.unlockedFeatures,
    required this.completedQuests,
    required this.earnedBadges,
    required this.lastUpdated,
  });

  // Calculate XP progress to next level
  int get xpToNextLevel {
    final nextLevel = _getNextLevel(currentLevel);
    if (nextLevel == null) return 0; // Max level reached
    return nextLevel.requiredXP - totalXP;
  }

  // Calculate progress percentage to next level
  double get progressToNextLevel {
    final nextLevel = _getNextLevel(currentLevel);
    if (nextLevel == null) return 1.0; // Max level reached
    
    final currentLevelXP = currentLevel.requiredXP;
    final nextLevelXP = nextLevel.requiredXP;
    final xpInCurrentLevel = totalXP - currentLevelXP;
    final xpNeededForLevel = nextLevelXP - currentLevelXP;
    
    return (xpInCurrentLevel / xpNeededForLevel).clamp(0.0, 1.0);
  }

  // Check if feature is unlocked
  bool isFeatureUnlocked(String featureId) {
    return unlockedFeatures.contains(featureId);
  }

  // Check if quest is completed
  bool isQuestCompleted(String questId) {
    return completedQuests.contains(questId);
  }

  // Check if can level up
  bool get canLevelUp {
    final nextLevel = _getNextLevel(currentLevel);
    if (nextLevel == null) return false;
    return totalXP >= nextLevel.requiredXP;
  }

  // Get next level
  AuraLevel? get nextLevel => _getNextLevel(currentLevel);

  // Helper to get next level
  static AuraLevel? _getNextLevel(AuraLevel currentLevel) {
    switch (currentLevel) {
      case AuraLevel.initiate:
        return AuraLevel.apprentice;
      case AuraLevel.apprentice:
        return AuraLevel.master;
      case AuraLevel.master:
        return AuraLevel.architect;
      case AuraLevel.architect:
        return AuraLevel.apex;
      case AuraLevel.apex:
        return null; // Max level
    }
  }

  // Copy with method for immutability
  AuraProgress copyWith({
    String? userId,
    AuraLevel? currentLevel,
    int? totalXP,
    List<String>? unlockedFeatures,
    List<String>? completedQuests,
    List<Badge>? earnedBadges,
    DateTime? lastUpdated,
  }) {
    return AuraProgress(
      userId: userId ?? this.userId,
      currentLevel: currentLevel ?? this.currentLevel,
      totalXP: totalXP ?? this.totalXP,
      unlockedFeatures: unlockedFeatures ?? this.unlockedFeatures,
      completedQuests: completedQuests ?? this.completedQuests,
      earnedBadges: earnedBadges ?? this.earnedBadges,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  // JSON serialization
  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'currentLevel': currentLevel.level,
      'totalXP': totalXP,
      'unlockedFeatures': unlockedFeatures,
      'completedQuests': completedQuests,
      'earnedBadges': earnedBadges.map((b) => b.toJson()).toList(),
      'lastUpdated': lastUpdated.toIso8601String(),
    };
  }

  factory AuraProgress.fromJson(Map<String, dynamic> json) {
    return AuraProgress(
      userId: json['userId'] as String,
      currentLevel: AuraLevel.values[json['currentLevel'] as int],
      totalXP: json['totalXP'] as int,
      unlockedFeatures: List<String>.from(json['unlockedFeatures'] as List),
      completedQuests: List<String>.from(json['completedQuests'] as List),
      earnedBadges: (json['earnedBadges'] as List)
          .map((b) => Badge.fromJson(b as Map<String, dynamic>))
          .toList(),
      lastUpdated: DateTime.parse(json['lastUpdated'] as String),
    );
  }

  // Factory for new user
  factory AuraProgress.newUser(String userId) {
    return AuraProgress(
      userId: userId,
      currentLevel: AuraLevel.initiate,
      totalXP: 0,
      unlockedFeatures: ['basic_orders', 'trust_score', 'profile'],
      completedQuests: [],
      earnedBadges: [],
      lastUpdated: DateTime.now(),
    );
  }

  // Get badge count
  int get badgeCount => earnedBadges.length;

  // Get recent badges (last 30 days)
  List<Badge> get recentBadges {
    final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));
    return earnedBadges.where((badge) => 
      badge.earnedAt != null && badge.earnedAt!.isAfter(thirtyDaysAgo)
    ).toList();
  }
}

// XP Award amounts for different actions
class XPRewards {
  static const int orderPlaced = 50;
  static const int orderCompleted = 100;
  static const int questEasy = 50;
  static const int questMedium = 150;
  static const int questHard = 300;
  static const int badgeEarned = 500;
  static const int levelUp = 1000;
  static const int referralSignup = 200;
  static const int firstOrder = 100;
  static const int reviewGiven = 25;
  static const int squadFormed = 300;
  static const int tribunalVote = 50;
  static const int missionChainCompleted = 200;
}
