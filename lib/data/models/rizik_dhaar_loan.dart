import 'package:flutter/foundation.dart';

/// Loan status enum
enum LoanStatus {
  pending('pending', 'অপেক্ষমাণ'),
  approved('approved', 'অনুমোদিত'),
  active('active', 'সক্রিয়'),
  repaying('repaying', 'পরিশোধ চলছে'),
  completed('completed', 'সম্পন্ন'),
  overdue('overdue', 'বিলম্বিত'),
  defaulted('defaulted', 'খেলাপি'),
  rejected('rejected', 'প্রত্যাখ্যাত');

  const LoanStatus(this.key, this.nameBn);

  final String key;
  final String nameBn;
}

/// Loan type enum
enum LoanType {
  ingredient('ingredient', 'উপাদান', '🥬'),
  equipment('equipment', 'সরঞ্জাম', '🔧'),
  working_capital('working_capital', 'কার্যকরী মূলধন', '💰');

  const LoanType(this.key, this.nameBn, this.emoji);

  final String key;
  final String nameBn;
  final String emoji;
}

/// Repayment schedule entry
@immutable
class RepaymentSchedule {
  final DateTime dueDate;
  final double amount;
  final bool isPaid;
  final DateTime? paidDate;
  final double? paidAmount;

  const RepaymentSchedule({
    required this.dueDate,
    required this.amount,
    this.isPaid = false,
    this.paidDate,
    this.paidAmount,
  });

  RepaymentSchedule copyWith({
    DateTime? dueDate,
    double? amount,
    bool? isPaid,
    DateTime? paidDate,
    double? paidAmount,
  }) {
    return RepaymentSchedule(
      dueDate: dueDate ?? this.dueDate,
      amount: amount ?? this.amount,
      isPaid: isPaid ?? this.isPaid,
      paidDate: paidDate ?? this.paidDate,
      paidAmount: paidAmount ?? this.paidAmount,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'due_date': dueDate.toIso8601String(),
      'amount': amount,
      'is_paid': isPaid,
      'paid_date': paidDate?.toIso8601String(),
      'paid_amount': paidAmount,
    };
  }

  factory RepaymentSchedule.fromJson(Map<String, dynamic> json) {
    return RepaymentSchedule(
      dueDate: DateTime.parse(json['due_date'] as String),
      amount: (json['amount'] as num).toDouble(),
      isPaid: json['is_paid'] as bool? ?? false,
      paidDate: json['paid_date'] != null
          ? DateTime.parse(json['paid_date'] as String)
          : null,
      paidAmount: (json['paid_amount'] as num?)?.toDouble(),
    );
  }
}

/// Locked voucher for ingredient purchases
@immutable
class LockedVoucher {
  final String id;
  final double amount;
  final double usedAmount;
  final List<String> approvedVendors; // List of vendor IDs
  final DateTime expiryDate;
  final bool isUsed;
  final DateTime? usedDate;
  final String? usedAt; // Vendor ID where used

  const LockedVoucher({
    required this.id,
    required this.amount,
    this.usedAmount = 0.0,
    required this.approvedVendors,
    required this.expiryDate,
    this.isUsed = false,
    this.usedDate,
    this.usedAt,
  });

  bool get isExpired => DateTime.now().isAfter(expiryDate);
  bool get isValid => !isUsed && !isExpired;
  double get remainingAmount => amount - usedAmount;
  String get voucherCode => id.toUpperCase().replaceAll('_', '-');
  
  /// Alias for approvedVendors (for compatibility)
  List<String> get allowedVendors => approvedVendors;

  LockedVoucher copyWith({
    String? id,
    double? amount,
    double? usedAmount,
    List<String>? approvedVendors,
    DateTime? expiryDate,
    bool? isUsed,
    DateTime? usedDate,
    String? usedAt,
  }) {
    return LockedVoucher(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      usedAmount: usedAmount ?? this.usedAmount,
      approvedVendors: approvedVendors ?? this.approvedVendors,
      expiryDate: expiryDate ?? this.expiryDate,
      isUsed: isUsed ?? this.isUsed,
      usedDate: usedDate ?? this.usedDate,
      usedAt: usedAt ?? this.usedAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'used_amount': usedAmount,
      'approved_vendors': approvedVendors,
      'expiry_date': expiryDate.toIso8601String(),
      'is_used': isUsed,
      'used_date': usedDate?.toIso8601String(),
      'used_at': usedAt,
    };
  }

