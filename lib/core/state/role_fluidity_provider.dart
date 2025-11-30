import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/role_fluidity_tracker.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/data/remote/role_fluidity_service.dart';

/// Provider for managing role fluidity tracking
class RoleFluidityProvider with ChangeNotifier {
  RoleFluidityTracker? _todayTracker;
  List<RoleFluidityTracker> _history = [];
  bool _isLoading = false;
  String? _error;

  RoleFluidityTracker? get todayTracker => _todayTracker;
  List<RoleFluidityTracker> get history => _history;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // Quick stats
  int get tripleRoleDaysCount {
    return _history.where((t) => t.isTripleRoleDay).length;
  }

  int get currentStreak {
    return RoleFluidityService.calculateTripleRoleStreak(_history);
  }

  String get achievementTier {
    return RoleFluidityService.getAchievementTier(tripleRoleDaysCount);
  }

  RoleFluidityProvider() {
    _loadTrackers();
  }

  /// Load trackers from storage
  Future<void> _loadTrackers() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final trackersJson = prefs.getString('role_fluidity_trackers');

      if (trackersJson != null) {
        final List<dynamic> trackersList = jsonDecode(trackersJson);
        _history = trackersList
            .map((json) => RoleFluidityTracker.fromJson(json as Map<String, dynamic>))
            .toList();

        // Get or create today's tracker
        _todayTracker = RoleFluidityService.getTodayTracker(
          userId: 'default_user_001',
          existingTracker: _history.isNotEmpty ? _history.last : null,
        );

        // Add today's tracker to history if not already there
        if (_history.isEmpty || !_isSameDay(_history.last.date, _todayTracker!.date)) {
          _history.add(_todayTracker!);
        }
      } else {
        // Create initial tracker
        _todayTracker = RoleFluidityTracker.createForToday(
          userId: 'default_user_001',
        );
        _history = [_todayTracker!];
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load trackers: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save trackers to storage
  Future<void> _saveTrackers() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final trackersJson = jsonEncode(_history.map((t) => t.toJson()).toList());
      await prefs.setString('role_fluidity_trackers', trackersJson);
    } catch (e) {
      debugPrint('Error saving trackers: $e');
    }
  }

  /// Record consumer activity
  Future<void> recordConsumerActivity({
    required double amountSpent,
    int ordersPlaced = 1,
  }) async {
    if (_todayTracker == null) return;

    _todayTracker = RoleFluidityService.recordConsumerActivity(
      tracker: _todayTracker!,
      amountSpent: amountSpent,
      ordersPlaced: ordersPlaced,
    );

    _updateHistory();
    await _saveTrackers();
    notifyListeners();
  }

  /// Record partner activity
  Future<void> recordPartnerActivity({
    required double amountEarned,
    int ordersFulfilled = 1,
  }) async {
    if (_todayTracker == null) return;

    _todayTracker = RoleFluidityService.recordPartnerActivity(
      tracker: _todayTracker!,
      amountEarned: amountEarned,
      ordersFulfilled: ordersFulfilled,
    );

    _updateHistory();
    await _saveTrackers();
    notifyListeners();
  }

  /// Record rider activity
  Future<void> recordRiderActivity({
    required double amountEarned,
    int deliveriesCompleted = 1,
  }) async {
    if (_todayTracker == null) return;

    _todayTracker = RoleFluidityService.recordRiderActivity(
      tracker: _todayTracker!,
      amountEarned: amountEarned,
      deliveriesCompleted: deliveriesCompleted,
    );

    _updateHistory();
    await _saveTrackers();
    notifyListeners();
  }

  /// Update history with current tracker
  void _updateHistory() {
    if (_todayTracker == null) return;

    final index = _history.indexWhere((t) => _isSameDay(t.date, _todayTracker!.date));
    if (index != -1) {
      _history[index] = _todayTracker!;
    } else {
      _history.add(_todayTracker!);
    }
  }

  /// Get daily summary
  Map<String, dynamic> getDailySummary() {
    if (_todayTracker == null) {
      return {
        'activeRoles': 0,
        'netBalance': 0.0,
        'isNetPositive': false,
      };
    }
    return RoleFluidityService.getDailySummary(_todayTracker!);
  }

  /// Get weekly summary
  Map<String, dynamic> getWeeklySummary() {
    final now = DateTime.now();
    final weekAgo = now.subtract(const Duration(days: 7));

    final weekTrackers = _history.where((t) {
      return t.date.isAfter(weekAgo) && t.date.isBefore(now.add(const Duration(days: 1)));
    }).toList();

    return RoleFluidityService.getWeeklySummary(weekTrackers);
  }

  /// Get role suggestion
  Map<String, dynamic> getRoleSuggestion() {
    if (_todayTracker == null) {
      return {
        'suggestedRole': 'Consumer',
        'reason': 'Start your day!',
        'potentialEarnings': 0.0,
      };
    }

    return RoleFluidityService.suggestOptimalRole(
      todayTracker: _todayTracker!,
      currentTime: DateTime.now(),
    );
  }

  /// Get motivational message
  String getMotivationalMessage() {
    if (_todayTracker == null) return 'Start your hustle!';
    return RoleFluidityService.getMotivationalMessage(_todayTracker!);
  }

  /// Get trackers for date range
  List<RoleFluidityTracker> getTrackersInRange(DateTime start, DateTime end) {
    return _history.where((t) {
      return t.date.isAfter(start.subtract(const Duration(days: 1))) &&
             t.date.isBefore(end.add(const Duration(days: 1)));
    }).toList();
  }

  /// Get monthly summary
  Map<String, dynamic> getMonthlySummary(DateTime month) {
    final startOfMonth = DateTime(month.year, month.month, 1);
    final endOfMonth = DateTime(month.year, month.month + 1, 0);

    final monthTrackers = getTrackersInRange(startOfMonth, endOfMonth);

    double totalEarnings = 0;
    double totalSpending = 0;
    int tripleRoleDays = 0;
    int totalXp = 0;

    for (final tracker in monthTrackers) {
      totalEarnings += tracker.totalEarnings;
      totalSpending += tracker.consumerSpent;
      if (tracker.isTripleRoleDay) tripleRoleDays++;
      totalXp += tracker.xpEarned;
    }

    return {
      'month': month,
      'totalEarnings': totalEarnings,
      'totalSpending': totalSpending,
      'netBalance': totalEarnings - totalSpending,
      'tripleRoleDays': tripleRoleDays,
      'totalXp': totalXp,
      'daysTracked': monthTrackers.length,
      'averageDailyEarnings': monthTrackers.isNotEmpty 
          ? totalEarnings / monthTrackers.length 
          : 0.0,
    };
  }

  /// Reset trackers (for testing)
  @visibleForTesting
  Future<void> resetTrackers() async {
    _todayTracker = RoleFluidityTracker.createForToday(
      userId: 'default_user_001',
    );
    _history = [_todayTracker!];
    await _saveTrackers();
    notifyListeners();
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}
