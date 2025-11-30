import 'package:supabase_flutter/supabase_flutter.dart';

class SupabaseConfig {
  static const String supabaseUrl = 'https://dxekolvveoadbaftfsmy.supabase.co';
  static const String supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4OTU0MzcsImV4cCI6MjA0NjQ3MTQzN30.X9J6uLkD5f4d3Q2h1p0q9v8n7b6c5a4z3x2w1v0u9t8';
  
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