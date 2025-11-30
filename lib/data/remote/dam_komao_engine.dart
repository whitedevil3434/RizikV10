import 'dart:async';
import 'package:flutter/foundation.dart';

/// Dam Komao (Bargaining) Engine for price negotiation
/// Allows consumers to request lower prices and partners to bid competitively
class DamKomaoEngine {
  final Map<String, DamKomaoRequest> _activeRequests = {};
  final Map<String, List<PartnerBid>> _requestBids = {};
  final List<Timer> _expiryTimers = [];

  // Configuration
  static const Duration defaultExpiryDuration = Duration(hours: 2);
  static const int maxNearbyPartners = 10;
  static const double maxDiscountPercentage = 50.0; // Max 50% off
  static const double minBidDifferencePercentage = 5.0; // Min 5% difference

  /// Initiate a haggling request
  DamKomaoRequest initiateHaggle({
    required String consumerId,
    required String consumerName,
    required String itemId,
    required String itemName,
    required double originalPrice,
    required double targetPrice,
    required String? itemImage,
    required int quantity,
    String? specialInstructions,
    Duration? expiryDuration,
  }) {
    // Validate target price
    if (!_validateTargetPrice(originalPrice, targetPrice)) {
      throw ArgumentError(
        'Invalid target price. Must be between ${originalPrice * 0.5} and ${originalPrice * 0.95}',
      );
    }

    final request = DamKomaoRequest(
      id: _generateRequestId(),
      consumerId: consumerId,
      consumerName: consumerName,
      itemId: itemId,
      itemName: itemName,
      originalPrice: originalPrice,
      targetPrice: targetPrice,
      itemImage: itemImage,
      quantity: quantity,
      specialInstructions: specialInstructions,
      createdAt: DateTime.now(),
      expiresAt: DateTime.now().add(expiryDuration ?? defaultExpiryDuration),
      status: DamKomaoStatus.active,
    );

    // Store request
    _activeRequests[request.id] = request;
    _requestBids[request.id] = [];

    // Set up expiry timer
    _setupExpiryTimer(request);

    debugPrint('🤝 Dam Komao initiated: ${request.itemName} - ৳${request.originalPrice} → ৳${request.targetPrice}');

    return request;
  }

  /// Validate target price is reasonable
  bool _validateTargetPrice(double originalPrice, double targetPrice) {
    if (targetPrice >= originalPrice) return false;
    if (targetPrice <= 0) return false;

    final discountPercentage = ((originalPrice - targetPrice) / originalPrice) * 100;
    if (discountPercentage > maxDiscountPercentage) return false;

    // Must be at least 5% discount to be worth haggling
    if (discountPercentage < 5.0) return false;

    return true;
  }

  /// Notify nearby partners about haggling request
  Future<List<String>> notifyNearbyPartners({
    required DamKomaoRequest request,
    required double consumerLat,
    required double consumerLon,
    required double radiusKm,
  }) async {
    // TODO: In production, query database for partners
    // For now, simulate notification
    
    debugPrint('📢 Notifying partners within ${radiusKm}km about ${request.itemName}');
    debugPrint('   Original: ৳${request.originalPrice}, Target: ৳${request.targetPrice}');

    // Simulate finding nearby partners
    final notifiedPartners = <String>[];
    
    // In production:
    // 1. Query partners within radius
    // 2. Filter by those who offer the item
    // 3. Send push notifications
    // 4. Include request details and expiry time
    
    return notifiedPartners;
  }

  /// Submit a partner bid
  PartnerBid submitPartnerBid({
    required String requestId,
    required String partnerId,
    required String partnerName,
    required double bidPrice,
    required double partnerTrustScore,
    required double partnerRating,
    String? partnerAvatar,
    String? message,
    Duration? preparationTime,
  }) {
    final request = _activeRequests[requestId];
    if (request == null) {
      throw ArgumentError('Request not found: $requestId');
    }

    if (request.status != DamKomaoStatus.active) {
      throw StateError('Request is not active: ${request.status}');
    }

    if (request.isExpired) {
      throw StateError('Request has expired');
    }

    // Validate bid price
    if (!_validateBidPrice(request, bidPrice)) {
      throw ArgumentError(
        'Invalid bid price. Must be less than ৳${request.originalPrice} and competitive',
      );
    }

    final bid = PartnerBid(
      id: _generateBidId(),
      requestId: requestId,
      partnerId: partnerId,
      partnerName: partnerName,
      bidPrice: bidPrice,
      partnerTrustScore: partnerTrustScore,
      partnerRating: partnerRating,
      partnerAvatar: partnerAvatar,
      message: message,
      preparationTime: preparationTime,
      createdAt: DateTime.now(),
      status: BidStatus.pending,
    );

    // Add bid to request
    _requestBids[requestId]!.add(bid);

    // Sort bids by price (lowest first)
    _requestBids[requestId]!.sort((a, b) => a.bidPrice.compareTo(b.bidPrice));

    debugPrint('💰 Bid submitted: ${bid.partnerName} - ৳${bid.bidPrice} for ${request.itemName}');

    // TODO: Notify consumer of new bid

    return bid;
  }

