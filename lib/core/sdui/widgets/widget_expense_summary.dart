import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/group_expense.dart';

/// SDUI Widget: Group Expense Summary
/// Displays total incurred vs total paid with per-member breakdown
class WidgetExpenseSummary extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetExpenseSummary({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    // Extract parameters from JSON
    final groupId = data['groupId'] as String? ?? 'default_group';
    final showCategories = data['showCategories'] as bool? ?? true;
    final limit = data['limit'] as int? ?? 5;

    // Fetch expenses (mock data for now)
    final expenses = _getMockExpenses(groupId, limit);
    final summary = _calculateSummary(expenses);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.grey.shade300,
          width: 1,
        ),
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
              const Icon(
                Icons.account_balance_wallet,
                color: Color(0xFF7C4DFF),
                size: 24,
              ),
              const SizedBox(width: 8),
              const Text(
                'গ্রুপ খরচ সারাংশ',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Total Summary Cards
          Row(
            children: [
              Expanded(
                child: _buildSummaryCard(
                  label: 'মোট খরচ',
                  amount: summary['totalIncurred']!,
                  color: const Color(0xFFEF5350),
                  icon: Icons.arrow_upward,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildSummaryCard(
                  label: 'মোট পরিশোধ',
                  amount: summary['totalPaid']!,
                  color: const Color(0xFF66BB6A),
                  icon: Icons.arrow_downward,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 12),
          
          // Pending Balance
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: summary['pendingBalance']! > 0 
                  ? const Color(0xFFFFF9E6) 
                  : const Color(0xFFE8F5E9),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  summary['pendingBalance']! > 0 ? 'বকেয়া' : 'পরিশোধ সম্পন্ন',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: summary['pendingBalance']! > 0
                        ? const Color(0xFFF57C00)
                        : const Color(0xFF388E3C),
                  ),
                ),
                Text(
                  '৳${summary['pendingBalance']!.toStringAsFixed(0)}',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: summary['pendingBalance']! > 0
                        ? const Color(0xFFF57C00)
                        : const Color(0xFF388E3C),
                  ),
                ),
              ],
            ),
          ),
          
          // Category Breakdown (optional)
          if (showCategories && expenses.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            _buildCategoryBreakdown(expenses),
          ],
          
          // Recent Expenses
          const SizedBox(height: 16),
          const Divider(),
          const SizedBox(height: 8),
          const Text(
            'সাম্প্রতিক খরচ',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: Colors.black87,
            ),
          ),
          const SizedBox(height: 8),
          ...expenses.take(3).map((expense) => _buildExpenseItem(expense)),
        ],
      ),
    );
  }

  /// Build summary card
  Widget _buildSummaryCard({
    required String label,
    required double amount,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 4),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey.shade700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            '৳${amount.toStringAsFixed(0)}',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  /// Build category breakdown
  Widget _buildCategoryBreakdown(List<GroupExpense> expenses) {
    // Group expenses by category
    final categoryTotals = <ExpenseCategory, double>{};
    
    for (final expense in expenses) {
      categoryTotals[expense.category] = 
          (categoryTotals[expense.category] ?? 0) + expense.totalAmount;
    }
    
    // Sort by amount descending
    final sortedCategories = categoryTotals.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'বিভাগ অনুযায়ী খরচ',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        ...sortedCategories.take(5).map((entry) {
          final total = categoryTotals.values.fold(0.0, (a, b) => a + b);
          final percentage = (entry.value / total * 100).toInt();
          
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                Text(
                  entry.key.emoji,
                  style: const TextStyle(fontSize: 16),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            entry.key.nameBn,
                            style: const TextStyle(fontSize: 13),
                          ),
                          Text(
                            '৳${entry.value.toStringAsFixed(0)} ($percentage%)',
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: entry.value / total,
                          minHeight: 6,
                          backgroundColor: Colors.grey.shade200,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            _getCategoryColor(entry.key),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  /// Build expense item
  Widget _buildExpenseItem(GroupExpense expense) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: _getCategoryColor(expense.category).withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              expense.category.emoji,
              style: const TextStyle(fontSize: 20),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  expense.description,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '${expense.paidByName} • ${expense.category.nameBn}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          Text(
            '৳${expense.totalAmount.toStringAsFixed(0)}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: _getCategoryColor(expense.category),
            ),
          ),
        ],
      ),
    );
  }

  /// Get color based on category
  Color _getCategoryColor(ExpenseCategory category) {
    switch (category) {
      case ExpenseCategory.food:
        return const Color(0xFFFF6F00);
      case ExpenseCategory.rent:
        return const Color(0xFF1976D2);
      case ExpenseCategory.utilities:
        return const Color(0xFFFBC02D);
      case ExpenseCategory.groceries:
        return const Color(0xFF388E3C);
      case ExpenseCategory.transport:
        return const Color(0xFF7C4DFF);
      case ExpenseCategory.entertainment:
        return const Color(0xFFE91E63);
      default:
        return const Color(0xFF757575);
    }
  }

  /// Calculate summary totals
  Map<String, double> _calculateSummary(List<GroupExpense> expenses) {
    double totalIncurred = 0;
    double totalPaid = 0;
    
    for (final expense in expenses) {
      totalIncurred += expense.totalAmount;
      
      // In real implementation, check payment records
      // For now, assume 70% is paid
      if (expense.status == ExpenseStatus.settled) {
        totalPaid += expense.totalAmount;
      } else if (expense.status == ExpenseStatus.partial) {
        totalPaid += expense.totalAmount * 0.5;
      }
    }
    
    return {
      'totalIncurred': totalIncurred,
      'totalPaid': totalPaid,
      'pendingBalance': totalIncurred - totalPaid,
    };
  }

  /// Mock expense data (replace with actual Supabase fetch)
  List<GroupExpense> _getMockExpenses(String groupId, int limit) {
    final now = DateTime.now();
    
    return [
      GroupExpense(
        id: 'exp_1',
        groupId: groupId,
        description: 'রাতের খাবার - কাচ্চি',
        totalAmount: 850,
        paidBy: 'user_1',
        paidByName: 'করিম',
        date: now.subtract(const Duration(days: 1)),
        category: ExpenseCategory.food,
        splitType: SplitType.equal,
        splits: {
          'user_1': 283.33,
          'user_2': 283.33,
          'user_3': 283.33,
        },
        status: ExpenseStatus.partial,
      ),
      GroupExpense(
        id: 'exp_2',
        groupId: groupId,
        description: 'মাসিক ভাড়া',
        totalAmount: 15000,
        paidBy: 'user_2',
        paidByName: 'রহিম',
        date: now.subtract(const Duration(days: 5)),
        category: ExpenseCategory.rent,
        splitType: SplitType.equal,
        splits: {
          'user_1': 5000,
          'user_2': 5000,
          'user_3': 5000,
        },
        status: ExpenseStatus.active,
      ),
      GroupExpense(
        id: 'exp_3',
        groupId: groupId,
        description: 'বিদ্যুৎ বিল',
        totalAmount: 1200,
        paidBy: 'user_3',
        paidByName: 'সাইফুল',
        date: now.subtract(const Duration(days: 10)),
        category: ExpenseCategory.utilities,
        splitType: SplitType.equal,
        splits: {
          'user_1': 400,
          'user_2': 400,
          'user_3': 400,
        },
        status: ExpenseStatus.settled,
      ),
      GroupExpense(
        id: 'exp_4',
        groupId: groupId,
        description: 'মুদি কেনাকাটা',
        totalAmount: 2500,
        paidBy: 'user_1',
        paidByName: 'করিম',
        date: now.subtract(const Duration(days: 15)),
        category: ExpenseCategory.groceries,
        splitType: SplitType.equal,
        splits: {
          'user_1': 833.33,
          'user_2': 833.33,
          'user_3': 833.33,
        },
        status: ExpenseStatus.settled,
      ),
      GroupExpense(
        id: 'exp_5',
        groupId: groupId,
        description: 'সিনেমা টিকিট',
        totalAmount: 900,
        paidBy: 'user_2',
        paidByName: 'রহিম',
        date: now.subtract(const Duration(days: 20)),
        category: ExpenseCategory.entertainment,
        splitType: SplitType.equal,
        splits: {
          'user_1': 300,
          'user_2': 300,
          'user_3': 300,
        },
        status: ExpenseStatus.settled,
      ),
    ].take(limit).toList();
  }
}
