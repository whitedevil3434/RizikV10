// Mission Chain Optimization Service
// Task 10.2-10.3: Chain generation and optimization algorithms

import 'dart:math';
import 'package:geolocator/geolocator.dart';
import 'package:rizik_v4/data/models/mission.dart';
import 'package:rizik_v4/data/models/mission_chain.dart';

class MissionChainService {
  static const double BONUS_PERCENTAGE = 0.15; // 15% bonus
  static const int CHAIN_SIZE = 3; // Always 3 missions
  static const double MAX_BACKTRACK_PENALTY = 0.3; // 30% extra distance max
  static const int CHAIN_EXPIRY_MINUTES = 30; // Chain expires in 30 min

  /// Calculate distance between two coordinates
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }

  /// Generate all possible 3-mission combinations
  static List<List<Mission>> generateCombinations(List<Mission> missions) {
    final combinations = <List<Mission>>[];

    if (missions.length < CHAIN_SIZE) return combinations;

    // Generate all combinations of 3 missions
    for (int i = 0; i < missions.length - 2; i++) {
      for (int j = i + 1; j < missions.length - 1; j++) {
        for (int k = j + 1; k < missions.length; k++) {
          combinations.add([missions[i], missions[j], missions[k]]);
        }
      }
    }

    return combinations;
  }

  /// Calculate optimal order for missions to minimize backtracking
  static List<Mission> optimizeOrder({
    required List<Mission> missions,
    required double riderLat,
    required double riderLng,
  }) {
    if (missions.length != CHAIN_SIZE) return missions;

    // Try all permutations (3! = 6 permutations)
    final permutations = _generatePermutations(missions);
    double bestDistance = double.infinity;
    List<Mission> bestOrder = missions;

    for (var perm in permutations) {
      final distance = _calculateRouteDistance(
        missions: perm,
        startLat: riderLat,
        startLng: riderLng,
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        bestOrder = perm;
      }
    }

    return bestOrder;
  }

  /// Generate all permutations of missions
  static List<List<Mission>> _generatePermutations(List<Mission> missions) {
    if (missions.length <= 1) return [missions];

    final permutations = <List<Mission>>[];

    for (int i = 0; i < missions.length; i++) {
      final remaining = List<Mission>.from(missions);
      final current = remaining.removeAt(i);

      for (var perm in _generatePermutations(remaining)) {
        permutations.add([current, ...perm]);
      }
    }

    return permutations;
  }

  /// Calculate total distance for a route
  static double _calculateRouteDistance({
    required List<Mission> missions,
    required double startLat,
    required double startLng,
  }) {
    double totalDistance = 0;
    double currentLat = startLat;
    double currentLng = startLng;

    for (var mission in missions) {
      // Distance to pickup
      totalDistance += calculateDistance(
        currentLat,
        currentLng,
        mission.pickupLat,
        mission.pickupLng,
      );

      // Distance from pickup to delivery
      totalDistance += calculateDistance(
        mission.pickupLat,
        mission.pickupLng,
        mission.deliveryLat,
        mission.deliveryLng,
      );

      // Update current position
      currentLat = mission.deliveryLat;
      currentLng = mission.deliveryLng;
    }

    return totalDistance;
  }

  /// Calculate direct distance (if missions done separately)
  static double calculateDirectDistance({
    required List<Mission> missions,
    required double riderLat,
    required double riderLng,
  }) {
    double totalDistance = 0;

    for (var mission in missions) {
      // Distance from rider to pickup
      totalDistance += calculateDistance(
        riderLat,
        riderLng,
        mission.pickupLat,
        mission.pickupLng,
      );

      // Distance from pickup to delivery
      totalDistance += calculateDistance(
        mission.pickupLat,
        mission.pickupLng,
        mission.deliveryLat,
        mission.deliveryLng,
      );

      // Distance back to rider location (for next mission)
      totalDistance += calculateDistance(
        mission.deliveryLat,
        mission.deliveryLng,
        riderLat,
        riderLng,
      );
    }

    return totalDistance;
  }

  /// Calculate backtracking penalty
  static double calculateBacktrackingPenalty({
    required double totalDistance,
    required double directDistance,
  }) {
    return totalDistance - directDistance;
  }

  /// Calculate efficiency score (0.0-1.0)
  static double calculateEfficiencyScore({
    required double totalDistance,
    required double directDistance,
  }) {
    if (directDistance == 0) return 0;

    final penalty = calculateBacktrackingPenalty(
      totalDistance: totalDistance,
      directDistance: directDistance,
    );

    final penaltyRatio = penalty / directDistance;

    // Score decreases as penalty increases
    // 0% penalty = 1.0 score
    // 30% penalty = 0.0 score
    final score = 1.0 - (penaltyRatio / MAX_BACKTRACK_PENALTY);

    return max(0.0, min(1.0, score));
  }

  /// Calculate estimated time for chain
  static int calculateEstimatedTime({
    required double totalDistance,
    required List<Mission> missions,
  }) {
    // Average speed: 20 km/h in city
    final travelMinutes = (totalDistance / 1000) / 20 * 60;

    // Add pickup/delivery time (5 min each)
    final stopMinutes = missions.length * 2 * 5;

    return (travelMinutes + stopMinutes).ceil();
  }

  /// Calculate bonus amount (15% of total earnings)
  static double calculateBonus(double totalEarnings) {
    return totalEarnings * BONUS_PERCENTAGE;
  }

  /// Create mission chain from missions
  static MissionChain createChain({
    required List<Mission> missions,
    required double riderLat,
    required double riderLng,
  }) {
    // Optimize order
    final optimizedMissions = optimizeOrder(
      missions: missions,
      riderLat: riderLat,
      riderLng: riderLng,
    );

    // Calculate distances
    final totalDistance = _calculateRouteDistance(
      missions: optimizedMissions,
      startLat: riderLat,
      startLng: riderLng,
    );

    final directDistance = calculateDirectDistance(
      missions: optimizedMissions,
      riderLat: riderLat,
      riderLng: riderLng,
    );

    final backtrackingPenalty = calculateBacktrackingPenalty(
      totalDistance: totalDistance,
      directDistance: directDistance,
    );

    final efficiencyScore = calculateEfficiencyScore(
      totalDistance: totalDistance,
      directDistance: directDistance,
    );

    // Calculate earnings
    final totalEarnings = optimizedMissions.fold<double>(
      0,
      (sum, mission) => sum + mission.reward,
    );

    final bonusAmount = calculateBonus(totalEarnings);
    final totalWithBonus = totalEarnings + bonusAmount;

    // Calculate time
    final estimatedMinutes = calculateEstimatedTime(
      totalDistance: totalDistance,
      missions: optimizedMissions,
    );

    return MissionChain(
      id: 'chain_${DateTime.now().millisecondsSinceEpoch}',
      missions: optimizedMissions,
      totalDistance: totalDistance,
      directDistance: directDistance,
      backtrackingPenalty: backtrackingPenalty,
      estimatedMinutes: estimatedMinutes,
      totalEarnings: totalEarnings,
      bonusAmount: bonusAmount,
      totalWithBonus: totalWithBonus,
      efficiencyScore: efficiencyScore,
      expiresAt: DateTime.now().add(Duration(minutes: CHAIN_EXPIRY_MINUTES)),
    );
  }

  /// Generate all possible chains and rank by efficiency
  static List<MissionChain> generateChains({
    required List<Mission> availableMissions,
    required double riderLat,
    required double riderLng,
    int maxChains = 5,
  }) {
    if (availableMissions.length < CHAIN_SIZE) return [];

    // Generate combinations
    final combinations = generateCombinations(availableMissions);

    // Create chains
    final chains = combinations.map((missions) {
      return createChain(
        missions: missions,
        riderLat: riderLat,
        riderLng: riderLng,
      );
    }).toList();

    // Filter by efficiency (only show chains with score > 0.5)
    final efficientChains = chains.where((c) => c.efficiencyScore > 0.5).toList();

    // Sort by efficiency score
    efficientChains.sort((a, b) => b.efficiencyScore.compareTo(a.efficiencyScore));

    // Return top chains
    return efficientChains.take(maxChains).toList();
  }

  /// Build route waypoints for visualization
  static OptimizedRoute buildRoute({
    required MissionChain chain,
    required double riderLat,
    required double riderLng,
  }) {
    final waypoints = <RouteWaypoint>[];

    // Start point
    waypoints.add(RouteWaypoint(
      latitude: riderLat,
      longitude: riderLng,
      label: 'Start',
      type: WaypointType.start,
    ));

    // Add pickup and delivery for each mission
    for (int i = 0; i < chain.missions.length; i++) {
      final mission = chain.missions[i];

      waypoints.add(RouteWaypoint(
        latitude: mission.pickupLat,
        longitude: mission.pickupLng,
        label: 'Pickup ${i + 1}',
        type: WaypointType.pickup,
        missionIndex: i,
      ));

      waypoints.add(RouteWaypoint(
        latitude: mission.deliveryLat,
        longitude: mission.deliveryLng,
        label: 'Delivery ${i + 1}',
        type: WaypointType.delivery,
        missionIndex: i,
      ));
    }

    // Build simple polyline (straight lines between waypoints)
    final polyline = <List<double>>[];
    for (var waypoint in waypoints) {
      polyline.add([waypoint.latitude, waypoint.longitude]);
    }

    return OptimizedRoute(
      waypoints: waypoints,
      polyline: polyline,
      totalDistance: chain.totalDistance,
      estimatedMinutes: chain.estimatedMinutes,
    );
  }

  /// Accept chain (all-or-nothing)
  static MissionChain acceptChain(MissionChain chain) {
    return chain.copyWith(
      isAccepted: true,
      acceptedAt: DateTime.now(),
    );
  }

  /// Complete mission in chain
  static MissionChain completeMission(MissionChain chain) {
    final newCompleted = chain.completedMissions + 1;
    final isCompleted = newCompleted >= chain.missions.length;

    return chain.copyWith(
      completedMissions: newCompleted,
      isCompleted: isCompleted,
      completedAt: isCompleted ? DateTime.now() : null,
    );
  }

  /// Check if chain should be cancelled (expired or mission unavailable)
  static bool shouldCancelChain(MissionChain chain) {
    if (!chain.isValid) return true;
    // Add more checks (e.g., mission cancelled)
    return false;
  }
}
