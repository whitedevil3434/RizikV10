import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/moneybag.dart';
import 'package:rizik_v4/data/models/user_role.dart';

/// Unified Wallet - One balance per user across all roles
/// Transactions track which role performed them for Khata OS integration
@immutable
class UnifiedWallet {
  final String id;
  final String userId;
  final double balance;
  final double lockedFunds; // NEW: For rent, escrow, etc.
  final String currency; // NEW: Currency code
  final bool isActive; // NEW: Wallet status
  final List<UnifiedTransaction> transactions;
  final DateTime createdAt;
  final DateTime lastUpdated;

  const UnifiedWallet({
    required this.id,
    required this.userId,
    required this.balance,
    this.lockedFunds = 0.0,
    this.currency = 'BDT',
    this.isActive = true,
    required this.transactions,
    required this.createdAt,
    required this.lastUpdated,
  });

  /// Get available balance (balance - locked funds)
  double get availableBalance => balance - lockedFunds;

  /// Get total deposits
  double get totalDeposits {
    return transactions
        .where((t) => t.type == TransactionType.deposit || t.type == TransactionType.earning)
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  /// Get total withdrawals
  double get totalWithdrawals {
    return transactions
        .where((t) => t.type == TransactionType.withdrawal || t.type == TransactionType.orderPayment)
        .fold(0.0, (sum, t) => sum + t.amount);
  }

  /// Get transactions for a specific role
  List<UnifiedTransaction> getTransactionsByRole(UserRole role) {
    return transactions.where((t) => t.performedByRole == role).toList();
  }

  /// Get balance earned/spent by each role
  Map<UserRole, double> getBalanceByRole() {
    final balances = <UserRole, double>{
      UserRole.consumer: 0.0,
      UserRole.partner: 0.0,
      UserRole.rider: 0.0,
    };

    for (final txn in transactions) {
      final role = txn.performedByRole;
      final isCredit = txn.type == TransactionType.deposit ||
          txn.type == TransactionType.earning ||
          txn.type == TransactionType.refund;

      if (isCredit) {
        balances[role] = (balances[role] ?? 0.0) + txn.amount;
      } else {
        balances[role] = (balances[role] ?? 0.0) - txn.amount;
      }
    }

    return balances;
  }

  /// Get transactions in date range
  List<UnifiedTransaction> getTransactionsInRange(DateTime start, DateTime end) {
    return transactions.where((t) {
      return t.timestamp.isAfter(start) && t.timestamp.isBefore(end);
    }).toList();
  }

  /// Get recent transactions
  List<UnifiedTransaction> getRecentTransactions(int count) {
    final sorted = List<UnifiedTransaction>.from(transactions)
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return sorted.take(count).toList();
  }

  UnifiedWallet copyWith({
    String? id,
    String? userId,
    double? balance,
    double? lockedFunds,
    String? currency,
    bool? isActive,
    List<UnifiedTransaction>? transactions,
    DateTime? createdAt,
    DateTime? lastUpdated,
  }) {
    return UnifiedWallet(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      balance: balance ?? this.balance,
      lockedFunds: lockedFunds ?? this.lockedFunds,
      currency: currency ?? this.currency,
      isActive: isActive ?? this.isActive,
      transactions: transactions ?? this.transactions,
      createdAt: createdAt ?? this.createdAt,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': 'personal', // NEW: Align with schema
      'owner_user_id': userId,
      'balance': balance,
      'locked_funds': lockedFunds,
      'currency': currency,
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
      'updated_at': lastUpdated.toIso8601String(),
    };
  }

  factory UnifiedWallet.fromJson(Map<String, dynamic> json) {
    return UnifiedWallet(
      id: json['id'] as String? ?? 'wallet_${DateTime.now().millisecondsSinceEpoch}',
      userId: json['owner_user_id'] as String? ?? 'unknown_user',
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
      lockedFunds: (json['locked_funds'] as num?)?.toDouble() ?? 0.0,
      currency: json['currency'] as String? ?? 'BDT',
      isActive: json['is_active'] as bool? ?? true,
      transactions: (json['transactions'] as List<dynamic>?)
              ?.map((t) => UnifiedTransaction.fromJson(t as Map<String, dynamic>))
              .toList() ??
          [],
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String) 
          : DateTime.now(),
      lastUpdated: json['updated_at'] != null 
          ? DateTime.parse(json['updated_at'] as String) 
          : (json['last_updated'] != null 
              ? DateTime.parse(json['last_updated'] as String) 
              : DateTime.now()),
    );
  }

  /// Create a new unified wallet
  factory UnifiedWallet.create({required String userId}) {
    final now = DateTime.now();
    return UnifiedWallet(
      id: 'unified_wallet_${now.millisecondsSinceEpoch}',
      userId: userId,
      balance: 0.0,
      transactions: [],
      createdAt: now,
      lastUpdated: now,
    );
  }

