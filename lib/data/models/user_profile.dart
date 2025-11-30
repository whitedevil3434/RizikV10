import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/models/squad.dart'; // Import for SquadRole

class UserProfile {
  final String id;
  final String name;
  final Map<UserRole, String> roleAvatars;
  final Map<UserRole, String> roleTitles;
  final TrustScore? trustScore;
  final String? currentSquadId; // New field
  final SquadRole? squadRole; // New field

  UserProfile({
    required this.id,
    required this.name,
    required this.roleAvatars,
    required this.roleTitles,
    this.trustScore,
    this.currentSquadId,
    this.squadRole,
  });

  // Get avatar for a specific role, fallback to default if not set
  String getAvatarForRole(UserRole role) {
    return roleAvatars[role] ?? role.defaultAvatar;
  }

  // Get title for a specific role
  String getTitleForRole(UserRole role) {
    return roleTitles[role] ?? role.displayName;
  }

  // Get trust score or create initial one
  TrustScore getTrustScore() {
    return trustScore ?? TrustScore.initial(id);
  }

  // Copy with method for immutability
  UserProfile copyWith({
    String? id,
    String? name,
    Map<UserRole, String>? roleAvatars,
    Map<UserRole, String>? roleTitles,
    TrustScore? trustScore,
    String? currentSquadId,
    SquadRole? squadRole,
  }) {
    return UserProfile(
      id: id ?? this.id,
      name: name ?? this.name,
      roleAvatars: roleAvatars ?? this.roleAvatars,
      roleTitles: roleTitles ?? this.roleTitles,
      trustScore: trustScore ?? this.trustScore,
      currentSquadId: currentSquadId ?? this.currentSquadId,
      squadRole: squadRole ?? this.squadRole,
    );
  }

  // Default user profile
  static UserProfile get defaultProfile {
    const userId = 'default_user_001';
    return UserProfile(
      id: userId,
      name: 'Nusrat Jahan',
      roleAvatars: {
        UserRole.consumer: 'placeholder_female',
        UserRole.partner: 'placeholder_male',
        UserRole.rider: 'placeholder_male',
      },
      roleTitles: {
        UserRole.consumer: 'Gold Consumer - Level 12',
        UserRole.partner: 'Gold Partner - Level 35',
        UserRole.rider: 'Gold Runner - Level 28',
      },
      trustScore: TrustScore.initial(userId),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'role_avatars': roleAvatars.map((k, v) => MapEntry(k.name, v)),
      'role_titles': roleTitles.map((k, v) => MapEntry(k.name, v)),
      'trust_score': trustScore?.toJson(),
      'current_squad_id': currentSquadId,
      'squad_role': squadRole?.key,
    };
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      name: json['name'] as String,
      roleAvatars: (json['role_avatars'] as Map<String, dynamic>).map(
        (k, v) => MapEntry(
          UserRole.values.firstWhere((e) => e.name == k),
          v as String,
        ),
      ),
      roleTitles: (json['role_titles'] as Map<String, dynamic>).map(
        (k, v) => MapEntry(
          UserRole.values.firstWhere((e) => e.name == k),
          v as String,
        ),
      ),
      trustScore: json['trust_score'] != null
          ? TrustScore.fromJson(json['trust_score'] as Map<String, dynamic>)
          : null,
      currentSquadId: json['current_squad_id'] as String?,
      squadRole: json['squad_role'] != null
          ? SquadRole.values.firstWhere(
              (r) => r.key == json['squad_role'],
              orElse: () => SquadRole.member,
            )
          : null,
    );
  }
}