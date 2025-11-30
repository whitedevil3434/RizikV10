import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/unified_wallet.dart';
import 'package:rizik_v4/data/models/moneybag.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/data/remote/role_context_manager.dart';

/// Provider for Unified Wallet System
/// One balance per user, transactions track which role performed them
class UnifiedWalletProvider with ChangeNotifier {
  UnifiedWallet? _wallet;
  final RoleContextManager roleContextManager;
  bool _isLoading = false;
  String? _error;
  bool _isMigrated = false;

  UnifiedWallet? get wallet => _wallet;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isMigrated => _isMigrated;

  /// Get current balance (same across all roles)
  double get balance => _wallet?.balance ?? 0.0;

  /// Get balance contribution by each role
  Map<UserRole, double> get balanceByRole => _wallet?.getBalanceByRole() ?? {};

  /// Get transactions for current role
  List<UnifiedTransaction> get currentRoleTransactions {
    return _wallet?.getTransactionsByRole(roleContextManager.currentRole) ?? [];
  }

  /// Get all transactions
  List<UnifiedTransaction> get allTransactions => _wallet?.transactions ?? [];

  UnifiedWalletProvider({required this.roleContextManager}) {
    _loadWallet();
  }

  Future<void> _loadWallet() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      
      // Check if already migrated to unified wallet
      _isMigrated = prefs.getBool('wallet_migrated') ?? false;

      if (_isMigrated) {
        // Load unified wallet
        final walletJson = prefs.getString('unified_wallet');
        if (walletJson != null) {
          _wallet = UnifiedWallet.fromJson(jsonDecode(walletJson));
          debugPrint('✅ Loaded unified wallet: ৳${_wallet!.balance.toStringAsFixed(2)}');
        }
      } else {
        // Check if old moneybags exist and migrate
        final moneybagsJson = prefs.getString('moneybags');
        if (moneybagsJson != null) {
          await _migrateFromLegacyMoneybags(moneybagsJson);
        } else {
          // Create new unified wallet
          _initializeNewWallet();
        }
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load wallet: $e';
      debugPrint('❌ $_error');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Migrate from old 3-wallet system to unified wallet
  Future<void> _migrateFromLegacyMoneybags(String moneybagsJson) async {
    try {
      debugPrint('🔄 Migrating from legacy 3-wallet system...');

      final Map<String, dynamic> moneybagsMap = jsonDecode(moneybagsJson);
      final moneybags = moneybagsMap.map(
        (key, value) => MapEntry(
          MoneybagType.values.firstWhere((t) => t.key == key),
          Moneybag.fromJson(value as Map<String, dynamic>),
        ),
      );

      // Create unified wallet from legacy data
      _wallet = UnifiedWallet.fromLegacyMoneybags(
        userId: 'default_user_001',
        moneybags: moneybags,
      );

      // Save unified wallet
      await _saveWallet();

      // Mark as migrated
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('wallet_migrated', true);
      _isMigrated = true;

      debugPrint('✅ Migration complete!');
      debugPrint('   Total balance: ৳${_wallet!.balance.toStringAsFixed(2)}');
      debugPrint('   Total transactions: ${_wallet!.transactions.length}');
      
      final balanceByRole = _wallet!.getBalanceByRole();
      debugPrint('   Balance by role:');
      for (final entry in balanceByRole.entries) {
        debugPrint('     - ${entry.key.displayName}: ৳${entry.value.toStringAsFixed(2)}');
      }
    } catch (e) {
      debugPrint('❌ Migration failed: $e');
      _initializeNewWallet();
    }
  }

  void _initializeNewWallet() {
    const userId = 'default_user_001';
    _wallet = UnifiedWallet.create(userId: userId);

    // Add initial test balance
    final initialTransaction = UnifiedTransaction(
      id: 'txn_initial_${DateTime.now().millisecondsSinceEpoch}',
      amount: 20000.0,
      type: TransactionType.deposit,
      timestamp: DateTime.now(),
      performedByRole: UserRole.consumer,
      description: 'Initial test balance',
      source: TransactionSource.system,
      sourceId: 'initial_load',
    );

    _wallet = _wallet!.copyWith(
      balance: 20000.0,
      transactions: [initialTransaction],
      lastUpdated: DateTime.now(),
    );

    debugPrint('💰 Initialized unified wallet with ৳20,000 for testing');
  }

  Future<void> _saveWallet() async {
    if (_wallet == null) return;

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('unified_wallet', jsonEncode(_wallet!.toJson()));
    } catch (e) {
      debugPrint('❌ Error saving wallet: $e');
    }
  }

  /// Add money to wallet
  Future<void> addMoney({
    required double amount,
    String? reference,
    String? description,
  }) async {
    if (_wallet == null) return;

    final transaction = UnifiedTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: TransactionType.deposit,
      timestamp: DateTime.now(),
      performedByRole: roleContextManager.currentRole,
      reference: reference,
      description: description ?? 'Added money',
      source: TransactionSource.manual,
    );

    final updatedTransactions = List<UnifiedTransaction>.from(_wallet!.transactions)
      ..add(transaction);

