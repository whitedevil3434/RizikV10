import 'package:flutter/foundation.dart';

/// Rizik Vibes video model for TikTok-style shoppable content
@immutable
class VibeVideo {
  final String id;
  final String creatorId;
  final String creatorName;
  final String creatorAvatar;
  final double creatorTrustScore;
  final int creatorAuraLevel;
  
  // Video content
  final String videoUrl;
  final String thumbnailUrl;
  final String caption;
  final List<String> hashtags;
  final int durationSeconds;
  
  // Shoppable content
  final String? linkedFoodId;
  final String? linkedFoodName;
  final double? linkedFoodPrice;
  final String? linkedPartnerId;
  final String? linkedPartnerName;
  
  // Monetization
  final double viewEarningRate; // Taka per 1000 views (20-50)
  final double commissionRate; // Percentage per order (10-20%)
  final double totalViewEarnings;
  final double totalCommissionEarnings;
  
  // Engagement metrics
  final int viewCount;
  final int likeCount;
  final int shareCount;
  final int commentCount;
  final int orderCount; // Orders generated from this video
  
  // Trust & Gamification
  final bool isVerified;
  final bool isViral; // Crossed viral threshold
  final DateTime createdAt;
  final DateTime? viralAt; // When it went viral
  
  const VibeVideo({
    required this.id,
    required this.creatorId,
    required this.creatorName,
    required this.creatorAvatar,
    required this.creatorTrustScore,
    required this.creatorAuraLevel,
    required this.videoUrl,
    required this.thumbnailUrl,
    required this.caption,
    required this.hashtags,
    required this.durationSeconds,
    this.linkedFoodId,
    this.linkedFoodName,
    this.linkedFoodPrice,
    this.linkedPartnerId,
    this.linkedPartnerName,
    this.viewEarningRate = 35.0, // Default: 35 taka per 1000 views
    this.commissionRate = 15.0, // Default: 15% commission
    this.totalViewEarnings = 0.0,
    this.totalCommissionEarnings = 0.0,
    this.viewCount = 0,
    this.likeCount = 0,
    this.shareCount = 0,
    this.commentCount = 0,
    this.orderCount = 0,
    this.isVerified = false,
    this.isViral = false,
    required this.createdAt,
    this.viralAt,
  });

  /// Calculate current view earnings
  double get currentViewEarnings => (viewCount / 1000) * viewEarningRate;

  /// Calculate total earnings (views + commissions)
  double get totalEarnings => totalViewEarnings + totalCommissionEarnings;

  /// Check if video is shoppable
  bool get isShoppable => linkedFoodId != null;

  /// Calculate engagement rate
  double get engagementRate {
    if (viewCount == 0) return 0.0;
    final totalEngagements = likeCount + shareCount + commentCount + orderCount;
    return (totalEngagements / viewCount) * 100;
  }

