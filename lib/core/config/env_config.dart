import 'dart:io';
import 'package:flutter/foundation.dart';

class EnvConfig {
  // Environment
  static bool get isDev => kDebugMode;
  static bool get isProd => kReleaseMode;
  
  // ═══════════════════════════════════════════════════════════════════
  // 🔧 LOCAL DEV MODE: Set to true to use local token server
  // Set to false for production or when testing with deployed backend
  // ═══════════════════════════════════════════════════════════════════
  static const bool useLocalBackend = true; // 🔥 Set to TRUE to test Voice Agent
  
  // Supabase Configuration
  static String get supabaseUrl => 
    const String.fromEnvironment(
      'SUPABASE_URL',
      defaultValue: 'https://dxekolvveoadbaftfsmy.supabase.co',
    );
  
  static String get supabaseAnonKey => 
    const String.fromEnvironment(
      'SUPABASE_ANON_KEY',
      defaultValue: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg',
      // Note: This matches the leaked/provided key in the Context file.
    );

  // ═══════════════════════════════════════════════════════════════════
  // Backend Configuration - PRODUCTION READY
  // ═══════════════════════════════════════════════════════════════════
  static String get backendUrl {
    // 1. Check environment variable first (CI/CD override)
    const String envUrl = String.fromEnvironment('BACKEND_URL');
    if (envUrl.isNotEmpty) return envUrl;

    // 2. Local development mode (only if explicitly enabled)
    if (useLocalBackend || kDebugMode) {
      // Android emulator uses 10.0.2.2 to reach host machine
      if (defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:8787'; // 🔥 Workers Default Port
      }
      // iOS simulator and macOS/Linux/Windows use localhost
      return 'http://127.0.0.1:8787'; // 🔥 Workers Default Port
    }

    // 3. ✅ PRODUCTION: Vercel (Old Link Call Deployment)
    return 'https://link-call-web.vercel.app';
  }

  static String get agentWebSocketUrl {
    final httpUrl = backendUrl;
    final wsUrl = httpUrl.replaceFirst(RegExp(r'^http'), 'ws');
    return '$wsUrl/api/agent/voice';
  }
  
  static Future<void> init() async {
    print("✅ EnvConfig Initialized");
    print("📍 Backend URL: $backendUrl");
    
    if (isDev) {
      print("🔧 Running in DEVELOPMENT mode");
      print("🔧 useLocalBackend: $useLocalBackend");
    } else {
      print("🚀 Running in PRODUCTION mode");
    }
  }
}
