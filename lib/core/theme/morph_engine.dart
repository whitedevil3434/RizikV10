import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';

class MorphEngine {
  final UserRole role;

  MorphEngine(this.role);

  Color get primaryColor {
    switch (role) {
      case UserRole.force:
        return Colors.blue.shade700;
      case UserRole.source:
        return Colors.amber.shade800;
      case UserRole.seeker:
      default:
        return RizikColors.rizikGreen;
    }
  }

  Color get backgroundColor {
    switch (role) {
      case UserRole.force:
        return Colors.blue.shade50;
      case UserRole.source:
        return Colors.amber.shade50;
      case UserRole.seeker:
      default:
        return RizikColors.background;
    }
  }

  String get roleSubtitle {
    switch (role) {
      case UserRole.force:
        return 'Force Mode';
      case UserRole.source:
        return 'Source Mode';
      case UserRole.seeker:
      default:
        return 'Seeker Mode';
    }
  }
}

final morphEngineProvider = Provider<MorphEngine>((ref) {
  final role = ref.watch(userRoleProvider);
  return MorphEngine(role);
});
