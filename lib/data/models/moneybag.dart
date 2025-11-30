import 'package:flutter/foundation.dart';

/// Types of moneybags (wallets)
enum MoneybagType {
  personal('personal', 'ব্যক্তিগত'),
  partner('partner', 'পার্টনার'),
  rider('rider', 'রাইডার'),
  escrow('escrow', 'এসক্রো');

  const MoneybagType(this.key, this.nameBn);
  
  final String key;
  final String nameBn;

  String get displayName {
    switch (this) {
      case MoneybagType.personal:
        return 'Rizik Seeker';
      case MoneybagType.partner:
        return 'Rizik Source';
      case MoneybagType.rider:
        return 'Rizik Force';
      case MoneybagType.escrow:
        return 'Escrow';
    }
  }
}

/// Transaction types
enum TransactionType {
  deposit('deposit', 'জমা', '💰'),
  withdrawal('withdrawal', 'উত্তোলন', '💸'),
  transfer('transfer', 'স্থানান্তর', '🔄'),
  orderPayment('order_payment', 'অর্ডার পেমেন্ট', '🛒'),
  earning('earning', 'আয়', '💵'),
  refund('refund', 'ফেরত', '↩️'),
  fee('fee', 'ফি', '📋'),
  videoEarning('video_earning', 'ভিডিও আয়', '🎥'),
  commission('commission', 'কমিশন', '💸'),
  bidPayment('bid_payment', 'বিড পেমেন্ট', '🤝'),
  deliveryEarning('delivery_earning', 'ডেলিভারি আয়', '🚴'),
  squadPayment('squad_payment', 'স্কোয়াড পেমেন্ট', '👥');

  const TransactionType(this.key, this.nameBn, this.emoji);
  
  final String key;
  final String nameBn;
  final String emoji;
}

/// Transaction source - where the transaction originated
enum TransactionSource {
  manual('manual', 'Manual'),
  order('order', 'Order'),
  video('video', 'Video'),
  bid('bid', 'Bid/Haggle'),
  delivery('delivery', 'Delivery'),
  commission('commission', 'Commission'),
  squad('squad', 'Squad'),
  khata('khata', 'Khata OS'),
  system('system', 'System'),
  damKomao('dam_komao', 'Dam Komao'),
  surpriseCoupon('surprise_coupon', 'Surprise Coupon'),
  viralBonus('viral_bonus', 'Viral Bonus'),
  dhaarLoan('dhaar_loan', 'Rizik Dhaar Loan'),
  dhaarRepayment('dhaar_repayment', 'Rizik Dhaar Repayment'),
  moverFloat('mover_float', 'Mover Float'),
  refund('refund', 'Refund');

  const TransactionSource(this.key, this.label);
  
  final String key;
  final String label;
}

/// Moneybag transaction model
@immutable
class MoneybagTransaction {
  final String id;
  final double amount;
  final TransactionType type;
  final DateTime timestamp;
  final String? reference; // Order ID, transfer ID, etc.
  final String? description;
  final String? fromMoneybag; // For transfers
  final String? toMoneybag; // For transfers
  final Map<String, dynamic>? metadata;
  
  // NEW: Source tracking for Bazar Tab integration
  final TransactionSource source;
  final String? sourceId; // ID of the source (orderId, videoId, bidId, etc.)
  final String? sourceDescription; // Human-readable source description
  final String? khataEntryId; // Linked Khata OS entry for dual-write
  final String? counterpartyId; // Other party in transaction
  final String? counterpartyName; // Other party name
  final MoneybagType? counterpartyWallet; // Other party wallet type

  const MoneybagTransaction({
    required this.id,
    required this.amount,
    required this.type,
    required this.timestamp,
    this.reference,
    this.description,
    this.fromMoneybag,
    this.toMoneybag,
    this.metadata,
    this.source = TransactionSource.manual,
    this.sourceId,
    this.sourceDescription,
    this.khataEntryId,
    this.counterpartyId,
    this.counterpartyName,
    this.counterpartyWallet,
  });

  String get formattedAmount => '৳${amount.toStringAsFixed(2)}';

  MoneybagTransaction copyWith({
    String? id,
    double? amount,
    TransactionType? type,
    DateTime? timestamp,
    String? reference,
    String? description,
    String? fromMoneybag,
    String? toMoneybag,
    Map<String, dynamic>? metadata,
    TransactionSource? source,
    String? sourceId,
    String? sourceDescription,
    String? khataEntryId,
    String? counterpartyId,
    String? counterpartyName,
    MoneybagType? counterpartyWallet,
  }) {
    return MoneybagTransaction(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      type: type ?? this.type,
      timestamp: timestamp ?? this.timestamp,
      reference: reference ?? this.reference,
      description: description ?? this.description,
      fromMoneybag: fromMoneybag ?? this.fromMoneybag,
      toMoneybag: toMoneybag ?? this.toMoneybag,
      metadata: metadata ?? this.metadata,
      source: source ?? this.source,
      sourceId: sourceId ?? this.sourceId,
      sourceDescription: sourceDescription ?? this.sourceDescription,
      khataEntryId: khataEntryId ?? this.khataEntryId,
      counterpartyId: counterpartyId ?? this.counterpartyId,
      counterpartyName: counterpartyName ?? this.counterpartyName,
      counterpartyWallet: counterpartyWallet ?? this.counterpartyWallet,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'type': type.key,
      'timestamp': timestamp.toIso8601String(),
      'reference': reference,
      'description': description,
      'from_moneybag': fromMoneybag,
      'to_moneybag': toMoneybag,
      'metadata': metadata,
    };
  }

