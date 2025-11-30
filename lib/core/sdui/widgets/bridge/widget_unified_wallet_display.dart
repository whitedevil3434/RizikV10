import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/unified_wallet_provider.dart';

class WidgetUnifiedWalletDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetUnifiedWalletDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final showRoleBreakdown = data['show_role_breakdown'] as bool? ?? false;

    return Consumer<UnifiedWalletProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        final balance = provider.balance;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.05),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Unified Wallet',
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '৳${balance.toStringAsFixed(2)}',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
              if (showRoleBreakdown) ...[
                const SizedBox(height: 12),
                ...provider.balanceByRole.entries.map((entry) => Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(
                        '${entry.key.displayName}: ৳${entry.value.toStringAsFixed(2)}',
                        style: const TextStyle(fontSize: 12, color: Colors.grey),
                      ),
                    )),
              ],
            ],
          ),
        );
      },
    );
  }
}
