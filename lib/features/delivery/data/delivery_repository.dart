import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Delivery Repository Provider
final deliveryRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return DeliveryRepository(apiClient);
});

/// Delivery Repository
/// Handles API calls for Delivery Chain
class DeliveryRepository {
  final RizikApiClient _apiClient;
  final SupabaseClient _supabase = Supabase.instance.client;

  DeliveryRepository(this._apiClient);

  /// Create delivery order
  Future<Map<String, dynamic>> createOrder({
    required String pickupAddress,
    required String dropoffAddress,
    required double weight,
    required double distance,
    required bool isUrgent,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/delivery/order', data: {
        'consumer_id': user.id,
        'pickup_address': pickupAddress,
        'dropoff_address': dropoffAddress,
        'weight_kg': weight,
        'distance_km': distance,
        'is_urgent': isUrgent,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to create order: $e';
    }
  }

  /// Get available orders (for movers)
  Future<List<dynamic>> getAvailableOrders() async {
    try {
      final response = await _supabase
          .from('delivery_orders')
          .select('*')
          .eq('status', 'PENDING')
          .order('created_at', ascending: false);
      return response;
    } catch (e) {
      return [];
    }
  }

  /// Accept order
  Future<Map<String, dynamic>> acceptOrder(String orderId) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/delivery/order/$orderId/accept', data: {
        'mover_id': user.id,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to accept order: $e';
    }
  }

  /// Update status (with location)
  Future<Map<String, dynamic>> updateStatus({
    required String orderId,
    required String status,
    required double lat,
    required double lng,
  }) async {
    try {
      final response = await _apiClient.post('/api/delivery/order/$orderId/status', data: {
        'status': status,
        'lat': lat,
        'lng': lng,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to update status: $e';
    }
  }

  /// Confirm delivery
  Future<Map<String, dynamic>> confirmDelivery({
    required String orderId,
    required String proofImageUrl,
  }) async {
    try {
      final response = await _apiClient.post('/api/delivery/order/$orderId/confirm', data: {
        'proof_image_url': proofImageUrl,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to confirm delivery: $e';
    }
  }
}
