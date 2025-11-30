import 'package:flutter/foundation.dart';

/// Meal Toggle model for tracking member meal participation
@immutable
class MealToggle {
  final String id;
  final String squadId;
  final String userId;
  final DateTime date;
  
  final bool breakfast;
  final bool lunch;
  final bool dinner;
  final int guestCount;
  
  final DateTime updatedAt;

  const MealToggle({
    required this.id,
    required this.squadId,
    required this.userId,
    required this.date,
    this.breakfast = true,
    this.lunch = true,
    this.dinner = true,
    this.guestCount = 0,
    required this.updatedAt,
  });

  /// Calculate total meal count for this day
  double get totalMeals {
    double count = 0.0;
    if (breakfast) count += 1.0;
    if (lunch) count += 1.0;
    if (dinner) count += 1.0;
    count += guestCount; // Each guest counts as 1 meal
    return count;
  }

  MealToggle copyWith({
    String? id,
    String? squadId,
    String? userId,
    DateTime? date,
    bool? breakfast,
    bool? lunch,
    bool? dinner,
    int? guestCount,
    DateTime? updatedAt,
  }) {
    return MealToggle(
      id: id ?? this.id,
      squadId: squadId ?? this.squadId,
      userId: userId ?? this.userId,
      date: date ?? this.date,
      breakfast: breakfast ?? this.breakfast,
      lunch: lunch ?? this.lunch,
      dinner: dinner ?? this.dinner,
      guestCount: guestCount ?? this.guestCount,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'squad_id': squadId,
      'user_id': userId,
      'date': date.toIso8601String().split('T')[0], // Date only
      'breakfast': breakfast,
      'lunch': lunch,
      'dinner': dinner,
      'guest_count': guestCount,
      'updated_at': updatedAt.toIso8601String(),
    };
  }

  factory MealToggle.fromJson(Map<String, dynamic> json) {
    return MealToggle(
      id: json['id'] as String,
      squadId: json['squad_id'] as String,
      userId: json['user_id'] as String,
      date: DateTime.parse(json['date'] as String),
      breakfast: (json['breakfast'] as bool?) ?? true,
      lunch: (json['lunch'] as bool?) ?? true,
      dinner: (json['dinner'] as bool?) ?? true,
      guestCount: (json['guest_count'] as int?) ?? 0,
      updatedAt: DateTime.parse(json['updated_at'] as String),
    );
  }

  factory MealToggle.create({
    required String squadId,
    required String userId,
    required DateTime date,
  }) {
    final now = DateTime.now();
    return MealToggle(
      id: 'meal_${now.millisecondsSinceEpoch}',
      squadId: squadId,
      userId: userId,
      date: date,
      updatedAt: now,
    );
  }

  /// Create with all meals off
  factory MealToggle.allOff({
    required String squadId,
    required String userId,
    required DateTime date,
  }) {
    final now = DateTime.now();
    return MealToggle(
      id: 'meal_${now.millisecondsSinceEpoch}',
      squadId: squadId,
      userId: userId,
      date: date,
      breakfast: false,
      lunch: false,
      dinner: false,
      updatedAt: now,
    );
  }
}