  /// Validate bid price
  bool _validateBidPrice(DamKomaoRequest request, double bidPrice) {
    // Must be less than original price
    if (bidPrice >= request.originalPrice) return false;

    // Must be positive
    if (bidPrice <= 0) return false;

    // Check if bid is competitive with existing bids
    final existingBids = _requestBids[request.id] ?? [];
    if (existingBids.isNotEmpty) {
      final lowestBid = existingBids.first.bidPrice;
      final difference = ((lowestBid - bidPrice) / lowestBid) * 100;
      
      // New bid should be at least 5% lower than current lowest
      if (difference < minBidDifferencePercentage && bidPrice >= lowestBid) {
        return false;
      }
    }

    return true;
  }

  /// Get all bids for a request, ranked by price
  List<PartnerBid> getBidsForRequest(String requestId) {
    return _requestBids[requestId] ?? [];
  }

  /// Get ranked bids with additional scoring
  List<RankedBid> getRankedBids(String requestId) {
    final bids = getBidsForRequest(requestId);
    final request = _activeRequests[requestId];
    
    if (request == null) return [];

    return bids.map((bid) {
      final score = _calculateBidScore(bid, request);
      return RankedBid(bid: bid, score: score);
    }).toList()
      ..sort((a, b) => b.score.compareTo(a.score)); // Highest score first
  }

  /// Calculate bid score (considers price, trust, and rating)
  double _calculateBidScore(PartnerBid bid, DamKomaoRequest request) {
    double score = 0.0;

    // Price score (50% weight) - lower price = higher score
    final priceDiscount = ((request.originalPrice - bid.bidPrice) / request.originalPrice);
    final priceScore = priceDiscount * 50.0;
    score += priceScore;

    // Trust score (30% weight)
    final trustScore = (bid.partnerTrustScore / 5.0) * 30.0;
    score += trustScore;

    // Rating score (20% weight)
    final ratingScore = (bid.partnerRating / 5.0) * 20.0;
    score += ratingScore;

    return score;
  }

  /// Accept a bid and create order
  Future<DamKomaoOrder> acceptBid({
    required String requestId,
    required String bidId,
    required Function(String partnerId) onNotifyWinner,
    required Function(List<String> partnerIds) onNotifyLosers,
  }) async {
    final request = _activeRequests[requestId];
    if (request == null) {
      throw ArgumentError('Request not found: $requestId');
    }

    final bids = _requestBids[requestId] ?? [];
    final winningBid = bids.firstWhere(
      (bid) => bid.id == bidId,
      orElse: () => throw ArgumentError('Bid not found: $bidId'),
    );

    if (winningBid.status != BidStatus.pending) {
      throw StateError('Bid is not pending: ${winningBid.status}');
    }

    // Update bid status
    winningBid.status = BidStatus.accepted;

    // Update request status
    request.status = DamKomaoStatus.completed;
    request.acceptedBidId = bidId;

    // Create order
    final order = DamKomaoOrder(
      id: _generateOrderId(),
      requestId: requestId,
      bidId: bidId,
      consumerId: request.consumerId,
      partnerId: winningBid.partnerId,
      itemId: request.itemId,
      itemName: request.itemName,
      quantity: request.quantity,
      originalPrice: request.originalPrice,
      finalPrice: winningBid.bidPrice,
      savingsAmount: request.originalPrice - winningBid.bidPrice,
      savingsPercentage: ((request.originalPrice - winningBid.bidPrice) / request.originalPrice) * 100,
      specialInstructions: request.specialInstructions,
      createdAt: DateTime.now(),
      status: OrderStatus.pending,
    );

    // Notify winner
    await onNotifyWinner(winningBid.partnerId);

    // Notify losers
    final loserIds = bids
        .where((bid) => bid.id != bidId && bid.status == BidStatus.pending)
        .map((bid) => bid.partnerId)
        .toList();
    
    if (loserIds.isNotEmpty) {
      await onNotifyLosers(loserIds);
    }

    // Update losing bids
    for (final bid in bids) {
      if (bid.id != bidId && bid.status == BidStatus.pending) {
        bid.status = BidStatus.rejected;
      }
    }

    debugPrint('✅ Bid accepted: ${winningBid.partnerName} - ৳${winningBid.bidPrice}');
    debugPrint('   Savings: ৳${order.savingsAmount} (${order.savingsPercentage.toStringAsFixed(1)}%)');

    // TODO: Award XP to both parties

    return order;
  }

