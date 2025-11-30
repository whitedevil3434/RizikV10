import 'package:flutter/foundation.dart';

/// Store status
enum StoreStatus {
  open,
  closed,
  busy,
}

/// Virtual storefront model for partners
@immutable
class VirtualStorefront {
  final String id;
  final String partnerId;
  final String partnerName;
  final String partnerAvatar;
  
  // Store info
  final String storeName;
  final String? storeImage;
  final String? description;
  final String category;
  final List<String> tags;
  
  // Location
  final double? latitude;
  final double? longitude;
  final String? address;
  
  // Trust & Performance
  final double trustScore;
  final int auraLevel;
  final double rating;
  final int reviewCount;
  final int totalOrders;
  final double conversionRate; // Views to orders
  
  // Status
  final StoreStatus status;
  final String? businessHours; // e.g., "9 AM - 9 PM"
  final bool isVerified;
  
  // Inventory integration (from Khata OS)
  final Map<String, int> inventoryMap; // foodId -> quantity
  final DateTime lastInventorySync;
  final bool hasLowStock;
  
  // Performance metrics
  final double averagePreparationTime; // minutes
  final double onTimeDeliveryRate; // percentage
  final int activeOrders;
  
  // Timestamps
  final DateTime createdAt;
  final DateTime lastUpdated;
  
  const VirtualStorefront({
    required this.id,
    required this.partnerId,
    required this.partnerName,
    required this.partnerAvatar,
    required this.storeName,
    this.storeImage,
    this.description,
    required this.category,
    this.tags = const [],
    this.latitude,
    this.longitude,
    this.address,
    required this.trustScore,
    required this.auraLevel,
    this.rating = 0.0,
    this.reviewCount = 0,
    this.totalOrders = 0,
    this.conversionRate = 0.0,
    this.status = StoreStatus.open,
    this.businessHours,
    this.isVerified = false,
    this.inventoryMap = const {},
    required this.lastInventorySync,
    this.hasLowStock = false,
    this.averagePreparationTime = 30.0,
    this.onTimeDeliveryRate = 95.0,
    this.activeOrders = 0,
    required this.createdAt,
    required this.lastUpdated,
  });

  /// Check if item is in stock
  bool isItemInStock(String foodId) {
    return inventoryMap.containsKey(foodId) && 
           (inventoryMap[foodId] ?? 0) > 0;
  }

  /// Get item quantity
  int getItemQuantity(String foodId) {
    return inventoryMap[foodId] ?? 0;
  }

  /// Check if item has limited stock
  bool isItemLimitedStock(String foodId, {int threshold = 5}) {
    final quantity = getItemQuantity(foodId);
    return quantity > 0 && quantity <= threshold;
  }

  /// Check if store is currently open
  bool get isOpen => status == StoreStatus.open;

  /// Check if inventory sync is stale (> 5 minutes)
  bool get isInventorySyncStale {
    return DateTime.now().difference(lastInventorySync).inMinutes > 5;
  }

