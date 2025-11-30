import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/models/order.dart';

/// Service for calculating and managing trust scores
/// Implements the weighted calculation logic: 40% on-time, 30% quality, 20% transactions, 10% badges
class TrustScoreService {
  /// Update trust score based on order completion
  /// This is the main entry point for trust score updates
  static TrustScore updateTrustScoreOnOrderCompletion({
    required TrustScore currentScore,
    required Order order,
    required bool wasOnTime,
    required double qualityRating, // 0.0 to 5.0
    bool wasPaymentOnTime = true,
  }) {
    // Calculate new metrics
    final newTotalTransactions = currentScore.totalTransactions + 1;
    final onTimeDeliveries = (currentScore.onTimeRate * currentScore.totalTransactions) + (wasOnTime ? 1 : 0);
    final newOnTimeRate = onTimeDeliveries / newTotalTransactions;
    
    // Update average rating with weighted average
    final totalRatingPoints = (currentScore.averageRating * currentScore.totalTransactions) + qualityRating;
    final newAverageRating = totalRatingPoints / newTotalTransactions;

    // Update category scores
    final updatedCategories = Map<TrustCategory, double>.from(currentScore.categories);
    
    // Update delivery category based on on-time performance
    updatedCategories[TrustCategory.delivery] = _updateCategoryScore(
      currentScore: updatedCategories[TrustCategory.delivery] ?? 3.0,
      wasPositive: wasOnTime,
      weight: 0.1,
    );

    // Update payment category
    updatedCategories[TrustCategory.payment] = _updateCategoryScore(
      currentScore: updatedCategories[TrustCategory.payment] ?? 3.0,
      wasPositive: wasPaymentOnTime,
      weight: 0.1,
    );

    // Update reliability based on overall performance
    updatedCategories[TrustCategory.reliability] = _updateCategoryScore(
      currentScore: updatedCategories[TrustCategory.reliability] ?? 3.0,
      wasPositive: wasOnTime && qualityRating >= 4.0,
      weight: 0.08,
    );

    // Calculate new overall score
    final newOverall = TrustScore.calculateOverallScore(
      onTimeRate: newOnTimeRate,
      averageRating: newAverageRating,
      totalTransactions: newTotalTransactions,
      badgeCount: currentScore.badges.length,
    );

    // Build recent events list
    final recentEvents = List<TrustEvent>.from(currentScore.recentEvents);
    recentEvents.add(TrustEvent.orderCompleted);
    if (wasOnTime) {
      recentEvents.add(TrustEvent.onTimeDelivery);
    } else {
      recentEvents.add(TrustEvent.lateDelivery);
    }
    if (qualityRating >= 4.5) {
      recentEvents.add(TrustEvent.positiveReview);
    }
    if (wasPaymentOnTime) {
      recentEvents.add(TrustEvent.paymentOnTime);
    } else {
      recentEvents.add(TrustEvent.paymentLate);
    }
    
    // Keep only last 10 events
    if (recentEvents.length > 10) {
      recentEvents.removeRange(0, recentEvents.length - 10);
    }

    return currentScore.copyWith(
      overall: newOverall,
      categories: updatedCategories,
      totalTransactions: newTotalTransactions,
      onTimeRate: newOnTimeRate,
      averageRating: newAverageRating,
      lastUpdated: DateTime.now(),
      recentEvents: recentEvents,
    );
  }

  /// Update category-specific score
  /// Uses exponential moving average for smooth transitions
  static double _updateCategoryScore({
    required double currentScore,
    required bool wasPositive,
    required double weight,
  }) {
    final change = wasPositive ? weight : -weight;
    final newScore = currentScore + change;
    return newScore.clamp(0.0, 5.0);
  }

