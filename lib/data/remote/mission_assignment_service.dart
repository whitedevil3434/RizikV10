import 'package:flutter/foundation.dart';
import 'dart:async';
import 'dart:math' as math;
import 'package:rizik_v4/data/models/order.dart';

/// Service for managing mission assignment to riders
/// Handles rider discovery, mission creation, and reward calculation
class MissionAssignmentService {
  // Stream controller for broadcasting new mission offers to the UI
  final _missionStreamController = StreamController<Map<String, dynamic>>.broadcast();

  /// Stream of new mission offers
  Stream<Map<String, dynamic>> get missionStream => _missionStreamController.stream;

  /// Dispose the stream controller
  void dispose() {
    _missionStreamController.close();
  }

  /// Assign a rider to an order when it's ready for pickup
  /// Finds nearby available riders and sends mission offers
  Future<void> assignRiderToOrder(String orderId, Order order) async {
    try {
      debugPrint('Starting rider assignment for order: $orderId');
      
      // Find nearby riders within 5km radius
      final nearbyRiders = await _findNearbyRiders(
        location: order.deliveryAddress,
        radius: 5000, // 5km
      );
      
      debugPrint('Found ${nearbyRiders.length} nearby riders');
      
      // Filter online and available riders
      final availableRiders = nearbyRiders
          .where((rider) => rider['isOnline'] == true && rider['isAvailable'] == true)
          .toList();
      
      debugPrint('${availableRiders.length} riders are available');
      
      if (availableRiders.isEmpty) {
        debugPrint('No available riders found for order: $orderId');
        // In production, this would trigger a notification to expand search radius
        // or queue the order for later assignment
        return;
      }
      
      // Calculate mission reward
      final reward = _calculateMissionReward(order);
      
      // Create mission data
      final mission = _createMissionFromOrder(order, reward);
      
      // Send mission offers to all available riders
      for (final rider in availableRiders) {
        await _sendMissionOffer(rider['id'] as String, mission);
      }
      
      // Broadcast to stream for UI simulation
      _missionStreamController.add(mission);
      
      debugPrint('Mission offers sent to ${availableRiders.length} riders');
    } catch (e) {
      debugPrint('Error assigning rider to order: $e');
    }
  }

  /// Find nearby riders within specified radius
  /// In production, this would query Supabase with geospatial queries
  Future<List<Map<String, dynamic>>> _findNearbyRiders({
    required String location,
    required double radius,
  }) async {
    try {
      // In production, this would be:
      // final response = await SupabaseConfig.client
      //     .from('riders')
      //     .select()
      //     .eq('is_online', true)
      //     .within('location', location, radius);
      
      // For now, return mock data
      return _getMockNearbyRiders();
    } catch (e) {
      debugPrint('Error finding nearby riders: $e');
      return [];
    }
  }

  /// Calculate mission reward based on order details
  /// Formula: Base fare + (Distance × Per KM rate) + Order value bonus
  double _calculateMissionReward(Order order) {
    const double baseFare = 30.0; // Base delivery fee
    const double perKmRate = 10.0; // Rate per kilometer
    const double orderValueBonusRate = 0.05; // 5% of order value as bonus
    
    // Estimate distance (in production, calculate from coordinates)
    final estimatedDistance = _estimateDistance(order.deliveryAddress);
    
    // Calculate distance-based fare
    final distanceFare = estimatedDistance * perKmRate;
    
    // Calculate order value bonus (incentive for high-value orders)
    final orderValueBonus = order.total * orderValueBonusRate;
    
    // Total reward
    final totalReward = baseFare + distanceFare + orderValueBonus;
    
    // Round to nearest 10 taka
    return (totalReward / 10).round() * 10.0;
  }

  /// Estimate distance based on address (mock implementation)
  /// In production, use Google Maps Distance Matrix API
  double _estimateDistance(String address) {
    // Mock distance calculation based on address length
    // In production, calculate actual distance using coordinates
    final random = math.Random(address.hashCode);
    return 2.0 + random.nextDouble() * 6.0; // 2-8 km range
  }

