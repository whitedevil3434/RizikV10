import 'package:flutter/foundation.dart';

/// Represents different categories for trust scoring
enum TrustCategory {
  cooking('cooking', 'রান্না'),
  delivery('delivery', 'ডেলিভারি'),
  payment('payment', 'পেমেন্ট'),
  communication('communication', 'যোগাযোগ'),
  reliability('reliability', 'নির্ভরযোগ্যতা');

  const TrustCategory(this.key, this.nameBn);
  
  final String key;
  final String nameBn;
}

/// Represents different types of trust-affecting events
enum TrustEvent {
  orderCompleted('order_completed', 50),
  onTimeDelivery('on_time_delivery', 30),
  lateDelivery('late_delivery', -20),
  qualityRating('quality_rating', 0), // Variable based on rating
  paymentOnTime('payment_on_time', 25),
  paymentLate('payment_late', -15),
  customerComplaint('customer_complaint', -40),
  positiveReview('positive_review', 35),
  badgeEarned('badge_earned', 100),
  missionChainCompleted('mission_chain_completed', 75);

  const TrustEvent(this.key, this.basePoints);
  
  final String key;
  final int basePoints;
}

/// Badge rarity levels
enum BadgeRarity {
  common('সাধারণ', 1.0),
  uncommon('অসাধারণ', 1.5),
  rare('বিরল', 2.0),
  epic('মহাকাব্যিক', 3.0),
  legendary('কিংবদন্তি', 5.0);

  const BadgeRarity(this.nameBn, this.multiplier);
  
  final String nameBn;
  final double multiplier;
}

/// Trust level based on overall score
enum TrustLevel {
  critical('Critical', 'সংকটজনক', 0xFFEF5350),
  poor('Poor', 'দুর্বল', 0xFFFF9800),
  average('Average', 'গড়', 0xFFFFC107),
  good('Good', 'ভালো', 0xFF66BB6A),
  excellent('Excellent', 'চমৎকার', 0xFFFFD700);

  const TrustLevel(this.name, this.nameBn, this.color);
  
  final String name;
  final String nameBn;
  final int color;
}

/// Represents a badge that can be earned by users
@immutable
class Badge {
  final String id;
  final String name;
  final String nameBn;
  final String emoji;
  final TrustCategory category;
  final BadgeRarity rarity;
  final String description;
  final String descriptionBn;
  final int xpReward;
  final DateTime? earnedAt;

  const Badge({
    required this.id,
    required this.name,
    required this.nameBn,
    required this.emoji,
    required this.category,
    required this.rarity,
    required this.description,
    required this.descriptionBn,
    required this.xpReward,
    this.earnedAt,
  });

  Badge copyWith({
    String? id,
    String? name,
    String? nameBn,
    String? emoji,
    TrustCategory? category,
    BadgeRarity? rarity,
    String? description,
    String? descriptionBn,
    int? xpReward,
    DateTime? earnedAt,
  }) {
    return Badge(
      id: id ?? this.id,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      emoji: emoji ?? this.emoji,
      category: category ?? this.category,
      rarity: rarity ?? this.rarity,
      description: description ?? this.description,
      descriptionBn: descriptionBn ?? this.descriptionBn,
      xpReward: xpReward ?? this.xpReward,
      earnedAt: earnedAt ?? this.earnedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_bn': nameBn,
      'emoji': emoji,
      'category': category.key,
      'rarity': rarity.name,
      'description': description,
      'description_bn': descriptionBn,
      'xp_reward': xpReward,
      'earned_at': earnedAt?.toIso8601String(),
    };
  }

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      id: json['id'] as String,
      name: json['name'] as String,
      nameBn: json['name_bn'] as String,
      emoji: json['emoji'] as String,
      category: TrustCategory.values.firstWhere(
        (c) => c.key == json['category'],
        orElse: () => TrustCategory.reliability,
      ),
      rarity: BadgeRarity.values.firstWhere(
        (r) => r.name == json['rarity'],
        orElse: () => BadgeRarity.common,
      ),
      description: json['description'] as String,
      descriptionBn: json['description_bn'] as String,
      xpReward: json['xp_reward'] as int,
      earnedAt: json['earned_at'] != null 
        ? DateTime.parse(json['earned_at'] as String)
        : null,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Badge && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

/// Main trust score model containing all trust-related data
@immutable
class TrustScore {
  final String userId;
  final double overall; // 0.0 to 5.0
  final Map<TrustCategory, double> categories;
  final List<Badge> badges;
  final int totalTransactions;
  final double onTimeRate; // 0.0 to 1.0
  final double averageRating; // 0.0 to 5.0
  final DateTime lastUpdated;
  final List<TrustEvent> recentEvents;

  const TrustScore({
    required this.userId,
    required this.overall,
    required this.categories,
    required this.badges,
    required this.totalTransactions,
    required this.onTimeRate,
    required this.averageRating,
    required this.lastUpdated,
    this.recentEvents = const [],
  });

