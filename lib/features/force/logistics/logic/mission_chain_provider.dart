// Mission Chain Provider
// State management for mission chains

import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/mission.dart';
import 'package:rizik_v4/data/models/mission_chain.dart';
import 'package:rizik_v4/data/remote/mission_chain_service.dart';

class MissionChainProvider extends ChangeNotifier {
  List<MissionChain> _availableChains = [];
  MissionChain? _activeChain;
  List<MissionChain> _completedChains = [];
  bool _isLoading = false;
  String? _error;

  // Getters
  List<MissionChain> get availableChains => _availableChains;
  MissionChain? get activeChain => _activeChain;
  List<MissionChain> get completedChains => _completedChains;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get hasActiveChain => _activeChain != null && !_activeChain!.isCompleted;

  /// Generate chains from available missions
  Future<void> generateChains({
    required List<Mission> availableMissions,
    required double riderLat,
    required double riderLng,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      _availableChains = MissionChainService.generateChains(
        availableMissions: availableMissions,
        riderLat: riderLat,
        riderLng: riderLng,
        maxChains: 5,
      );

      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Accept a chain (all-or-nothing)
  Future<void> acceptChain(String chainId) async {
    final chain = _availableChains.firstWhere((c) => c.id == chainId);

    _activeChain = MissionChainService.acceptChain(chain);

    // Remove from available
    _availableChains.removeWhere((c) => c.id == chainId);

    notifyListeners();
  }

  /// Complete current mission in active chain
  Future<void> completeCurrentMission() async {
    if (_activeChain == null) return;

    _activeChain = MissionChainService.completeMission(_activeChain!);

    // If chain completed, move to completed list
    if (_activeChain!.isCompleted) {
      _completedChains.add(_activeChain!);
      _activeChain = null;
    }

    notifyListeners();
  }

  /// Get route for chain
  OptimizedRoute getRoute({
    required MissionChain chain,
    required double riderLat,
    required double riderLng,
  }) {
    return MissionChainService.buildRoute(
      chain: chain,
      riderLat: riderLat,
      riderLng: riderLng,
    );
  }

  /// Cancel active chain
  void cancelActiveChain() {
    _activeChain = null;
    notifyListeners();
  }

  /// Clear all chains
  void clearChains() {
    _availableChains.clear();
    notifyListeners();
  }

  /// Get total earnings from completed chains
  double get totalChainEarnings {
    return _completedChains.fold<double>(
      0,
      (sum, chain) => sum + chain.totalWithBonus,
    );
  }

  /// Get total bonus earned
  double get totalBonusEarned {
    return _completedChains.fold<double>(
      0,
      (sum, chain) => sum + chain.bonusAmount,
    );
  }

  /// Get chain completion rate
  double get chainCompletionRate {
    if (_completedChains.isEmpty) return 0;
    final totalAccepted = _completedChains.length + (hasActiveChain ? 1 : 0);
    return (_completedChains.length / totalAccepted) * 100;
  }
}
