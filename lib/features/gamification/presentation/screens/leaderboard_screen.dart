import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/gamification/data/gamification_repository.dart';

/// Leaderboard Provider
final leaderboardProvider = FutureProvider.family<List<dynamic>, String>((ref, period) async {
  return ref.watch(gamificationRepositoryProvider).getLeaderboard(period: period);
});

/// Leaderboard Screen
/// Top users ranking
class LeaderboardScreen extends ConsumerStatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  ConsumerState<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends ConsumerState<LeaderboardScreen> {
  String _period = 'weekly';

  @override
  Widget build(BuildContext context) {
    final leaderboardAsync = ref.watch(leaderboardProvider(_period));

    return Scaffold(
      appBar: AppBar(title: const Text('Leaderboard 🏆')),
      body: Column(
        children: [
          // Period Selector
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'weekly', label: Text('Weekly')),
                ButtonSegment(value: 'monthly', label: Text('Monthly')),
                ButtonSegment(value: 'all_time', label: Text('All Time')),
              ],
              selected: {_period},
              onSelectionChanged: (Set<String> newSelection) {
                setState(() {
                  _period = newSelection.first;
                });
              },
            ),
          ),
          
          // List
          Expanded(
            child: leaderboardAsync.when(
              data: (users) {
                if (users.isEmpty) {
                  return const Center(child: Text('No data yet. Be the first!'));
                }
                return ListView.builder(
                  itemCount: users.length,
                  itemBuilder: (context, index) {
                    final user = users[index];
                    final rank = index + 1;
                    final isTop3 = rank <= 3;
                    
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: isTop3 ? Colors.amber : Colors.grey[300],
                        foregroundColor: isTop3 ? Colors.white : Colors.black,
                        child: Text('#$rank'),
                      ),
                      title: Text(user['name'] ?? 'User'),
                      subtitle: Text('${user['points']} pts'),
                      trailing: isTop3 ? const Icon(Icons.emoji_events, color: Colors.amber) : null,
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (err, stack) => Center(child: Text('Error: $err')),
            ),
          ),
        ],
      ),
    );
  }
}
