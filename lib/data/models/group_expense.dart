import 'package:flutter/foundation.dart';

/// Split types for group expenses
enum SplitType {
  equal('equal', 'সমান ভাগ'),
  unequal('unequal', 'আলাদা পরিমাণ'),
  percentage('percentage', 'শতাংশ'),
  shares('shares', 'শেয়ার'),
  itemized('itemized', 'আইটেম অনুযায়ী');

  const SplitType(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

/// Expense categories
enum ExpenseCategory {
  food('food', 'খাবার', '🍽️'),
  rent('rent', 'ভাড়া', '🏠'),
  utilities('utilities', 'ইউটিলিটি', '⚡'),
  groceries('groceries', 'মুদি', '🛒'),
  transport('transport', 'যাতায়াত', '🚗'),
  entertainment('entertainment', 'বিনোদন', '🎬'),
  shopping('shopping', 'কেনাকাটা', '🛍️'),
  healthcare('healthcare', 'স্বাস্থ্য', '⚕️'),
  education('education', 'শিক্ষা', '📚'),
  bills('bills', 'বিল', '📱'),
  travel('travel', 'ভ্রমণ', '✈️'),
  gifts('gifts', 'উপহার', '🎁'),
  maintenance('maintenance', 'রক্ষণাবেক্ষণ', '🔧'),
  settlement('settlement', 'পেমেন্ট', '💰'),
  other('other', 'অন্যান্য', '📝');

  const ExpenseCategory(this.key, this.nameBn, this.emoji);
  final String key;
  final String nameBn;
  final String emoji;
}

/// Expense status
enum ExpenseStatus {
  active('active', 'সক্রিয়'),
  settled('settled', 'নিষ্পত্তি'),
  partial('partial', 'আংশিক'),
  cancelled('cancelled', 'বাতিল');

  const ExpenseStatus(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

/// Item in an itemized expense
@immutable
class ExpenseItem {
  final String name;
  final double price;
  final int quantity;
  final List<String> sharedBy; // User IDs

  const ExpenseItem({
    required this.name,
    required this.price,
    this.quantity = 1,
    required this.sharedBy,
  });

  double get totalPrice => price * quantity;

  Map<String, dynamic> toJson() => {
        'name': name,
        'price': price,
        'quantity': quantity,
        'shared_by': sharedBy,
      };

  factory ExpenseItem.fromJson(Map<String, dynamic> json) => ExpenseItem(
        name: json['name'] as String,
        price: (json['price'] as num).toDouble(),
        quantity: json['quantity'] as int? ?? 1,
        sharedBy: List<String>.from(json['shared_by'] as List),
      );
}


/// Group Expense - a bill split among group members
@immutable
class GroupExpense {
  final String id;
  final String groupId;
  final String description;
  final double totalAmount;
  final String paidBy; // User ID
  final String paidByName;
  final DateTime date;
  final ExpenseCategory category;
  final SplitType splitType;
  final Map<String, double> splits; // userId → amount owed
  final List<ExpenseItem>? items; // For itemized bills
  final String? receipt;
  final String? notes;
  final bool isRecurring;
  final String? recurringId;
  final ExpenseStatus status;

  const GroupExpense({
    required this.id,
    required this.groupId,
    required this.description,
    required this.totalAmount,
    required this.paidBy,
    required this.paidByName,
    required this.date,
    required this.category,
    required this.splitType,
    required this.splits,
    this.items,
    this.receipt,
    this.notes,
    this.isRecurring = false,
    this.recurringId,
    this.status = ExpenseStatus.active,
  });

  GroupExpense copyWith({
    String? id,
    String? groupId,
    String? description,
    double? totalAmount,
    String? paidBy,
    String? paidByName,
    DateTime? date,
    ExpenseCategory? category,
    SplitType? splitType,
    Map<String, double>? splits,
    List<ExpenseItem>? items,
    String? receipt,
    String? notes,
    bool? isRecurring,
    String? recurringId,
    ExpenseStatus? status,
  }) {
    return GroupExpense(
      id: id ?? this.id,
      groupId: groupId ?? this.groupId,
      description: description ?? this.description,
      totalAmount: totalAmount ?? this.totalAmount,
      paidBy: paidBy ?? this.paidBy,
      paidByName: paidByName ?? this.paidByName,
      date: date ?? this.date,
      category: category ?? this.category,
      splitType: splitType ?? this.splitType,
      splits: splits ?? this.splits,
      items: items ?? this.items,
      receipt: receipt ?? this.receipt,
      notes: notes ?? this.notes,
      isRecurring: isRecurring ?? this.isRecurring,
      recurringId: recurringId ?? this.recurringId,
      status: status ?? this.status,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'group_id': groupId,
        'description': description,
        'total_amount': totalAmount,
        'paid_by': paidBy,
        'paid_by_name': paidByName,
        'date': date.toIso8601String(),
        'category': category.key,
        'split_type': splitType.key,
        'splits': splits,
        'items': items?.map((i) => i.toJson()).toList(),
        'receipt': receipt,
        'notes': notes,
        'is_recurring': isRecurring,
        'recurring_id': recurringId,
        'status': status.key,
      };

  factory GroupExpense.fromJson(Map<String, dynamic> json) => GroupExpense(
        id: json['id'] as String,
        groupId: json['group_id'] as String,
        description: json['description'] as String,
        totalAmount: (json['total_amount'] as num).toDouble(),
        paidBy: json['paid_by'] as String,
        paidByName: json['paid_by_name'] as String,
        date: DateTime.parse(json['date'] as String),
        category: ExpenseCategory.values.firstWhere(
          (c) => c.key == json['category'],
          orElse: () => ExpenseCategory.other,
        ),
        splitType: SplitType.values.firstWhere(
          (s) => s.key == json['split_type'],
          orElse: () => SplitType.equal,
        ),
        splits: Map<String, double>.from(json['splits'] as Map),
        items: json['items'] != null
            ? (json['items'] as List<dynamic>)
                .map((i) => ExpenseItem.fromJson(i as Map<String, dynamic>))
                .toList()
            : null,
        receipt: json['receipt'] as String?,
        notes: json['notes'] as String?,
        isRecurring: json['is_recurring'] as bool? ?? false,
        recurringId: json['recurring_id'] as String?,
        status: ExpenseStatus.values.firstWhere(
          (s) => s.key == json['status'],
          orElse: () => ExpenseStatus.active,
        ),
      );

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is GroupExpense && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
