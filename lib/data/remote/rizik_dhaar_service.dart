import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/rizik_dhaar_loan.dart';
import 'package:rizik_v4/data/models/trust_score.dart';

/// Service for managing Rizik Dhaar micro-lending operations
class RizikDhaarService {
  /// Check if user is eligible for a loan
  static LoanEligibilityResult checkEligibility({
    required TrustScore trustScore,
    required double requestedAmount,
    required List<RizikDhaarLoan> existingLoans,
  }) {
    // Check trust score requirement
    if (trustScore.overall < 4.0) {
      return LoanEligibilityResult(
        eligible: false,
        reason: 'Trust score must be 4.0 or higher',
        reasonBn: 'ট্রাস্ট স্কোর ৪.০ বা তার বেশি হতে হবে',
        requiredTrustScore: 4.0,
        currentTrustScore: trustScore.overall,
      );
    }

    // Check for active loans
    final activeLoans = existingLoans.where((loan) =>
        loan.status == LoanStatus.active ||
        loan.status == LoanStatus.repaying).toList();

    if (activeLoans.isNotEmpty) {
      return LoanEligibilityResult(
        eligible: false,
        reason: 'You have an active loan. Please repay it first.',
        reasonBn: 'আপনার একটি সক্রিয় ঋণ আছে। প্রথমে তা পরিশোধ করুন।',
      );
    }

    // Check for defaulted loans
    final defaultedLoans = existingLoans.where((loan) =>
        loan.status == LoanStatus.defaulted).toList();

    if (defaultedLoans.isNotEmpty) {
      return LoanEligibilityResult(
        eligible: false,
        reason: 'You have defaulted loans. Please contact support.',
        reasonBn: 'আপনার খেলাপি ঋণ আছে। সাপোর্টের সাথে যোগাযোগ করুন।',
      );
    }

    // Check maximum loan amount based on trust score
    final maxAmount = getMaxLoanAmount(trustScore);
    if (requestedAmount > maxAmount) {
      return LoanEligibilityResult(
        eligible: false,
        reason: 'Maximum loan amount for your trust score is ৳${maxAmount.toStringAsFixed(0)}',
        reasonBn: 'আপনার ট্রাস্ট স্কোরের জন্য সর্বোচ্চ ঋণ ৳${maxAmount.toStringAsFixed(0)}',
        maxAmount: maxAmount,
      );
    }

    return LoanEligibilityResult(
      eligible: true,
      maxAmount: maxAmount,
    );
  }

  /// Get maximum loan amount based on trust score
  static double getMaxLoanAmount(TrustScore trustScore) {
    if (trustScore.overall >= 4.8) return 50000.0;
    if (trustScore.overall >= 4.5) return 30000.0;
    if (trustScore.overall >= 4.2) return 15000.0;
    if (trustScore.overall >= 4.0) return 5000.0;
    return 0.0;
  }

  /// Calculate interest rate based on trust score and loan amount
  static double calculateInterestRate({
    required TrustScore trustScore,
    required double amount,
    required int termDays,
  }) {
    // Base rate: 5%
    double rate = 5.0;

    // Discount for high trust score
    if (trustScore.overall >= 4.8) {
      rate -= 2.0; // 3%
    } else if (trustScore.overall >= 4.5) {
      rate -= 1.5; // 3.5%
    } else if (trustScore.overall >= 4.2) {
      rate -= 1.0; // 4%
    }

    // Adjust for term length
    if (termDays > 20) {
      rate += 1.0;
    } else if (termDays > 15) {
      rate += 0.5;
    }

    return rate.clamp(2.0, 8.0); // Min 2%, Max 8%
  }

  /// Generate repayment schedule
  static List<RepaymentSchedule> generateRepaymentSchedule({
    required double totalAmount,
    required int termDays,
    required DateTime startDate,
  }) {
    final schedule = <RepaymentSchedule>[];

    // Daily repayment (20% of daily earnings)
    // For simplicity, we'll create weekly milestones
    final weeksCount = (termDays / 7).ceil();
    final amountPerWeek = totalAmount / weeksCount;

    for (int i = 0; i < weeksCount; i++) {
      final dueDate = startDate.add(Duration(days: (i + 1) * 7));
      schedule.add(RepaymentSchedule(
        dueDate: dueDate,
        amount: i == weeksCount - 1
            ? totalAmount - (amountPerWeek * (weeksCount - 1)) // Last payment
            : amountPerWeek,
      ));
    }

    return schedule;
  }

