import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/user_profile.dart';
import 'package:rizik_v4/data/models/user_role.dart';

class ProfileProvider extends ChangeNotifier {
  UserProfile _profile = UserProfile.defaultProfile;

  UserProfile get profile => _profile;

  // Update the user profile
  void updateProfile(UserProfile newProfile) {
    _profile = newProfile;
    notifyListeners();
  }

  // Update avatar for a specific role
  void updateAvatarForRole(String avatarUrl, UserRole role) {
    _profile.roleAvatars[role] = avatarUrl;
    notifyListeners();
  }

  // Get avatar for current role
  String getAvatarForRole(UserRole role) {
    return _profile.getAvatarForRole(role);
  }

  // Get title for current role
  String getTitleForRole(UserRole role) {
    return _profile.getTitleForRole(role);
  }
}