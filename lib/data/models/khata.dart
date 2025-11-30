import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/khata_entry.dart';

/// Types of khata ledgers
enum KhataType {
  personal('personal', 'ব্যক্তিগত'),
  shared('shared', 'শেয়ারড'),
  squad('squad', 'স্কোয়াড'),
  rent('rent', 'ভাড়া');

  const KhataType(this.key, this.nameBn);
  
  final String key;
  final String nameBn;
}

/// Categories for expense tracking
enum KhataCategory {
  food('food', 'খাবার', '🍽️'),
  groceries('groceries', 'মুদি', '🛒'),
  utilities('utilities', 'ইউটিলিটি', '💡'),
  rent('rent', 'ভাড়া', '🏠'),
  transport('transport', 'যাতায়াত', '🚗'),
  entertainment('entertainment', 'বিনোদন', '🎬'),
  health('health', 'স্বাস্থ্য', '⚕️'),
  education('education', 'শিক্ষা', '📚'),
  shopping('shopping', 'কেনাকাটা', '🛍️'),
  savings('savings', 'সঞ্চয়', '💰'),
  other('other', 'অন্যান্য', '📝');

  const KhataCategory(this.key, this.nameBn, this.emoji);
  
  final String key;
  final String nameBn;
  final String emoji;
}

/// Main Khata (Ledger) model
@immutable
class Khata {
  final String id;
  final String userId;
  final KhataType type;
  final String name;
  final String nameBn;
  final List<KhataEntry> entries;
  final double balance;
  final DateTime createdAt;
  final DateTime lastUpdated;
  final Map<String, dynamic>? metadata; // For additional data like squad members, rent details
  final List<String>? shoppingListIds; // Shopping list IDs

  const Khata({
    required this.id,
    required this.userId,
    required this.type,
    required this.name,
    required this.nameBn,
    required this.entries,
    required this.balance,
    required this.createdAt,
    required this.lastUpdated,
    this.metadata,
    this.shoppingListIds,
  });

  /// Calculate total income
  double get totalIncome {
    return entries
        .where((entry) => entry.isCredit)
        .fold(0.0, (sum, entry) => sum + entry.amountValue);
  }

  /// Calculate total expenses
  double get totalExpenses {
    return entries
        .where((entry) => !entry.isCredit)
        .fold(0.0, (sum, entry) => sum + entry.amountValue);
  }

  /// Get entries by category
  List<KhataEntry> getEntriesByCategory(KhataCategory category) {
    return entries.where((entry) => entry.category == category).toList();
  }

  /// Get entries for a specific date range
  List<KhataEntry> getEntriesInRange(DateTime start, DateTime end) {
    return entries.where((entry) {
      final entryDate = entry.timestamp;
      return entryDate.isAfter(start) && entryDate.isBefore(end);
    }).toList();
  }

  /// Get entries for current month
  List<KhataEntry> get currentMonthEntries {
    final now = DateTime.now();
    final startOfMonth = DateTime(now.year, now.month, 1);
    final endOfMonth = DateTime(now.year, now.month + 1, 0, 23, 59, 59);
    return getEntriesInRange(startOfMonth, endOfMonth);
  }

  /// Calculate expenses by category for current month
  Map<KhataCategory, double> get monthlyExpensesByCategory {
    final monthEntries = currentMonthEntries;
    final Map<KhataCategory, double> categoryTotals = {};

    for (final entry in monthEntries) {
      if (!entry.isCredit && entry.category != null) {
        categoryTotals[entry.category!] = 
            (categoryTotals[entry.category!] ?? 0.0) + entry.amountValue;
      }
    }

    return categoryTotals;
  }

  Khata copyWith({
    String? id,
    String? userId,
    KhataType? type,
    String? name,
    String? nameBn,
    List<KhataEntry>? entries,
    double? balance,
    DateTime? createdAt,
    DateTime? lastUpdated,
    Map<String, dynamic>? metadata,
    List<String>? shoppingListIds,
  }) {
    return Khata(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      type: type ?? this.type,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      entries: entries ?? this.entries,
      balance: balance ?? this.balance,
      createdAt: createdAt ?? this.createdAt,
      lastUpdated: lastUpdated ?? this.lastUpdated,
      metadata: metadata ?? this.metadata,
      shoppingListIds: shoppingListIds ?? this.shoppingListIds,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'type': type.key,
      'name': name,
      'name_bn': nameBn,
      'entries': entries.map((entry) => entry.toJson()).toList(),
      'balance': balance,
      'created_at': createdAt.toIso8601String(),
      'last_updated': lastUpdated.toIso8601String(),
      'metadata': metadata,
      'shopping_list_ids': shoppingListIds,
    };
  }

