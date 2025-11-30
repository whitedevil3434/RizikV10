import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/khata.dart';

/// Shopping Item Model
@immutable
class ShoppingItem {
  final String id;
  final String name;
  final String nameBn;
  final double quantity;
  final String unit;
  final double? estimatedPrice;
  final double? actualPrice;
  final bool isPurchased;
  final KhataCategory category;
  final DateTime createdAt;
  final DateTime? purchasedAt;

  const ShoppingItem({
    required this.id,
    required this.name,
    required this.nameBn,
    required this.quantity,
    required this.unit,
    this.estimatedPrice,
    this.actualPrice,
    this.isPurchased = false,
    required this.category,
    required this.createdAt,
    this.purchasedAt,
  });

  double get totalEstimated => (estimatedPrice ?? 0) * quantity;
  double get totalActual => (actualPrice ?? 0) * quantity;

  ShoppingItem copyWith({
    String? id,
    String? name,
    String? nameBn,
    double? quantity,
    String? unit,
    double? estimatedPrice,
    double? actualPrice,
    bool? isPurchased,
    KhataCategory? category,
    DateTime? createdAt,
    DateTime? purchasedAt,
  }) {
    return ShoppingItem(
      id: id ?? this.id,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
      estimatedPrice: estimatedPrice ?? this.estimatedPrice,
      actualPrice: actualPrice ?? this.actualPrice,
      isPurchased: isPurchased ?? this.isPurchased,
      category: category ?? this.category,
      createdAt: createdAt ?? this.createdAt,
      purchasedAt: purchasedAt ?? this.purchasedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_bn': nameBn,
      'quantity': quantity,
      'unit': unit,
      'estimated_price': estimatedPrice,
      'actual_price': actualPrice,
      'is_purchased': isPurchased,
      'category': category.key,
      'created_at': createdAt.toIso8601String(),
      'purchased_at': purchasedAt?.toIso8601String(),
    };
  }

  factory ShoppingItem.fromJson(Map<String, dynamic> json) {
    return ShoppingItem(
      id: json['id'] as String,
      name: json['name'] as String,
      nameBn: json['name_bn'] as String,
      quantity: (json['quantity'] as num).toDouble(),
      unit: json['unit'] as String,
      estimatedPrice: json['estimated_price'] != null
          ? (json['estimated_price'] as num).toDouble()
          : null,
      actualPrice: json['actual_price'] != null
          ? (json['actual_price'] as num).toDouble()
          : null,
      isPurchased: json['is_purchased'] as bool? ?? false,
      category: KhataCategory.values.firstWhere(
        (c) => c.key == json['category'],
        orElse: () => KhataCategory.groceries,
      ),
      createdAt: DateTime.parse(json['created_at'] as String),
      purchasedAt: json['purchased_at'] != null
          ? DateTime.parse(json['purchased_at'] as String)
          : null,
    );
  }
}
