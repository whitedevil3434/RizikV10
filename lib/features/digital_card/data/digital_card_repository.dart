import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';

/// Digital Card Repository Provider
final digitalCardRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return DigitalCardRepository(apiClient);
});

/// Digital Card Repository
/// Handles API calls for Digital Visiting Card
class DigitalCardRepository {
  final RizikApiClient _apiClient;

  DigitalCardRepository(this._apiClient);

  /// Get my card
  Future<Map<String, dynamic>> getMyCard() async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.get('/api/card/${user.id}');
      return response.data;
    } catch (e) {
      // If 404, return empty or default
      return {};
    }
  }

  /// Update card
  Future<Map<String, dynamic>> updateCard({
    required Map<String, dynamic> profileData,
    required Map<String, dynamic> theme,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/card/update/$user.id', data: {
        'profile_data': profileData,
        'theme': theme,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to update card: $e';
    }
  }

  /// Share card (Generate link)
  Future<String> getShareLink() async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';
    return 'https://rizik.app/card/${user.id}';
  }
}
