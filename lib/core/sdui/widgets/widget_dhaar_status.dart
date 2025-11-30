import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/rizik_dhaar_loan.dart';
import 'package:rizik_v4/data/models/trust_score.dart' as trust;
import 'package:rizik_v4/data/remote/rizik_dhaar_service.dart';
import 'package:rizik_v4/core/theme/rizik_colors.dart';

/// SDUI Widget: Rizik Dhaar Loan Status
/// Displays loan eligibility, active loans, and voucher balance
class WidgetDhaarStatus extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetDhaarStatus({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    final userId = data['userId'] as String? ?? 'default_user';
    final showVouchers = data['showVouchers'] as bool? ?? true;
    final showSchedule = data['showSchedule'] as bool? ?? true;

    // Mock data
    final loan = _getMockActiveLoan(userId);
    final eligibility = _getMockEligibility();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF7C4DFF).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.account_balance_wallet,
                  color: Color(0xFF7C4DFF),
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  'রিজিক ধার',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              if (loan == null)
                Row( // Changed from Container to Row to accommodate multiple widgets
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: eligibility.eligible
                            ? Colors.green.withOpacity(0.2) // Adjusted to match original opacity style
                            : Colors.red.withOpacity(0.2), // Adjusted to match original opacity style
                        borderRadius: BorderRadius.circular(12), // Kept original border radius
                      ),
                      child: Text(
                        eligibility.eligible ? '✓ Eligible' : '✗ Ineligible',
                        style: TextStyle(
                          fontSize: 11, // Kept original font size
                          fontWeight: FontWeight.bold,
                          color: eligibility.eligible
                              ? Colors.green.shade800 // Adjusted color for better contrast
                              : Colors.red.shade800, // Adjusted color for better contrast
                        ),
                      ),
                    ),
                  ],
                ),
            ],
          ),

          const SizedBox(height: 16),

          if (loan != null) ...[
            // Active Loan Summary
            _buildActiveLoanCard(loan),

            const SizedBox(height: 12),

            if (showSchedule) ...[
              if (loan.repaymentSchedule.isNotEmpty) ...[
                const Divider(),
                const SizedBox(height: 8),
                _buildRepaymentSchedule(loan.repaymentSchedule.firstWhere(
                  (element) => !element.isPaid,
                  orElse: () => loan.repaymentSchedule.last,
                )),
              ],
            ],

            if (showVouchers && loan.vouchers.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(),
              const SizedBox(height: 8),
              _buildVouchersSection(loan.vouchers),
            ],
          ] else ...[
            // No Active Loan - Show Application Option
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE3F2FD),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                children: [
                  const Text(
                    '💰 আপনার কোন সক্রিয় ঋণ নেই',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1976D2),
                    ),
                  ),
                  const SizedBox(height: 8),
                  if (eligibility.eligible) ...[
                    Text(
                      'সর্বোচ্চ ঋণ সীমা: ৳${eligibility.maxAmount?.toStringAsFixed(0) ?? '0'}',
                      style: TextStyle(
                        color: Colors.grey[600],
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ElevatedButton(
                      onPressed: () {
                        print('Apply for loan');
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF7C4DFF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: const Text('ঋণের জন্য আবেদন করুন'),
                    ),
                  ] else ...[
                    Text(
                      eligibility.reason ?? 'আপনি এখনও যোগ্য নন',
                      style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildActiveLoanCard(RizikDhaarLoan loan) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'সক্রিয় ঋণ (Active Loan)',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: RizikColors.primaryText,
            ),
          ),
          const SizedBox(height: 16),
          _buildLoanStat('পরিমাণ (Amount)', '৳${loan.amount}', RizikColors.primaryText),
          const SizedBox(height: 8),
          _buildLoanStat('পরিশোধিত (Paid)', '৳${loan.paidAmount}', RizikColors.rizikGreen),
          const SizedBox(height: 16),
          LinearProgressIndicator(
            value: loan.amount > 0 ? loan.paidAmount / loan.amount : 0,
            backgroundColor: Colors.grey.shade200,
            valueColor: AlwaysStoppedAnimation<Color>(const Color(0xFF7C4DFF)),
          ),
        ],
      ),
    );
  }

  Widget _buildRepaymentSchedule(RepaymentSchedule schedule) {
    final isPaid = schedule.paidDate != null;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Icon(
            isPaid ? Icons.check_circle : Icons.schedule,
            color: isPaid ? Colors.green : Colors.orange,
            size: 20,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'পরবর্তী কিস্তি',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                Text(
                  '৳${schedule.amount.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '${schedule.dueDate.day}/${schedule.dueDate.month}',
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoanStat(String label, String value, Color color) {
    return Column(
      children: [
        Text(label, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color),
        ),
      ],
    );
  }

  Widget _buildVouchersSection(List<LockedVoucher> vouchers) {
    final totalBalance = vouchers.fold(0.0, (sum, v) => sum + v.amount);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              '🎫 ভাউচার ব্যালেন্স',
              style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            ),
            Text(
              '৳${totalBalance.toStringAsFixed(0)}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Color(0xFF7C4DFF)),
            ),
          ],
        ),
        const SizedBox(height: 6),
        Text(
          '${vouchers.length} টি ভাউচার • ${vouchers.first.approvedVendors.length} টি বিক্রেতা',
          style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
        ),
      ],
    );
  }

  RizikDhaarLoan? _getMockActiveLoan(String userId) {
    // 50% chance of having active loan
    if (userId.hashCode % 2 == 0) return null;
    
    return RizikDhaarLoan(
      id: 'loan_${userId}',
      userId: userId,
      type: LoanType.ingredient,
      amount: 5000,
      interestRate: 3.5,
      termDays: 30,
      paidAmount: 2500,
      status: LoanStatus.active,
      approvalDate: DateTime.now().subtract(const Duration(days: 15)),
      vouchers: [
        LockedVoucher(
          id: 'voucher_1',
          amount: 2000,
          usedAmount: 0,
          approvedVendors: ['vendor_1', 'vendor_2', 'vendor_3'],
          expiryDate: DateTime.now().add(const Duration(days: 15)),
        ),
      ],
      repaymentSchedule: List.generate(
        4,
        (i) => RepaymentSchedule(
          amount: 1293.75,
          dueDate: DateTime.now().add(Duration(days: 7 * (i + 1))),
          isPaid: i < 2,
          paidDate: i < 2 ? DateTime.now().subtract(Duration(days: 7 * (2 - i))) : null,
        ),
      ),
      applicationDate: DateTime.now().subtract(const Duration(days: 16)),
    );
  }

  LoanEligibilityResult _getMockEligibility() {
    return LoanEligibilityResult(
      eligible: true,
      maxAmount: 10000,
      reason: 'Your trust score is excellent!',
      reasonBn: 'আপনার ট্রাস্ট স্কোর চমৎকার!',
      requiredTrustScore: 80,
      currentTrustScore: 85,
    );
  }
}