  VibeVideo copyWith({
    String? id,
    String? creatorId,
    String? creatorName,
    String? creatorAvatar,
    double? creatorTrustScore,
    int? creatorAuraLevel,
    String? videoUrl,
    String? thumbnailUrl,
    String? caption,
    List<String>? hashtags,
    int? durationSeconds,
    String? linkedFoodId,
    String? linkedFoodName,
    double? linkedFoodPrice,
    String? linkedPartnerId,
    String? linkedPartnerName,
    double? viewEarningRate,
    double? commissionRate,
    double? totalViewEarnings,
    double? totalCommissionEarnings,
    int? viewCount,
    int? likeCount,
    int? shareCount,
    int? commentCount,
    int? orderCount,
    bool? isVerified,
    bool? isViral,
    DateTime? createdAt,
    DateTime? viralAt,
  }) {
    return VibeVideo(
      id: id ?? this.id,
      creatorId: creatorId ?? this.creatorId,
      creatorName: creatorName ?? this.creatorName,
      creatorAvatar: creatorAvatar ?? this.creatorAvatar,
      creatorTrustScore: creatorTrustScore ?? this.creatorTrustScore,
      creatorAuraLevel: creatorAuraLevel ?? this.creatorAuraLevel,
      videoUrl: videoUrl ?? this.videoUrl,
      thumbnailUrl: thumbnailUrl ?? this.thumbnailUrl,
      caption: caption ?? this.caption,
      hashtags: hashtags ?? this.hashtags,
      durationSeconds: durationSeconds ?? this.durationSeconds,
      linkedFoodId: linkedFoodId ?? this.linkedFoodId,
      linkedFoodName: linkedFoodName ?? this.linkedFoodName,
      linkedFoodPrice: linkedFoodPrice ?? this.linkedFoodPrice,
      linkedPartnerId: linkedPartnerId ?? this.linkedPartnerId,
      linkedPartnerName: linkedPartnerName ?? this.linkedPartnerName,
      viewEarningRate: viewEarningRate ?? this.viewEarningRate,
      commissionRate: commissionRate ?? this.commissionRate,
      totalViewEarnings: totalViewEarnings ?? this.totalViewEarnings,
      totalCommissionEarnings: totalCommissionEarnings ?? this.totalCommissionEarnings,
      viewCount: viewCount ?? this.viewCount,
      likeCount: likeCount ?? this.likeCount,
      shareCount: shareCount ?? this.shareCount,
      commentCount: commentCount ?? this.commentCount,
      orderCount: orderCount ?? this.orderCount,
      isVerified: isVerified ?? this.isVerified,
      isViral: isViral ?? this.isViral,
      createdAt: createdAt ?? this.createdAt,
      viralAt: viralAt ?? this.viralAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'creator_id': creatorId,
      'creator_name': creatorName,
      'creator_avatar': creatorAvatar,
      'creator_trust_score': creatorTrustScore,
      'creator_aura_level': creatorAuraLevel,
      'video_url': videoUrl,
      'thumbnail_url': thumbnailUrl,
      'caption': caption,
      'hashtags': hashtags,
      'duration_seconds': durationSeconds,
      'linked_food_id': linkedFoodId,
      'linked_food_name': linkedFoodName,
      'linked_food_price': linkedFoodPrice,
      'linked_partner_id': linkedPartnerId,
      'linked_partner_name': linkedPartnerName,
      'view_earning_rate': viewEarningRate,
      'commission_rate': commissionRate,
      'total_view_earnings': totalViewEarnings,
      'total_commission_earnings': totalCommissionEarnings,
      'view_count': viewCount,
      'like_count': likeCount,
      'share_count': shareCount,
      'comment_count': commentCount,
      'order_count': orderCount,
      'is_verified': isVerified,
      'is_viral': isViral,
      'created_at': createdAt.toIso8601String(),
      'viral_at': viralAt?.toIso8601String(),
    };
  }

  factory VibeVideo.fromJson(Map<String, dynamic> json) {
    return VibeVideo(
      id: json['id'] as String,
      creatorId: json['creator_id'] as String,
      creatorName: json['creator_name'] as String,
      creatorAvatar: json['creator_avatar'] as String,
      creatorTrustScore: (json['creator_trust_score'] as num).toDouble(),
      creatorAuraLevel: json['creator_aura_level'] as int,
      videoUrl: json['video_url'] as String,
      thumbnailUrl: json['thumbnail_url'] as String,
      caption: json['caption'] as String,
      hashtags: List<String>.from(json['hashtags'] as List),
      durationSeconds: json['duration_seconds'] as int,
      linkedFoodId: json['linked_food_id'] as String?,
      linkedFoodName: json['linked_food_name'] as String?,
      linkedFoodPrice: json['linked_food_price'] != null 
          ? (json['linked_food_price'] as num).toDouble() 
          : null,
      linkedPartnerId: json['linked_partner_id'] as String?,
      linkedPartnerName: json['linked_partner_name'] as String?,
      viewEarningRate: (json['view_earning_rate'] as num).toDouble(),
      commissionRate: (json['commission_rate'] as num).toDouble(),
      totalViewEarnings: (json['total_view_earnings'] as num).toDouble(),
      totalCommissionEarnings: (json['total_commission_earnings'] as num).toDouble(),
      viewCount: json['view_count'] as int,
      likeCount: json['like_count'] as int,
      shareCount: json['share_count'] as int,
      commentCount: json['comment_count'] as int,
      orderCount: json['order_count'] as int,
      isVerified: json['is_verified'] as bool,
      isViral: json['is_viral'] as bool,
      createdAt: DateTime.parse(json['created_at'] as String),
      viralAt: json['viral_at'] != null 
          ? DateTime.parse(json['viral_at'] as String) 
          : null,
    );
  }
}
