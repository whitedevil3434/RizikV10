import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app_bootstrap.dart';
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
    _initFuture = AppBootstrap.init();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: _initFuture,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done) {
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