    _wallet = _wallet!.copyWith(
      balance: _wallet!.balance + amount,
      transactions: updatedTransactions,
      lastUpdated: DateTime.now(),
    );

    await _saveWallet();
    notifyListeners();

    debugPrint('💰 Added ৳${amount.toStringAsFixed(2)} as ${roleContextManager.currentRole.displayName}');
  }

  /// Withdraw money from wallet
  Future<bool> withdraw({
    required double amount,
    String? description,
  }) async {
    if (_wallet == null) {
      _error = 'Wallet not found';
      debugPrint('❌ Withdrawal failed: Wallet not found');
      notifyListeners();
      return false;
    }

    if (_wallet!.balance < amount) {
      _error = 'Insufficient balance: ৳${_wallet!.balance.toStringAsFixed(2)} < ৳${amount.toStringAsFixed(2)}';
      debugPrint('❌ Withdrawal failed: $_error');
      notifyListeners();
      return false;
    }

    final transaction = UnifiedTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: TransactionType.withdrawal,
      timestamp: DateTime.now(),
      performedByRole: roleContextManager.currentRole,
      description: description ?? 'Withdrawal',
      source: TransactionSource.manual,
    );

    final updatedTransactions = List<UnifiedTransaction>.from(_wallet!.transactions)
      ..add(transaction);

    _wallet = _wallet!.copyWith(
      balance: _wallet!.balance - amount,
      transactions: updatedTransactions,
      lastUpdated: DateTime.now(),
    );

    await _saveWallet();
    notifyListeners();

    debugPrint('💸 Withdrew ৳${amount.toStringAsFixed(2)} as ${roleContextManager.currentRole.displayName}');
    return true;
  }

  /// Pay for an order (Consumer role)
  Future<bool> payForOrder({
    required double amount,
    required String orderId,
  }) async {
    if (_wallet == null) {
      _error = 'Wallet not found';
      notifyListeners();
      return false;
    }

    if (_wallet!.balance < amount) {
      _error = 'Insufficient balance';
      notifyListeners();
      return false;
    }

    final transaction = UnifiedTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: TransactionType.orderPayment,
      timestamp: DateTime.now(),
      performedByRole: roleContextManager.currentRole,
      description: 'Payment for Order #$orderId',
      source: TransactionSource.order,
      sourceId: orderId,
    );

    final updatedTransactions = List<UnifiedTransaction>.from(_wallet!.transactions)
      ..add(transaction);

    _wallet = _wallet!.copyWith(
      balance: _wallet!.balance - amount,
      transactions: updatedTransactions,
      lastUpdated: DateTime.now(),
    );

    await _saveWallet();
    notifyListeners();

    debugPrint('🛒 Paid ৳${amount.toStringAsFixed(2)} for order $orderId');
    return true;
  }

  /// Receive earnings (Partner/Rider role)
  Future<void> receiveEarnings({
    required double amount,
    required String sourceId,
    required TransactionSource source,
    String? description,
  }) async {
    if (_wallet == null) return;

    final transaction = UnifiedTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: source == TransactionSource.delivery
          ? TransactionType.deliveryEarning
          : TransactionType.earning,
      timestamp: DateTime.now(),
      performedByRole: roleContextManager.currentRole,
      description: description ?? 'Earnings from $sourceId',
      source: source,
      sourceId: sourceId,
    );

    final updatedTransactions = List<UnifiedTransaction>.from(_wallet!.transactions)
      ..add(transaction);

    _wallet = _wallet!.copyWith(
      balance: _wallet!.balance + amount,
      transactions: updatedTransactions,
      lastUpdated: DateTime.now(),
    );

    await _saveWallet();
    notifyListeners();

    debugPrint('💵 Received ৳${amount.toStringAsFixed(2)} as ${roleContextManager.currentRole.displayName}');
  }

  /// Get recent transactions (optionally filtered by role)
  List<UnifiedTransaction> getRecentTransactions({
    int count = 50,
    UserRole? filterByRole,
  }) {
    if (_wallet == null) return [];

    var transactions = _wallet!.getRecentTransactions(count);
    
    if (filterByRole != null) {
      transactions = transactions.where((t) => t.performedByRole == filterByRole).toList();
    }

    return transactions;
  }

  /// Get transactions in date range
  List<UnifiedTransaction> getTransactionsInRange({
    required DateTime start,
    required DateTime end,
    UserRole? filterByRole,
  }) {
    if (_wallet == null) return [];

    var transactions = _wallet!.getTransactionsInRange(start, end);
    
    if (filterByRole != null) {
      transactions = transactions.where((t) => t.performedByRole == filterByRole).toList();
    }

    return transactions;
  }

  /// Force migration (for testing)
  @visibleForTesting
  Future<void> forceMigration() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('wallet_migrated', false);
    _isMigrated = false;
    await _loadWallet();
  }

  /// Reset wallet (for testing)
  @visibleForTesting
  Future<void> resetWallet() async {
    _initializeNewWallet();
    await _saveWallet();
    notifyListeners();
  }
}
