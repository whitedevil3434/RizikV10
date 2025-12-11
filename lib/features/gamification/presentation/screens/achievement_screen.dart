import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/gamification/data/gamification_repository.dart';

/// Achievements Provider
final achievementsProvider = FutureProvider((ref) async {
  return ref.watch(gamificationRepositoryProvider).getAchievements();
});

/// Achievement Screen
/// Badges and milestones
class AchievementScreen extends ConsumerWidget {
  const AchievementScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final achievementsAsync = ref.watch(achievementsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Achievements 🎖️')),
      body: achievementsAsync.when(
        data: (achievements) {
          if (achievements.isEmpty) {
            return const Center(child: Text('Keep using the app to unlock badges!'));
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 3,
              childAspectRatio: 0.8,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
            ),
            itemCount: achievements.length,
            itemBuilder: (context, index) {
              final item = achievements[index];
              final badge = item['achievement'] ?? {};
              
              return Column(
                children: [
                  Container(
                    height: 80,
                    width: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.amber[100],
                      image: badge['icon_url'] != null
                          ? DecorationImage(image: NetworkImage(badge['icon_url']))
                          : null,
                    ),
                    child: badge['icon_url'] == null
                        ? const Icon(Icons.star, size: 40, color: Colors.amber)
                        : null,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    badge['name'] ?? 'Badge',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                    maxLines: 2,
                  ),
                ],
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
