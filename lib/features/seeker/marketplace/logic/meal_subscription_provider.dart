import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/meal_plan_subscription.dart';
import 'package:rizik_v4/data/models/user_role.dart';

/// Provider for managing meal plan subscriptions
/// Handles both consumer and partner perspectives with role-based filtering
class MealSubscriptionProvider extends ChangeNotifier {
  List<MealPlanSubscription> _subscriptions = [];
  bool _isLoading = false;
  String? _error;
  
  // Role context
  UserRole? _currentRole;
  String? _currentUserId;
  String? _currentKitchenId;

  // Getters - Base
  List<MealPlanSubscription> get subscriptions => _subscriptions;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  // Getters - Role-based (CRITICAL for consumer-partner separation)
  List<MealPlanSubscription> get mySubscriptions {
    if (_currentRole == UserRole.consumer && _currentUserId != null) {
      return _subscriptions.where((s) => s.consumerId == _currentUserId).toList();
    }
    return [];
  }
  
  List<MealPlanSubscription> get myKitchenSubscribers {
    if (_currentRole == UserRole.partner && _currentKitchenId != null) {
      return _subscriptions.where((s) => s.kitchenId == _currentKitchenId).toList();
    }
    return [];
  }
  
  // Getters - Consumer perspective
  List<MealPlanSubscription> get activeSubscriptions =>
      mySubscriptions.where((s) => s.isActive).toList();
  List<MealPlanSubscription> get pausedSubscriptions =>
      mySubscriptions.where((s) => s.isPaused).toList();
  List<MealPlanSubscription> get expiringSubscriptions =>
      mySubscriptions.where((s) => s.isExpiring).toList();
  
  MealPlanSubscription? get nextMealSubscription {
    try {
      return activeSubscriptions.firstWhere((s) => s.nextMeal != null);
    } catch (e) {
      return null;
    }
  }

  bool get hasActiveSubscriptions => activeSubscriptions.isNotEmpty;
  
  // Getters - Partner perspective
  List<MealPlanSubscription> get activeKitchenSubscribers =>
      myKitchenSubscribers.where((s) => s.isActive).toList();
  List<MealPlanSubscription> get pausedKitchenSubscribers =>
      myKitchenSubscribers.where((s) => s.isPaused).toList();
  List<MealPlanSubscription> get expiringKitchenSubscribers =>
      myKitchenSubscribers.where((s) => s.isExpiring).toList();
  
  int get totalKitchenSubscribers => myKitchenSubscribers.length;
  int get activeKitchenSubscribersCount => activeKitchenSubscribers.length;
  
  /// Set role context for filtering data
  void setContext({
    required String userId,
    required UserRole role,
    String? kitchenId,
  }) {
    _currentUserId = userId;
    _currentRole = role;
    _currentKitchenId = kitchenId;
    notifyListeners();
  }
  
  /// Get current role
  UserRole? get currentRole => _currentRole;

  /// Initialize with mock data for testing
  /// Pass consumerId for consumer view, kitchenId for partner view
  void initializeMockData({String? consumerId, String? kitchenId}) {
    _subscriptions = _generateMockSubscriptions(
      consumerId: consumerId,
      kitchenId: kitchenId,
    );
    notifyListeners();
  }

