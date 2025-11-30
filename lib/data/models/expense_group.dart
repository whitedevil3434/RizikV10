import 'package:flutter/foundation.dart';

/// Types of expense groups
enum GroupType {
  roommates('roommates', 'রুমমেট', '🏠'),
  trip('trip', 'ট্রিপ', '✈️'),
  event('event', 'ইভেন্ট', '🎉'),
  friends('friends', 'বন্ধু', '👥'),
  office('office', 'অফিস', '💼'),
  family('family', 'পরিবার', '👨‍👩‍👧‍👦');

  const GroupType(this.key, this.nameBn, this.emoji);
  final String key;
  final String nameBn;
  final String emoji;
}

/// Member of an expense group
@immutable
class GroupMember {
  final String userId;
  final String name;
  final String? avatarUrl;
  final DateTime joinedAt;
  final bool isAdmin;
  final double contributionShare; // For unequal default splits

  const GroupMember({
    required this.userId,
    required this.name,
    this.avatarUrl,
    required this.joinedAt,
    this.isAdmin = false,
    this.contributionShare = 1.0,
  });

  Map<String, dynamic> toJson() => {
        'user_id': userId,
        'name': name,
        'avatar_url': avatarUrl,
        'joined_at': joinedAt.toIso8601String(),
        'is_admin': isAdmin,
        'contribution_share': contributionShare,
      };

  factory GroupMember.fromJson(Map<String, dynamic> json) => GroupMember(
        userId: json['user_id'] as String,
        name: json['name'] as String,
        avatarUrl: json['avatar_url'] as String?,
        joinedAt: DateTime.parse(json['joined_at'] as String),
        isAdmin: json['is_admin'] as bool? ?? false,
        contributionShare: (json['contribution_share'] as num?)?.toDouble() ?? 1.0,
      );
}

/// Settings for an expense group
@immutable
class GroupSettings {
  final String defaultSplitType;
  final int settlementDay; // Day of month (1-31)
  final bool autoReminders;
  final int reminderDaysBefore;
  final bool allowMemberInvites;
  final bool requireApprovalForExpenses;

  const GroupSettings({
    this.defaultSplitType = 'equal',
    this.settlementDay = 1,
    this.autoReminders = true,
    this.reminderDaysBefore = 3,
    this.allowMemberInvites = true,
    this.requireApprovalForExpenses = false,
  });

  Map<String, dynamic> toJson() => {
        'default_split_type': defaultSplitType,
        'settlement_day': settlementDay,
        'auto_reminders': autoReminders,
        'reminder_days_before': reminderDaysBefore,
        'allow_member_invites': allowMemberInvites,
        'require_approval_for_expenses': requireApprovalForExpenses,
      };

  factory GroupSettings.fromJson(Map<String, dynamic> json) => GroupSettings(
        defaultSplitType: json['default_split_type'] as String? ?? 'equal',
        settlementDay: json['settlement_day'] as int? ?? 1,
        autoReminders: json['auto_reminders'] as bool? ?? true,
        reminderDaysBefore: json['reminder_days_before'] as int? ?? 3,
        allowMemberInvites: json['allow_member_invites'] as bool? ?? true,
        requireApprovalForExpenses: json['require_approval_for_expenses'] as bool? ?? false,
      );
}


/// Expense Group - for managing shared expenses
@immutable
class ExpenseGroup {
  final String id;
  final String name;
  final String description;
  final GroupType type;
  final List<GroupMember> members;
  final String createdBy;
  final DateTime createdAt;
  final DateTime? lastActivity;
  final String? imageUrl;
  final GroupSettings settings;
  final bool isActive;

  const ExpenseGroup({
    required this.id,
    required this.name,
    required this.description,
    required this.type,
    required this.members,
    required this.createdBy,
    required this.createdAt,
    this.lastActivity,
    this.imageUrl,
    required this.settings,
    this.isActive = true,
  });

  ExpenseGroup copyWith({
    String? id,
    String? name,
    String? description,
    GroupType? type,
    List<GroupMember>? members,
    String? createdBy,
    DateTime? createdAt,
    DateTime? lastActivity,
    String? imageUrl,
    GroupSettings? settings,
    bool? isActive,
  }) {
    return ExpenseGroup(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      type: type ?? this.type,
      members: members ?? this.members,
      createdBy: createdBy ?? this.createdBy,
      createdAt: createdAt ?? this.createdAt,
      lastActivity: lastActivity ?? this.lastActivity,
      imageUrl: imageUrl ?? this.imageUrl,
      settings: settings ?? this.settings,
      isActive: isActive ?? this.isActive,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'description': description,
        'type': type.key,
        'members': members.map((m) => m.toJson()).toList(),
        'created_by': createdBy,
        'created_at': createdAt.toIso8601String(),
        'last_activity': lastActivity?.toIso8601String(),
        'image_url': imageUrl,
        'settings': settings.toJson(),
        'is_active': isActive,
      };

  factory ExpenseGroup.fromJson(Map<String, dynamic> json) => ExpenseGroup(
        id: json['id'] as String,
        name: json['name'] as String,
        description: json['description'] as String,
        type: GroupType.values.firstWhere(
          (t) => t.key == json['type'],
          orElse: () => GroupType.friends,
        ),
        members: (json['members'] as List<dynamic>)
            .map((m) => GroupMember.fromJson(m as Map<String, dynamic>))
            .toList(),
        createdBy: json['created_by'] as String,
        createdAt: DateTime.parse(json['created_at'] as String),
        lastActivity: json['last_activity'] != null
            ? DateTime.parse(json['last_activity'] as String)
            : null,
        imageUrl: json['image_url'] as String?,
        settings: GroupSettings.fromJson(json['settings'] as Map<String, dynamic>),
        isActive: json['is_active'] as bool? ?? true,
      );

  /// Create a new expense group
  factory ExpenseGroup.create({
    required String name,
    required GroupType type,
    required List<GroupMember> members,
    required String createdBy,
    String? description,
    GroupSettings? settings,
  }) {
    final now = DateTime.now();
    return ExpenseGroup(
      id: 'group_${now.millisecondsSinceEpoch}',
      name: name,
      description: description ?? '',
      type: type,
      members: members,
      createdBy: createdBy,
      createdAt: now,
      lastActivity: now,
      settings: settings ?? const GroupSettings(),
      isActive: true,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ExpenseGroup && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
