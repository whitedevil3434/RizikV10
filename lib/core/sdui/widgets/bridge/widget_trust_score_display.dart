import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/social/tribunal/logic/trust_score_provider.dart';

class WidgetTrustScoreDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetTrustScoreDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Consumer<TrustScoreProvider>(
      builder: (context, provider, child) {
        final score = provider.trustScore;
        if (score == null) return const SizedBox.shrink();
        
        final level = score.trustLevel.name;

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                _getLevelColor(level).withOpacity(0.1),
                _getLevelColor(level).withOpacity(0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: _getLevelColor(level), width: 2),
          ),
          child: Row(
            children: [
              Icon(_getLevelIcon(level), color: _getLevelColor(level), size: 32),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    level,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _getLevelColor(level),
                    ),
                  ),
                  Text(
                    'Trust Score: ${score.overall.toStringAsFixed(1)}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  Color _getLevelColor(String level) {
    switch (level.toLowerCase()) {
      case 'legendary': return const Color(0xFFFFD700);
      case 'master': return const Color(0xFF9C27B0);
      case 'expert': return const Color(0xFF2196F3);
      case 'trusted': return const Color(0xFF4CAF50);
      default: return Colors.grey;
    }
  }

  IconData _getLevelIcon(String level) {
    switch (level.toLowerCase()) {
      case 'legendary': return Icons.emoji_events;
      case 'master': return Icons.star;
      case 'expert': return Icons.verified;
      case 'trusted': return Icons.check_circle;
      default: return Icons.person;
    }
  }
}
