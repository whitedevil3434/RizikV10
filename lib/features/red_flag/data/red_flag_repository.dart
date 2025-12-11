import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';

/// Red Flag Repository Provider
final redFlagRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return RedFlagRepository(apiClient);
});

/// Red Flag Repository
/// Handles AI Red Flag analysis
class RedFlagRepository {
  final RizikApiClient _apiClient;

  RedFlagRepository(this._apiClient);

  /// Analyze profile/text for red flags
  Future<Map<String, dynamic>> analyzeRisk(String input, {String type = 'text'}) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/red-flag/analyze', data: {
        'user_id': user.id,
        'input': input,
        'type': type,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to analyze risk: $e';
    }
  }
}
