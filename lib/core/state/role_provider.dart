import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/data/models/user_profile.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/core/config/color_scheme.dart';
import 'package:rizik_v4/data/remote/role_context_manager.dart';

class RoleProvider with ChangeNotifier {
  UserRole _currentRole = UserRole.consumer;
  bool _isAnimating = false;
  late RoleContextManager _roleContextManager;

  UserRole get currentRole => _currentRole;
  bool get isAnimating => _isAnimating;
  RoleContextManager get roleContextManager => _roleContextManager;

  RoleProvider() {
    // Initialize RoleContextManager with default profile
    _roleContextManager = RoleContextManager(
      userProfile: UserProfile.defaultProfile,
      trustScore: TrustScore.initial('default_user_001'),
      initialRole: _currentRole,
    );
  }

  Color get primaryColor => RizikColorScheme.primary;
  LinearGradient get gradient => RizikColorScheme.primaryGradient;
  String get tagline => _currentRole.tagline;
  String get taglineBn => _currentRole.taglineBn;

  Future<void> setRole(UserRole newRole) async {
    if (_currentRole == newRole || _isAnimating) return;

    _isAnimating = true;
    notifyListeners();

    // Switch role in context manager
    final success = _roleContextManager.switchRole(newRole);
    
    if (success) {
      _currentRole = newRole;
    }
    
    _isAnimating = false;
    notifyListeners();
  }

  /// Update role context manager (for profile/trust score changes)
  void updateRoleContext({
    UserProfile? userProfile,
    TrustScore? trustScore,
  }) {
    _roleContextManager = RoleContextManager(
      userProfile: userProfile ?? _roleContextManager.userProfile,
      trustScore: trustScore ?? _roleContextManager.trustScore,
      initialRole: _currentRole,
    );
    notifyListeners();
  }

  // Theme data based on current role
  ThemeData getThemeData() {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.light,
      ),
      fontFamily: 'Inter',
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: const CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      chipTheme: ChipThemeData(
        backgroundColor: RizikColorScheme.primary.withValues(alpha: 0.1),
        labelStyle: TextStyle(color: RizikColorScheme.primary),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      ),
    );
  }
}