import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/order.dart';
import 'package:rizik_v4/data/models/cart.dart';
import 'package:rizik_v4/data/models/payment_method.dart';
import 'package:rizik_v4/core/state/aura_provider.dart';
import 'package:rizik_v4/features/force/logistics/logic/rider_mission_provider.dart';
import 'package:rizik_v4/data/remote/mission_assignment_service.dart';
import 'package:rizik_v4/data/remote/mission_chain_detector.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/moneybag_provider.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';
import 'package:rizik_v4/data/remote/payment_orchestration_service.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/unified_wallet_provider.dart';
import 'package:rizik_v4/data/remote/unified_payment_orchestration_service.dart';

class OrderProvider with ChangeNotifier {
  List<Order> _orders = [];
  Order? _currentOrder;
  AuraProvider? _auraProvider;
  RiderMissionProvider? _riderMissionProvider;
  KhataProvider? _khataProvider;
  final MissionAssignmentService _missionService = MissionAssignmentService();
  final MissionChainDetector _chainDetector = MissionChainDetector();
  MoneybagProvider? _moneybagProvider;
  UnifiedWalletProvider? _unifiedWalletProvider;
  PaymentOrchestrationService? _paymentOrchestrator;
  UnifiedPaymentOrchestrationService? _unifiedPaymentOrchestrator;

  List<Order> get orders => _orders;
  Order? get currentOrder => _currentOrder;

  OrderProvider() {
    _loadOrders();
  }

  // Set AuraProvider for XP awards (called from UI)
  void setAuraProvider(AuraProvider auraProvider) {
    _auraProvider = auraProvider;
  }

  // Set RiderMissionProvider for mission creation (called from UI)
  void setRiderMissionProvider(RiderMissionProvider riderMissionProvider) {
    _riderMissionProvider = riderMissionProvider;
  }

  // Set MoneybagProvider for wallet payments (called from UI)
  void setMoneybagProvider(MoneybagProvider moneybagProvider) {
    _moneybagProvider = moneybagProvider;
    _initializePaymentOrchestrator();
  }

  // Set KhataProvider for dual-write (called from UI)
  void setKhataProvider(KhataProvider khataProvider) {
    _khataProvider = khataProvider;
    _initializePaymentOrchestrator();
  }

  // Set UnifiedWalletProvider (called from UI)
  void setUnifiedWalletProvider(UnifiedWalletProvider walletProvider) {
    _unifiedWalletProvider = walletProvider;
    _initializePaymentOrchestrator();
  }

  // Initialize payment orchestrator when providers are ready
  void _initializePaymentOrchestrator() {
    if (_moneybagProvider != null) {
      _paymentOrchestrator = PaymentOrchestrationService(
        moneybagProvider: _moneybagProvider!,
        khataProvider: _khataProvider,
        auraProvider: _auraProvider,
      );
      debugPrint('🎬 Payment Orchestrator initialized!');
    }
    
    if (_unifiedWalletProvider != null) {
      _unifiedPaymentOrchestrator = UnifiedPaymentOrchestrationService(
        walletProvider: _unifiedWalletProvider!,
        auraProvider: _auraProvider,
      );
      debugPrint('🎬 Unified Payment Orchestrator initialized!');
    }
  }

