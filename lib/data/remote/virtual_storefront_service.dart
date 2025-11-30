import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/virtual_storefront.dart';
import 'package:rizik_v4/data/models/user_profile.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/data/models/food_item.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';

/// Service for managing virtual storefronts
/// Handles store creation, inventory sync, and status management
class VirtualStorefrontService {
  // Inventory sync settings
  static const int inventorySyncIntervalMinutes = 5;
  static const int lowStockThreshold = 5;

  /// Auto-generate storefront when partner creates profile
  VirtualStorefront createStorefrontFromPartner({
    required UserProfile partner,
    String? businessName,
    String? category,
    String? description,
    String? storeImage,
    String? businessHours,
    double? latitude,
    double? longitude,
    String? address,
  }) {
    final trustScore = partner.getTrustScore().overall;
    final auraLevel = 5; // Default aura level, should be fetched from AuraProvider

    final storefront = VirtualStorefront.createFromPartner(
      partnerId: partner.id,
      partnerName: partner.name,
      partnerAvatar: partner.getAvatarForRole(UserRole.partner),
      trustScore: trustScore,
      auraLevel: auraLevel,
      businessName: businessName,
      category: category,
    );

    // Apply additional fields
    final updatedStorefront = storefront.copyWith(
      description: description,
      storeImage: storeImage,
      businessHours: businessHours,
      latitude: latitude,
      longitude: longitude,
      address: address,
    );

    debugPrint('🏪 Virtual storefront created');
    debugPrint('   Store: ${updatedStorefront.storeName}');
    debugPrint('   Partner: ${partner.name}');
    debugPrint('   Trust Score: $trustScore');
    debugPrint('   Aura Level: $auraLevel');

    return updatedStorefront;
  }

  /// Sync inventory from Khata OS
  /// Maps Khata inventory to storefront inventory
  Future<VirtualStorefront> syncInventoryFromKhata({
    required VirtualStorefront storefront,
    required KhataProvider khataProvider,
  }) async {
    try {
      // In production, this would query Khata OS for inventory levels
      // For now, we'll simulate with mock data
      
      final inventoryMap = <String, int>{};
      bool hasLowStock = false;

      // Mock inventory sync - in production, query from Khata OS
      // Example: Get inventory entries from partner's Khata
      // final khataEntries = await khataProvider.getInventoryEntries(storefront.partnerId);
      
      debugPrint('📦 Syncing inventory for ${storefront.storeName}');
      debugPrint('   Partner: ${storefront.partnerId}');

      // Check for low stock items
      for (final entry in inventoryMap.entries) {
        if (entry.value <= lowStockThreshold && entry.value > 0) {
          hasLowStock = true;
          debugPrint('   ⚠️ Low stock: ${entry.key} (${entry.value} remaining)');
        }
      }

      final now = DateTime.now();
      final updatedStorefront = storefront.copyWith(
        inventoryMap: inventoryMap,
        lastInventorySync: now,
        hasLowStock: hasLowStock,
        lastUpdated: now,
      );

      debugPrint('✅ Inventory synced: ${inventoryMap.length} items');
      return updatedStorefront;
    } catch (e) {
      debugPrint('❌ Inventory sync failed: $e');
      rethrow;
    }
  }

  /// Update store status (open, closed, busy)
  VirtualStorefront updateStoreStatus({
    required VirtualStorefront storefront,
    required StoreStatus status,
  }) {
    final now = DateTime.now();
    final updatedStorefront = storefront.copyWith(
      status: status,
      lastUpdated: now,
    );

    debugPrint('🏪 Store status updated: ${storefront.storeName}');
    debugPrint('   Status: ${status.name}');

    return updatedStorefront;
  }

  /// Auto-update store status based on business hours
  VirtualStorefront autoUpdateStoreStatus({
    required VirtualStorefront storefront,
    DateTime? currentTime,
  }) {
    final now = currentTime ?? DateTime.now();
    
    // If no business hours set, keep current status
    if (storefront.businessHours == null) {
      return storefront;
    }

    // Parse business hours (e.g., "9 AM - 9 PM")
    // This is a simplified implementation
    final isWithinBusinessHours = _isWithinBusinessHours(
      storefront.businessHours!,
      now,
    );

    final newStatus = isWithinBusinessHours 
        ? StoreStatus.open 
        : StoreStatus.closed;

    if (newStatus != storefront.status) {
      return updateStoreStatus(
        storefront: storefront,
        status: newStatus,
      );
    }

    return storefront;
  }

