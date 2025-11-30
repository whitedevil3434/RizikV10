import 'package:flutter/material.dart';

/// Subscription status enum
enum SubscriptionStatus {
  active,
  paused,
  expired,
  cancelled,
}

/// Plan type enum
enum PlanType {
  daily,
  weekly,
  monthly,
  custom,
}

/// Meal time enum
enum MealTime {
  breakfast,
  lunch,
  dinner,
  snack,
}

/// Delivery status enum
enum DeliveryStatus {
  scheduled,
  preparing,
  ready,
  outForDelivery,
  delivered,
  skipped,
  cancelled,
}

/// Spice level enum
enum SpiceLevel {
  none,
  mild,
  medium,
  hot,
  extraHot,
}

/// Meal preferences model
class MealPreferences {
  final SpiceLevel spiceLevel;
  final List<String> allergies;
  final List<String> dislikes;
  final bool vegetarian;
  final bool vegan;
  final bool halal;
  final String? specialInstructions;

  MealPreferences({
    this.spiceLevel = SpiceLevel.medium,
    this.allergies = const [],
    this.dislikes = const [],
    this.vegetarian = false,
    this.vegan = false,
    this.halal = false,
    this.specialInstructions,
  });

  Map<String, dynamic> toJson() => {
    'spiceLevel': spiceLevel.toString(),
    'allergies': allergies,
    'dislikes': dislikes,
    'vegetarian': vegetarian,
    'vegan': vegan,
    'halal': halal,
    'specialInstructions': specialInstructions,
  };

  factory MealPreferences.fromJson(Map<String, dynamic> json) => MealPreferences(
    spiceLevel: SpiceLevel.values.firstWhere(
      (e) => e.toString() == json['spiceLevel'],
      orElse: () => SpiceLevel.medium,
    ),
    allergies: List<String>.from(json['allergies'] ?? []),
    dislikes: List<String>.from(json['dislikes'] ?? []),
    vegetarian: json['vegetarian'] ?? false,
    vegan: json['vegan'] ?? false,
    halal: json['halal'] ?? false,
    specialInstructions: json['specialInstructions'],
  );
}

/// Delivery preferences model
class DeliveryPreferences {
  final String address;
  final String landmark;
  final String phoneNumber;
  final TimeOfDay preferredTime;
  final bool contactlessDelivery;
  final String? deliveryInstructions;

  DeliveryPreferences({
    required this.address,
    required this.landmark,
    required this.phoneNumber,
    required this.preferredTime,
    this.contactlessDelivery = false,
    this.deliveryInstructions,
  });

  Map<String, dynamic> toJson() => {
    'address': address,
    'landmark': landmark,
    'phoneNumber': phoneNumber,
    'preferredTime': '${preferredTime.hour}:${preferredTime.minute}',
    'contactlessDelivery': contactlessDelivery,
    'deliveryInstructions': deliveryInstructions,
  };

  factory DeliveryPreferences.fromJson(Map<String, dynamic> json) {
    final timeParts = (json['preferredTime'] as String).split(':');
    return DeliveryPreferences(
      address: json['address'],
      landmark: json['landmark'],
      phoneNumber: json['phoneNumber'],
      preferredTime: TimeOfDay(
        hour: int.parse(timeParts[0]),
        minute: int.parse(timeParts[1]),
      ),
      contactlessDelivery: json['contactlessDelivery'] ?? false,
      deliveryInstructions: json['deliveryInstructions'],
    );
  }
}

/// Subscription plan model
class SubscriptionPlan {
  final String id;
  final String name;
  final PlanType type;
  final int duration; // in days
  final int mealsPerDay;
  final MealTime mealTime;
  final double pricePerMeal;
  final double totalPrice;
  final List<String> includedItems;
  final bool customizable;
  final int minAdvanceNotice; // hours
  final String? description;

  SubscriptionPlan({
    required this.id,
    required this.name,
    required this.type,
    required this.duration,
    required this.mealsPerDay,
    required this.mealTime,
    required this.pricePerMeal,
    required this.totalPrice,
    this.includedItems = const [],
    this.customizable = true,
    this.minAdvanceNotice = 24,
    this.description,
  });

  int get totalMeals => duration * mealsPerDay;

  Map<String, dynamic> toJson() => {
    'id': id,
    'name': name,
    'type': type.toString(),
    'duration': duration,
    'mealsPerDay': mealsPerDay,
    'mealTime': mealTime.toString(),
    'pricePerMeal': pricePerMeal,
    'totalPrice': totalPrice,
    'includedItems': includedItems,
    'customizable': customizable,
    'minAdvanceNotice': minAdvanceNotice,
    'description': description,
  };

  factory SubscriptionPlan.fromJson(Map<String, dynamic> json) => SubscriptionPlan(
    id: json['id'],
    name: json['name'],
    type: PlanType.values.firstWhere((e) => e.toString() == json['type']),
    duration: json['duration'],
    mealsPerDay: json['mealsPerDay'],
    mealTime: MealTime.values.firstWhere((e) => e.toString() == json['mealTime']),
    pricePerMeal: json['pricePerMeal'].toDouble(),
    totalPrice: json['totalPrice'].toDouble(),
    includedItems: List<String>.from(json['includedItems'] ?? []),
    customizable: json['customizable'] ?? true,
    minAdvanceNotice: json['minAdvanceNotice'] ?? 24,
    description: json['description'],
  );
}

