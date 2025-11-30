// Rizik V5++ Game OS - Unlockable Feature System
// Defines features that can be locked/unlocked based on progression

import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/aura_level.dart';

/// Feature unlock requirement type
enum UnlockRequirementType {
  level,           // Requires specific Aura level
  quest,           // Requires quest completion
  trustScore,      // Requires minimum trust score
  transactions,    // Requires number of transactions
  days,            // Requires days of app usage
  earnings,        // Requires total earnings
  referrals,       // Requires number of referrals
}

/// Individual unlock requirement
@immutable
class UnlockRequirement {
  final UnlockRequirementType type;
  final dynamic value; // Can be int, double, String depending on type
  final int currentProgress;
  final String description;
  final String descriptionBn;

  const UnlockRequirement({
    required this.type,
    required this.value,
    this.currentProgress = 0,
    required this.description,
    required this.descriptionBn,
  });

  /// Check if requirement is met
  bool get isMet {
    switch (type) {
      case UnlockRequirementType.level:
        return currentProgress >= (value as int);
      case UnlockRequirementType.quest:
        return currentProgress >= 1; // Quest completed
      case UnlockRequirementType.trustScore:
        return currentProgress >= ((value as double) * 10).toInt(); // Store as int * 10
      case UnlockRequirementType.transactions:
      case UnlockRequirementType.days:
      case UnlockRequirementType.referrals:
        return currentProgress >= (value as int);
      case UnlockRequirementType.earnings:
        return currentProgress >= (value as int);
    }
  }

  /// Get progress percentage
  double get progressPercentage {
    switch (type) {
      case UnlockRequirementType.level:
      case UnlockRequirementType.transactions:
      case UnlockRequirementType.days:
      case UnlockRequirementType.referrals:
      case UnlockRequirementType.earnings:
        return (currentProgress / (value as int)).clamp(0.0, 1.0);
      case UnlockRequirementType.trustScore:
        final targetScore = ((value as double) * 10).toInt();
        return (currentProgress / targetScore).clamp(0.0, 1.0);
      case UnlockRequirementType.quest:
        return currentProgress >= 1 ? 1.0 : 0.0;
    }
  }

  UnlockRequirement copyWith({
    UnlockRequirementType? type,
    dynamic value,
    int? currentProgress,
    String? description,
    String? descriptionBn,
  }) {
    return UnlockRequirement(
      type: type ?? this.type,
      value: value ?? this.value,
      currentProgress: currentProgress ?? this.currentProgress,
      description: description ?? this.description,
      descriptionBn: descriptionBn ?? this.descriptionBn,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type.name,
      'value': value,
      'current_progress': currentProgress,
      'description': description,
      'description_bn': descriptionBn,
    };
  }

  factory UnlockRequirement.fromJson(Map<String, dynamic> json) {
    return UnlockRequirement(
      type: UnlockRequirementType.values.firstWhere(
        (t) => t.name == json['type'],
        orElse: () => UnlockRequirementType.level,
      ),
      value: json['value'],
      currentProgress: json['current_progress'] as int? ?? 0,
      description: json['description'] as String,
      descriptionBn: json['description_bn'] as String,
    );
  }
}

/// Main unlockable feature model
@immutable
class UnlockableFeature {
  final String id;
  final String name;
  final String nameBn;
  final String description;
  final String descriptionBn;
  final String emoji;
  final AuraLevel requiredLevel;
  final List<UnlockRequirement> requirements;
  final bool isUnlocked;
  final DateTime? unlockedAt;
  final bool isComingSoon; // For features not yet implemented

  const UnlockableFeature({
    required this.id,
    required this.name,
    required this.nameBn,
    required this.description,
    required this.descriptionBn,
    required this.emoji,
    required this.requiredLevel,
    required this.requirements,
    this.isUnlocked = false,
    this.unlockedAt,
    this.isComingSoon = false,
  });

  /// Check if all requirements are met
  bool get canUnlock {
    return requirements.every((req) => req.isMet);
  }

  /// Get overall progress toward unlock
  double get unlockProgress {
    if (requirements.isEmpty) return 1.0;
    final totalProgress = requirements.fold<double>(
      0.0,
      (sum, req) => sum + req.progressPercentage,
    );
    return (totalProgress / requirements.length).clamp(0.0, 1.0);
  }

  /// Get incomplete requirements
  List<UnlockRequirement> get incompleteRequirements {
    return requirements.where((req) => !req.isMet).toList();
  }

  UnlockableFeature copyWith({
    String? id,
    String? name,
    String? nameBn,
    String? description,
    String? descriptionBn,
    String? emoji,
    AuraLevel? requiredLevel,
    List<UnlockRequirement>? requirements,
    bool? isUnlocked,
    DateTime? unlockedAt,
    bool? isComingSoon,
  }) {
    return UnlockableFeature(
      id: id ?? this.id,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      description: description ?? this.description,
      descriptionBn: descriptionBn ?? this.descriptionBn,
      emoji: emoji ?? this.emoji,
      requiredLevel: requiredLevel ?? this.requiredLevel,
      requirements: requirements ?? this.requirements,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      unlockedAt: unlockedAt ?? this.unlockedAt,
      isComingSoon: isComingSoon ?? this.isComingSoon,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'name_bn': nameBn,
      'description': description,
      'description_bn': descriptionBn,
      'emoji': emoji,
      'required_level': requiredLevel.level,
      'requirements': requirements.map((r) => r.toJson()).toList(),
      'is_unlocked': isUnlocked,
      'unlocked_at': unlockedAt?.toIso8601String(),
      'is_coming_soon': isComingSoon,
    };
  }

  factory UnlockableFeature.fromJson(Map<String, dynamic> json) {
    return UnlockableFeature(
      id: json['id'] as String,
      name: json['name'] as String,
      nameBn: json['name_bn'] as String,
      description: json['description'] as String,
      descriptionBn: json['description_bn'] as String,
      emoji: json['emoji'] as String,
      requiredLevel: AuraLevel.values[json['required_level'] as int],
      requirements: (json['requirements'] as List)
          .map((r) => UnlockRequirement.fromJson(r as Map<String, dynamic>))
          .toList(),
      isUnlocked: json['is_unlocked'] as bool? ?? false,
      unlockedAt: json['unlocked_at'] != null
          ? DateTime.parse(json['unlocked_at'] as String)
          : null,
      isComingSoon: json['is_coming_soon'] as bool? ?? false,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is UnlockableFeature && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