  /// Award a badge to user
  static TrustScore awardBadge({
    required TrustScore currentScore,
    required Badge badge,
  }) {
    // Check if badge already earned
    if (currentScore.badges.any((b) => b.id == badge.id)) {
      return currentScore;
    }

    // Add badge with earned timestamp
    final earnedBadge = badge.copyWith(earnedAt: DateTime.now());
    final updatedBadges = List<Badge>.from(currentScore.badges)..add(earnedBadge);

    // Recalculate overall score with new badge count
    final newOverall = TrustScore.calculateOverallScore(
      onTimeRate: currentScore.onTimeRate,
      averageRating: currentScore.averageRating,
      totalTransactions: currentScore.totalTransactions,
      badgeCount: updatedBadges.length,
    );

    // Add badge earned event
    final recentEvents = List<TrustEvent>.from(currentScore.recentEvents)
      ..add(TrustEvent.badgeEarned);
    if (recentEvents.length > 10) {
      recentEvents.removeRange(0, recentEvents.length - 10);
    }

    return currentScore.copyWith(
      overall: newOverall,
      badges: updatedBadges,
      lastUpdated: DateTime.now(),
      recentEvents: recentEvents,
    );
  }

  /// Check and award milestone badges based on current metrics
  static List<Badge> checkMilestoneBadges(TrustScore score) {
    final earnableBadges = <Badge>[];
    final earnedBadgeIds = score.badges.map((b) => b.id).toSet();

    // Speed Demon: 50+ on-time deliveries
    if (!earnedBadgeIds.contains('speed_demon') &&
        score.totalTransactions >= 50 &&
        score.onTimeRate >= 0.95) {
      earnableBadges.add(const Badge(
        id: 'speed_demon',
        name: 'Speed Demon',
        nameBn: 'দ্রুততম',
        emoji: '⚡',
        category: TrustCategory.delivery,
        rarity: BadgeRarity.rare,
        description: 'Complete 50 deliveries on time',
        descriptionBn: '৫০টি ডেলিভারি সময়মতো সম্পন্ন করুন',
        xpReward: 500,
      ));
    }

    // Master Chef: 100+ orders with 4.5+ rating
    if (!earnedBadgeIds.contains('master_chef') &&
        score.totalTransactions >= 100 &&
        score.averageRating >= 4.5) {
      earnableBadges.add(const Badge(
        id: 'master_chef',
        name: 'Master Chef',
        nameBn: 'মাস্টার শেফ',
        emoji: '👨‍🍳',
        category: TrustCategory.cooking,
        rarity: BadgeRarity.epic,
        description: 'Maintain 4.5+ rating for 100 orders',
        descriptionBn: '১০০টি অর্ডারে ৪.৫+ রেটিং বজায় রাখুন',
        xpReward: 1000,
      ));
    }

    // Reliable Partner: 25+ orders
    if (!earnedBadgeIds.contains('reliable_partner') &&
        score.totalTransactions >= 25 &&
        score.categories[TrustCategory.reliability]! >= 4.0) {
      earnableBadges.add(const Badge(
        id: 'reliable_partner',
        name: 'Reliable Partner',
        nameBn: 'বিশ্বস্ত সঙ্গী',
        emoji: '🛡️',
        category: TrustCategory.reliability,
        rarity: BadgeRarity.uncommon,
        description: 'Complete 25 orders without complaints',
        descriptionBn: '২৫টি অর্ডার অভিযোগ ছাড়াই সম্পন্ন করুন',
        xpReward: 300,
      ));
    }

    // Payment Pro: Good payment history
    if (!earnedBadgeIds.contains('payment_pro') &&
        score.totalTransactions >= 10 &&
        score.categories[TrustCategory.payment]! >= 4.5) {
      earnableBadges.add(const Badge(
        id: 'payment_pro',
        name: 'Payment Pro',
        nameBn: 'পেমেন্ট প্রো',
        emoji: '💰',
        category: TrustCategory.payment,
        rarity: BadgeRarity.common,
        description: 'Make 10 on-time payments',
        descriptionBn: '১০টি সময়মতো পেমেন্ট করুন',
        xpReward: 150,
      ));
    }

    return earnableBadges;
  }

