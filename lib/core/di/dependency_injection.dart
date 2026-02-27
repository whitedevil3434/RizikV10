import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Core Wrappers
import '../wrappers/security/secure_enclave_wrapper.dart';
import '../network/api_client.dart';
import '../network/grpc_client.dart';
import '../sdui/action_registry.dart';

// Data Sources & Repositories
import '../../data/remote/auth_remote_source.dart';
import '../../data/local/hive_storage.dart';
import '../../domain/repositories/auth_repository.dart';
import '../../features/source/kitchen_os/kitchen_repository.dart';

// Global Service Locator
final GetIt locator = GetIt.instance;

/// 🧠 Rizik Dependency Injection Engine
/// This creates the "Singletons" used throughout the app.
Future<void> setupDependencyInjection(GetIt container) async {
  
  // ---------------------------------------------------------
  // 1. EXTERNAL DEPENDENCIES (থার্ড পার্টি লাইব্রেরি)
  // ---------------------------------------------------------
  final sharedPrefs = await SharedPreferences.getInstance();
  locator.registerSingleton<SharedPreferences>(sharedPrefs);

  final dio = Dio(); // বেসিক কনফিগারেশনসহ
  locator.registerSingleton<Dio>(dio);

  // Supabase Client (একবারই ইনিশিয়ালাইজ হবে)
  final supabase = Supabase.instance.client;
  locator.registerSingleton<SupabaseClient>(supabase);

  // ---------------------------------------------------------
  // 2. CORE WRAPPERS (আমাদের টাইটানিয়াম সিস্টেম)
  // ---------------------------------------------------------
  // Secure Storage (পাসওয়ার্ড/টোকেন রাখার জন্য)
  locator.registerLazySingleton<SecureEnclaveWrapper>(
    () => SecureEnclaveWrapper(),
  );

  // Network Client (যাতে অটোমেটিক টোকেন রিফ্রেশ থাকে)
  locator.registerLazySingleton<ApiClient>(
    () => ApiClient(locator<Dio>(), locator<SecureEnclaveWrapper>()),
  );

  // gRPC Client (Cloudflare Workers-এর সাথে সুপারফাস্ট কথা বলার জন্য)
  locator.registerLazySingleton<GrpcClient>(
    () => GrpcClient(),
  );

  // SDUI Action Registry (বাটন ক্লিকের লজিক হ্যান্ডলার)
  locator.registerLazySingleton<ActionRegistry>(
    () => ActionRegistry(),
  );

  // ---------------------------------------------------------
  // 3. DATA SOURCES (ডাটা আনা-নেওয়ার গেটওয়ে)
  // ---------------------------------------------------------
  locator.registerLazySingleton<AuthRemoteSource>(
    () => AuthRemoteSource(locator<SupabaseClient>()),
  );

  locator.registerLazySingleton<HiveStorage>(
    () => HiveStorage(),
  );

  // ---------------------------------------------------------
  // 4. REPOSITORIES (বিজনেস লজিক লেয়ার)
  // ---------------------------------------------------------
  // Auth Repository (লগইন/সাইনআপ লজিক)
  locator.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteSource: locator<AuthRemoteSource>(),
      localSource: locator<HiveStorage>(),
    ),
  );

  // Source Role: Kitchen OS Repository
  locator.registerLazySingleton<KitchenRepository>(
    () => KitchenRepository(),
  );
}
