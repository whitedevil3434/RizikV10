import 'package:flutter/material.dart';

/// Savings Advisor Card - Shows AI recommendations for saving money
class SavingsAdvisorCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const SavingsAdvisorCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    // Extract data from props (SDUI pattern)
    final monthlySavingGoal = data['monthlySavingGoal'] ?? 5000;
    final currentSavings = data['currentSavings'] ?? 3200;
    final recommendations = (data['recommendations'] as List?)?.cast<Map<String, dynamic>>() ?? 
      _getDefaultRecommendations();

    final savingsProgress = currentSavings / monthlySavingGoal;

    return Card(
      margin: const EdgeInsets.all(16),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Icon(Icons.savings, color: Colors.green.shade700, size: 28),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Savings Advisor',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.green.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    'AI Powered',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.green.shade700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Savings Progress
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.green.shade50,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Monthly Goal',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade700,
                        ),
                      ),
                      Text(
                        '৳$currentSavings / ৳$monthlySavingGoal',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: savingsProgress.clamp(0.0, 1.0),
                      backgroundColor: Colors.grey.shade200,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.green.shade600),
                      minHeight: 8,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${(savingsProgress * 100).toStringAsFixed(0)}% Complete',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // AI Recommendations
            Text(
              '💡 AI Recommendations',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
              ),
            ),
            const SizedBox(height: 8),
            ...recommendations.map((rec) => _buildRecommendationItem(rec)),
          ],
        ),
      ),
    );
  }

  Widget _buildRecommendationItem(Map<String, dynamic> rec) {
    final icon = _getIconForCategory(rec['category'] ?? '');
    final title = rec['title'] ?? 'Save more';
    final amount = rec['potentialSaving'] ?? 0;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.blue.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.shade100),
      ),
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.blue.shade700),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(fontSize: 13),
            ),
          ),
          Text(
            '৳$amount',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: Colors.green.shade700,
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForCategory(String category) {
    switch (category.toLowerCase()) {
      case 'food':
        return Icons.restaurant;
      case 'transport':
        return Icons.directions_car;
      case 'utilities':
        return Icons.lightbulb;
      case 'shopping':
        return Icons.shopping_bag;
      default:
        return Icons.tips_and_updates;
    }
  }

  List<Map<String, dynamic>> _getDefaultRecommendations() {
    return [
      {
        'category': 'food',
        'title': 'Cook at home 2 more times this week',
        'potentialSaving': 600,
      },
      {
        'category': 'transport',
        'title': 'Use ridesharing for daily commute',
        'potentialSaving': 400,
      },
    ];
  }
}
