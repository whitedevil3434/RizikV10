// Rizik V5++ Game OS - Aura Service
// Business logic for XP calculation, level-up detection, and feature unlocking

import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/aura_level.dart';
import 'package:rizik_v4/data/models/aura_progress.dart';
import 'package:rizik_v4/data/models/quest.dart';
import 'package:rizik_v4/data/models/unlockable_feature.dart';
import 'package:rizik_v4/data/models/trust_score.dart';

/// Service for managing Aura progression and XP
class AuraService {
  /// Award XP to user for an action
  /// Returns updated AuraProgress with new XP and potential level-up
  static AuraProgress awardXP({
    required AuraProgress currentProgress,
    required int xpAmount,
    String? reason,
  }) {
    final newTotalXP = currentProgress.totalXP + xpAmount;
    final newLevel = _getLevelFromXP(newTotalXP);
    
    // Check if leveled up
    final didLevelUp = newLevel != currentProgress.currentLevel;
    
    // If leveled up, unlock features for that level
    List<String> newUnlockedFeatures = List.from(currentProgress.unlockedFeatures);
    if (didLevelUp) {
      // Add all features for the new level
      newUnlockedFeatures.addAll(newLevel.unlockedFeatures);
      // Remove duplicates
      newUnlockedFeatures = newUnlockedFeatures.toSet().toList();
    }

    return currentProgress.copyWith(
      currentLevel: newLevel,
      totalXP: newTotalXP,
      unlockedFeatures: newUnlockedFeatures,
      lastUpdated: DateTime.now(),
    );
  }

