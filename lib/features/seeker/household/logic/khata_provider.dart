import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/khata.dart';
import 'package:rizik_v4/data/models/khata_entry.dart';
import 'package:rizik_v4/data/models/order.dart';

/// Provider for managing khata ledgers with auto-logging
class KhataProvider with ChangeNotifier {
  List<Khata> _khatas = [];
  bool _isLoading = false;
  String? _error;

  List<Khata> get khatas => _khatas;
  bool get isLoading => _isLoading;
  String? get error => _error;

  KhataProvider() {
    _loadKhatas();
  }

  /// Load khatas from storage
  Future<void> _loadKhatas() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final khatasJson = prefs.getString('khatas');

      if (khatasJson != null) {
        final List<dynamic> khatasList = jsonDecode(khatasJson);
        _khatas = khatasList
            .map((json) => Khata.fromJson(json as Map<String, dynamic>))
            .toList();
      } else {
        // Create default personal khata for new users with sample data
        final personalKhata = Khata.createPersonal(userId: 'default_user_001');
        
        // Add sample entries for testing
        final sampleEntries = [
          KhataEntry.income(
            description: 'মাসিক বেতন',
            amount: 50000,
            notes: 'নভেম্বর মাসের বেতন',
          ),
          KhataEntry.expense(
            description: 'বাজার',
            amount: 2500,
            category: KhataCategory.groceries,
          ),
          KhataEntry.expense(
            description: 'রেস্টুরেন্ট',
            amount: 800,
            category: KhataCategory.food,
          ),
          KhataEntry.expense(
            description: 'বিদ্যুৎ বিল',
            amount: 1200,
            category: KhataCategory.utilities,
          ),
          KhataEntry.expense(
            description: 'রিকশা ভাড়া',
            amount: 150,
            category: KhataCategory.transport,
          ),
        ];
        
        // Calculate balance
        double balance = 0;
        for (final entry in sampleEntries) {
          balance += entry.isCredit ? entry.amountValue : -entry.amountValue;
        }
        
        final khataWithEntries = personalKhata.copyWith(
          entries: sampleEntries,
          balance: balance,
        );
        
        _khatas = [khataWithEntries];
        await _saveKhatas();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load khatas: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Save khatas to storage
  Future<void> _saveKhatas() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final khatasJson = jsonEncode(_khatas.map((k) => k.toJson()).toList());
      await prefs.setString('khatas', khatasJson);
    } catch (e) {
      debugPrint('Error saving khatas: $e');
    }
  }

  /// Get khata by ID
  Khata? getKhataById(String id) {
    try {
      return _khatas.firstWhere((k) => k.id == id);
    } catch (e) {
      return null;
    }
  }

  /// Get khatas by type
  List<Khata> getKhatasByType(KhataType type) {
    return _khatas.where((k) => k.type == type).toList();
  }

  /// Get khata by type (returns first match)
  Khata? getKhataByType(KhataType type) {
    final khatas = getKhatasByType(type);
    return khatas.isNotEmpty ? khatas.first : null;
  }

  /// Get personal khata (primary)
  Khata? get personalKhata {
    final personalKhatas = getKhatasByType(KhataType.personal);
    return personalKhatas.isNotEmpty ? personalKhatas.first : null;
  }

  /// Create a new khata
  Future<Khata> createKhata(Khata khata) async {
    _khatas.add(khata);
    await _saveKhatas();
    notifyListeners();
    return khata;
  }

  /// Create khata by type (convenience method)
  Future<Khata> createKhataByType(KhataType type) async {
    const userId = 'default_user_001'; // Should come from auth
    
    Khata khata;
    switch (type) {
      case KhataType.personal:
        khata = Khata.createPersonal(userId: userId);
        break;
      case KhataType.shared:
        khata = Khata.createShared(
          userId: userId,
          memberIds: [userId], // Start with just the user
          name: 'Shared Khata',
        );
        break;
      case KhataType.squad:
        khata = Khata.createSquad(
          userId: userId,
          squadId: 'squad_001',
          name: 'Squad Khata',
        );
        break;
      case KhataType.rent:
        khata = Khata.createRent(
          userId: userId,
          monthlyRent: 0.0, // To be set later
          landlordName: 'Landlord',
        );
        break;
    }
    
    return await createKhata(khata);
  }

  /// Add entry to khata
  Future<void> addEntry({
    required String khataId,
    required KhataEntry entry,
  }) async {
    final khataIndex = _khatas.indexWhere((k) => k.id == khataId);
    if (khataIndex == -1) return;

    final khata = _khatas[khataIndex];
    final updatedEntries = List<KhataEntry>.from(khata.entries)..add(entry);

    // Recalculate balance
    final newBalance = _calculateBalance(updatedEntries);

    _khatas[khataIndex] = khata.copyWith(
      entries: updatedEntries,
      balance: newBalance,
      lastUpdated: DateTime.now(),
    );

    await _saveKhatas();
    notifyListeners();
  }

  /// Auto-log expense from order completion
  Future<void> autoLogOrderExpense(Order order) async {
    final personalKhata = this.personalKhata;
    if (personalKhata == null) return;

    try {
      // Detect category based on order type
      final category = _detectCategoryFromOrder(order);

      // Create expense entry
      final entry = KhataEntry.expense(
        description: 'Order: ${order.id}',
        amount: order.total,
        category: category,
        notes: 'Auto-logged from order completion',
        receipt: null, // Could be linked to order confirmation
      );

      await addEntry(
        khataId: personalKhata.id,
        entry: entry,
      );

      debugPrint('✅ Auto-logged order expense: ৳${order.total}');
    } catch (e) {
      debugPrint('Error auto-logging order: $e');
    }
  }

  /// Detect category from order
  KhataCategory _detectCategoryFromOrder(Order order) {
    // Simple detection based on order items
    // In a real app, this would be more sophisticated
    return KhataCategory.food;
  }

  /// Add manual expense entry
  Future<void> addExpense({
    String? khataId,
    required String description,
    required double amount,
    required KhataCategory category,
    String? receipt,
    String? notes,
    bool isLocked = false,
  }) async {
    final targetKhataId = khataId ?? personalKhata?.id;
    if (targetKhataId == null) return;

    final entry = KhataEntry.expense(
      description: description,
      amount: amount,
      category: category,
      receipt: receipt,
      notes: notes,
      isLocked: isLocked,
    );

    await addEntry(khataId: targetKhataId, entry: entry);
  }

  /// Add manual income entry
  Future<void> addIncome({
    String? khataId,
    required String description,
    required double amount,
    String? notes,
  }) async {
    final targetKhataId = khataId ?? personalKhata?.id;
    if (targetKhataId == null) return;

    final entry = KhataEntry.income(
      description: description,
      amount: amount,
      notes: notes,
    );

    await addEntry(khataId: targetKhataId, entry: entry);
  }

  /// Update entry
  Future<void> updateEntry({
    required String khataId,
    required String entryId,
    required KhataEntry updatedEntry,
  }) async {
    final khataIndex = _khatas.indexWhere((k) => k.id == khataId);
    if (khataIndex == -1) return;

    final khata = _khatas[khataIndex];
    final entryIndex = khata.entries.indexWhere((e) => e.id == entryId);
    if (entryIndex == -1) return;

    final updatedEntries = List<KhataEntry>.from(khata.entries);
    updatedEntries[entryIndex] = updatedEntry;

    // Recalculate balance
    final newBalance = _calculateBalance(updatedEntries);

    _khatas[khataIndex] = khata.copyWith(
      entries: updatedEntries,
      balance: newBalance,
      lastUpdated: DateTime.now(),
    );

    await _saveKhatas();
    notifyListeners();
  }

  /// Delete entry
  Future<void> deleteEntry({
    required String khataId,
    required String entryId,
  }) async {
    final khataIndex = _khatas.indexWhere((k) => k.id == khataId);
    if (khataIndex == -1) return;

    final khata = _khatas[khataIndex];
    final entry = khata.entries.firstWhere((e) => e.id == entryId);

    // Cannot delete locked entries
    if (entry.isLocked) {
      _error = 'Cannot delete locked entry';
      notifyListeners();
      return;
    }

    final updatedEntries = khata.entries.where((e) => e.id != entryId).toList();

    // Recalculate balance
    final newBalance = _calculateBalance(updatedEntries);

    _khatas[khataIndex] = khata.copyWith(
      entries: updatedEntries,
      balance: newBalance,
      lastUpdated: DateTime.now(),
    );

    await _saveKhatas();
    notifyListeners();
  }

  /// Toggle entry checked status
  Future<void> toggleEntryChecked({
    required String khataId,
    required String entryId,
  }) async {
    final khataIndex = _khatas.indexWhere((k) => k.id == khataId);
    if (khataIndex == -1) return;

    final khata = _khatas[khataIndex];
    final entryIndex = khata.entries.indexWhere((e) => e.id == entryId);
    if (entryIndex == -1) return;

    final entry = khata.entries[entryIndex];
    final updatedEntry = entry.copyWith(isChecked: !entry.isChecked);

    final updatedEntries = List<KhataEntry>.from(khata.entries);
    updatedEntries[entryIndex] = updatedEntry;

    _khatas[khataIndex] = khata.copyWith(
      entries: updatedEntries,
      lastUpdated: DateTime.now(),
    );

    await _saveKhatas();
    notifyListeners();
  }

  /// Calculate balance from entries
  double _calculateBalance(List<KhataEntry> entries) {
    double balance = 0.0;
    for (final entry in entries) {
      if (entry.isCredit) {
        balance += entry.amountValue;
      } else {
        balance -= entry.amountValue;
      }
    }
    return balance;
  }

  /// Get monthly report for a khata
  MonthlyReport getMonthlyReport(String khataId, DateTime month) {
    final khata = getKhataById(khataId);
    if (khata == null) {
      return MonthlyReport(
        month: month,
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        expensesByCategory: {},
        topExpenses: [],
      );
    }

    final startOfMonth = DateTime(month.year, month.month, 1);
    final endOfMonth = DateTime(month.year, month.month + 1, 0, 23, 59, 59);
    final monthEntries = khata.getEntriesInRange(startOfMonth, endOfMonth);

    final totalIncome = monthEntries
        .where((e) => e.isCredit)
        .fold(0.0, (sum, e) => sum + e.amountValue);

    final totalExpenses = monthEntries
        .where((e) => !e.isCredit)
        .fold(0.0, (sum, e) => sum + e.amountValue);

    final expensesByCategory = <KhataCategory, double>{};
    for (final entry in monthEntries) {
      if (!entry.isCredit && entry.category != null) {
        expensesByCategory[entry.category!] =
            (expensesByCategory[entry.category!] ?? 0.0) + entry.amountValue;
      }
    }

    final topExpenses = monthEntries
        .where((e) => !e.isCredit)
        .toList()
      ..sort((a, b) => b.amountValue.compareTo(a.amountValue));

    return MonthlyReport(
      month: month,
      totalIncome: totalIncome,
      totalExpenses: totalExpenses,
      netSavings: totalIncome - totalExpenses,
      expensesByCategory: expensesByCategory,
      topExpenses: topExpenses.take(5).toList(),
    );
  }

  /// Get savings recommendations
  List<String> getSavingsRecommendations(String khataId) {
    final report = getMonthlyReport(khataId, DateTime.now());
    final recommendations = <String>[];

    if (report.savingsRate < 10) {
      recommendations.add('Try to save at least 10% of your income');
      recommendations.add('আপনার আয়ের অন্তত ১০% সঞ্চয় করার চেষ্টা করুন');
    }

    final highestCategory = report.highestExpenseCategory;
    if (highestCategory != null) {
      final amount = report.expensesByCategory[highestCategory]!;
      recommendations.add(
          'Your highest expense is ${highestCategory.nameBn}: ৳${amount.toStringAsFixed(2)}');
      recommendations.add('Consider reducing ${highestCategory.key} expenses');
    }

    if (report.totalExpenses > report.totalIncome) {
      recommendations.add('⚠️ You are spending more than you earn');
      recommendations.add('⚠️ আপনি আপনার আয়ের চেয়ে বেশি খরচ করছেন');
    }

    return recommendations;
  }

  /// Reset all khatas (for testing)
  @visibleForTesting
  Future<void> resetKhatas() async {
    _khatas = [];
    final personalKhata = Khata.createPersonal(userId: 'default_user_001');
    _khatas = [personalKhata];
    await _saveKhatas();
    notifyListeners();
  }

  // ============================================================================
  // SOCIAL LEDGER METHODS - Phase 2 Integration
  // ============================================================================

  /// Record money lent to someone
  Future<void> recordLent({
    String? khataId,
    required String personId,
    required String personName,
    required double amount,
    required String description,
    String? notes,
  }) async {
    final targetKhataId = khataId ?? personalKhata?.id;
    if (targetKhataId == null) return;

    final entry = KhataEntry(
      date: _formatDate(DateTime.now()),
      description: description,
      amount: amount.toStringAsFixed(2),
      isCredit: false, // Money going out
      isSocialTransaction: true,
      linkedPersonId: personId,
      linkedPersonName: personName,
      socialType: SocialTransactionType.lent,
      notes: notes,
      category: KhataCategory.other,
    );

    await addEntry(khataId: targetKhataId, entry: entry);
  }

  /// Record money borrowed from someone
  Future<void> recordBorrowed({
    String? khataId,
    required String personId,
    required String personName,
    required double amount,
    required String description,
    String? notes,
  }) async {
    final targetKhataId = khataId ?? personalKhata?.id;
    if (targetKhataId == null) return;

    final entry = KhataEntry(
      date: _formatDate(DateTime.now()),
      description: description,
      amount: amount.toStringAsFixed(2),
      isCredit: true, // Money coming in
      isSocialTransaction: true,
      linkedPersonId: personId,
      linkedPersonName: personName,
      socialType: SocialTransactionType.borrowed,
      notes: notes,
      category: KhataCategory.other,
    );

    await addEntry(khataId: targetKhataId, entry: entry);
  }

  /// Record split expense
  Future<void> recordSplit({
    String? khataId,
    required String personId,
    required String personName,
    required double totalAmount,
    required double yourShare,
    required String description,
    String? notes,
  }) async {
    final targetKhataId = khataId ?? personalKhata?.id;
    if (targetKhataId == null) return;

    final entry = KhataEntry(
      date: _formatDate(DateTime.now()),
      description: description,
      amount: yourShare.toStringAsFixed(2),
      isCredit: false, // Your share is an expense
      isSocialTransaction: true,
      linkedPersonId: personId,
      linkedPersonName: personName,
      socialType: SocialTransactionType.split,
      notes: notes ?? 'Total: ৳${totalAmount.toStringAsFixed(2)}',
      category: KhataCategory.other,
    );

    await addEntry(khataId: targetKhataId, entry: entry);
  }

  /// Record payment received (someone paid you back)
  Future<void> recordPaymentReceived({
    String? khataId,
    required String personId,
    required String personName,
    required double amount,
    required String description,
    String? linkedEntryId,
    String? notes,
  }) async {
    final targetKhataId = khataId ?? personalKhata?.id;
    if (targetKhataId == null) return;

    final entry = KhataEntry(
      date: _formatDate(DateTime.now()),
      description: description,
      amount: amount.toStringAsFixed(2),
      isCredit: true, // Money coming in
      isSocialTransaction: true,
      linkedPersonId: personId,
      linkedPersonName: personName,
      socialType: SocialTransactionType.received,
      linkedEntryId: linkedEntryId,
      notes: notes,
      category: KhataCategory.other,
    );

    await addEntry(khataId: targetKhataId, entry: entry);
  }

  /// Record payment made (you paid someone back)
  Future<void> recordPaymentMade({
    String? khataId,
    required String personId,
    required String personName,
    required double amount,
    required String description,
    String? linkedEntryId,
    String? notes,
  }) async {
    final targetKhataId = khataId ?? personalKhata?.id;
    if (targetKhataId == null) return;

    final entry = KhataEntry(
      date: _formatDate(DateTime.now()),
      description: description,
      amount: amount.toStringAsFixed(2),
      isCredit: false, // Money going out
      isSocialTransaction: true,
      linkedPersonId: personId,
      linkedPersonName: personName,
      socialType: SocialTransactionType.paidBack,
      linkedEntryId: linkedEntryId,
      notes: notes,
      category: KhataCategory.other,
    );

    await addEntry(khataId: targetKhataId, entry: entry);
  }

  /// Get all social transactions
  List<KhataEntry> getSocialTransactions({String? khataId}) {
    final targetKhata = khataId != null ? getKhataById(khataId) : personalKhata;
    if (targetKhata == null) return [];

    return targetKhata.entries
        .where((e) => e.isSocialTransaction)
        .toList()
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));
  }

  /// Get transactions with a specific person
  List<KhataEntry> getTransactionsWithPerson({
    String? khataId,
    required String personId,
  }) {
    final socialTransactions = getSocialTransactions(khataId: khataId);
    return socialTransactions
        .where((e) => e.linkedPersonId == personId)
        .toList();
  }

  /// Calculate net balance with a person
  /// Positive = they owe you, Negative = you owe them
  double getBalanceWithPerson({
    String? khataId,
    required String personId,
  }) {
    final transactions = getTransactionsWithPerson(
      khataId: khataId,
      personId: personId,
    );

    double balance = 0.0;
    for (final entry in transactions) {
      switch (entry.socialType) {
        case SocialTransactionType.lent:
          balance += entry.amountValue; // They owe you
          break;
        case SocialTransactionType.borrowed:
          balance -= entry.amountValue; // You owe them
          break;
        case SocialTransactionType.received:
          balance -= entry.amountValue; // They paid you back
          break;
        case SocialTransactionType.paidBack:
          balance += entry.amountValue; // You paid them back
          break;
        case SocialTransactionType.split:
          // Split doesn't affect person-to-person balance
          break;
        default:
          break;
      }
    }

    return balance;
  }

  /// Get all people you have transactions with
  Map<String, PersonBalance> getAllPersonBalances({String? khataId}) {
    final socialTransactions = getSocialTransactions(khataId: khataId);
    final Map<String, PersonBalance> balances = {};

    for (final entry in socialTransactions) {
      if (entry.linkedPersonId == null) continue;

      final personId = entry.linkedPersonId!;
      final personName = entry.linkedPersonName ?? 'Unknown';

      if (!balances.containsKey(personId)) {
        balances[personId] = PersonBalance(
          personId: personId,
          personName: personName,
          balance: 0.0,
          lastTransaction: entry.timestamp,
        );
      }

      final current = balances[personId]!;
      double balanceChange = 0.0;

      switch (entry.socialType) {
        case SocialTransactionType.lent:
          balanceChange = entry.amountValue;
          break;
        case SocialTransactionType.borrowed:
          balanceChange = -entry.amountValue;
          break;
        case SocialTransactionType.received:
          balanceChange = -entry.amountValue;
          break;
        case SocialTransactionType.paidBack:
          balanceChange = entry.amountValue;
          break;
        default:
          break;
      }

      balances[personId] = PersonBalance(
        personId: personId,
        personName: personName,
        balance: current.balance + balanceChange,
        lastTransaction: entry.timestamp.isAfter(current.lastTransaction)
            ? entry.timestamp
            : current.lastTransaction,
      );
    }

    return balances;
  }

  /// Get total amount you owe to others
  double getTotalOwed({String? khataId}) {
    final balances = getAllPersonBalances(khataId: khataId);
    return balances.values
        .where((b) => b.balance < 0)
        .fold(0.0, (sum, b) => sum + b.balance.abs());
  }

  /// Get total amount owed to you by others
  double getTotalReceivable({String? khataId}) {
    final balances = getAllPersonBalances(khataId: khataId);
    return balances.values
        .where((b) => b.balance > 0)
        .fold(0.0, (sum, b) => sum + b.balance);
  }

  /// Get net social balance (receivable - owed)
  double getNetSocialBalance({String? khataId}) {
    return getTotalReceivable(khataId: khataId) - getTotalOwed(khataId: khataId);
  }

  /// Helper to format date
  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  /// Delete a social transaction entry by ID
  Future<void> deleteSocialEntry(String entryId) async {
    final khataId = personalKhata?.id;
    if (khataId == null) return;
    
    await deleteEntry(khataId: khataId, entryId: entryId);
  }

  /// Update a social transaction entry
  Future<void> updateSocialEntry(
    String entryId, {
    double? amount,
    String? description,
    String? notes,
  }) async {
    final khataId = personalKhata?.id;
    if (khataId == null) return;

    final khata = _khatas.firstWhere((k) => k.id == khataId);
    final entry = khata.entries.firstWhere((e) => e.id == entryId);

    final updatedEntry = KhataEntry(
      id: entry.id,
      date: entry.date,
      timestamp: entry.timestamp,
      description: description ?? entry.description,
      amount: amount != null ? amount.toStringAsFixed(2) : entry.amount,
      isCredit: entry.isCredit,
      category: entry.category,
      isSocialTransaction: entry.isSocialTransaction,
      linkedPersonId: entry.linkedPersonId,
      linkedPersonName: entry.linkedPersonName,
      socialType: entry.socialType,
      notes: notes ?? entry.notes,
      isLocked: entry.isLocked,
    );

    await updateEntry(
      khataId: khataId,
      entryId: entryId,
      updatedEntry: updatedEntry,
    );
  }
}

/// Person balance data class
class PersonBalance {
  final String personId;
  final String personName;
  final double balance; // Positive = they owe you, Negative = you owe them
  final DateTime lastTransaction;

  PersonBalance({
    required this.personId,
    required this.personName,
    required this.balance,
    required this.lastTransaction,
  });

  bool get theyOweYou => balance > 0;
  bool get youOweThem => balance < 0;
  bool get isSettled => balance == 0;

  double get absoluteBalance => balance.abs();
}
