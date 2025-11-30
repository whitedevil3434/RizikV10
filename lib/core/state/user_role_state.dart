import 'package:flutter_riverpod/flutter_riverpod.dart';

enum UserRole {
  seeker,
  force,
  source,
}

class UserRoleNotifier extends StateNotifier<UserRole> {
  UserRoleNotifier() : super(UserRole.seeker);

  void setRole(UserRole role) {
    state = role;
  }

  void setRoleFromString(String role) {
    switch (role.toLowerCase()) {
      case 'force':
        state = UserRole.force;
        break;
      case 'source':
        state = UserRole.source;
        break;
      case 'seeker':
      default:
        state = UserRole.seeker;
        break;
    }
  }
  
  String get roleString => state.name;
}

final userRoleProvider = StateNotifierProvider<UserRoleNotifier, UserRole>((ref) {
  return UserRoleNotifier();
});
