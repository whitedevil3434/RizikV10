import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/shopping_item.dart';
import 'package:rizik_v4/data/models/khata.dart';

/// Provider for managing shopping lists
class ShoppingProvider with ChangeNotifier {
  Map<String, List<ShoppingItem>> _shoppingLists = {};
  bool _isLoading = false;

  Map<String, List<ShoppingItem>> get shoppingLists => _shoppingLists;
  bool get isLoading => _isLoading;

  ShoppingProvider() {
    _loadShoppingLists();
  }

  /// Get shopping list for a khata
  List<ShoppingItem> getShoppingList(String khataId) {
    return _shoppingLists[khataId] ?? [];
  }

  /// Get pending items
  List<ShoppingItem> getPendingItems(String khataId) {
    return getShoppingList(khataId).where((item) => !item.isPurchased).toList();
  }

  /// Get purchased items
  List<ShoppingItem> getPurchasedItems(String khataId) {
    return getShoppingList(khataId).where((item) => item.isPurchased).toList();
  }

  /// Get total estimated cost
  double getTotalEstimated(String khataId) {
    return getPendingItems(khataId).fold(0.0, (sum, item) => sum + item.totalEstimated);
  }

  /// Get total actual cost
  double getTotalActual(String khataId) {
    return getPurchasedItems(khataId).fold(0.0, (sum, item) => sum + item.totalActual);
  }

  /// Load shopping lists from storage
  Future<void> _loadShoppingLists() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final listsJson = prefs.getString('shopping_lists');

      if (listsJson != null) {
        final Map<String, dynamic> listsMap = jsonDecode(listsJson);
        _shoppingLists = listsMap.map((key, value) {
          final List<dynamic> items = value as List<dynamic>;
          return MapEntry(
            key,
            items.map((item) => ShoppingItem.fromJson(item as Map<String, dynamic>)).toList(),
          );
        });
      }
    } catch (e) {
      debugPrint('Error loading shopping lists: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save shopping lists to storage
  Future<void> _saveShoppingLists() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final listsMap = _shoppingLists.map((key, value) {
        return MapEntry(key, value.map((item) => item.toJson()).toList());
      });
      await prefs.setString('shopping_lists', jsonEncode(listsMap));
    } catch (e) {
      debugPrint('Error saving shopping lists: $e');
    }
  }

  /// Add item to shopping list
  Future<void> addItem({
    required String khataId,
    required String name,
    required String nameBn,
    required double quantity,
    required String unit,
    double? estimatedPrice,
    KhataCategory category = KhataCategory.groceries,
  }) async {
    final item = ShoppingItem(
      id: 'shop_${DateTime.now().millisecondsSinceEpoch}',
      name: name,
      nameBn: nameBn,
      quantity: quantity,
      unit: unit,
      estimatedPrice: estimatedPrice,
      category: category,
      createdAt: DateTime.now(),
    );

    final currentList = _shoppingLists[khataId] ?? [];
    _shoppingLists[khataId] = [...currentList, item];

    await _saveShoppingLists();
    notifyListeners();
  }

  /// Update item
  Future<void> updateItem({
    required String khataId,
    required String itemId,
    required ShoppingItem updatedItem,
  }) async {
    final list = _shoppingLists[khataId];
    if (list == null) return;

    final index = list.indexWhere((item) => item.id == itemId);
    if (index == -1) return;

    list[index] = updatedItem;
    _shoppingLists[khataId] = list;

    await _saveShoppingLists();
    notifyListeners();
  }

  /// Delete item
  Future<void> deleteItem({
    required String khataId,
    required String itemId,
  }) async {
    final list = _shoppingLists[khataId];
    if (list == null) return;

    _shoppingLists[khataId] = list.where((item) => item.id != itemId).toList();

    await _saveShoppingLists();
    notifyListeners();
  }

  /// Mark item as purchased
  Future<void> markAsPurchased({
    required String khataId,
    required String itemId,
    required double actualPrice,
  }) async {
    final list = _shoppingLists[khataId];
    if (list == null) return;

    final index = list.indexWhere((item) => item.id == itemId);
    if (index == -1) return;

    list[index] = list[index].copyWith(
      isPurchased: true,
      actualPrice: actualPrice,
      purchasedAt: DateTime.now(),
    );

    _shoppingLists[khataId] = list;

    await _saveShoppingLists();
    notifyListeners();
  }

  /// Clear purchased items
  Future<void> clearPurchased(String khataId) async {
    final list = _shoppingLists[khataId];
    if (list == null) return;

    _shoppingLists[khataId] = list.where((item) => !item.isPurchased).toList();

    await _saveShoppingLists();
    notifyListeners();
  }

  /// Clear all items
  Future<void> clearAll(String khataId) async {
    _shoppingLists[khataId] = [];
    await _saveShoppingLists();
    notifyListeners();
  }
}