  factory Khata.fromJson(Map<String, dynamic> json) {
    return Khata(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      type: KhataType.values.firstWhere(
        (t) => t.key == json['type'],
        orElse: () => KhataType.personal,
      ),
      name: json['name'] as String,
      nameBn: json['name_bn'] as String,
      entries: (json['entries'] as List<dynamic>)
          .map((e) => KhataEntry.fromJson(e as Map<String, dynamic>))
          .toList(),
      balance: (json['balance'] as num).toDouble(),
      createdAt: DateTime.parse(json['created_at'] as String),
      lastUpdated: DateTime.parse(json['last_updated'] as String),
      metadata: json['metadata'] as Map<String, dynamic>?,
      shoppingListIds: json['shopping_list_ids'] != null
          ? List<String>.from(json['shopping_list_ids'] as List)
          : null,
    );
  }

  /// Create a new personal khata
  factory Khata.createPersonal({
    required String userId,
    String? name,
    String? nameBn,
  }) {
    final now = DateTime.now();
    return Khata(
      id: 'khata_${now.millisecondsSinceEpoch}',
      userId: userId,
      type: KhataType.personal,
      name: name ?? 'Personal Ledger',
      nameBn: nameBn ?? 'ব্যক্তিগত খাতা',
      entries: [],
      balance: 0.0,
      createdAt: now,
      lastUpdated: now,
    );
  }

  /// Create a new shared khata
  factory Khata.createShared({
    required String userId,
    required List<String> memberIds,
    String? name,
    String? nameBn,
  }) {
    final now = DateTime.now();
    return Khata(
      id: 'khata_${now.millisecondsSinceEpoch}',
      userId: userId,
      type: KhataType.shared,
      name: name ?? 'Shared Ledger',
      nameBn: nameBn ?? 'শেয়ারড খাতা',
      entries: [],
      balance: 0.0,
      createdAt: now,
      lastUpdated: now,
      metadata: {
        'members': memberIds,
      },
    );
  }

  /// Create a new squad khata
  factory Khata.createSquad({
    required String userId,
    required String squadId,
    String? name,
    String? nameBn,
  }) {
    final now = DateTime.now();
    return Khata(
      id: 'khata_${now.millisecondsSinceEpoch}',
      userId: userId,
      type: KhataType.squad,
      name: name ?? 'Squad Ledger',
      nameBn: nameBn ?? 'স্কোয়াড খাতা',
      entries: [],
      balance: 0.0,
      createdAt: now,
      lastUpdated: now,
      metadata: {
        'squad_id': squadId,
      },
    );
  }

  /// Create a new rent khata
  factory Khata.createRent({
    required String userId,
    required double monthlyRent,
    required String landlordName,
    String? name,
    String? nameBn,
  }) {
    final now = DateTime.now();
    return Khata(
      id: 'khata_${now.millisecondsSinceEpoch}',
      userId: userId,
      type: KhataType.rent,
      name: name ?? 'Rent Ledger',
      nameBn: nameBn ?? 'ভাড়া খাতা',
      entries: [],
      balance: 0.0,
      createdAt: now,
      lastUpdated: now,
      metadata: {
        'monthly_rent': monthlyRent,
        'landlord_name': landlordName,
      },
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Khata && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}

/// Monthly expense report
class MonthlyReport {
  final DateTime month;
  final double totalIncome;
  final double totalExpenses;
  final double netSavings;
  final Map<KhataCategory, double> expensesByCategory;
  final List<KhataEntry> topExpenses;

  const MonthlyReport({
    required this.month,
    required this.totalIncome,
    required this.totalExpenses,
    required this.netSavings,
    required this.expensesByCategory,
    required this.topExpenses,
  });

  double get savingsRate {
    if (totalIncome == 0) return 0.0;
    return (netSavings / totalIncome * 100).clamp(0.0, 100.0);
  }

  KhataCategory? get highestExpenseCategory {
    if (expensesByCategory.isEmpty) return null;
    return expensesByCategory.entries
        .reduce((a, b) => a.value > b.value ? a : b)
        .key;
  }
}