  /// Update item quantity in inventory
  VirtualStorefront updateItemQuantity({
    required VirtualStorefront storefront,
    required String foodId,
    required int quantity,
  }) {
    final updatedInventory = Map<String, int>.from(storefront.inventoryMap);
    
    if (quantity <= 0) {
      updatedInventory.remove(foodId);
      debugPrint('🗑️ Item removed from inventory: $foodId');
    } else {
      updatedInventory[foodId] = quantity;
      debugPrint('📦 Item quantity updated: $foodId → $quantity');
    }

    // Check for low stock
    final hasLowStock = updatedInventory.values.any(
      (qty) => qty > 0 && qty <= lowStockThreshold,
    );

    return storefront.copyWith(
      inventoryMap: updatedInventory,
      hasLowStock: hasLowStock,
      lastUpdated: DateTime.now(),
    );
  }

  /// Deduct item quantity when order is placed
  VirtualStorefront deductItemQuantity({
    required VirtualStorefront storefront,
    required String foodId,
    required int quantityToDeduct,
  }) {
    final currentQuantity = storefront.getItemQuantity(foodId);
    
    if (currentQuantity < quantityToDeduct) {
      throw StateError(
        'Insufficient stock: $foodId (available: $currentQuantity, requested: $quantityToDeduct)',
      );
    }

    final newQuantity = currentQuantity - quantityToDeduct;
    
    return updateItemQuantity(
      storefront: storefront,
      foodId: foodId,
      quantity: newQuantity,
    );
  }

  /// Add item to inventory
  VirtualStorefront addItemToInventory({
    required VirtualStorefront storefront,
    required String foodId,
    required int quantity,
  }) {
    final currentQuantity = storefront.getItemQuantity(foodId);
    final newQuantity = currentQuantity + quantity;

    return updateItemQuantity(
      storefront: storefront,
      foodId: foodId,
      quantity: newQuantity,
    );
  }

  /// Update store performance metrics
  VirtualStorefront updatePerformanceMetrics({
    required VirtualStorefront storefront,
    double? rating,
    int? reviewCount,
    int? totalOrders,
    double? conversionRate,
    double? averagePreparationTime,
    double? onTimeDeliveryRate,
  }) {
    return storefront.copyWith(
      rating: rating ?? storefront.rating,
      reviewCount: reviewCount ?? storefront.reviewCount,
      totalOrders: totalOrders ?? storefront.totalOrders,
      conversionRate: conversionRate ?? storefront.conversionRate,
      averagePreparationTime: averagePreparationTime ?? storefront.averagePreparationTime,
      onTimeDeliveryRate: onTimeDeliveryRate ?? storefront.onTimeDeliveryRate,
      lastUpdated: DateTime.now(),
    );
  }

  /// Increment active orders count
  VirtualStorefront incrementActiveOrders(VirtualStorefront storefront) {
    final newCount = storefront.activeOrders + 1;
    
    // Auto-set to busy if too many active orders
    final newStatus = newCount >= 10 
        ? StoreStatus.busy 
        : storefront.status;

    return storefront.copyWith(
      activeOrders: newCount,
      status: newStatus,
      lastUpdated: DateTime.now(),
    );
  }

  /// Decrement active orders count
  VirtualStorefront decrementActiveOrders(VirtualStorefront storefront) {
    final newCount = (storefront.activeOrders - 1).clamp(0, 999);
    
    // Auto-set to open if no longer busy
    final newStatus = newCount < 10 && storefront.status == StoreStatus.busy
        ? StoreStatus.open 
        : storefront.status;

    return storefront.copyWith(
      activeOrders: newCount,
      status: newStatus,
      lastUpdated: DateTime.now(),
    );
  }

  /// Update Trust Score and Aura level
  VirtualStorefront updateTrustAndAura({
    required VirtualStorefront storefront,
    required double trustScore,
    required int auraLevel,
  }) {
    return storefront.copyWith(
      trustScore: trustScore,
      auraLevel: auraLevel,
      lastUpdated: DateTime.now(),
    );
  }

  /// Check if inventory sync is needed
  bool needsInventorySync(VirtualStorefront storefront) {
    return storefront.isInventorySyncStale;
  }

  /// Get store availability status
  Map<String, dynamic> getAvailabilityStatus(VirtualStorefront storefront) {
    return {
      'isOpen': storefront.isOpen,
      'status': storefront.status.name,
      'activeOrders': storefront.activeOrders,
      'hasLowStock': storefront.hasLowStock,
      'inventoryItemCount': storefront.inventoryMap.length,
      'lastSync': storefront.lastInventorySync,
      'needsSync': needsInventorySync(storefront),
    };
  }

  /// Get store performance summary
  Map<String, dynamic> getPerformanceSummary(VirtualStorefront storefront) {
    return {
      'rating': storefront.rating,
      'reviewCount': storefront.reviewCount,
      'totalOrders': storefront.totalOrders,
      'conversionRate': storefront.conversionRate,
      'averagePreparationTime': storefront.averagePreparationTime,
      'onTimeDeliveryRate': storefront.onTimeDeliveryRate,
      'trustScore': storefront.trustScore,
      'auraLevel': storefront.auraLevel,
      'isVerified': storefront.isVerified,
    };
  }

