import 'package:flutter/material.dart';

/// Base class for all feed cards
abstract class FeedCard {
  String get id;
  double get heightFactor;
}

enum ServiceType { rizikNow, preOrder }
enum EventCardCategory { opportunity, critical, normal }

class BidComment {
  final String id;
  final String partnerName;
  final String partnerAvatar;
  final double bidAmount;
  final String message;
  final DateTime timestamp;

  BidComment({
    required this.id,
    required this.partnerName,
    required this.partnerAvatar,
    required this.bidAmount,
    required this.message,
    required this.timestamp,
  });
}

class FoodCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String name;
  final String nameBn;
  final String image;
  final double price;
  final double rating;
  final String category;
  final String partnerName;
  final ServiceType serviceType;

  FoodCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.name,
    required this.nameBn,
    required this.image,
    required this.price,
    required this.rating,
    required this.category,
    required this.partnerName,
    this.serviceType = ServiceType.rizikNow,
  });
}

class ReviewCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String userName;
  final String userAvatar;
  final String reviewText;
  final double rating;
  final String foodItem;
  final String date;
  final String foodId;
  final String restaurantName;

  ReviewCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.userName,
    required this.userAvatar,
    required this.reviewText,
    required this.rating,
    required this.foodItem,
    required this.date,
    required this.foodId,
    required this.restaurantName,
  });
}

class EventCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String title;
  final String description;
  final String backgroundImage;
  final DateTime startDate;
  final DateTime endDate;
  final String eventType;
  final String? creatorName;
  final String? creatorAvatar;
  final String? creatorId;
  final double? currentBid;
  final int? bidCount;
  final EventCardCategory category;
  final String? foodImage;
  final bool hasFullThread;
  final List<BidComment> latestBids;

  EventCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.title,
    required this.description,
    required this.backgroundImage,
    required this.startDate,
    required this.endDate,
    required this.eventType,
    this.creatorName,
    this.creatorAvatar,
    this.creatorId,
    this.currentBid,
    this.bidCount,
    this.category = EventCardCategory.normal,
    this.foodImage,
    this.hasFullThread = false,
    this.latestBids = const [],
  });
}

class ShopCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String shopName;
  final String shopImage;
  final double rating;
  final int reviewCount;
  final bool isOpen;
  final String badge;

  ShopCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.shopName,
    required this.shopImage,
    required this.rating,
    required this.reviewCount,
    required this.isOpen,
    required this.badge,
  });
}

class RewardCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String title;
  final String description;
  final String iconUrl;
  final int pointsRequired;
  final DateTime expiryDate;

  RewardCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.title,
    required this.description,
    required this.iconUrl,
    required this.pointsRequired,
    required this.expiryDate,
  });
}

class SquadManagementCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String squadName;
  final int memberCount;
  final double totalEarnings;
  final String status;
  final String alertMessage;

  SquadManagementCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.squadName,
    required this.memberCount,
    required this.totalEarnings,
    required this.status,
    required this.alertMessage,
  });
}

class MealPlanStatusCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String planName;
  final String todayMeal;
  final String tomorrowMeal;
  final bool isPaused;
  final DateTime nextDelivery;
  final String alertMessage;

  MealPlanStatusCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.planName,
    required this.todayMeal,
    required this.tomorrowMeal,
    required this.isPaused,
    required this.nextDelivery,
    required this.alertMessage,
  });
}

class SocialLedgerCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final double amountDue;
  final String dueTo;
  final double amountOwed;
  final String owedFrom;
  final bool hasAlert;

  SocialLedgerCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.amountDue,
    required this.dueTo,
    required this.amountOwed,
    required this.owedFrom,
    required this.hasAlert,
  });
}

class DutyRosterAlertCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String taskName;
  final String assignedTo;
  final DateTime dueDate;
  final bool isOverdue;
  final String completionStatus;
  final String squadId;

  DutyRosterAlertCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.taskName,
    required this.assignedTo,
    required this.dueDate,
    required this.isOverdue,
    required this.completionStatus,
    required this.squadId,
  });
}

class InventoryAlertCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final List<String> lowStockItems;
  final int itemCount;
  final String alertType;
  final String actionText;

  InventoryAlertCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.lowStockItems,
    required this.itemCount,
    required this.alertType,
    required this.actionText,
  });
}

class ActiveOrderAlertCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String orderId;
  final String partnerName;
  final String status;
  final DateTime estimatedDelivery;
  final List<String> items;
  final double totalAmount;

  ActiveOrderAlertCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.orderId,
    required this.partnerName,
    required this.status,
    required this.estimatedDelivery,
    required this.items,
    required this.totalAmount,
  });
}

class AISuggestCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String title;
  final String description;
  final IconData icon;
  final Color accentColor;

  AISuggestCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.title,
    required this.description,
    required this.icon,
    required this.accentColor,
  });
}

class MissionCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;
  final String pickupLocation;
  final String dropoffLocation;
  final double distance;
  final int estimatedTime;
  final double reward;
  final String orderId;

  MissionCardData({
    required this.id,
    this.heightFactor = 1.0,
    required this.pickupLocation,
    required this.dropoffLocation,
    required this.distance,
    required this.estimatedTime,
    required this.reward,
    required this.orderId,
  });
}

class RizikGigCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;

  RizikGigCardData({required this.id, this.heightFactor = 1.0});
}

class PublicBidWonCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;

  PublicBidWonCardData({required this.id, this.heightFactor = 1.0});
}

class RizikBazaarCardData extends FeedCard {
  @override
  final String id;
  @override
  final double heightFactor;

  RizikBazaarCardData({required this.id, this.heightFactor = 1.0});
}
