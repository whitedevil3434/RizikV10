import 'dart:math';
import 'package:rizik_v4/data/models/group_expense.dart';
import 'package:rizik_v4/data/models/settlement.dart';

/// Utility class for bill splitting calculations
class BillSplitter {
  /// Split amount equally among all members
  static Map<String, double> splitEqually({
    required double total,
    required List<String> members,
  }) {
    if (members.isEmpty) return {};
    final perPerson = total / members.length;
    return {for (var m in members) m: perPerson};
  }

  /// Split by custom amounts (must sum to total)
  static Map<String, double> splitByAmounts({
    required Map<String, double> amounts,
  }) {
    return Map.from(amounts);
  }

  /// Split by percentage (must sum to 100)
  static Map<String, double> splitByPercentage({
    required double total,
    required Map<String, double> percentages,
  }) {
    return percentages.map((id, pct) => MapEntry(id, total * pct / 100));
  }

  /// Split by shares (e.g., A: 2 shares, B: 1 share)
  static Map<String, double> splitByShares({
    required double total,
    required Map<String, int> shares,
  }) {
    final totalShares = shares.values.reduce((a, b) => a + b);
    if (totalShares == 0) return {};
    final perShare = total / totalShares;
    return shares.map((id, s) => MapEntry(id, perShare * s));
  }

  /// Split itemized bill
  static Map<String, double> splitItemized({
    required List<ExpenseItem> items,
    required double sharedCosts, // Delivery, tip, etc.
    required List<String> allMembers,
  }) {
    final balances = <String, double>{};

    // Initialize all members with 0
    for (final member in allMembers) {
      balances[member] = 0.0;
    }

    // Split individual items
    for (final item in items) {
      if (item.sharedBy.isEmpty) continue;
      final perPerson = item.totalPrice / item.sharedBy.length;
      for (final person in item.sharedBy) {
        balances[person] = (balances[person] ?? 0) + perPerson;
      }
    }

    // Add shared costs equally
    if (allMembers.isNotEmpty) {
      final sharedPerPerson = sharedCosts / allMembers.length;
      for (final person in allMembers) {
        balances[person] = (balances[person] ?? 0) + sharedPerPerson;
      }
    }

    return balances;
  }

  /// Simplify debts using greedy algorithm
  /// Positive balance = owed to them, Negative = they owe
  static List<Settlement> simplifyDebts(
    String groupId,
    Map<String, double> balances,
    Map<String, String> names,
  ) {
    // Separate creditors and debtors
    final creditors = <String, double>{};
    final debtors = <String, double>{};

    balances.forEach((person, balance) {
      if (balance > 0.01) {
        creditors[person] = balance;
      } else if (balance < -0.01) {
        debtors[person] = -balance;
      }
    });

    final settlements = <Settlement>[];
    final now = DateTime.now();

    // Greedy algorithm: match largest creditor with largest debtor
    while (creditors.isNotEmpty && debtors.isNotEmpty) {
      final maxCreditor = creditors.entries.reduce(
        (a, b) => a.value > b.value ? a : b,
      );
      final maxDebtor = debtors.entries.reduce(
        (a, b) => a.value > b.value ? a : b,
      );

      final amount = min(maxCreditor.value, maxDebtor.value);

      settlements.add(Settlement(
        id: 'settlement_${now.millisecondsSinceEpoch}_${settlements.length}',
        groupId: groupId,
        from: maxDebtor.key,
        fromName: names[maxDebtor.key] ?? 'Unknown',
        to: maxCreditor.key,
        toName: names[maxCreditor.key] ?? 'Unknown',
        amount: amount,
        createdAt: now,
        expenseIds: [], // Will be filled by provider
      ));

      creditors[maxCreditor.key] = maxCreditor.value - amount;
      debtors[maxDebtor.key] = maxDebtor.value - amount;

      if (creditors[maxCreditor.key]! < 0.01) {
        creditors.remove(maxCreditor.key);
      }
      if (debtors[maxDebtor.key]! < 0.01) {
        debtors.remove(maxDebtor.key);
      }
    }

    return settlements;
  }

  /// Validate that splits sum to total amount
  static bool validateSplits({
    required double total,
    required Map<String, double> splits,
    double tolerance = 0.01,
  }) {
    final sum = splits.values.fold(0.0, (a, b) => a + b);
    return (sum - total).abs() < tolerance;
  }

  /// Calculate balance for each member in a group
  /// Positive = owed to them, Negative = they owe
  static Map<String, double> calculateGroupBalances({
    required List<GroupExpense> expenses,
    required List<String> memberIds,
  }) {
    final balances = <String, double>{};

    // Initialize all members with 0
    for (final memberId in memberIds) {
      balances[memberId] = 0.0;
    }

    // Process each expense
    for (final expense in expenses) {
      if (expense.status == ExpenseStatus.cancelled) continue;

      // Person who paid gets credited
      balances[expense.paidBy] = 
        (balances[expense.paidBy] ?? 0) + expense.totalAmount;

      // Each person's share is debited
      expense.splits.forEach((userId, amount) {
        balances[userId] = (balances[userId] ?? 0) - amount;
      });
    }

    return balances;
  }
}