/// Meal delivery model
class MealDelivery {
  final String id;
  final String subscriptionId;
  final DateTime scheduledDate;
  final TimeOfDay scheduledTime;
  final String menuItem;
  final List<String> ingredients;
  final DeliveryStatus status;
  final String? riderId;
  final String? riderName;
  final DateTime? preparedAt;
  final DateTime? deliveredAt;
  final String deliveryAddress;
  final String? deliveryInstructions;
  final double? rating;
  final String? feedback;

  MealDelivery({
    required this.id,
    required this.subscriptionId,
    required this.scheduledDate,
    required this.scheduledTime,
    required this.menuItem,
    this.ingredients = const [],
    this.status = DeliveryStatus.scheduled,
    this.riderId,
    this.riderName,
    this.preparedAt,
    this.deliveredAt,
    required this.deliveryAddress,
    this.deliveryInstructions,
    this.rating,
    this.feedback,
  });

  bool get isScheduled => status == DeliveryStatus.scheduled;
  bool get isPreparing => status == DeliveryStatus.preparing;
  bool get isReady => status == DeliveryStatus.ready;
  bool get isOutForDelivery => status == DeliveryStatus.outForDelivery;
  bool get isDelivered => status == DeliveryStatus.delivered;
  bool get isSkipped => status == DeliveryStatus.skipped;
  bool get isCancelled => status == DeliveryStatus.cancelled;

  MealDelivery copyWith({
    DeliveryStatus? status,
    String? riderId,
    String? riderName,
    DateTime? preparedAt,
    DateTime? deliveredAt,
    double? rating,
    String? feedback,
  }) {
    return MealDelivery(
      id: id,
      subscriptionId: subscriptionId,
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime,
      menuItem: menuItem,
      ingredients: ingredients,
      status: status ?? this.status,
      riderId: riderId ?? this.riderId,
      riderName: riderName ?? this.riderName,
      preparedAt: preparedAt ?? this.preparedAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      deliveryAddress: deliveryAddress,
      deliveryInstructions: deliveryInstructions,
      rating: rating ?? this.rating,
      feedback: feedback ?? this.feedback,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'subscriptionId': subscriptionId,
    'scheduledDate': scheduledDate.toIso8601String(),
    'scheduledTime': '${scheduledTime.hour}:${scheduledTime.minute}',
    'menuItem': menuItem,
    'ingredients': ingredients,
    'status': status.toString(),
    'riderId': riderId,
    'riderName': riderName,
    'preparedAt': preparedAt?.toIso8601String(),
    'deliveredAt': deliveredAt?.toIso8601String(),
    'deliveryAddress': deliveryAddress,
    'deliveryInstructions': deliveryInstructions,
    'rating': rating,
    'feedback': feedback,
  };

  factory MealDelivery.fromJson(Map<String, dynamic> json) {
    final timeParts = (json['scheduledTime'] as String).split(':');
    return MealDelivery(
      id: json['id'],
      subscriptionId: json['subscriptionId'],
      scheduledDate: DateTime.parse(json['scheduledDate']),
      scheduledTime: TimeOfDay(
        hour: int.parse(timeParts[0]),
        minute: int.parse(timeParts[1]),
      ),
      menuItem: json['menuItem'],
      ingredients: List<String>.from(json['ingredients'] ?? []),
      status: DeliveryStatus.values.firstWhere((e) => e.toString() == json['status']),
      riderId: json['riderId'],
      riderName: json['riderName'],
      preparedAt: json['preparedAt'] != null ? DateTime.parse(json['preparedAt']) : null,
      deliveredAt: json['deliveredAt'] != null ? DateTime.parse(json['deliveredAt']) : null,
      deliveryAddress: json['deliveryAddress'],
      deliveryInstructions: json['deliveryInstructions'],
      rating: json['rating']?.toDouble(),
      feedback: json['feedback'],
    );
  }
}

/// Main meal plan subscription model
class MealPlanSubscription {
  final String id;
  final String consumerId;
  final String consumerName;
  final String kitchenId;
  final String kitchenName;
  final String kitchenLogo;
  final SubscriptionPlan plan;
  final DateTime startDate;
  final DateTime endDate;
  final SubscriptionStatus status;
  final int mealsConsumed;
  final int mealsSkipped;
  final double amountPaid;
  final DeliveryPreferences deliveryPrefs;
  final MealPreferences mealPrefs;
  final DateTime? pausedUntil;
  final List<MealDelivery> deliveries;
  final DateTime createdAt;
  final DateTime updatedAt;

