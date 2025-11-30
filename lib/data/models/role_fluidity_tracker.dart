import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/user_role.dart';

/// Daily role activity tracking for three-role fluidity
@immutable
class RoleFluidityTracker {
  final String id;
  final String userId;
  final DateTime date; // Date being tracked
  
  // Role activity tracking
  final bool didConsumerActivity;
  final bool didPartnerActivity;
  final bool didRiderActivity;
  
  // Earnings breakdown by role
  final double consumerSpent; // Money spent as consumer
  final double partnerEarned; // Money earned as partner
  final double riderEarned; // Money earned as rider
  
  // Activity details
  final int consumerOrders;
  final int partnerOrdersFulfilled;
  final int riderDeliveriesCompleted;
  
  // Timestamps
  final DateTime? firstConsumerActivity;
  final DateTime? firstPartnerActivity;
  final DateTime? firstRiderActivity;
  
  // Achievement tracking
  final bool isTripleRoleDay; // Completed all 3 roles in one day
  final int xpEarned;
  final DateTime createdAt;
  final DateTime lastUpdated;

  const RoleFluidityTracker({
    required this.id,
    required this.userId,
    required this.date,
    this.didConsumerActivity = false,
    this.didPartnerActivity = false,
    this.didRiderActivity = false,
    this.consumerSpent = 0.0,
    this.partnerEarned = 0.0,
    this.riderEarned = 0.0,
    this.consumerOrders = 0,
    this.partnerOrdersFulfilled = 0,
    this.riderDeliveriesCompleted = 0,
    this.firstConsumerActivity,
    this.firstPartnerActivity,
    this.firstRiderActivity,
    this.isTripleRoleDay = false,
    this.xpEarned = 0,
    required this.createdAt,
    required this.lastUpdated,
  });

  /// Calculate net balance (earnings - spending)
  double get netBalance => (partnerEarned + riderEarned) - consumerSpent;

  /// Check if net positive (earned more than spent)
  bool get isNetPositive => netBalance > 0;

  /// Get total earnings across all roles
  double get totalEarnings => partnerEarned + riderEarned;

  /// Get number of active roles today
  int get activeRolesCount {
    int count = 0;
    if (didConsumerActivity) count++;
    if (didPartnerActivity) count++;
    if (didRiderActivity) count++;
    return count;
  }

  /// Get list of active roles
  List<UserRole> get activeRoles {
    final roles = <UserRole>[];
    if (didConsumerActivity) roles.add(UserRole.consumer);
    if (didPartnerActivity) roles.add(UserRole.partner);
    if (didRiderActivity) roles.add(UserRole.rider);
    return roles;
  }

  /// Get earnings breakdown as map
  Map<UserRole, double> get earningsBreakdown {
    return {
      UserRole.consumer: -consumerSpent, // Negative because it's spending
      UserRole.partner: partnerEarned,
      UserRole.rider: riderEarned,
    };
  }

  /// Get activity breakdown as map
  Map<UserRole, int> get activityBreakdown {
    return {
      UserRole.consumer: consumerOrders,
      UserRole.partner: partnerOrdersFulfilled,
      UserRole.rider: riderDeliveriesCompleted,
    };
  }

  /// Check if eligible for triple role achievement
  bool get isEligibleForTripleRoleAchievement {
    return didConsumerActivity && didPartnerActivity && didRiderActivity;
  }

  /// Get dominant role (role with most earnings)
  UserRole? get dominantRole {
    if (totalEarnings == 0) return null;
    
    if (partnerEarned >= riderEarned) {
      return UserRole.partner;
    } else {
      return UserRole.rider;
    }
  }

  /// Get role activity duration (time between first and last activity)
  Duration? get activityDuration {
    final timestamps = [
      firstConsumerActivity,
      firstPartnerActivity,
      firstRiderActivity,
    ].whereType<DateTime>().toList();
    
    if (timestamps.isEmpty) return null;
    
    timestamps.sort();
    return timestamps.last.difference(timestamps.first);
  }

