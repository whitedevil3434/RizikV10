import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/role_fluidity_tracker.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/data/models/user_profile.dart';

/// Service for managing role fluidity and three-role loop
/// Tracks daily activity across Consumer, Partner, and Rider roles
class RoleFluidityService {
  // Achievement thresholds
  static const int tripleRoleXpBonus = 100;
  static const double netPositiveThreshold = 0.0;

  /// Create or get today's tracker for a user
  static RoleFluidityTracker getTodayTracker({
    required String userId,
    RoleFluidityTracker? existingTracker,
  }) {
    final today = _getToday();

    // If existing tracker is for today, return it
    if (existingTracker != null && _isSameDay(existingTracker.date, today)) {
      return existingTracker;
    }

    // Create new tracker for today
    return RoleFluidityTracker.createForToday(userId: userId);
  }

  /// Record consumer activity (order placed)
  static RoleFluidityTracker recordConsumerActivity({
    required RoleFluidityTracker tracker,
    required double amountSpent,
    int ordersPlaced = 1,
  }) {
    final updated = tracker.recordConsumerActivity(
      amountSpent: amountSpent,
      ordersPlaced: ordersPlaced,
    );

    debugPrint('📱 Consumer activity recorded');
    debugPrint('   Amount spent: ৳${amountSpent.toStringAsFixed(2)}');
    debugPrint('   Orders: $ordersPlaced');
    debugPrint('   Total spent today: ৳${updated.consumerSpent.toStringAsFixed(2)}');

    return _checkTripleRoleAchievement(updated);
  }

  /// Record partner activity (order fulfilled)
  static RoleFluidityTracker recordPartnerActivity({
    required RoleFluidityTracker tracker,
    required double amountEarned,
    int ordersFulfilled = 1,
  }) {
    final updated = tracker.recordPartnerActivity(
      amountEarned: amountEarned,
      ordersFulfilled: ordersFulfilled,
    );

    debugPrint('👨‍🍳 Partner activity recorded');
    debugPrint('   Amount earned: ৳${amountEarned.toStringAsFixed(2)}');
    debugPrint('   Orders fulfilled: $ordersFulfilled');
    debugPrint('   Total earned today: ৳${updated.partnerEarned.toStringAsFixed(2)}');

    return _checkTripleRoleAchievement(updated);
  }

  /// Record rider activity (delivery completed)
  static RoleFluidityTracker recordRiderActivity({
    required RoleFluidityTracker tracker,
    required double amountEarned,
    int deliveriesCompleted = 1,
  }) {
    final updated = tracker.recordRiderActivity(
      amountEarned: amountEarned,
      deliveriesCompleted: deliveriesCompleted,
    );

    debugPrint('🚴 Rider activity recorded');
    debugPrint('   Amount earned: ৳${amountEarned.toStringAsFixed(2)}');
    debugPrint('   Deliveries: $deliveriesCompleted');
    debugPrint('   Total earned today: ৳${updated.riderEarned.toStringAsFixed(2)}');

    return _checkTripleRoleAchievement(updated);
  }

  /// Check and award triple role achievement if eligible
  static RoleFluidityTracker _checkTripleRoleAchievement(
    RoleFluidityTracker tracker,
  ) {
    if (tracker.isEligibleForTripleRoleAchievement && !tracker.isTripleRoleDay) {
      debugPrint('🎉 TRIPLE ROLE ACHIEVEMENT UNLOCKED!');
      debugPrint('   Bonus XP: +$tripleRoleXpBonus');
      return tracker.awardTripleRoleAchievement(bonusXp: tripleRoleXpBonus);
    }
    return tracker;
  }

  /// Get daily summary for display
  static Map<String, dynamic> getDailySummary(RoleFluidityTracker tracker) {
    final netBalance = tracker.netBalance;
    final isPositive = tracker.isNetPositive;
    final activeRoles = tracker.activeRolesCount;

    return {
      'date': tracker.date,
      'activeRoles': activeRoles,
      'activeRolesList': tracker.activeRoles,
      'netBalance': netBalance,
      'isNetPositive': isPositive,
      'totalEarnings': tracker.totalEarnings,
      'totalSpending': tracker.consumerSpent,
      'consumerOrders': tracker.consumerOrders,
      'partnerOrders': tracker.partnerOrdersFulfilled,
      'riderDeliveries': tracker.riderDeliveriesCompleted,
      'isTripleRoleDay': tracker.isTripleRoleDay,
      'xpEarned': tracker.xpEarned,
      'earningsBreakdown': tracker.earningsBreakdown,
      'activityBreakdown': tracker.activityBreakdown,
      'dominantRole': tracker.dominantRole,
    };
  }

  /// Get weekly summary
  static Map<String, dynamic> getWeeklySummary(
    List<RoleFluidityTracker> weekTrackers,
  ) {
    double totalEarnings = 0;
    double totalSpending = 0;
    int tripleRoleDays = 0;
    int totalXp = 0;
    int consumerDays = 0;
    int partnerDays = 0;
    int riderDays = 0;

    for (final tracker in weekTrackers) {
      totalEarnings += tracker.totalEarnings;
      totalSpending += tracker.consumerSpent;
      if (tracker.isTripleRoleDay) tripleRoleDays++;
      totalXp += tracker.xpEarned;
      if (tracker.didConsumerActivity) consumerDays++;
      if (tracker.didPartnerActivity) partnerDays++;
      if (tracker.didRiderActivity) riderDays++;
    }

    final netBalance = totalEarnings - totalSpending;

    return {
      'totalEarnings': totalEarnings,
      'totalSpending': totalSpending,
      'netBalance': netBalance,
      'isNetPositive': netBalance > 0,
      'tripleRoleDays': tripleRoleDays,
      'totalXp': totalXp,
      'consumerDays': consumerDays,
      'partnerDays': partnerDays,
      'riderDays': riderDays,
      'daysTracked': weekTrackers.length,
      'averageDailyEarnings': weekTrackers.isNotEmpty 
          ? totalEarnings / weekTrackers.length 
          : 0.0,
    };
  }