  /// Create mission data structure from order
  Map<String, dynamic> _createMissionFromOrder(Order order, double reward) {
    return {
      'isMission': true,
      'orderId': order.id,
      'restaurantName': _extractRestaurantName(order),
      'pickupAddress': _extractPickupAddress(order),
      'customerName': 'Customer ${order.id.substring(0, 4)}',
      'dropoffAddress': order.deliveryAddress,
      'distance': _estimateDistance(order.deliveryAddress).toStringAsFixed(1),
      'estimatedTime': _calculateEstimatedTime(order),
      'reward': reward.round(),
      'items': order.items.map((item) => '${item.name} x${item.quantity}').toList(),
      'otp': _generateOTP(order.id),
      'status': 'available',
      'createdAt': DateTime.now().toIso8601String(),
    };
  }

  /// Extract restaurant name from order items
  /// In production, this would come from order metadata
  String _extractRestaurantName(Order order) {
    // Mock implementation - in production, get from order.restaurantId
    if (order.items.isNotEmpty) {
      final firstItem = order.items.first.name;
      if (firstItem.contains('Biryani') || firstItem.contains('বিরিয়ানি')) {
        return 'কাচ্চি ভাই';
      } else if (firstItem.contains('Burger') || firstItem.contains('বার্গার')) {
        return 'বার্গার কিং';
      } else if (firstItem.contains('Pizza') || firstItem.contains('পিজা')) {
        return 'পিজা হাট';
      }
    }
    return 'Cloud Kitchen';
  }

  /// Extract pickup address from order
  /// In production, this would come from restaurant data
  String _extractPickupAddress(Order order) {
    // Mock implementation - in production, get from restaurant.address
    return 'গুলশান ১, ঢাকা';
  }

  /// Calculate estimated delivery time in minutes
  int _calculateEstimatedTime(Order order) {
    final distance = _estimateDistance(order.deliveryAddress);
    const double avgSpeedKmPerHour = 20.0; // Average bike speed in city
    const int pickupTime = 5; // Minutes to pickup
    
    final travelTimeMinutes = (distance / avgSpeedKmPerHour * 60).round();
    return pickupTime + travelTimeMinutes;
  }

  /// Generate OTP for order verification
  String _generateOTP(String orderId) {
    final hash = orderId.hashCode.abs();
    final otp = 1000 + (hash % 9000);
    return otp.toString();
  }

  /// Send mission offer to a specific rider
  /// In production, this would use push notifications and Supabase
  Future<void> _sendMissionOffer(String riderId, Map<String, dynamic> mission) async {
    try {
      // In production, this would:
      // 1. Insert mission into 'missions' table
      // 2. Send push notification to rider
      // 3. Create real-time subscription for acceptance
      
      // await SupabaseConfig.client
      //     .from('missions')
      //     .insert({
      //       ...mission,
      //       'rider_id': riderId,
      //       'status': 'offered',
      //     });
      
      // await _sendPushNotification(riderId, {
      //   'title': 'নতুন মিশন!',
      //   'body': 'আয়: ৳${mission['reward']} - ${mission['distance']} কিমি',
      //   'data': mission,
      // });
      
      debugPrint('Mission offer sent to rider: $riderId');
    } catch (e) {
      debugPrint('Error sending mission offer: $e');
    }
  }

  /// Get mock nearby riders for development
  List<Map<String, dynamic>> _getMockNearbyRiders() {
    return [
      {
        'id': 'rider_001',
        'name': 'করিম মিয়া',
        'isOnline': true,
        'isAvailable': true,
        'rating': 4.8,
        'totalDeliveries': 342,
        'location': {'lat': 23.7808, 'lng': 90.4194}, // Gulshan
      },
      {
        'id': 'rider_002',
        'name': 'রহিম উদ্দিন',
        'isOnline': true,
        'isAvailable': true,
        'rating': 4.6,
        'totalDeliveries': 256,
        'location': {'lat': 23.7925, 'lng': 90.4078}, // Banani
      },
      {
        'id': 'rider_003',
        'name': 'আব্দুল্লাহ',
        'isOnline': true,
        'isAvailable': false, // Busy with another delivery
        'rating': 4.9,
        'totalDeliveries': 489,
        'location': {'lat': 23.7461, 'lng': 90.3742}, // Dhanmondi
      },
      {
        'id': 'rider_004',
        'name': 'সাইফুল ইসলাম',
        'isOnline': false, // Offline
        'isAvailable': false,
        'rating': 4.7,
        'totalDeliveries': 198,
        'location': {'lat': 23.8103, 'lng': 90.4125}, // Uttara
      },
      {
        'id': 'rider_005',
        'name': 'জাহিদ হাসান',
        'isOnline': true,
        'isAvailable': true,
        'rating': 4.5,
        'totalDeliveries': 167,
        'location': {'lat': 23.7679, 'lng': 90.4255}, // Mohakhali
      },
    ];
  }

