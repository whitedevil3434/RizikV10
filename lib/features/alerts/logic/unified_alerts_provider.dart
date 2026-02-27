import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AlertPriority { low, medium, high }

enum AlertStatus { open, acknowledged, snoozed, assigned }

class AlertSnapshot {
  final String key;
  final String title;
  final AlertPriority priority;
  final int value;

  const AlertSnapshot({
    required this.key,
    required this.title,
    required this.priority,
    required this.value,
  });
}

class UnifiedAlertRecord {
  final String key;
  final String title;
  final AlertPriority priority;
  final int value;
  final AlertStatus status;
  final String? assignedTo;
  final DateTime? snoozedUntil;
  final DateTime updatedAt;

  const UnifiedAlertRecord({
    required this.key,
    required this.title,
    required this.priority,
    required this.value,
    required this.status,
    required this.updatedAt,
    this.assignedTo,
    this.snoozedUntil,
  });

  bool get isSnoozedActive =>
      snoozedUntil != null && snoozedUntil!.isAfter(DateTime.now());

  UnifiedAlertRecord copyWith({
    String? title,
    AlertPriority? priority,
    int? value,
    AlertStatus? status,
    String? assignedTo,
    DateTime? snoozedUntil,
    DateTime? updatedAt,
  }) {
    return UnifiedAlertRecord(
      key: key,
      title: title ?? this.title,
      priority: priority ?? this.priority,
      value: value ?? this.value,
      status: status ?? this.status,
      assignedTo: assignedTo ?? this.assignedTo,
      snoozedUntil: snoozedUntil ?? this.snoozedUntil,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'title': title,
      'priority': priority.name,
      'value': value,
      'status': status.name,
      'assignedTo': assignedTo,
      'snoozedUntil': snoozedUntil?.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  factory UnifiedAlertRecord.fromJson(Map<String, dynamic> json) {
    return UnifiedAlertRecord(
      key: json['key'] as String,
      title: json['title'] as String,
      priority: AlertPriority.values.firstWhere(
        (p) => p.name == json['priority'],
        orElse: () => AlertPriority.low,
      ),
      value: json['value'] as int? ?? 0,
      status: AlertStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => AlertStatus.open,
      ),
      assignedTo: json['assignedTo'] as String?,
      snoozedUntil: json['snoozedUntil'] == null
          ? null
          : DateTime.tryParse(json['snoozedUntil'] as String),
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class AlertActionLog {
  final String id;
  final String key;
  final String action;
  final String details;
  final DateTime timestamp;

  const AlertActionLog({
    required this.id,
    required this.key,
    required this.action,
    required this.details,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'key': key,
      'action': action,
      'details': details,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  factory AlertActionLog.fromJson(Map<String, dynamic> json) {
    return AlertActionLog(
      id: json['id'] as String,
      key: json['key'] as String,
      action: json['action'] as String,
      details: json['details'] as String,
      timestamp: DateTime.tryParse(json['timestamp'] as String? ?? '') ??
          DateTime.now(),
    );
  }
}

class UnifiedAlertsProvider with ChangeNotifier {
  static const _recordsKey = 'unified_alert_records_v1';
  static const _timelineKey = 'unified_alert_timeline_v1';

  final Map<String, UnifiedAlertRecord> _records = {};
  final List<AlertActionLog> _timeline = [];

  Map<String, UnifiedAlertRecord> get records => _records;
  List<AlertActionLog> get timeline => List.unmodifiable(_timeline);

  UnifiedAlertsProvider() {
    _load();
  }

  UnifiedAlertRecord? recordFor(String key) => _records[key];

  Future<void> _load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final recordsRaw = prefs.getString(_recordsKey);
      if (recordsRaw != null) {
        final list = jsonDecode(recordsRaw) as List<dynamic>;
        for (final item in list) {
          final record = UnifiedAlertRecord.fromJson(
            Map<String, dynamic>.from(item as Map),
          );
          _records[record.key] = record;
        }
      }

      final timelineRaw = prefs.getString(_timelineKey);
      if (timelineRaw != null) {
        final list = jsonDecode(timelineRaw) as List<dynamic>;
        _timeline
          ..clear()
          ..addAll(
            list.map(
              (e) =>
                  AlertActionLog.fromJson(Map<String, dynamic>.from(e as Map)),
            ),
          );
      }
      notifyListeners();
    } catch (e) {
      debugPrint('UnifiedAlerts load failed: $e');
    }
  }

  Future<void> _save() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _recordsKey,
      jsonEncode(_records.values.map((e) => e.toJson()).toList()),
    );
    await prefs.setString(
      _timelineKey,
      jsonEncode(_timeline.take(80).map((e) => e.toJson()).toList()),
    );
  }

  Future<void> syncFromSnapshot(List<AlertSnapshot> snapshot) async {
    var changed = false;
    for (final item in snapshot) {
      final existing = _records[item.key];
      if (existing == null) {
        _records[item.key] = UnifiedAlertRecord(
          key: item.key,
          title: item.title,
          priority: item.priority,
          value: item.value,
          status: AlertStatus.open,
          updatedAt: DateTime.now(),
        );
        changed = true;
        continue;
      }

      final status =
          existing.isSnoozedActive ? AlertStatus.snoozed : existing.status;
      if (existing.value != item.value ||
          existing.title != item.title ||
          existing.priority != item.priority ||
          existing.status != status) {
        _records[item.key] = existing.copyWith(
          title: item.title,
          priority: item.priority,
          value: item.value,
          status: status,
          updatedAt: DateTime.now(),
        );
        changed = true;
      }
    }

    if (changed) {
      await _save();
      notifyListeners();
    }
  }

  Future<void> acknowledge(String key) async {
    final record = _records[key];
    if (record == null) return;
    _records[key] = record.copyWith(
      status: AlertStatus.acknowledged,
      updatedAt: DateTime.now(),
    );
    _timeline.insert(
      0,
      AlertActionLog(
        id: 'ack_${DateTime.now().millisecondsSinceEpoch}',
        key: key,
        action: 'ACKNOWLEDGED',
        details: '${record.title} acknowledged',
        timestamp: DateTime.now(),
      ),
    );
    await _save();
    notifyListeners();
  }

  Future<void> snooze(String key, Duration duration) async {
    final record = _records[key];
    if (record == null) return;
    final until = DateTime.now().add(duration);
    _records[key] = record.copyWith(
      status: AlertStatus.snoozed,
      snoozedUntil: until,
      updatedAt: DateTime.now(),
    );
    _timeline.insert(
      0,
      AlertActionLog(
        id: 'snz_${DateTime.now().millisecondsSinceEpoch}',
        key: key,
        action: 'SNOOZED',
        details: '${record.title} snoozed for ${duration.inMinutes}m',
        timestamp: DateTime.now(),
      ),
    );
    await _save();
    notifyListeners();
  }

  Future<void> assign(String key, String assignee) async {
    final record = _records[key];
    if (record == null) return;
    _records[key] = record.copyWith(
      status: AlertStatus.assigned,
      assignedTo: assignee,
      updatedAt: DateTime.now(),
    );
    _timeline.insert(
      0,
      AlertActionLog(
        id: 'asg_${DateTime.now().millisecondsSinceEpoch}',
        key: key,
        action: 'ASSIGNED',
        details: '${record.title} assigned to $assignee',
        timestamp: DateTime.now(),
      ),
    );
    await _save();
    notifyListeners();
  }
}