  /// Handle request expiry
  void _setupExpiryTimer(DamKomaoRequest request) {
    final duration = request.expiresAt.difference(DateTime.now());
    
    final timer = Timer(duration, () {
      _handleRequestExpiry(request.id);
    });

    _expiryTimers.add(timer);
  }

  /// Handle expired request
  void _handleRequestExpiry(String requestId) {
    final request = _activeRequests[requestId];
    if (request == null) return;

    if (request.status == DamKomaoStatus.active) {
      request.status = DamKomaoStatus.expired;
      
      // Update all pending bids to expired
      final bids = _requestBids[requestId] ?? [];
      for (final bid in bids) {
        if (bid.status == BidStatus.pending) {
          bid.status = BidStatus.expired;
        }
      }

      debugPrint('⏰ Request expired: ${request.itemName}');
      
      // TODO: Notify consumer and partners
    }
  }

  /// Get active request by ID
  DamKomaoRequest? getRequest(String requestId) {
    return _activeRequests[requestId];
  }

  /// Get all active requests for a consumer
  List<DamKomaoRequest> getConsumerRequests(String consumerId) {
    return _activeRequests.values
        .where((request) => request.consumerId == consumerId)
        .toList();
  }

  /// Get all active requests for a partner (within their area)
  List<DamKomaoRequest> getPartnerRequests({
    required String partnerId,
    required double partnerLat,
    required double partnerLon,
    required double radiusKm,
  }) {
    // TODO: Filter by location
    return _activeRequests.values
        .where((request) => request.status == DamKomaoStatus.active)
        .toList();
  }

  /// Cancel a request
  void cancelRequest(String requestId) {
    final request = _activeRequests[requestId];
    if (request == null) return;

    request.status = DamKomaoStatus.cancelled;

    // Update all pending bids
    final bids = _requestBids[requestId] ?? [];
    for (final bid in bids) {
      if (bid.status == BidStatus.pending) {
        bid.status = BidStatus.cancelled;
      }
    }

    debugPrint('❌ Request cancelled: ${request.itemName}');
  }

  /// Generate unique request ID
  String _generateRequestId() {
    return 'DK_${DateTime.now().millisecondsSinceEpoch}';
  }

  /// Generate unique bid ID
  String _generateBidId() {
    return 'BID_${DateTime.now().millisecondsSinceEpoch}';
  }

  /// Generate unique order ID
  String _generateOrderId() {
    return 'DKO_${DateTime.now().millisecondsSinceEpoch}';
  }

  /// Cleanup
  void dispose() {
    for (final timer in _expiryTimers) {
      timer.cancel();
    }
    _expiryTimers.clear();
    _activeRequests.clear();
    _requestBids.clear();
  }
}

/// Dam Komao haggling request
class DamKomaoRequest {
  final String id;
  final String consumerId;
  final String consumerName;
  final String itemId;
  final String itemName;
  final double originalPrice;
  final double targetPrice;
  final String? itemImage;
  final int quantity;
  final String? specialInstructions;
  final DateTime createdAt;
  final DateTime expiresAt;
  DamKomaoStatus status;
  String? acceptedBidId;

