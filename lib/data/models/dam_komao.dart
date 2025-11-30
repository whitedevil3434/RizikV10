import 'package:flutter/foundation.dart';

/// Dam Komao (Bargaining) request status
enum DamKomaoStatus {
  active,
  expired,
  accepted,
  cancelled,
}

/// Dam Komao haggling request
@immutable
class DamKomaoRequest {
  final String id;
  final String consumerId;
  final String consumerName;
  final double consumerTrustScore;
  
  // Request details
  final String itemName;
  final String? itemDescription;
  final String? itemImage;
  final String category;
  final int quantity;
  
  // Pricing
  final double originalPrice;
  final double targetPrice;
  final double? maxPrice; // Maximum consumer is willing to pay
  
  // Location
  final double? latitude;
  final double? longitude;
  final String? deliveryAddress;
  final double radiusKm; // Search radius for partners
  
  // Timing
  final DateTime createdAt;
  final DateTime expiryTime;
  final int expiryMinutes; // Duration in minutes
  
  // Status
  final DamKomaoStatus status;
  final List<DamKomaoBid> bids;
  final String? acceptedBidId;
  final String? acceptedPartnerId;
  
  // Gamification
  final int xpReward; // XP for both parties on successful haggle
  
  const DamKomaoRequest({
    required this.id,
    required this.consumerId,
    required this.consumerName,
    required this.consumerTrustScore,
    required this.itemName,
    this.itemDescription,
    this.itemImage,
    required this.category,
    required this.quantity,
    required this.originalPrice,
    required this.targetPrice,
    this.maxPrice,
    this.latitude,
    this.longitude,
    this.deliveryAddress,
    this.radiusKm = 2.0, // Default 2km radius
    required this.createdAt,
    required this.expiryTime,
    required this.expiryMinutes,
    this.status = DamKomaoStatus.active,
    this.bids = const [],
    this.acceptedBidId,
    this.acceptedPartnerId,
    this.xpReward = 50,
  });

  /// Check if request is expired
  bool get isExpired => DateTime.now().isAfter(expiryTime) || status == DamKomaoStatus.expired;

  /// Check if request is active
  bool get isActive => status == DamKomaoStatus.active && !isExpired;

  /// Get time remaining
  Duration get timeRemaining => expiryTime.difference(DateTime.now());

  /// Get lowest bid
  DamKomaoBid? get lowestBid {
    if (bids.isEmpty) return null;
    return bids.reduce((a, b) => a.bidAmount < b.bidAmount ? a : b);
  }

  /// Get bid count
  int get bidCount => bids.length;

  /// Calculate potential savings
  double get potentialSavings {
    final lowest = lowestBid;
    if (lowest == null) return 0.0;
    return originalPrice - lowest.bidAmount;
  }

  /// Calculate savings percentage
  double get savingsPercentage {
    final lowest = lowestBid;
    if (lowest == null || originalPrice == 0) return 0.0;
    return ((originalPrice - lowest.bidAmount) / originalPrice) * 100;
  }

  DamKomaoRequest copyWith({
    String? id,
    String? consumerId,
    String? consumerName,
    double? consumerTrustScore,
    String? itemName,
    String? itemDescription,
    String? itemImage,
    String? category,
    int? quantity,
    double? originalPrice,
    double? targetPrice,
    double? maxPrice,
    double? latitude,
    double? longitude,
    String? deliveryAddress,
    double? radiusKm,
    DateTime? createdAt,
    DateTime? expiryTime,
    int? expiryMinutes,
    DamKomaoStatus? status,
    List<DamKomaoBid>? bids,
    String? acceptedBidId,
    String? acceptedPartnerId,
    int? xpReward,
  }) {
    return DamKomaoRequest(
      id: id ?? this.id,
      consumerId: consumerId ?? this.consumerId,
      consumerName: consumerName ?? this.consumerName,
      consumerTrustScore: consumerTrustScore ?? this.consumerTrustScore,
      itemName: itemName ?? this.itemName,
      itemDescription: itemDescription ?? this.itemDescription,
      itemImage: itemImage ?? this.itemImage,
      category: category ?? this.category,
      quantity: quantity ?? this.quantity,
      originalPrice: originalPrice ?? this.originalPrice,
      targetPrice: targetPrice ?? this.targetPrice,
      maxPrice: maxPrice ?? this.maxPrice,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      radiusKm: radiusKm ?? this.radiusKm,
      createdAt: createdAt ?? this.createdAt,
      expiryTime: expiryTime ?? this.expiryTime,
      expiryMinutes: expiryMinutes ?? this.expiryMinutes,
      status: status ?? this.status,
      bids: bids ?? this.bids,
      acceptedBidId: acceptedBidId ?? this.acceptedBidId,
      acceptedPartnerId: acceptedPartnerId ?? this.acceptedPartnerId,
      xpReward: xpReward ?? this.xpReward,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'consumer_id': consumerId,
      'consumer_name': consumerName,
      'consumer_trust_score': consumerTrustScore,
      'item_name': itemName,
      'item_description': itemDescription,
      'item_image': itemImage,
      'category': category,
      'quantity': quantity,
      'original_price': originalPrice,
      'target_price': targetPrice,
      'max_price': maxPrice,
      'latitude': latitude,
      'longitude': longitude,
      'delivery_address': deliveryAddress,
      'radius_km': radiusKm,
      'created_at': createdAt.toIso8601String(),
      'expiry_time': expiryTime.toIso8601String(),
      'expiry_minutes': expiryMinutes,
      'status': status.name,
      'bids': bids.map((b) => b.toJson()).toList(),
      'accepted_bid_id': acceptedBidId,
      'accepted_partner_id': acceptedPartnerId,
      'xp_reward': xpReward,
    };
  }