  factory MoneybagTransaction.fromJson(Map<String, dynamic> json) {
    return MoneybagTransaction(
      id: json['id'] as String? ?? 'txn_${DateTime.now().millisecondsSinceEpoch}',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      type: TransactionType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => TransactionType.deposit,
      ),
      timestamp: json['timestamp'] != null 
          ? DateTime.parse(json['timestamp'] as String) 
          : DateTime.now(),
      reference: json['reference'] as String?,
      description: json['description'] as String?,
      fromMoneybag: json['from_moneybag'] as String?,
      toMoneybag: json['to_moneybag'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );
  }
}

/// Main Moneybag (Wallet) model
@immutable
class Moneybag {
  final String id;
  final String userId;
  final MoneybagType type;
  final double balance;
  final List<MoneybagTransaction> transactions;
  final DateTime createdAt;
  final DateTime lastUpdated;

  const Moneybag({
    required this.id,
    required this.userId,
    required this.type,
    required this.balance,
    required this.transactions,
    required this.createdAt,
    required this.lastUpdated,
  });

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

  /// Get transactions for a date range
  List<MoneybagTransaction> getTransactionsInRange(DateTime start, DateTime end) {
    return transactions.where((t) {
      return t.timestamp.isAfter(start) && t.timestamp.isBefore(end);
    }).toList();
  }

  /// Get recent transactions (last N)
  List<MoneybagTransaction> getRecentTransactions(int count) {
    final sorted = List<MoneybagTransaction>.from(transactions)
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return sorted.take(count).toList();
  }

  Moneybag copyWith({
    String? id,
    String? userId,
    MoneybagType? type,
    double? balance,
    List<MoneybagTransaction>? transactions,
    DateTime? createdAt,
    DateTime? lastUpdated,
  }) {
    return Moneybag(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      balance: balance ?? this.balance,
      transactions: transactions ?? this.transactions,
      createdAt: createdAt ?? this.createdAt,
      lastUpdated: lastUpdated ?? this.lastUpdated,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type.key,
      'balance': balance,
      'transactions': transactions.map((t) => t.toJson()).toList(),
      'created_at': createdAt.toIso8601String(),
      'last_updated': lastUpdated.toIso8601String(),
    };
  }

  factory Moneybag.fromJson(Map<String, dynamic> json) {
    return Moneybag(
      id: json['id'] as String? ?? 'moneybag_${DateTime.now().millisecondsSinceEpoch}',
      userId: json['user_id'] as String? ?? 'unknown_user',
      type: MoneybagType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => MoneybagType.personal,
      ),
      balance: (json['balance'] as num?)?.toDouble() ?? 0.0,
      transactions: (json['transactions'] as List<dynamic>?)
              ?.map((t) => MoneybagTransaction.fromJson(t as Map<String, dynamic>))
              .toList() ??
          [],
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String) 
          : DateTime.now(),
      lastUpdated: json['last_updated'] != null 
          ? DateTime.parse(json['last_updated'] as String) 
          : DateTime.now(),
    );
  }

  /// Create a new moneybag
  factory Moneybag.create({
    required String userId,
    required MoneybagType type,
  }) {
    final now = DateTime.now();
    return Moneybag(
      id: 'moneybag_${type.key}_${now.millisecondsSinceEpoch}',
      userId: userId,
      type: type,
      balance: 0.0,
      transactions: [],
      createdAt: now,
      lastUpdated: now,
    );
  }
}

/// Pending add money request (for manual banking)
class AddMoneyRequest {
  final String id;
  final String userId;
  final String moneybagId;
  final double amount;
  final String referenceCode; // e.g., RZK-901
  final AddMoneyStatus status;
  final DateTime createdAt;
  final DateTime? approvedAt;
  final String? approvedBy;
  final String? paymentMethod; // bKash, Nagad, etc.
  final String? transactionId; // From payment provider

  const AddMoneyRequest({
    required this.id,
    required this.userId,
    required this.moneybagId,
    required this.amount,
    required this.referenceCode,
    required this.status,
    required this.createdAt,
    this.approvedAt,
    this.approvedBy,
    this.paymentMethod,
    this.transactionId,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'moneybag_id': moneybagId,
      'amount': amount,
      'reference_code': referenceCode,
      'status': status.name,
      'created_at': createdAt.toIso8601String(),
      'approved_at': approvedAt?.toIso8601String(),
      'approved_by': approvedBy,
      'payment_method': paymentMethod,
      'transaction_id': transactionId,
    };
  }

  factory AddMoneyRequest.fromJson(Map<String, dynamic> json) {
    return AddMoneyRequest(
      id: json['id'] as String? ?? 'req_${DateTime.now().millisecondsSinceEpoch}',
      userId: json['user_id'] as String? ?? 'unknown_user',
      moneybagId: json['moneybag_id'] as String? ?? 'unknown_wallet',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      referenceCode: json['reference_code'] as String? ?? 'RZK-0000',
      status: AddMoneyStatus.values.firstWhere(
        (s) => s.name == json['status'],
        orElse: () => AddMoneyStatus.pending,
      ),
      createdAt: json['created_at'] != null 
          ? DateTime.parse(json['created_at'] as String) 
          : DateTime.now(),
      approvedAt: json['approved_at'] != null
          ? DateTime.parse(json['approved_at'] as String)
          : null,
      approvedBy: json['approved_by'] as String?,
      paymentMethod: json['payment_method'] as String?,
      transactionId: json['transaction_id'] as String?,
    );
  }

  /// Generate reference code
  static String generateReferenceCode() {
    final timestamp = DateTime.now().millisecondsSinceEpoch;
    final code = (timestamp % 10000).toString().padLeft(4, '0');
    return 'RZK-$code';
  }
}

/// Add money request status
enum AddMoneyStatus {
  pending,
  approved,
  rejected,
}
