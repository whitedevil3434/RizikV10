import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:async';
import 'package:rizik_v4/data/models/order.dart';

/// Provider for managing partner-side order operations
/// Handles order acceptance, rejection, and status updates for kitchen workflow
class PartnerOrderProvider with ChangeNotifier {
  List<Order> _incomingOrders = [];
  List<Order> _acceptedOrders = [];
  List<Order> _preparingOrders = [];
  List<Order> _readyOrders = [];
  
  StreamSubscription? _ordersStreamSubscription;
  Timer? _mockOrderTimer;
  
  List<Order> get incomingOrders => _incomingOrders;
  List<Order> get acceptedOrders => _acceptedOrders;
  List<Order> get preparingOrders => _preparingOrders;
  List<Order> get readyOrders => _readyOrders;
  List<Order> get completedOrders => []; // Placeholder for now

  
  int get totalActiveOrders => 
      _acceptedOrders.length + _preparingOrders.length + _readyOrders.length;

  PartnerOrderProvider() {
    _loadOrders();
    _startListeningToOrders();
  }

  /// Load orders from local storage
  Future<void> _loadOrders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Load incoming orders
      final incomingJson = prefs.getString('partner_incoming_orders');
      if (incomingJson != null) {
        final List<dynamic> incomingList = json.decode(incomingJson);
        _incomingOrders = incomingList
            .map((orderJson) => Order.fromJson(orderJson as Map<String, dynamic>))
            .toList();
      }
      
      // Load accepted orders
      final acceptedJson = prefs.getString('partner_accepted_orders');
      if (acceptedJson != null) {
        final List<dynamic> acceptedList = json.decode(acceptedJson);
        _acceptedOrders = acceptedList
            .map((orderJson) => Order.fromJson(orderJson as Map<String, dynamic>))
            .toList();
      }
      
      // Load preparing orders
      final preparingJson = prefs.getString('partner_preparing_orders');
      if (preparingJson != null) {
        final List<dynamic> preparingList = json.decode(preparingJson);
        _preparingOrders = preparingList
            .map((orderJson) => Order.fromJson(orderJson as Map<String, dynamic>))
            .toList();
      }
      
