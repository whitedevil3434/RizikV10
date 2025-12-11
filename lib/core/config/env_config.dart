import 'package:flutter/foundation.dart';

class EnvConfig {
  // Environment
  static bool get isDev => kDebugMode;
  static bool get isProd => kReleaseMode;
  
  // Supabase Configuration
  // TODO: Move these to .env file for production
  static String get supabaseUrl => 
    const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'https://dxekolvveoadbaftfsmy.supabase.co',
    );
  
  static String get supabaseAnonKey => 
    const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg',
    );

  // Backend Configuration
  static String get backendUrl {
    const String envUrl = String.fromEnvironment('BACKEND_URL');
    if (envUrl.isNotEmpty) return envUrl;

    if (kDebugMode) {
      if (defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:8787';
      }
      return 'https://api.rizik.app'; // Placeholder for production, localhost removed
    }

    // Default to Production Backend for stability
    return 'https://rizik-backend.its-sabbir69.workers.dev';
  }
  
  static Future<void> init() async {
    print("EnvConfig Initialized");
    
    if (isDev) {
      print("🔧 Running in DEVELOPMENT mode");
      print("📍 Supabase URL: $supabaseUrl");
    } else {
      print("🚀 Running in PRODUCTION mode");
    }
  }
}
