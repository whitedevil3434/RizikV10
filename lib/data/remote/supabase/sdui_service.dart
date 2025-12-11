import 'package:supabase_flutter/supabase_flutter.dart';

class SduiService {
  final SupabaseClient _supabase = Supabase.instance.client;

  Future<Map<String, dynamic>> fetchScreen(String role, {String screenId = 'home'}) async {
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
      print('Error fetching screen data: $e');
      rethrow; // Let the UI handle the error
    }
  }
}
