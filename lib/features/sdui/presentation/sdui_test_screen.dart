import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/sdui_service.dart';
import 'sdui_renderer.dart';

class SDUITestScreen extends ConsumerWidget {
  const SDUITestScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final screenAsync = ref.watch(sduiScreenProvider('home_sd'));

    return screenAsync.when(
      data: (screen) => SDUIRenderer(screen: screen),
      loading: () => const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      ),
      error: (err, stack) => Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.red, size: 48),
              const SizedBox(height: 16),
              Text('Failed to load SDUI: $err'),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => ref.refresh(sduiScreenProvider('home_sd')),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