  DamKomaoRequest({
    required this.id,
    required this.consumerId,
    required this.consumerName,
    required this.itemId,
    required this.itemName,
    required this.originalPrice,
    required this.targetPrice,
    this.itemImage,
    required this.quantity,
    this.specialInstructions,
    required this.createdAt,
    required this.expiresAt,
    required this.status,
    this.acceptedBidId,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  
  Duration get timeRemaining {
    if (isExpired) return Duration.zero;
    return expiresAt.difference(DateTime.now());
  }

  double get discountPercentage => ((originalPrice - targetPrice) / originalPrice) * 100;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'consumer_id': consumerId,
      'consumer_name': consumerName,
      'item_id': itemId,
      'item_name': itemName,
      'original_price': originalPrice,
      'target_price': targetPrice,
      'item_image': itemImage,
      'quantity': quantity,
      'special_instructions': specialInstructions,
      'created_at': createdAt.toIso8601String(),
      'expires_at': expiresAt.toIso8601String(),
      'status': status.key,
      'accepted_bid_id': acceptedBidId,
    };
  }
}

/// Partner bid on a Dam Komao request
class PartnerBid {
  final String id;
  final String requestId;
  final String partnerId;
  final String partnerName;
  final double bidPrice;
  final double partnerTrustScore;
  final double partnerRating;
  final String? partnerAvatar;
  final String? message;
  final Duration? preparationTime;
  final DateTime createdAt;
  BidStatus status;

  PartnerBid({
    required this.id,
    required this.requestId,
    required this.partnerId,
    required this.partnerName,
    required this.bidPrice,
    required this.partnerTrustScore,
    required this.partnerRating,
    this.partnerAvatar,
    this.message,
    this.preparationTime,
    required this.createdAt,
    required this.status,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'request_id': requestId,
      'partner_id': partnerId,
      'partner_name': partnerName,
      'bid_price': bidPrice,
      'partner_trust_score': partnerTrustScore,
      'partner_rating': partnerRating,
      'partner_avatar': partnerAvatar,
      'message': message,
      'preparation_time_minutes': preparationTime?.inMinutes,
      'created_at': createdAt.toIso8601String(),
      'status': status.key,
    };
  }
}

/// Ranked bid with score
class RankedBid {
  final PartnerBid bid;
  final double score;

  const RankedBid({
    required this.bid,
    required this.score,
  });
}

/// Dam Komao order (after bid acceptance)
class DamKomaoOrder {
  final String id;
  final String requestId;
  final String bidId;
  final String consumerId;
  final String partnerId;
  final String itemId;
  final String itemName;
  final int quantity;
  final double originalPrice;
  final double finalPrice;
  final double savingsAmount;
  final double savingsPercentage;
  final String? specialInstructions;
  final DateTime createdAt;
  OrderStatus status;

  DamKomaoOrder({
    required this.id,
    required this.requestId,
    required this.bidId,
    required this.consumerId,
    required this.partnerId,
    required this.itemId,
    required this.itemName,
    required this.quantity,
    required this.originalPrice,
    required this.finalPrice,
    required this.savingsAmount,
    required this.savingsPercentage,
    this.specialInstructions,
    required this.createdAt,
    required this.status,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'request_id': requestId,
      'bid_id': bidId,
      'consumer_id': consumerId,
      'partner_id': partnerId,
      'item_id': itemId,
      'item_name': itemName,
      'quantity': quantity,
      'original_price': originalPrice,
      'final_price': finalPrice,
      'savings_amount': savingsAmount,
      'savings_percentage': savingsPercentage,
      'special_instructions': specialInstructions,
      'created_at': createdAt.toIso8601String(),
      'status': status.key,
    };
  }
}

/// Dam Komao request status
enum DamKomaoStatus {
  active('active', 'Active'),
  completed('completed', 'Completed'),
  expired('expired', 'Expired'),
  cancelled('cancelled', 'Cancelled');

  const DamKomaoStatus(this.key, this.label);
  final String key;
  final String label;
}

/// Bid status
enum BidStatus {
  pending('pending', 'Pending'),
  accepted('accepted', 'Accepted'),
  rejected('rejected', 'Rejected'),
  expired('expired', 'Expired'),
  cancelled('cancelled', 'Cancelled');

  const BidStatus(this.key, this.label);
  final String key;
  final String label;
}

/// Order status
enum OrderStatus {
  pending('pending', 'Pending'),
  confirmed('confirmed', 'Confirmed'),
  preparing('preparing', 'Preparing'),
  ready('ready', 'Ready'),
  delivered('delivered', 'Delivered'),
  cancelled('cancelled', 'Cancelled');

  const OrderStatus(this.key, this.label);
  final String key;
  final String label;
}
