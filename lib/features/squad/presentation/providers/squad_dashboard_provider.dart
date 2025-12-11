import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/data/remote/api_service.dart';

class SquadDashboardUiNotifier extends StateNotifier<Map<String, dynamic>?> {
  SquadDashboardUiNotifier() : super(null);

  Future<void> fetchDashboard(String squadId) async {
    try {
      // Fetch the Maker Dashboard (Squad Management View)
      // In a real app, we might choose based on user role
      final response = await ApiService.get('/api/maker/dashboard?squad_id=$squadId');
      state = response;
    } catch (e) {
      // Error State SDUI
      state = {
        'appBar': {'title': 'Error'},
        'child': {
          'type': 'center',
          'child': {
            'type': 'text',
            'text': 'Failed to load dashboard: $e',
            'color': 'red'
          }
        }
      };
    }
  }

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