      // Load ready orders
      final readyJson = prefs.getString('partner_ready_orders');
      if (readyJson != null) {
        final List<dynamic> readyList = json.decode(readyJson);
        _readyOrders = readyList
            .map((orderJson) => Order.fromJson(orderJson as Map<String, dynamic>))
            .toList();
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading partner orders: $e');
    }
  }

  /// Save orders to local storage
  Future<void> _saveOrders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Save incoming orders
      final incomingJson = json.encode(
        _incomingOrders.map((order) => order.toJson()).toList()
      );
      await prefs.setString('partner_incoming_orders', incomingJson);
      
      // Save accepted orders
      final acceptedJson = json.encode(
        _acceptedOrders.map((order) => order.toJson()).toList()
      );
      await prefs.setString('partner_accepted_orders', acceptedJson);
      
      // Save preparing orders
      final preparingJson = json.encode(
        _preparingOrders.map((order) => order.toJson()).toList()
      );
      await prefs.setString('partner_preparing_orders', preparingJson);
      
      // Save ready orders
      final readyJson = json.encode(
        _readyOrders.map((order) => order.toJson()).toList()
      );
      await prefs.setString('partner_ready_orders', readyJson);
    } catch (e) {
      debugPrint('Error saving partner orders: $e');
    }
  }

  /// Accept an incoming order
  /// Moves order from incoming to accepted/preparing queue
  Future<bool> acceptOrder(String orderId, {int preparationTimeMinutes = 20}) async {
    try {
      final orderIndex = _incomingOrders.indexWhere((order) => order.id == orderId);
      
      if (orderIndex == -1) {
        debugPrint('Order not found: $orderId');
        return false;
      }
      
      // Get the order and update its status
      final order = _incomingOrders[orderIndex];
      final acceptedOrder = order.copyWith(
        status: OrderStatus.confirmed,
        estimatedDeliveryTime: _calculateEstimatedTime(preparationTimeMinutes),
      );
      
      // Remove from incoming
      _incomingOrders.removeAt(orderIndex);
      
      // Add to accepted orders
      _acceptedOrders.add(acceptedOrder);
      
      // Automatically move to preparing after a short delay
      Future.delayed(const Duration(seconds: 2), () {
        _moveToPreparingQueue(orderId);
      });
      
      await _saveOrders();
      notifyListeners();
      
      // In a real app, this would update the backend
      await _updateOrderStatusInBackend(orderId, OrderStatus.confirmed);
      
      debugPrint('Order accepted: $orderId');
      return true;
    } catch (e) {
      debugPrint('Error accepting order: $e');
      return false;
    }
  }

  /// Reject an incoming order
  /// Removes order from incoming queue and marks as cancelled
  Future<bool> rejectOrder(String orderId, {String? reason}) async {
    try {
      final orderIndex = _incomingOrders.indexWhere((order) => order.id == orderId);
      
      if (orderIndex == -1) {
        debugPrint('Order not found: $orderId');
        return false;
      }
      
      // Remove from incoming
      _incomingOrders.removeAt(orderIndex);
      
      await _saveOrders();
      notifyListeners();
      
      // In a real app, this would update the backend and notify the customer
      await _updateOrderStatusInBackend(orderId, OrderStatus.cancelled);
      
      debugPrint('Order rejected: $orderId, reason: ${reason ?? "Not specified"}');
      return true;
    } catch (e) {
      debugPrint('Error rejecting order: $e');
      return false;
    }
  }

  /// Mark an order as ready for pickup
  /// Moves order from preparing to ready queue
  Future<bool> markReady(String orderId) async {
    try {
      // Check in preparing orders
      final preparingIndex = _preparingOrders.indexWhere((order) => order.id == orderId);
      
      if (preparingIndex != -1) {
        final order = _preparingOrders[preparingIndex];
        final readyOrder = order.copyWith(
          status: OrderStatus.readyForPickup,
        );
        
        // Remove from preparing
        _preparingOrders.removeAt(preparingIndex);
        
        // Add to ready
        _readyOrders.add(readyOrder);
        
        await _saveOrders();
        notifyListeners();
        
        // In a real app, this would trigger rider assignment
        await _updateOrderStatusInBackend(orderId, OrderStatus.readyForPickup);
        await _triggerRiderAssignment(orderId);
        
        debugPrint('Order marked as ready: $orderId');
        return true;
      }
      
      // Check in accepted orders (in case it wasn't moved to preparing yet)
      final acceptedIndex = _acceptedOrders.indexWhere((order) => order.id == orderId);
      
      if (acceptedIndex != -1) {
        final order = _acceptedOrders[acceptedIndex];
        final readyOrder = order.copyWith(
          status: OrderStatus.readyForPickup,
        );
        
        // Remove from accepted
        _acceptedOrders.removeAt(acceptedIndex);
        
        // Add to ready
        _readyOrders.add(readyOrder);
        
        await _saveOrders();
        notifyListeners();
        
        await _updateOrderStatusInBackend(orderId, OrderStatus.readyForPickup);
        await _triggerRiderAssignment(orderId);
        
        debugPrint('Order marked as ready: $orderId');
        return true;
      }
      
      debugPrint('Order not found in preparing or accepted queues: $orderId');
      return false;
    } catch (e) {
      debugPrint('Error marking order as ready: $e');
      return false;
    }
  }

  /// Move order from accepted to preparing queue
  void _moveToPreparingQueue(String orderId) {
    final acceptedIndex = _acceptedOrders.indexWhere((order) => order.id == orderId);
    
    if (acceptedIndex != -1) {
      final order = _acceptedOrders[acceptedIndex];
      final preparingOrder = order.copyWith(
        status: OrderStatus.preparing,
      );
      
      _acceptedOrders.removeAt(acceptedIndex);
      _preparingOrders.add(preparingOrder);
      
      _saveOrders();
      notifyListeners();
      
      _updateOrderStatusInBackend(orderId, OrderStatus.preparing);
    }
  }

  /// Start listening to new orders stream
  /// In production, this would connect to Supabase real-time subscriptions
  void _startListeningToOrders() {
    // For now, we'll use a mock implementation that simulates incoming orders
    // In production, this would be replaced with:
    // _ordersStreamSubscription = SupabaseConfig.client
    //     .from('orders')
    //     .stream(primaryKey: ['id'])
    //     .eq('partner_id', currentPartnerId)
    //     .eq('status', 'pending')
    //     .listen(_handleNewOrder);
    
    _startMockOrderStream();
  }

  /// Mock order stream for development/demo
  void _startMockOrderStream() {
    // Simulate receiving new orders every 30-60 seconds
    _mockOrderTimer = Timer.periodic(const Duration(seconds: 45), (timer) {
      if (_incomingOrders.length < 3) {
        _simulateNewOrder();
      }
    });
  }

  /// Simulate a new incoming order (for demo purposes)
  void _simulateNewOrder() {
    // This is just for demo - in production, orders come from the backend
    debugPrint('Simulating new order arrival...');
    // The actual order creation happens in OrderProvider
    // This provider just listens for orders assigned to this partner
  }

  /// Handle new order from stream
  /// This will be used when Supabase real-time subscriptions are implemented
  // ignore: unused_element
  void _handleNewOrder(List<Map<String, dynamic>> data) {
    try {
      for (var orderData in data) {
        final order = Order.fromJson(orderData);
        
        // Check if order is already in the list
        final exists = _incomingOrders.any((o) => o.id == order.id);
        
        if (!exists && order.status == OrderStatus.pending) {
          _incomingOrders.insert(0, order);
          notifyListeners();
          _saveOrders();
          
          debugPrint('New order received: ${order.id}');
        }
      }
    } catch (e) {
      debugPrint('Error handling new order: $e');
    }
  }

  /// Update order status in backend (Supabase)
  Future<void> _updateOrderStatusInBackend(String orderId, OrderStatus status) async {
    try {
      // In production, this would update Supabase:
      // await SupabaseConfig.client
      //     .from('orders')
      //     .update({'status': status.toString()})
      //     .eq('id', orderId);
      
      debugPrint('Backend updated: $orderId -> ${status.toString()}');
    } catch (e) {
      debugPrint('Error updating backend: $e');
    }
  }

  /// Trigger rider assignment when order is ready
  Future<void> _triggerRiderAssignment(String orderId) async {
    try {
      // In production, this would call a backend function to assign riders:
      // await SupabaseConfig.client.functions.invoke('assign-rider', body: {
      //   'order_id': orderId,
      // });
      
      debugPrint('Rider assignment triggered for order: $orderId');
    } catch (e) {
      debugPrint('Error triggering rider assignment: $e');
    }
  }

  /// Calculate estimated delivery time based on preparation time
  String _calculateEstimatedTime(int preparationMinutes) {
    final now = DateTime.now();
    final estimatedTime = now.add(Duration(minutes: preparationMinutes + 15)); // +15 for delivery
    final hour = estimatedTime.hour;
    final minute = estimatedTime.minute;
    final period = hour >= 12 ? 'PM' : 'AM';
    final displayHour = hour > 12 ? hour - 12 : (hour == 0 ? 12 : hour);
    return '$displayHour:${minute.toString().padLeft(2, '0')} $period';
  }

  /// Get order by ID from any queue
  Order? getOrderById(String orderId) {
    // Check all queues
    Order? order;
    
    order = _incomingOrders.cast<Order?>().firstWhere(
      (o) => o?.id == orderId,
      orElse: () => null,
    );
    if (order != null) return order;
    
    order = _acceptedOrders.cast<Order?>().firstWhere(
      (o) => o?.id == orderId,
      orElse: () => null,
    );
    if (order != null) return order;
    
    order = _preparingOrders.cast<Order?>().firstWhere(
      (o) => o?.id == orderId,
      orElse: () => null,
    );
    if (order != null) return order;
    
    order = _readyOrders.cast<Order?>().firstWhere(
      (o) => o?.id == orderId,
      orElse: () => null,
    );
    
    return order;
  }

  /// Manually add an order to incoming queue (for testing/demo)
  void addIncomingOrder(Order order) {
    if (!_incomingOrders.any((o) => o.id == order.id)) {
      _incomingOrders.insert(0, order);
      _saveOrders();
      notifyListeners();
    }
  }

  /// Remove order from ready queue (when picked up by rider)
  void removeFromReadyQueue(String orderId) {
    _readyOrders.removeWhere((order) => order.id == orderId);
    _saveOrders();
    notifyListeners();
  }

  @override
  void dispose() {
    _ordersStreamSubscription?.cancel();
    _mockOrderTimer?.cancel();
    super.dispose();
  }
}
