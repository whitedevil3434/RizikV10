import 'package:flutter/foundation.dart';

/// Float status enum
enum FloatStatus {
  available('available', 'উপলব্ধ'),
  active('active', 'সক্রিয়'),
  repaying('repaying', 'পরিশোধ চলছে'),
  suspended('suspended', 'স্থগিত'),
  completed('completed', 'সম্পন্ন');

  const FloatStatus(this.key, this.nameBn);

  final String key;
  final String nameBn;
}

/// Float transaction type
enum FloatTransactionType {
  deposit('deposit', 'জমা', '💰'),
  deduction('deduction', 'কর্তন', '📉'),
  reset('reset', 'রিসেট', '🔄');

  const FloatTransactionType(this.key, this.nameBn, this.emoji);

  final String key;
  final String nameBn;
  final String emoji;
}

/// Float transaction record
@immutable
class FloatTransaction {
  final String id;
  final FloatTransactionType type;
  final double amount;
  final DateTime timestamp;
  final String? missionId;
  final String? note;

  const FloatTransaction({
    required this.id,
    required this.type,
    required this.amount,
    required this.timestamp,
    this.missionId,
    this.note,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.key,
      'amount': amount,
      'timestamp': timestamp.toIso8601String(),
      'mission_id': missionId,
      'note': note,
    };
  }


  factory FloatTransaction.fromJson(Map<String, dynamic> json) {
    return FloatTransaction(
      id: json['id'] as String,
      type: FloatTransactionType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => FloatTransactionType.deposit,
      ),
      amount: (json['amount'] as num).toDouble(),
      timestamp: DateTime.parse(json['timestamp'] as String),
      missionId: json['mission_id'] as String?,
      note: json['note'] as String?,
    );
  }
}

/// Auto-repayment configuration
@immutable
class AutoRepayment {
  final double percentage; // 10% of mission earnings
  final double remainingBalance;
  final DateTime? lastDeductionDate;
  final int totalDeductions;

  const AutoRepayment({
    this.percentage = 0.10,
    required this.remainingBalance,
    this.lastDeductionDate,
    this.totalDeductions = 0,
  });

  AutoRepayment copyWith({
    double? percentage,
    double? remainingBalance,
    DateTime? lastDeductionDate,
    int? totalDeductions,
  }) {
    return AutoRepayment(
      percentage: percentage ?? this.percentage,
      remainingBalance: remainingBalance ?? this.remainingBalance,
      lastDeductionDate: lastDeductionDate ?? this.lastDeductionDate,
      totalDeductions: totalDeductions ?? this.totalDeductions,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'percentage': percentage,
      'remaining_balance': remainingBalance,
      'last_deduction_date': lastDeductionDate?.toIso8601String(),
      'total_deductions': totalDeductions,
    };
  }

  factory AutoRepayment.fromJson(Map<String, dynamic> json) {
    return AutoRepayment(
      percentage: (json['percentage'] as num?)?.toDouble() ?? 0.10,
      remainingBalance: (json['remaining_balance'] as num).toDouble(),
      lastDeductionDate: json['last_deduction_date'] != null
          ? DateTime.parse(json['last_deduction_date'] as String)
          : null,
      totalDeductions: json['total_deductions'] as int? ?? 0,
    );
  }
}

/// Main Mover Float model
@immutable
class MoverFloat {
  final String id;
  final String moverId;
  final double dailyLimit;
  final double currentFloat;
  final double repaidToday;
  final FloatStatus status;
  final DateTime lastResetDate;
  final DateTime? lastDepositDate;
  final List<FloatTransaction> transactions;
  final AutoRepayment autoRepayment;
  final double trustScore;

  const MoverFloat({
    required this.id,
    required this.moverId,
    required this.dailyLimit,
    this.currentFloat = 0.0,
    this.repaidToday = 0.0,
    required this.status,
    required this.lastResetDate,
    this.lastDepositDate,
    required this.transactions,
    required this.autoRepayment,
    required this.trustScore,
  });

