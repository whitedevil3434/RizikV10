// Rizik V5++ Game OS - Aura Provider
// State management for Aura progression, quests, and feature unlocks

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/aura_level.dart';
import 'package:rizik_v4/data/models/aura_progress.dart';
import 'package:rizik_v4/data/models/quest.dart';
import 'package:rizik_v4/data/models/unlockable_feature.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/remote/aura_service.dart';
import 'package:rizik_v4/data/default_quests.dart';
import 'package:rizik_v4/data/default_features.dart';

/// Provider for managing Aura progression and gamification
class AuraProvider with ChangeNotifier {
  AuraProgress? _auraProgress;
  List<Quest> _quests = [];
  List<UnlockableFeature> _features = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  AuraProgress? get auraProgress => _auraProgress;
  List<Quest> get quests => _quests;
  List<UnlockableFeature> get features => _features;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Convenience getters
  AuraLevel? get currentLevel => _auraProgress?.currentLevel;
  int get totalXP => _auraProgress?.totalXP ?? 0;
  double get progressToNextLevel => _auraProgress?.progressToNextLevel ?? 0.0;
  int get xpToNextLevel => _auraProgress?.xpToNextLevel ?? 0;
  bool get canLevelUp => _auraProgress?.canLevelUp ?? false;
  
  // Quest getters
  List<Quest> get activeQuests => _quests.where((q) => q.isActive).toList();
  List<Quest> get completedQuests => _quests.where((q) => q.isCompleted).toList();
  List<Quest> get availableQuests => _quests.where((q) => q.isAvailable).toList();
  
  // Feature getters
  List<UnlockableFeature> get unlockedFeatures => 
      _features.where((f) => f.isUnlocked).toList();
  List<UnlockableFeature> get lockedFeatures => 
      _features.where((f) => !f.isUnlocked).toList();

  AuraProvider() {
    _initialize();
  }

  /// Initialize provider
  Future<void> _initialize() async {
    await _loadAuraProgress();
    await _loadQuests();
    await _loadFeatures();
  }

  /// Load aura progress from storage
  Future<void> _loadAuraProgress() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final progressJson = prefs.getString('aura_progress');
      
      if (progressJson != null) {
        final Map<String, dynamic> json = jsonDecode(progressJson);
        _auraProgress = AuraProgress.fromJson(json);
      } else {
        // Initialize new user
        _auraProgress = AuraProgress.newUser('default_user_001');
        await _saveAuraProgress();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load aura progress: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save aura progress to storage
  Future<void> _saveAuraProgress() async {
    if (_auraProgress == null) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final progressJson = jsonEncode(_auraProgress!.toJson());
      await prefs.setString('aura_progress', progressJson);
    } catch (e) {
      debugPrint('Error saving aura progress: $e');
    }
  }


  /// Fetch quests from API (Simulated)
  Future<void> fetchQuestsFromApi() async {
    try {
      _isLoading = true;
      notifyListeners();

      // Simulate network delay
      await Future.delayed(const Duration(seconds: 1));

      // Mock API response
      // In real app: final response = await http.get(Uri.parse('...'));
      final mockQuests = DefaultQuests.getAllQuests();
      
      // Merge with local progress (simple override for now)
      _quests = mockQuests;
      await _saveQuests();
      
      debugPrint('✅ Quests fetched from API');
    } catch (e) {
      _error = 'Failed to fetch quests: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load quests from storage
  Future<void> _loadQuests() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final questsJson = prefs.getString('quests');
      
      if (questsJson != null) {
        final List<dynamic> jsonList = jsonDecode(questsJson);
        _quests = jsonList.map((json) => Quest.fromJson(json)).toList();
      } else {
        // Initialize with default quests on first launch
        debugPrint('🎮 Initializing default quests...');
        _quests = DefaultQuests.getAllQuests();
        await _saveQuests();
        debugPrint('✅ ${_quests.length} quests initialized');
      }
    } catch (e) {
      debugPrint('Error loading quests: $e');
    }
  }

