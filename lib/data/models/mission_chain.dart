// Mission Chain Models
// Task 10.1: Create mission chain models

import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/mission.dart';

/// A chain of 3 missions optimized for efficient delivery
class MissionChain {
  final String id;
  final List<Mission> missions; // Always 3 missions
  final double totalDistance; // Total route distance in meters
  final double directDistance; // Direct distance if done separately
  final double backtrackingPenalty; // Extra distance due to backtracking
  final int estimatedMinutes; // Total estimated time
  final double totalEarnings; // Base earnings from all missions
  final double bonusAmount; // 15% bonus
  final double totalWithBonus; // Total including bonus
  final double efficiencyScore; // 0.0-1.0 (higher is better)
  final DateTime expiresAt; // Chain expires if not accepted
  final bool isAccepted;
  final DateTime? acceptedAt;
  final int completedMissions; // 0-3
  final bool isCompleted;
  final DateTime? completedAt;

  MissionChain({
    required this.id,
    required this.missions,
    required this.totalDistance,
    required this.directDistance,
    required this.backtrackingPenalty,
    required this.estimatedMinutes,
    required this.totalEarnings,
    required this.bonusAmount,
    required this.totalWithBonus,
    required this.efficiencyScore,
    required this.expiresAt,
    this.isAccepted = false,
    this.acceptedAt,
    this.completedMissions = 0,
    this.isCompleted = false,
    this.completedAt,
  });

  /// Check if chain is still valid
  bool get isValid => DateTime.now().isBefore(expiresAt) && !isCompleted;

  /// Check if chain is efficient (low backtracking)
  bool get isEfficient => efficiencyScore > 0.7;

  /// Get distance saved compared to doing missions separately
  double get distanceSaved => directDistance - totalDistance;

  /// Get percentage of distance saved
  double get distanceSavedPercent => (distanceSaved / directDistance) * 100;

  /// Get next mission to complete
  Mission? get nextMission {
    if (completedMissions >= missions.length) return null;
    return missions[completedMissions];
  }

  /// Get progress percentage
  double get progressPercent => (completedMissions / missions.length) * 100;

  /// Get color based on efficiency
  Color get efficiencyColor {
    if (efficiencyScore >= 0.8) return Colors.green;
    if (efficiencyScore >= 0.6) return Colors.orange;
    return Colors.red;
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'missions': missions.map((m) => m.toJson()).toList(),
        'totalDistance': totalDistance,
        'directDistance': directDistance,
        'backtrackingPenalty': backtrackingPenalty,
        'estimatedMinutes': estimatedMinutes,
        'totalEarnings': totalEarnings,
        'bonusAmount': bonusAmount,
        'totalWithBonus': totalWithBonus,
        'efficiencyScore': efficiencyScore,
        'expiresAt': expiresAt.toIso8601String(),
        'isAccepted': isAccepted,
        'acceptedAt': acceptedAt?.toIso8601String(),
        'completedMissions': completedMissions,
        'isCompleted': isCompleted,
        'completedAt': completedAt?.toIso8601String(),
      };

  factory MissionChain.fromJson(Map<String, dynamic> json) => MissionChain(
        id: json['id'],
        missions: (json['missions'] as List)
            .map((m) => Mission.fromJson(m))
            .toList(),
        totalDistance: json['totalDistance'],
        directDistance: json['directDistance'],
        backtrackingPenalty: json['backtrackingPenalty'],
        estimatedMinutes: json['estimatedMinutes'],
        totalEarnings: json['totalEarnings'],
        bonusAmount: json['bonusAmount'],
        totalWithBonus: json['totalWithBonus'],
        efficiencyScore: json['efficiencyScore'],
        expiresAt: DateTime.parse(json['expiresAt']),
        isAccepted: json['isAccepted'] ?? false,
        acceptedAt: json['acceptedAt'] != null
            ? DateTime.parse(json['acceptedAt'])
            : null,
        completedMissions: json['completedMissions'] ?? 0,
        isCompleted: json['isCompleted'] ?? false,
        completedAt: json['completedAt'] != null
            ? DateTime.parse(json['completedAt'])
            : null,
      );

  /// Create a copy with updated fields
  MissionChain copyWith({
    String? id,
    List<Mission>? missions,
    double? totalDistance,
    double? directDistance,
    double? backtrackingPenalty,
    int? estimatedMinutes,
    double? totalEarnings,
    double? bonusAmount,
    double? totalWithBonus,
    double? efficiencyScore,
    DateTime? expiresAt,
    bool? isAccepted,
    DateTime? acceptedAt,
    int? completedMissions,
    bool? isCompleted,
    DateTime? completedAt,
  }) {
    return MissionChain(
      id: id ?? this.id,
      missions: missions ?? this.missions,
      totalDistance: totalDistance ?? this.totalDistance,
      directDistance: directDistance ?? this.directDistance,
      backtrackingPenalty: backtrackingPenalty ?? this.backtrackingPenalty,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      totalEarnings: totalEarnings ?? this.totalEarnings,
      bonusAmount: bonusAmount ?? this.bonusAmount,
      totalWithBonus: totalWithBonus ?? this.totalWithBonus,
      efficiencyScore: efficiencyScore ?? this.efficiencyScore,
      expiresAt: expiresAt ?? this.expiresAt,
      isAccepted: isAccepted ?? this.isAccepted,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      completedMissions: completedMissions ?? this.completedMissions,
      isCompleted: isCompleted ?? this.isCompleted,
      completedAt: completedAt ?? this.completedAt,
    );
  }
}

/// Route waypoint for visualization
class RouteWaypoint {
  final double latitude;
  final double longitude;
  final String label; // "Start", "Pickup 1", "Delivery 1", etc.
  final WaypointType type;
  final int? missionIndex; // Which mission this belongs to

  RouteWaypoint({
    required this.latitude,
    required this.longitude,
    required this.label,
    required this.type,
    this.missionIndex,
  });

  Map<String, dynamic> toJson() => {
        'latitude': latitude,
        'longitude': longitude,
        'label': label,
        'type': type.name,
        'missionIndex': missionIndex,
      };

  factory RouteWaypoint.fromJson(Map<String, dynamic> json) => RouteWaypoint(
        latitude: json['latitude'],
        longitude: json['longitude'],
        label: json['label'],
        type: WaypointType.values.firstWhere((e) => e.name == json['type']),
        missionIndex: json['missionIndex'],
      );
}

enum WaypointType {
  start, // Rider's current location
  pickup, // Pickup location
  delivery, // Delivery location
  end, // Final destination
}

/// Optimized route for a mission chain
class OptimizedRoute {
  final List<RouteWaypoint> waypoints;
  final List<List<double>> polyline; // List of [lat, lng] points
  final double totalDistance;
  final int estimatedMinutes;

  OptimizedRoute({
    required this.waypoints,
    required this.polyline,
    required this.totalDistance,
    required this.estimatedMinutes,
  });

  Map<String, dynamic> toJson() => {
        'waypoints': waypoints.map((w) => w.toJson()).toList(),
        'polyline': polyline,
        'totalDistance': totalDistance,
        'estimatedMinutes': estimatedMinutes,
      };

  factory OptimizedRoute.fromJson(Map<String, dynamic> json) => OptimizedRoute(
        waypoints: (json['waypoints'] as List)
            .map((w) => RouteWaypoint.fromJson(w))
            .toList(),
        polyline: (json['polyline'] as List)
            .map((p) => List<double>.from(p))
            .toList(),
        totalDistance: json['totalDistance'],
        estimatedMinutes: json['estimatedMinutes'],
      );
}
