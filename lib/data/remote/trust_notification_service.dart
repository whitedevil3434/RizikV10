import 'package:flutter/material.dart' hide Badge;
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/widgets/trust_improvement_screen.dart';

/// Service for handling trust score notifications and warnings
class TrustNotificationService {
  /// Show warning notification when trust score drops below 3.0
  static void showLowScoreWarning(
    BuildContext context,
    TrustScore trustScore, {
    bool showBengali = false,
  }) {
    if (trustScore.overall >= 3.0) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                showBengali
                    ? 'ট্রাস্ট স্কোর সতর্কতা: ${trustScore.overall.toStringAsFixed(1)}/৫.০'
                    : 'Trust Score Warning: ${trustScore.overall.toStringAsFixed(1)}/5.0',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.red.shade700,
        duration: const Duration(seconds: 5),
        action: SnackBarAction(
          label: showBengali ? 'দেখুন' : 'View',
          textColor: Colors.white,
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => TrustImprovementScreen(
                  trustScore: trustScore,
                  showBengali: showBengali,
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  /// Show feature restriction dialog
  static void showFeatureRestrictionDialog(
    BuildContext context, {
    required String featureName,
    required TrustScore currentScore,
    required double requiredScore,
    bool showBengali = false,
  }) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(Icons.lock, color: Colors.red.shade700),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                showBengali ? 'ফিচার সীমাবদ্ধ' : 'Feature Restricted',
                style: TextStyle(color: Colors.red.shade700),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              showBengali
                  ? '$featureName ব্যবহার করতে আপনার ট্রাস্ট স্কোর $requiredScore বা তার বেশি হতে হবে।'
                  : 'You need a trust score of $requiredScore or higher to access $featureName.',
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        showBengali ? 'বর্তমান স্কোর' : 'Current Score',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      Text(
                        currentScore.overall.toStringAsFixed(1),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.red.shade700,
                        ),
                      ),
                    ],
                  ),
                  Icon(Icons.arrow_forward, color: Colors.grey.shade400),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        showBengali ? 'প্রয়োজন' : 'Required',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      Text(
                        requiredScore.toStringAsFixed(1),
                        style: TextStyle(
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                          color: Colors.green.shade700,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(showBengali ? 'বাতিল' : 'Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => TrustImprovementScreen(
                    trustScore: currentScore,
                    showBengali: showBengali,
                  ),
                ),
              );
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue.shade700,
            ),
            child: Text(
              showBengali ? 'উন্নতি করুন' : 'Improve Score',
              style: const TextStyle(color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  /// Show badge earned celebration
  static void showBadgeEarnedCelebration(
    BuildContext context,
    Badge badge, {
    bool showBengali = false,
  }) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Dialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Confetti effect (simplified)
              Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: RadialGradient(
                    colors: [
                      Colors.amber.withOpacity(0.3),
                      Colors.amber.withOpacity(0.0),
                    ],
                  ),
                ),
                child: Center(
                  child: Text(
                    badge.emoji,
                    style: const TextStyle(fontSize: 80),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                showBengali ? '🎉 ব্যাজ অর্জিত! 🎉' : '🎉 Badge Earned! 🎉',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                showBengali ? badge.nameBn : badge.name,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: Colors.amber.shade700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                showBengali ? badge.descriptionBn : badge.description,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 14,
                  color: Colors.grey,
                ),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.amber.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.amber.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.stars, color: Colors.amber, size: 24),
                    const SizedBox(width: 8),
                    Text(
                      '+${badge.xpReward} XP',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.amber,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber.shade700,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    showBengali ? 'দুর্দান্ত!' : 'Awesome!',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Show trust score improvement notification
  static void showScoreImprovedNotification(
    BuildContext context,
    double oldScore,
    double newScore, {
    bool showBengali = false,
  }) {
    final improvement = newScore - oldScore;
    if (improvement <= 0) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.trending_up, color: Colors.white),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                showBengali
                    ? 'ট্রাস্ট স্কোর বৃদ্ধি: +${improvement.toStringAsFixed(2)}'
                    : 'Trust Score Improved: +${improvement.toStringAsFixed(2)}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        backgroundColor: Colors.green.shade700,
        duration: const Duration(seconds: 3),
      ),
    );
  }
}
