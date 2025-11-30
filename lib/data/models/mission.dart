import 'package:flutter/material.dart';

enum MissionStatus {
  available,
  accepted,
  pickedUp,
  completed,
  cancelled,
}

class Mission {
  final String id;
  final String orderId;
  final String restaurantName;
  final String restaurantAddress;
  final double pickupLatitude;
  final double pickupLongitude;
  final String customerName;
  final String customerPhone;
  final String deliveryAddress;
  final double deliveryLatitude;
  final double deliveryLongitude;
  final List<String> items;
  final double reward;
  final double distance;
  final int estimatedMinutes;
  final String otp;
  final MissionStatus status;
  final DateTime createdAt;

  Mission({
    required this.id,
    required this.orderId,
    required this.restaurantName,
    required this.restaurantAddress,
    required this.pickupLatitude,
    required this.pickupLongitude,
    required this.customerName,
    required this.customerPhone,
    required this.deliveryAddress,
    required this.deliveryLatitude,
    required this.deliveryLongitude,
    required this.items,
    required this.reward,
    required this.distance,
    required this.estimatedMinutes,
    required this.otp,
    required this.status,
    required this.createdAt,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderId': orderId,
        'restaurantName': restaurantName,
        'restaurantAddress': restaurantAddress,
        'pickupLatitude': pickupLatitude,
        'pickupLongitude': pickupLongitude,
        'customerName': customerName,
        'customerPhone': customerPhone,
        'deliveryAddress': deliveryAddress,
        'deliveryLatitude': deliveryLatitude,
        'deliveryLongitude': deliveryLongitude,
        'items': items,
        'reward': reward,
        'distance': distance,
        'estimatedMinutes': estimatedMinutes,
        'otp': otp,
        'status': status.name,
        'createdAt': createdAt.toIso8601String(),
      };

  factory Mission.fromJson(Map<String, dynamic> json) => Mission(
        id: json['id'],
        orderId: json['orderId'],
        restaurantName: json['restaurantName'],
        restaurantAddress: json['restaurantAddress'],
        pickupLatitude: json['pickupLatitude'],
        pickupLongitude: json['pickupLongitude'],
        customerName: json['customerName'],
        customerPhone: json['customerPhone'],
        deliveryAddress: json['deliveryAddress'],
        deliveryLatitude: json['deliveryLatitude'],
        deliveryLongitude: json['deliveryLongitude'],
        items: List<String>.from(json['items']),
        reward: json['reward'],
        distance: json['distance'],
        estimatedMinutes: json['estimatedMinutes'],
        otp: json['otp'],
        status: MissionStatus.values.firstWhere((e) => e.name == json['status']),
        createdAt: DateTime.parse(json['createdAt']),
      );
}
