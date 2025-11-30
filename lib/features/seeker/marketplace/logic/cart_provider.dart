import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/cart.dart';
// import '../widgets/feed_cards.dart'; // Commented out - file doesn't exist

class CartProvider extends ChangeNotifier {
  Cart _cart = Cart.empty();
  CartItem? _lastRemovedItem;
  int? _lastRemovedIndex;

  Cart get cart => _cart;
  
  int get itemCount => _cart.itemCount;
  
  bool get isEmpty => _cart.isEmpty;
  
  bool get isNotEmpty => _cart.isNotEmpty;

  CartProvider() {
    _loadCart();
  }

  /// Add item to cart (accepts dynamic food data for flexibility)
  void addToCart(dynamic food, {int quantity = 1}) {
    // Check if item already exists
    final existingIndex = _cart.items.indexWhere(
      (item) => item.foodId == food.id,
    );

    if (existingIndex >= 0) {
      // Update quantity
      final existingItem = _cart.items[existingIndex];
      final updatedItem = existingItem.copyWith(
        quantity: existingItem.quantity + quantity,
      );
      
      final updatedItems = List<CartItem>.from(_cart.items);
      updatedItems[existingIndex] = updatedItem;
      
      _cart = _cart.copyWith(items: updatedItems);
    } else {
      // Add new item
      final newItem = CartItem(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        foodId: food.id,
        name: food.name,
        nameBn: food.nameBn ?? food.name,
        image: food.image,
        price: food.price,
        quantity: quantity,
        restaurantId: food.id, // Using food id as restaurant id for now
        restaurantName: food.partnerName,
      );
      
      _cart = _cart.copyWith(
        items: [..._cart.items, newItem],
      );
    }

    _saveCart();
    notifyListeners();
  }

  /// Remove item from cart
  void removeFromCart(String itemId) {
    final index = _cart.items.indexWhere((item) => item.id == itemId);
    
    if (index >= 0) {
      _lastRemovedItem = _cart.items[index];
      _lastRemovedIndex = index;
      
      final updatedItems = List<CartItem>.from(_cart.items);
      updatedItems.removeAt(index);
      
      _cart = _cart.copyWith(items: updatedItems);
      
      _saveCart();
      notifyListeners();
    }
  }

  /// Restore last removed item (for undo)
  void restoreItem(CartItem item) {
    if (_lastRemovedItem != null && _lastRemovedIndex != null) {
      final updatedItems = List<CartItem>.from(_cart.items);
      updatedItems.insert(_lastRemovedIndex!, _lastRemovedItem!);
      
      _cart = _cart.copyWith(items: updatedItems);
      
      _lastRemovedItem = null;
      _lastRemovedIndex = null;
      
      _saveCart();
      notifyListeners();
    }
  }

  /// Update item quantity
  void updateQuantity(String itemId, int newQuantity) {
    if (newQuantity < 1 || newQuantity > 10) return;

    final index = _cart.items.indexWhere((item) => item.id == itemId);
    
    if (index >= 0) {
      final updatedItem = _cart.items[index].copyWith(quantity: newQuantity);
      final updatedItems = List<CartItem>.from(_cart.items);
      updatedItems[index] = updatedItem;
      
      _cart = _cart.copyWith(items: updatedItems);
      
      _saveCart();
      notifyListeners();
    }
  }

  /// Clear entire cart
  void clearCart() {
    _cart = Cart.empty();
    _saveCart();
    notifyListeners();
  }

  /// Update delivery address
  void updateDeliveryAddress(String address) {
    _cart = _cart.copyWith(deliveryAddress: address);
    _saveCart();
    notifyListeners();
  }

  /// Save cart to local storage
  Future<void> _saveCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartJson = jsonEncode(_cart.toJson());
      await prefs.setString('cart', cartJson);
    } catch (e) {
      debugPrint('Error saving cart: $e');
    }
  }

  /// Load cart from local storage
  Future<void> _loadCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cartJson = prefs.getString('cart');
      
      if (cartJson != null) {
        final cartData = jsonDecode(cartJson);
        _cart = Cart.fromJson(cartData);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading cart: $e');
      _cart = Cart.empty();
    }
  }
}
