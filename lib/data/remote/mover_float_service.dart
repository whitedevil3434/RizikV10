import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/mover_float.dart';
import 'package:rizik_v4/data/models/trust_score.dart';

/// Service for managing mover float operations
class MoverFloatService {
  /// Calculate daily limit based on trust score
  static double calculateDailyLimit(double trustScore) {
    if (trustScore >= 4.8) return 500.0;
    if (trustScore >= 4.5) return 300.0;
    if (trustScore >= 4.2) return 200.0;
    if (trustScore >= 4.0) return 150.0;
    return 100.0;
  }

  /// Check if mover can request float
  static FloatRequestResult canRequestFloat({
    required MoverFloat currentFloat,
    required TrustScore trustScore,
  }) {
    // Check if suspended
    if (currentFloat.status == FloatStatus.suspended) {
      return FloatRequestResult(
        canRequest: false,
        reason: 'Float is suspended due to overdue balance',
        reasonBn: 'বকেয়া থাকার কারণে ফ্লোট স্থগিত',
      );
    }

    // Check if already has active float
    if (!currentFloat.isFullyRepaid) {
      return FloatRequestResult(
        canRequest: false,
        reason: 'Please repay current float first',
        reasonBn: 'প্রথমে বর্তমান ফ্লোট পরিশোধ করুন',
        remainingBalance: currentFloat.remainingBalance,
      );
    }

    // Check trust score
    if (trustScore.overall < 4.0) {
      return FloatRequestResult(
        canRequest: false,
        reason: 'Trust score must be 4.0 or higher',
        reasonBn: 'ট্রাস্ট স্কোর ৪.০ বা তার বেশি হতে হবে',
      );
    }

    return FloatRequestResult(
      canRequest: true,
      availableAmount: currentFloat.dailyLimit,
    );
  }

  /// Process float request (morning deposit)
  static MoverFloat processFloatRequest({
    required MoverFloat currentFloat,
  }) {
    final now = DateTime.now();

    
    // Create deposit transaction
    final transaction = FloatTransaction(
      id: 'txn_${now.millisecondsSinceEpoch}',
      type: FloatTransactionType.deposit,
      amount: currentFloat.dailyLimit,
      timestamp: now,
      note: 'Daily float deposit',
    );

    final updatedTransactions = [...currentFloat.transactions, transaction];

    return currentFloat.copyWith(
      currentFloat: currentFloat.dailyLimit,
      repaidToday: 0.0,
      status: FloatStatus.active,
      lastDepositDate: now,
      transactions: updatedTransactions,
      autoRepayment: AutoRepayment(
        remainingBalance: currentFloat.dailyLimit,
      ),
    );
  }

  /// Process mission completion and auto-deduct 10%
  static FloatDeductionResult processMissionCompletion({
    required MoverFloat currentFloat,
    required double missionEarnings,
    required String missionId,
  }) {
    if (currentFloat.remainingBalance <= 0) {
      return FloatDeductionResult(
        success: true,
        deductedAmount: 0,
        remainingEarnings: missionEarnings,
        updatedFloat: currentFloat,
      );
    }

    // Calculate 10% deduction
    final deductionAmount = (missionEarnings * 0.10).clamp(
      0.0,
      currentFloat.remainingBalance,
    );

    if (deductionAmount <= 0) {
      return FloatDeductionResult(
        success: true,
        deductedAmount: 0,
        remainingEarnings: missionEarnings,
        updatedFloat: currentFloat,
      );
    }

    final now = DateTime.now();

    // Create deduction transaction
    final transaction = FloatTransaction(
      id: 'txn_${now.millisecondsSinceEpoch}',
      type: FloatTransactionType.deduction,
      amount: deductionAmount.toDouble(),
      timestamp: now,
      missionId: missionId,
      note: 'Auto-deduction from mission earnings',
    );

    final updatedTransactions = [...currentFloat.transactions, transaction];
    final newRepaidToday = currentFloat.repaidToday + deductionAmount;
    final newRemainingBalance = currentFloat.remainingBalance - deductionAmount;

    // Check if fully repaid
    final isFullyRepaid = newRemainingBalance <= 0;

    return FloatDeductionResult(
      success: true,
      deductedAmount: deductionAmount.toDouble(),
      remainingEarnings: missionEarnings - deductionAmount.toDouble(),
      updatedFloat: currentFloat.copyWith(
        repaidToday: newRepaidToday,
        status: isFullyRepaid ? FloatStatus.completed : FloatStatus.repaying,
        transactions: updatedTransactions,
        autoRepayment: currentFloat.autoRepayment.copyWith(
          remainingBalance: newRemainingBalance,
          lastDeductionDate: now,
          totalDeductions: currentFloat.autoRepayment.totalDeductions + 1,
        ),
      ),
      isFullyRepaid: isFullyRepaid,
    );
  }