  /// Migrate from old 3-wallet system
  factory UnifiedWallet.fromLegacyMoneybags({
    required String userId,
    required Map<MoneybagType, Moneybag> moneybags,
  }) {
    final now = DateTime.now();
    double totalBalance = 0.0;
    final allTransactions = <UnifiedTransaction>[];

    // Merge balances and transactions from all wallets
    for (final entry in moneybags.entries) {
      final type = entry.key;
      final moneybag = entry.value;

      // Skip escrow wallet (platform-owned)
      if (type == MoneybagType.escrow) continue;

      totalBalance += moneybag.balance;

      // Convert old transactions to unified format
      for (final oldTxn in moneybag.transactions) {
        final role = _mapMoneybagTypeToRole(type);
        allTransactions.add(UnifiedTransaction.fromLegacy(oldTxn, role));
      }
    }

    // Sort transactions by timestamp
    allTransactions.sort((a, b) => a.timestamp.compareTo(b.timestamp));

    return UnifiedWallet(
      id: 'unified_wallet_${now.millisecondsSinceEpoch}',
      userId: userId,
      balance: totalBalance,
      transactions: allTransactions,
      createdAt: now,
      lastUpdated: now,
    );
  }

  /// Map old MoneybagType to UserRole
  static UserRole _mapMoneybagTypeToRole(MoneybagType type) {
    switch (type) {
      case MoneybagType.personal:
        return UserRole.consumer;
      case MoneybagType.partner:
        return UserRole.partner;
      case MoneybagType.rider:
        return UserRole.rider;
      case MoneybagType.escrow:
        return UserRole.consumer; // Default fallback
    }
  }
}

/// Unified transaction with role tracking
@immutable
class UnifiedTransaction {
  final String id;
  final double amount;
  final TransactionType type;
  final DateTime timestamp;
  final UserRole performedByRole; // NEW: Track which role made this transaction
  final String? reference;
  final String? description;
  final Map<String, dynamic>? metadata;

  // Source tracking
  final TransactionSource source;
  final String? sourceId;
  final String? sourceDescription;
  final String? khataEntryId;
  final String? counterpartyId;
  final String? counterpartyName;

  const UnifiedTransaction({
    required this.id,
    required this.amount,
    required this.type,
    required this.timestamp,
    required this.performedByRole,
    this.reference,
    this.description,
    this.metadata,
    this.source = TransactionSource.manual,
    this.sourceId,
    this.sourceDescription,
    this.khataEntryId,
    this.counterpartyId,
    this.counterpartyName,
  });

  String get formattedAmount => '৳${amount.toStringAsFixed(2)}';

  /// Check if transaction is a credit (money in)
  bool get isCredit {
    return type == TransactionType.deposit ||
        type == TransactionType.earning ||
        type == TransactionType.refund ||
        type == TransactionType.videoEarning ||
        type == TransactionType.deliveryEarning ||
        type == TransactionType.commission;
  }

  /// Check if transaction is a debit (money out)
  bool get isDebit => !isCredit;

  UnifiedTransaction copyWith({
    String? id,
    double? amount,
    TransactionType? type,
    DateTime? timestamp,
    UserRole? performedByRole,
    String? reference,
    String? description,
    Map<String, dynamic>? metadata,
    TransactionSource? source,
    String? sourceId,
    String? sourceDescription,
    String? khataEntryId,
    String? counterpartyId,
    String? counterpartyName,
  }) {
    return UnifiedTransaction(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      performedByRole: performedByRole ?? this.performedByRole,
      reference: reference ?? this.reference,
      description: description ?? this.description,
      metadata: metadata ?? this.metadata,
      source: source ?? this.source,
      sourceId: sourceId ?? this.sourceId,
      sourceDescription: sourceDescription ?? this.sourceDescription,
      khataEntryId: khataEntryId ?? this.khataEntryId,
      counterpartyId: counterpartyId ?? this.counterpartyId,
      counterpartyName: counterpartyName ?? this.counterpartyName,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'type': type.key,
      'timestamp': timestamp.toIso8601String(),
      'performed_by_role': performedByRole.name,
      'reference': reference,
      'description': description,
      'metadata': metadata,
      'source': source.key,
      'source_id': sourceId,
      'source_description': sourceDescription,
      'khata_entry_id': khataEntryId,
      'counterparty_id': counterpartyId,
      'counterparty_name': counterpartyName,
    };
  }

  factory UnifiedTransaction.fromJson(Map<String, dynamic> json) {
    return UnifiedTransaction(
      id: json['id'] as String? ?? 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      type: TransactionType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => TransactionType.deposit,
      ),
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp'] as String) 
          : DateTime.now(),
      performedByRole: UserRole.values.firstWhere(
        (r) => r.name == json['performed_by_role'],
        orElse: () => UserRole.consumer,
      ),
      reference: json['reference'] as String?,
      description: json['description'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      source: TransactionSource.values.firstWhere(
        (s) => s.key == json['source'],
        orElse: () => TransactionSource.manual,
      ),
      sourceId: json['source_id'] as String?,
      sourceDescription: json['source_description'] as String?,
      khataEntryId: json['khata_entry_id'] as String?,
      counterpartyId: json['counterparty_id'] as String?,
      counterpartyName: json['counterparty_name'] as String?,
    );
  }

  /// Convert legacy MoneybagTransaction to UnifiedTransaction
  factory UnifiedTransaction.fromLegacy(
    MoneybagTransaction legacy,
    UserRole performedByRole,
  ) {
    return UnifiedTransaction(
      id: legacy.id,
      amount: legacy.amount,
      type: legacy.type,
      timestamp: legacy.timestamp,
      performedByRole: performedByRole,
      reference: legacy.reference,
      description: legacy.description,
      metadata: legacy.metadata,
      source: legacy.source,
      sourceId: legacy.sourceId,
      sourceDescription: legacy.sourceDescription,
      khataEntryId: legacy.khataEntryId,
      counterpartyId: legacy.counterpartyId,
      counterpartyName: legacy.counterpartyName,
    );
  }
}
