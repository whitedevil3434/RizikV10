import 'package:flutter_riverpod/flutter_riverpod.dart';

class SquadDashboardUiNotifier extends StateNotifier<Map<String, dynamic>?> {
  SquadDashboardUiNotifier() : super(null);

  void updateUi(Map<String, dynamic> uiJson) {
    state = uiJson;
  }

  void clear() {
    state = null;
  }
}

final squadDashboardUiProvider = StateNotifierProvider<SquadDashboardUiNotifier, Map<String, dynamic>?>(
  (ref) => SquadDashboardUiNotifier(),
);
