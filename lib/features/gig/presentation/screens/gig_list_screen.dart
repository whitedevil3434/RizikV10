import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/gig/data/gig_repository.dart';
import 'package:rizik_v4/features/gig/presentation/screens/gig_details_screen.dart';

/// Gigs Provider
final gigsProvider = FutureProvider((ref) async {
  return ref.watch(gigRepositoryProvider).getGigs();
});

/// Gig List Screen
/// Browse available gigs
class GigListScreen extends ConsumerWidget {
  const GigListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final gigsAsync = ref.watch(gigsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Find Work'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.refresh(gigsProvider),
          ),
        ],
      ),
      body: gigsAsync.when(
        data: (gigs) {
          if (gigs.isEmpty) {
            return const Center(child: Text('No gigs available right now.'));
          }
          return ListView.builder(
            itemCount: gigs.length,
            padding: const EdgeInsets.all(8),
            itemBuilder: (context, index) {
              final gig = gigs[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  title: Text(gig['title'] ?? 'Untitled Gig'),
                  subtitle: Text(
                    'Budget: ৳${gig['budget'] ?? 0} • ${gig['category'] ?? 'General'}',
                    style: const TextStyle(color: Colors.green),
                  ),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => GigDetailsScreen(gigId: gig['id']),
                      ),
                    );
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