  /// Save quests to storage
  Future<void> _saveQuests() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final questsJson = jsonEncode(_quests.map((q) => q.toJson()).toList());
      await prefs.setString('quests', questsJson);
    } catch (e) {
      debugPrint('Error saving quests: $e');
    }
  }

  /// Load features from storage
  Future<void> _loadFeatures() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final featuresJson = prefs.getString('features');
      
      if (featuresJson != null) {
        final List<dynamic> jsonList = jsonDecode(featuresJson);
        _features = jsonList.map((json) => UnlockableFeature.fromJson(json)).toList();
      } else {
        // Initialize with default features on first launch
        debugPrint('🎮 Initializing default features...');
        _features = DefaultFeatures.getAllFeatures();
        await _saveFeatures();
        debugPrint('✅ ${_features.length} features initialized');
      }
    } catch (e) {
      debugPrint('Error loading features: $e');
    }
  }

  /// Save features to storage
  Future<void> _saveFeatures() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final featuresJson = jsonEncode(_features.map((f) => f.toJson()).toList());
      await prefs.setString('features', featuresJson);
    } catch (e) {
      debugPrint('Error saving features: $e');
    }
  }

  /// Award XP for an action
  Future<void> awardXP({
    required int xpAmount,
    String? reason,
  }) async {
    if (_auraProgress == null) return;

    try {
      final oldLevel = _auraProgress!.currentLevel;
      
      _auraProgress = AuraService.awardXP(
        currentProgress: _auraProgress!,
        xpAmount: xpAmount,
        reason: reason,
      );

      // Check if leveled up
      if (_auraProgress!.currentLevel != oldLevel) {
        await _handleLevelUp(oldLevel, _auraProgress!.currentLevel);
      }

      await _saveAuraProgress();
      notifyListeners();
    } catch (e) {
      debugPrint('Error awarding XP: $e');
    }
  }

  /// Handle level up
  Future<void> _handleLevelUp(AuraLevel oldLevel, AuraLevel newLevel) async {
    debugPrint('Level up! ${oldLevel.name} → ${newLevel.name}');
    
    // Award bonus XP for leveling up
    _auraProgress = AuraService.awardLevelUpBonus(_auraProgress!);
    
    // Unlock features for new level
    await _unlockLevelFeatures(newLevel);
  }

  /// Unlock features for a level
  Future<void> _unlockLevelFeatures(AuraLevel level) async {
    for (var i = 0; i < _features.length; i++) {
      if (_features[i].requiredLevel == level && !_features[i].isUnlocked) {
        _features[i] = AuraService.unlockFeature(_features[i]);
      }
    }
    await _saveFeatures();
  }

  /// Award XP for order placed
  Future<void> awardOrderPlacedXP() async {
    if (_auraProgress == null) return;
    _auraProgress = AuraService.awardOrderPlacedXP(_auraProgress!);
    await _saveAuraProgress();
    notifyListeners();
  }

  /// Award XP for order completed
  Future<void> awardOrderCompletedXP() async {
    if (_auraProgress == null) return;
    _auraProgress = AuraService.awardOrderCompletedXP(_auraProgress!);
    await _saveAuraProgress();
    notifyListeners();
  }

  // ============================================================================
  // BAZAR TAB XP AWARDS (Phase 9 Task 9.7)
  // ============================================================================

  /// Award XP for delivery completed (rider)
  Future<void> awardDeliveryCompletedXP() async {
    await awardXP(xpAmount: 75, reason: 'Delivery completed');
  }

  /// Award XP for video posted
  Future<void> awardVideoPostedXP() async {
    await awardXP(xpAmount: 50, reason: 'Video posted');
  }

  /// Award XP for video going viral (10k+ views)
  Future<void> awardViralVideoXP() async {
    await awardXP(xpAmount: 500, reason: 'Video went viral');
  }

  /// Award XP for 5-star review given
  Future<void> awardFiveStarReviewXP() async {
    await awardXP(xpAmount: 25, reason: '5-star review given');
  }

  /// Award XP for Mission Chain completion
  Future<void> awardMissionChainXP({required int missionsInChain}) async {
    final baseXP = 100;
    final bonusXP = (missionsInChain - 1) * 25; // +25 per additional mission
    await awardXP(
      xpAmount: baseXP + bonusXP,
      reason: 'Mission Chain completed ($missionsInChain missions)',
    );
  }

  /// Award XP for first order milestone
  Future<void> awardFirstOrderXP() async {
    await awardXP(xpAmount: 100, reason: 'First order placed');
  }

  /// Award XP for 10th order milestone
  Future<void> awardTenthOrderXP() async {
    await awardXP(xpAmount: 200, reason: '10th order milestone');
  }

  /// Award XP for Dam Komao successful haggle
  Future<void> awardSuccessfulHaggleXP({required double savingsPercent}) async {
    final baseXP = 50;
    final bonusXP = savingsPercent > 20 ? 25 : (savingsPercent > 10 ? 15 : 0);
    await awardXP(
      xpAmount: baseXP + bonusXP,
      reason: 'Successful haggle (${savingsPercent.toStringAsFixed(0)}% savings)',
    );
  }

  /// Award XP for store opening (partner)
  Future<void> awardStoreOpenedXP() async {
    await awardXP(xpAmount: 150, reason: 'Virtual store opened');
  }

  /// Award XP for high rating received (partner/rider)
  Future<void> awardHighRatingXP({required double rating}) async {
    if (rating >= 4.5) {
      await awardXP(xpAmount: 50, reason: 'Excellent rating received');
    }
  }

  /// Award XP for quest completion
  Future<void> completeQuest(Quest quest) async {
    if (_auraProgress == null) return;

    try {
      // Update quest status
      final questIndex = _quests.indexWhere((q) => q.id == quest.id);
      if (questIndex != -1) {
        _quests[questIndex] = AuraService.completeQuest(quest);
        await _saveQuests();
      }

      // Award XP
      _auraProgress = AuraService.awardQuestXP(
        progress: _auraProgress!,
        quest: quest,
      );

      await _saveAuraProgress();
      notifyListeners();
    } catch (e) {
      debugPrint('Error completing quest: $e');
    }
  }

  /// Award XP for badge earned
  Future<void> awardBadgeXP(Badge badge) async {
    if (_auraProgress == null) return;

    try {
      _auraProgress = AuraService.awardBadgeXP(
        progress: _auraProgress!,
        badge: badge,
      );

      await _saveAuraProgress();
      notifyListeners();
    } catch (e) {
      debugPrint('Error awarding badge XP: $e');
    }
  }

  /// Start a quest
  Future<void> startQuest(Quest quest) async {
    try {
      final questIndex = _quests.indexWhere((q) => q.id == quest.id);
      if (questIndex != -1) {
        _quests[questIndex] = AuraService.startQuest(quest);
        await _saveQuests();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error starting quest: $e');
    }
  }

  /// Update quest progress
  Future<void> updateQuestProgress({
    required String questId,
    required String stepId,
    int? progressIncrement,
  }) async {
    try {
      final questIndex = _quests.indexWhere((q) => q.id == questId);
      if (questIndex != -1) {
        final updatedQuest = AuraService.updateQuestProgress(
          quest: _quests[questIndex],
          stepId: stepId,
          progressIncrement: progressIncrement,
        );
        
        _quests[questIndex] = updatedQuest;

        // If quest completed, award XP
        if (updatedQuest.isCompleted && !_quests[questIndex].isCompleted) {
          await completeQuest(updatedQuest);
        } else {
          await _saveQuests();
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error updating quest progress: $e');
    }
  }

  /// Check if feature is unlocked
  bool isFeatureUnlocked(String featureId) {
    return _auraProgress?.isFeatureUnlocked(featureId) ?? false;
  }

  /// Check if quest is completed
  bool isQuestCompleted(String questId) {
    return _auraProgress?.isQuestCompleted(questId) ?? false;
  }

  /// Get quest by ID
  Quest? getQuestById(String questId) {
    try {
      return _quests.firstWhere((q) => q.id == questId);
    } catch (e) {
      return null;
    }
  }

  /// Get feature by ID
  UnlockableFeature? getFeatureById(String featureId) {
    try {
      return _features.firstWhere((f) => f.id == featureId);
    } catch (e) {
      return null;
    }
  }

  /// Get quests by series
  List<Quest> getQuestsBySeries(QuestSeries series) {
    return _quests.where((q) => q.series == series).toList();
  }

  /// Get features by level
  List<UnlockableFeature> getFeaturesByLevel(AuraLevel level) {
    return _features.where((f) => f.requiredLevel == level).toList();
  }

  /// Update feature progress
  Future<void> updateFeatureProgress({
    required String featureId,
    required TrustScore? trustScore,
    required int totalTransactions,
    required int daysActive,
    required double totalEarnings,
    required int referralCount,
  }) async {
    if (_auraProgress == null) return;

    try {
      final featureIndex = _features.indexWhere((f) => f.id == featureId);
      if (featureIndex != -1) {
        _features[featureIndex] = AuraService.updateFeatureProgress(
          feature: _features[featureIndex],
          auraProgress: _auraProgress!,
          trustScore: trustScore,
          totalTransactions: totalTransactions,
          daysActive: daysActive,
          totalEarnings: totalEarnings,
          referralCount: referralCount,
        );

        await _saveFeatures();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error updating feature progress: $e');
    }
  }

  /// Add a quest (for initialization)
  Future<void> addQuest(Quest quest) async {
    _quests.add(quest);
    await _saveQuests();
    notifyListeners();
  }

  /// Add a feature (for initialization)
  Future<void> addFeature(UnlockableFeature feature) async {
    _features.add(feature);
    await _saveFeatures();
    notifyListeners();
  }

  /// Reset aura progress (for testing)
  @visibleForTesting
  Future<void> resetAuraProgress(String userId) async {
    _auraProgress = AuraProgress.newUser(userId);
    await _saveAuraProgress();
    notifyListeners();
  }

  /// Simulate XP gain (for testing)
  @visibleForTesting
  Future<void> simulateXPGain(int xpAmount) async {
    await awardXP(xpAmount: xpAmount, reason: 'Test XP gain');
  }

  /// Get all features organized by level
  List<UnlockableFeature> getAllFeatures() {
    return _features;
  }

  /// Get features for Strategic Deck (organized by level)
  Map<AuraLevel, List<UnlockableFeature>> getFeaturesByLevelMap() {
    final Map<AuraLevel, List<UnlockableFeature>> featureMap = {};
    
    for (final level in AuraLevel.values) {
      featureMap[level] = _features.where((f) => f.requiredLevel == level).toList();
    }
    
    return featureMap;
  }

  /// Get active quests for Daily Quests card (top 3)
  List<Quest> getActiveQuestsForCard() {
    return activeQuests.take(3).toList();
  }

  /// Get current progress for all unlock requirements
  /// Note: Some values are placeholders and should be integrated with ProfileProvider/TrustScoreProvider
  Map<String, dynamic> getCurrentProgress() {
    if (_auraProgress == null) {
      return {};
    }

    // Calculate days active from account creation
    final accountAge = DateTime.now().difference(_auraProgress!.lastUpdated).inDays;

    return {
      'days_active': accountAge,
      'trust_score': 3.0, // TODO: Get from TrustScoreProvider
      'transactions': 0, // TODO: Get from TrustScoreProvider
      'earnings': 0.0, // TODO: Get from ProfileProvider
      'referrals': 0, // TODO: Get from ProfileProvider
      'quests_completed': completedQuests.length,
    };
  }

  /// Check if user can unlock a feature
  bool canUnlockFeature(UnlockableFeature feature) {
    if (_auraProgress == null) return false;
    
    // Check level requirement
    if (_auraProgress!.currentLevel.index < feature.requiredLevel.index) {
      return false;
    }
    
    // Check all requirements
    final progress = getCurrentProgress();
    
    for (final requirement in feature.requirements) {
      switch (requirement.type) {
        case UnlockRequirementType.level:
          // Level requirement already checked above
          break;
        case UnlockRequirementType.days:
          if ((progress['days_active'] ?? 0) < requirement.value) {
            return false;
          }
          break;
        case UnlockRequirementType.trustScore:
          if ((progress['trust_score'] ?? 0.0) < requirement.value) {
            return false;
          }
          break;
        case UnlockRequirementType.transactions:
          if ((progress['transactions'] ?? 0) < requirement.value) {
            return false;
          }
          break;
        case UnlockRequirementType.earnings:
          if ((progress['earnings'] ?? 0.0) < requirement.value) {
            return false;
          }
          break;
        case UnlockRequirementType.referrals:
          if ((progress['referrals'] ?? 0) < requirement.value) {
            return false;
          }
          break;
        case UnlockRequirementType.quest:
          final questId = requirement.value as String;
          if (!isQuestCompleted(questId)) {
            return false;
          }
          break;
      }
    }
    
    return true;
  }

  /// Unlock a feature manually (when requirements are met)
  Future<void> unlockFeature(String featureId) async {
    try {
      final featureIndex = _features.indexWhere((f) => f.id == featureId);
      if (featureIndex != -1) {
        _features[featureIndex] = AuraService.unlockFeature(_features[featureIndex]);
        await _saveFeatures();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error unlocking feature: $e');
    }
  }

  /// Check and auto-unlock features based on current progress
  Future<void> checkAndUnlockFeatures() async {
    bool anyUnlocked = false;
    
    for (var i = 0; i < _features.length; i++) {
      if (!_features[i].isUnlocked && canUnlockFeature(_features[i])) {
        _features[i] = AuraService.unlockFeature(_features[i]);
        anyUnlocked = true;
        debugPrint('✨ Feature unlocked: ${_features[i].name}');
      }
    }
    
    if (anyUnlocked) {
      await _saveFeatures();
      notifyListeners();
    }
  }
}
