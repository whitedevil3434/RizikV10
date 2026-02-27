import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/foundation.dart';
import 'package:rizik_v4/core/config/env_config.dart';

class SduiService {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<Map<String, dynamic>> fetchScreen(String role,
      {String screenId = 'home'}) async {
    if (EnvConfig.offlineMode) {
      return const {};
    }
    try {
      final response = await _supabase
          .from('app_screens')
          .select('screen_data')
          .eq('role', role)
          .eq('screen_id', screenId)
          .single();

      if (response['screen_data'] != null) {
        return response['screen_data'] as Map<String, dynamic>;
      } else {
        throw Exception('No screen data found for role: $role');
      }
    } catch (e) {
      debugPrint('SDUI fetch fallback for role=$role screen=$screenId: $e');
      return const {};
    }
  }
}
