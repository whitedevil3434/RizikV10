import 'package:rizik_v4/data/models/khata.dart';

/// Scope of the khata entry (Mess vs Business)
enum KhataEntryScope {
  mess('mess', 'মেস'),
  business('business', 'ব্যবসা');

  const KhataEntryScope(this.key, this.nameBn);

  final String key;
  final String nameBn;
}

/// Social transaction types
enum SocialTransactionType {
  lent('lent', 'ধার দিয়েছি'),
  borrowed('borrowed', 'ধার নিয়েছি'),
  split('split', 'ভাগ করেছি'),
  paidBack('paid_back', 'ফেরত দিয়েছি'),
  received('received', 'ফেরত পেয়েছি');

  const SocialTransactionType(this.key, this.nameBn);
  
  final String key;
  final String nameBn;
}

/// Khata Entry Data Model
class KhataEntry {
  final String id;
  final String date;
  final String description;
  final String amount;
  final bool isCredit;
  final bool isChecked;
  final DateTime timestamp;
  final KhataCategory? category;
  final String? receipt; // Path to receipt image
  final bool isLocked; // For committed expenses (rent, utilities)
  final String? notes;
  final Map<String, dynamic>? metadata;
  
  // NEW: Squad System fields
  final KhataEntryScope? scope; // mess vs business
  final String? squadId;
  final String? userId; // Who incurred this expense
  final String? transactionId; // Link to wallet transaction

  // NEW: Social transaction fields
  final bool isSocialTransaction;
  final String? linkedPersonId;
  final String? linkedPersonName;
  final SocialTransactionType? socialType;
  final String? linkedEntryId; // For linking settlement entries

  KhataEntry({
    String? id,
    required this.date,
    required this.description,
    required this.amount,
    required this.isCredit,
    this.isChecked = false,
    DateTime? timestamp,
    this.category,
    this.receipt,
    this.isLocked = false,
    this.notes,
    this.metadata,
    this.scope,
    this.squadId,
    this.userId,
    this.transactionId,
    this.isSocialTransaction = false,
    this.linkedPersonId,
    this.linkedPersonName,
    this.socialType,
    this.linkedEntryId,
  })  : id = id ?? 'entry_${DateTime.now().millisecondsSinceEpoch}_${date.hashCode}',
        timestamp = timestamp ?? DateTime.now();

  // Legacy constructor for backward compatibility
  const KhataEntry._internal({
    required this.id,
    required this.date,
    required this.description,
    required this.amount,
    required this.isCredit,
    required this.isChecked,
    required this.timestamp,
    this.category,
    this.receipt,
    required this.isLocked,
    this.notes,
    this.metadata,
    this.scope,
    this.squadId,
    this.userId,
    this.transactionId,
    this.isSocialTransaction = false,
    this.linkedPersonId,
    this.linkedPersonName,
    this.socialType,
    this.linkedEntryId,
  });

  /// Get numeric value of amount
  double get amountValue {
    return double.tryParse(amount.replaceAll(RegExp(r'[^0-9.]'), '')) ?? 0.0;
  }

  /// Get formatted amount with currency
  String get formattedAmount {
    return '৳$amount';
  }

  KhataEntry copyWith({
    String? id,
    String? date,
    String? description,
    String? amount,
    bool? isCredit,
    bool? isChecked,
    DateTime? timestamp,
    KhataCategory? category,
    String? receipt,
    bool? isLocked,
    String? notes,
    Map<String, dynamic>? metadata,
    KhataEntryScope? scope,
    String? squadId,
    String? userId,
    String? transactionId,
    bool? isSocialTransaction,
    String? linkedPersonId,
    String? linkedPersonName,
    SocialTransactionType? socialType,
    String? linkedEntryId,
  }) {
    return KhataEntry(
      id: id ?? this.id,
      date: date ?? this.date,
      description: description ?? this.description,
      amount: amount ?? this.amount,
      isCredit: isCredit ?? this.isCredit,
      isChecked: isChecked ?? this.isChecked,
      timestamp: timestamp ?? this.timestamp,
      category: category ?? this.category,
      receipt: receipt ?? this.receipt,
      isLocked: isLocked ?? this.isLocked,
      notes: notes ?? this.notes,
      metadata: metadata ?? this.metadata,
      scope: scope ?? this.scope,
      squadId: squadId ?? this.squadId,
      userId: userId ?? this.userId,
      transactionId: transactionId ?? this.transactionId,
      isSocialTransaction: isSocialTransaction ?? this.isSocialTransaction,
      linkedPersonId: linkedPersonId ?? this.linkedPersonId,
      linkedPersonName: linkedPersonName ?? this.linkedPersonName,
      socialType: socialType ?? this.socialType,
      linkedEntryId: linkedEntryId ?? this.linkedEntryId,
    );
  }

