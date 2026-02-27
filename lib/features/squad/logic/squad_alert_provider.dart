import 'package:flutter/foundation.dart';

/// Lightweight computed alert count for squad-related surfaces.
class SquadAlertProvider with ChangeNotifier {
  int _alertCount = 0;

  int get alertCount => _alertCount;

  void recompute({
    required int lowStockCount,
    required int activeOrders,
    required bool hasSquadError,
  }) {
    final computed =
        lowStockCount + (activeOrders > 0 ? 1 : 0) + (hasSquadError ? 1 : 0);
    if (computed == _alertCount) {
      return;
    }
    _alertCount = computed;
    notifyListeners();
  }
}
