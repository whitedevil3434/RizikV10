import 'package:flutter/foundation.dart';
import 'dart:math' as math;
import 'package:rizik_v4/data/models/order.dart';
import 'package:rizik_v4/data/models/mission_chain.dart';
import 'package:rizik_v4/data/models/mission.dart';

/// Service for detecting and creating Mission Chains
/// Bundles nearby orders for efficient multi-delivery routes
class MissionChainDetector {
  // Configuration
  static const double maxChainRadius = 2.0; // km - max distance between orders
  static const int maxChainSize = 3; // Maximum 3 orders per chain
  static const int minChainSize = 2; // Minimum 2 orders to form chain
  static const double bonusPercentage = 0.15; // 15% bonus for chains
  static const int chainExpiryMinutes = 15; // Chain expires if not accepted
  static const double minEfficiencyScore = 0.6; // Minimum efficiency to create chain

  /// Detect potential mission chains from a list of ready orders
  /// Returns list of detected chains sorted by efficiency
  Future<List<MissionChain>> detectChains({
    required List<Order> readyOrders,
    required Map<String, double> orderRewards, // orderId -> reward
    double? riderLatitude,
    double? riderLongitude,
  }) async {
    try {
      if (readyOrders.length < minChainSize) {
        debugPrint('Not enough orders for chain detection: ${readyOrders.length}');
        return [];
      }

      debugPrint('🔗 Detecting mission chains from ${readyOrders.length} orders');

      // Group orders by proximity
      final clusters = _clusterOrdersByProximity(readyOrders);
      debugPrint('Found ${clusters.length} order clusters');

      // Generate potential chains from clusters
      final potentialChains = <MissionChain>[];
      for (final cluster in clusters) {
        if (cluster.length >= minChainSize) {
          final chains = await _generateChainsFromCluster(
            cluster,
            orderRewards,
            riderLatitude,
            riderLongitude,
          );
          potentialChains.addAll(chains);
        }
      }

      // Filter by efficiency and sort
      final efficientChains = potentialChains
          .where((chain) => chain.efficiencyScore >= minEfficiencyScore)
          .toList()
        ..sort((a, b) => b.efficiencyScore.compareTo(a.efficiencyScore));

      debugPrint('✅ Detected ${efficientChains.length} efficient mission chains');
      for (final chain in efficientChains) {
        debugPrint('  Chain ${chain.id}: ${chain.missions.length} missions, '
            'efficiency: ${(chain.efficiencyScore * 100).toStringAsFixed(0)}%, '
            'bonus: ৳${chain.bonusAmount.toStringAsFixed(0)}');
      }

      return efficientChains;
    } catch (e) {
      debugPrint('Error detecting mission chains: $e');
      return [];
    }
  }

  /// Cluster orders by proximity using simple distance-based grouping
  List<List<Order>> _clusterOrdersByProximity(List<Order> orders) {
    final clusters = <List<Order>>[];
    final processed = <String>{};

    for (final order in orders) {
      if (processed.contains(order.id)) continue;

      final cluster = <Order>[order];
      processed.add(order.id);

      // Find nearby orders
      for (final otherOrder in orders) {
        if (processed.contains(otherOrder.id)) continue;

        final distance = _calculateDistance(
          _extractCoordinates(order.deliveryAddress),
          _extractCoordinates(otherOrder.deliveryAddress),
        );

        if (distance <= maxChainRadius) {
          cluster.add(otherOrder);
          processed.add(otherOrder.id);

          // Stop if cluster reaches max size
          if (cluster.length >= maxChainSize) break;
        }
      }

      if (cluster.length >= minChainSize) {
        clusters.add(cluster);
      }
    }

    return clusters;
  }