  MealPlanSubscription({
    required this.id,
    required this.consumerId,
    required this.consumerName,
    required this.kitchenId,
    required this.kitchenName,
    required this.kitchenLogo,
    required this.plan,
    required this.startDate,
    required this.endDate,
    this.status = SubscriptionStatus.active,
    this.mealsConsumed = 0,
    this.mealsSkipped = 0,
    this.amountPaid = 0,
    required this.deliveryPrefs,
    required this.mealPrefs,
    this.pausedUntil,
    this.deliveries = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  // Computed properties
  int get totalMeals => plan.totalMeals;
  int get mealsLeft => totalMeals - mealsConsumed - mealsSkipped;
  double get progress => mealsConsumed / totalMeals;
  bool get isActive => status == SubscriptionStatus.active;
  bool get isPaused => status == SubscriptionStatus.paused;
  bool get isExpired => status == SubscriptionStatus.expired;
  bool get isCancelled => status == SubscriptionStatus.cancelled;
  bool get isExpiring => mealsLeft <= 3 && isActive;
  
  MealDelivery? get nextMeal {
    try {
      return deliveries.firstWhere(
        (d) => d.status == DeliveryStatus.scheduled || d.status == DeliveryStatus.preparing,
      );
    } catch (e) {
      return null;
    }
  }

  Duration? get timeUntilNextMeal {
    if (nextMeal == null) return null;
    final now = DateTime.now();
    final nextMealDateTime = DateTime(
      nextMeal!.scheduledDate.year,
      nextMeal!.scheduledDate.month,
      nextMeal!.scheduledDate.day,
      nextMeal!.scheduledTime.hour,
      nextMeal!.scheduledTime.minute,
    );
    return nextMealDateTime.difference(now);
  }

  Color get statusColor {
    switch (status) {
      case SubscriptionStatus.active:
        return Colors.green;
      case SubscriptionStatus.paused:
        return Colors.orange;
      case SubscriptionStatus.expired:
        return Colors.grey;
      case SubscriptionStatus.cancelled:
        return Colors.red;
    }
  }

  MealPlanSubscription copyWith({
    SubscriptionStatus? status,
    int? mealsConsumed,
    int? mealsSkipped,
    double? amountPaid,
    DateTime? pausedUntil,
    List<MealDelivery>? deliveries,
    DateTime? updatedAt,
  }) {
    return MealPlanSubscription(
      id: id,
      consumerId: consumerId,
      consumerName: consumerName,
      kitchenId: kitchenId,
      kitchenName: kitchenName,
      kitchenLogo: kitchenLogo,
      plan: plan,
      startDate: startDate,
      endDate: endDate,
      status: status ?? this.status,
      mealsConsumed: mealsConsumed ?? this.mealsConsumed,
      mealsSkipped: mealsSkipped ?? this.mealsSkipped,
      amountPaid: amountPaid ?? this.amountPaid,
      deliveryPrefs: deliveryPrefs,
      mealPrefs: mealPrefs,
      pausedUntil: pausedUntil ?? this.pausedUntil,
      deliveries: deliveries ?? this.deliveries,
      createdAt: createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'consumerId': consumerId,
    'consumerName': consumerName,
    'kitchenId': kitchenId,
    'kitchenName': kitchenName,
    'kitchenLogo': kitchenLogo,
    'plan': plan.toJson(),
    'startDate': startDate.toIso8601String(),
    'endDate': endDate.toIso8601String(),
    'status': status.toString(),
    'mealsConsumed': mealsConsumed,
    'mealsSkipped': mealsSkipped,
    'amountPaid': amountPaid,
    'deliveryPrefs': deliveryPrefs.toJson(),
    'mealPrefs': mealPrefs.toJson(),
    'pausedUntil': pausedUntil?.toIso8601String(),
    'deliveries': deliveries.map((d) => d.toJson()).toList(),
    'createdAt': createdAt.toIso8601String(),
    'updatedAt': updatedAt.toIso8601String(),
  };

  factory MealPlanSubscription.fromJson(Map<String, dynamic> json) => MealPlanSubscription(
    id: json['id'],
    consumerId: json['consumerId'],
    consumerName: json['consumerName'],
    kitchenId: json['kitchenId'],
    kitchenName: json['kitchenName'],
    kitchenLogo: json['kitchenLogo'],
    plan: SubscriptionPlan.fromJson(json['plan']),
    startDate: DateTime.parse(json['startDate']),
    endDate: DateTime.parse(json['endDate']),
    status: SubscriptionStatus.values.firstWhere((e) => e.toString() == json['status']),
    mealsConsumed: json['mealsConsumed'] ?? 0,
    mealsSkipped: json['mealsSkipped'] ?? 0,
    amountPaid: json['amountPaid']?.toDouble() ?? 0,
    deliveryPrefs: DeliveryPreferences.fromJson(json['deliveryPrefs']),
    mealPrefs: MealPreferences.fromJson(json['mealPrefs']),
    pausedUntil: json['pausedUntil'] != null ? DateTime.parse(json['pausedUntil']) : null,
    deliveries: (json['deliveries'] as List?)?.map((d) => MealDelivery.fromJson(d)).toList() ?? [],
    createdAt: DateTime.parse(json['createdAt']),
    updatedAt: DateTime.parse(json['updatedAt']),
  );
}
