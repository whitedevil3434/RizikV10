import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';

/// Vibe Check Repository Provider
final vibeCheckRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return VibeCheckRepository(apiClient);
});

/// Vibe Check Repository
/// Handles AI Vibe Check interactions
class VibeCheckRepository {
  final RizikApiClient _apiClient;

  VibeCheckRepository(this._apiClient);

  /// Analyze text
  Future<Map<String, dynamic>> analyzeText(String text) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/vibe-check/analyze', data: {
        'user_id': user.id,
        'text': text,
        'type': 'text',
      });
      return response.data;
    } catch (e) {
      throw 'Failed to analyze text: $e';
    }
  }

  /// Analyze image (screenshot)
  Future<Map<String, dynamic>> analyzeImage(String base64Image) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/vibe-check/analyze', data: {
        'user_id': user.id,
        'image': base64Image,
        'type': 'image',
      });
      return response.data;
    } catch (e) {
      throw 'Failed to analyze image: $e';
    }
  }

  /// Get history
  Future<List<dynamic>> getHistory() async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.get('/api/vibe-check/history/${user.id}');
      return response.data['history'] ?? [];
    } catch (e) {
      throw 'Failed to fetch history: $e';
    }
  }
}