  // Calculated properties
  double get remainingBalance => currentFloat - repaidToday;
  double get totalRepaymentDue => autoRepayment.remainingBalance;
  bool get isFullyRepaid => remainingBalance <= 0;
  bool get canRequestFloat => status != FloatStatus.suspended && isFullyRepaid;
  
  // Check if it's a new day and reset is needed
  bool get needsReset {
    final now = DateTime.now();
    final lastReset = lastResetDate;
    return now.day != lastReset.day ||
        now.month != lastReset.month ||
        now.year != lastReset.year;
  }

  MoverFloat copyWith({
    String? id,
    String? moverId,
    double? dailyLimit,
    double? currentFloat,
    double? repaidToday,
    FloatStatus? status,
    DateTime? lastResetDate,
    DateTime? lastDepositDate,
    List<FloatTransaction>? transactions,
    AutoRepayment? autoRepayment,
    double? trustScore,
  }) {
    return MoverFloat(
      id: id ?? this.id,
      moverId: moverId ?? this.moverId,
      dailyLimit: dailyLimit ?? this.dailyLimit,
      currentFloat: currentFloat ?? this.currentFloat,
      repaidToday: repaidToday ?? this.repaidToday,
      status: status ?? this.status,
      lastResetDate: lastResetDate ?? this.lastResetDate,
      lastDepositDate: lastDepositDate ?? this.lastDepositDate,
      transactions: transactions ?? this.transactions,
      autoRepayment: autoRepayment ?? this.autoRepayment,
      trustScore: trustScore ?? this.trustScore,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'mover_id': moverId,
      'daily_limit': dailyLimit,
      'current_float': currentFloat,
      'repaid_today': repaidToday,
      'status': status.key,
      'last_reset_date': lastResetDate.toIso8601String(),
      'last_deposit_date': lastDepositDate?.toIso8601String(),
      'transactions': transactions.map((t) => t.toJson()).toList(),
      'auto_repayment': autoRepayment.toJson(),
      'trust_score': trustScore,
    };
  }

  factory MoverFloat.fromJson(Map<String, dynamic> json) {
    return MoverFloat(
      id: json['id'] as String,
      moverId: json['mover_id'] as String,
      dailyLimit: (json['daily_limit'] as num).toDouble(),
      currentFloat: (json['current_float'] as num?)?.toDouble() ?? 0.0,
      repaidToday: (json['repaid_today'] as num?)?.toDouble() ?? 0.0,
      status: FloatStatus.values.firstWhere(
        (s) => s.key == json['status'],
        orElse: () => FloatStatus.available,
      ),
      lastResetDate: DateTime.parse(json['last_reset_date'] as String),
      lastDepositDate: json['last_deposit_date'] != null
          ? DateTime.parse(json['last_deposit_date'] as String)
          : null,
      transactions: (json['transactions'] as List<dynamic>?)
              ?.map((t) => FloatTransaction.fromJson(t as Map<String, dynamic>))
              .toList() ??
          [],
      autoRepayment: AutoRepayment.fromJson(
        json['auto_repayment'] as Map<String, dynamic>,
      ),
      trustScore: (json['trust_score'] as num).toDouble(),
    );
  }

  /// Create a new float for a mover
  factory MoverFloat.create({
    required String moverId,
    required double trustScore,
  }) {
    final dailyLimit = _calculateDailyLimit(trustScore);
    
    return MoverFloat(
      id: 'float_${DateTime.now().millisecondsSinceEpoch}',
      moverId: moverId,
      dailyLimit: dailyLimit,
      currentFloat: 0.0,
      repaidToday: 0.0,
      status: FloatStatus.available,
      lastResetDate: DateTime.now(),
      transactions: [],
      autoRepayment: AutoRepayment(
        remainingBalance: 0.0,
      ),
      trustScore: trustScore,
    );
  }

  /// Calculate daily limit based on trust score
  static double _calculateDailyLimit(double trustScore) {
    if (trustScore >= 4.8) return 500.0;
    if (trustScore >= 4.5) return 300.0;
    if (trustScore >= 4.2) return 200.0;
    if (trustScore >= 4.0) return 150.0;
    return 100.0;
  }
}