  /// Generate mock subscriptions
  /// If consumerId is provided: Generate subscriptions for that consumer
  /// If kitchenId is provided: Generate subscriptions for that kitchen's subscribers
  List<MealPlanSubscription> _generateMockSubscriptions({
    String? consumerId,
    String? kitchenId,
  }) {
    final now = DateTime.now();
    final subscriptions = <MealPlanSubscription>[];
    
    // If kitchen ID is provided, generate multiple consumer subscriptions for that kitchen
    if (kitchenId != null) {
      final consumerNames = ['Ahmed Khan', 'Fatima Rahman', 'Karim Ahmed', 'Sultana Begum', 'Rahim Mia'];
      
      for (int i = 0; i < 5; i++) {
        subscriptions.add(MealPlanSubscription(
          id: 'sub_kitchen_00$i',
          consumerId: 'consumer_00$i',
          consumerName: consumerNames[i],
          kitchenId: kitchenId,
          kitchenName: 'Mom\'s Kitchen',
          kitchenLogo: 'M',
          plan: SubscriptionPlan(
            id: 'plan_00$i',
            name: i % 2 == 0 ? '15-Day Lunch Plan' : '30-Day Dinner Plan',
            type: i % 2 == 0 ? PlanType.weekly : PlanType.monthly,
            duration: i % 2 == 0 ? 15 : 30,
            mealsPerDay: 1,
            mealTime: i % 2 == 0 ? MealTime.lunch : MealTime.dinner,
            pricePerMeal: i % 2 == 0 ? 150 : 200,
            totalPrice: i % 2 == 0 ? 2250 : 6000,
            includedItems: ['Main dish', 'Rice', 'Salad'],
          ),
          startDate: now.subtract(Duration(days: 7 + i)),
          endDate: now.add(Duration(days: 8 + i)),
          status: i == 2 ? SubscriptionStatus.paused : SubscriptionStatus.active,
          mealsConsumed: 5 + i,
          mealsSkipped: 0,
          amountPaid: i % 2 == 0 ? 2250 : 6000,
          pausedUntil: i == 2 ? now.add(const Duration(days: 3)) : null,
          deliveryPrefs: DeliveryPreferences(
            address: 'House ${i + 10}, Road ${i + 1}, Dhanmondi, Dhaka',
            landmark: 'Near Dhanmondi Lake',
            phoneNumber: '+880 1712-34567$i',
            preferredTime: TimeOfDay(hour: i % 2 == 0 ? 12 : 20, minute: 0),
          ),
          mealPrefs: MealPreferences(
            spiceLevel: SpiceLevel.medium,
            halal: true,
          ),
          deliveries: _generateMockDeliveries(
            subscriptionId: 'sub_kitchen_00$i',
            startDate: now.subtract(Duration(days: 7 + i)),
            count: i % 2 == 0 ? 15 : 30,
            mealTime: TimeOfDay(hour: i % 2 == 0 ? 12 : 20, minute: 0),
            address: 'House ${i + 10}, Road ${i + 1}, Dhanmondi, Dhaka',
            isPaused: i == 2,
          ),
          createdAt: now.subtract(Duration(days: 10 + i)),
          updatedAt: now,
        ));
      }
      
      return subscriptions;
    }

    // Otherwise, generate subscriptions for the consumer
    final consumerIdToUse = consumerId ?? 'consumer_001';

    // Subscription 1: Active lunch plan
    subscriptions.add(MealPlanSubscription(
      id: 'sub_001',
      consumerId: consumerIdToUse,
      consumerName: 'Ahmed Khan',
      kitchenId: 'kitchen_001',
      kitchenName: 'Mom\'s Kitchen',
      kitchenLogo: 'M',
      plan: SubscriptionPlan(
        id: 'plan_001',
        name: '15-Day Lunch Plan',
        type: PlanType.weekly,
        duration: 15,
        mealsPerDay: 1,
        mealTime: MealTime.lunch,
        pricePerMeal: 150,
        totalPrice: 2250,
        includedItems: ['Main dish', 'Rice', 'Salad', 'Drink'],
        description: 'Delicious home-cooked lunch delivered daily',
      ),
      startDate: now.subtract(const Duration(days: 7)),
      endDate: now.add(const Duration(days: 8)),
      status: SubscriptionStatus.active,
      mealsConsumed: 7,
      mealsSkipped: 0,
      amountPaid: 2250,
      deliveryPrefs: DeliveryPreferences(
        address: 'House 12, Road 5, Dhanmondi, Dhaka',
        landmark: 'Near Dhanmondi Lake',
        phoneNumber: '+880 1712-345678',
        preferredTime: const TimeOfDay(hour: 12, minute: 30),
        contactlessDelivery: false,
        deliveryInstructions: 'Ring the bell twice',
      ),
      mealPrefs: MealPreferences(
        spiceLevel: SpiceLevel.medium,
        allergies: [],
        dislikes: ['Eggplant'],
        halal: true,
      ),
      deliveries: _generateMockDeliveries(
        subscriptionId: 'sub_001',
        startDate: now.subtract(const Duration(days: 7)),
        count: 15,
        mealTime: const TimeOfDay(hour: 12, minute: 30),
        address: 'House 12, Road 5, Dhanmondi, Dhaka',
      ),
      createdAt: now.subtract(const Duration(days: 10)),
      updatedAt: now,
    ));

    // Subscription 2: Paused dinner plan
    subscriptions.add(MealPlanSubscription(
      id: 'sub_002',
      consumerId: consumerIdToUse,
      consumerName: 'Ahmed Khan',
      kitchenId: 'kitchen_002',
      kitchenName: 'Sultana\'s Kitchen',
      kitchenLogo: 'S',
      plan: SubscriptionPlan(
        id: 'plan_002',
        name: '30-Day Dinner Plan',
        type: PlanType.monthly,
        duration: 30,
        mealsPerDay: 1,
        mealTime: MealTime.dinner,
        pricePerMeal: 200,
        totalPrice: 6000,
        includedItems: ['Main dish', 'Rice/Roti', 'Dessert'],
        description: 'Premium dinner service with variety',
      ),
      startDate: now.subtract(const Duration(days: 20)),
      endDate: now.add(const Duration(days: 10)),
      status: SubscriptionStatus.paused,
      mealsConsumed: 10,
      mealsSkipped: 0,
      amountPaid: 6000,
      pausedUntil: now.add(const Duration(days: 3)),
      deliveryPrefs: DeliveryPreferences(
        address: 'House 12, Road 5, Dhanmondi, Dhaka',
        landmark: 'Near Dhanmondi Lake',
        phoneNumber: '+880 1712-345678',
        preferredTime: const TimeOfDay(hour: 20, minute: 0),
        contactlessDelivery: true,
      ),
      mealPrefs: MealPreferences(
        spiceLevel: SpiceLevel.hot,
        allergies: ['Peanuts'],
        dislikes: [],
        halal: true,
      ),
      deliveries: _generateMockDeliveries(
        subscriptionId: 'sub_002',
        startDate: now.subtract(const Duration(days: 20)),
        count: 30,
        mealTime: const TimeOfDay(hour: 20, minute: 0),
        address: 'House 12, Road 5, Dhanmondi, Dhaka',
        isPaused: true,
      ),
      createdAt: now.subtract(const Duration(days: 25)),
      updatedAt: now.subtract(const Duration(days: 1)),
    ));

    return subscriptions;
  }