  VirtualStorefront copyWith({
    String? id,
    String? partnerId,
    String? partnerName,
    String? partnerAvatar,
    String? storeName,
    String? storeImage,
    String? description,
    String? category,
    List<String>? tags,
    double? latitude,
    double? longitude,
    String? address,
    double? trustScore,
    int? auraLevel,
    double? rating,
    int? reviewCount,
    int? totalOrders,
    double? conversionRate,
    StoreStatus? status,
    String? businessHours,
    bool? isVerified,
    Map<String, int>? inventoryMap,
    DateTime? lastInventorySync,
    bool? hasLowStock,
    double? averagePreparationTime,
    double? onTimeDeliveryRate,
    int? activeOrders,
    DateTime? createdAt,
    DateTime? lastUpdated,
  }) {
    return VirtualStorefront(
      id: id ?? this.id,
      partnerId: partnerId ?? this.partnerId,
      partnerName: partnerName ?? this.partnerName,
      partnerAvatar: partnerAvatar ?? this.partnerAvatar,
      storeName: storeName ?? this.storeName,
      storeImage: storeImage ?? this.storeImage,
      description: description ?? this.description,
      category: category ?? this.category,
      tags: tags ?? this.tags,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      trustScore: trustScore ?? this.trustScore,
      auraLevel: auraLevel ?? this.auraLevel,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      totalOrders: totalOrders ?? this.totalOrders,
      conversionRate: conversionRate ?? this.conversionRate,
      status: status ?? this.status,
      businessHours: businessHours ?? this.businessHours,
      isVerified: isVerified ?? this.isVerified,
      inventoryMap: inventoryMap ?? this.inventoryMap,
      lastInventorySync: lastInventorySync ?? this.lastInventorySync,
      hasLowStock: hasLowStock ?? this.hasLowStock,
      averagePreparationTime: averagePreparationTime ?? this.averagePreparationTime,
      onTimeDeliveryRate: onTimeDeliveryRate ?? this.onTimeDeliveryRate,
      activeOrders: activeOrders ?? this.activeOrders,
      createdAt: createdAt ?? this.createdAt,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'partner_id': partnerId,
      'partner_name': partnerName,
      'partner_avatar': partnerAvatar,
      'store_name': storeName,
      'store_image': storeImage,
      'description': description,
      'category': category,
      'tags': tags,
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'trust_score': trustScore,
      'aura_level': auraLevel,
      'rating': rating,
      'review_count': reviewCount,
      'total_orders': totalOrders,
      'conversion_rate': conversionRate,
      'status': status.name,
      'business_hours': businessHours,
      'is_verified': isVerified,
      'inventory_map': inventoryMap,
      'last_inventory_sync': lastInventorySync.toIso8601String(),
      'has_low_stock': hasLowStock,
      'average_preparation_time': averagePreparationTime,
      'on_time_delivery_rate': onTimeDeliveryRate,
      'active_orders': activeOrders,
      'created_at': createdAt.toIso8601String(),
      'last_updated': lastUpdated.toIso8601String(),
    };
  }

  factory VirtualStorefront.fromJson(Map<String, dynamic> json) {
    return VirtualStorefront(
      id: json['id'] as String,
      partnerId: json['partner_id'] as String,
      partnerName: json['partner_name'] as String,
      partnerAvatar: json['partner_avatar'] as String,
      storeName: json['store_name'] as String,
      storeImage: json['store_image'] as String?,
      description: json['description'] as String?,
      category: json['category'] as String,
      tags: List<String>.from(json['tags'] as List? ?? []),
      latitude: json['latitude'] as double?,
      longitude: json['longitude'] as double?,
      address: json['address'] as String?,
      trustScore: (json['trust_score'] as num).toDouble(),
      auraLevel: json['aura_level'] as int,
      rating: (json['rating'] as num?)?.toDouble() ?? 0.0,
      reviewCount: json['review_count'] as int? ?? 0,
      totalOrders: json['total_orders'] as int? ?? 0,
      conversionRate: (json['conversion_rate'] as num?)?.toDouble() ?? 0.0,
      status: StoreStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => StoreStatus.open,
      ),
      businessHours: json['business_hours'] as String?,
      isVerified: json['is_verified'] as bool? ?? false,
      inventoryMap: Map<String, int>.from(json['inventory_map'] as Map? ?? {}),
      lastInventorySync: DateTime.parse(json['last_inventory_sync'] as String),
      hasLowStock: json['has_low_stock'] as bool? ?? false,
      averagePreparationTime: (json['average_preparation_time'] as num?)?.toDouble() ?? 30.0,
      onTimeDeliveryRate: (json['on_time_delivery_rate'] as num?)?.toDouble() ?? 95.0,
      activeOrders: json['active_orders'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at'] as String),
      lastUpdated: DateTime.parse(json['last_updated'] as String),
    );
  }

  /// Auto-generate storefront from partner profile
  factory VirtualStorefront.createFromPartner({
    required String partnerId,
    required String partnerName,
    required String partnerAvatar,
    required double trustScore,
    required int auraLevel,
    String? businessName,
    String? category,
  }) {
    final now = DateTime.now();
    return VirtualStorefront(
      id: 'store_${partnerId}_${now.millisecondsSinceEpoch}',
      partnerId: partnerId,
      partnerName: partnerName,
      partnerAvatar: partnerAvatar,
      storeName: businessName ?? '$partnerName\'s Kitchen',
      category: category ?? 'Food',
      trustScore: trustScore,
      auraLevel: auraLevel,
      lastInventorySync: now,
      createdAt: now,
      lastUpdated: now,
    );
  }
}
