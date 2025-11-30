import 'package:flutter/foundation.dart';

/// Duty roles for roster assignments
enum DutyRole {
  chef('chef', 'শেফ', '👨‍🍳'),
  buyer('buyer', 'ক্রেতা', '🛒'),
  cleaner('cleaner', 'ক্লিনার', '🧹'),
  delivery('delivery', 'ডেলিভারি', '🚴'),
  manager('manager', 'ম্যানেজার', '👔');

  const DutyRole(this.key, this.nameBn, this.emoji);
  final String key;
  final String nameBn;
  final String emoji;
}

/// Status of a shift
enum ShiftStatus {
  scheduled('scheduled', 'নির্ধারিত'),
  active('active', 'সক্রিয়'),
  completed('completed', 'সম্পন্ন'),
  missed('missed', 'মিসড'),
  swapped('swapped', 'অদলবদল');

  const ShiftStatus(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

/// Status of a duty swap request
enum SwapStatus {
  pending('pending', 'অপেক্ষমাণ'),
  approved('approved', 'অনুমোদিত'),
  rejected('rejected', 'প্রত্যাখ্যাত');

  const SwapStatus(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

/// Individual shift assignment
@immutable
class Shift {
  final String id;
  final String memberId;
  final String memberName;
  final DutyRole role;
  final DateTime startTime;
  final DateTime endTime;
  final ShiftStatus status;
  final String? notes;
  final double? performanceScore;
  final DateTime? completedAt;

  const Shift({
    required this.id,
    required this.memberId,
    required this.memberName,
    required this.role,
    required this.startTime,
    required this.endTime,
    this.status = ShiftStatus.scheduled,
    this.notes,
    this.performanceScore,
    this.completedAt,
  });

  bool get isOverdue => DateTime.now().isAfter(endTime) && status == ShiftStatus.scheduled;
  
  double get durationHours {
    final duration = endTime.difference(startTime);
    return duration.inMinutes / 60.0;
  }

  Shift copyWith({
    String? id,
    String? memberId,
    String? memberName,
    DutyRole? role,
    DateTime? startTime,
    DateTime? endTime,
    ShiftStatus? status,
    String? notes,
    double? performanceScore,
    DateTime? completedAt,
  }) {
    return Shift(
      id: id ?? this.id,
      memberId: memberId ?? this.memberId,
      memberName: memberName ?? this.memberName,
      role: role ?? this.role,
      startTime: startTime ?? this.startTime,
      endTime: endTime ?? this.endTime,
      status: status ?? this.status,
      notes: notes ?? this.notes,
      performanceScore: performanceScore ?? this.performanceScore,
      completedAt: completedAt ?? this.completedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'member_id': memberId,
      'member_name': memberName,
      'role': role.key,
      'start_time': startTime.toIso8601String(),
      'end_time': endTime.toIso8601String(),
      'status': status.key,
      'notes': notes,
      'performance_score': performanceScore,
      'completed_at': completedAt?.toIso8601String(),
    };
  }

  factory Shift.fromJson(Map<String, dynamic> json) {
    return Shift(
      id: json['id'] as String,
      memberId: json['member_id'] as String,
      memberName: json['member_name'] as String,
      role: DutyRole.values.firstWhere((r) => r.key == json['role']),
      startTime: DateTime.parse(json['start_time'] as String),
      endTime: DateTime.parse(json['end_time'] as String),
      status: ShiftStatus.values.firstWhere(
        (s) => s.key == json['status'],
        orElse: () => ShiftStatus.scheduled,
      ),
      notes: json['notes'] as String?,
      performanceScore: (json['performance_score'] as num?)?.toDouble(),
      completedAt: json['completed_at'] != null
          ? DateTime.parse(json['completed_at'] as String)
          : null,
    );
  }
}

/// Duty swap request
@immutable
class DutySwap {
  final String id;
  final String requesterId;
  final String requesterName;
  final String targetId;
  final String targetName;
  final String? shiftId;
  final Shift? shift;
  final DateTime requestedAt;
  final DateTime? respondedAt;
  final SwapStatus status;
  final String? reason;
  final String? approvedBy;
  final String? responseMessage;

  const DutySwap({
    required this.id,
    required this.requesterId,
    required this.requesterName,
    required this.targetId,
    required this.targetName,
    this.shiftId,
    this.shift,
    required this.requestedAt,
    this.respondedAt,
    this.status = SwapStatus.pending,
    this.reason,
    this.approvedBy,
    this.responseMessage,
  });

  DutySwap copyWith({
    String? id,
    String? requesterId,
    String? requesterName,
    String? targetId,
    String? targetName,
    String? shiftId,
    Shift? shift,
    DateTime? requestedAt,
    DateTime? respondedAt,
    SwapStatus? status,
    String? reason,
    String? approvedBy,
    String? responseMessage,
  }) {
    return DutySwap(
      id: id ?? this.id,
      requesterId: requesterId ?? this.requesterId,
      requesterName: requesterName ?? this.requesterName,
      targetId: targetId ?? this.targetId,
      targetName: targetName ?? this.targetName,
      shiftId: shiftId ?? this.shiftId,
      shift: shift ?? this.shift,
      requestedAt: requestedAt ?? this.requestedAt,
      respondedAt: respondedAt ?? this.respondedAt,
      status: status ?? this.status,
      reason: reason ?? this.reason,
      approvedBy: approvedBy ?? this.approvedBy,
      responseMessage: responseMessage ?? this.responseMessage,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'requester_id': requesterId,
      'requester_name': requesterName,
      'target_id': targetId,
      'target_name': targetName,
      'shift_id': shiftId,
      'shift': shift?.toJson(),
      'requested_at': requestedAt.toIso8601String(),
      'responded_at': respondedAt?.toIso8601String(),
      'status': status.key,
      'reason': reason,
      'approved_by': approvedBy,
      'response_message': responseMessage,
    };
  }

  factory DutySwap.fromJson(Map<String, dynamic> json) {
    return DutySwap(
      id: json['id'] as String,
      requesterId: json['requester_id'] as String,
      requesterName: json['requester_name'] as String,
      targetId: json['target_id'] as String,
      targetName: json['target_name'] as String,
      shiftId: json['shift_id'] as String?,
      shift: json['shift'] != null
          ? Shift.fromJson(json['shift'] as Map<String, dynamic>)
          : null,
      requestedAt: DateTime.parse(json['requested_at'] as String),
      respondedAt: json['responded_at'] != null
          ? DateTime.parse(json['responded_at'] as String)
          : null,
      status: SwapStatus.values.firstWhere(
        (s) => s.key == json['status'],
        orElse: () => SwapStatus.pending,
      ),
      reason: json['reason'] as String?,
      approvedBy: json['approved_by'] as String?,
      responseMessage: json['response_message'] as String?,
    );
  }
}

/// Member performance metrics
@immutable
class MemberPerformance {
  final String memberId;
  final int totalShifts;
  final int completedShifts;
  final int missedShifts;
  final double totalHours;
  final double averageScore;

  const MemberPerformance({
    required this.memberId,
    required this.totalShifts,
    required this.completedShifts,
    required this.missedShifts,
    required this.totalHours,
    required this.averageScore,
  });

  double get completionRate =>
      totalShifts > 0 ? (completedShifts / totalShifts) * 100 : 0.0;

  MemberPerformance copyWith({
    String? memberId,
    int? totalShifts,
    int? completedShifts,
    int? missedShifts,
    double? totalHours,
    double? averageScore,
  }) {
    return MemberPerformance(
      memberId: memberId ?? this.memberId,
      totalShifts: totalShifts ?? this.totalShifts,
      completedShifts: completedShifts ?? this.completedShifts,
      missedShifts: missedShifts ?? this.missedShifts,
      totalHours: totalHours ?? this.totalHours,
      averageScore: averageScore ?? this.averageScore,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'member_id': memberId,
      'total_shifts': totalShifts,
      'completed_shifts': completedShifts,
      'missed_shifts': missedShifts,
      'total_hours': totalHours,
      'average_score': averageScore,
    };
  }

  factory MemberPerformance.fromJson(Map<String, dynamic> json) {
    return MemberPerformance(
      memberId: json['member_id'] as String,
      totalShifts: json['total_shifts'] as int,
      completedShifts: json['completed_shifts'] as int,
      missedShifts: json['missed_shifts'] as int,
      totalHours: (json['total_hours'] as num).toDouble(),
      averageScore: (json['average_score'] as num).toDouble(),
    );
  }
}

/// Weekly duty roster model
@immutable
class DutyRoster {
  final String id;
  final String squadId;
  final DateTime weekStartDate;
  final DateTime weekEndDate;
  final List<Shift> shifts;
  final List<DutySwap> pendingSwaps;
  final Map<String, MemberPerformance> performanceScores;
  final DateTime createdAt;
  final DateTime lastModified;

  const DutyRoster({
    required this.id,
    required this.squadId,
    required this.weekStartDate,
    required this.weekEndDate,
    this.shifts = const [],
    this.pendingSwaps = const [],
    this.performanceScores = const {},
    required this.createdAt,
    DateTime? lastModified,
  }) : lastModified = lastModified ?? createdAt;

  // For backward compatibility with single-day roster
  DateTime get date => weekStartDate;

  bool get isCompleted =>
      shifts.isNotEmpty &&
      shifts.every((s) =>
          s.status == ShiftStatus.completed || s.status == ShiftStatus.swapped);

  double get completionRate {
    if (shifts.isEmpty) return 0.0;
    final completed =
        shifts.where((s) => s.status == ShiftStatus.completed).length;
    return (completed / shifts.length) * 100;
  }

  List<Shift> get upcomingShifts {
    final now = DateTime.now();
    return shifts
        .where((s) =>
            s.startTime.isAfter(now) && s.status == ShiftStatus.scheduled)
        .toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
  }

  List<Shift> getShiftsForDate(DateTime date) {
    return shifts.where((s) {
      final shiftDate =
          DateTime(s.startTime.year, s.startTime.month, s.startTime.day);
      final targetDate = DateTime(date.year, date.month, date.day);
      return shiftDate.isAtSameMomentAs(targetDate);
    }).toList();
  }

  List<Shift> getShiftsForMember(String memberId) {
    return shifts.where((s) => s.memberId == memberId).toList();
  }

  DutyRoster copyWith({
    String? id,
    String? squadId,
    DateTime? weekStartDate,
    DateTime? weekEndDate,
    List<Shift>? shifts,
    List<DutySwap>? pendingSwaps,
    Map<String, MemberPerformance>? performanceScores,
    DateTime? createdAt,
    DateTime? lastModified,
  }) {
    return DutyRoster(
      id: id ?? this.id,
      squadId: squadId ?? this.squadId,
      weekStartDate: weekStartDate ?? this.weekStartDate,
      weekEndDate: weekEndDate ?? this.weekEndDate,
      shifts: shifts ?? this.shifts,
      pendingSwaps: pendingSwaps ?? this.pendingSwaps,
      performanceScores: performanceScores ?? this.performanceScores,
      createdAt: createdAt ?? this.createdAt,
      lastModified: lastModified ?? this.lastModified,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'squad_id': squadId,
      'week_start_date': weekStartDate.toIso8601String(),
      'week_end_date': weekEndDate.toIso8601String(),
      'shifts': shifts.map((s) => s.toJson()).toList(),
      'pending_swaps': pendingSwaps.map((s) => s.toJson()).toList(),
      'performance_scores': performanceScores.map(
        (key, value) => MapEntry(key, value.toJson()),
      ),
      'created_at': createdAt.toIso8601String(),
      'last_modified': lastModified.toIso8601String(),
    };
  }

  factory DutyRoster.fromJson(Map<String, dynamic> json) {
    return DutyRoster(
      id: json['id'] as String,
      squadId: json['squad_id'] as String,
      weekStartDate: DateTime.parse(json['week_start_date'] as String),
      weekEndDate: DateTime.parse(json['week_end_date'] as String),
      shifts: (json['shifts'] as List<dynamic>?)
              ?.map((s) => Shift.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
      pendingSwaps: (json['pending_swaps'] as List<dynamic>?)
              ?.map((s) => DutySwap.fromJson(s as Map<String, dynamic>))
              .toList() ??
          [],
      performanceScores: (json['performance_scores'] as Map<String, dynamic>?)
              ?.map(
                (key, value) => MapEntry(
                  key,
                  MemberPerformance.fromJson(value as Map<String, dynamic>),
                ),
              ) ??
          {},
      createdAt: DateTime.parse(json['created_at'] as String),
      lastModified: DateTime.parse(json['last_modified'] as String),
    );
  }

  factory DutyRoster.create({
    required String squadId,
    required DateTime weekStart,
  }) {
    final now = DateTime.now();
    final weekEnd = weekStart.add(const Duration(days: 6));
    return DutyRoster(
      id: 'roster_${now.millisecondsSinceEpoch}',
      squadId: squadId,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      createdAt: now,
      lastModified: now,
    );
  }
}
