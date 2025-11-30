import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/cart.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/cart_provider.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/unified_wallet_provider.dart';

/// 🎒 Omni-Present Backpack Provider
/// 
/// Neural Architecture V8 - Phase 4
/// 
/// This provider wraps CartProvider and UnifiedWalletProvider to create
/// a persistent "backpack" that follows the user across all screens.
/// 
/// Key Features:
/// - Global cart state (never lost during navigation)
/// - Multi-vendor detection and handling
/// - Flying Hero animation support
/// - Wallet balance persistence
/// 
/// Philosophy: "The backpack is always on your back"
class OmniPresentBackpackProvider extends ChangeNotifier {
  final CartProvider _cartProvider;
  final UnifiedWalletProvider _walletProvider;
  
  // Animation state for flying items
  String? _currentFlyingItemId;
  Offset? _flyingStartPosition;
  
  OmniPresentBackpackProvider({
    required CartProvider cartProvider,
    required UnifiedWalletProvider walletProvider,
  })  : _cartProvider = cartProvider,
        _walletProvider = walletProvider {
    // Listen to cart changes
    _cartProvider.addListener(_onCartChanged);
    _walletProvider.addListener(_onWalletChanged);
  }
  
  // ==========================================
  // GETTERS - Cart State
  // ==========================================
  
  Cart get cart => _cartProvider.cart;
  int get itemCount => _cartProvider.itemCount;
  bool get isEmpty => _cartProvider.isEmpty;
  bool get isNotEmpty => _cartProvider.isNotEmpty;
  double get subtotal => cart.subtotal;
  
  /// Get unique vendor count (for multi-vendor detection)
  int get vendorCount {
    final vendors = <String>{};
    for (final item in cart.items) {
      vendors.add(item.restaurantId);
    }
    return vendors.length;
  }
  
  /// Check if cart has multiple vendors
  bool get hasMultipleVendors => vendorCount > 1;
  
  /// Get vendor IDs in cart
  List<String> get vendorIds {
    final vendors = <String>{};
    for (final item in cart.items) {
      vendors.add(item.restaurantId);
    }
    return vendors.toList();
  }
  
  // ==========================================
  // GETTERS - Wallet State
  // ==========================================
  
  double get balance => _walletProvider.balance;
  bool get hasSufficientBalance => balance >= subtotal;
  
  // ==========================================
  // GETTERS - Animation State
  // ==========================================
  
  String? get currentFlyingItemId => _currentFlyingItemId;
  Offset? get flyingStartPosition => _flyingStartPosition;
  bool get isItemFlying => _currentFlyingItemId != null;
  
  // ==========================================
  // METHODS - Cart Operations (Delegates to CartProvider)
  // ==========================================
  
  /// Clear cart
  void clearCart() {
    _cartProvider.clearCart();
  }
  
  // ==========================================
  // METHODS - Multi-Vendor Handling
  // ==========================================
  
  /// Get cart items grouped by vendor
  Map<String, List<CartItem>> getItemsByVendor() {
    final grouped = <String, List<CartItem>>{};
    
    for (final item in cart.items) {
      final vendorId = item.restaurantId;
      if (!grouped.containsKey(vendorId)) {
        grouped[vendorId] = [];
      }
      grouped[vendorId]!.add(item);
    }
    
    return grouped;
  }
  
  /// Calculate delivery fee for merged vs separate orders
  /// Returns: { 'merged': fee, 'separate': fee, 'savings': amount }
  Map<String, double> calculateDeliveryOptions() {
    if (vendorCount <= 1) {
      return {
        'merged': 50.0,
        'separate': 50.0,
        'savings': 0.0,
      };
    }
    
    // Base delivery fee per vendor
    const baseDeliveryFee = 50.0;
    
    // Separate delivery: Each vendor charges full fee
    final separateFee = vendorCount * baseDeliveryFee;
    
    // Merged delivery: Flat fee with small surcharge
    final mergedFee = baseDeliveryFee + (vendorCount - 1) * 20.0;
    
    return {
      'merged': mergedFee,
      'separate': separateFee,
      'savings': separateFee - mergedFee,
    };
  }
  
  // ==========================================
  // METHODS - Wallet Operations
  // ==========================================
  
  /// Check if user can afford cart total
  bool canAffordCart({double? deliveryFee}) {
    final total = subtotal + (deliveryFee ?? 0);
    return balance >= total;
  }
  
  /// Get remaining balance after purchase
  double getRemainingBalance({double? deliveryFee}) {
    final total = subtotal + (deliveryFee ?? 0);
    return balance - total;
  }
  
  // ==========================================
  // PRIVATE - Event Handlers
  // ==========================================
  
  void _onCartChanged() {
    notifyListeners();
  }
  
  void _onWalletChanged() {
    notifyListeners();
  }
  
  @override
  void dispose() {
    _cartProvider.removeListener(_onCartChanged);
    _walletProvider.removeListener(_onWalletChanged);
    super.dispose();
  }
}
