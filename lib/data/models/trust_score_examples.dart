/// Example usage of TrustScore models
/// This file demonstrates how to create and use trust scores, badges, and events

import 'package:rizik_v4/data/models/trust_score.dart';

/// Example badges that can be earned
class ExampleBadges {
  static const Badge speedDemon = Badge(
    id: 'speed_demon',
    name: 'Speed Demon',
    nameBn: 'দ্রুততম',
    emoji: '⚡',
    category: TrustCategory.delivery,
    rarity: BadgeRarity.rare,
    description: 'Complete 50 deliveries on time',
    descriptionBn: '৫০টি ডেলিভারি সময়মতো সম্পন্ন করুন',
    xpReward: 500,
  );

  static const Badge masterChef = Badge(
    id: 'master_chef',
    name: 'Master Chef',
    nameBn: 'মাস্টার শেফ',
    emoji: '👨‍🍳',
    category: TrustCategory.cooking,
    rarity: BadgeRarity.epic,
    description: 'Maintain 4.5+ rating for 100 orders',
    descriptionBn: '১০০টি অর্ডারে ৪.৫+ রেটিং বজায় রাখুন',
    xpReward: 1000,
  );

  static const Badge reliablePartner = Badge(
    id: 'reliable_partner',
    name: 'Reliable Partner',
    nameBn: 'বিশ্বস্ত সঙ্গী',
    emoji: '🛡️',
    category: TrustCategory.reliability,
    rarity: BadgeRarity.uncommon,
    description: 'Complete 25 orders without complaints',
    descriptionBn: '২৫টি অর্ডার অভিযোগ ছাড়াই সম্পন্ন করুন',
    xpReward: 300,
  );

  static const Badge paymentPro = Badge(
    id: 'payment_pro',
    name: 'Payment Pro',
    nameBn: 'পেমেন্ট প্রো',
    emoji: '💰',
    category: TrustCategory.payment,
    rarity: BadgeRarity.common,
    description: 'Make 10 on-time payments',
    descriptionBn: '১০টি সময়মতো পেমেন্ট করুন',
    xpReward: 150,
  );

  static const Badge communicator = Badge(
    id: 'communicator',
    name: 'Great Communicator',
    nameBn: 'দুর্দান্ত যোগাযোগকারী',
    emoji: '💬',
    category: TrustCategory.communication,
    rarity: BadgeRarity.common,
    description: 'Respond to 50 messages within 5 minutes',
    descriptionBn: '৫০টি বার্তায় ৫ মিনিটের মধ্যে সাড়া দিন',
    xpReward: 200,
  );

  static List<Badge> get allBadges => [
    speedDemon,
    masterChef,
    reliablePartner,
    paymentPro,
    communicator,
  ];
}

/// Example trust score scenarios
class TrustScoreExamples {
  /// New user with default trust score
  static TrustScore get newUser {
    return TrustScore.initial('user_001');
  }

  /// Experienced user with excellent trust
  static TrustScore get excellentUser {
    return TrustScore(
      userId: 'user_002',
      overall: 4.7,
      categories: {
        TrustCategory.cooking: 4.8,
        TrustCategory.delivery: 4.9,
        TrustCategory.payment: 4.5,
        TrustCategory.communication: 4.6,
        TrustCategory.reliability: 4.7,
      },
      badges: [
        ExampleBadges.speedDemon.copyWith(earnedAt: DateTime.now().subtract(const Duration(days: 10))),
        ExampleBadges.masterChef.copyWith(earnedAt: DateTime.now().subtract(const Duration(days: 5))),
        ExampleBadges.reliablePartner.copyWith(earnedAt: DateTime.now().subtract(const Duration(days: 20))),
      ],
      totalTransactions: 245,
      onTimeRate: 0.96,
      averageRating: 4.8,
      lastUpdated: DateTime.now(),
      recentEvents: [
        TrustEvent.orderCompleted,
        TrustEvent.onTimeDelivery,
        TrustEvent.positiveReview,
      ],
    );
  }

  /// User with low trust score
  static TrustScore get lowTrustUser {
    return TrustScore(
      userId: 'user_003',
      overall: 2.3,
      categories: {
        TrustCategory.cooking: 2.5,
        TrustCategory.delivery: 2.0,
        TrustCategory.payment: 2.8,
        TrustCategory.communication: 2.1,
        TrustCategory.reliability: 2.2,
      },
      badges: [],
      totalTransactions: 15,
      onTimeRate: 0.60,
      averageRating: 2.5,
      lastUpdated: DateTime.now(),
      recentEvents: [
        TrustEvent.lateDelivery,
        TrustEvent.customerComplaint,
        TrustEvent.paymentLate,
      ],
    );
  }

  /// Calculate score example
  static void demonstrateCalculation() {
    final calculatedScore = TrustScore.calculateOverallScore(
      onTimeRate: 0.95,
      averageRating: 4.5,
      totalTransactions: 100,
      badgeCount: 5,
    );
    
    print('Calculated Trust Score: $calculatedScore');
    // Expected: ~4.45 out of 5.0
  }
}