  /// Generate all possible chains from a cluster of orders
  Future<List<MissionChain>> _generateChainsFromCluster(
    List<Order> cluster,
    Map<String, double> orderRewards,
    double? riderLat,
    double? riderLng,
  ) async {
    final chains = <MissionChain>[];

    // For clusters of 2-3 orders, create chains
    if (cluster.length == 2) {
      // Single chain possible
      final chain = await _createChain(cluster, orderRewards, riderLat, riderLng);
      if (chain != null) chains.add(chain);
    } else if (cluster.length == 3) {
      // Try all permutations to find best route
      final permutations = _generatePermutations(cluster);
      for (final perm in permutations) {
        final chain = await _createChain(perm, orderRewards, riderLat, riderLng);
        if (chain != null) chains.add(chain);
      }
    } else if (cluster.length > 3) {
      // For larger clusters, create multiple chains of 3
      for (int i = 0; i < cluster.length - 2; i++) {
        final subset = cluster.sublist(i, i + 3);
        final chain = await _createChain(subset, orderRewards, riderLat, riderLng);
        if (chain != null) chains.add(chain);
      }
    }

    return chains;
  }

  /// Create a mission chain from a list of orders
  Future<MissionChain?> _createChain(
    List<Order> orders,
    Map<String, double> orderRewards,
    double? riderLat,
    double? riderLng,
  ) async {
    try {
      // Convert orders to missions
      final missions = orders.map((order) {
        final reward = orderRewards[order.id] ?? _calculateDefaultReward(order);
        return _orderToMission(order, reward);
      }).toList();

      // Calculate route metrics
      final routeMetrics = _calculateRouteMetrics(
        missions,
        riderLat,
        riderLng,
      );

      // Calculate earnings
      final totalEarnings = missions.fold<double>(
        0.0,
        (sum, mission) => sum + mission.reward,
      );
      final bonusAmount = totalEarnings * bonusPercentage;
      final totalWithBonus = totalEarnings + bonusAmount;

      // Calculate efficiency score
      final efficiencyScore = _calculateEfficiencyScore(
        routeMetrics['totalDistance']!,
        routeMetrics['directDistance']!,
        routeMetrics['backtrackingPenalty']!,
      );

      // Create chain
      final chain = MissionChain(
        id: 'chain_${DateTime.now().millisecondsSinceEpoch}',
        missions: missions,
        totalDistance: routeMetrics['totalDistance']!,
        directDistance: routeMetrics['directDistance']!,
        backtrackingPenalty: routeMetrics['backtrackingPenalty']!,
        estimatedMinutes: routeMetrics['estimatedMinutes']!.toInt(),
        totalEarnings: totalEarnings,
        bonusAmount: bonusAmount,
        totalWithBonus: totalWithBonus,
        efficiencyScore: efficiencyScore,
        expiresAt: DateTime.now().add(const Duration(minutes: chainExpiryMinutes)),
      );

      return chain;
    } catch (e) {
      debugPrint('Error creating chain: $e');
      return null;
    }
  }