  /// Handle customer complaint
  static TrustScore handleComplaint({
    required TrustScore currentScore,
    required TrustCategory category,
    String? reason,
  }) {
    // Decrease category score significantly
    final updatedCategories = Map<TrustCategory, double>.from(currentScore.categories);
    updatedCategories[category] = _updateCategoryScore(
      currentScore: updatedCategories[category] ?? 3.0,
      wasPositive: false,
      weight: 0.3, // Larger penalty for complaints
    );

    // Also affect reliability
    updatedCategories[TrustCategory.reliability] = _updateCategoryScore(
      currentScore: updatedCategories[TrustCategory.reliability] ?? 3.0,
      wasPositive: false,
      weight: 0.2,
    );

    // Recalculate overall score
    final newOverall = TrustScore.calculateOverallScore(
      onTimeRate: currentScore.onTimeRate,
      averageRating: currentScore.averageRating,
      totalTransactions: currentScore.totalTransactions,
      badgeCount: currentScore.badges.length,
    );

    // Add complaint event
    final recentEvents = List<TrustEvent>.from(currentScore.recentEvents)
      ..add(TrustEvent.customerComplaint);
    if (recentEvents.length > 10) {
      recentEvents.removeRange(0, recentEvents.length - 10);
    }

    return currentScore.copyWith(
      overall: newOverall,
      categories: updatedCategories,
      lastUpdated: DateTime.now(),
      recentEvents: recentEvents,
    );
  }

  /// Check if user should receive warning notification
  static bool shouldSendWarning(TrustScore score) {
    return score.overall < 3.0;
  }

  /// Get improvement suggestions based on weak categories
  static List<String> getImprovementSuggestions(TrustScore score) {
    final suggestions = <String>[];

    if (score.categories[TrustCategory.delivery]! < 3.5) {
      suggestions.add('Focus on on-time deliveries to improve your delivery score');
      suggestions.add('দ্রুত ডেলিভারিতে মনোযোগ দিন');
    }

    if (score.categories[TrustCategory.cooking]! < 3.5) {
      suggestions.add('Maintain food quality and presentation');
      suggestions.add('খাবারের মান এবং উপস্থাপনা বজায় রাখুন');
    }

    if (score.categories[TrustCategory.payment]! < 3.5) {
      suggestions.add('Make payments on time to build trust');
      suggestions.add('বিশ্বাস তৈরি করতে সময়মতো পেমেন্ট করুন');
    }

    if (score.categories[TrustCategory.communication]! < 3.5) {
      suggestions.add('Respond quickly to messages and calls');
      suggestions.add('বার্তা এবং কলে দ্রুত সাড়া দিন');
    }

    if (score.categories[TrustCategory.reliability]! < 3.5) {
      suggestions.add('Be consistent and dependable in your service');
      suggestions.add('আপনার সেবায় সামঞ্জস্যপূর্ণ এবং নির্ভরযোগ্য হন');
    }

    if (suggestions.isEmpty) {
      suggestions.add('Keep up the great work!');
      suggestions.add('দুর্দান্ত কাজ চালিয়ে যান!');
    }

    return suggestions;
  }

  /// Simulate trust score update (for testing)
  @visibleForTesting
  static TrustScore simulatePositiveOrder(TrustScore score) {
    return updateTrustScoreOnOrderCompletion(
      currentScore: score,
      order: Order(
        id: 'test_order',
        items: [],
        subtotal: 100,
        deliveryFee: 20,
        tax: 5,
        total: 125,
        paymentMethod: null as dynamic,
        status: OrderStatus.delivered,
        createdAt: DateTime.now(),
        deliveryAddress: 'Test Address',
      ),
      wasOnTime: true,
      qualityRating: 4.8,
      wasPaymentOnTime: true,
    );
  }
}