  factory LockedVoucher.fromJson(Map<String, dynamic> json) {
    return LockedVoucher(
      id: json['id'] as String,
      amount: (json['amount'] as num).toDouble(),
      usedAmount: (json['used_amount'] as num?)?.toDouble() ?? 0.0,
      approvedVendors: (json['approved_vendors'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      expiryDate: DateTime.parse(json['expiry_date'] as String),
      isUsed: json['is_used'] as bool? ?? false,
      usedDate: json['used_date'] != null
          ? DateTime.parse(json['used_date'] as String)
          : null,
      usedAt: json['used_at'] as String?,
    );
  }
}

/// Main Rizik Dhaar loan model
@immutable
class RizikDhaarLoan {
  final String id;
  final String userId;
  final LoanType type;
  final double amount;
  final double interestRate; // Percentage
  final int termDays; // Maximum 30 days
  final LoanStatus status;
  final DateTime applicationDate;
  final DateTime? approvalDate;
  final DateTime? disbursementDate;
  final DateTime? completionDate;
  final List<RepaymentSchedule> repaymentSchedule;
  final List<LockedVoucher> vouchers;
  final double paidAmount;
  final double requiredTrustScore;
  final String? rejectionReason;
  final Map<String, dynamic>? metadata;

  const RizikDhaarLoan({
    required this.id,
    required this.userId,
    required this.type,
    required this.amount,
    required this.interestRate,
    required this.termDays,
    required this.status,
    required this.applicationDate,
    this.approvalDate,
    this.disbursementDate,
    this.completionDate,
    required this.repaymentSchedule,
    required this.vouchers,
    this.paidAmount = 0.0,
    this.requiredTrustScore = 4.0,
    this.rejectionReason,
    this.metadata,
  });

  /// Calculate total amount with interest
  double get totalAmount => amount + (amount * interestRate / 100);

  /// Calculate interest amount
  double get interestAmount => amount * interestRate / 100;

  /// Calculate remaining balance
  double get remainingBalance => totalAmount - paidAmount;

  /// Alias for paidAmount (for compatibility)
  double get repaidAmount => paidAmount;

  /// Alias for remainingBalance (for compatibility)
  double get remainingAmount => remainingBalance;

  /// Get due date (last repayment schedule date)
  DateTime get dueDate {
    if (repaymentSchedule.isEmpty) {
      return applicationDate.add(Duration(days: termDays));
    }
    return repaymentSchedule.last.dueDate;
  }

  /// Get created at date (alias for applicationDate)
  DateTime get createdAt => applicationDate;

  /// Get approved date (alias for approvalDate)
  DateTime? get approvedDate => approvalDate;

  /// Get completed date (alias for completionDate)
  DateTime? get completedDate => completionDate;

  /// Calculate repayment progress percentage
  double get repaymentProgress {
    if (totalAmount == 0) return 0.0;
    return (paidAmount / totalAmount * 100).clamp(0.0, 100.0);
  }

  /// Check if loan is overdue
  bool get isOverdue {
    if (status != LoanStatus.active && status != LoanStatus.repaying) {
      return false;
    }
    final now = DateTime.now();
    return repaymentSchedule.any((schedule) =>
        !schedule.isPaid && now.isAfter(schedule.dueDate));
  }

  /// Get next payment due
  RepaymentSchedule? get nextPaymentDue {
    try {
      return repaymentSchedule.firstWhere(
        (schedule) => !schedule.isPaid,
      );
    } catch (e) {
      return null;
    }
  }

  /// Get days until next payment
  int? get daysUntilNextPayment {
    final next = nextPaymentDue;
    if (next == null) return null;
    return next.dueDate.difference(DateTime.now()).inDays;
  }

  /// Get valid vouchers
  List<LockedVoucher> get validVouchers {
    return vouchers.where((v) => v.isValid).toList();
  }

  /// Get total voucher value
  double get totalVoucherValue {
    return vouchers.fold(0.0, (sum, v) => sum + v.amount);
  }

  RizikDhaarLoan copyWith({
    String? id,
    String? userId,
    LoanType? type,
    double? amount,
    double? interestRate,
    int? termDays,
    LoanStatus? status,
    DateTime? applicationDate,
    DateTime? approvalDate,
    DateTime? disbursementDate,
    DateTime? completionDate,
    List<RepaymentSchedule>? repaymentSchedule,
    List<LockedVoucher>? vouchers,
    double? paidAmount,
    double? requiredTrustScore,
    String? rejectionReason,
    Map<String, dynamic>? metadata,
  }) {
    return RizikDhaarLoan(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      amount: amount ?? this.amount,
      interestRate: interestRate ?? this.interestRate,
      termDays: termDays ?? this.termDays,
      status: status ?? this.status,
      applicationDate: applicationDate ?? this.applicationDate,
      approvalDate: approvalDate ?? this.approvalDate,
      disbursementDate: disbursementDate ?? this.disbursementDate,
      completionDate: completionDate ?? this.completionDate,
      repaymentSchedule: repaymentSchedule ?? this.repaymentSchedule,
      vouchers: vouchers ?? this.vouchers,
      paidAmount: paidAmount ?? this.paidAmount,
      requiredTrustScore: requiredTrustScore ?? this.requiredTrustScore,
      rejectionReason: rejectionReason ?? this.rejectionReason,
      metadata: metadata ?? this.metadata,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type.key,
      'amount': amount,
      'interest_rate': interestRate,
      'term_days': termDays,
      'status': status.key,
      'application_date': applicationDate.toIso8601String(),
      'approval_date': approvalDate?.toIso8601String(),
      'disbursement_date': disbursementDate?.toIso8601String(),
      'completion_date': completionDate?.toIso8601String(),
      'repayment_schedule':
          repaymentSchedule.map((s) => s.toJson()).toList(),
      'vouchers': vouchers.map((v) => v.toJson()).toList(),
      'paid_amount': paidAmount,
      'required_trust_score': requiredTrustScore,
      'rejection_reason': rejectionReason,
      'metadata': metadata,
    };
  }

  factory RizikDhaarLoan.fromJson(Map<String, dynamic> json) {
    return RizikDhaarLoan(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: LoanType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => LoanType.ingredient,
      ),
      amount: (json['amount'] as num).toDouble(),
      interestRate: (json['interest_rate'] as num).toDouble(),
      termDays: json['term_days'] as int,
      status: LoanStatus.values.firstWhere(
        (s) => s.key == json['status'],
        orElse: () => LoanStatus.pending,
      ),
      applicationDate: DateTime.parse(json['application_date'] as String),
      approvalDate: json['approval_date'] != null
          ? DateTime.parse(json['approval_date'] as String)
          : null,
      disbursementDate: json['disbursement_date'] != null
          ? DateTime.parse(json['disbursement_date'] as String)
          : null,
      completionDate: json['completion_date'] != null
          ? DateTime.parse(json['completion_date'] as String)
          : null,
      repaymentSchedule: (json['repayment_schedule'] as List<dynamic>)
          .map((s) => RepaymentSchedule.fromJson(s as Map<String, dynamic>))
          .toList(),
      vouchers: (json['vouchers'] as List<dynamic>)
          .map((v) => LockedVoucher.fromJson(v as Map<String, dynamic>))
          .toList(),
      paidAmount: (json['paid_amount'] as num?)?.toDouble() ?? 0.0,
      requiredTrustScore:
          (json['required_trust_score'] as num?)?.toDouble() ?? 4.0,
      rejectionReason: json['rejection_reason'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }

  /// Create a new loan application
  factory RizikDhaarLoan.createApplication({
    required String userId,
    required LoanType type,
    required double amount,
    required int termDays,
    double interestRate = 5.0, // 5% default
  }) {
    final now = DateTime.now();
    return RizikDhaarLoan(
      id: 'loan_${now.millisecondsSinceEpoch}',
      userId: userId,
      type: type,
      amount: amount,
      interestRate: interestRate,
      termDays: termDays,
      status: LoanStatus.pending,
      applicationDate: now,
      repaymentSchedule: [],
      vouchers: [],
      paidAmount: 0.0,
      requiredTrustScore: 4.0,
    );
  }
}