  /// Reset float at midnight if fully repaid
  static MoverFloat? resetFloatIfNeeded(MoverFloat currentFloat) {
    if (!currentFloat.needsReset) {
      return null;
    }

    // Only reset if fully repaid
    if (!currentFloat.isFullyRepaid) {
      // Mark as overdue if not repaid by midnight
      return currentFloat.copyWith(
        status: FloatStatus.suspended,
      );
    }

    final now = DateTime.now();

    // Create reset transaction
    final transaction = FloatTransaction(
      id: 'txn_${now.millisecondsSinceEpoch}',
      type: FloatTransactionType.reset,
      amount: 0,
      timestamp: now,
      note: 'Daily reset - float cleared',
    );

    final updatedTransactions = [...currentFloat.transactions, transaction];

    return currentFloat.copyWith(
      currentFloat: 0.0,
      repaidToday: 0.0,
      status: FloatStatus.available,
      lastResetDate: now,
      transactions: updatedTransactions,
      autoRepayment: AutoRepayment(
        remainingBalance: 0.0,
      ),
    );
  }

  /// Check for overdue float and suspend if needed
  static MoverFloat checkOverdueFloat(MoverFloat currentFloat) {
    if (currentFloat.status == FloatStatus.suspended) {
      return currentFloat;
    }

    // Check if float is overdue (not repaid by midnight)
    if (currentFloat.needsReset && !currentFloat.isFullyRepaid) {
      return currentFloat.copyWith(
        status: FloatStatus.suspended,
      );
    }

    return currentFloat;
  }

  /// Calculate repayment preview for mission
  static RepaymentPreview calculateRepaymentPreview({
    required MoverFloat currentFloat,
    required double missionEarnings,
  }) {
    if (currentFloat.remainingBalance <= 0) {
      return RepaymentPreview(
        deductionAmount: 0,
        remainingEarnings: missionEarnings,
        remainingBalance: 0,
      );
    }

    final deductionAmount = (missionEarnings * 0.10).clamp(
      0.0,
      currentFloat.remainingBalance,
    );

    return RepaymentPreview(
      deductionAmount: deductionAmount.toDouble(),
      remainingEarnings: missionEarnings - deductionAmount.toDouble(),
      remainingBalance: currentFloat.remainingBalance - deductionAmount.toDouble(),
    );
  }

  /// Get float statistics
  static FloatStatistics getStatistics(MoverFloat currentFloat) {
    final totalDeposited = currentFloat.transactions
        .where((t) => t.type == FloatTransactionType.deposit)
        .fold(0.0, (sum, t) => sum + t.amount);

    final totalRepaid = currentFloat.transactions
        .where((t) => t.type == FloatTransactionType.deduction)
        .fold(0.0, (sum, t) => sum + t.amount);

    final averageRepaymentPerMission = currentFloat.autoRepayment.totalDeductions > 0
        ? totalRepaid / currentFloat.autoRepayment.totalDeductions
        : 0.0;

    return FloatStatistics(
      totalDeposited: totalDeposited,
      totalRepaid: totalRepaid,
      currentBalance: currentFloat.remainingBalance,
      repaymentRate: totalDeposited > 0 ? (totalRepaid / totalDeposited * 100) : 0,
      totalMissions: currentFloat.autoRepayment.totalDeductions,
      averageRepaymentPerMission: averageRepaymentPerMission,
    );
  }
}

/// Float request validation result
class FloatRequestResult {
  final bool canRequest;
  final String? reason;
  final String? reasonBn;
  final double? availableAmount;
  final double? remainingBalance;

  FloatRequestResult({
    required this.canRequest,
    this.reason,
    this.reasonBn,
    this.availableAmount,
    this.remainingBalance,
  });

  String getMessage(bool bengali) {
    if (canRequest) return '';
    return bengali ? (reasonBn ?? reason ?? '') : (reason ?? '');
  }
}

/// Float deduction result
class FloatDeductionResult {
  final bool success;
  final double deductedAmount;
  final double remainingEarnings;
  final MoverFloat updatedFloat;
  final bool isFullyRepaid;
  final String? error;

  FloatDeductionResult({
    required this.success,
    required this.deductedAmount,
    required this.remainingEarnings,
    required this.updatedFloat,
    this.isFullyRepaid = false,
    this.error,
  });
}

/// Repayment preview for mission
class RepaymentPreview {
  final double deductionAmount;
  final double remainingEarnings;
  final double remainingBalance;

  RepaymentPreview({
    required this.deductionAmount,
    required this.remainingEarnings,
    required this.remainingBalance,
  });
}

/// Float statistics
class FloatStatistics {
  final double totalDeposited;
  final double totalRepaid;
  final double currentBalance;
  final double repaymentRate;
  final int totalMissions;
  final double averageRepaymentPerMission;

  FloatStatistics({
    required this.totalDeposited,
    required this.totalRepaid,
    required this.currentBalance,
    required this.repaymentRate,
    required this.totalMissions,
    required this.averageRepaymentPerMission,
  });
}