  /// Generate locked vouchers for approved vendors
  static List<LockedVoucher> generateVouchers({
    required double amount,
    required List<String> approvedVendors,
    required int validityDays,
  }) {
    final now = DateTime.now();
    final expiryDate = now.add(Duration(days: validityDays));

    // Split amount into multiple vouchers for flexibility
    final voucherCount = (amount / 1000).ceil().clamp(1, 5);
    final amountPerVoucher = amount / voucherCount;

    return List.generate(voucherCount, (index) {
      return LockedVoucher(
        id: 'voucher_${now.millisecondsSinceEpoch}_$index',
        amount: index == voucherCount - 1
            ? amount - (amountPerVoucher * (voucherCount - 1))
            : amountPerVoucher,
        approvedVendors: approvedVendors,
        expiryDate: expiryDate,
      );
    });
  }

  /// Process loan application
  static RizikDhaarLoan processApplication({
    required RizikDhaarLoan application,
    required TrustScore trustScore,
    required bool approved,
    String? rejectionReason,
    List<String>? approvedVendors,
  }) {
    if (!approved) {
      return application.copyWith(
        status: LoanStatus.rejected,
        rejectionReason: rejectionReason ?? 'Application rejected',
      );
    }

    final now = DateTime.now();
    final interestRate = calculateInterestRate(
      trustScore: trustScore,
      amount: application.amount,
      termDays: application.termDays,
    );

    final totalAmount = application.amount + (application.amount * interestRate / 100);

    final schedule = generateRepaymentSchedule(
      totalAmount: totalAmount,
      termDays: application.termDays,
      startDate: now,
    );

    final vouchers = generateVouchers(
      amount: application.amount,
      approvedVendors: approvedVendors ?? ['vendor_001', 'vendor_002'],
      validityDays: application.termDays,
    );

    return application.copyWith(
      status: LoanStatus.approved,
      approvalDate: now,
      disbursementDate: now,
      interestRate: interestRate,
      repaymentSchedule: schedule,
      vouchers: vouchers,
    );
  }

  /// Process repayment
  static RizikDhaarLoan processRepayment({
    required RizikDhaarLoan loan,
    required double amount,
  }) {
    final newPaidAmount = loan.paidAmount + amount;
    final updatedSchedule = <RepaymentSchedule>[];
    var remainingPayment = amount;

    // Apply payment to schedule
    for (final schedule in loan.repaymentSchedule) {
      if (schedule.isPaid) {
        updatedSchedule.add(schedule);
        continue;
      }

      if (remainingPayment >= schedule.amount) {
        // Fully pay this schedule
        updatedSchedule.add(schedule.copyWith(
          isPaid: true,
          paidDate: DateTime.now(),
          paidAmount: schedule.amount,
        ));
        remainingPayment -= schedule.amount;
      } else if (remainingPayment > 0) {
        // Partial payment
        updatedSchedule.add(schedule.copyWith(
          paidAmount: (schedule.paidAmount ?? 0) + remainingPayment,
        ));
        remainingPayment = 0;
      } else {
        updatedSchedule.add(schedule);
      }
    }

    // Check if loan is fully repaid
    final isFullyRepaid = newPaidAmount >= loan.totalAmount;

    return loan.copyWith(
      paidAmount: newPaidAmount,
      repaymentSchedule: updatedSchedule,
      status: isFullyRepaid ? LoanStatus.completed : LoanStatus.repaying,
      completionDate: isFullyRepaid ? DateTime.now() : null,
    );
  }

  /// Auto-deduct from earnings (20% of daily earnings)
  static double calculateAutoDeduction(double earnings) {
    return earnings * 0.20; // 20% of earnings
  }

  /// Check if loan is overdue and should be marked as defaulted
  static bool shouldMarkAsDefaulted(RizikDhaarLoan loan) {
    if (loan.status != LoanStatus.active && loan.status != LoanStatus.repaying) {
      return false;
    }

    final now = DateTime.now();
    final overdueSchedules = loan.repaymentSchedule.where((schedule) =>
        !schedule.isPaid && now.difference(schedule.dueDate).inDays > 7);

    return overdueSchedules.isNotEmpty;
  }

  /// Verify vendor for voucher redemption
  static VoucherVerificationResult verifyVendor({
    required LockedVoucher voucher,
    required String vendorId,
  }) {
    // Check if voucher is expired
    if (DateTime.now().isAfter(voucher.expiryDate)) {
      return VoucherVerificationResult(
        verified: false,
        reason: 'Voucher has expired',
        reasonBn: 'ভাউচারের মেয়াদ শেষ হয়েছে',
      );
    }

    // Check if voucher has remaining balance
    if (voucher.remainingAmount <= 0) {
      return VoucherVerificationResult(
        verified: false,
        reason: 'Voucher has no remaining balance',
        reasonBn: 'ভাউচারে কোন টাকা নেই',
      );
    }

    // Check if vendor is approved
    if (!voucher.approvedVendors.contains(vendorId)) {
      return VoucherVerificationResult(
        verified: false,
        reason: 'Vendor not approved for this voucher',
        reasonBn: 'এই ভাউচারের জন্য বিক্রেতা অনুমোদিত নয়',
      );
    }

    return VoucherVerificationResult(
      verified: true,
      remainingAmount: voucher.remainingAmount,
    );
  }

