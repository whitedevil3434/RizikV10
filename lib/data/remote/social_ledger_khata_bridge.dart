import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/khata_entry.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';
import 'package:rizik_v4/data/remote/moneybag_transaction_orchestrator.dart';

/// Enum for Social Ledger transaction types
enum SocialLedgerTransactionType {
  expense,
  paidBack,
  received,
  split,
}

/// Model for linking Social Ledger entries to Khata OS entries
class SocialLedgerKhataLink {
  final String socialLedgerEntryId;
  final String khataEntryId;
  final String khataId;
  final double amount;
  final String personName;
  final SocialLedgerTransactionType type;
  final DateTime linkedAt;

  SocialLedgerKhataLink({
    required this.socialLedgerEntryId,
    required this.khataEntryId,
    required this.khataId,
    required this.amount,
    required this.personName,
    required this.type,
    required this.linkedAt,
  });

  Map<String, dynamic> toJson() => {
        'social_ledger_entry_id': socialLedgerEntryId,
        'khata_entry_id': khataEntryId,
        'khata_id': khataId,
        'amount': amount,
        'person_name': personName,
        'type': type.toString(),
        'linked_at': linkedAt.toIso8601String(),
      };

  factory SocialLedgerKhataLink.fromJson(Map<String, dynamic> json) {
    return SocialLedgerKhataLink(
      socialLedgerEntryId: json['social_ledger_entry_id'],
      khataEntryId: json['khata_entry_id'],
      khataId: json['khata_id'],
      amount: json['amount'].toDouble(),
      personName: json['person_name'],
      type: SocialLedgerTransactionType.values.firstWhere(
        (e) => e.toString() == json['type'],
      ),
      linkedAt: DateTime.parse(json['linked_at']),
    );
  }
}

/// Bridge service connecting Social Ledger to Moneybag and Khata OS
/// Provides automatic synchronization of Social Ledger transactions to Khata OS
class SocialLedgerKhataBridge {
  final KhataProvider khataProvider;
  final MoneybagTransactionOrchestrator orchestrator;
  final List<SocialLedgerKhataLink> _links = [];

  SocialLedgerKhataBridge({
    required this.khataProvider,
    required this.orchestrator,
  });

  /// Adds an expense to Social Ledger and automatically syncs to Khata OS
  /// Creates a Khata entry, links it via metadata, and executes Moneybag transaction if settlement
  Future<String> addExpenseWithKhataSync({
    required String description,
    required double amount,
    required String personId,
    required String personName,
    required SocialLedgerTransactionType type,
  }) async {
    try {
      debugPrint('🔗 Adding expense with Khata sync: $description - ৳${amount.toStringAsFixed(2)}');

      // 1. Add to Social Ledger (simulate - in real app this would call Social Ledger API)
      final socialEntryId = await _addToSocialLedger(
        description: description,
        amount: amount,
        personId: personId,
        personName: personName,
        type: type,
      );

      // 2. Create Khata OS entry
      final khataEntry = KhataEntry(
        date: _formatDate(DateTime.now()),
        description: _buildKhataDescription(description, personName, type),
        amount: amount.toStringAsFixed(2),
        isCredit: _isCredit(type),
        timestamp: DateTime.now(),
        category: KhataCategory.other,
        notes: 'Social Ledger: $socialEntryId',
        metadata: {
          'social_ledger_entry_id': socialEntryId,
          'person_id': personId,
          'person_name': personName,
          'type': type.toString(),
          'source': 'social_ledger',
        },
      );

      // 3. Add to Khata OS
      final khataId = await _getDefaultKhataId();
      await khataProvider.addEntry(
        khataId: khataId,
        entry: khataEntry,
      );

      debugPrint('✅ Khata entry created: ${khataEntry.id}');

      // 4. Execute Moneybag transaction if settlement
      if (type == SocialLedgerTransactionType.paidBack ||
          type == SocialLedgerTransactionType.received) {
        debugPrint('💸 Executing Moneybag transaction for settlement');
        
        await orchestrator.executeSocialLedgerTransaction(
          socialLedgerEntryId: socialEntryId,
          fromUserId: type == SocialLedgerTransactionType.paidBack
              ? 'current_user'
              : personId,
          toUserId: type == SocialLedgerTransactionType.paidBack
              ? personId
              : 'current_user',
          amount: amount,
          description: description,
        );
      }

      // 5. Create link
      await _createLink(
        socialLedgerEntryId: socialEntryId,
        khataEntryId: khataEntry.id,
        khataId: khataId,
        amount: amount,
        personName: personName,
        type: type,
      );

      debugPrint('✅ Social Ledger → Khata OS sync complete');
      return socialEntryId;
    } catch (e) {
      debugPrint('❌ Error adding expense with Khata sync: $e');
      rethrow;
    }
  }

