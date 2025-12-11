import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String supabaseUrl = 'https://dxekolvveoadbaftfsmy.supabase.co';
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg';
  
  // MCP Server endpoint
  static const String mcpServerUrl = 'https://mcp.supabase.com/mcp?project_ref=dxekolvveoadbaftfsmy';
  
  // Secret key for service role access (updated with correct key)
  static const String supabaseSecretKey = 'sb_secret_JBlPRGqmmXpV-1thOY1YiA_yODabAOu';
  
  static Future<void> initialize() async {
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