  /// Suggest optimal role based on context
  static Map<String, dynamic> suggestOptimalRole({
    required RoleFluidityTracker todayTracker,
    required DateTime currentTime,
    double? userLatitude,
    double? userLongitude,
  }) {
    final hour = currentTime.hour;
    final activeRoles = todayTracker.activeRoles;

    // Time-based suggestions
    String suggestedRole;
    String reason;
    double potentialEarnings;

    if (hour >= 7 && hour < 10) {
      // Morning: Breakfast delivery peak
      suggestedRole = 'Rider';
      reason = 'Morning delivery peak - high demand for breakfast orders';
      potentialEarnings = 300.0;
    } else if (hour >= 10 && hour < 12) {
      // Late morning: Cooking time
      suggestedRole = 'Partner';
      reason = 'Prepare lunch items - orders will come soon';
      potentialEarnings = 500.0;
    } else if (hour >= 12 && hour < 14) {
      // Lunch: High delivery demand
      suggestedRole = 'Rider';
      reason = 'Lunch rush - maximum delivery opportunities';
      potentialEarnings = 400.0;
    } else if (hour >= 14 && hour < 17) {
      // Afternoon: Prep for dinner
      suggestedRole = 'Partner';
      reason = 'Prepare dinner items and snacks';
      potentialEarnings = 600.0;
    } else if (hour >= 17 && hour < 21) {
      // Evening: Dinner peak
      suggestedRole = 'Rider';
      reason = 'Dinner rush - highest earning potential';
      potentialEarnings = 500.0;
    } else {
      // Night/Late: Consumer mode
      suggestedRole = 'Consumer';
      reason = 'Relax and enjoy - order your favorite food';
      potentialEarnings = 0.0;
    }

    // Check if user needs to complete triple role
    if (activeRoles.length == 2 && !todayTracker.isTripleRoleDay) {
      final missingRole = _getMissingRole(activeRoles);
      suggestedRole = missingRole.displayName;
      reason = '🎯 Complete Triple Role Achievement! (+$tripleRoleXpBonus XP)';
      potentialEarnings += tripleRoleXpBonus.toDouble();
    }

    // Check if user is net negative
    if (todayTracker.netBalance < 0 && todayTracker.consumerSpent > 0) {
      if (suggestedRole == 'Consumer') {
        suggestedRole = 'Partner';
        reason = '💰 You\'re net negative today - earn some money!';
        potentialEarnings = todayTracker.consumerSpent.abs();
      }
    }

    return {
      'suggestedRole': suggestedRole,
      'reason': reason,
      'potentialEarnings': potentialEarnings,
      'currentTime': currentTime,
      'activeRolesToday': activeRoles.length,
      'needsForTripleRole': activeRoles.length < 3,
      'netBalance': todayTracker.netBalance,
    };
  }

  /// Get missing role for triple role achievement
  static UserRole _getMissingRole(List<UserRole> activeRoles) {
    final allRoles = [UserRole.consumer, UserRole.partner, UserRole.rider];
    for (final role in allRoles) {
      if (!activeRoles.contains(role)) {
        return role;
      }
    }
    return UserRole.consumer; // Fallback
  }

  /// Calculate streak (consecutive triple role days)
  static int calculateTripleRoleStreak(List<RoleFluidityTracker> trackers) {
    if (trackers.isEmpty) return 0;

    // Sort by date (most recent first)
    final sorted = List<RoleFluidityTracker>.from(trackers)
      ..sort((a, b) => b.date.compareTo(a.date));

    int streak = 0;
    for (final tracker in sorted) {
      if (tracker.isTripleRoleDay) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  }

  /// Get achievement tier based on triple role days
  static String getAchievementTier(int tripleRoleDays) {
    if (tripleRoleDays >= 30) {
      return '💎 Diamond Hustler';
    } else if (tripleRoleDays >= 14) {
      return '🥇 Gold Hustler';
    } else if (tripleRoleDays >= 7) {
      return '🥈 Silver Hustler';
    } else if (tripleRoleDays >= 3) {
      return '🥉 Bronze Hustler';
    } else if (tripleRoleDays >= 1) {
      return '⭐ Rising Hustler';
    } else {
      return '🌱 Beginner';
    }
  }

  /// Get motivational message based on progress
  static String getMotivationalMessage(RoleFluidityTracker tracker) {
    if (tracker.isTripleRoleDay) {
      return '🎉 Amazing! You completed all 3 roles today!';
    }

    final activeRoles = tracker.activeRolesCount;
    if (activeRoles == 2) {
      final missing = _getMissingRole(tracker.activeRoles);
      return '🎯 One more role to go! Try ${missing.displayName} mode.';
    }

    if (activeRoles == 1) {
      return '💪 Great start! Try another role to earn more.';
    }

    if (tracker.isNetPositive) {
      return '💰 You\'re earning more than spending - keep it up!';
    }

    return '🚀 Start your hustle - switch roles and earn!';
  }

  // Helper methods
  static DateTime _getToday() {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day);
  }

  static bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}
