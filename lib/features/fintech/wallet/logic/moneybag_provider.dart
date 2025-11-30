import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/moneybag.dart';

/// Provider for managing moneybags (3 wallets)
class MoneybagProvider with ChangeNotifier {
  Map<MoneybagType, Moneybag> _moneybags = {};
  List<AddMoneyRequest> _pendingRequests = [];
  bool _isLoading = false;
  String? _error;

  Map<MoneybagType, Moneybag> get moneybags => _moneybags;
  List<AddMoneyRequest> get pendingRequests => _pendingRequests;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Moneybag? get personalMoneybag => _moneybags[MoneybagType.personal];
  Moneybag? get partnerMoneybag => _moneybags[MoneybagType.partner];
  Moneybag? get riderMoneybag => _moneybags[MoneybagType.rider];
  Moneybag? get escrowMoneybag => _moneybags[MoneybagType.escrow];

  double get totalBalance {
    return _moneybags.values.fold(0.0, (sum, mb) => sum + mb.balance);
  }

  MoneybagProvider() {
    _loadMoneybags();
  }

  Future<void> _loadMoneybags() async {
    try {
      _isLoading = true;
      notifyListeners();

      final prefs = await SharedPreferences.getInstance();
      final moneybagsJson = prefs.getString('moneybags');

      if (moneybagsJson != null) {
        final Map<String, dynamic> moneybagsMap = jsonDecode(moneybagsJson);
        _moneybags = moneybagsMap.map(
          (key, value) => MapEntry(
            MoneybagType.values.firstWhere((t) => t.key == key),
            Moneybag.fromJson(value as Map<String, dynamic>),
          ),
        );
      } else {
        _initializeDefaultMoneybags();
      }

      _error = null;
    } catch (e) {
      _error = 'Failed to load moneybags: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void _initializeDefaultMoneybags() {
    const userId = 'default_user_001';
    
    // Create base moneybags
    _moneybags = {
      MoneybagType.personal: Moneybag.create(userId: userId, type: MoneybagType.personal),
      MoneybagType.partner: Moneybag.create(userId: userId, type: MoneybagType.partner),
      MoneybagType.rider: Moneybag.create(userId: userId, type: MoneybagType.rider),
      MoneybagType.escrow: Moneybag.create(userId: userId, type: MoneybagType.escrow),
    };
    
    // 💰 SYNC WITH UNIFIED WALLET - Load with ৳20,000
    // This keeps old payment flows working while we migrate to UnifiedWalletProvider
    final personalBag = _moneybags[MoneybagType.personal]!;
    final initialTransaction = MoneybagTransaction(
      id: 'txn_initial_${DateTime.now().millisecondsSinceEpoch}',
      amount: 20000.0,
      type: TransactionType.deposit,
      timestamp: DateTime.now(),
      description: 'Synced with unified wallet',
      source: TransactionSource.system,
      sourceId: 'unified_wallet_sync',
    );
    
    _moneybags[MoneybagType.personal] = personalBag.copyWith(
      balance: 20000.0,
      transactions: [initialTransaction],
      lastUpdated: DateTime.now(),
    );
    
    debugPrint('💰 Synced MoneybagProvider with unified wallet: ৳20,000 in Personal wallet');
    debugPrint('⚠️  Note: Payment flows still use MoneybagProvider (legacy)');
    debugPrint('✨ Unified wallet UI shows same balance with role tracking');
  }

 
 Future<void> _saveMoneybags() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final moneybagsMap = _moneybags.map((key, value) => MapEntry(key.key, value.toJson()));
      await prefs.setString('moneybags', jsonEncode(moneybagsMap));
    } catch (e) {
      debugPrint('Error saving moneybags: $e');
    }
  }

  Future<void> addMoney({
    required MoneybagType type,
    required double amount,
    String? reference,
  }) async {
    final moneybag = _moneybags[type];
    if (moneybag == null) return;

    final transaction = MoneybagTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: TransactionType.deposit,
      timestamp: DateTime.now(),
      reference: reference,
      description: 'Added money',
    );

    final updatedTransactions = List<MoneybagTransaction>.from(moneybag.transactions)..add(transaction);

    _moneybags[type] = moneybag.copyWith(
      balance: moneybag.balance + amount,
      transactions: updatedTransactions,
      lastUpdated: DateTime.now(),
    );

    await _saveMoneybags();
    notifyListeners();
  }

  Future<bool> withdraw({
    required MoneybagType type,
    required double amount,
    String? description,
  }) async {
    final moneybag = _moneybags[type];
    
    if (moneybag == null) {
      _error = 'Wallet not found';
      debugPrint('❌ Withdrawal failed: Wallet not found ($type)');
      notifyListeners();
      return false;
    }
    
    if (moneybag.balance < amount) {
      _error = 'Insufficient balance: ৳${moneybag.balance.toStringAsFixed(2)} < ৳${amount.toStringAsFixed(2)}';
      debugPrint('❌ Withdrawal failed: $_error');
      notifyListeners();
      return false;
    }

    final transaction = MoneybagTransaction(
      id: 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: amount,
      type: TransactionType.withdrawal,
      timestamp: DateTime.now(),
      description: description ?? 'Withdrawal',
    );

    final updatedTransactions = List<MoneybagTransaction>.from(moneybag.transactions)..add(transaction);

    _moneybags[type] = moneybag.copyWith(
      balance: moneybag.balance - amount,
      transactions: updatedTransactions,
      lastUpdated: DateTime.now(),
    );

    await _saveMoneybags();
    notifyListeners();
    return true;
  }

  Future<bool> transfer({
    required MoneybagType from,
    required MoneybagType to,
    required double amount,
    String? description,
  }) async {
    final fromBag = _moneybags[from];
    final toBag = _moneybags[to];

    if (fromBag == null || toBag == null) {
      _error = 'Wallet not found';
      debugPrint('❌ Transfer failed: Wallet not found (from: $from, to: $to)');
      notifyListeners();
      return false;
    }
    
    if (fromBag.balance < amount) {
      _error = 'Insufficient balance: ৳${fromBag.balance.toStringAsFixed(2)} < ৳${amount.toStringAsFixed(2)}';
      debugPrint('❌ Transfer failed: $_error');
      notifyListeners();
      return false;
    }

    final timestamp = DateTime.now();
    final txnId = 'txn_${timestamp.millisecondsSinceEpoch}';

    final fromTxn = MoneybagTransaction(
      id: '${txnId}_from',
      amount: amount,
      type: TransactionType.transfer,
      timestamp: timestamp,
      description: description ?? 'Transfer to ${to.nameBn}',
      fromMoneybag: from.key,
      toMoneybag: to.key,
    );

    final toTxn = MoneybagTransaction(
      id: '${txnId}_to',
      amount: amount,
      type: TransactionType.transfer,
      timestamp: timestamp,
      description: description ?? 'Transfer from ${from.nameBn}',
      fromMoneybag: from.key,
      toMoneybag: to.key,
    );

    _moneybags[from] = fromBag.copyWith(
      balance: fromBag.balance - amount,
      transactions: List.from(fromBag.transactions)..add(fromTxn),
      lastUpdated: timestamp,
    );

    _moneybags[to] = toBag.copyWith(
      balance: toBag.balance + amount,
      transactions: List.from(toBag.transactions)..add(toTxn),
      lastUpdated: timestamp,
    );

    await _saveMoneybags();
    notifyListeners();
    return true;
  }

  AddMoneyRequest createAddMoneyRequest({
    required MoneybagType type,
    required double amount,
  }) {
    final moneybag = _moneybags[type];
    if (moneybag == null) throw Exception('Moneybag not found');

    final request = AddMoneyRequest(
      id: 'req_${DateTime.now().millisecondsSinceEpoch}',
      userId: moneybag.userId,
      moneybagId: moneybag.id,
      amount: amount,
      referenceCode: AddMoneyRequest.generateReferenceCode(),
      status: AddMoneyStatus.pending,
      createdAt: DateTime.now(),
    );

    _pendingRequests.add(request);
    notifyListeners();
    return request;
  }

  /// Pay for an order using personal wallet (Transfer to Escrow)
  Future<bool> payForOrder({
    required double amount,
    required String orderId,
  }) async {
    // Use the transfer method to move funds from Personal to Escrow
    return await transfer(
      from: MoneybagType.personal,
      to: MoneybagType.escrow,
      amount: amount,
      description: 'Payment for Order #$orderId (Held in Escrow)',
    );
  }

  /// Distribute order payment from Escrow (Partner + Rider + Platform)
  Future<void> distributeOrderPayment({
    required String orderId,
    required double totalAmount,
    required double riderFee,
    required double platformFee,
    required double partnerAmount,
  }) async {
    final escrowBag = _moneybags[MoneybagType.escrow];
    if (escrowBag == null || escrowBag.balance < totalAmount) {
      debugPrint('⚠️ Insufficient funds in Escrow for distribution');
      return;
    }

    // 1. Transfer to Partner
    await transfer(
      from: MoneybagType.escrow,
      to: MoneybagType.partner,
      amount: partnerAmount,
      description: 'Order #$orderId Payout',
    );

    // 2. Transfer to Rider
    await transfer(
      from: MoneybagType.escrow,
      to: MoneybagType.rider,
      amount: riderFee,
      description: 'Order #$orderId Delivery Fee',
    );

    // 3. Platform Fee stays in Escrow (or could be moved to a system wallet)
    // For now, we'll just log it as revenue
    debugPrint('💰 Platform revenue collected: ৳$platformFee');
  }

  @visibleForTesting
  Future<void> resetMoneybags() async {
    _initializeDefaultMoneybags();
    await _saveMoneybags();
    notifyListeners();
  }
}
