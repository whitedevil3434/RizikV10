import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/inventory.dart';
import 'package:rizik_v4/data/remote/ai_pantry_service.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';

/// Provider for managing inventory (AI Pantry)
class InventoryProvider with ChangeNotifier {
  Map<String, InventoryItem> _inventory = {};
  List<InventoryUsage> _usageHistory = [];
  bool _isLoading = false;
  String? _error;

  Map<String, InventoryItem> get inventory => _inventory;
  List<InventoryUsage> get usageHistory => _usageHistory;
  bool get isLoading => _isLoading;
  String? get error => _error;

  List<InventoryItem> get lowStockItems =>
      AIPantryService.getLowStockItems(_inventory);

  double get totalInventoryValue =>
      AIPantryService.calculateInventoryValue(_inventory);

  InventoryProvider() {
    _loadInventory();
  }

  /// Load inventory from storage
  Future<void> _loadInventory() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      
      // Load inventory
      final inventoryJson = prefs.getString('inventory');
      if (inventoryJson != null) {
        final Map<String, dynamic> inventoryMap = jsonDecode(inventoryJson);
        _inventory = inventoryMap.map(
          (key, value) => MapEntry(
            key,
            InventoryItem.fromJson(value as Map<String, dynamic>),
          ),
        );
      }

      // Load usage history
      final usageJson = prefs.getString('inventory_usage');
      if (usageJson != null) {
        final List<dynamic> usageList = jsonDecode(usageJson);
        _usageHistory = usageList
            .map((json) => InventoryUsage.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load inventory: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save inventory to storage
  Future<void> _saveInventory() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Save inventory
      final inventoryMap = _inventory.map(
        (key, value) => MapEntry(key, value.toJson()),
      );
      await prefs.setString('inventory', jsonEncode(inventoryMap));

      // Save usage history (keep last 100 records)
      final recentUsage = _usageHistory.take(100).toList();
      await prefs.setString(
        'inventory_usage',
        jsonEncode(recentUsage.map((u) => u.toJson()).toList()),
      );
    } catch (e) {
      debugPrint('Error saving inventory: $e');
    }
  }

  /// Add or update inventory item
  Future<void> addOrUpdateItem(InventoryItem item) async {
    _inventory[item.id] = item;
    await _saveInventory();
    notifyListeners();
  }

  /// Remove inventory item
  Future<void> removeItem(String itemId) async {
    _inventory.remove(itemId);
    await _saveInventory();
    notifyListeners();
  }

  /// Use recipe and auto-deduct ingredients
  Future<InventoryUsage?> useRecipe({
    required Recipe recipe,
    required int servings,
    KhataProvider? khataProvider,
  }) async {
    try {
      // Check if we have enough ingredients
      if (!AIPantryService.canMakeRecipe(recipe, _inventory)) {
        _error = 'Not enough ingredients for ${recipe.name}';
        notifyListeners();
        return null;
      }

      // Create usage record
      final usage = AIPantryService.createUsageRecord(
        recipe,
        _inventory,
        servings,
      );

      // Deduct ingredients
      _inventory = AIPantryService.deductIngredients(recipe, _inventory);

      // Add to usage history
      _usageHistory.insert(0, usage);

      // Auto-log to khata if provider is available
      if (khataProvider != null) {
        final khataEntry = AIPantryService.createKhataEntryFromUsage(usage);
        await khataProvider.addEntry(
          khataId: khataProvider.personalKhata!.id,
          entry: khataEntry,
        );
      }

      await _saveInventory();
      notifyListeners();

      debugPrint('✅ Recipe used: ${recipe.name} - Cost: ৳${usage.totalCost.toStringAsFixed(2)}');
      return usage;
    } catch (e) {
      _error = 'Error using recipe: $e';
      debugPrint(_error);
      notifyListeners();
      return null;
    }
  }

  /// Get reorder suggestions
  List<ReorderSuggestion> getReorderSuggestions() {
    return AIPantryService.getReorderSuggestions(_inventory, _usageHistory);
  }

  /// Get inventory grouped by category
  Map<String, List<InventoryItem>> getInventoryByCategory() {
    return AIPantryService.groupByCategory(_inventory);
  }

  /// Calculate cost for a recipe
  double calculateRecipeCost(Recipe recipe) {
    return AIPantryService.calculateRecipeCost(recipe, _inventory);
  }

  /// Check if recipe can be made
  bool canMakeRecipe(Recipe recipe) {
    return AIPantryService.canMakeRecipe(recipe, _inventory);
  }

  /// Get usage history for a specific period
  List<InventoryUsage> getUsageForPeriod(DateTime start, DateTime end) {
    return _usageHistory.where((usage) {
      return usage.timestamp.isAfter(start) && usage.timestamp.isBefore(end);
    }).toList();
  }

  /// Get total cost for a period
  double getTotalCostForPeriod(DateTime start, DateTime end) {
    final usageInPeriod = getUsageForPeriod(start, end);
    return usageInPeriod.fold(0.0, (sum, usage) => sum + usage.totalCost);
  }

  /// Reset inventory (for testing)
  @visibleForTesting
  Future<void> resetInventory() async {
    _inventory = {};
    _usageHistory = [];
    await _saveInventory();
    notifyListeners();
  }
}