  /// Broadcast mission to multiple riders (alternative to individual offers)
  /// Used when urgency is high or no riders accepted initial offers
  Future<void> broadcastMission(String orderId, Order order, {double radiusKm = 10.0}) async {
    try {
      debugPrint('Broadcasting mission for order: $orderId with radius: $radiusKm km');
      
      final nearbyRiders = await _findNearbyRiders(
        location: order.deliveryAddress,
        radius: radiusKm * 1000, // Convert to meters
      );
      
      final availableRiders = nearbyRiders
          .where((rider) => rider['isOnline'] == true && rider['isAvailable'] == true)
          .toList();
      
      if (availableRiders.isEmpty) {
        debugPrint('No riders available for broadcast');
        return;
      }
      
      // Increase reward for broadcast (urgency bonus)
      final baseReward = _calculateMissionReward(order);
      const urgencyBonus = 20.0; // Extra ৳20 for urgent delivery
      final totalReward = baseReward + urgencyBonus;
      
      final mission = _createMissionFromOrder(order, totalReward);
      mission['isBroadcast'] = true;
      mission['urgencyBonus'] = urgencyBonus;
      
      for (final rider in availableRiders) {
        await _sendMissionOffer(rider['id'] as String, mission);
      }
      
      debugPrint('Broadcast mission sent to ${availableRiders.length} riders');
    } catch (e) {
      debugPrint('Error broadcasting mission: $e');
    }
  }

  /// Cancel mission assignment (if order is cancelled)
  Future<void> cancelMissionAssignment(String orderId) async {
    try {
      // In production, this would:
      // 1. Update mission status to 'cancelled'
      // 2. Notify riders who received the offer
      // 3. Remove from active missions queue
      
      debugPrint('Mission assignment cancelled for order: $orderId');
    } catch (e) {
      debugPrint('Error cancelling mission assignment: $e');
    }
  }

  /// Reassign mission if rider rejects or times out
  Future<void> reassignMission(String orderId, Order order, {List<String>? excludeRiderIds}) async {
    try {
      debugPrint('Reassigning mission for order: $orderId');
      
      final nearbyRiders = await _findNearbyRiders(
        location: order.deliveryAddress,
        radius: 7000, // Expand radius to 7km for reassignment
      );
      
      // Filter out riders who already rejected
      final availableRiders = nearbyRiders
          .where((rider) => 
              rider['isOnline'] == true && 
              rider['isAvailable'] == true &&
              !(excludeRiderIds?.contains(rider['id']) ?? false))
          .toList();
      
      if (availableRiders.isEmpty) {
        // Broadcast to wider area if no riders available
        await broadcastMission(orderId, order, radiusKm: 15.0);
        return;
      }
      
      // Increase reward for reassignment
      final baseReward = _calculateMissionReward(order);
      const reassignmentBonus = 15.0;
      final totalReward = baseReward + reassignmentBonus;
      
      final mission = _createMissionFromOrder(order, totalReward);
      mission['isReassignment'] = true;
      
      for (final rider in availableRiders) {
        await _sendMissionOffer(rider['id'] as String, mission);
      }
      
      debugPrint('Mission reassigned to ${availableRiders.length} new riders');
    } catch (e) {
      debugPrint('Error reassigning mission: $e');
    }
  }
}
