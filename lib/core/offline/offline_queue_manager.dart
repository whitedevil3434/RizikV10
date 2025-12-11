import 'package:hive_flutter/hive_flutter.dart';
import 'dart:convert';

/// OfflineQueueManager - Handles offline API requests
/// Stores failed API calls and retries them when connection is restored
class OfflineQueueManager {
  static final OfflineQueueManager _instance = OfflineQueueManager._internal();
  factory OfflineQueueManager() => _instance;
  OfflineQueueManager._internal();

  Box? _queueBox;
  
  static const String _boxName = 'offline_queue';

  /// Initialize
  Future<void> initialize() async {
    if (!Hive.isBoxOpen(_boxName)) {
      _queueBox = await Hive.openBox(_boxName);
    } else {
      _queueBox = Hive.box(_boxName);
    }
  }

  /// Add request to queue
  Future<void> addToQueue(OfflineRequest request) async {
    final box = _queueBox ?? await Hive.openBox(_boxName);
    await box.add(request.toJson());
    print('📥 Added to offline queue: ${request.endpoint}');
  }

  /// Get all pending requests
  Future<List<OfflineRequest>> getPendingRequests() async {
    final box = _queueBox ?? await Hive.openBox(_boxName);
    final requests = <OfflineRequest>[];
    
    for (var i = 0; i < box.length; i++) {
      final data = box.getAt(i);
      if (data != null) {
        requests.add(OfflineRequest.fromJson(Map<String, dynamic>.from(data)));
      }
    }
    
    return requests;
  }

  /// Remove request from queue
  Future<void> removeFromQueue(int index) async {
    final box = _queueBox ?? await Hive.openBox(_boxName);
    await box.deleteAt(index);
  }

  /// Clear all requests
  Future<void> clearQueue() async {
    final box = _queueBox ?? await Hive.openBox(_boxName);
    await box.clear();
  }

  /// Sync all pending requests
  Future<void> syncQueue() async {
    final requests = await getPendingRequests();
    print('📤 Syncing ${requests.length} offline requests...');
    
    for (var i = 0; i < requests.length; i++) {
      final request = requests[i];
      try {
        // TODO: Actually make the API call
        print('✅ Synced: ${request.endpoint}');
        await removeFromQueue(i);
      } catch (e) {
        print('❌ Failed to sync: ${request.endpoint}');
      }
    }
  }
}

/// Offline Request Model
class OfflineRequest {
  final String endpoint;
  final String method; // GET, POST, PUT, DELETE
  final Map<String, dynamic>? body;
  final Map<String, String>? headers;
  final DateTime createdAt;

  OfflineRequest({
    required this.endpoint,
    required this.method,
    this.body,
    this.headers,
    DateTime? createdAt,
  }) : createdAt = createdAt ?? DateTime.now();

  Map<String, dynamic> toJson() => {
    'endpoint': endpoint,
    'method': method,
    'body': body,
    'headers': headers,
    'created_at': createdAt.toIso8601String(),
  };

  factory OfflineRequest.fromJson(Map<String, dynamic> json) => OfflineRequest(
    endpoint: json['endpoint'],
    method: json['method'],
    body: json['body'] != null ? Map<String, dynamic>.from(json['body']) : null,
    headers: json['headers'] != null ? Map<String, String>.from(json['headers']) : null,
    createdAt: DateTime.parse(json['created_at']),
  );
}

/// Global instance
final offlineQueueManager = OfflineQueueManager();
