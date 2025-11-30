import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/expense_group.dart';
import 'package:rizik_v4/data/models/group_expense.dart';
import 'package:rizik_v4/data/models/settlement.dart';
import 'package:rizik_v4/core/utils/bill_splitter.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';
import 'package:rizik_v4/core/state/aura_provider.dart';
import 'package:rizik_v4/features/social/tribunal/logic/trust_score_provider.dart';

/// Provider for managing group expenses and bill splitting
class GroupExpenseProvider with ChangeNotifier {
  List<ExpenseGroup> _groups = [];
  List<GroupExpense> _expenses = [];
  List<Settlement> _settlements = [];
  bool _isLoading = false;
  String? _error;

  // Dependencies
  KhataProvider? _khataProvider;
  AuraProvider? _auraProvider;
  TrustScoreProvider? _trustScoreProvider;

  List<ExpenseGroup> get groups => _groups;
  List<ExpenseGroup> get activeGroups => 
    _groups.where((g) => g.isActive).toList();
  List<GroupExpense> get expenses => _expenses;
  List<Settlement> get settlements => _settlements;
  bool get isLoading => _isLoading;
  String? get error => _error;

  GroupExpenseProvider() {
    _loadData();
  }

  /// Set dependencies for integration
  void setDependencies({
    KhataProvider? khataProvider,
    AuraProvider? auraProvider,
    TrustScoreProvider? trustScoreProvider,
  }) {
    _khataProvider = khataProvider;
    _auraProvider = auraProvider;
    _trustScoreProvider = trustScoreProvider;
  }

  /// Load data from storage
  Future<void> _loadData() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();