  /// Get low stock items
  List<Map<String, dynamic>> getLowStockItems(VirtualStorefront storefront) {
    return storefront.inventoryMap.entries
        .where((entry) => entry.value > 0 && entry.value <= lowStockThreshold)
        .map((entry) => {
              'foodId': entry.key,
              'quantity': entry.value,
            })
        .toList();
  }

  /// Get out of stock items
  List<String> getOutOfStockItems(VirtualStorefront storefront) {
    return storefront.inventoryMap.entries
        .where((entry) => entry.value == 0)
        .map((entry) => entry.key)
        .toList();
  }

  /// Filter available items (in stock)
  List<String> getAvailableItems(VirtualStorefront storefront) {
    return storefront.inventoryMap.entries
        .where((entry) => entry.value > 0)
        .map((entry) => entry.key)
        .toList();
  }

  /// Calculate store score for ranking
  double calculateStoreScore({
    required VirtualStorefront storefront,
    double? userLatitude,
    double? userLongitude,
  }) {
    double score = 0.0;

    // Trust Score weight (0-50 points)
    score += storefront.trustScore * 10;

    // Rating weight (0-25 points)
    score += storefront.rating * 5;

    // Aura level weight (0-10 points)
    score += storefront.auraLevel.toDouble();

    // Verification bonus (5 points)
    if (storefront.isVerified) {
      score += 5;
    }

    // Status penalty
    if (storefront.status == StoreStatus.closed) {
      score *= 0.5; // 50% penalty for closed stores
    } else if (storefront.status == StoreStatus.busy) {
      score *= 0.8; // 20% penalty for busy stores
    }

    // Distance penalty (if location available)
    if (userLatitude != null && 
        userLongitude != null && 
        storefront.latitude != null && 
        storefront.longitude != null) {
      final distance = _calculateDistance(
        userLatitude,
        userLongitude,
        storefront.latitude!,
        storefront.longitude!,
      );
      
      // Penalty increases with distance
      if (distance > 2.0) {
        score *= 0.7; // 30% penalty for > 2km
      } else if (distance > 1.0) {
        score *= 0.9; // 10% penalty for > 1km
      }
    }

    return score;
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  bool _isWithinBusinessHours(String businessHours, DateTime time) {
    // Simplified implementation - in production, parse actual hours
    // Example format: "9 AM - 9 PM"
    final hour = time.hour;
    return hour >= 9 && hour < 21; // 9 AM to 9 PM
  }

  double _calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    // Haversine formula for distance calculation
    const double earthRadius = 6371; // km
    
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    
    final a = _sin(dLat / 2) * _sin(dLat / 2) +
        _cos(_toRadians(lat1)) *
            _cos(_toRadians(lat2)) *
            _sin(dLon / 2) *
            _sin(dLon / 2);
    
    final c = 2 * _atan2(_sqrt(a), _sqrt(1 - a));
    
    return earthRadius * c;
  }

  double _toRadians(double degrees) => degrees * (3.14159265359 / 180);
  double _sin(double x) => _dartSin(x);
  double _cos(double x) => _dartCos(x);
  double _sqrt(double x) => _dartSqrt(x);
  double _atan2(double y, double x) => _dartAtan2(y, x);

  // Use dart:math functions
  double _dartSin(double x) {
    // Taylor series approximation for sin
    double result = x;
    double term = x;
    for (int i = 1; i < 10; i++) {
      term *= -x * x / ((2 * i) * (2 * i + 1));
      result += term;
    }
    return result;
  }

  double _dartCos(double x) {
    // Taylor series approximation for cos
    double result = 1.0;
    double term = 1.0;
    for (int i = 1; i < 10; i++) {
      term *= -x * x / ((2 * i - 1) * (2 * i));
      result += term;
    }
    return result;
  }

  double _dartSqrt(double x) {
    // Newton's method for square root
    if (x == 0) return 0;
    double guess = x / 2;
    for (int i = 0; i < 10; i++) {
      guess = (guess + x / guess) / 2;
    }
    return guess;
  }

  double _dartAtan2(double y, double x) {
    // Simplified atan2 implementation
    if (x > 0) {
      return _dartAtan(y / x);
    } else if (x < 0 && y >= 0) {
      return _dartAtan(y / x) + 3.14159265359;
    } else if (x < 0 && y < 0) {
      return _dartAtan(y / x) - 3.14159265359;
    } else if (x == 0 && y > 0) {
      return 3.14159265359 / 2;
    } else if (x == 0 && y < 0) {
      return -3.14159265359 / 2;
    }
    return 0;
  }

  double _dartAtan(double x) {
    // Taylor series approximation for atan
    if (x.abs() > 1) {
      return (3.14159265359 / 2) * x.sign - _dartAtan(1 / x);
    }
    double result = x;
    double term = x;
    for (int i = 1; i < 10; i++) {
      term *= -x * x * (2 * i - 1) / (2 * i + 1);
      result += term;
    }
    return result;
  }
}