  /// Award XP for order placement
  static AuraProgress awardOrderPlacedXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.orderPlaced,
      reason: 'Order placed',
    );
  }

  /// Award XP for order completion
  static AuraProgress awardOrderCompletedXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.orderCompleted,
      reason: 'Order completed',
    );
  }

  /// Award XP for quest completion
  static AuraProgress awardQuestXP({
    required AuraProgress progress,
    required Quest quest,
  }) {
    // Mark quest as completed
    final updatedQuests = List<String>.from(progress.completedQuests)
      ..add(quest.id);

    // Award XP
    final progressWithXP = awardXP(
      currentProgress: progress,
      xpAmount: quest.xpReward,
      reason: 'Quest completed: ${quest.title}',
    );

    // Unlock feature if quest unlocks one
    List<String> updatedFeatures = List.from(progressWithXP.unlockedFeatures);
    if (quest.featureUnlock != null && !updatedFeatures.contains(quest.featureUnlock)) {
      updatedFeatures.add(quest.featureUnlock!);
    }

    return progressWithXP.copyWith(
      completedQuests: updatedQuests,
      unlockedFeatures: updatedFeatures,
    );
  }

  /// Award XP for badge earned
  static AuraProgress awardBadgeXP({
    required AuraProgress progress,
    required Badge badge,
  }) {
    // Add badge to earned badges
    final updatedBadges = List<Badge>.from(progress.earnedBadges)
      ..add(badge.copyWith(earnedAt: DateTime.now()));

    // Award XP
    final progressWithXP = awardXP(
      currentProgress: progress,
      xpAmount: badge.xpReward,
      reason: 'Badge earned: ${badge.name}',
    );

    return progressWithXP.copyWith(
      earnedBadges: updatedBadges,
    );
  }

  /// Award XP for level up (bonus XP)
  static AuraProgress awardLevelUpBonus(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.levelUp,
      reason: 'Level up bonus',
    );
  }

  /// Award XP for referral signup
  static AuraProgress awardReferralXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.referralSignup,
      reason: 'Referral signup',
    );
  }

  /// Award XP for first order
  static AuraProgress awardFirstOrderXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.firstOrder,
      reason: 'First order',
    );
  }

  /// Award XP for review given
  static AuraProgress awardReviewXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.reviewGiven,
      reason: 'Review given',
    );
  }

  /// Award XP for squad formed
  static AuraProgress awardSquadFormedXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.squadFormed,
      reason: 'Squad formed',
    );
  }

  /// Award XP for tribunal vote
  static AuraProgress awardTribunalVoteXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.tribunalVote,
      reason: 'Tribunal vote',
    );
  }

  /// Award XP for mission chain completed
  static AuraProgress awardMissionChainXP(AuraProgress progress) {
    return awardXP(
      currentProgress: progress,
      xpAmount: XPRewards.missionChainCompleted,
      reason: 'Mission chain completed',
    );
  }

  /// Check if user can level up
  static bool canLevelUp(AuraProgress progress) {
    return progress.canLevelUp;
  }

  /// Get next level info
  static AuraLevel? getNextLevel(AuraProgress progress) {
    return progress.nextLevel;
  }

  /// Calculate XP needed for next level
  static int getXPToNextLevel(AuraProgress progress) {
    return progress.xpToNextLevel;
  }

  /// Calculate progress percentage to next level
  static double getProgressToNextLevel(AuraProgress progress) {
    return progress.progressToNextLevel;
  }

  /// Check if feature is unlocked
  static bool isFeatureUnlocked({
    required AuraProgress progress,
    required String featureId,
  }) {
    return progress.isFeatureUnlocked(featureId);
  }

  /// Check if quest is completed
  static bool isQuestCompleted({
    required AuraProgress progress,
    required String questId,
  }) {
    return progress.isQuestCompleted(questId);
  }

  /// Update quest progress
  static Quest updateQuestProgress({
    required Quest quest,
    required String stepId,
    int? progressIncrement,
  }) {
    final updatedSteps = quest.steps.map((step) {
      if (step.id == stepId) {
        final newProgress = step.currentProgress + (progressIncrement ?? 1);
        final isCompleted = newProgress >= step.targetProgress;
        return step.copyWith(
          currentProgress: newProgress,
          isCompleted: isCompleted,
        );
      }
      return step;
    }).toList();

    // Check if all steps completed
    final allStepsCompleted = updatedSteps.every((step) => step.isCompleted);
    final newStatus = allStepsCompleted ? QuestStatus.completed : quest.status;

    return quest.copyWith(
      steps: updatedSteps,
      status: newStatus,
      completedAt: allStepsCompleted ? DateTime.now() : quest.completedAt,
    );
  }

  /// Start a quest
  static Quest startQuest(Quest quest) {
    return quest.copyWith(
      status: QuestStatus.active,
      startedAt: DateTime.now(),
    );
  }

  /// Complete a quest
  static Quest completeQuest(Quest quest) {
    return quest.copyWith(
      status: QuestStatus.completed,
      completedAt: DateTime.now(),
    );
  }

  /// Check if quest can be started
  static bool canStartQuest({
    required Quest quest,
    required AuraProgress progress,
  }) {
    // Check if already completed
    if (progress.isQuestCompleted(quest.id)) {
      return false;
    }

    // Check if locked
    if (quest.status == QuestStatus.locked) {
      return false;
    }

    // Check unlock requirement (previous quest)
    if (quest.unlockRequirement != null) {
      return progress.isQuestCompleted(quest.unlockRequirement!);
    }

    return true;
  }

  /// Update feature unlock progress
  static UnlockableFeature updateFeatureProgress({
    required UnlockableFeature feature,
    required AuraProgress auraProgress,
    required TrustScore? trustScore,
    required int totalTransactions,
    required int daysActive,
    required double totalEarnings,
    required int referralCount,
  }) {
    final updatedRequirements = feature.requirements.map((req) {
      int newProgress = req.currentProgress;

      switch (req.type) {
        case UnlockRequirementType.level:
          newProgress = auraProgress.currentLevel.level;
          break;
        case UnlockRequirementType.quest:
          // Check if specific quest is completed
          final questId = req.value as String;
          newProgress = auraProgress.isQuestCompleted(questId) ? 1 : 0;
          break;
        case UnlockRequirementType.trustScore:
          // Store trust score * 10 as int
          newProgress = trustScore != null ? (trustScore.overall * 10).toInt() : 0;
          break;
        case UnlockRequirementType.transactions:
          newProgress = totalTransactions;
          break;
        case UnlockRequirementType.days:
          newProgress = daysActive;
          break;
        case UnlockRequirementType.earnings:
          newProgress = totalEarnings.toInt();
          break;
        case UnlockRequirementType.referrals:
          newProgress = referralCount;
          break;
      }

      return req.copyWith(currentProgress: newProgress);
    }).toList();

    // Check if can unlock
    final canUnlock = updatedRequirements.every((req) => req.isMet);
    final isUnlocked = feature.isUnlocked || canUnlock;

    return feature.copyWith(
      requirements: updatedRequirements,
      isUnlocked: isUnlocked,
      unlockedAt: isUnlocked && feature.unlockedAt == null 
          ? DateTime.now() 
          : feature.unlockedAt,
    );
  }

  /// Unlock a feature
  static UnlockableFeature unlockFeature(UnlockableFeature feature) {
    return feature.copyWith(
      isUnlocked: true,
      unlockedAt: DateTime.now(),
    );
  }

  /// Get features by level
  static List<UnlockableFeature> getFeaturesByLevel({
    required List<UnlockableFeature> allFeatures,
    required AuraLevel level,
  }) {
    return allFeatures.where((f) => f.requiredLevel == level).toList();
  }

  /// Get locked features
  static List<UnlockableFeature> getLockedFeatures(List<UnlockableFeature> allFeatures) {
    return allFeatures.where((f) => !f.isUnlocked).toList();
  }

  /// Get unlocked features
  static List<UnlockableFeature> getUnlockedFeatures(List<UnlockableFeature> allFeatures) {
    return allFeatures.where((f) => f.isUnlocked).toList();
  }

  /// Calculate total XP from all sources
  static int calculateTotalXP({
    required int orderCount,
    required int questsCompleted,
    required int badgesEarned,
    required int referrals,
    required int levelsGained,
  }) {
    return (orderCount * XPRewards.orderCompleted) +
           (questsCompleted * XPRewards.questMedium) + // Average quest XP
           (badgesEarned * XPRewards.badgeEarned) +
           (referrals * XPRewards.referralSignup) +
           (levelsGained * XPRewards.levelUp);
  }

  /// Simulate XP gain (for testing)
  @visibleForTesting
  static AuraProgress simulateXPGain({
    required AuraProgress progress,
    required int xpAmount,
  }) {
    return awardXP(
      currentProgress: progress,
      xpAmount: xpAmount,
      reason: 'Test XP gain',
    );
  }

  /// Get level-up message
  static String getLevelUpMessage(AuraLevel newLevel, {bool bengali = false}) {
    if (bengali) {
      return 'অভিনন্দন! আপনি ${newLevel.nameBn} লেভেলে পৌঁছেছেন! ${newLevel.emoji}';
    }
    return 'Congratulations! You reached ${newLevel.name} level! ${newLevel.emoji}';
  }

  /// Get feature unlock message
  static String getFeatureUnlockMessage(UnlockableFeature feature, {bool bengali = false}) {
    if (bengali) {
      return '${feature.emoji} ${feature.nameBn} আনলক হয়েছে!';
    }
    return '${feature.emoji} ${feature.name} unlocked!';
  }

  /// Helper method to get level from XP
  static AuraLevel _getLevelFromXP(int xp) {
    if (xp >= 50000) return AuraLevel.apex;
    if (xp >= 15000) return AuraLevel.architect;
    if (xp >= 5000) return AuraLevel.master;
    if (xp >= 1000) return AuraLevel.apprentice;
    return AuraLevel.initiate;
  }
}
