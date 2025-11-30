import 'package:flutter/material.dart';

/// Types of opportunities available in Co-Pilot
enum OpportunityType {
  delivery('delivery', 'Delivery', 'ডেলিভারি', '📦', Color(0xFF00C853)),
  pickup('pickup', 'Pickup', 'পিকআপ', '🛍️', Color(0xFFFF9800)),
  service('service', 'Service', 'সেবা', '🔧', Color(0xFF2196F3)),
  errand('errand', 'Errand', 'কাজ', '🏃', Color(0xFF9C27B0)),
  teaching('teaching', 'Teaching', 'শিক্ষা', '📚', Color(0xFFE91E63)),
  shopping('shopping', 'Shopping', 'কেনাকাটা', '🛒', Color(0xFF00BCD4));

  const OpportunityType(this.key, this.nameEn, this.nameBn, this.emoji, this.color);
  
  final String key;
  final String nameEn;
  final String nameBn;
  final String emoji;
  final Color color;
}

/// User's current context for opportunity matching
@immutable
class UserContext {
  final String userId;
  final double latitude;
  final double longitude;
  final String activity; // 'walking', 'idle', 'driving', 'stationary'
  final bool isIdle;
  final DateTime timestamp;
  final double? destinationLat;
  final double? destinationLng;
  final int? availableMinutes; // How much time user has
  final List<String> skills; // User's skills for matching
  final String currentRole; // 'consumer', 'partner', 'rider'

  const UserContext({
    required this.userId,
    required this.latitude,
    required this.longitude,
    required this.activity,
    required this.isIdle,
    required this.timestamp,
    this.destinationLat,
    this.destinationLng,
    this.availableMinutes,
    this.skills = const [],
    this.currentRole = 'consumer',
  });

  /// Calculate if user is moving
  bool get isMoving => activity == 'walking' || activity == 'driving';

  /// Check if user has a destination
  bool get hasDestination => destinationLat != null && destinationLng != null;

  UserContext copyWith({
    String? userId,
    double? latitude,
    double? longitude,
    String? activity,
    bool? isIdle,
    DateTime? timestamp,
    double? destinationLat,
    double? destinationLng,
    int? availableMinutes,
    List<String>? skills,
    String? currentRole,
  }) {
    return UserContext(
      userId: userId ?? this.userId,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      activity: activity ?? this.activity,
      isIdle: isIdle ?? this.isIdle,
      timestamp: timestamp ?? this.timestamp,
      destinationLat: destinationLat ?? this.destinationLat,
      destinationLng: destinationLng ?? this.destinationLng,
      availableMinutes: availableMinutes ?? this.availableMinutes,
      skills: skills ?? this.skills,
      currentRole: currentRole ?? this.currentRole,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'user_id': userId,
      'latitude': latitude,
      'longitude': longitude,
      'activity': activity,
      'is_idle': isIdle,
      'timestamp': timestamp.toIso8601String(),
      'destination_lat': destinationLat,
      'destination_lng': destinationLng,
      'available_minutes': availableMinutes,
      'skills': skills,
      'current_role': currentRole,
    };
  }

  factory UserContext.fromJson(Map<String, dynamic> json) {
    return UserContext(
      userId: json['user_id'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      activity: json['activity'] as String,
      isIdle: json['is_idle'] as bool,
      timestamp: DateTime.parse(json['timestamp'] as String),
      destinationLat: json['destination_lat'] != null 
          ? (json['destination_lat'] as num).toDouble() 
          : null,
      destinationLng: json['destination_lng'] != null 
          ? (json['destination_lng'] as num).toDouble() 
          : null,
      availableMinutes: json['available_minutes'] as int?,
      skills: (json['skills'] as List<dynamic>?)?.cast<String>() ?? [],
      currentRole: json['current_role'] as String? ?? 'consumer',
    );
  }
}

/// An opportunity that appears to the user
@immutable
class Opportunity {
  final String id;
  final OpportunityType type;
  final String title;
  final String titleBn;
  final String description;
  final String descriptionBn;
  final double pickupLat;
  final double pickupLng;
  final String pickupAddress;
  final double? deliveryLat;
  final double? deliveryLng;
  final String? deliveryAddress;
  final double earning; // Amount user will earn
  final int estimatedMinutes; // Time to complete
  final double distanceKm; // Distance from user's current location
  final double? detourKm; // Extra distance if user has destination
  final DateTime expiresAt;
  final String requiredRole; // 'rider', 'partner', 'any'
  final List<String>? requiredSkills;
  final int difficultyLevel; // 1-5
  final double relevanceScore; // 0-100, how relevant to user's context
  final Map<String, dynamic>? metadata; // Additional data

