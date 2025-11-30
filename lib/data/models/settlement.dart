import 'package:flutter/foundation.dart';

/// Settlement status
enum SettlementStatus {
  pending('pending', 'অপেক্ষমাণ'),
  requested('requested', 'অনুরোধ করা হয়েছে'),
  paid('paid', 'পরিশোধিত'),
  confirmed('confirmed', 'নিশ্চিত'),
  disputed('disputed', 'বিতর্কিত');

  const SettlementStatus(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

/// Settlement - represents a payment between two people
@immutable
class Settlement {
  final String id;
  final String groupId;
  final String from; // User ID who owes
  final String fromName;
  final String to; // User ID who is owed
  final String toName;
  final double amount;
  final DateTime createdAt;
  final SettlementStatus status;
  final DateTime? settledAt;
  final String? paymentMethod;
  final String? transactionId;
  final List<String> expenseIds; // Which expenses this settles

  const Settlement({
    required this.id,
    required this.groupId,
    required this.from,
    required this.fromName,
    required this.to,
    required this.toName,
    required this.amount,
    required this.createdAt,
    this.status = SettlementStatus.pending,
    this.settledAt,
    this.paymentMethod,
    this.transactionId,
    required this.expenseIds,
  });

  Settlement copyWith({
    String? id,
    String? groupId,
    String? from,
    String? fromName,
    String? to,
    String? toName,
    double? amount,
    DateTime? createdAt,
    SettlementStatus? status,
    DateTime? settledAt,
    String? paymentMethod,
    String? transactionId,
    List<String>? expenseIds,
  }) {
    return Settlement(
      id: id ?? this.id,
      groupId: groupId ?? this.groupId,
      from: from ?? this.from,
      fromName: fromName ?? this.fromName,
      to: to ?? this.to,
      toName: toName ?? this.toName,
      amount: amount ?? this.amount,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      settledAt: settledAt ?? this.settledAt,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      transactionId: transactionId ?? this.transactionId,
      expenseIds: expenseIds ?? this.expenseIds,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'group_id': groupId,
        'from': from,
        'from_name': fromName,
        'to': to,
        'to_name': toName,
        'amount': amount,
        'created_at': createdAt.toIso8601String(),
        'status': status.key,
        'settled_at': settledAt?.toIso8601String(),
        'payment_method': paymentMethod,
        'transaction_id': transactionId,
        'expense_ids': expenseIds,
      };

  factory Settlement.fromJson(Map<String, dynamic> json) => Settlement(
        id: json['id'] as String,
        groupId: json['group_id'] as String,
        from: json['from'] as String,
        fromName: json['from_name'] as String,
        to: json['to'] as String,
        toName: json['to_name'] as String,
        amount: (json['amount'] as num).toDouble(),
        createdAt: DateTime.parse(json['created_at'] as String),
        status: SettlementStatus.values.firstWhere(
          (s) => s.key == json['status'],
          orElse: () => SettlementStatus.pending,
        ),
        settledAt: json['settled_at'] != null
            ? DateTime.parse(json['settled_at'] as String)
            : null,
        paymentMethod: json['payment_method'] as String?,
        transactionId: json['transaction_id'] as String?,
        expenseIds: List<String>.from(json['expense_ids'] as List),
      );

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Settlement && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