  RoleFluidityTracker copyWith({
    String? id,
    String? userId,
    DateTime? date,
    bool? didConsumerActivity,
    bool? didPartnerActivity,
    bool? didRiderActivity,
    double? consumerSpent,
    double? partnerEarned,
    double? riderEarned,
    int? consumerOrders,
    int? partnerOrdersFulfilled,
    int? riderDeliveriesCompleted,
    DateTime? firstConsumerActivity,
    DateTime? firstPartnerActivity,
    DateTime? firstRiderActivity,
    bool? isTripleRoleDay,
    int? xpEarned,
    DateTime? createdAt,
    DateTime? lastUpdated,
  }) {
    return RoleFluidityTracker(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      date: date ?? this.date,
      didConsumerActivity: didConsumerActivity ?? this.didConsumerActivity,
      didPartnerActivity: didPartnerActivity ?? this.didPartnerActivity,
      didRiderActivity: didRiderActivity ?? this.didRiderActivity,
      consumerSpent: consumerSpent ?? this.consumerSpent,
      partnerEarned: partnerEarned ?? this.partnerEarned,
      riderEarned: riderEarned ?? this.riderEarned,
      consumerOrders: consumerOrders ?? this.consumerOrders,
      partnerOrdersFulfilled: partnerOrdersFulfilled ?? this.partnerOrdersFulfilled,
      riderDeliveriesCompleted: riderDeliveriesCompleted ?? this.riderDeliveriesCompleted,
      firstConsumerActivity: firstConsumerActivity ?? this.firstConsumerActivity,
      firstPartnerActivity: firstPartnerActivity ?? this.firstPartnerActivity,
      firstRiderActivity: firstRiderActivity ?? this.firstRiderActivity,
      isTripleRoleDay: isTripleRoleDay ?? this.isTripleRoleDay,
      xpEarned: xpEarned ?? this.xpEarned,
      createdAt: createdAt ?? this.createdAt,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'date': date.toIso8601String(),
      'did_consumer_activity': didConsumerActivity,
      'did_partner_activity': didPartnerActivity,
      'did_rider_activity': didRiderActivity,
      'consumer_spent': consumerSpent,
      'partner_earned': partnerEarned,
      'rider_earned': riderEarned,
      'consumer_orders': consumerOrders,
      'partner_orders_fulfilled': partnerOrdersFulfilled,
      'rider_deliveries_completed': riderDeliveriesCompleted,
      'first_consumer_activity': firstConsumerActivity?.toIso8601String(),
      'first_partner_activity': firstPartnerActivity?.toIso8601String(),
      'first_rider_activity': firstRiderActivity?.toIso8601String(),
      'is_triple_role_day': isTripleRoleDay,
      'xp_earned': xpEarned,
      'created_at': createdAt.toIso8601String(),
      'last_updated': lastUpdated.toIso8601String(),
    };
  }

  factory RoleFluidityTracker.fromJson(Map<String, dynamic> json) {
    return RoleFluidityTracker(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      date: DateTime.parse(json['date'] as String),
      didConsumerActivity: json['did_consumer_activity'] as bool? ?? false,
      didPartnerActivity: json['did_partner_activity'] as bool? ?? false,
      didRiderActivity: json['did_rider_activity'] as bool? ?? false,
      consumerSpent: (json['consumer_spent'] as num?)?.toDouble() ?? 0.0,
      partnerEarned: (json['partner_earned'] as num?)?.toDouble() ?? 0.0,
      riderEarned: (json['rider_earned'] as num?)?.toDouble() ?? 0.0,
      consumerOrders: json['consumer_orders'] as int? ?? 0,
      partnerOrdersFulfilled: json['partner_orders_fulfilled'] as int? ?? 0,
      riderDeliveriesCompleted: json['rider_deliveries_completed'] as int? ?? 0,
      firstConsumerActivity: json['first_consumer_activity'] != null
          ? DateTime.parse(json['first_consumer_activity'] as String)
          : null,
      firstPartnerActivity: json['first_partner_activity'] != null
          ? DateTime.parse(json['first_partner_activity'] as String)
          : null,
      firstRiderActivity: json['first_rider_activity'] != null
          ? DateTime.parse(json['first_rider_activity'] as String)
          : null,
      isTripleRoleDay: json['is_triple_role_day'] as bool? ?? false,
      xpEarned: json['xp_earned'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      lastUpdated: DateTime.parse(json['last_updated'] as String),
    );
  }

  /// Create a new tracker for today
  factory RoleFluidityTracker.createForToday({
    required String userId,
  }) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    
    return RoleFluidityTracker(
      id: 'fluidity_${userId}_${today.millisecondsSinceEpoch}',
      userId: userId,
      date: today,
      createdAt: now,
      lastUpdated: now,
    );
  }

