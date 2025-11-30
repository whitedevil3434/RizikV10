import 'dart:developer';

class LogWrapper {
  static Future<void> init() async {
    print("LogWrapper Initialized");
  }

  static void info(String message) {
    log("ℹ️ $message");
  }

  static void success(String message) {
    log("✅ $message");
  }

  static void error(String message) {
    log("❌ $message");
  }
}