  /// Redeem voucher (full or partial)
  static VoucherRedemptionResult redeemVoucher({
    required LockedVoucher voucher,
    required String vendorId,
    required double amount,
  }) {
    // Verify vendor first
    final verification = verifyVendor(voucher: voucher, vendorId: vendorId);
    if (!verification.verified) {
      return VoucherRedemptionResult(
        success: false,
        reason: verification.reason,
        reasonBn: verification.reasonBn,
      );
    }

    // Check if amount is valid
    if (amount <= 0) {
      return VoucherRedemptionResult(
        success: false,
        reason: 'Invalid redemption amount',
        reasonBn: 'অবৈধ পরিমাণ',
      );
    }

    if (amount > voucher.remainingAmount) {
      return VoucherRedemptionResult(
        success: false,
        reason: 'Amount exceeds voucher balance',
        reasonBn: 'পরিমাণ ভাউচার ব্যালেন্সের চেয়ে বেশি',
      );
    }

    // Create updated voucher
    final updatedVoucher = voucher.copyWith(
      usedAmount: voucher.usedAmount + amount,
    );

    return VoucherRedemptionResult(
      success: true,
      updatedVoucher: updatedVoucher,
      redeemedAmount: amount,
      remainingAmount: updatedVoucher.remainingAmount,
    );
  }

  /// Check for expired vouchers
  static List<LockedVoucher> getExpiredVouchers(List<LockedVoucher> vouchers) {
    final now = DateTime.now();
    return vouchers.where((v) => now.isAfter(v.expiryDate) && v.remainingAmount > 0).toList();
  }

  /// Check for expiring soon vouchers (within 7 days)
  static List<LockedVoucher> getExpiringSoonVouchers(List<LockedVoucher> vouchers) {
    final now = DateTime.now();
    final sevenDaysLater = now.add(const Duration(days: 7));
    return vouchers.where((v) =>
        v.expiryDate.isAfter(now) &&
        v.expiryDate.isBefore(sevenDaysLater) &&
        v.remainingAmount > 0).toList();
  }

  /// Get loan summary statistics
  static LoanSummary getLoanSummary(List<RizikDhaarLoan> loans) {
    final totalBorrowed = loans.fold(0.0, (sum, loan) => sum + loan.amount);
    final totalRepaid = loans.fold(0.0, (sum, loan) => sum + loan.paidAmount);
    final activeLoans = loans.where((loan) =>
        loan.status == LoanStatus.active ||
        loan.status == LoanStatus.repaying).length;
    final completedLoans = loans.where((loan) =>
        loan.status == LoanStatus.completed).length;
    final defaultedLoans = loans.where((loan) =>
        loan.status == LoanStatus.defaulted).length;

    return LoanSummary(
      totalBorrowed: totalBorrowed,
      totalRepaid: totalRepaid,
      activeLoans: activeLoans,
      completedLoans: completedLoans,
      defaultedLoans: defaultedLoans,
      repaymentRate: totalBorrowed > 0 ? (totalRepaid / totalBorrowed * 100) : 0,
    );
  }
}

/// Loan eligibility check result
class LoanEligibilityResult {
  final bool eligible;
  final String? reason;
  final String? reasonBn;
  final double? requiredTrustScore;
  final double? currentTrustScore;
  final double? maxAmount;

  LoanEligibilityResult({
    required this.eligible,
    this.reason,
    this.reasonBn,
    this.requiredTrustScore,
    this.currentTrustScore,
    this.maxAmount,
  });

  String getMessage(bool bengali) {
    if (eligible) return '';
    return bengali ? (reasonBn ?? reason ?? '') : (reason ?? '');
  }
}

/// Loan summary statistics
class LoanSummary {
  final double totalBorrowed;
  final double totalRepaid;
  final int activeLoans;
  final int completedLoans;
  final int defaultedLoans;
  final double repaymentRate;

  LoanSummary({
    required this.totalBorrowed,
    required this.totalRepaid,
    required this.activeLoans,
    required this.completedLoans,
    required this.defaultedLoans,
    required this.repaymentRate,
  });

  double get outstandingBalance => totalBorrowed - totalRepaid;
}

/// Voucher verification result
class VoucherVerificationResult {
  final bool verified;
  final String? reason;
  final String? reasonBn;
  final double? remainingAmount;

  VoucherVerificationResult({
    required this.verified,
    this.reason,
    this.reasonBn,
    this.remainingAmount,
  });
}

/// Voucher redemption result
class VoucherRedemptionResult {
  final bool success;
  final String? reason;
  final String? reasonBn;
  final LockedVoucher? updatedVoucher;
  final double? redeemedAmount;
  final double? remainingAmount;

  VoucherRedemptionResult({
    required this.success,
    this.reason,
    this.reasonBn,
    this.updatedVoucher,
    this.redeemedAmount,
    this.remainingAmount,
  });
}
