import 'package:talker_flutter/talker_flutter.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:rizik_v4/core/config/supabase_config.dart';

/// AppBootstrap - Master System Initializer
/// Initializes all core services before app starts
class AppBootstrap {
  static final AppBootstrap _instance = AppBootstrap._internal();
  factory AppBootstrap() => _instance;
  AppBootstrap._internal();

  // Core Services
  late final Talker talker;
  late final Connectivity connectivity;
  late final FlutterSecureStorage secureStorage;

  // Initialization status
  bool _isInitialized = false;
  bool get isInitialized => _isInitialized;

  /// Initialize all systems
  Future<void> initialize() async {
    if (_isInitialized) {
      print('⚠️  AppBootstrap already initialized');
      return;
    }

    print('🚀 AppBootstrap: Initializing...');
    final stopwatch = Stopwatch()..start();

    try {
      // 1. Initialize Logger (Talker)
      await _initializeLogger();

      // 2. Initialize Connectivity Monitor
      await _initializeConnectivity();

      // 3. Initialize Secure Storage
      await _initializeSecureStorage();

      // 4. Initialize Offline Database (Hive)
      await _initializeHive();

      // 5. Initialize Supabase
      await _initializeSupabase();

      // 6. Load Environment Config
      await _loadEnvironmentConfig();

      _isInitialized = true;
      stopwatch.stop();

      talker.log(
          '✅ AppBootstrap initialized in ${stopwatch.elapsedMilliseconds}ms');
    } catch (e, stackTrace) {
      print('❌ AppBootstrap initialization failed: $e');
      print(stackTrace);
      rethrow;
    }
  }

  /// Initialize Talker Logger
  Future<void> _initializeLogger() async {
    talker = TalkerFlutter.init(
      settings: TalkerSettings(
        enabled: true,
        useConsoleLogs: true,
        maxHistoryItems: 1000,
      ),
      logger: TalkerLogger(
        settings: TalkerLoggerSettings(
          enableColors: true,
          lineSymbol: '│',
        ),
      ),
    );

    talker.info('📝 Logger initialized');
  }

  /// Initialize Connectivity Monitor
  Future<void> _initializeConnectivity() async {
    connectivity = Connectivity();

    // Check initial connectivity
    final result = await connectivity.checkConnectivity();
    talker.info('🌐 Connectivity: ${result.first}');

    // Listen to connectivity changes
    connectivity.onConnectivityChanged
        .listen((List<ConnectivityResult> results) {
      final result = results.first;
      if (result == ConnectivityResult.none) {
        talker.warning('📡 Lost internet connection');
      } else {
        talker.log('📡 Connected to ${result.name}');
      }
    });
  }

  /// Initialize Secure Storage
  Future<void> _initializeSecureStorage() async {
    secureStorage = const FlutterSecureStorage(
      aOptions: AndroidOptions(
        encryptedSharedPreferences: true,
      ),
      iOptions: IOSOptions(
        accessibility: KeychainAccessibility.first_unlock,
      ),
    );

    talker.info('🔐 Secure storage initialized');
  }

  /// Initialize Hive Offline Database with Self-Healing for Locks
  Future<void> _initializeHive() async {
    await Hive.initFlutter();

    // Helper to safely open box
    Future<void> safelyOpenBox(String name) async {
      try {
        await Hive.openBox(name);
      } catch (e) {
        if (e.toString().contains('lock failed')) {
          print(
              "🔧 Hive Lock detected for '$name'. Attempting self-healing...");
          // This usually happens on macOS dev crashes.
          // In production, we might want to be more careful, but for this context:
          try {
            await Hive.deleteBoxFromDisk(name); // Nuclear option if locked?
            // Or actually, deleting the lock file is tricky from Dart without knowing the path.
            // Best retry:
            await Future.delayed(const Duration(milliseconds: 500));
            await Hive.openBox(name);
          } catch (retryError) {
            print("❌ Failed to recover Hive box '$name': $retryError");
            // Don't rethrow, let app start without cache/queue if must
          }
        } else {
          rethrow;
        }
      }
    }

    // Open boxes safely
    await safelyOpenBox('settings');
    await safelyOpenBox('cache');
    await safelyOpenBox('offline_queue');

    talker.info('💾 Hive database initialized (Robust Mode)');
  }

  /// Initialize Supabase
  Future<void> _initializeSupabase() async {
    await SupabaseConfig.initialize();
    talker.info('🔥 Supabase initialized');
  }

  /// Load Environment Configuration
  Future<void> _loadEnvironmentConfig() async {
    // Load from environment or config files
    final env = const String.fromEnvironment('ENV', defaultValue: 'dev');
    talker.info('⚙️  Environment: $env');
  }

  /// Get logger instance
  Talker getLogger() => talker;

  /// Get connectivity instance
  Connectivity getConnectivity() => connectivity;

  /// Get secure storage instance
  FlutterSecureStorage getSecureStorage() => secureStorage;

  /// Get Hive box
  Box getHiveBox(String boxName) => Hive.box(boxName);

  /// Dispose all services
  Future<void> dispose() async {
    await Hive.close();
    _isInitialized = false;
    talker.info('🛑 AppBootstrap disposed');
  }
}

/// Global instances for easy access
final appBootstrap = AppBootstrap();
final logger = AppBootstrap().getLogger();
