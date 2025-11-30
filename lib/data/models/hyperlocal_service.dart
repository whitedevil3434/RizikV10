// Hyperlocal Services Marketplace Models
// Task 9.1: Create service data models

import 'package:flutter/material.dart';

/// Type of hyperlocal service
enum ServiceType {
  cleaning, // House cleaning
  cooking, // Meal preparation
  tutoring, // Academic tutoring
  repair, // Home repairs
  delivery, // Local delivery
  shopping, // Shopping assistance
  childcare, // Babysitting
  eldercare, // Elder care
  petcare, // Pet sitting/walking
  laundry, // Laundry service
  gardening, // Garden maintenance
  tech, // Tech support
  beauty, // Beauty services
  fitness, // Personal training
  other, // Other services
}

/// Service availability status
enum ServiceStatus {
  active, // Currently available
  paused, // Temporarily unavailable
  booked, // Currently booked
  completed, // Service completed
  cancelled, // Service cancelled
}

/// Booking status
enum BookingStatus {
  pending, // Awaiting provider confirmation
  confirmed, // Provider confirmed
  inProgress, // Service in progress
  completed, // Service completed
  cancelled, // Booking cancelled
  disputed, // Dispute filed
}

/// A hyperlocal service offered by a provider
class HyperlocalService {
  final String id;
  final String providerId;
  final String providerName;
  final String providerPhone;
  final double providerTrustScore;
  final ServiceType type;
  final String title;
  final String titleBn;
  final String description;
  final String descriptionBn;
  final double pricePerHour; // BDT per hour
  final double? fixedPrice; // BDT for fixed-price services
  final int estimatedDuration; // minutes
  final double latitude;
  final double longitude;
  final String address;
  final String building; // Building/area name
  final double radius; // Service radius in meters (max 500m)
  final List<String> skills; // Required skills
  final List<String> photos; // Service photos
  final ServiceStatus status;
  final DateTime createdAt;
  final DateTime? availableFrom;
  final DateTime? availableUntil;
  final int completedBookings;
  final double rating; // 0.0-5.0
  final int reviewCount;

  HyperlocalService({
    required this.id,
    required this.providerId,
    required this.providerName,
    required this.providerPhone,
    required this.providerTrustScore,
    required this.type,
    required this.title,
    required this.titleBn,
    required this.description,
    required this.descriptionBn,
    required this.pricePerHour,
    this.fixedPrice,
    required this.estimatedDuration,
    required this.latitude,
    required this.longitude,
    required this.address,
    required this.building,
    this.radius = 500,
    this.skills = const [],
    this.photos = const [],
    this.status = ServiceStatus.active,
    required this.createdAt,
    this.availableFrom,
    this.availableUntil,
    this.completedBookings = 0,
    this.rating = 0.0,
    this.reviewCount = 0,
  });

  /// Check if service is currently available
  bool get isAvailable {
    if (status != ServiceStatus.active) return false;
    final now = DateTime.now();
    if (availableFrom != null && now.isBefore(availableFrom!)) return false;
    if (availableUntil != null && now.isAfter(availableUntil!)) return false;
    return true;
  }

  /// Check if service is in same building
  bool isSameBuilding(String userBuilding) {
    return building.toLowerCase() == userBuilding.toLowerCase();
  }

  /// Get icon for service type
  IconData get icon {
    switch (type) {
      case ServiceType.cleaning:
        return Icons.cleaning_services;
      case ServiceType.cooking:
        return Icons.restaurant;
      case ServiceType.tutoring:
        return Icons.school;
      case ServiceType.repair:
        return Icons.build;
      case ServiceType.delivery:
        return Icons.delivery_dining;
      case ServiceType.shopping:
        return Icons.shopping_cart;
      case ServiceType.childcare:
        return Icons.child_care;
      case ServiceType.eldercare:
        return Icons.elderly;
      case ServiceType.petcare:
        return Icons.pets;
      case ServiceType.laundry:
        return Icons.local_laundry_service;
      case ServiceType.gardening:
        return Icons.yard;
      case ServiceType.tech:
        return Icons.computer;
      case ServiceType.beauty:
        return Icons.face;
      case ServiceType.fitness:
        return Icons.fitness_center;
      case ServiceType.other:
        return Icons.handyman;
    }
  }

  /// Get color for service type
  Color get color {
    switch (type) {
      case ServiceType.cleaning:
        return Colors.blue;
      case ServiceType.cooking:
        return Colors.orange;
      case ServiceType.tutoring:
        return Colors.purple;
      case ServiceType.repair:
        return Colors.brown;
      case ServiceType.delivery:
        return Colors.green;
      case ServiceType.shopping:
        return Colors.teal;
      case ServiceType.childcare:
        return Colors.pink;
      case ServiceType.eldercare:
        return Colors.indigo;
      case ServiceType.petcare:
        return Colors.amber;
      case ServiceType.laundry:
        return Colors.cyan;
      case ServiceType.gardening:
        return Colors.lightGreen;
      case ServiceType.tech:
        return Colors.blueGrey;
      case ServiceType.beauty:
        return Colors.pinkAccent;
      case ServiceType.fitness:
        return Colors.red;
      case ServiceType.other:
        return Colors.grey;
    }
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'providerId': providerId,
        'providerName': providerName,
        'providerPhone': providerPhone,
        'providerTrustScore': providerTrustScore,
        'type': type.name,
        'title': title,
        'titleBn': titleBn,
        'description': description,
        'descriptionBn': descriptionBn,
        'pricePerHour': pricePerHour,
        'fixedPrice': fixedPrice,
        'estimatedDuration': estimatedDuration,
        'latitude': latitude,
        'longitude': longitude,
        'address': address,
        'building': building,
        'radius': radius,
        'skills': skills,
        'photos': photos,
        'status': status.name,
        'createdAt': createdAt.toIso8601String(),
        'availableFrom': availableFrom?.toIso8601String(),
        'availableUntil': availableUntil?.toIso8601String(),
        'completedBookings': completedBookings,
        'rating': rating,
        'reviewCount': reviewCount,
      };