  /// Record consumer activity
  RoleFluidityTracker recordConsumerActivity({
    required double amountSpent,
    int ordersPlaced = 1,
  }) {
    final now = DateTime.now();
    return copyWith(
      didConsumerActivity: true,
      consumerSpent: consumerSpent + amountSpent,
      consumerOrders: consumerOrders + ordersPlaced,
      firstConsumerActivity: firstConsumerActivity ?? now,
      lastUpdated: now,
    );
  }

  /// Record partner activity
  RoleFluidityTracker recordPartnerActivity({
    required double amountEarned,
    int ordersFulfilled = 1,
  }) {
    final now = DateTime.now();
    return copyWith(
      didPartnerActivity: true,
      partnerEarned: partnerEarned + amountEarned,
      partnerOrdersFulfilled: partnerOrdersFulfilled + ordersFulfilled,
      firstPartnerActivity: firstPartnerActivity ?? now,
      lastUpdated: now,
    );
  }

  /// Record rider activity
  RoleFluidityTracker recordRiderActivity({
    required double amountEarned,
    int deliveriesCompleted = 1,
  }) {
    final now = DateTime.now();
    return copyWith(
      didRiderActivity: true,
      riderEarned: riderEarned + amountEarned,
      riderDeliveriesCompleted: riderDeliveriesCompleted + deliveriesCompleted,
      firstRiderActivity: firstRiderActivity ?? now,
      lastUpdated: now,
    );
  }

  /// Award triple role achievement
  RoleFluidityTracker awardTripleRoleAchievement({
    int bonusXp = 100,
  }) {
    if (!isEligibleForTripleRoleAchievement) return this;
    
    return copyWith(
      isTripleRoleDay: true,
      xpEarned: xpEarned + bonusXp,
      lastUpdated: DateTime.now(),
    );
  }
}

/// Weekly/Monthly role fluidity summary
@immutable
class RoleFluiditySummary {
  final String userId;
  final DateTime startDate;
  final DateTime endDate;
  final List<RoleFluidityTracker> dailyTrackers;

  const RoleFluiditySummary({
    required this.userId,
    required this.startDate,
    required this.endDate,
    required this.dailyTrackers,
  });

  /// Get total net balance for period
  double get totalNetBalance {
    return dailyTrackers.fold(0.0, (sum, tracker) => sum + tracker.netBalance);
  }

  /// Get total earnings for period
  double get totalEarnings {
    return dailyTrackers.fold(0.0, (sum, tracker) => sum + tracker.totalEarnings);
  }

  /// Get total spending for period
  double get totalSpending {
    return dailyTrackers.fold(0.0, (sum, tracker) => sum + tracker.consumerSpent);
  }

  /// Get number of triple role days
  int get tripleRoleDaysCount {
    return dailyTrackers.where((t) => t.isTripleRoleDay).length;
  }

  /// Get most active role
  UserRole? get mostActiveRole {
    double consumerTotal = 0;
    double partnerTotal = 0;
    double riderTotal = 0;

    for (final tracker in dailyTrackers) {
      consumerTotal += tracker.consumerSpent;
      partnerTotal += tracker.partnerEarned;
      riderTotal += tracker.riderEarned;
    }

    if (partnerTotal >= riderTotal && partnerTotal > 0) {
      return UserRole.partner;
    } else if (riderTotal > 0) {
      return UserRole.rider;
    } else if (consumerTotal > 0) {
      return UserRole.consumer;
    }
    
    return null;
  }

  /// Get earnings by role
  Map<UserRole, double> get earningsByRole {
    double partnerTotal = 0;
    double riderTotal = 0;

    for (final tracker in dailyTrackers) {
      partnerTotal += tracker.partnerEarned;
      riderTotal += tracker.riderEarned;
    }

    return {
      UserRole.partner: partnerTotal,
      UserRole.rider: riderTotal,
    };
  }

  /// Get days active per role
  Map<UserRole, int> get daysActivePerRole {
    int consumerDays = 0;
    int partnerDays = 0;
    int riderDays = 0;

    for (final tracker in dailyTrackers) {
      if (tracker.didConsumerActivity) consumerDays++;
      if (tracker.didPartnerActivity) partnerDays++;
      if (tracker.didRiderActivity) riderDays++;
    }

    return {
      UserRole.consumer: consumerDays,
      UserRole.partner: partnerDays,
      UserRole.rider: riderDays,
    };
  }
}
