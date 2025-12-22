import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/bootstrap/app_bootstrap.dart';
import 'rizik_app.dart';

void main() {
  // 1. Ensure bindings are initialized in the root zone
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Run the app synchronously
  runApp(
    const ProviderScope(
      child: AppInitializationWrapper(),
    ),
  );
}

/// Wrapper to handle async initialization while showing a loading screen
class AppInitializationWrapper extends StatefulWidget {
  const AppInitializationWrapper({super.key});

  @override
  State<AppInitializationWrapper> createState() => _AppInitializationWrapperState();
}

class _AppInitializationWrapperState extends State<AppInitializationWrapper> {
  late Future<void> _initFuture;

  @override
  void initState() {
    super.initState();
    _initFuture = AppBootstrap().initialize();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _initFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
          if (snapshot.hasError) {
             return MaterialApp(
               home: Scaffold(
                 body: Center(
                   child: Padding(
                     padding: const EdgeInsets.all(24.0),
                     child: Column(
                       mainAxisAlignment: MainAxisAlignment.center,
                       children: [
                         const Icon(Icons.error_outline, color: Colors.red, size: 48),
                         const SizedBox(height: 16),
                         const Text('Initialization Failed', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                         const SizedBox(height: 8),
                         Text(snapshot.error.toString(), textAlign: TextAlign.center, style: const TextStyle(color: Colors.red)),
                         const SizedBox(height: 24),
                         ElevatedButton(
                           onPressed: () {
                             setState(() {
                               _initFuture = AppBootstrap().initialize();
                             });
                           }, 
                           child: const Text('Retry')
                         ),
                       ],
                     ),
                   ),
                 ),
               ),
             );
          }
          return const RizikApp();
        }
        
        // Simple loading screen during bootstrap
        return const MaterialApp(
          debugShowCheckedModeBanner: false,
          home: Scaffold(
            backgroundColor: Colors.white,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Initializing Rizik V10...', style: TextStyle(color: Colors.grey)),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}