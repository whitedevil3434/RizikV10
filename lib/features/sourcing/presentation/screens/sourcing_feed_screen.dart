import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/sourcing/data/sourcing_repository.dart';
import 'package:rizik_v4/features/sourcing/presentation/screens/sourcing_request_screen.dart';

/// Requests Provider
final sourcingRequestsProvider = FutureProvider((ref) async {
  return ref.watch(sourcingRepositoryProvider).getRequests();
});

/// Sourcing Feed Screen
/// Lists active sourcing requests
class SourcingFeedScreen extends ConsumerWidget {
  const SourcingFeedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(sourcingRequestsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Sourcing Feed'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(sourcingRequestsProvider),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const SourcingRequestScreen()),
        ),
        child: const Icon(Icons.add),
      ),
      body: requestsAsync.when(
        data: (requests) {
          if (requests.isEmpty) {
            return const Center(child: Text('No requests found'));
          }
          return ListView.builder(
            itemCount: requests.length,
            padding: const EdgeInsets.all(8),
            itemBuilder: (context, index) {
              final req = requests[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  title: Text(req['product_name'] ?? 'Unknown'),
                  subtitle: Text('${req['category']} • ৳${req['target_price']}'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    // Navigate to details/submission
                  },
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
