import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String _defaultSupabaseUrl =
      'https://dxekolvveoadbaftfsmy.supabase.co';
  static const String _defaultSupabaseAnonKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg';

  static String get supabaseUrl {
    const envUrl = String.fromEnvironment('SUPABASE_URL');
    return envUrl.isNotEmpty ? envUrl : _defaultSupabaseUrl;
  }

  static String get supabaseAnonKey {
    const envKey = String.fromEnvironment('SUPABASE_ANON_KEY');
    return envKey.isNotEmpty ? envKey : _defaultSupabaseAnonKey;
  }

  // MCP Server endpoint
  static const String mcpServerUrl =
      'https://mcp.supabase.com/mcp?project_ref=dxekolvveoadbaftfsmy';

  // Service role key MUST come from environment at runtime.
  static String get supabaseSecretKey =>
      const String.fromEnvironment('SUPABASE_SERVICE_ROLE_KEY');

  static Future<void> initialize() async {
    if (supabaseUrl.isEmpty || supabaseAnonKey.isEmpty) {
      throw StateError(
        'Supabase credentials are missing. Set --dart-define=SUPABASE_URL and --dart-define=SUPABASE_ANON_KEY.',
      );
    }
    await Supabase.initialize(
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    );
  }

  static SupabaseClient get client => Supabase.instance.client;

  // Method to get the MCP authentication headers
  static Map<String, String> getMcpHeaders(String accessToken) {
    return {
      'Authorization': 'Bearer $accessToken',
      'apikey': supabaseAnonKey,
      'Content-Type': 'application/json',
    };
  }
}
