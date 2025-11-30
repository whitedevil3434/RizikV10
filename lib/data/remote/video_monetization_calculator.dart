import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/vibe_video.dart';

/// Calculator for Rizik Vibes video monetization
/// Handles view earnings and commission earnings for creators
class VideoMonetizationCalculator {
  // Earning rates (configurable)
  static const double minViewEarningRate = 20.0; // Taka per 1000 views
  static const double maxViewEarningRate = 50.0; // Taka per 1000 views
  static const double defaultViewEarningRate = 35.0;

  static const double minCommissionRate = 10.0; // Percentage
  static const double maxCommissionRate = 20.0; // Percentage
  static const double defaultCommissionRate = 15.0;

  // Viral thresholds
  static const int viralViewThreshold = 10000;
  static const int superViralViewThreshold = 100000;

  // Trust Score bonuses
  static const Map<double, double> trustScoreBonuses = {
    5.0: 1.5, // 50% bonus for perfect trust score
    4.5: 1.3, // 30% bonus
    4.0: 1.2, // 20% bonus
    3.5: 1.1, // 10% bonus
    3.0: 1.0, // No bonus
  };

  /// Calculate view earnings for a video
  /// Formula: (views / 1000) * viewEarningRate * trustScoreMultiplier
  double calculateViewEarnings({
    required int viewCount,
    double? viewEarningRate,
    double? creatorTrustScore,
    bool isViral = false,
  }) {
    if (viewCount <= 0) return 0.0;

    final rate = viewEarningRate ?? defaultViewEarningRate;
    final baseEarnings = (viewCount / 1000.0) * rate;

    // Apply Trust Score multiplier
    double trustMultiplier = 1.0;
    if (creatorTrustScore != null) {
      trustMultiplier = _getTrustScoreMultiplier(creatorTrustScore);
    }

    // Apply viral bonus
    double viralMultiplier = 1.0;
    if (isViral) {
      if (viewCount >= superViralViewThreshold) {
        viralMultiplier = 1.5; // 50% bonus for super viral
      } else if (viewCount >= viralViewThreshold) {
        viralMultiplier = 1.2; // 20% bonus for viral
      }
    }

    final totalEarnings = baseEarnings * trustMultiplier * viralMultiplier;

    debugPrint('💰 View Earnings: $viewCount views × ৳$rate/1k × ${trustMultiplier}x trust × ${viralMultiplier}x viral = ৳${totalEarnings.toStringAsFixed(2)}');

    return totalEarnings;
  }

  /// Calculate commission earnings from orders
  /// Formula: orderValue * (commissionRate / 100) * trustScoreMultiplier
  double calculateCommissionEarnings({
    required double orderValue,
    double? commissionRate,
    double? creatorTrustScore,
  }) {
    if (orderValue <= 0) return 0.0;

    final rate = commissionRate ?? defaultCommissionRate;
    final baseCommission = orderValue * (rate / 100.0);

    // Apply Trust Score multiplier
    double trustMultiplier = 1.0;
    if (creatorTrustScore != null) {
      trustMultiplier = _getTrustScoreMultiplier(creatorTrustScore);
    }

    final totalCommission = baseCommission * trustMultiplier;

    debugPrint('💰 Commission: ৳$orderValue × ${rate}% × ${trustMultiplier}x trust = ৳${totalCommission.toStringAsFixed(2)}');

    return totalCommission;
  }

  /// Calculate total earnings for a video
  MonetizationBreakdown calculateTotalEarnings({
    required VibeVideo video,
    List<double>? orderValues,
  }) {
    // Calculate view earnings
    final viewEarnings = calculateViewEarnings(
      viewCount: video.viewCount,
      viewEarningRate: video.viewEarningRate,
      creatorTrustScore: video.creatorTrustScore,
      isViral: video.isViral,
    );

    // Calculate commission earnings from all orders
    double commissionEarnings = 0.0;
    if (orderValues != null && orderValues.isNotEmpty) {
      for (final orderValue in orderValues) {
        commissionEarnings += calculateCommissionEarnings(
          orderValue: orderValue,
          commissionRate: video.commissionRate,
          creatorTrustScore: video.creatorTrustScore,
        );
      }
    }

    final totalEarnings = viewEarnings + commissionEarnings;

    return MonetizationBreakdown(
      viewEarnings: viewEarnings,
      commissionEarnings: commissionEarnings,
      totalEarnings: totalEarnings,
      viewCount: video.viewCount,
      orderCount: orderValues?.length ?? 0,
      trustScoreMultiplier: _getTrustScoreMultiplier(video.creatorTrustScore),
      isViral: video.isViral,
    );
  }

  /// Calculate projected earnings based on current performance
  ProjectedEarnings calculateProjectedEarnings({
    required VibeVideo video,
    required int projectedViews,
    required int projectedOrders,
    required double averageOrderValue,
  }) {
    // Project view earnings
    final projectedViewEarnings = calculateViewEarnings(
      viewCount: projectedViews,
      viewEarningRate: video.viewEarningRate,
      creatorTrustScore: video.creatorTrustScore,
      isViral: projectedViews >= viralViewThreshold,
    );

    // Project commission earnings
    double projectedCommissionEarnings = 0.0;
    for (int i = 0; i < projectedOrders; i++) {
      projectedCommissionEarnings += calculateCommissionEarnings(
        orderValue: averageOrderValue,
        commissionRate: video.commissionRate,
        creatorTrustScore: video.creatorTrustScore,
      );
    }

    final projectedTotal = projectedViewEarnings + projectedCommissionEarnings;

    return ProjectedEarnings(
      projectedViewEarnings: projectedViewEarnings,
      projectedCommissionEarnings: projectedCommissionEarnings,
      projectedTotalEarnings: projectedTotal,
      projectedViews: projectedViews,
      projectedOrders: projectedOrders,
      averageOrderValue: averageOrderValue,
    );
  }

