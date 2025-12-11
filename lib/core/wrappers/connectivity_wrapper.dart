import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:async';

/// ConnectivityWrapper - Smart Internet Monitor
/// Monitors internet connection and provides offline/online callbacks
class ConnectivityWrapper {
  static final ConnectivityWrapper _instance = ConnectivityWrapper._internal();
  factory ConnectivityWrapper() => _instance;
  ConnectivityWrapper._internal();

  final Connectivity _connectivity = Connectivity();
  
  // Stream controllers
  final _connectionStreamController = StreamController<bool>.broadcast();
  Stream<bool> get connectionStream => _connectionStreamController.stream;
  
  bool _isOnline = true;
  bool get isOnline => _isOnline;
  
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  /// Initialize connectivity monitoring
  Future<void> initialize() async {
    // Check initial connection
    await _checkConnection();
    
    // Listen to changes
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (List<ConnectivityResult> results) async {
        await _checkConnection();
      },
    );
  }

  /// Check current connection
  Future<void> _checkConnection() async {
    final results = await _connectivity.checkConnectivity();
    final result = results.first;
    
    final wasOnline = _isOnline;
    _isOnline = result != ConnectivityResult.none;
    
    if (wasOnline != _isOnline) {
      _connectionStreamController.add(_isOnline);
      
      if (_isOnline) {
        print('🟢 Back online');
        _onBackOnline();
      } else {
        print('🔴 Went offline');
        _onWentOffline();
      }
    }
  }

  /// Called when connection is restored
  Future<void> _onBackOnline() async {
    // Trigger sync of offline queue
    await _syncOfflineQueue();
  }

  /// Called when connection is lost
  void _onWentOffline() {
    // Show offline banner
  }

  /// Sync offline queue when back online
  Future<void> _syncOfflineQueue() async {
    // TODO: Implement offline queue sync
    print('📤 Syncing offline queue...');
  }

  /// Dispose
  void dispose() {
    _connectivitySubscription?.cancel();
    _connectionStreamController.close();
  }
}

/// Global instance
final connectivityWrapper = ConnectivityWrapper();
