import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/rizik_dhaar_loan.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/remote/rizik_dhaar_service.dart';
import 'package:rizik_v4/data/remote/auto_repayment_service.dart';

/// Provider for managing Rizik Dhaar loans
class RizikDhaarProvider with ChangeNotifier {
  List<RizikDhaarLoan> _loans = [];
  bool _isLoading = false;
  String? _error;

  List<RizikDhaarLoan> get loans => _loans;
  bool get isLoading => _isLoading;
  String? get error => _error;

  RizikDhaarProvider() {
    _loadLoans();
  }

  /// Load loans from storage
  Future<void> _loadLoans() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final loansJson = prefs.getString('rizik_dhaar_loans');

      if (loansJson != null) {
        final List<dynamic> loansList = jsonDecode(loansJson);
        _loans = loansList
            .map((json) => RizikDhaarLoan.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load loans: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save loans to storage
  Future<void> _saveLoans() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final loansJson = jsonEncode(_loans.map((loan) => loan.toJson()).toList());
      await prefs.setString('rizik_dhaar_loans', loansJson);
    } catch (e) {
      debugPrint('Error saving loans: $e');
    }
  }

  /// Get loan by ID
  RizikDhaarLoan? getLoanById(String id) {
    try {
      return _loans.firstWhere((loan) => loan.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Get active loans
  List<RizikDhaarLoan> get activeLoans {
    return _loans
        .where((loan) =>
            loan.status == LoanStatus.active ||
            loan.status == LoanStatus.repaying)
        .toList();
  }

  /// Get completed loans
  List<RizikDhaarLoan> get completedLoans {
    return _loans.where((loan) => loan.status == LoanStatus.completed).toList();
  }

  /// Get pending loans
  List<RizikDhaarLoan> get pendingLoans {
    return _loans.where((loan) => loan.status == LoanStatus.pending).toList();
  }

  /// Check eligibility for a loan
  LoanEligibilityResult checkEligibility({
    required TrustScore trustScore,
    required double amount,
  }) {
    return RizikDhaarService.checkEligibility(
      trustScore: trustScore,
      requestedAmount: amount,
      existingLoans: _loans,
    );
  }

  /// Get maximum loan amount for user
  double getMaxLoanAmount(TrustScore trustScore) {
    return RizikDhaarService.getMaxLoanAmount(trustScore);
  }

  /// Submit loan application
  Future<RizikDhaarLoan> submitApplication({
    required String userId,
    required LoanType type,
    required double amount,
    required int termDays,
    required TrustScore trustScore,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      // Check eligibility
      final eligibility = checkEligibility(
        trustScore: trustScore,
        amount: amount,
      );

      if (!eligibility.eligible) {
        throw Exception(eligibility.reason ?? 'Not eligible for loan');
      }

      // Calculate interest rate
      final interestRate = RizikDhaarService.calculateInterestRate(
        trustScore: trustScore,
        amount: amount,
        termDays: termDays,
      );

      // Create application
      final application = RizikDhaarLoan.createApplication(
        userId: userId,
        type: type,
        amount: amount,
        termDays: termDays,
        interestRate: interestRate,
      );

      _loans.add(application);
      await _saveLoans();
      notifyListeners();

      _error = null;
      return application;
    } catch (e) {
      _error = 'Failed to submit application: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Approve loan (admin function)
  Future<void> approveLoan({
    required String loanId,
    required TrustScore trustScore,
    List<String>? approvedVendors,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final loanIndex = _loans.indexWhere((loan) => loan.id == loanId);
      if (loanIndex == -1) {
        throw Exception('Loan not found');
      }

      final loan = _loans[loanIndex];

      // Process approval
      final approvedLoan = RizikDhaarService.processApplication(
        application: loan,
        trustScore: trustScore,
        approved: true,
        approvedVendors: approvedVendors,
      );

      _loans[loanIndex] = approvedLoan;
      await _saveLoans();
      notifyListeners();

      _error = null;
    } catch (e) {
      _error = 'Failed to approve loan: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Reject loan (admin function)
  Future<void> rejectLoan({
    required String loanId,
    required String reason,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final loanIndex = _loans.indexWhere((loan) => loan.id == loanId);
      if (loanIndex == -1) {
        throw Exception('Loan not found');
      }

      final loan = _loans[loanIndex];

      _loans[loanIndex] = loan.copyWith(
        status: LoanStatus.rejected,
        rejectionReason: reason,
      );

      await _saveLoans();
      notifyListeners();

      _error = null;
    } catch (e) {
      _error = 'Failed to reject loan: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Make repayment
  Future<void> makeRepayment({
    required String loanId,
    required double amount,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final loanIndex = _loans.indexWhere((loan) => loan.id == loanId);
      if (loanIndex == -1) {
        throw Exception('Loan not found');
      }

      final loan = _loans[loanIndex];

      // Process repayment
      final updatedLoan = RizikDhaarService.processRepayment(
        loan: loan,
        amount: amount,
      );

      _loans[loanIndex] = updatedLoan;
      await _saveLoans();
      notifyListeners();

      _error = null;
    } catch (e) {
      _error = 'Failed to process repayment: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Auto-deduct from earnings
  Future<void> autoDeductFromEarnings({
    required String loanId,
    required double earnings,
  }) async {
    final deduction = RizikDhaarService.calculateAutoDeduction(earnings);

    if (deduction > 0) {
      await makeRepayment(loanId: loanId, amount: deduction);
    }
  }

  /// Redeem voucher (full or partial)
  Future<void> redeemVoucher({
    required String loanId,
    required String voucherId,
    required String vendorId,
    required double amount,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final loanIndex = _loans.indexWhere((loan) => loan.id == loanId);
      if (loanIndex == -1) {
        throw Exception('Loan not found');
      }

      final loan = _loans[loanIndex];
      final voucherIndex = loan.vouchers.indexWhere((v) => v.id == voucherId);

      if (voucherIndex == -1) {
        throw Exception('Voucher not found');
      }

      final voucher = loan.vouchers[voucherIndex];

      // Redeem voucher
      final redemptionResult = RizikDhaarService.redeemVoucher(
        voucher: voucher,
        vendorId: vendorId,
        amount: amount,
      );

      if (!redemptionResult.success) {
        throw Exception(redemptionResult.reason ?? 'Redemption failed');
      }

      // Update voucher
      final updatedVouchers = List<LockedVoucher>.from(loan.vouchers);
      updatedVouchers[voucherIndex] = redemptionResult.updatedVoucher!;

      _loans[loanIndex] = loan.copyWith(vouchers: updatedVouchers);
      await _saveLoans();
      notifyListeners();

      _error = null;
    } catch (e) {
      _error = 'Failed to redeem voucher: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Get active vouchers across all loans
  List<LockedVoucher> get activeVouchers {
    final vouchers = <LockedVoucher>[];
    for (final loan in activeLoans) {
      vouchers.addAll(loan.vouchers.where((v) => v.remainingAmount > 0));
    }
    return vouchers;
  }

  /// Get all loans (for history)
  List<RizikDhaarLoan> get allLoans => _loans;

  /// Load loans for a specific user
  Future<void> loadLoans(String userId) async {
    await _loadLoans();
  }

  /// Get total borrowed amount
  double get totalBorrowed {
    return _loans.fold(0.0, (sum, loan) => sum + loan.amount);
  }

  /// Get total repaid amount
  double get totalRepaid {
    return _loans.fold(0.0, (sum, loan) => sum + loan.repaidAmount);
  }

  /// Get total outstanding amount
  double get totalOutstanding {
    return activeLoans.fold(0.0, (sum, loan) => sum + loan.remainingAmount);
  }

  /// Get on-time repayment rate
  double get onTimeRepaymentRate {
    final completed = completedLoans;
    if (completed.isEmpty) return 100.0;

    final onTime = completed.where((loan) {
      return loan.completedDate != null &&
          loan.completedDate!.isBefore(loan.dueDate);
    }).length;

    return (onTime / completed.length) * 100;
  }

  /// Process daily earnings with auto-deduction
  Future<RepaymentResult> processEarnings({
    required String userId,
    required double earnings,
  }) async {
    try {
      final result = await AutoRepaymentService.processEarnings(
        userId: userId,
        earnings: earnings,
        activeLoans: activeLoans,
      );

      if (result.success && result.updatedLoans != null) {
        // Update loans with repayments
        for (final updatedLoan in result.updatedLoans!) {
          final index = _loans.indexWhere((l) => l.id == updatedLoan.id);
          if (index != -1) {
            _loans[index] = updatedLoan;
          }
        }
        await _saveLoans();
        notifyListeners();
      }

      return result;
    } catch (e) {
      debugPrint('Error processing earnings: $e');
      return RepaymentResult(
        success: false,
        deductedAmount: 0,
        remainingEarnings: earnings,
        error: e.toString(),
      );
    }
  }

  /// Process early repayment with bonus
  Future<EarlyRepaymentResult> makeEarlyRepayment({
    required String loanId,
    required double amount,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();

      final loanIndex = _loans.indexWhere((loan) => loan.id == loanId);
      if (loanIndex == -1) {
        throw Exception('Loan not found');
      }

      final loan = _loans[loanIndex];

      final result = AutoRepaymentService.processEarlyRepayment(
        loan: loan,
        amount: amount,
      );

      if (result.success && result.updatedLoan != null) {
        _loans[loanIndex] = result.updatedLoan!;
        await _saveLoans();
        notifyListeners();
      }

      _error = null;
      return result;
    } catch (e) {
      _error = 'Failed to process early repayment: $e';
      debugPrint(_error);
      return EarlyRepaymentResult(
        success: false,
        bonusPercentage: 0,
        bonusAmount: 0,
        effectiveAmount: 0,
        error: e.toString(),
      );
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Handle overdue loans with trust score penalty
  Future<OverdueHandlingResult> handleOverdueLoans(TrustScore currentTrustScore) async {
    try {
      final result = await AutoRepaymentService.handleOverdueLoans(
        loans: _loans,
        currentTrustScore: currentTrustScore,
      );

      if (result.updatedLoans.isNotEmpty) {
        _loans = result.updatedLoans;
        await _saveLoans();
        notifyListeners();
      }

      return result;
    } catch (e) {
      debugPrint('Error handling overdue loans: $e');
      return OverdueHandlingResult(
        overdueLoans: [],
        updatedLoans: _loans,
        trustScorePenalty: 0,
      );
    }
  }

  /// Check for overdue loans and mark as defaulted
  Future<void> checkOverdueLoans() async {
    try {
      bool hasChanges = false;

      for (int i = 0; i < _loans.length; i++) {
        final loan = _loans[i];

        if (RizikDhaarService.shouldMarkAsDefaulted(loan)) {
          _loans[i] = loan.copyWith(status: LoanStatus.defaulted);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await _saveLoans();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error checking overdue loans: $e');
    }
  }

  /// Get loan summary
  LoanSummary getLoanSummary() {
    return RizikDhaarService.getLoanSummary(_loans);
  }

  /// Get loans by status
  List<RizikDhaarLoan> getLoansByStatus(LoanStatus status) {
    return _loans.where((loan) => loan.status == status).toList();
  }

  /// Get total outstanding balance
  double get totalOutstandingBalance {
    return activeLoans.fold(
      0.0,
      (sum, loan) => sum + loan.remainingBalance,
    );
  }

  /// Get next payment due
  RepaymentSchedule? get nextPaymentDue {
    RepaymentSchedule? earliest;

    for (final loan in activeLoans) {
      final next = loan.nextPaymentDue;
      if (next != null) {
        if (earliest == null || next.dueDate.isBefore(earliest.dueDate)) {
          earliest = next;
        }
      }
    }

    return earliest;
  }

  /// Reset loans (for testing)
  @visibleForTesting
  Future<void> resetLoans() async {
    _loans = [];
    await _saveLoans();
    notifyListeners();
  }
  /// SDUI-compatible submit method
  Future<void> submitLoanApplication(Map<String, dynamic> data) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      // Simulate network delay
      await Future.delayed(const Duration(seconds: 2));
      
      print('SDUI Loan Application Received: $data');
      
      // In a real scenario, we would parse 'data' and call 'submitApplication'
      // For V10 Foundation, we just validate we received it.
      
      if (data['amount'] == null) {
        throw Exception('Amount is required');
      }
      
      _error = null;
    } catch (e) {
      _error = e.toString();
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