  /// Calculate trust score based on weighted formula:
  /// 40% on-time rate, 30% quality score, 20% transaction count, 10% badge count
  static double calculateOverallScore({
    required double onTimeRate,
    required double averageRating,
    required int totalTransactions,
    required int badgeCount,
  }) {
    // Normalize transaction count (cap at 100 for scoring)
    final normalizedTransactions = (totalTransactions / 100).clamp(0.0, 1.0);
    
    // Normalize badge count (cap at 20 for scoring)
    final normalizedBadges = (badgeCount / 20).clamp(0.0, 1.0);
    
    // Weighted calculation
    final score = (onTimeRate * 0.4) + 
                  (averageRating / 5.0 * 0.3) + 
                  (normalizedTransactions * 0.2) + 
                  (normalizedBadges * 0.1);
    
    return (score * 5.0).clamp(0.0, 5.0);
  }

  /// Get trust level based on overall score
  TrustLevel get trustLevel {
    if (overall >= 4.5) return TrustLevel.excellent;
    if (overall >= 4.0) return TrustLevel.good;
    if (overall >= 3.0) return TrustLevel.average;
    if (overall >= 2.0) return TrustLevel.poor;
    return TrustLevel.critical;
  }

  /// Check if user has access to premium features
  bool get hasPremiumAccess => overall >= 3.0;

  /// Get badges by category
  List<Badge> getBadgesByCategory(TrustCategory category) {
    return badges.where((badge) => badge.category == category).toList();
  }

  /// Get recent badges (earned in last 30 days)
  List<Badge> get recentBadges {
    final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));
    return badges.where((badge) => 
      badge.earnedAt != null && badge.earnedAt!.isAfter(thirtyDaysAgo)
    ).toList();
  }

  TrustScore copyWith({
    String? userId,
    double? overall,
    Map<TrustCategory, double>? categories,
    List<Badge>? badges,
    int? totalTransactions,
    double? onTimeRate,
    double? averageRating,
    DateTime? lastUpdated,
    List<TrustEvent>? recentEvents,
  }) {
    return TrustScore(
      userId: userId ?? this.userId,
      overall: overall ?? this.overall,
      categories: categories ?? this.categories,
      badges: badges ?? this.badges,
      totalTransactions: totalTransactions ?? this.totalTransactions,
      onTimeRate: onTimeRate ?? this.onTimeRate,
      averageRating: averageRating ?? this.averageRating,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      recentEvents: recentEvents ?? this.recentEvents,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'overall': overall,
      'categories': categories.map((key, value) => MapEntry(key.key, value)),
      'badges': badges.map((badge) => badge.toJson()).toList(),
      'total_transactions': totalTransactions,
      'on_time_rate': onTimeRate,
      'average_rating': averageRating,
      'last_updated': lastUpdated.toIso8601String(),
      'recent_events': recentEvents.map((event) => event.key).toList(),
    };
  }

  factory TrustScore.fromJson(Map<String, dynamic> json) {
    final categoriesMap = (json['categories'] as Map<String, dynamic>).map(
      (key, value) => MapEntry(
        TrustCategory.values.firstWhere((c) => c.key == key),
        (value as num).toDouble(),
      ),
    );

    final badgesList = (json['badges'] as List<dynamic>)
        .map((badgeJson) => Badge.fromJson(badgeJson as Map<String, dynamic>))
        .toList();

    final eventsList = (json['recent_events'] as List<dynamic>?)
        ?.map((eventKey) => TrustEvent.values.firstWhere(
              (e) => e.key == eventKey,
              orElse: () => TrustEvent.orderCompleted,
            ))
        .toList() ?? [];

    return TrustScore(
      userId: json['user_id'] as String,
      overall: (json['overall'] as num).toDouble(),
      categories: categoriesMap,
      badges: badgesList,
      totalTransactions: json['total_transactions'] as int,
      onTimeRate: (json['on_time_rate'] as num).toDouble(),
      averageRating: (json['average_rating'] as num).toDouble(),
      lastUpdated: DateTime.parse(json['last_updated'] as String),
      recentEvents: eventsList,
    );
  }

  /// Create a default trust score for new users
  factory TrustScore.initial(String userId) {
    return TrustScore(
      userId: userId,
      overall: 3.0,
      categories: {
        TrustCategory.cooking: 3.0,
        TrustCategory.delivery: 3.0,
        TrustCategory.payment: 3.0,
        TrustCategory.communication: 3.0,
        TrustCategory.reliability: 3.0,
      },
      badges: [],
      totalTransactions: 0,
      onTimeRate: 1.0,
      averageRating: 3.0,
      lastUpdated: DateTime.now(),
      recentEvents: [],
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is TrustScore && other.userId == userId;
  }

  @override
  int get hashCode => userId.hashCode;
}
