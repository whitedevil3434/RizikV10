    import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/user_role.dart';

/// Feed item types in Bazar Tab
enum FeedItemType {
  food,
  bidRequest,
  mission,
  store,
  video,
  service,
}

/// Base class for all Bazar feed items
@immutable
abstract class BazarFeedItem {
  String get id;
  FeedItemType get type;
  DateTime get timestamp;
  
  /// Role targeting - which roles should see this item
  List<UserRole> get targetRoles;
  
  /// Minimum Trust Score required to see this item
  double get minTrustScore;
  
  /// Location for hyperlocal filtering
  double? get latitude;
  double? get longitude;
  
  /// Calculate distance from user location (in km)
  double? distanceFrom(double? userLat, double? userLon) {
    if (latitude == null || longitude == null || userLat == null || userLon == null) {
      return null;
    }
    
    // Haversine formula for distance calculation
    const double earthRadius = 6371; // km
    final dLat = _toRadians(userLat - latitude!);
    final dLon = _toRadians(userLon - longitude!);
    
    final a = (dLat / 2).sin() * (dLat / 2).sin() +
        latitude!.toRadians().cos() * userLat.toRadians().cos() *
        (dLon / 2).sin() * (dLon / 2).sin();
    
    final c = 2 * (a.sqrt()).asin();
    return earthRadius * c;
  }
  
  double _toRadians(double degrees) => degrees * (3.14159265359 / 180);
}

extension on double {
  double toRadians() => this * (3.14159265359 / 180);
  double sin() => this; // Placeholder - use dart:math in real implementation
  double cos() => this; // Placeholder
  double asin() => this; // Placeholder
  double sqrt() => this; // Placeholder
}

/// Food item in feed (Rizik Now)
@immutable
class FoodFeedItem extends BazarFeedItem {
  @override
  final String id;
  
  final String foodId;
  final String foodName;
  final String foodImage;
  final double price;
  final double rating;
  final String category;
  
  final String partnerId;
  final String partnerName;
  final double partnerTrustScore;
  final int partnerAuraLevel;
  
  @override
  final DateTime timestamp;
  
  @override
  final List<UserRole> targetRoles;
  
  @override
  final double minTrustScore;
  
  @override
  final double? latitude;
  
  @override
  final double? longitude;
  
  final bool isAvailable;
  final int deliveryTimeMinutes;
  
  FoodFeedItem({
    required this.id,
    required this.foodId,
    required this.foodName,
    required this.foodImage,
    required this.price,
    required this.rating,
    required this.category,
    required this.partnerId,
    required this.partnerName,
    required this.partnerTrustScore,
    required this.partnerAuraLevel,
    required this.timestamp,
    this.targetRoles = const [UserRole.consumer],
    this.minTrustScore = 0.0,
    this.latitude,
    this.longitude,
    this.isAvailable = true,
    this.deliveryTimeMinutes = 45,
  });
  
  @override
  FeedItemType get type => FeedItemType.food;
}

/// Bid request in feed (Dam Komao)
@immutable
class BidRequestFeedItem extends BazarFeedItem {
  @override
  final String id;
  
  final String consumerId;
  final String consumerName;
  final double consumerTrustScore;
  
  final String title;
  final String description;
  final double targetPrice;
  final double? originalPrice;
  final int quantity;
  
  @override
  final DateTime timestamp;
  
  final DateTime expiryTime;
  final int bidCount;
  final double? lowestBid;
  
  @override
  final List<UserRole> targetRoles;
  
  @override
  final double minTrustScore;
  
  @override
  final double? latitude;
  
  @override
  final double? longitude;
  
  final String? imageUrl;
  
  BidRequestFeedItem({
    required this.id,
    required this.consumerId,
    required this.consumerName,
    required this.consumerTrustScore,
    required this.title,
    required this.description,
    required this.targetPrice,
    this.originalPrice,
    required this.quantity,
    required this.timestamp,
    required this.expiryTime,
    this.bidCount = 0,
    this.lowestBid,
    this.targetRoles = const [UserRole.partner],
    this.minTrustScore = 2.0,
    this.latitude,
    this.longitude,
    this.imageUrl,
  });
  
  @override
  FeedItemType get type => FeedItemType.bidRequest;
  
  bool get isExpired => DateTime.now().isAfter(expiryTime);
  
  Duration get timeRemaining => expiryTime.difference(DateTime.now());
}

/// Delivery mission in feed
@immutable
class MissionFeedItem extends BazarFeedItem {
  @override
  final String id;
  
  final String orderId;
  final String pickupLocation;
  final String dropoffLocation;
  
  @override
  final double? latitude; // Pickup location
  
  @override
  final double? longitude;
  
  final double? dropoffLatitude;
  final double? dropoffLongitude;
  
  final double distanceKm;
  final int estimatedTimeMinutes;
  final double rewardAmount;
  
  @override
  final DateTime timestamp;
  
  @override
  final List<UserRole> targetRoles;
  
  @override
  final double minTrustScore;
  
  final bool isPartOfChain;
  final String? chainId;
  final double? chainBonusAmount;
  
  MissionFeedItem({
    required this.id,
    required this.orderId,
    required this.pickupLocation,
    required this.dropoffLocation,
    this.latitude,
    this.longitude,
    this.dropoffLatitude,
    this.dropoffLongitude,
    required this.distanceKm,
    required this.estimatedTimeMinutes,
    required this.rewardAmount,
    required this.timestamp,
    this.targetRoles = const [UserRole.rider],
    this.minTrustScore = 3.0,
    this.isPartOfChain = false,
    this.chainId,
    this.chainBonusAmount,
  });
  
  @override
  FeedItemType get type => FeedItemType.mission;
  
  double get totalReward => rewardAmount + (chainBonusAmount ?? 0);
}

/// Virtual storefront in feed
@immutable
class StoreFeedItem extends BazarFeedItem {
  @override
  final String id;
  
  final String storeId;
  final String storeName;
  final String storeImage;
  final String partnerId;
  final double partnerTrustScore;
  final int partnerAuraLevel;
  
  final double rating;
  final int reviewCount;
  final bool isOpen;
  final String category;
  
  @override
  final DateTime timestamp;
  
  @override
  final List<UserRole> targetRoles;
  
  @override
  final double minTrustScore;
  
  @override
  final double? latitude;
  
  @override
  final double? longitude;
  
  final int itemCount;
  final bool hasLowStock;
  
  StoreFeedItem({
    required this.id,
    required this.storeId,
    required this.storeName,
    required this.storeImage,
    required this.partnerId,
    required this.partnerTrustScore,
    required this.partnerAuraLevel,
    required this.rating,
    required this.reviewCount,
    required this.isOpen,
    required this.category,
    required this.timestamp,
    this.targetRoles = const [UserRole.consumer],
    this.minTrustScore = 0.0,
    this.latitude,
    this.longitude,
    this.itemCount = 0,
    this.hasLowStock = false,
  });
  
  @override
  FeedItemType get type => FeedItemType.store;
}