  const Opportunity({
    required this.id,
    required this.type,
    required this.title,
    required this.titleBn,
    required this.description,
    required this.descriptionBn,
    required this.pickupLat,
    required this.pickupLng,
    required this.pickupAddress,
    this.deliveryLat,
    this.deliveryLng,
    this.deliveryAddress,
    required this.earning,
    required this.estimatedMinutes,
    required this.distanceKm,
    this.detourKm,
    required this.expiresAt,
    this.requiredRole = 'any',
    this.requiredSkills,
    this.difficultyLevel = 1,
    this.relevanceScore = 50.0,
    this.metadata,
  });

  /// Check if opportunity is still valid
  bool get isValid => DateTime.now().isBefore(expiresAt);

  /// Check if opportunity is on user's path (detour < 300m)
  bool get isOnPath => detourKm != null && detourKm! < 0.3;

  /// Calculate earnings per minute
  double get earningsPerMinute => earning / estimatedMinutes;

  /// Get display text for distance
  String get distanceText {
    if (distanceKm < 1) {
      return '${(distanceKm * 1000).toInt()}m away';
    }
    return '${distanceKm.toStringAsFixed(1)}km away';
  }

  String get distanceTextBn {
    if (distanceKm < 1) {
      return '${(distanceKm * 1000).toInt()}মি দূরে';
    }
    return '${distanceKm.toStringAsFixed(1)}কিমি দূরে';
  }

  /// Get display text for time
  String get timeText {
    if (estimatedMinutes < 60) {
      return '$estimatedMinutes mins';
    }
    final hours = estimatedMinutes ~/ 60;
    final mins = estimatedMinutes % 60;
    return '${hours}h ${mins}m';
  }

  String get timeTextBn {
    if (estimatedMinutes < 60) {
      return '$estimatedMinutes মিনিট';
    }
    final hours = estimatedMinutes ~/ 60;
    final mins = estimatedMinutes % 60;
    return '${hours}ঘ ${mins}মি';
  }

  Opportunity copyWith({
    String? id,
    OpportunityType? type,
    String? title,
    String? titleBn,
    String? description,
    String? descriptionBn,
    double? pickupLat,
    double? pickupLng,
    String? pickupAddress,
    double? deliveryLat,
    double? deliveryLng,
    String? deliveryAddress,
    double? earning,
    int? estimatedMinutes,
    double? distanceKm,
    double? detourKm,
    DateTime? expiresAt,
    String? requiredRole,
    List<String>? requiredSkills,
    int? difficultyLevel,
    double? relevanceScore,
    Map<String, dynamic>? metadata,
  }) {
    return Opportunity(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      titleBn: titleBn ?? this.titleBn,
      description: description ?? this.description,
      descriptionBn: descriptionBn ?? this.descriptionBn,
      pickupLat: pickupLat ?? this.pickupLat,
      pickupLng: pickupLng ?? this.pickupLng,
      pickupAddress: pickupAddress ?? this.pickupAddress,
      deliveryLat: deliveryLat ?? this.deliveryLat,
      deliveryLng: deliveryLng ?? this.deliveryLng,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      earning: earning ?? this.earning,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      distanceKm: distanceKm ?? this.distanceKm,
      detourKm: detourKm ?? this.detourKm,
      expiresAt: expiresAt ?? this.expiresAt,
      requiredRole: requiredRole ?? this.requiredRole,
      requiredSkills: requiredSkills ?? this.requiredSkills,
      difficultyLevel: difficultyLevel ?? this.difficultyLevel,
      relevanceScore: relevanceScore ?? this.relevanceScore,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.key,
      'title': title,
      'title_bn': titleBn,
      'description': description,
      'description_bn': descriptionBn,
      'pickup_lat': pickupLat,
      'pickup_lng': pickupLng,
      'pickup_address': pickupAddress,
      'delivery_lat': deliveryLat,
      'delivery_lng': deliveryLng,
      'delivery_address': deliveryAddress,
      'earning': earning,
      'estimated_minutes': estimatedMinutes,
      'distance_km': distanceKm,
      'detour_km': detourKm,
      'expires_at': expiresAt.toIso8601String(),
      'required_role': requiredRole,
      'required_skills': requiredSkills,
      'difficulty_level': difficultyLevel,
      'relevance_score': relevanceScore,
      'metadata': metadata,
    };
  }