  factory DamKomaoRequest.fromJson(Map<String, dynamic> json) {
    return DamKomaoRequest(
      id: json['id'] as String,
      consumerId: json['consumer_id'] as String,
      consumerName: json['consumer_name'] as String,
      consumerTrustScore: (json['consumer_trust_score'] as num).toDouble(),
      itemName: json['item_name'] as String,
      itemDescription: json['item_description'] as String?,
      itemImage: json['item_image'] as String?,
      category: json['category'] as String,
      quantity: json['quantity'] as int,
      originalPrice: (json['original_price'] as num).toDouble(),
      targetPrice: (json['target_price'] as num).toDouble(),
      maxPrice: json['max_price'] != null ? (json['max_price'] as num).toDouble() : null,
      latitude: json['latitude'] as double?,
      longitude: json['longitude'] as double?,
      deliveryAddress: json['delivery_address'] as String?,
      radiusKm: (json['radius_km'] as num?)?.toDouble() ?? 2.0,
      createdAt: DateTime.parse(json['created_at'] as String),
      expiryTime: DateTime.parse(json['expiry_time'] as String),
      expiryMinutes: json['expiry_minutes'] as int,
      status: DamKomaoStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => DamKomaoStatus.active,
      ),
      bids: (json['bids'] as List?)
          ?.map((b) => DamKomaoBid.fromJson(b as Map<String, dynamic>))
          .toList() ?? [],
      acceptedBidId: json['accepted_bid_id'] as String?,
      acceptedPartnerId: json['accepted_partner_id'] as String?,
      xpReward: json['xp_reward'] as int? ?? 50,
    );
  }
}

/// Partner bid on a Dam Komao request
@immutable
class DamKomaoBid {
  final String id;
  final String requestId;
  final String partnerId;
  final String partnerName;
  final String partnerAvatar;
  final double partnerTrustScore;
  final int partnerAuraLevel;
  
  // Bid details
  final double bidAmount;
  final String? message;
  final int preparationTimeMinutes;
  final DateTime timestamp;
  
  // Status
  final bool isAccepted;
  final bool isRejected;
  
  const DamKomaoBid({
    required this.id,
    required this.requestId,
    required this.partnerId,
    required this.partnerName,
    required this.partnerAvatar,
    required this.partnerTrustScore,
    required this.partnerAuraLevel,
    required this.bidAmount,
    this.message,
    required this.preparationTimeMinutes,
    required this.timestamp,
    this.isAccepted = false,
    this.isRejected = false,
  });

  DamKomaoBid copyWith({
    String? id,
    String? requestId,
    String? partnerId,
    String? partnerName,
    String? partnerAvatar,
    double? partnerTrustScore,
    int? partnerAuraLevel,
    double? bidAmount,
    String? message,
    int? preparationTimeMinutes,
    DateTime? timestamp,
    bool? isAccepted,
    bool? isRejected,
  }) {
    return DamKomaoBid(
      id: id ?? this.id,
      requestId: requestId ?? this.requestId,
      partnerId: partnerId ?? this.partnerId,
      partnerName: partnerName ?? this.partnerName,
      partnerAvatar: partnerAvatar ?? this.partnerAvatar,
      partnerTrustScore: partnerTrustScore ?? this.partnerTrustScore,
      partnerAuraLevel: partnerAuraLevel ?? this.partnerAuraLevel,
      bidAmount: bidAmount ?? this.bidAmount,
      message: message ?? this.message,
      preparationTimeMinutes: preparationTimeMinutes ?? this.preparationTimeMinutes,
      timestamp: timestamp ?? this.timestamp,
      isAccepted: isAccepted ?? this.isAccepted,
      isRejected: isRejected ?? this.isRejected,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'request_id': requestId,
      'partner_id': partnerId,
      'partner_name': partnerName,
      'partner_avatar': partnerAvatar,
      'partner_trust_score': partnerTrustScore,
      'partner_aura_level': partnerAuraLevel,
      'bid_amount': bidAmount,
      'message': message,
      'preparation_time_minutes': preparationTimeMinutes,
      'timestamp': timestamp.toIso8601String(),
      'is_accepted': isAccepted,
      'is_rejected': isRejected,
    };
  }

  factory DamKomaoBid.fromJson(Map<String, dynamic> json) {
    return DamKomaoBid(
      id: json['id'] as String,
      requestId: json['request_id'] as String,
      partnerId: json['partner_id'] as String,
      partnerName: json['partner_name'] as String,
      partnerAvatar: json['partner_avatar'] as String,
      partnerTrustScore: (json['partner_trust_score'] as num).toDouble(),
      partnerAuraLevel: json['partner_aura_level'] as int,
      bidAmount: (json['bid_amount'] as num).toDouble(),
      message: json['message'] as String?,
      preparationTimeMinutes: json['preparation_time_minutes'] as int,
      timestamp: DateTime.parse(json['timestamp'] as String),
      isAccepted: json['is_accepted'] as bool? ?? false,
      isRejected: json['is_rejected'] as bool? ?? false,
    );
  }
}