  /// Generate mock deliveries for a subscription
  List<MealDelivery> _generateMockDeliveries({
    required String subscriptionId,
    required DateTime startDate,
    required int count,
    required TimeOfDay mealTime,
    required String address,
    bool isPaused = false,
  }) {
    final deliveries = <MealDelivery>[];
    final now = DateTime.now();
    final menus = [
      'Chicken Biryani + Salad',
      'Beef Curry + Rice',
      'Fish Fry + Rice',
      'Vegetable Korma + Roti',
      'Chicken Tikka + Naan',
      'Mutton Rezala + Polao',
      'Prawn Malai Curry + Rice',
    ];

    for (int i = 0; i < count; i++) {
      final deliveryDate = startDate.add(Duration(days: i));
      final isPast = deliveryDate.isBefore(now);
      final isToday = deliveryDate.year == now.year &&
          deliveryDate.month == now.month &&
          deliveryDate.day == now.day;

      DeliveryStatus status;
      if (isPaused && !isPast) {
        status = DeliveryStatus.scheduled;
      } else if (isPast) {
        status = DeliveryStatus.delivered;
      } else if (isToday) {
        status = DeliveryStatus.preparing;
      } else {
        status = DeliveryStatus.scheduled;
      }

      deliveries.add(MealDelivery(
        id: 'delivery_${subscriptionId}_$i',
        subscriptionId: subscriptionId,
        scheduledDate: deliveryDate,
        scheduledTime: mealTime,
        menuItem: menus[i % menus.length],
        ingredients: ['Rice', 'Chicken', 'Spices', 'Oil'],
        status: status,
        riderId: isPast ? 'rider_00${(i % 3) + 1}' : null,
        riderName: isPast ? 'Rider ${(i % 3) + 1}' : null,
        preparedAt: isPast ? deliveryDate.add(Duration(hours: mealTime.hour - 1)) : null,
        deliveredAt: isPast ? deliveryDate.add(Duration(hours: mealTime.hour, minutes: mealTime.minute)) : null,
        deliveryAddress: address,
        rating: isPast ? 4.5 + (i % 5) * 0.1 : null,
      ));
    }

    return deliveries;
  }

