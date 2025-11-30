import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/inventory.dart';
import 'package:rizik_v4/data/models/khata_entry.dart';
import 'package:rizik_v4/data/models/khata.dart';

/// AI Pantry service for inventory management and auto-cost calculation
class AIPantryService {
  /// Calculate cost for using a recipe
  static double calculateRecipeCost(
    Recipe recipe,
    Map<String, InventoryItem> inventory,
  ) {
    double totalCost = 0.0;

    for (final ingredient in recipe.ingredients) {
      final item = inventory[ingredient.ingredientId];
      if (item != null) {
        totalCost += ingredient.quantity * item.costPerUnit;
      }
    }

    return totalCost;
  }

  /// Check if inventory has enough ingredients for recipe
  static bool canMakeRecipe(
    Recipe recipe,
    Map<String, InventoryItem> inventory,
  ) {
    for (final ingredient in recipe.ingredients) {
      final item = inventory[ingredient.ingredientId];
      if (item == null || item.quantity < ingredient.quantity) {
        return false;
      }
    }
    return true;
  }

  /// Deduct ingredients from inventory after using recipe
  static Map<String, InventoryItem> deductIngredients(
    Recipe recipe,
    Map<String, InventoryItem> inventory,
  ) {
    final updatedInventory = Map<String, InventoryItem>.from(inventory);

    for (final ingredient in recipe.ingredients) {
      final item = updatedInventory[ingredient.ingredientId];
      if (item != null) {
        updatedInventory[ingredient.ingredientId] = item.copyWith(
          quantity: item.quantity - ingredient.quantity,
          lastUpdated: DateTime.now(),
        );
      }
    }

    return updatedInventory;
  }

  /// Create inventory usage record
  static InventoryUsage createUsageRecord(
    Recipe recipe,
    Map<String, InventoryItem> inventory,
    int servings,
  ) {
    final ingredientsUsed = <String, double>{};
    double totalCost = 0.0;

    for (final ingredient in recipe.ingredients) {
      final item = inventory[ingredient.ingredientId];
      if (item != null) {
        final quantityUsed = ingredient.quantity * (servings / recipe.servings);
        ingredientsUsed[ingredient.ingredientId] = quantityUsed;
        totalCost += quantityUsed * item.costPerUnit;
      }
    }

    return InventoryUsage(
      id: 'usage_${DateTime.now().millisecondsSinceEpoch}',
      recipeId: recipe.id,
      recipeName: recipe.name,
      servings: servings,
      ingredientsUsed: ingredientsUsed,
      totalCost: totalCost,
      timestamp: DateTime.now(),
    );
  }

  /// Create khata entry from inventory usage
  static KhataEntry createKhataEntryFromUsage(InventoryUsage usage) {
    return KhataEntry.expense(
      description: '${usage.recipeName} (${usage.servings} servings)',
      amount: usage.totalCost,
      category: KhataCategory.food,
      notes: 'Auto-calculated from AI Pantry',
    );
  }

  /// Get low stock items
  static List<InventoryItem> getLowStockItems(
    Map<String, InventoryItem> inventory,
  ) {
    return inventory.values.where((item) => item.isLowStock).toList()
      ..sort((a, b) => a.quantity.compareTo(b.quantity));
  }

  /// Generate reorder suggestions
  static List<ReorderSuggestion> getReorderSuggestions(
    Map<String, InventoryItem> inventory,
    List<InventoryUsage> recentUsage,
  ) {
    final suggestions = <ReorderSuggestion>[];
    final lowStockItems = getLowStockItems(inventory);

    for (final item in lowStockItems) {
      // Calculate average usage from recent history
      final usageForItem = recentUsage
          .where((usage) => usage.ingredientsUsed.containsKey(item.id))
          .toList();

      double avgDailyUsage = 0.0;
      if (usageForItem.isNotEmpty) {
        final totalUsed = usageForItem.fold<double>(
          0.0,
          (sum, usage) => sum + (usage.ingredientsUsed[item.id] ?? 0.0),
        );
        final daysCovered = usageForItem.length > 0 ? 7 : 1; // Assume 7 days
        avgDailyUsage = totalUsed / daysCovered;
      }

      // Suggest reorder quantity (enough for 7 days)
      final suggestedQuantity = avgDailyUsage * 7;
      final daysUntilEmpty = avgDailyUsage > 0 ? item.quantity / avgDailyUsage : 999;

      suggestions.add(ReorderSuggestion(
        item: item,
        suggestedQuantity: suggestedQuantity,
        estimatedCost: suggestedQuantity * item.costPerUnit,
        urgency: daysUntilEmpty < 2 ? ReorderUrgency.urgent : ReorderUrgency.normal,
        daysUntilEmpty: daysUntilEmpty.round(),
      ));
    }

    return suggestions..sort((a, b) => a.daysUntilEmpty.compareTo(b.daysUntilEmpty));
  }

  /// Calculate total inventory value
  static double calculateInventoryValue(Map<String, InventoryItem> inventory) {
    return inventory.values.fold(0.0, (sum, item) => sum + item.totalValue);
  }

  /// Get inventory by category
  static Map<String, List<InventoryItem>> groupByCategory(
    Map<String, InventoryItem> inventory,
  ) {
    final grouped = <String, List<InventoryItem>>{};

    for (final item in inventory.values) {
      final category = item.category ?? 'Other';
      grouped.putIfAbsent(category, () => []).add(item);
    }

    return grouped;
  }
}

/// Reorder urgency levels
enum ReorderUrgency {
  urgent,
  normal,
  low,
}

/// Reorder suggestion model
class ReorderSuggestion {
  final InventoryItem item;
  final double suggestedQuantity;
  final double estimatedCost;
  final ReorderUrgency urgency;
  final int daysUntilEmpty;

  const ReorderSuggestion({
    required this.item,
    required this.suggestedQuantity,
    required this.estimatedCost,
    required this.urgency,
    required this.daysUntilEmpty,
  });
}
