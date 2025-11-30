import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/rizik_dhaar_loan.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/remote/rizik_dhaar_service.dart';

/// Service for handling automatic loan repayments
class AutoRepaymentService {
  /// Process daily earnings and auto-deduct for loan repayment
  static Future<RepaymentResult> processEarnings({
    required String userId,
    required double earnings,
    required List<RizikDhaarLoan> activeLoans,
  }) async {
    if (activeLoans.isEmpty) {
      return RepaymentResult(
        success: true,
        deductedAmount: 0,
        remainingEarnings: earnings,
      );
    }

    // Calculate 20% deduction
    final deductionAmount = RizikDhaarService.calculateAutoDeduction(earnings);
    
    if (deductionAmount <= 0) {
      return RepaymentResult(
        success: true,
        deductedAmount: 0,
        remainingEarnings: earnings,
      );
    }

    // Apply deduction to active loans (oldest first)
    final sortedLoans = List<RizikDhaarLoan>.from(activeLoans)
      ..sort((a, b) => a.createdAt.compareTo(b.createdAt));

    var remainingDeduction = deductionAmount;
    final updatedLoans = <RizikDhaarLoan>[];

    for (final loan in sortedLoans) {
      if (remainingDeduction <= 0) {
        updatedLoans.add(loan);
        continue;
      }

      final amountToDeduct = remainingDeduction.clamp(0.0, loan.remainingAmount);
      final updatedLoan = RizikDhaarService.processRepayment(
        loan: loan,
        amount: amountToDeduct.toDouble(),
      );

      updatedLoans.add(updatedLoan);
      remainingDeduction -= amountToDeduct;
    }

    return RepaymentResult(
      success: true,
      deductedAmount: deductionAmount - remainingDeduction,
      remainingEarnings: earnings - (deductionAmount - remainingDeduction),
      updatedLoans: updatedLoans,
    );
  }

  /// Process early repayment with bonus
  static EarlyRepaymentResult processEarlyRepayment({
    required RizikDhaarLoan loan,
    required double amount,
  }) {
    final daysRemaining = loan.dueDate.difference(DateTime.now()).inDays;
    
    // Calculate bonus (1% per week early)
    final weeksEarly = (daysRemaining / 7).floor();
    final bonusPercentage = (weeksEarly * 1.0).clamp(0, 5); // Max 5% bonus
    final bonusAmount = loan.remainingAmount * bonusPercentage / 100;
    
    // Apply bonus discount
    final effectiveAmount = amount + bonusAmount;
    final updatedLoan = RizikDhaarService.processRepayment(
      loan: loan,
      amount: effectiveAmount,
    );

    return EarlyRepaymentResult(
      success: true,
      updatedLoan: updatedLoan,
      bonusPercentage: bonusPercentage.toDouble(),
      bonusAmount: bonusAmount,
      effectiveAmount: effectiveAmount,
    );
  }

  /// Check and handle overdue loans
  static Future<OverdueHandlingResult> handleOverdueLoans({
    required List<RizikDhaarLoan> loans,
    required TrustScore currentTrustScore,
  }) async {
    final overdueLoans = <RizikDhaarLoan>[];
    final updatedLoans = <RizikDhaarLoan>[];
    var trustScorePenalty = 0.0;

    for (final loan in loans) {
      if (RizikDhaarService.shouldMarkAsDefaulted(loan)) {
        // Mark as overdue/defaulted
        final daysOverdue = DateTime.now().difference(loan.dueDate).inDays;
        
        final updatedLoan = loan.copyWith(
          status: daysOverdue > 30 ? LoanStatus.defaulted : LoanStatus.overdue,
        );
        
        overdueLoans.add(updatedLoan);
        updatedLoans.add(updatedLoan);
        
        // Calculate trust score penalty (0.1 per week overdue, max 1.0)
        final weeksOverdue = (daysOverdue / 7).ceil();
        trustScorePenalty += (weeksOverdue * 0.1).clamp(0, 1.0);
      } else {
        updatedLoans.add(loan);
      }
    }

    return OverdueHandlingResult(
      overdueLoans: overdueLoans,
      updatedLoans: updatedLoans,
      trustScorePenalty: trustScorePenalty.clamp(0, 2.0), // Max 2.0 penalty
    );
  }

  /// Calculate repayment progress
  static RepaymentProgress calculateProgress(RizikDhaarLoan loan) {
    final totalDays = loan.dueDate.difference(loan.approvedDate ?? loan.createdAt).inDays;
    final elapsedDays = DateTime.now().difference(loan.approvedDate ?? loan.createdAt).inDays;
    final remainingDays = loan.dueDate.difference(DateTime.now()).inDays;
    
    final repaymentPercentage = loan.totalAmount > 0
        ? (loan.repaidAmount / loan.totalAmount * 100)
        : 0.0;
    
    final timePercentage = totalDays > 0
        ? (elapsedDays / totalDays * 100)
        : 0.0;
    
    // Check if on track (repayment % should be >= time %)
    final isOnTrack = repaymentPercentage >= timePercentage;
    
    return RepaymentProgress(
      repaymentPercentage: repaymentPercentage,
      timePercentage: timePercentage,
      isOnTrack: isOnTrack,
      remainingDays: remainingDays,
      remainingAmount: loan.remainingAmount,
    );
  }
}

/// Result of earnings processing
class RepaymentResult {
  final bool success;
  final double deductedAmount;
  final double remainingEarnings;
  final List<RizikDhaarLoan>? updatedLoans;
  final String? error;

  RepaymentResult({
    required this.success,
    required this.deductedAmount,
    required this.remainingEarnings,
    this.updatedLoans,
    this.error,
  });
}

/// Result of early repayment
class EarlyRepaymentResult {
  final bool success;
  final RizikDhaarLoan? updatedLoan;
  final double bonusPercentage;
  final double bonusAmount;
  final double effectiveAmount;
  final String? error;

  EarlyRepaymentResult({
    required this.success,
    this.updatedLoan,
    required this.bonusPercentage,
    required this.bonusAmount,
    required this.effectiveAmount,
    this.error,
  });
}

/// Result of overdue handling
class OverdueHandlingResult {
  final List<RizikDhaarLoan> overdueLoans;
  final List<RizikDhaarLoan> updatedLoans;
  final double trustScorePenalty;

  OverdueHandlingResult({
    required this.overdueLoans,
    required this.updatedLoans,
    required this.trustScorePenalty,
  });
}

/// Repayment progress tracking
class RepaymentProgress {
  final double repaymentPercentage;
  final double timePercentage;
  final bool isOnTrack;
  final int remainingDays;
  final double remainingAmount;

  RepaymentProgress({
    required this.repaymentPercentage,
    required this.timePercentage,
    required this.isOnTrack,
    required this.remainingDays,
    required this.remainingAmount,
  });
}
