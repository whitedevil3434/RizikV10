import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/design_system.dart';
import 'package:rizik_v4/core/sdui/widgets/base/index.dart';

/// 💰 MoneyBagCard - Premium Wallet Display
/// 
/// A beautiful gradient card showing wallet balance with quick actions.
class MoneyBagCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const MoneyBagCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final balance = data['balance'] as String? ?? '৳ 0';
    final label = data['label'] as String? ?? 'Total Balance';
    final showAddButton = data['show_add_button'] as bool? ?? true;

    return Container(
      margin: const EdgeInsets.all(RizikDesign.spacing16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF00695C), // Deep Green
            Color(0xFF00897B), // Teal
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: RizikDesign.radiusLarge,
        boxShadow: [
          BoxShadow(
            color: RizikDesign.primary.withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(RizikDesign.spacing24),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: RizikDesign.textCaption.copyWith(
                      color: Colors.white.withOpacity(0.8),
                    ),
                  ),
                  const SizedBox(height: RizikDesign.spacing8),
                  Text(
                    balance,
                    style: const TextStyle(
                      fontFamily: 'Hind Siliguri',
                      fontSize: 36,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.1,
                    ),
                  ),
                  const SizedBox(height: RizikDesign.spacing4),
                  Row(
                    children: [
                      Icon(
                        Icons.trending_up,
                        size: 16,
                        color: RizikDesign.accent,
                      ),
                      const SizedBox(width: RizikDesign.spacing4),
                      Text(
                        '+12% this month',
                        style: RizikDesign.textCaption.copyWith(
                          color: RizikDesign.accent,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            if (showAddButton)
              Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: RizikDesign.radiusSmall,
                ),
                child: Material(
                  color: Colors.transparent,
                  child: InkWell(
                    onTap: () {
                      // TODO: Handle add money action
                    },
                    borderRadius: RizikDesign.radiusSmall,
                    child: const Padding(
                      padding: EdgeInsets.all(RizikDesign.spacing12),
                      child: Icon(
                        Icons.add,
                        color: Colors.white,
                        size: 28,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