  /// Process payout for creator
  PayoutResult payoutCreator({
    required String creatorId,
    required double amount,
    required String videoId,
    String? paymentMethod,
  }) {
    if (amount <= 0) {
      return PayoutResult(
        success: false,
        message: 'Invalid payout amount',
        amount: 0.0,
      );
    }

    // TODO: Integrate with actual payment gateway
    // For now, simulate successful payout

    debugPrint('💸 Payout: ৳${amount.toStringAsFixed(2)} to creator $creatorId for video $videoId');

    return PayoutResult(
      success: true,
      message: 'Payout processed successfully',
      amount: amount,
      creatorId: creatorId,
      videoId: videoId,
      paymentMethod: paymentMethod ?? 'bKash',
      processedAt: DateTime.now(),
    );
  }

  /// Get Trust Score multiplier for earnings
  double _getTrustScoreMultiplier(double trustScore) {
    // Find the appropriate multiplier based on trust score
    for (final entry in trustScoreBonuses.entries) {
      if (trustScore >= entry.key) {
        return entry.value;
      }
    }
    return 1.0; // Default multiplier for low trust scores
  }

  /// Calculate optimal commission rate based on creator performance
  double calculateOptimalCommissionRate({
    required double creatorTrustScore,
    required int totalOrders,
    required double conversionRate,
  }) {
    double rate = defaultCommissionRate;

    // Bonus for high trust score
    if (creatorTrustScore >= 4.5) {
      rate += 3.0; // +3% for excellent trust
    } else if (creatorTrustScore >= 4.0) {
      rate += 2.0; // +2% for good trust
    } else if (creatorTrustScore >= 3.5) {
      rate += 1.0; // +1% for decent trust
    }

    // Bonus for high conversion rate
    if (conversionRate >= 0.10) {
      rate += 2.0; // +2% for 10%+ conversion
    } else if (conversionRate >= 0.05) {
      rate += 1.0; // +1% for 5%+ conversion
    }

    // Bonus for volume
    if (totalOrders >= 100) {
      rate += 2.0; // +2% for 100+ orders
    } else if (totalOrders >= 50) {
      rate += 1.0; // +1% for 50+ orders
    }

    // Cap at maximum rate
    return rate.clamp(minCommissionRate, maxCommissionRate);
  }

  /// Calculate view earning rate based on creator performance
  double calculateOptimalViewEarningRate({
    required double creatorTrustScore,
    required int creatorAuraLevel,
    required bool isVerified,
  }) {
    double rate = defaultViewEarningRate;

    // Bonus for trust score
    if (creatorTrustScore >= 4.5) {
      rate += 10.0; // +10 taka for excellent trust
    } else if (creatorTrustScore >= 4.0) {
      rate += 7.0; // +7 taka for good trust
    } else if (creatorTrustScore >= 3.5) {
      rate += 5.0; // +5 taka for decent trust
    }

    // Bonus for Aura level
    rate += creatorAuraLevel * 2.0; // +2 taka per Aura level

    // Bonus for verification
    if (isVerified) {
      rate += 5.0; // +5 taka for verified creators
    }

    // Cap at maximum rate
    return rate.clamp(minViewEarningRate, maxViewEarningRate);
  }
}

/// Breakdown of monetization earnings
class MonetizationBreakdown {
  final double viewEarnings;
  final double commissionEarnings;
  final double totalEarnings;
  final int viewCount;
  final int orderCount;
  final double trustScoreMultiplier;
  final bool isViral;

  const MonetizationBreakdown({
    required this.viewEarnings,
    required this.commissionEarnings,
    required this.totalEarnings,
    required this.viewCount,
    required this.orderCount,
    required this.trustScoreMultiplier,
    required this.isViral,
  });

  Map<String, dynamic> toJson() {
    return {
      'view_earnings': viewEarnings,
      'commission_earnings': commissionEarnings,
      'total_earnings': totalEarnings,
      'view_count': viewCount,
      'order_count': orderCount,
      'trust_score_multiplier': trustScoreMultiplier,
      'is_viral': isViral,
    };
  }
}

/// Projected earnings calculation
class ProjectedEarnings {
  final double projectedViewEarnings;
  final double projectedCommissionEarnings;
  final double projectedTotalEarnings;
  final int projectedViews;
  final int projectedOrders;
  final double averageOrderValue;

  const ProjectedEarnings({
    required this.projectedViewEarnings,
    required this.projectedCommissionEarnings,
    required this.projectedTotalEarnings,
    required this.projectedViews,
    required this.projectedOrders,
    required this.averageOrderValue,
  });

  Map<String, dynamic> toJson() {
    return {
      'projected_view_earnings': projectedViewEarnings,
      'projected_commission_earnings': projectedCommissionEarnings,
      'projected_total_earnings': projectedTotalEarnings,
      'projected_views': projectedViews,
      'projected_orders': projectedOrders,
      'average_order_value': averageOrderValue,
    };
  }
}

/// Payout result
class PayoutResult {
  final bool success;
  final String message;
  final double amount;
  final String? creatorId;
  final String? videoId;
  final String? paymentMethod;
  final DateTime? processedAt;

  const PayoutResult({
    required this.success,
    required this.message,
    required this.amount,
    this.creatorId,
    this.videoId,
    this.paymentMethod,
    this.processedAt,
  });

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'message': message,
      'amount': amount,
      'creator_id': creatorId,
      'video_id': videoId,
      'payment_method': paymentMethod,
      'processed_at': processedAt?.toIso8601String(),
    };
  }
}
