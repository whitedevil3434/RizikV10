import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Earning Repository Provider
final earningRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return EarningRepository(apiClient);
});

/// Earning Repository
/// Handles API calls for Earnings and Transactions
class EarningRepository {
  final RizikApiClient _apiClient;
  final SupabaseClient _supabase = Supabase.instance.client;

  EarningRepository(this._apiClient);

  /// Get earning summary
  Future<Map<String, dynamic>> getSummary() async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.get('/api/wallet/summary');
      return response.data;
    } catch (e) {
      // Return default if error
      return {'balance': 0.0, 'pending_balance': 0.0, 'total_earned': 0.0};
    }
  }

  /// Get transaction history
  Future<List<dynamic>> getTransactions() async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.get('/api/wallet/transactions');
      return List<dynamic>.from(response.data);
    } catch (e) {
      return [];
    }
  }

  /// Request withdrawal
  Future<Map<String, dynamic>> withdraw({
    required double amount,
    required String method, // bkash, nagad, bank
    required String accountInfo,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/wallet/withdraw', data: {
        'user_id': user.id,
        'amount': amount,
        'method': method,
        'account_info': accountInfo,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to request withdrawal: $e';
    }
  }
}
