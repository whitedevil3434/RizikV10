import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/sdui/renderer.dart';
import 'package:rizik_v4/features/squad/presentation/providers/squad_dashboard_provider.dart';

class SquadDashboardScreen extends ConsumerWidget {
  const SquadDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final uiData = ref.watch(squadDashboardUiProvider);

    if (uiData == null) {
      return const Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(),
              SizedBox(height: 16),
              Text("Waiting for Squad AI..."),
            ],
          ),
        ),
      );
    }

    // Render the Dynamic UI from Cloudflare
    return Scaffold(
      appBar: uiData['appBar'] != null
          ? AppBar(
              title: Text(uiData['appBar']['title'] ?? 'Squad'),
              backgroundColor: _parseColor(uiData['appBar']['backgroundColor']),
              foregroundColor: _parseColor(uiData['appBar']['foregroundColor']),
            )
          : null,
      body: RizikRenderer(uiData: uiData['child']),
    );
  }

  Color? _parseColor(String? color) {
    if (color == null) return null;
    if (color.startsWith('#')) {
      return Color(int.parse(color.substring(1, 7), radix: 16) + 0xFF000000);
    }
    return null;
  }
}
