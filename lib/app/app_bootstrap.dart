import 'dart:async';
import 'dart:developer';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart'; // Added for Colors
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';

// Core Systems
import 'package:rizik_v4/core/config/env_config.dart';
import 'package:rizik_v4/core/di/dependency_injection.dart';
import 'package:rizik_v4/core/wrappers/analytics/log_wrapper.dart';
import 'package:rizik_v4/core/wrappers/analytics/crashlytics_wrapper.dart';
import 'package:rizik_v4/core/wrappers/matrix/isolate_manager_wrapper.dart';
import 'package:rizik_v4/core/wrappers/security/secure_enclave_wrapper.dart';
import 'package:rizik_v4/core/wrappers/resilience/offline_sync_wrapper.dart';
import 'package:rizik_v4/core/data/local/local_db_wrapper.dart';
import 'package:rizik_v4/data/remote/network_wrapper.dart';

/// 🏛️ Rizik V10 Bootstrap Engine
/// This class initializes the "Titanium Architecture" before the UI is drawn.
class AppBootstrap {
  
  /// The "Big Bang" Method
  static Future<ProviderContainer> init() async {
    final container = ProviderContainer();

    // 🛡️ Safe Zone: ক্যাচ না করা এররগুলো এখানে ধরা পড়বে (System 46: Circuit Breaker Logic)
    await runZonedGuarded(() async {
      
      final stopwatch = Stopwatch()..start();
      LogWrapper.info("🚀 Rizik V10 System Sequence Initiated...");

      // ---------------------------------------------------------
      // LAYER 1: THE CORE (তাৎক্ষণিক লোড হতে হবে)
      // ---------------------------------------------------------
      await EnvConfig.init(); // Dev/Prod Environment সেটআপ
      await LogWrapper.init(); // Logger চালু করা (Talker)
      
      // UI বাইন্ডিং নিশ্চিত করা
      WidgetsFlutterBinding.ensureInitialized();

      // ---------------------------------------------------------
      // LAYER 2: SYSTEM CONFIGURATION (UI-এর সৌন্দর্য)
      // ---------------------------------------------------------
      // অ্যাপ শুধুমাত্র পোর্ট্রেট মোডে চলবে (যাতে লেআউট না ভাঙে)
      await SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
      ]);

      // স্ট্যাটাস বার এবং নেভিগেশন বারের কালার সেট করা
      SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.dark,
      ));

      // ---------------------------------------------------------
      // LAYER 3: PARALLEL HEAVY LIFTING (সবচেয়ে ভারী কাজগুলো একসাথে)
      // ---------------------------------------------------------
      // এখানে আমরা await ব্যবহার না করে Future.wait ব্যবহার করছি যাতে
      // Supabase, Local DB এবং Security একসাথে লোড হয় (Time Saving Hack)
      await Future.wait([
        _initSecurityLayer(),      // System 42: Secure Enclave
        _initDataLayer(),          // System 11: Hive/Isar & Supabase
        _initResilienceLayer(),    // System 13: Offline Sync
        _initMatrixLayer(),        // System 36: Isolate Manager (Background Thread)
      ]);

      // ---------------------------------------------------------
      // LAYER 4: DEPENDENCY INJECTION & SHADER WARMUP
      // ---------------------------------------------------------
      await setupDependencyInjection(GetIt.instance); // GetIt রেডি করা
      
      // System 50: Shader Warmup (প্রথম ৩ সেকেন্ডের ল্যাগ ফিক্স করার জন্য)
      // await ShaderWarmupWrapper.execute(); 

      stopwatch.stop();
      LogWrapper.success("✅ Rizik System Online in ${stopwatch.elapsedMilliseconds}ms");

    }, (error, stack) {
      // যদি বুটস্ট্রাপের সময় কোনো ক্র্যাশ হয়, সোজা Crashlytics-এ পাঠাবে
      CrashlyticsWrapper.recordFatalError(error, stack);
      LogWrapper.error("💥 System Failure during Bootstrap: $error");
    });

    return container;
  }

  // --- Private Helper Modules for Cleaner Code ---

  static Future<void> _initSecurityLayer() async {
    // টোকেন এবং পাসওয়ার্ড এনক্রিপশন সিস্টেম রেডি করা
    await SecureEnclaveWrapper.init();
  }

  static Future<void> _initDataLayer() async {
    // লোকাল ডাটাবেস এবং রিমোট নেটওয়ার্ক ক্লায়েন্ট সেটআপ
    await LocalDbWrapper.init(); 
    await NetworkWrapper.init(); // Supabase & Cloudflare
  }

  static Future<void> _initResilienceLayer() async {
    // অফলাইন সিঙ্ক ম্যানেজার এবং ক্র্যাশ রিপোর্টার
    await CrashlyticsWrapper.init();
    await OfflineSyncWrapper.configure();
  }
  
  static Future<void> _initMatrixLayer() async {
    // ভারী ক্যালকুলেশনের জন্য ব্যাকগ্রাউন্ড আইসোলেট চালু করা
    await IsolateManagerWrapper.spawn();
  }
}
