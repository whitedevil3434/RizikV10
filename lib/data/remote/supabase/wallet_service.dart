import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rizik_v4/data/models/squad.dart';

class WalletService {
  SupabaseClient get _client => Supabase.instance.client;

  /// Get wallet by Squad ID
  Future<SharedWallet?> getSquadWallet(String squadId) async {
    final response = await _client
        .from('wallets')
        .select()
        .eq('squad_id', squadId)
        .maybeSingle();

    if (response == null) return null;

    return _mapToSharedWallet(response);
  }

  /// Add transaction (deposit/withdrawal/expense)
  Future<void> addTransaction({
    required String walletId,
    required double amount,
    required String type, // 'deposit', 'withdrawal', 'expense', 'earning'
    required String performedBy,
    String? description,
    Map<String, dynamic>? metadata,
  }) async {
    await _client.from('transactions').insert({
      'wallet_id': walletId,
      'amount': amount,
      'type': type,
      'status': 'completed',
      'performed_by': performedBy,
      'description': description,
      'metadata': metadata,
      'created_at': DateTime.now().toIso8601String(),
    });

    // Update wallet balance (could be done via trigger)
    // Assuming trigger handles it, or we do it here.
    // For robustness, let's rely on DB triggers or a stored procedure for balance updates.
    // But for now, client-side update for simplicity if no triggers.
    // Actually, let's assume we need to update it.
    
    // Fetch current balance
    final wallet = await _client
        .from('wallets')
        .select('balance')
        .eq('id', walletId)
        .single();
    
    double currentBalance = (wallet['balance'] as num).toDouble();
    double newBalance = currentBalance;

    if (['deposit', 'earning', 'refund'].contains(type)) {
      newBalance += amount;
    } else {
      newBalance -= amount;
    }

    await _client
        .from('wallets')
        .update({'balance': newBalance})
        .eq('id', walletId);
  }

  /// Get transactions for a wallet
  Future<List<WalletTransaction>> getTransactions(String walletId) async {
    final response = await _client
        .from('transactions')
        .select()
        .eq('wallet_id', walletId)
        .order('created_at', ascending: false);

    return (response as List).map((json) => _mapToTransaction(json)).toList();
  }

  SharedWallet _mapToSharedWallet(Map<String, dynamic> json) {
    return SharedWallet(
      id: json['id'],
      balance: (json['balance'] as num).toDouble(),
      transactions: [], // Fetched separately
      lockedFunds: 0.0, // Needs logic
      lastUpdated: DateTime.parse(json['updated_at'] ?? DateTime.now().toIso8601String()),
      squadId: json['squad_id'],
    );
  }

  WalletTransaction _mapToTransaction(Map<String, dynamic> json) {
    return WalletTransaction(
      id: json['id'],
      amount: (json['amount'] as num).toDouble(),
      type: json['type'],
      memberId: json['performed_by'] ?? 'unknown',
      description: json['description'],
      timestamp: DateTime.parse(json['created_at']),
      requiresApproval: json['metadata']?['requires_approval'] ?? false,
      approvedBy: List<String>.from(json['metadata']?['approved_by'] ?? []),
    );
  }
}