  /// Splits a bill and creates entries for all participants
  /// Each participant gets a Social Ledger entry and corresponding Khata OS entry
  Future<List<String>> splitBillWithKhataSync({
    required String description,
    required double totalAmount,
    required Map<String, double> splits, // personId -> amount
    required Map<String, String> personNames, // personId -> name
  }) async {
    final socialEntryIds = <String>[];

    try {
      debugPrint('👥 Splitting bill: ৳${totalAmount.toStringAsFixed(2)} among ${splits.length} people');

      for (final entry in splits.entries) {
        final personId = entry.key;
        final amount = entry.value;
        final personName = personNames[personId] ?? 'Unknown';

        debugPrint('   - $personName: ৳${amount.toStringAsFixed(2)}');

        final socialEntryId = await addExpenseWithKhataSync(
          description: '$description (Split)',
          amount: amount,
          personId: personId,
          personName: personName,
          type: SocialLedgerTransactionType.split,
        );

        socialEntryIds.add(socialEntryId);
      }

      debugPrint('✅ Bill split complete: ${socialEntryIds.length} entries created');
      return socialEntryIds;
    } catch (e) {
      debugPrint('❌ Error splitting bill with Khata sync: $e');
      rethrow;
    }
  }

  /// Settles a debt and updates both Social Ledger and Khata OS
  /// Marks the original entry as settled and creates a settlement entry
  Future<void> settleDebtWithKhataSync({
    required String socialLedgerEntryId,
    required String personId,
    required String personName,
    required double amount,
    required String description,
  }) async {
    try {
      debugPrint('💰 Settling debt: $socialLedgerEntryId - ৳${amount.toStringAsFixed(2)}');

      // Mark as settled in Social Ledger
      await _settleInSocialLedger(socialLedgerEntryId);

      // Create settlement entry in Khata OS
      await addExpenseWithKhataSync(
        description: 'Settled: $description',
        amount: amount,
        personId: personId,
        personName: personName,
        type: SocialLedgerTransactionType.paidBack,
      );

      debugPrint('✅ Debt settled successfully');
    } catch (e) {
      debugPrint('❌ Error settling debt with Khata sync: $e');
      rethrow;
    }
  }

  /// Gets all links for a Social Ledger entry
  List<SocialLedgerKhataLink> getLinksForSocialEntry(String socialEntryId) {
    return _links
        .where((link) => link.socialLedgerEntryId == socialEntryId)
        .toList();
  }

  /// Gets all links for a Khata entry
  List<SocialLedgerKhataLink> getLinksForKhataEntry(String khataEntryId) {
    return _links
        .where((link) => link.khataEntryId == khataEntryId)
        .toList();
  }

  /// Gets all Social Ledger entries that appear in Khata OS
  Future<List<KhataEntry>> getSocialLedgerEntriesInKhata(
      String khataId) async {
    final khata = khataProvider.getKhataById(khataId);
    if (khata == null) return [];

    return khata.entries
        .where((entry) => entry.metadata?['source'] == 'social_ledger')
        .toList();
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /// Simulates adding to Social Ledger
  /// In real implementation, this would call the Social Ledger service
  Future<String> _addToSocialLedger({
    required String description,
    required double amount,
    required String personId,
    required String personName,
    required SocialLedgerTransactionType type,
  }) async {
    // Simulate adding to Social Ledger
    final entryId = 'social_${DateTime.now().millisecondsSinceEpoch}';
    debugPrint('📝 Added to Social Ledger: $entryId - $description - ৳${amount.toStringAsFixed(2)} - $personName');
    return entryId;
  }

  /// Simulates settling in Social Ledger
  /// In real implementation, this would call the Social Ledger service
  Future<void> _settleInSocialLedger(String socialLedgerEntryId) async {
    debugPrint('✅ Settled in Social Ledger: $socialLedgerEntryId');
  }

  /// Creates a link between Social Ledger and Khata OS entries
  Future<void> _createLink({
    required String socialLedgerEntryId,
    required String khataEntryId,
    required String khataId,
    required double amount,
    required String personName,
    required SocialLedgerTransactionType type,
  }) async {
    final link = SocialLedgerKhataLink(
      socialLedgerEntryId: socialLedgerEntryId,
      khataEntryId: khataEntryId,
      khataId: khataId,
      amount: amount,
      personName: personName,
      type: type,
      linkedAt: DateTime.now(),
    );

    _links.add(link);

    // In real implementation, this would be stored in a database
    debugPrint('🔗 Created link: ${link.toJson()}');
  }

  /// Builds Khata description based on transaction type
  String _buildKhataDescription(
      String description, String personName, SocialLedgerTransactionType type) {
    switch (type) {
      case SocialLedgerTransactionType.expense:
        return 'Expense with $personName: $description';
      case SocialLedgerTransactionType.paidBack:
        return 'Paid back to $personName: $description';
      case SocialLedgerTransactionType.received:
        return 'Received from $personName: $description';
      case SocialLedgerTransactionType.split:
        return 'Split with $personName: $description';
    }
  }

  /// Determines if transaction is a credit (money coming in)
  bool _isCredit(SocialLedgerTransactionType type) {
    return type == SocialLedgerTransactionType.received;
  }

  /// Gets the default Khata ID for the current user
  Future<String> _getDefaultKhataId() async {
    final personalKhata = khataProvider.personalKhata;
    if (personalKhata == null) {
      throw Exception('No personal Khata found');
    }
    return personalKhata.id;
  }

  /// Formats date for Khata entry
  String _formatDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/${date.month.toString().padLeft(2, '0')}/${date.year}';
  }
}
