import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';

/// Safe Deal Repository Provider
final safeDealRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return SafeDealRepository(apiClient);
});

/// Safe Deal Repository
/// Handles API calls for the Safe-Deal System
class SafeDealRepository {
  final RizikApiClient _apiClient;

  SafeDealRepository(this._apiClient);

  /// Create a safe deal
  Future<Map<String, dynamic>> createDeal({
    required String title,
    required String description,
    required double amount,
    required String buyerContact,
    required String deliveryMethod,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/safe-deal/create', data: {
        'seller_id': user.id,
        'title': title,
        'description': description,
        'amount': amount,
        'buyer_contact': buyerContact,
        'delivery_method': deliveryMethod,
      });
      
      return response.data;
    } catch (e) {
      throw 'Failed to create deal: $e';
    }
  }

  /// Get deal details
  Future<Map<String, dynamic>> getDeal(String dealCode) async {
    try {
      final response = await _apiClient.get('/api/safe-deal/$dealCode');
      return response.data;
    } catch (e) {
      throw 'Failed to fetch deal: $e';
    }
  }

  /// Confirm delivery
  Future<Map<String, dynamic>> confirmDelivery(String dealCode, String buyerContact) async {
    try {
      final response = await _apiClient.post('/api/safe-deal/$dealCode/confirm', data: {
        'buyer_contact': buyerContact,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to confirm delivery: $e';
    }
  }

  /// Raise dispute
  Future<Map<String, dynamic>> raiseDispute(String dealCode, String reason) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/safe-deal/$dealCode/dispute', data: {
        'raised_by': user.id,
        'reason': reason,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to raise dispute: $e';
    }
  }
}
