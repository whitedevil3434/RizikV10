import 'package:flutter/foundation.dart';

/// Inventory item model
@immutable
class InventoryItem {
  final String id;
  final String? squadId; // Added for Squad System
  final String name;
  final String nameBn;
  final double quantity;
  final String unit; // kg, liter, pieces, etc.
  final double costPerUnit;
  final DateTime lastUpdated;
  final double? lowStockThreshold;
  final String? category;

  const InventoryItem({
    required this.id,
    this.squadId,
    required this.name,
    required this.nameBn,
    required this.quantity,
    required this.unit,
    required this.costPerUnit,
    required this.lastUpdated,
    this.lowStockThreshold,
    this.category,
  });

  bool get isLowStock {
    if (lowStockThreshold == null) return false;
    return quantity <= lowStockThreshold!;
  }

  double get totalValue => quantity * costPerUnit;

  InventoryItem copyWith({
    String? id,
    String? squadId,
    String? name,
    String? nameBn,
    double? quantity,
    String? unit,
    double? costPerUnit,
    DateTime? lastUpdated,
    double? lowStockThreshold,
    String? category,
  }) {
    return InventoryItem(
      id: id ?? this.id,
      squadId: squadId ?? this.squadId,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      quantity: quantity ?? this.quantity,
      unit: unit ?? this.unit,
      costPerUnit: costPerUnit ?? this.costPerUnit,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      lowStockThreshold: lowStockThreshold ?? this.lowStockThreshold,
      category: category ?? this.category,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'squad_id': squadId,
      'name': name,
      'name_bn': nameBn,
      'quantity': quantity,
      'unit': unit,
      'cost_per_unit': costPerUnit,
      'last_updated': lastUpdated.toIso8601String(),
      'low_stock_threshold': lowStockThreshold,
      'category': category,
    };
  }

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      id: json['id'] as String,
      squadId: json['squad_id'] as String?,
      name: json['name'] as String,
      nameBn: json['name_bn'] as String,
      quantity: (json['quantity'] as num).toDouble(),
      unit: json['unit'] as String,
      costPerUnit: (json['cost_per_unit'] as num).toDouble(),
      lastUpdated: DateTime.parse(json['last_updated'] as String),
      lowStockThreshold: json['low_stock_threshold'] != null
          ? (json['low_stock_threshold'] as num).toDouble()
          : null,
      category: json['category'] as String?,
    );
  }
}

/// Recipe ingredient requirement
class RecipeIngredient {
  final String ingredientId;
  final String name;
  final double quantity;
  final String unit;

  const RecipeIngredient({
    required this.ingredientId,
    required this.name,
    required this.quantity,
    required this.unit,
  });

  Map<String, dynamic> toJson() {
    return {
      'ingredient_id': ingredientId,
      'name': name,
      'quantity': quantity,
      'unit': unit,
    };
  }

  factory RecipeIngredient.fromJson(Map<String, dynamic> json) {
    return RecipeIngredient(
      ingredientId: json['ingredient_id'] as String,
      name: json['name'] as String,
      quantity: (json['quantity'] as num).toDouble(),
      unit: json['unit'] as String,
    );
  }
}

/// Recipe model
class Recipe {
  final String id;
  final String? squadId; // Added for Squad System
  final String name;
  final String nameBn;
  final List<RecipeIngredient> ingredients;
  final int servings;
  final String? instructions;

  const Recipe({
    required this.id,
    this.squadId,
    required this.name,
    required this.nameBn,
    required this.ingredients,
    required this.servings,
    this.instructions,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'squad_id': squadId,
      'name': name,
      'name_bn': nameBn,
      'ingredients': ingredients.map((i) => i.toJson()).toList(),
      'servings': servings,
      'instructions': instructions,
    };
  }

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: json['id'] as String,
      squadId: json['squad_id'] as String?,
      name: json['name'] as String,
      nameBn: json['name_bn'] as String,
      ingredients: (json['ingredients'] as List<dynamic>)
          .map((i) => RecipeIngredient.fromJson(i as Map<String, dynamic>))
          .toList(),
      servings: json['servings'] as int,
      instructions: json['instructions'] as String?,
    );
  }
}

/// Inventory usage record
class InventoryUsage {
  final String id;
  final String recipeId;
  final String recipeName;
  final int servings;
  final Map<String, double> ingredientsUsed; // ingredientId -> quantity
  final double totalCost;
  final DateTime timestamp;

  const InventoryUsage({
    required this.id,
    required this.recipeId,
    required this.recipeName,
    required this.servings,
    required this.ingredientsUsed,
    required this.totalCost,
    required this.timestamp,
  });

  double get costPerServing => totalCost / servings;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'recipe_id': recipeId,
      'recipe_name': recipeName,
      'servings': servings,
      'ingredients_used': ingredientsUsed,
      'total_cost': totalCost,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory InventoryUsage.fromJson(Map<String, dynamic> json) {
    return InventoryUsage(
      id: json['id'] as String,
      recipeId: json['recipe_id'] as String,
      recipeName: json['recipe_name'] as String,
      servings: json['servings'] as int,
      ingredientsUsed: Map<String, double>.from(json['ingredients_used']),
      totalCost: (json['total_cost'] as num).toDouble(),
      timestamp: DateTime.parse(json['timestamp'] as String),
    );
  }
}