  // Load orders from storage
  Future<void> _loadOrders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final ordersJson = prefs.getString('orders');
      if (ordersJson != null) {
        final List<dynamic> ordersList = json.decode(ordersJson);
        _orders = ordersList
            .map((orderJson) => Order.fromJson(orderJson as Map<String, dynamic>))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading orders: $e');
    }
  }

  // Save orders to storage
  Future<void> _saveOrders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final ordersJson = json.encode(_orders.map((order) => order.toJson()).toList());
      await prefs.setString('orders', ordersJson);
    } catch (e) {
      debugPrint('Error saving orders: $e');
    }
  }

  // Create a new order
  Future<Order> createOrder({
    required List<CartItem> items,
    required double subtotal,
    required double deliveryFee,
    required double tax,
    required double total,
    required PaymentMethodType paymentMethod,
    required String deliveryAddress,
    String? specialInstructions,
  }) async {
    final orderId = 'ORD${DateTime.now().millisecondsSinceEpoch}';
    final estimatedTime = _calculateEstimatedDeliveryTime();

    // Handle Wallet Payment
    if (paymentMethod == PaymentMethodType.wallet) {
      bool success = false;
      
      if (_unifiedWalletProvider != null) {
        success = await _unifiedWalletProvider!.payForOrder(
          amount: total,
          orderId: orderId,
        );
      } else if (_moneybagProvider != null) {
        success = await _moneybagProvider!.payForOrder(
          amount: total,
          orderId: orderId,
        );
      } else {
        throw Exception('Wallet service not available');
      }
      
      if (!success) {
        throw Exception('Insufficient wallet balance');
      }
      
      debugPrint('💰 Wallet payment successful for order $orderId');
    }

    final order = Order(
      id: orderId,
      items: items,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      tax: tax,
      total: total,
      paymentMethod: paymentMethod,
      status: OrderStatus.pending,
      createdAt: DateTime.now(),
      deliveryAddress: deliveryAddress,
      specialInstructions: specialInstructions,
      estimatedDeliveryTime: estimatedTime,
    );

    _orders.insert(0, order);
    _currentOrder = order;
    await _saveOrders();
    notifyListeners();

    // V5++ Game OS: Award XP for order placed
    if (_auraProvider != null) {
      await _auraProvider!.awardOrderPlacedXP();
      debugPrint('✨ Awarded +50 XP for order placed');
      
      // Bazar Tab: Award milestone XP
      final orderCount = _orders.length;
      if (orderCount == 1) {
        await _auraProvider!.awardFirstOrderXP();
        debugPrint('🎉 Awarded +100 XP for first order milestone!');
      } else if (orderCount == 10) {
        await _auraProvider!.awardTenthOrderXP();
        debugPrint('🎉 Awarded +200 XP for 10th order milestone!');
      }
    }

    // Order stays in pending status until a partner accepts it
    // No auto-confirmation - this is a marketplace model

    return order;
  }

  // Update order status
  Future<void> updateOrderStatus(String orderId, OrderStatus newStatus) async {
    final orderIndex = _orders.indexWhere((order) => order.id == orderId);
    if (orderIndex != -1) {
      final oldStatus = _orders[orderIndex].status;
      _orders[orderIndex] = _orders[orderIndex].copyWith(status: newStatus);
      if (_currentOrder?.id == orderId) {
        _currentOrder = _orders[orderIndex];
      }
      await _saveOrders();
      notifyListeners();

      // Bazar Tab Phase 7: Create mission when order is ready for pickup
      if (newStatus == OrderStatus.readyForPickup && oldStatus != OrderStatus.readyForPickup) {
        await _createMissionForOrder(_orders[orderIndex]);
      }

      // 🎉 CRITICAL: Distribute payment when order is delivered!
      if (newStatus == OrderStatus.delivered && oldStatus != OrderStatus.delivered) {
        // Award XP to consumer
        if (_auraProvider != null) {
          await _auraProvider!.awardOrderCompletedXP();
          debugPrint('✨ Awarded +100 XP for order completed');
        }

        // 💰 DISTRIBUTE PAYMENT TO PARTNER & RIDER
        await _distributeOrderPayment(_orders[orderIndex]);
      }
    }
  }

  // Create delivery mission for order (Phase 7 Task 7.1 & 7.4)
  Future<void> _createMissionForOrder(Order order) async {
    try {
      debugPrint('🚴 Creating delivery mission for order: ${order.id}');

      // Phase 7.4: Check for potential mission chains
      await _detectAndCreateMissionChains();

      // Use MissionAssignmentService to assign riders
      await _missionService.assignRiderToOrder(order.id, order);

      // Also add to RiderMissionProvider for UI display
      if (_riderMissionProvider != null) {
        final mission = _riderMissionProvider!.createMissionFromOrder(order);
        _riderMissionProvider!.addAvailableMission(mission);
        debugPrint('✅ Mission created and added to rider feed');
      }
    } catch (e) {
      debugPrint('❌ Error creating mission for order: $e');
    }
  }

  // Phase 7.4: Detect and create mission chains from ready orders
  Future<void> _detectAndCreateMissionChains() async {
    try {
      // Get all orders ready for pickup
      final readyOrders = getOrdersByStatus(OrderStatus.readyForPickup);

      if (readyOrders.length < 2) {
        debugPrint('Not enough orders for chain detection: ${readyOrders.length}');
        return;
      }

      // Filter eligible orders
      final eligibleOrders = readyOrders
          .where((order) => _chainDetector.isOrderEligibleForChain(order))
          .toList();

      if (eligibleOrders.length < 2) {
        debugPrint('Not enough eligible orders for chains: ${eligibleOrders.length}');
        return;
      }

      // Calculate rewards for each order
      final orderRewards = <String, double>{};
      for (final order in eligibleOrders) {
        orderRewards[order.id] = _calculateMissionReward(order);
      }

      // Detect potential chains
      final chains = await _chainDetector.detectChains(
        readyOrders: eligibleOrders,
        orderRewards: orderRewards,
      );

      if (chains.isEmpty) {
        debugPrint('No efficient mission chains detected');
        return;
      }

      // Add chains to RiderMissionProvider
      if (_riderMissionProvider != null) {
        for (final chain in chains) {
          _riderMissionProvider!.addMissionChain(chain);
          debugPrint('🔗 Mission chain created: ${chain.id}');
          debugPrint('   ${chain.missions.length} missions, '
              'efficiency: ${(chain.efficiencyScore * 100).toStringAsFixed(0)}%, '
              'total: ৳${chain.totalWithBonus.toStringAsFixed(0)} '
              '(+৳${chain.bonusAmount.toStringAsFixed(0)} bonus)');
        }
      }
    } catch (e) {
      debugPrint('❌ Error detecting mission chains: $e');
    }
  }

  // Calculate mission reward for an order
  double _calculateMissionReward(Order order) {
    const double baseFare = 30.0;
    const double perKmRate = 10.0;
    const double orderValueBonusRate = 0.05;

    // Estimate distance (mock - in production use actual coordinates)
    final estimatedDistance = 2.0 + (order.id.hashCode.abs() % 6);

    final distanceFare = estimatedDistance * perKmRate;
    final orderValueBonus = order.total * orderValueBonusRate;
    final totalReward = baseFare + distanceFare + orderValueBonus;

    return (totalReward / 10).round() * 10.0;
  }

  // 🎯 CRITICAL: Distribute payment when order is delivered
  Future<void> _distributeOrderPayment(Order order) async {
    // Prefer Unified Wallet if available
    if (_unifiedPaymentOrchestrator != null) {
      await _distributeWithUnifiedWallet(order);
      return;
    }

    if (_paymentOrchestrator == null) {
      debugPrint('⚠️ Payment orchestrator not initialized - skipping distribution');
      return;
    }

    try {
      debugPrint('💰 Starting payment distribution for order: ${order.id}');
      debugPrint('   Total: ৳${order.total}');

      // Execute payment orchestration
      final result = await _paymentOrchestrator!.orchestratePayment(
        order: order,
        partnerId: 'partner_001', // TODO: Get from order metadata
        partnerName: 'Partner Kitchen',
        riderId: 'rider_001', // TODO: Get from delivery mission
        riderName: 'Delivery Rider',
        // videoId: order.videoId, // TODO: Add if video-linked
        // creatorId: order.creatorId,
        // creatorName: order.creatorName,
        metadata: {
          'order_status': order.status.toString(),
          'payment_method': order.paymentMethod.toString(),
          'delivery_address': order.deliveryAddress,
        },
      );

      if (result.success) {
        debugPrint('✅ Payment distribution successful!');
        debugPrint('   Partner: ৳${result.breakdown.partnerAmount.toStringAsFixed(2)}');
        debugPrint('   Rider: ৳${result.breakdown.riderFee.toStringAsFixed(2)}');
        debugPrint('   Platform: ৳${result.breakdown.platformFee.toStringAsFixed(2)}');
        
        if (result.breakdown.creatorCommission != null) {
          debugPrint('   Creator: ৳${result.breakdown.creatorCommission!.toStringAsFixed(2)}');
        }

        // Show celebrations to users
        for (final celebration in result.celebrations) {
          debugPrint('${celebration.emoji} ${celebration.message}');
          // TODO: Show actual UI celebration/notification
        }
      } else {
        debugPrint('❌ Payment distribution failed: ${result.error}');
        // TODO: Queue for manual reconciliation
        // TODO: Notify admin
      }
    } catch (e) {
      debugPrint('❌ Payment distribution error: $e');
      // TODO: Implement error recovery
      // TODO: Rollback order status if needed
    }
  }

  Future<void> _distributeWithUnifiedWallet(Order order) async {
    try {
      debugPrint('💰 Starting UNIFIED payment distribution for order: ${order.id}');
      
      final result = await _unifiedPaymentOrchestrator!.orchestratePayment(
        order: order,
        partnerId: 'partner_001',
        partnerName: 'Partner Kitchen',
        riderId: 'rider_001',
        riderName: 'Delivery Rider',
        metadata: {
          'order_status': order.status.toString(),
          'payment_method': order.paymentMethod.toString(),
          'delivery_address': order.deliveryAddress,
        },
      );

      if (result.success) {
        debugPrint('✅ Unified Payment distribution successful!');
        // ... logging ...
      } else {
        debugPrint('❌ Unified Payment distribution failed: ${result.error}');
      }
    } catch (e) {
      debugPrint('❌ Unified Payment distribution error: $e');
    }
  }

  // Get order by ID
  Order? getOrderById(String orderId) {
    try {
      return _orders.firstWhere((order) => order.id == orderId);
    } catch (e) {
      return null;
    }
  }

  // Get orders by status
  List<Order> getOrdersByStatus(OrderStatus status) {
    return _orders.where((order) => order.status == status).toList();
  }

  // Get active orders (not delivered or cancelled)
  List<Order> get activeOrders {
    return _orders
        .where((order) =>
            order.status != OrderStatus.delivered &&
            order.status != OrderStatus.cancelled)
        .toList();
  }

  // Get completed orders
  List<Order> get completedOrders {
    return _orders
        .where((order) =>
            order.status == OrderStatus.delivered ||
            order.status == OrderStatus.cancelled)
        .toList();
  }

  // Cancel order
  Future<void> cancelOrder(String orderId) async {
    await updateOrderStatus(orderId, OrderStatus.cancelled);
  }

  // Clear current order
  void clearCurrentOrder() {
    _currentOrder = null;
    notifyListeners();
  }

  // Calculate estimated delivery time
  String _calculateEstimatedDeliveryTime() {
    final now = DateTime.now();
    final estimatedTime = now.add(const Duration(minutes: 35));
    final hour = estimatedTime.hour;
    final minute = estimatedTime.minute;
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
    return '$displayHour:${minute.toString().padLeft(2, '0')} $period';
  }

  // Simulate order progression (for demo purposes)
  Future<void> simulateOrderProgression(String orderId) async {
    final statuses = [
      OrderStatus.confirmed,
      OrderStatus.preparing,
      OrderStatus.readyForPickup,
      OrderStatus.outForDelivery,
      OrderStatus.delivered,
    ];

    for (var i = 0; i < statuses.length; i++) {
      await Future.delayed(Duration(seconds: 3 + i * 2));
      await updateOrderStatus(orderId, statuses[i]);
    }
  }
}
