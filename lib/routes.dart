import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/config/env_config.dart';

// Features Screens (Import your actual screens here)
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/splash_screen.dart';
import 'features/seeker/presentation/seeker_home_screen.dart';
import 'features/source/home/source_dashboard_screen.dart';
import 'features/force/dashboard/force_dashboard_screen.dart';
// import 'features/connect/presentation/call_screen.dart'; // RealtimeKit REST API + WebRTC
import 'features/connect/presentation/call_screen_realtimekit.dart';
import 'package:rizik_v4/features/voice/presentation/live_agent_screen.dart';
// import 'features/voice/presentation/voice_mode_screen.dart'; // Removed legacy
import 'features/squad/presentation/screens/squad_dashboard_screen.dart';
import 'features/source/inventory/presentation/screens/inventory_screen.dart';

// State Management (Auth State দেখার জন্য)
import 'features/auth/logic/auth_controller.dart';

// 🛡️ Global Navigator Key (Context ছাড়াই নেভিগেট করার জন্য)
final GlobalKey<NavigatorState> navigatorKey = GlobalKey<NavigatorState>();

/// 🚦 Rizik V10 Central Nervous System
final routerProvider = Provider<GoRouter>((ref) {
  
  // Auth State-এর দিকে নজর রাখা (Watcher)
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: navigatorKey,
    initialLocation: EnvConfig.isDev ? '/seeker' : '/splash', // অ্যাপ এখান থেকেই শুরু হবে
    debugLogDiagnostics: true,   // ডেভেলপমেন্টের সময় লগ দেখার জন্য

    // 🔄 Refresh Logic: যখনই লগইন/লগআউট হবে, রাউটার অটোমেটিক রিফ্রেশ হবে
    refreshListenable: authState, 

    // 🛣️ Route Definitions
    routes: [
      
      // 1. Splash & Onboarding
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const SplashScreen(),
      ),

      // 2. Authentication Module
      GoRoute(
        path: '/auth',
        name: 'login',
        builder: (context, state) => const LoginScreen(),
        routes: [
          // Sub-route: /auth/otp
          GoRoute(
            path: 'otp',
            name: 'otp_verify',
            builder: (context, state) => const SizedBox(), // TODO: OTP Screen
          ),
        ],
      ),

      // 3. SEEKER ROLE (The Receiver)
      GoRoute(
        path: '/seeker',
        name: 'seeker_home',
        builder: (context, state) => const SeekerHomeScreen(),
        routes: [
          GoRoute(
            path: 'order/:id', // Dynamic Route (Deep Link Ready)
            name: 'order_details',
            builder: (context, state) {
              final orderId = state.pathParameters['id'];
              return SizedBox(child: Text("Order $orderId")); // TODO: Order Screen
            },
          ),
        ],
      ),

      // 4. FORCE ROLE (The Action)
      GoRoute(
        path: '/force',
        name: 'force_home',
        builder: (context, state) => const ForceDashboardScreen(),
        routes: [
          GoRoute(
            path: 'gig/:id',
            name: 'gig_details',
            builder: (context, state) => const SizedBox(), // TODO: Gig Screen
          ),
        ],
      ),

      // 5. SOURCE ROLE (The Provider)
      GoRoute(
        path: '/source',
        name: 'source_home',
        builder: (context, state) => const SourceDashboardScreen(),
      ),

      // 6. CLOUDFLARE ECOSYSTEM (RealtimeKit REST API + WebRTC)
      GoRoute(
        path: '/connect',
        name: 'rizik_connect',
        builder: (context, state) => const CallScreenRealtimeKit(),
      ),
      GoRoute(
        path: '/live-agent',
        name: 'live_agent',
        builder: (context, state) => const LiveAgentScreen(),
      ),

      // 7. SQUAD SYSTEM (The Visual Brain)
      GoRoute(
        path: '/squad/dashboard',
        name: 'squad_dashboard',
        builder: (context, state) => const SquadDashboardScreen(),
      ),
      GoRoute(
        path: '/inventory',
        name: 'inventory',
        builder: (context, state) => const InventoryScreen(),
      ),
    ],

    // 🔒 SECURITY GUARD (Redirect Logic)
    redirect: (context, state) {
      // 0. DEVELOPMENT BYPASS (Auth Disabled for Dev)
      if (EnvConfig.isDev) {
        return null; // Allow direct access to any route
      }

      // 1. চেক করুন ইউজার লগইন করা আছে কিনা
      final isLoggedIn = authState.isAuthenticated;
      final isLoggingIn = state.uri.toString() == '/auth';
      final isSplash = state.uri.toString() == '/splash';

      // 2. যদি লগইন না থাকে, এবং অথ পেজে না থাকে -> সোজা লগইন পেজে পাঠাও
      if (!isLoggedIn && !isLoggingIn && !isSplash) {
        return '/auth';
      }

      // 3. যদি লগইন করা থাকে কিন্তু অথ পেজে থাকে -> সোজা হোমে পাঠাও
      if (isLoggedIn && isLoggingIn) {
        // ডিফল্ট রোল অনুযায়ী রিডাইরেক্ট (এখানে Seeker ডিফল্ট)
        return '/seeker'; 
      }

      // কোনো সমস্যা না থাকলে, যেখানে যাওয়ার কথা সেখানেই যাও
      return null;
    },
  );
});
