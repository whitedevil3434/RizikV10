import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/sdui/renderer.dart';
import 'package:rizik_v4/core/theme/ui_tokens.dart';
import 'package:rizik_v4/features/squad/presentation/providers/squad_dashboard_provider.dart';
import '../../../../data/models/squad.dart';
import '../../data/repositories/squad_repository.dart';
import '../widgets/capacity_toggle_widget.dart';

final squadRepositoryProvider = Provider((ref) => SquadRepository());

class SquadDashboardScreen extends ConsumerStatefulWidget {
  const SquadDashboardScreen({super.key});

  @override
  ConsumerState<SquadDashboardScreen> createState() =>
      _SquadDashboardScreenState();
}

class _SquadDashboardScreenState extends ConsumerState<SquadDashboardScreen> {
  CapacityStatus _currentStatus = CapacityStatus.open;
  bool _isLoadingCapacity = true;
  final String _squadId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Mock ID

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(squadDashboardUiProvider.notifier).fetchDashboard(_squadId);
      _fetchCapacityStatus();
    });
  }

  Future<void> _fetchCapacityStatus() async {
    try {
      final status =
          await ref.read(squadRepositoryProvider).getCapacityStatus(_squadId);
      if (mounted) {
        setState(() {
          _currentStatus = status;
          _isLoadingCapacity = false;
        });
      }
    } catch (e) {
      debugPrint('Error fetching capacity: $e');
      if (mounted) {
        setState(() => _isLoadingCapacity = false);
      }
    }
  }

  Future<void> _updateCapacityStatus(CapacityStatus status) async {
    // Optimistic update
    setState(() => _currentStatus = status);
    try {
      await ref
          .read(squadRepositoryProvider)
          .updateCapacityStatus(_squadId, status);
    } catch (e) {
      debugPrint('Error updating capacity: $e');
      // Revert on error
      _fetchCapacityStatus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final uiData = ref.watch(squadDashboardUiProvider);
    final hasErrorState =
        (uiData?['appBar']?['title']?.toString() ?? '').toLowerCase() ==
            'error';

    if (uiData == null) {
      return Scaffold(
        body: Center(
          child: Container(
            padding: const EdgeInsets.all(UiTokens.pagePadding),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: UiTokens.cardBorderRadius,
              border: Border.all(color: UiTokens.borderColor(context)),
            ),
            child: const Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                CircularProgressIndicator(),
                SizedBox(height: 12),
                Text("Connecting to Squad Core..."),
              ],
            ),
          ),
        ),
      );
    }

    if (hasErrorState) {
      return Scaffold(
        appBar: AppBar(title: const Text('Squad Error')),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(UiTokens.pagePadding),
            child: Container(
              padding: const EdgeInsets.all(UiTokens.pagePadding),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: UiTokens.cardBorderRadius,
                border: Border.all(color: UiTokens.borderColor(context)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 38),
                  const SizedBox(height: 8),
                  Text(
                    '${uiData['child']?['child']?['text'] ?? 'Failed to load squad dashboard.'}',
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () => ref
                        .read(squadDashboardUiProvider.notifier)
                        .fetchDashboard(_squadId),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: uiData['appBar'] != null
          ? AppBar(
              title: Text(uiData['appBar']['title'] ?? 'Squad'),
              backgroundColor: _parseColor(uiData['appBar']['backgroundColor']),
              foregroundColor: _parseColor(uiData['appBar']['foregroundColor']),
            )
          : null,
      body: Column(
        children: [
          // Capacity Toggle Widget Integration
          if (!_isLoadingCapacity)
            Padding(
              padding: const EdgeInsets.all(UiTokens.pagePadding),
              child: CapacityToggleWidget(
                currentStatus: _currentStatus,
                onStatusChanged: _updateCapacityStatus,
                currentOrderCount: 12, // Mock data for now
                maxCapacity: 20,
              ),
            ),

          // Server-Driven UI
          Expanded(child: RizikRenderer(uiData: uiData['child'])),
        ],
      ),
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