  factory Opportunity.fromJson(Map<String, dynamic> json) {
    return Opportunity(
      id: json['id'] as String,
      type: OpportunityType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => OpportunityType.delivery,
      ),
      title: json['title'] as String,
      titleBn: json['title_bn'] as String,
      description: json['description'] as String,
      descriptionBn: json['description_bn'] as String,
      pickupLat: (json['pickup_lat'] as num).toDouble(),
      pickupLng: (json['pickup_lng'] as num).toDouble(),
      pickupAddress: json['pickup_address'] as String,
      deliveryLat: json['delivery_lat'] != null 
          ? (json['delivery_lat'] as num).toDouble() 
          : null,
      deliveryLng: json['delivery_lng'] != null 
          ? (json['delivery_lng'] as num).toDouble() 
          : null,
      deliveryAddress: json['delivery_address'] as String?,
      earning: (json['earning'] as num).toDouble(),
      estimatedMinutes: json['estimated_minutes'] as int,
      distanceKm: (json['distance_km'] as num).toDouble(),
      detourKm: json['detour_km'] != null 
          ? (json['detour_km'] as num).toDouble() 
          : null,
      expiresAt: DateTime.parse(json['expires_at'] as String),
      requiredRole: json['required_role'] as String? ?? 'any',
      requiredSkills: (json['required_skills'] as List<dynamic>?)?.cast<String>(),
      difficultyLevel: json['difficulty_level'] as int? ?? 1,
      relevanceScore: (json['relevance_score'] as num?)?.toDouble() ?? 50.0,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Opportunity && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

/// Accepted opportunity with tracking
class AcceptedOpportunity {
  final Opportunity opportunity;
  final DateTime acceptedAt;
  final String temporaryRole; // Role activated for this opportunity
  final String status; // 'accepted', 'in_progress', 'completed', 'cancelled'
  final DateTime? completedAt;

  const AcceptedOpportunity({
    required this.opportunity,
    required this.acceptedAt,
    required this.temporaryRole,
    this.status = 'accepted',
    this.completedAt,
  });

  bool get isActive => status == 'accepted' || status == 'in_progress';
  bool get isCompleted => status == 'completed';

  AcceptedOpportunity copyWith({
    Opportunity? opportunity,
    DateTime? acceptedAt,
    String? temporaryRole,
    String? status,
    DateTime? completedAt,
  }) {
    return AcceptedOpportunity(
      opportunity: opportunity ?? this.opportunity,
      acceptedAt: acceptedAt ?? this.acceptedAt,
      temporaryRole: temporaryRole ?? this.temporaryRole,
      status: status ?? this.status,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'opportunity': opportunity.toJson(),
      'accepted_at': acceptedAt.toIso8601String(),
      'temporary_role': temporaryRole,
      'status': status,
      'completed_at': completedAt?.toIso8601String(),
    };
  }

  factory AcceptedOpportunity.fromJson(Map<String, dynamic> json) {
    return AcceptedOpportunity(
      opportunity: Opportunity.fromJson(json['opportunity'] as Map<String, dynamic>),
      acceptedAt: DateTime.parse(json['accepted_at'] as String),
      temporaryRole: json['temporary_role'] as String,
      status: json['status'] as String? ?? 'accepted',
      completedAt: json['completed_at'] != null 
          ? DateTime.parse(json['completed_at'] as String) 
          : null,
    );
  }
}