  /// Calculate route metrics for a chain
  Map<String, double> _calculateRouteMetrics(
    List<Mission> missions,
    double? riderLat,
    double? riderLng,
  ) {
    double totalDistance = 0.0;
    double directDistance = 0.0;

    // Start point (rider's location or first pickup)
    final startLat = riderLat ?? missions.first.pickupLatitude;
    final startLng = riderLng ?? missions.first.pickupLongitude;

    // Calculate optimized route distance
    var currentLat = startLat;
    var currentLng = startLng;

    for (final mission in missions) {
      // Distance to pickup
      final toPickup = _calculateDistance(
        {'lat': currentLat, 'lng': currentLng},
        {'lat': mission.pickupLatitude, 'lng': mission.pickupLongitude},
      );
      totalDistance += toPickup;

      // Distance from pickup to delivery
      final toDelivery = _calculateDistance(
        {'lat': mission.pickupLatitude, 'lng': mission.pickupLongitude},
        {'lat': mission.deliveryLatitude, 'lng': mission.deliveryLongitude},
      );
      totalDistance += toDelivery;

      // Update current position
      currentLat = mission.deliveryLatitude;
      currentLng = mission.deliveryLongitude;
    }

    // Calculate direct distance (if done separately)
    for (final mission in missions) {
      // From start to pickup
      final toPickup = _calculateDistance(
        {'lat': startLat, 'lng': startLng},
        {'lat': mission.pickupLatitude, 'lng': mission.pickupLongitude},
      );
      // From pickup to delivery
      final toDelivery = _calculateDistance(
        {'lat': mission.pickupLatitude, 'lng': mission.pickupLongitude},
        {'lat': mission.deliveryLatitude, 'lng': mission.deliveryLongitude},
      );
      // Return to start
      final returnToStart = _calculateDistance(
        {'lat': mission.deliveryLatitude, 'lng': mission.deliveryLongitude},
        {'lat': startLat, 'lng': startLng},
      );
      directDistance += toPickup + toDelivery + returnToStart;
    }

    final backtrackingPenalty = math.max(0.0, totalDistance - (directDistance * 0.7));
    const avgSpeedKmPerHour = 20.0;
    final estimatedMinutes = (totalDistance / avgSpeedKmPerHour * 60) + (missions.length * 5);

    return {
      'totalDistance': totalDistance,
      'directDistance': directDistance,
      'backtrackingPenalty': backtrackingPenalty,
      'estimatedMinutes': estimatedMinutes,
    };
  }

  /// Calculate efficiency score (0.0 to 1.0)
  /// Higher score = less backtracking, more efficient route
  double _calculateEfficiencyScore(
    double totalDistance,
    double directDistance,
    double backtrackingPenalty,
  ) {
    if (directDistance == 0) return 0.0;

    // Base efficiency: how much distance is saved
    final distanceSaved = directDistance - totalDistance;
    final savingsRatio = distanceSaved / directDistance;

    // Penalty for backtracking
    final backtrackingRatio = backtrackingPenalty / totalDistance;
    final backtrackingPenaltyScore = 1.0 - backtrackingRatio;

    // Combined score (weighted average)
    final score = (savingsRatio * 0.7) + (backtrackingPenaltyScore * 0.3);

    return math.max(0.0, math.min(1.0, score));
  }

  /// Convert Order to Mission
  Mission _orderToMission(Order order, double reward) {
    final coords = _extractCoordinates(order.deliveryAddress);
    final pickupCoords = _extractPickupCoordinates(order);

    return Mission(
      id: 'mission_${order.id}',
      orderId: order.id,
      restaurantName: _extractRestaurantName(order),
      restaurantAddress: _extractPickupAddress(order),
      pickupLatitude: pickupCoords['lat']!,
      pickupLongitude: pickupCoords['lng']!,
      customerName: 'Customer ${order.id.substring(0, 4)}',
      customerPhone: '+880 1XXX-XXXXXX',
      deliveryAddress: order.deliveryAddress,
      deliveryLatitude: coords['lat']!,
      deliveryLongitude: coords['lng']!,
      items: order.items.map((item) => '${item.name} x${item.quantity}').toList(),
      reward: reward,
      distance: _calculateDistance(pickupCoords, coords),
      estimatedMinutes: _calculateEstimatedTime(order),
      otp: _generateOTP(order.id),
      status: MissionStatus.available,
      createdAt: DateTime.now(),
    );
  }

  /// Calculate default reward for an order
  double _calculateDefaultReward(Order order) {
    const double baseFare = 30.0;
    const double perKmRate = 10.0;
    const double orderValueBonusRate = 0.05;

    final distance = _estimateDistance(order.deliveryAddress);
    final distanceFare = distance * perKmRate;
    final orderValueBonus = order.total * orderValueBonusRate;
    final totalReward = baseFare + distanceFare + orderValueBonus;

    return (totalReward / 10).round() * 10.0;
  }