  factory HyperlocalService.fromJson(Map<String, dynamic> json) =>
      HyperlocalService(
        id: json['id'],
        providerId: json['providerId'],
        providerName: json['providerName'],
        providerPhone: json['providerPhone'],
        providerTrustScore: json['providerTrustScore'],
        type: ServiceType.values.firstWhere((e) => e.name == json['type']),
        title: json['title'],
        titleBn: json['titleBn'],
        description: json['description'],
        descriptionBn: json['descriptionBn'],
        pricePerHour: json['pricePerHour'],
        fixedPrice: json['fixedPrice'],
        estimatedDuration: json['estimatedDuration'],
        latitude: json['latitude'],
        longitude: json['longitude'],
        address: json['address'],
        building: json['building'],
        radius: json['radius'] ?? 500,
        skills: List<String>.from(json['skills'] ?? []),
        photos: List<String>.from(json['photos'] ?? []),
        status: ServiceStatus.values.firstWhere((e) => e.name == json['status']),
        createdAt: DateTime.parse(json['createdAt']),
        availableFrom: json['availableFrom'] != null
            ? DateTime.parse(json['availableFrom'])
            : null,
        availableUntil: json['availableUntil'] != null
            ? DateTime.parse(json['availableUntil'])
            : null,
        completedBookings: json['completedBookings'] ?? 0,
        rating: json['rating'] ?? 0.0,
        reviewCount: json['reviewCount'] ?? 0,
      );
}

/// A booking for a hyperlocal service
class ServiceBooking {
  final String id;
  final String serviceId;
  final String providerId;
  final String consumerId;
  final String consumerName;
  final String consumerPhone;
  final DateTime scheduledTime;
  final int duration; // minutes
  final double totalPrice;
  final String location;
  final String? specialInstructions;
  final BookingStatus status;
  final DateTime createdAt;
  final DateTime? confirmedAt;
  final DateTime? startedAt;
  final DateTime? completedAt;
  final DateTime? cancelledAt;
  final String? cancellationReason;
  final double? escrowAmount; // Amount held in escrow
  final bool escrowReleased;
  final double? rating; // Consumer rating of service
  final String? review;

  ServiceBooking({
    required this.id,
    required this.serviceId,
    required this.providerId,
    required this.consumerId,
    required this.consumerName,
    required this.consumerPhone,
    required this.scheduledTime,
    required this.duration,
    required this.totalPrice,
    required this.location,
    this.specialInstructions,
    this.status = BookingStatus.pending,
    required this.createdAt,
    this.confirmedAt,
    this.startedAt,
    this.completedAt,
    this.cancelledAt,
    this.cancellationReason,
    this.escrowAmount,
    this.escrowReleased = false,
    this.rating,
    this.review,
  });

  /// Check if booking can be cancelled
  bool get canCancel {
    return status == BookingStatus.pending || status == BookingStatus.confirmed;
  }

  /// Check if booking can be started
  bool get canStart {
    return status == BookingStatus.confirmed &&
        DateTime.now().isAfter(scheduledTime.subtract(Duration(minutes: 15)));
  }

  /// Check if booking can be completed
  bool get canComplete {
    return status == BookingStatus.inProgress;
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'serviceId': serviceId,
        'providerId': providerId,
        'consumerId': consumerId,
        'consumerName': consumerName,
        'consumerPhone': consumerPhone,
        'scheduledTime': scheduledTime.toIso8601String(),
        'duration': duration,
        'totalPrice': totalPrice,
        'location': location,
        'specialInstructions': specialInstructions,
        'status': status.name,
        'createdAt': createdAt.toIso8601String(),
        'confirmedAt': confirmedAt?.toIso8601String(),
        'startedAt': startedAt?.toIso8601String(),
        'completedAt': completedAt?.toIso8601String(),
        'cancelledAt': cancelledAt?.toIso8601String(),
        'cancellationReason': cancellationReason,
        'escrowAmount': escrowAmount,
        'escrowReleased': escrowReleased,
        'rating': rating,
        'review': review,
      };

  factory ServiceBooking.fromJson(Map<String, dynamic> json) => ServiceBooking(
        id: json['id'],
        serviceId: json['serviceId'],
        providerId: json['providerId'],
        consumerId: json['consumerId'],
        consumerName: json['consumerName'],
        consumerPhone: json['consumerPhone'],
        scheduledTime: DateTime.parse(json['scheduledTime']),
        duration: json['duration'],
        totalPrice: json['totalPrice'],
        location: json['location'],
        specialInstructions: json['specialInstructions'],
        status: BookingStatus.values.firstWhere((e) => e.name == json['status']),
        createdAt: DateTime.parse(json['createdAt']),
        confirmedAt: json['confirmedAt'] != null
            ? DateTime.parse(json['confirmedAt'])
            : null,
        startedAt:
            json['startedAt'] != null ? DateTime.parse(json['startedAt']) : null,
        completedAt: json['completedAt'] != null
            ? DateTime.parse(json['completedAt'])
            : null,
        cancelledAt: json['cancelledAt'] != null
            ? DateTime.parse(json['cancelledAt'])
            : null,
        cancellationReason: json['cancellationReason'],
        escrowAmount: json['escrowAmount'],
        escrowReleased: json['escrowReleased'] ?? false,
        rating: json['rating'],
        review: json['review'],
      );
}