  /// Convert to JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'date': date,
      'description': description,
      'amount': amount,
      'isCredit': isCredit,
      'isChecked': isChecked,
      'timestamp': timestamp.toIso8601String(),
      'category': category?.key,
      'receipt': receipt,
      'isLocked': isLocked,
      'notes': notes,
      'metadata': metadata,
      'scope': scope?.key,
      'squad_id': squadId,
      'user_id': userId,
      'transaction_id': transactionId,
      'isSocialTransaction': isSocialTransaction,
      'linkedPersonId': linkedPersonId,
      'linkedPersonName': linkedPersonName,
      'socialType': socialType?.key,
      'linkedEntryId': linkedEntryId,
    };
  }

  /// Create from JSON
  factory KhataEntry.fromJson(Map<String, dynamic> json) {
    return KhataEntry(
      id: json['id'] as String,
      date: json['date'] as String,
      description: json['description'] as String,
      amount: json['amount'] as String,
      isCredit: json['isCredit'] as bool,
      isChecked: json['isChecked'] as bool? ?? false,
      timestamp: DateTime.parse(json['timestamp'] as String),
      category: json['category'] != null
          ? KhataCategory.values.firstWhere(
              (c) => c.key == json['category'],
              orElse: () => KhataCategory.other,
            )
          : null,
      receipt: json['receipt'] as String?,
      isLocked: json['isLocked'] as bool? ?? false,
      notes: json['notes'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
      scope: json['scope'] != null
          ? KhataEntryScope.values.firstWhere(
              (s) => s.key == json['scope'],
              orElse: () => KhataEntryScope.mess,
            )
          : null,
      squadId: json['squad_id'] as String?,
      userId: json['user_id'] as String?,
      transactionId: json['transaction_id'] as String?,
      isSocialTransaction: json['isSocialTransaction'] as bool? ?? false,
      linkedPersonId: json['linkedPersonId'] as String?,
      linkedPersonName: json['linkedPersonName'] as String?,
      socialType: json['socialType'] != null
          ? SocialTransactionType.values.firstWhere(
              (t) => t.key == json['socialType'],
              orElse: () => SocialTransactionType.lent,
            )
          : null,
      linkedEntryId: json['linkedEntryId'] as String?,
    );
  }

  /// Create a new expense entry
  factory KhataEntry.expense({
    required String description,
    required double amount,
    required KhataCategory category,
    String? receipt,
    String? notes,
    bool isLocked = false,
    KhataEntryScope? scope,
    String? squadId,
    String? userId,
  }) {
    final now = DateTime.now();
    return KhataEntry(
      id: 'entry_${now.millisecondsSinceEpoch}',
      date: '${now.day}/${now.month}/${now.year}',
      description: description,
      amount: amount.toStringAsFixed(2),
      isCredit: false,
      timestamp: now,
      category: category,
      receipt: receipt,
      notes: notes,
      isLocked: isLocked,
      scope: scope,
      squadId: squadId,
      userId: userId,
    );
  }

  /// Create a new income entry
  factory KhataEntry.income({
    required String description,
    required double amount,
    String? notes,
    KhataEntryScope? scope,
    String? squadId,
    String? userId,
  }) {
    final now = DateTime.now();
    return KhataEntry(
      id: 'entry_${now.millisecondsSinceEpoch}',
      date: '${now.day}/${now.month}/${now.year}',
      description: description,
      amount: amount.toStringAsFixed(2),
      isCredit: true,
      timestamp: now,
      notes: notes,
      scope: scope,
      squadId: squadId,
      userId: userId,
    );
  }
}
