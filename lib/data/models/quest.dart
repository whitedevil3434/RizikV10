// Rizik V5++ Game OS - Quest System
// 100+ quests across 5 series to drive engagement

import 'package:flutter/foundation.dart';

/// Quest series categories
enum QuestSeries {
  trustBuilder('Trust Builder', 'বিশ্বাস নির্মাতা', '🛡️'),
  moneyMaker('Money Maker', 'অর্থ নির্মাতা', '💰'),
  socialGlue('Social Glue', 'সামাজিক আঠা', '🤝'),
  efficiencyHack('Efficiency Hack', 'দক্ষতা হ্যাক', '⚡'),
  skillMaster('Skill Master', 'দক্ষতা মাস্টার', '🎯');

  const QuestSeries(this.name, this.nameBn, this.emoji);
  
  final String name;
  final String nameBn;
  final String emoji;
}

/// Quest difficulty levels
enum QuestDifficulty {
  easy('Easy', 'সহজ', 50),
  medium('Medium', 'মাঝারি', 150),
  hard('Hard', 'কঠিন', 300);

  const QuestDifficulty(this.name, this.nameBn, this.xpReward);
  
  final String name;
  final String nameBn;
  final int xpReward;
}

/// Quest status
enum QuestStatus {
  locked,      // Not yet available
  available,   // Can be started
  active,      // Currently in progress
  completed,   // Successfully completed
  failed,      // Failed (if applicable)
}

/// Individual quest step
@immutable
class QuestStep {
  final String id;
  final String description;
  final String descriptionBn;
  final bool isCompleted;
  final int currentProgress;
  final int targetProgress;

  const QuestStep({
    required this.id,
    required this.description,
    required this.descriptionBn,
    this.isCompleted = false,
    this.currentProgress = 0,
    required this.targetProgress,
  });

  double get progressPercentage => 
      (currentProgress / targetProgress).clamp(0.0, 1.0);

  QuestStep copyWith({
    String? id,
    String? description,
    String? descriptionBn,
    bool? isCompleted,
    int? currentProgress,
    int? targetProgress,
  }) {
    return QuestStep(
      id: id ?? this.id,
      description: description ?? this.description,
      descriptionBn: descriptionBn ?? this.descriptionBn,
      isCompleted: isCompleted ?? this.isCompleted,
      currentProgress: currentProgress ?? this.currentProgress,
      targetProgress: targetProgress ?? this.targetProgress,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'description': description,
      'description_bn': descriptionBn,
      'is_completed': isCompleted,
      'current_progress': currentProgress,
      'target_progress': targetProgress,
    };
  }

  factory QuestStep.fromJson(Map<String, dynamic> json) {
    return QuestStep(
      id: json['id'] as String,
      description: json['description'] as String,
      descriptionBn: json['description_bn'] as String,
      isCompleted: json['is_completed'] as bool? ?? false,
      currentProgress: json['current_progress'] as int? ?? 0,
      targetProgress: json['target_progress'] as int,
    );
  }
}

/// Main Quest model
@immutable
class Quest {
  final String id;
  final String title;
  final String titleBn;
  final String description;
  final String descriptionBn;
  final QuestSeries series;
  final QuestDifficulty difficulty;
  final List<QuestStep> steps;
  final QuestStatus status;
  final int xpReward;
  final String? unlockRequirement; // Quest ID that must be completed first
  final String? featureUnlock; // Feature ID that gets unlocked on completion
  final DateTime? startedAt;
  final DateTime? completedAt;

  const Quest({
    required this.id,
    required this.title,
    required this.titleBn,
    required this.description,
    required this.descriptionBn,
    required this.series,
    required this.difficulty,
    required this.steps,
    this.status = QuestStatus.available,
    required this.xpReward,
    this.unlockRequirement,
    this.featureUnlock,
    this.startedAt,
    this.completedAt,
  });

  /// Calculate overall quest progress
  double get progressPercentage {
    if (steps.isEmpty) return 0.0;
    final completedSteps = steps.where((s) => s.isCompleted).length;
    return (completedSteps / steps.length).clamp(0.0, 1.0);
  }

  /// Check if quest is completed
  bool get isCompleted => status == QuestStatus.completed;

  /// Check if quest is active
  bool get isActive => status == QuestStatus.active;

  /// Check if quest is available to start
  bool get isAvailable => status == QuestStatus.available;

  /// Check if quest is locked
  bool get isLocked => status == QuestStatus.locked;

  Quest copyWith({
    String? id,
    String? title,
    String? titleBn,
    String? description,
    String? descriptionBn,
    QuestSeries? series,
    QuestDifficulty? difficulty,
    List<QuestStep>? steps,
    QuestStatus? status,
    int? xpReward,
    String? unlockRequirement,
    String? featureUnlock,
    DateTime? startedAt,
    DateTime? completedAt,
  }) {
    return Quest(
      id: id ?? this.id,
      title: title ?? this.title,
      titleBn: titleBn ?? this.titleBn,
      description: description ?? this.description,
      descriptionBn: descriptionBn ?? this.descriptionBn,
      series: series ?? this.series,
      difficulty: difficulty ?? this.difficulty,
      steps: steps ?? this.steps,
      status: status ?? this.status,
      xpReward: xpReward ?? this.xpReward,
      unlockRequirement: unlockRequirement ?? this.unlockRequirement,
      featureUnlock: featureUnlock ?? this.featureUnlock,
      startedAt: startedAt ?? this.startedAt,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'title_bn': titleBn,
      'description': description,
      'description_bn': descriptionBn,
      'series': series.name,
      'difficulty': difficulty.name,
      'steps': steps.map((s) => s.toJson()).toList(),
      'status': status.name,
      'xp_reward': xpReward,
      'unlock_requirement': unlockRequirement,
      'feature_unlock': featureUnlock,
      'started_at': startedAt?.toIso8601String(),
      'completed_at': completedAt?.toIso8601String(),
    };
  }

  factory Quest.fromJson(Map<String, dynamic> json) {
    return Quest(
      id: json['id'] as String,
      title: json['title'] as String,
      titleBn: json['title_bn'] as String,
      description: json['description'] as String,
      descriptionBn: json['description_bn'] as String,
      series: QuestSeries.values.firstWhere(
        (s) => s.name == json['series'],
        orElse: () => QuestSeries.trustBuilder,
      ),
      difficulty: QuestDifficulty.values.firstWhere(
        (d) => d.name == json['difficulty'],
        orElse: () => QuestDifficulty.easy,
      ),
      steps: (json['steps'] as List)
          .map((s) => QuestStep.fromJson(s as Map<String, dynamic>))
          .toList(),
      status: QuestStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => QuestStatus.available,
      ),
      xpReward: json['xp_reward'] as int,
      unlockRequirement: json['unlock_requirement'] as String?,
      featureUnlock: json['feature_unlock'] as String?,
      startedAt: json['started_at'] != null
          ? DateTime.parse(json['started_at'] as String)
          : null,
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Quest && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