  /// Extract coordinates from address (mock implementation)
  Map<String, double> _extractCoordinates(String address) {
    // Mock coordinates based on address hash
    final hash = address.hashCode.abs();
    final lat = 23.7 + (hash % 100) / 1000.0; // Dhaka area
    final lng = 90.3 + (hash % 200) / 1000.0;
    return {'lat': lat, 'lng': lng};
  }

  /// Extract pickup coordinates (mock implementation)
  Map<String, double> _extractPickupCoordinates(Order order) {
    // Mock pickup location (restaurant)
    return {'lat': 23.7808, 'lng': 90.4194}; // Gulshan area
  }

  /// Calculate distance between two points using Haversine formula
  double _calculateDistance(Map<String, double> point1, Map<String, double> point2) {
    const earthRadius = 6371.0; // km

    final lat1 = point1['lat']! * math.pi / 180;
    final lat2 = point2['lat']! * math.pi / 180;
    final dLat = (point2['lat']! - point1['lat']!) * math.pi / 180;
    final dLng = (point2['lng']! - point1['lng']!) * math.pi / 180;

    final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
        math.cos(lat1) * math.cos(lat2) * math.sin(dLng / 2) * math.sin(dLng / 2);
    final c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a));

    return earthRadius * c;
  }

  /// Estimate distance from address (mock)
  double _estimateDistance(String address) {
    final random = math.Random(address.hashCode);
    return 2.0 + random.nextDouble() * 6.0;
  }

  /// Extract restaurant name from order
  String _extractRestaurantName(Order order) {
    if (order.items.isNotEmpty) {
      final firstItem = order.items.first.name;
      if (firstItem.contains('Biryani')) return 'কাচ্চি ভাই';
      if (firstItem.contains('Burger')) return 'বার্গার কিং';
      if (firstItem.contains('Pizza')) return 'পিজা হাট';
    }
    return 'Cloud Kitchen';
  }

  /// Extract pickup address
  String _extractPickupAddress(Order order) {
    return 'গুলশান ১, ঢাকা';
  }

  /// Calculate estimated time
  int _calculateEstimatedTime(Order order) {
    final distance = _estimateDistance(order.deliveryAddress);
    const avgSpeedKmPerHour = 20.0;
    const pickupTime = 5;
    final travelTime = (distance / avgSpeedKmPerHour * 60).round();
    return pickupTime + travelTime;
  }

  /// Generate OTP
  String _generateOTP(String orderId) {
    final hash = orderId.hashCode.abs();
    final otp = 1000 + (hash % 9000);
    return otp.toString();
  }

  /// Generate all permutations of a list (for route optimization)
  List<List<Order>> _generatePermutations(List<Order> orders) {
    if (orders.length <= 1) return [orders];
    if (orders.length == 2) {
      return [
        orders,
        [orders[1], orders[0]],
      ];
    }
    if (orders.length == 3) {
      return [
        [orders[0], orders[1], orders[2]],
        [orders[0], orders[2], orders[1]],
        [orders[1], orders[0], orders[2]],
        [orders[1], orders[2], orders[0]],
        [orders[2], orders[0], orders[1]],
        [orders[2], orders[1], orders[0]],
      ];
    }
    return [orders]; // Fallback
  }

  /// Check if an order is eligible for chaining
  bool isOrderEligibleForChain(Order order) {
    // Order must be in readyForPickup status
    if (order.status != OrderStatus.readyForPickup) return false;

    // Order must not be too old (within 30 minutes)
    final age = DateTime.now().difference(order.createdAt);
    if (age.inMinutes > 30) return false;

    // Order must not be too large (reasonable for bundling)
    if (order.items.length > 5) return false;

    return true;
  }

  /// Calculate XP bonus for completing a mission chain
  int calculateChainXP(MissionChain chain) {
    const baseXP = 100; // Base XP for completing a chain
    final bonusXP = (chain.missions.length - 1) * 25; // +25 XP per additional mission
    final efficiencyBonus = (chain.efficiencyScore * 50).toInt(); // Up to +50 XP for efficiency

    return baseXP + bonusXP + efficiencyBonus;
  }
}
