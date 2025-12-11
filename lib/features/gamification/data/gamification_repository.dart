import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Gamification Repository Provider
final gamificationRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return GamificationRepository(apiClient);
});

/// Gamification Repository
/// Handles API calls for Leaderboards and Achievements
class GamificationRepository {
  final RizikApiClient _apiClient;
  final SupabaseClient _supabase = Supabase.instance.client;

  GamificationRepository(this._apiClient);

  /// Get leaderboard
  Future<List<dynamic>> getLeaderboard({String period = 'weekly'}) async {
    try {
      final response = await _apiClient.get('/api/gamification/leaderboard?period=$period');
      return List<dynamic>.from(response.data);
    } catch (e) {
      return [];
    }
  }

  /// Get my achievements
  Future<List<dynamic>> getAchievements() async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.get('/api/gamification/achievements');
      return List<dynamic>.from(response.data);
    } catch (e) {
      return [];
    }
  }
}
