import 'package:flutter/foundation.dart';

class EnvConfig {
  // Environment
  static bool get isDev => kDebugMode;
  static bool get isProd => kReleaseMode;

  // ═══════════════════════════════════════════════════════════════════
  // 🔧 LOCAL DEV MODE
  // Set with: --dart-define=LOCAL_BACKEND=true
  // ═══════════════════════════════════════════════════════════════════
  static const String _localBackendFlag = String.fromEnvironment(
    'LOCAL_BACKEND',
    defaultValue: 'false',
  );
  static bool get useLocalBackend => _localBackendFlag.toLowerCase() == 'true';

  static const String _offlineModeFlag = String.fromEnvironment(
    'OFFLINE_MODE',
    defaultValue: 'false',
  );
  static bool get offlineMode => _offlineModeFlag.toLowerCase() == 'true';

  // Supabase Configuration
  static String get supabaseUrl => const String.fromEnvironment(
        'SUPABASE_URL',
      );

  static String get supabaseAnonKey => const String.fromEnvironment(
        'SUPABASE_ANON_KEY',
      );

  // ═══════════════════════════════════════════════════════════════════
  // Backend Configuration - PRODUCTION READY
  // ═══════════════════════════════════════════════════════════════════
  static String get backendUrl {
    // 1. Explicit override (recommended)
    const String envUrl = String.fromEnvironment('BACKEND_URL');
    if (envUrl.isNotEmpty) return envUrl;

    // 2. Local development mode (only if explicitly enabled)
    if (useLocalBackend) {
      // Android emulator uses 10.0.2.2 to reach host machine
      if (defaultTargetPlatform == TargetPlatform.android) {
        return 'http://10.0.2.2:8787'; // 🔥 Workers Default Port
      }
      // iOS simulator and macOS/Linux/Windows use localhost
      return 'http://127.0.0.1:8787'; // 🔥 Workers Default Port
    }

    // 3. Deployed backend default
    return 'https://link-call-web.vercel.app';
  }

  static String get livekitWsUrl => const String.fromEnvironment(
        'LIVEKIT_WS_URL',
        defaultValue: 'wss://rizik-ai-femz194x.livekit.cloud',
      );

  static String get agentWebSocketUrl {
    final httpUrl = backendUrl;
    final wsUrl = httpUrl.replaceFirst(RegExp(r'^http'), 'ws');
    return '$wsUrl/api/agent/voice';
  }

  static Future<void> init() async {
    print('✅ EnvConfig Initialized');
    print('📍 Backend URL: $backendUrl');
    print('🎙️ LiveKit URL: $livekitWsUrl');

    if (isDev) {
      print('🔧 Running in DEVELOPMENT mode');
      print('🔧 useLocalBackend: $useLocalBackend');
      print('📴 offlineMode: $offlineMode');
    } else {
      print('🚀 Running in PRODUCTION mode');
    }
  }
}
