import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/models/order.dart';
import 'package:rizik_v4/data/remote/trust_score_service.dart';

/// Provider for managing user trust scores
/// Handles score updates, badge awards, and persistence
class TrustScoreProvider with ChangeNotifier {
  TrustScore? _trustScore;
  bool _isLoading = false;
  String? _error;

  TrustScore? get trustScore => _trustScore;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasPremiumAccess => _trustScore?.hasPremiumAccess ?? false;

  TrustScoreProvider() {
    _loadTrustScore();
  }

  /// Load trust score from storage
  Future<void> _loadTrustScore() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final trustScoreJson = prefs.getString('trust_score');
      
      if (trustScoreJson != null) {
        final Map<String, dynamic> json = jsonDecode(trustScoreJson);
        _trustScore = TrustScore.fromJson(json);
      } else {
        // Initialize with default trust score for new users
        _trustScore = TrustScore.initial('default_user_001');
        await _saveTrustScore();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load trust score: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save trust score to storage
  Future<void> _saveTrustScore() async {
    if (_trustScore == null) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      final trustScoreJson = jsonEncode(_trustScore!.toJson());
      await prefs.setString('trust_score', trustScoreJson);
    } catch (e) {
      debugPrint('Error saving trust score: $e');
    }
  }

  /// Update trust score after order completion
  Future<void> updateScoreOnOrderCompletion({
    required Order order,
    required bool wasOnTime,
    required double qualityRating,
    bool wasPaymentOnTime = true,
  }) async {
    if (_trustScore == null) return;

    try {
      _isLoading = true;
      notifyListeners();

      // Update trust score using service
      _trustScore = TrustScoreService.updateTrustScoreOnOrderCompletion(
        currentScore: _trustScore!,
        order: order,
        wasOnTime: wasOnTime,
        qualityRating: qualityRating,
        wasPaymentOnTime: wasPaymentOnTime,
      );

      // Check for milestone badges
      final earnableBadges = TrustScoreService.checkMilestoneBadges(_trustScore!);
      for (final badge in earnableBadges) {
        _trustScore = TrustScoreService.awardBadge(
          currentScore: _trustScore!,
          badge: badge,
        );
      }

      // Check if warning should be sent
      if (TrustScoreService.shouldSendWarning(_trustScore!)) {
        _sendLowScoreWarning();
      }

      await _saveTrustScore();
      _error = null;
    } catch (e) {
      _error = 'Failed to update trust score: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Award a badge manually
  Future<void> awardBadge(Badge badge) async {
    if (_trustScore == null) return;

    try {
      _trustScore = TrustScoreService.awardBadge(
        currentScore: _trustScore!,
        badge: badge,
      );

      await _saveTrustScore();
      notifyListeners();
    } catch (e) {
      debugPrint('Error awarding badge: $e');
    }
  }

  /// Handle customer complaint
  Future<void> handleComplaint({
    required TrustCategory category,
    String? reason,
  }) async {
    if (_trustScore == null) return;

    try {
      _isLoading = true;
      notifyListeners();

      _trustScore = TrustScoreService.handleComplaint(
        currentScore: _trustScore!,
        category: category,
        reason: reason,
      );

      // Check if warning should be sent
      if (TrustScoreService.shouldSendWarning(_trustScore!)) {
        _sendLowScoreWarning();
      }

      await _saveTrustScore();
      _error = null;
    } catch (e) {
      _error = 'Failed to handle complaint: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get improvement suggestions
  List<String> getImprovementSuggestions() {
    if (_trustScore == null) return [];
    return TrustScoreService.getImprovementSuggestions(_trustScore!);
  }

  /// Get badges by category
  List<Badge> getBadgesByCategory(TrustCategory category) {
    if (_trustScore == null) return [];
    return _trustScore!.getBadgesByCategory(category);
  }

  /// Get recent badges (last 30 days)
  List<Badge> getRecentBadges() {
    if (_trustScore == null) return [];
    return _trustScore!.recentBadges;
  }

  /// Send low score warning notification
  /// Note: This should be called from UI context using TrustNotificationService
  void _sendLowScoreWarning() {
    debugPrint('⚠️ Warning: Trust score below 3.0');
    debugPrint('Premium features restricted');
    debugPrint('Suggestions: ${getImprovementSuggestions().join(", ")}');
    // UI layer should listen to trust score changes and show warnings
    // using TrustNotificationService.showLowScoreWarning()
  }

  /// Reset trust score (for testing)
  @visibleForTesting
  Future<void> resetTrustScore(String userId) async {
    _trustScore = TrustScore.initial(userId);
    await _saveTrustScore();
    notifyListeners();
  }

  /// Simulate positive order (for testing)
  @visibleForTesting
  Future<void> simulatePositiveOrder() async {
    if (_trustScore == null) return;
    
    _trustScore = TrustScoreService.simulatePositiveOrder(_trustScore!);
    await _saveTrustScore();
    notifyListeners();
  }
}
