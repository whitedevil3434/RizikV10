import 'package:supabase_flutter/supabase_flutter.dart';
import '../../core/config/env_config.dart';

class NetworkWrapper {
  static Future<void> init() async {
    print("NetworkWrapper Initialized");
    
    // Initialize Supabase
    await Supabase.initialize(
      url: EnvConfig.supabaseUrl,
      anonKey: EnvConfig.supabaseAnonKey,
      debug: EnvConfig.isDev,
    );
    
    print("✅ Supabase Initialized");
  }
}
