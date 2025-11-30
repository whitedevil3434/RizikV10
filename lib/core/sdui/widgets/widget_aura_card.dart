import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/aura_progress.dart' as aura;
import 'package:rizik_v4/data/models/aura_level.dart';
import 'package:rizik_v4/data/models/quest.dart';
import 'package:rizik_v4/data/remote/aura_service.dart';

/// SDUI Widget: Aura Card (XP & Level Progression)
/// Displays current XP, level badge, quest tracker, and unlockable features
class WidgetAuraCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetAuraCard({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    // Extract parameters from JSON
    final userId = data['userId'] as String? ?? 'default_user';
    final showQuests = data['showQuests'] as bool? ?? true;
    final compact = data['compact'] as bool? ?? false;

    // Fetch aura progress (mock data for now)
    final progress = _getMockAuraProgress(userId);

    return Container(
      padding: EdgeInsets.all(compact ? 12 : 16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            _getLevelColor(progress.currentLevel).withOpacity(0.15),
            _getLevelColor(progress.currentLevel).withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _getLevelColor(progress.currentLevel).withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Level Badge & Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: _getLevelColor(progress.currentLevel).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  progress.currentLevel.emoji,
                  style: TextStyle(fontSize: compact ? 28 : 36),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      progress.currentLevel.nameBn,
                      style: TextStyle(
                        fontSize: compact ? 18 : 22,
                        fontWeight: FontWeight.bold,
                        color: _getLevelColor(progress.currentLevel),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Level ${progress.currentLevel.level + 1}',
                      style: TextStyle(
                        fontSize: compact ? 12 : 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              // Badge count
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFFFFD700).withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: const Color(0xFFFFD700),
                    width: 1.5,
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text('🏆', style: TextStyle(fontSize: 16)),
                    const SizedBox(width: 4),
                    Text(
                      '${progress.badgeCount}',
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFFFD700),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // XP Progress Bar
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'XP প্রোগ্রেস',
                    style: TextStyle(
                      fontSize: compact ? 12 : 14,
                      fontWeight: FontWeight.w600,
                      color: Colors.grey.shade700,
                    ),
                  ),
                  Text(
                    '${progress.totalXP} / ${progress.nextLevel?.requiredXP ?? progress.totalXP} XP',
                    style: TextStyle(
                      fontSize: compact ? 11 : 13,
                      fontWeight: FontWeight.bold,
                      color: _getLevelColor(progress.currentLevel),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: LinearProgressIndicator(
                  value: progress.progressToNextLevel,
                  minHeight: compact ? 8 : 12,
                  backgroundColor: Colors.grey.shade200,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    _getLevelColor(progress.currentLevel),
                  ),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                progress.nextLevel != null
                    ? 'পরবর্তী: ${progress.nextLevel!.nameBn} (${progress.xpToNextLevel} XP বাকি)'
                    : 'সর্বোচ্চ লেভেল পৌঁছেছেন! 🎉',
                style: TextStyle(
                  fontSize: compact ? 10 : 12,
                  color: Colors.grey.shade600,
                  fontStyle: FontStyle.italic,
                ),
              ),
            ],
          ),
          
          // Active Quests (if enabled)
          if (showQuests) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 12),
            _buildQuestSection(compact),
          ],
          
          // Unlocked Features Preview
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 12),
          _buildUnlockedFeatures(progress, compact),
        ],
      ),
    );
  }

  /// Build quest tracker section
  Widget _buildQuestSection(bool compact) {
    final activeQuests = _getMockActiveQuests();
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              '🎯 সক্রিয় কোয়েস্ট',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            Text(
              '${activeQuests.length}/3',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        ...activeQuests.map((quest) => _buildQuestItem(quest, compact)),
      ],
    );
  }

  /// Build individual quest item
  Widget _buildQuestItem(Quest quest, bool compact) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  quest.series.emoji,
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(
                    quest.titleBn,
                    style: TextStyle(
                      fontSize: compact ? 12 : 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: _getDifficultyColor(quest.difficulty).withOpacity(0.2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '+${quest.xpReward} XP',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: _getDifficultyColor(quest.difficulty),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: quest.progressPercentage,
                minHeight: 4,
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation<Color>(
                  _getDifficultyColor(quest.difficulty),
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              '${(quest.progressPercentage * 100).toInt()}% সম্পন্ন',
              style: TextStyle(
                fontSize: 10,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build unlocked features section
  Widget _buildUnlockedFeatures(aura.AuraProgress progress, bool compact) {
    final unlockedFeatures = progress.currentLevel.unlockedFeatures;
    final nextFeatures = progress.nextLevel?.unlockedFeatures ?? [];
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          '✨ আনলক করা ফিচার',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            ...unlockedFeatures.map((feature) => _buildFeatureChip(
              feature,
              isUnlocked: true,
              compact: compact,
            )),
            if (nextFeatures.isNotEmpty && progress.nextLevel != null)
              ...nextFeatures.take(2).map((feature) => _buildFeatureChip(
                feature,
                isUnlocked: false,
                compact: compact,
              )),
          ],
        ),
      ],
    );
  }

  /// Build feature chip
  Widget _buildFeatureChip(String feature, {required bool isUnlocked, required bool compact}) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 4 : 6,
      ),
      decoration: BoxDecoration(
        color: isUnlocked
            ? const Color(0xFF66BB6A).withOpacity(0.15)
            : Colors.grey.shade200,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isUnlocked
              ? const Color(0xFF66BB6A)
              : Colors.grey.shade400,
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            isUnlocked ? '✓' : '🔒',
            style: TextStyle(fontSize: compact ? 10 : 12),
          ),
          const SizedBox(width: 4),
          Text(
            feature,
            style: TextStyle(
              fontSize: compact ? 10 : 11,
              fontWeight: isUnlocked ? FontWeight.w600 : FontWeight.normal,
              color: isUnlocked ? const Color(0xFF388E3C) : Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  /// Get color based on level
  Color _getLevelColor(AuraLevel level) {
    switch (level) {
      case AuraLevel.initiate:
        return const Color(0xFF8BC34A); // Light Green
      case AuraLevel.apprentice:
        return const Color(0xFF2196F3); // Blue
      case AuraLevel.master:
        return const Color(0xFFFF9800); // Orange
      case AuraLevel.architect:
        return const Color(0xFF9C27B0); // Purple
      case AuraLevel.apex:
        return const Color(0xFFFFD700); // Gold
    }
  }

  /// Get color based on difficulty
  Color _getDifficultyColor(QuestDifficulty difficulty) {
    switch (difficulty) {
      case QuestDifficulty.easy:
        return const Color(0xFF66BB6A);
      case QuestDifficulty.medium:
        return const Color(0xFFFFA726);
      case QuestDifficulty.hard:
        return const Color(0xFFEF5350);
    }
  }

  /// Mock aura progress data (replace with actual Supabase fetch)
  aura.AuraProgress _getMockAuraProgress(String userId) {
    final hash = userId.hashCode.abs();
    final xpVariance = (hash % 5000);
    
    return aura.AuraProgress(
      userId: userId,
      currentLevel: AuraLevel.apprentice, // Can be dynamic based on XP
      totalXP: 2500 + xpVariance,
      unlockedFeatures: [
        'basic_orders',
        'trust_score',
        'profile',
        'khata_os',
        'hyperlocal_services',
      ],
      completedQuests: [
        'first_order',
        'trust_builder_1',
        'squad_formed',
      ],
      earnedBadges: [], // Would fetch from trust score
      lastUpdated: DateTime.now(),
    );
  }

  /// Mock active quests
  List<Quest> _getMockActiveQuests() {
    return [
      Quest(
        id: 'money_maker_2',
        title: 'Complete 10 Orders',
        titleBn: '১০টি অর্ডার সম্পন্ন করুন',
        description: 'Complete 10 successful orders to unlock bonus XP',
        descriptionBn: 'বোনাস XP আনলক করতে ১০টি সফল অর্ডার সম্পন্ন করুন',
        series: QuestSeries.moneyMaker,
        difficulty: QuestDifficulty.medium,
        steps: [
          const QuestStep(
            id: 'step1',
            description: 'Complete orders',
            descriptionBn: 'অর্ডার সম্পন্ন করুন',
            currentProgress: 7,
            targetProgress: 10,
          ),
        ],
        status: QuestStatus.active,
        xpReward: 150,
        startedAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Quest(
        id: 'social_glue_1',
        title: 'Join a Squad',
        titleBn: 'একটি স্কোয়াডে যোগ দিন',
        description: 'Form or join a squad with friends',
        descriptionBn: 'বন্ধুদের সাথে একটি স্কোয়াড তৈরি বা যোগ দিন',
        series: QuestSeries.socialGlue,
        difficulty: QuestDifficulty.easy,
        steps: [
          const QuestStep(
            id: 'step1',
            description: 'Join squad',
            descriptionBn: 'স্কোয়াডে যোগ দিন',
            currentProgress: 1,
            targetProgress: 2,
          ),
        ],
        status: QuestStatus.active,
        xpReward: 50,
        startedAt: DateTime.now().subtract(const Duration(hours: 5)),
      ),
      Quest(
        id: 'efficiency_hack_3',
        title: 'Complete Mission Chain',
        titleBn: 'মিশন চেইন সম্পন্ন করুন',
        description: 'Complete a 3-mission chain as a mover',
        descriptionBn: 'একজন মুভার হিসেবে ৩-মিশন চেইন সম্পন্ন করুন',
        series: QuestSeries.efficiencyHack,
        difficulty: QuestDifficulty.hard,
        steps: [
          const QuestStep(
            id: 'step1',
            description: 'Complete chain',
            descriptionBn: 'চেইন সম্পন্ন করুন',
            currentProgress: 0,
            targetProgress: 1,
          ),
        ],
        status: QuestStatus.active,
        xpReward: 300,
        startedAt: DateTime.now(),
      ),
    ];
  }
}
