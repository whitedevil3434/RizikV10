class CrashlyticsWrapper {
  static Future<void> init() async {
    print("CrashlyticsWrapper Initialized");
  }

  static void recordFatalError(Object error, StackTrace stack) {
    print("FATAL ERROR: $error\n$stack");
  }
}