      // Load groups
      final groupsJson = prefs.getString('expense_groups');
      if (groupsJson != null) {
        final List<dynamic> groupsList = jsonDecode(groupsJson);
        _groups = groupsList
            .map((json) => ExpenseGroup.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      // Load expenses
      final expensesJson = prefs.getString('group_expenses');
      if (expensesJson != null) {
        final List<dynamic> expensesList = jsonDecode(expensesJson);
        _expenses = expensesList
            .map((json) => GroupExpense.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      // Load settlements
      final settlementsJson = prefs.getString('settlements');
      if (settlementsJson != null) {
        final List<dynamic> settlementsList = jsonDecode(settlementsJson);
        _settlements = settlementsList
            .map((json) => Settlement.fromJson(json as Map<String, dynamic>))
            .toList();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load data: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save data to storage
  Future<void> _saveData() async {
    try {
      final prefs = await SharedPreferences.getInstance();

      await prefs.setString(
        'expense_groups',
        jsonEncode(_groups.map((g) => g.toJson()).toList()),
      );

      await prefs.setString(
        'group_expenses',
        jsonEncode(_expenses.map((e) => e.toJson()).toList()),
      );

      await prefs.setString(
        'settlements',
        jsonEncode(_settlements.map((s) => s.toJson()).toList()),
      );
    } catch (e) {
      debugPrint('Error saving data: $e');
    }
  }

  /// Create a new expense group
  Future<ExpenseGroup> createGroup({
    required String name,
    required GroupType type,
    required List<GroupMember> members,
    required String createdBy,
    String? description,
    GroupSettings? settings,
  }) async {
    final group = ExpenseGroup.create(
      name: name,
      type: type,
      members: members,
      createdBy: createdBy,
      description: description,
      settings: settings,
    );

    _groups.add(group);
    await _saveData();
    notifyListeners();

    // Award XP for creating group
    await _auraProvider?.awardXP(xpAmount: 100, reason: 'Created expense group');

    debugPrint('✅ Created group: ${group.name}');
    return group;
  }

  /// Get group by ID
  ExpenseGroup? getGroupById(String id) {
    try {
      return _groups.firstWhere((g) => g.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Get expenses for a group
  List<GroupExpense> getGroupExpenses(String groupId) {
    return _expenses.where((e) => e.groupId == groupId).toList()
      ..sort((a, b) => b.date.compareTo(a.date));
  }

  /// Add expense to group
  Future<GroupExpense> addExpense({
    required String groupId,
    required String description,
    required double amount,
    required String paidBy,
    required String paidByName,
    required ExpenseCategory category,
    required SplitType splitType,
    Map<String, double>? customSplits,
    List<ExpenseItem>? items,
    String? notes,
  }) async {
    final group = getGroupById(groupId);
    if (group == null) {
      throw Exception('Group not found');
    }

    // Calculate splits
    final splits = calculateSplits(
      group: group,
      amount: amount,
      splitType: splitType,
      customSplits: customSplits,
      items: items,
    );

    // Validate splits
    if (!BillSplitter.validateSplits(total: amount, splits: splits)) {
      throw Exception('Splits do not sum to total amount');
    }

    final expense = GroupExpense(
      id: 'expense_${DateTime.now().millisecondsSinceEpoch}',
      groupId: groupId,
      description: description,
      totalAmount: amount,
      paidBy: paidBy,
      paidByName: paidByName,
      date: DateTime.now(),
      category: category,
      splitType: splitType,
      splits: splits,
      items: items,
      notes: notes,
    );

    _expenses.add(expense);

    // Update group last activity
    final groupIndex = _groups.indexWhere((g) => g.id == groupId);
    if (groupIndex != -1) {
      _groups[groupIndex] = _groups[groupIndex].copyWith(
        lastActivity: DateTime.now(),
      );
    }

    await _saveData();
    notifyListeners();

    // Sync to Social Ledger
    await _syncToSocialLedger(expense, group);

    // Award XP
    await _auraProvider?.awardXP(xpAmount: 50, reason: 'Added group expense');

    debugPrint('✅ Added expense: $description (৳$amount)');
    return expense;
  }

  /// Calculate splits based on split type
  Map<String, double> calculateSplits({
    required ExpenseGroup group,
    required double amount,
    required SplitType splitType,
    Map<String, double>? customSplits,
    List<ExpenseItem>? items,
  }) {
    final memberIds = group.members.map((m) => m.userId).toList();

    switch (splitType) {
      case SplitType.equal:
        return BillSplitter.splitEqually(
          total: amount,
          members: memberIds,
        );

      case SplitType.unequal:
        if (customSplits == null) {
          throw Exception('Custom splits required for unequal split');
        }
        return BillSplitter.splitByAmounts(amounts: customSplits);

      case SplitType.percentage:
        if (customSplits == null) {
          throw Exception('Percentages required for percentage split');
        }
        return BillSplitter.splitByPercentage(
          total: amount,
          percentages: customSplits,
        );

      case SplitType.shares:
        if (customSplits == null) {
          throw Exception('Shares required for share-based split');
        }
        final shares = customSplits.map((k, v) => MapEntry(k, v.toInt()));
        return BillSplitter.splitByShares(
          total: amount,
          shares: shares,
        );

      case SplitType.itemized:
        if (items == null || items.isEmpty) {
          throw Exception('Items required for itemized split');
        }
        final itemTotal = items.fold(0.0, (sum, item) => sum + item.totalPrice);
        final sharedCosts = amount - itemTotal;
        return BillSplitter.splitItemized(
          items: items,
          sharedCosts: sharedCosts,
          allMembers: memberIds,
        );
    }
  }

  /// Get group balances
  Map<String, double> getGroupBalances(String groupId) {
    final group = getGroupById(groupId);
    if (group == null) return {};

    final groupExpenses = getGroupExpenses(groupId);
    final memberIds = group.members.map((m) => m.userId).toList();

    return BillSplitter.calculateGroupBalances(
      expenses: groupExpenses,
      memberIds: memberIds,
    );
  }

  /// Simplify debts for a group
  List<Settlement> simplifyDebts(String groupId) {
    final group = getGroupById(groupId);
    if (group == null) return [];

    final balances = getGroupBalances(groupId);
    final names = {
      for (var member in group.members) member.userId: member.name
    };

    return BillSplitter.simplifyDebts(groupId, balances, names);
  }


  /// Record settlement
  /// This creates a PAYMENT TRANSACTION that zeros out the debt
  Future<void> recordSettlement({
    required String groupId,
    required String from,
    required String to,
    required double amount,
    String? paymentMethod,
    String? transactionId,
  }) async {
    final group = getGroupById(groupId);
    if (group == null) return;

    final fromMember = group.members.firstWhere((m) => m.userId == from);
    final toMember = group.members.firstWhere((m) => m.userId == to);

    // Create settlement record
    final settlement = Settlement(
      id: 'settlement_${DateTime.now().millisecondsSinceEpoch}',
      groupId: groupId,
      from: from,
      fromName: fromMember.name,
      to: to,
      toName: toMember.name,
      amount: amount,
      createdAt: DateTime.now(),
      status: SettlementStatus.paid,
      settledAt: DateTime.now(),
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      expenseIds: [],
    );

    _settlements.add(settlement);

    // 🔥 CRITICAL FIX: Create a counter-expense to zero out the balance
    // This is a "payment" expense where the debtor pays the creditor
    // The payer is "from" (the person who owed money)
    // The split gives 100% to "to" (the person who was owed)
    final paymentExpense = GroupExpense(
      id: 'payment_${DateTime.now().millisecondsSinceEpoch}',
      groupId: groupId,
      description: '💰 Payment: ${fromMember.name} → ${toMember.name}',
      totalAmount: amount,
      paidBy: from, // The debtor is paying
      paidByName: fromMember.name,
      date: DateTime.now(),
      category: ExpenseCategory.settlement, // Special category for settlements
      splitType: SplitType.unequal,
      splits: {
        to: amount, // The creditor receives the full amount
        // Everyone else gets 0 (implicitly)
        for (var member in group.members)
          if (member.userId != to) member.userId: 0.0,
      },
      notes: 'Settlement: ${settlement.id} - ${paymentMethod ?? "Cash"}',
      status: ExpenseStatus.settled,
    );

    _expenses.add(paymentExpense);

    await _saveData();
    notifyListeners();

    // Sync to Social Ledger (record payment)
    if (_khataProvider != null) {
      await _khataProvider!.recordPaymentMade(
        personId: to,
        personName: toMember.name,
        amount: amount,
        description: 'Group settlement: ${group.name}',
      );
    }

    // Award XP for settling debt
    await _auraProvider?.awardXP(xpAmount: 100, reason: 'Settled group debt');

    debugPrint('✅ Recorded settlement: $from → $to (৳$amount)');
    debugPrint('✅ Created payment expense to zero out balance');
  }

  /// Sync expense to Social Ledger
  Future<void> _syncToSocialLedger(
    GroupExpense expense,
    ExpenseGroup group,
  ) async {
    if (_khataProvider == null) return;

    // For each person who owes money to the payer
    for (final entry in expense.splits.entries) {
      final userId = entry.key;
      final amount = entry.value;

      // Skip the person who paid
      if (userId == expense.paidBy) continue;

      final member = group.members.firstWhere((m) => m.userId == userId);

      // Record as borrowed (they owe the payer)
      await _khataProvider!.recordBorrowed(
        personId: expense.paidBy,
        personName: expense.paidByName,
        amount: amount,
        description: '${expense.description} (Group: ${group.name})',
        notes: 'Auto-synced from group expense',
      );
    }
  }

  /// Get user's total owed across all groups
  double getTotalOwed(String userId) {
    double total = 0.0;
    for (final group in activeGroups) {
      final balances = getGroupBalances(group.id);
      final balance = balances[userId] ?? 0.0;
      if (balance < 0) {
        total += balance.abs();
      }
    }
    return total;
  }

  /// Get user's total receivable across all groups
  double getTotalReceivable(String userId) {
    double total = 0.0;
    for (final group in activeGroups) {
      final balances = getGroupBalances(group.id);
      final balance = balances[userId] ?? 0.0;
      if (balance > 0) {
        total += balance;
      }
    }
    return total;
  }

  /// Get user's groups
  List<ExpenseGroup> getUserGroups(String userId) {
    return activeGroups.where((g) => 
      g.members.any((m) => m.userId == userId)
    ).toList();
  }

  /// Update group
  Future<void> updateGroup(ExpenseGroup group) async {
    final index = _groups.indexWhere((g) => g.id == group.id);
    if (index != -1) {
      _groups[index] = group;
      await _saveData();
      notifyListeners();
    }
  }

  /// Delete group
  Future<void> deleteGroup(String groupId) async {
    _groups.removeWhere((g) => g.id == groupId);
    _expenses.removeWhere((e) => e.groupId == groupId);
    _settlements.removeWhere((s) => s.groupId == groupId);
    await _saveData();
    notifyListeners();
  }

  /// Delete expense
  Future<void> deleteExpense(String expenseId) async {
    _expenses.removeWhere((e) => e.id == expenseId);
    await _saveData();
    notifyListeners();
  }

  /// Get settlements for a group
  List<Settlement> getGroupSettlements(String groupId) {
    return _settlements.where((s) => s.groupId == groupId).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
  }

  /// Get pending settlements for a user
  List<Settlement> getPendingSettlements(String userId) {
    return _settlements.where((s) => 
      (s.from == userId || s.to == userId) &&
      s.status == SettlementStatus.pending
    ).toList();
  }
}