  // ============================================================================
  // CONSUMER ACTIONS
  // ============================================================================

  /// Fetch subscriptions for a consumer
  Future<void> fetchConsumerSubscriptions(String consumerId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 500));
      _subscriptions = _generateMockSubscriptions(consumerId: consumerId);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Subscribe to a kitchen plan
  Future<void> subscribeToKitchen({
    required String consumerId,
    required String kitchenId,
    required SubscriptionPlan plan,
    required DeliveryPreferences deliveryPrefs,
    required MealPreferences mealPrefs,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      // Simulate API call
      await Future.delayed(const Duration(milliseconds: 800));
      
      final now = DateTime.now();
      final newSubscription = MealPlanSubscription(
        id: 'sub_${DateTime.now().millisecondsSinceEpoch}',
        consumerId: consumerId,
        consumerName: 'User Name', // TODO: Get from user profile
        kitchenId: kitchenId,
        kitchenName: 'Kitchen Name', // TODO: Get from kitchen data
        kitchenLogo: 'K',
        plan: plan,
        startDate: now,
        endDate: now.add(Duration(days: plan.duration)),
        status: SubscriptionStatus.active,
        deliveryPrefs: deliveryPrefs,
        mealPrefs: mealPrefs,
        amountPaid: plan.totalPrice,
        deliveries: _generateMockDeliveries(
          subscriptionId: 'sub_${DateTime.now().millisecondsSinceEpoch}',
          startDate: now,
          count: plan.totalMeals,
          mealTime: deliveryPrefs.preferredTime,
          address: deliveryPrefs.address,
        ),
        createdAt: now,
        updatedAt: now,
      );

      _subscriptions.add(newSubscription);
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Pause a subscription
  Future<void> pauseSubscription(String subscriptionId, DateTime until) async {
    try {
      final index = _subscriptions.indexWhere((s) => s.id == subscriptionId);
      if (index != -1) {
        _subscriptions[index] = _subscriptions[index].copyWith(
          status: SubscriptionStatus.paused,
          pausedUntil: until,
          updatedAt: DateTime.now(),
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Resume a subscription
  Future<void> resumeSubscription(String subscriptionId) async {
    try {
      final index = _subscriptions.indexWhere((s) => s.id == subscriptionId);
      if (index != -1) {
        _subscriptions[index] = _subscriptions[index].copyWith(
          status: SubscriptionStatus.active,
          pausedUntil: null,
          updatedAt: DateTime.now(),
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Cancel a subscription
  Future<void> cancelSubscription(String subscriptionId) async {
    try {
      final index = _subscriptions.indexWhere((s) => s.id == subscriptionId);
      if (index != -1) {
        _subscriptions[index] = _subscriptions[index].copyWith(
          status: SubscriptionStatus.cancelled,
          updatedAt: DateTime.now(),
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Skip a meal
  Future<void> skipMeal(String deliveryId, String reason) async {
    try {
      for (var subscription in _subscriptions) {
        final deliveryIndex = subscription.deliveries.indexWhere((d) => d.id == deliveryId);
        if (deliveryIndex != -1) {
          final updatedDeliveries = List<MealDelivery>.from(subscription.deliveries);
          updatedDeliveries[deliveryIndex] = updatedDeliveries[deliveryIndex].copyWith(
            status: DeliveryStatus.skipped,
          );
          
          final subIndex = _subscriptions.indexWhere((s) => s.id == subscription.id);
          _subscriptions[subIndex] = subscription.copyWith(
            deliveries: updatedDeliveries,
            mealsSkipped: subscription.mealsSkipped + 1,
            updatedAt: DateTime.now(),
          );
          notifyListeners();
          break;
        }
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Change a meal
  Future<void> changeMeal(String deliveryId, String newMenuItem) async {
    try {
      for (var subscription in _subscriptions) {
        final deliveryIndex = subscription.deliveries.indexWhere((d) => d.id == deliveryId);
        if (deliveryIndex != -1) {
          final updatedDeliveries = List<MealDelivery>.from(subscription.deliveries);
          updatedDeliveries[deliveryIndex] = MealDelivery(
            id: updatedDeliveries[deliveryIndex].id,
            subscriptionId: updatedDeliveries[deliveryIndex].subscriptionId,
            scheduledDate: updatedDeliveries[deliveryIndex].scheduledDate,
            scheduledTime: updatedDeliveries[deliveryIndex].scheduledTime,
            menuItem: newMenuItem,
            ingredients: updatedDeliveries[deliveryIndex].ingredients,
            status: updatedDeliveries[deliveryIndex].status,
            deliveryAddress: updatedDeliveries[deliveryIndex].deliveryAddress,
          );
          
          final subIndex = _subscriptions.indexWhere((s) => s.id == subscription.id);
          _subscriptions[subIndex] = subscription.copyWith(
            deliveries: updatedDeliveries,
            updatedAt: DateTime.now(),
          );
          notifyListeners();
          break;
        }
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Update meal preferences
  Future<void> updateMealPreferences(String subscriptionId, MealPreferences prefs) async {
    try {
      final index = _subscriptions.indexWhere((s) => s.id == subscriptionId);
      if (index != -1) {
        _subscriptions[index] = MealPlanSubscription(
          id: _subscriptions[index].id,
          consumerId: _subscriptions[index].consumerId,
          consumerName: _subscriptions[index].consumerName,
          kitchenId: _subscriptions[index].kitchenId,
          kitchenName: _subscriptions[index].kitchenName,
          kitchenLogo: _subscriptions[index].kitchenLogo,
          plan: _subscriptions[index].plan,
          startDate: _subscriptions[index].startDate,
          endDate: _subscriptions[index].endDate,
          status: _subscriptions[index].status,
          mealsConsumed: _subscriptions[index].mealsConsumed,
          mealsSkipped: _subscriptions[index].mealsSkipped,
          amountPaid: _subscriptions[index].amountPaid,
          deliveryPrefs: _subscriptions[index].deliveryPrefs,
          mealPrefs: prefs,
          pausedUntil: _subscriptions[index].pausedUntil,
          deliveries: _subscriptions[index].deliveries,
          createdAt: _subscriptions[index].createdAt,
          updatedAt: DateTime.now(),
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Rate a delivered meal
  Future<void> rateMeal(String deliveryId, double rating, String feedback) async {
    try {
      for (var subscription in _subscriptions) {
        final deliveryIndex = subscription.deliveries.indexWhere((d) => d.id == deliveryId);
        if (deliveryIndex != -1) {
          final updatedDeliveries = List<MealDelivery>.from(subscription.deliveries);
          updatedDeliveries[deliveryIndex] = updatedDeliveries[deliveryIndex].copyWith(
            rating: rating,
            feedback: feedback,
          );
          
          final subIndex = _subscriptions.indexWhere((s) => s.id == subscription.id);
          _subscriptions[subIndex] = subscription.copyWith(
            deliveries: updatedDeliveries,
            updatedAt: DateTime.now(),
          );
          notifyListeners();
          break;
        }
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  // ============================================================================
  // PARTNER ACTIONS
  // ============================================================================

  /// Fetch subscriptions for a kitchen
  Future<void> fetchKitchenSubscriptions(String kitchenId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await Future.delayed(const Duration(milliseconds: 500));
      _subscriptions = _generateMockSubscriptions(
        consumerId: 'consumer_001',
        kitchenId: kitchenId,
      );
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Mark meal as preparing
  Future<void> markMealPreparing(String deliveryId) async {
    await _updateDeliveryStatus(deliveryId, DeliveryStatus.preparing);
  }

  /// Mark meal as ready
  Future<void> markMealReady(String deliveryId) async {
    await _updateDeliveryStatus(deliveryId, DeliveryStatus.ready);
  }

  /// Assign rider to delivery
  Future<void> assignRider(String deliveryId, String riderId, String riderName) async {
    try {
      for (var subscription in _subscriptions) {
        final deliveryIndex = subscription.deliveries.indexWhere((d) => d.id == deliveryId);
        if (deliveryIndex != -1) {
          final updatedDeliveries = List<MealDelivery>.from(subscription.deliveries);
          updatedDeliveries[deliveryIndex] = updatedDeliveries[deliveryIndex].copyWith(
            riderId: riderId,
            riderName: riderName,
            status: DeliveryStatus.outForDelivery,
          );
          
          final subIndex = _subscriptions.indexWhere((s) => s.id == subscription.id);
          _subscriptions[subIndex] = subscription.copyWith(
            deliveries: updatedDeliveries,
            updatedAt: DateTime.now(),
          );
          notifyListeners();
          break;
        }
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Mark meal as delivered
  Future<void> markMealDelivered(String deliveryId) async {
    try {
      for (var subscription in _subscriptions) {
        final deliveryIndex = subscription.deliveries.indexWhere((d) => d.id == deliveryId);
        if (deliveryIndex != -1) {
          final updatedDeliveries = List<MealDelivery>.from(subscription.deliveries);
          updatedDeliveries[deliveryIndex] = updatedDeliveries[deliveryIndex].copyWith(
            status: DeliveryStatus.delivered,
            deliveredAt: DateTime.now(),
          );
          
          final subIndex = _subscriptions.indexWhere((s) => s.id == subscription.id);
          _subscriptions[subIndex] = subscription.copyWith(
            deliveries: updatedDeliveries,
            mealsConsumed: subscription.mealsConsumed + 1,
            updatedAt: DateTime.now(),
          );
          notifyListeners();
          break;
        }
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Helper method to update delivery status
  Future<void> _updateDeliveryStatus(String deliveryId, DeliveryStatus status) async {
    try {
      for (var subscription in _subscriptions) {
        final deliveryIndex = subscription.deliveries.indexWhere((d) => d.id == deliveryId);
        if (deliveryIndex != -1) {
          final updatedDeliveries = List<MealDelivery>.from(subscription.deliveries);
          updatedDeliveries[deliveryIndex] = updatedDeliveries[deliveryIndex].copyWith(
            status: status,
            preparedAt: status == DeliveryStatus.preparing ? DateTime.now() : updatedDeliveries[deliveryIndex].preparedAt,
          );
          
          final subIndex = _subscriptions.indexWhere((s) => s.id == subscription.id);
          _subscriptions[subIndex] = subscription.copyWith(
            deliveries: updatedDeliveries,
            updatedAt: DateTime.now(),
          );
          notifyListeners();
          break;
        }
      }
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Get deliveries for a specific date
  List<MealDelivery> getDeliveriesForDate(DateTime date) {
    final allDeliveries = <MealDelivery>[];
    for (var subscription in _subscriptions) {
      final dateDeliveries = subscription.deliveries.where((d) =>
        d.scheduledDate.year == date.year &&
        d.scheduledDate.month == date.month &&
        d.scheduledDate.day == date.day
      );
      allDeliveries.addAll(dateDeliveries);
    }
    return allDeliveries;
  }

  /// Get subscription by ID
  MealPlanSubscription? getSubscriptionById(String id) {
    try {
      return _subscriptions.firstWhere((s) => s.id == id);
    } catch (e) {
      return null;
    }
  }
}
