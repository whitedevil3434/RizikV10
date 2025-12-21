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
        // For Android Emulator, use 10.0.2.2 but point to the Cloudflare Worker if running locally
        // Or keep pointing to the live dev environment if that's the goal.
        // User requested: "Update lib/core/config/app_config.dart... Set URL: Change the base URL to https://rizik-web.its-sabbir69.workers.dev"
        // I will default to the live URL even in debug for this "Integration Phase" to ensure we test the brain.
        return 'https://rizik-web.its-sabbir69.workers.dev';
      }
      return 'https://rizik-web.its-sabbir69.workers.dev';
    }

    // Default to Production Backend
    return 'https://rizik-web.its-sabbir69.workers.dev';
  }
  
  static Future<void> init() async {
    print("EnvConfig Initialized");
    
    if (isDev) {
      print("🔧 Running in DEVELOPMENT mode");
      print("📍 Supabase URL: $supabaseUrl");
      print("📍 Backend URL: $backendUrl");
    } else {
      print("🚀 Running in PRODUCTION mode");
    }
  }
}
