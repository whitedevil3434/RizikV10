import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/earning/data/earning_repository.dart';

/// Transactions Provider
final transactionsProvider = FutureProvider((ref) async {
  return ref.watch(earningRepositoryProvider).getTransactions();
});

/// Transaction History Screen
/// List of all earnings and withdrawals
class TransactionHistoryScreen extends ConsumerWidget {
  const TransactionHistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final transactionsAsync = ref.watch(transactionsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Transaction History')),
      body: transactionsAsync.when(
        data: (transactions) {
          if (transactions.isEmpty) {
            return const Center(child: Text('No transactions yet.'));
          }
          return ListView.builder(
            itemCount: transactions.length,
            padding: const EdgeInsets.all(8),
            itemBuilder: (context, index) {
              final tx = transactions[index];
              final isCredit = tx['type'] == 'CREDIT';
              final amount = tx['amount'] ?? 0.0;
              final date = DateTime.parse(tx['created_at']).toString().split(' ')[0];

              return Card(
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: isCredit ? Colors.green[100] : Colors.red[100],
                    child: Icon(
                      isCredit ? Icons.arrow_downward : Icons.arrow_upward,
                      color: isCredit ? Colors.green : Colors.red,
                    ),
                  ),
                  title: Text(tx['description'] ?? 'Transaction'),
                  subtitle: Text(date),
                  trailing: Text(
                    '${isCredit ? '+' : '-'}৳$amount',
                    style: TextStyle(
                      color: isCredit ? Colors.green : Colors.red,
                      fontWeight: FontWeight.bold,
                      fontSize: 16,
                    ),
                  ),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(child: Text('Error: $err')),
      ),
    );
  }
}
