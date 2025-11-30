import 'package:flutter/material.dart';
import 'dart:math' as math;
import 'package:rizik_v4/data/models/trust_score.dart' as trust;
import 'package:rizik_v4/data/remote/trust_score_service.dart';

/// SDUI Widget: Trust Aura Display
/// Visualizes user trust score with circular "aura ring" and category breakdown
class WidgetTrustAura extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetTrustAura({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    // Extract parameters from JSON
    final profileId = data['profileId'] as String? ?? 'default_user';
    final showCategories = data['showCategories'] as bool? ?? true;
    final compact = data['compact'] as bool? ?? false;

    // Fetch trust score (mock data for now)
    final trustScore = _getMockTrustScore(profileId);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(trustScore.trustLevel.color).withOpacity(0.1),
            Color(trustScore.trustLevel.color).withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Color(trustScore.trustLevel.color).withOpacity(0.3),
          width: 2,
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Aura Ring Visualization
          _buildAuraRing(trustScore, compact),
          
          const SizedBox(height: 16),
          
          // Trust Level Name
          Text(
            trustScore.trustLevel.nameBn,
            style: TextStyle(
              fontSize: compact ? 16 : 20,
              fontWeight: FontWeight.bold,
              color: Color(trustScore.trustLevel.color),
            ),
          ),
          
          const SizedBox(height: 8),
          
          // Stats Row
          _buildStatsRow(trustScore, compact),
          
          // Category Breakdown (optional)
          if (showCategories) ...[
            const SizedBox(height: 16),
            const Divider(),
            const SizedBox(height: 8),
            _buildCategoryBreakdown(trustScore),
          ],
        ],
      ),
    );
  }

  /// Build circular aura ring with score
  Widget _buildAuraRing(trust.TrustScore score, bool compact) {
    final size = compact ? 100.0 : 140.0;
    
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Animated circular progress
          CustomPaint(
            size: Size(size, size),
            painter: _AuraRingPainter(
              progress: score.overall / 5.0,
              color: Color(score.trustLevel.color),
              backgroundColor: Colors.grey.shade200,
            ),
          ),
          
          // Center content
          Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                score.overall.toStringAsFixed(1),
                style: TextStyle(
                  fontSize: compact ? 28 : 36,
                  fontWeight: FontWeight.bold,
                  color: Color(score.trustLevel.color),
                ),
              ),
              Text(
                '/ 5.0',
                style: TextStyle(
                  fontSize: compact ? 12 : 14,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  /// Build stats row (transactions, badges, on-time rate)
  Widget _buildStatsRow(trust.TrustScore score, bool compact) {
    final iconSize = compact ? 16.0 : 20.0;
    final fontSize = compact ? 12.0 : 14.0;
    
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        _buildStatItem(
          icon: Icons.shopping_bag,
          iconSize: iconSize,
          fontSize: fontSize,
          label: '${score.totalTransactions} অর্ডার',
        ),
        _buildStatItem(
          icon: Icons.emoji_events,
          iconSize: iconSize,
          fontSize: fontSize,
          label: '${score.badges.length} ব্যাজ',
        ),
        _buildStatItem(
          icon: Icons.access_time,
          iconSize: iconSize,
          fontSize: fontSize,
          label: '${(score.onTimeRate * 100).toInt()}% সময়মত',
        ),
      ],
    );
  }

  Widget _buildStatItem({
    required IconData icon,
    required double iconSize,
    required double fontSize,
    required String label,
  }) {
    return Column(
      children: [
        Icon(icon, size: iconSize, color: Colors.grey.shade700),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: fontSize,
            color: Colors.grey.shade700,
          ),
        ),
      ],
    );
  }

  /// Build category breakdown list
  Widget _buildCategoryBreakdown(trust.TrustScore score) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'বিভাগ অনুযায়ী স্কোর',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 8),
        ...score.categories.entries.map((entry) {
          final category = entry.key;
          final value = entry.value;
          
          return Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              children: [
                // Category name
                Expanded(
                  flex: 2,
                  child: Text(
                    category.nameBn,
                    style: const TextStyle(fontSize: 13),
                  ),
                ),
                // Progress bar
                Expanded(
                  flex: 3,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: value / 5.0,
                      minHeight: 8,
                      backgroundColor: Colors.grey.shade200,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _getCategoryColor(value),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Score value
                SizedBox(
                  width: 32,
                  child: Text(
                    value.toStringAsFixed(1),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: _getCategoryColor(value),
                    ),
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  /// Get color based on category score
  Color _getCategoryColor(double score) {
    if (score >= 4.5) return const Color(0xFF66BB6A); // Green
    if (score >= 4.0) return const Color(0xFFFFC107); // Yellow
    if (score >= 3.0) return const Color(0xFFFF9800); // Orange
    return const Color(0xFFEF5350); // Red
  }

  /// Mock trust score data (replace with actual Supabase fetch)
  trust.TrustScore _getMockTrustScore(String profileId) {
    // For demo purposes, generate varied scores based on profileId hash
    final hash = profileId.hashCode.abs();
    final variance = (hash % 100) / 100.0;
    
    return trust.TrustScore(
      userId: profileId,
      overall: 3.5 + variance * 1.5, // 3.5 - 5.0 range
      categories: {
        trust.TrustCategory.cooking: 3.8 + variance * 1.2,
        trust.TrustCategory.delivery: 4.2 + variance * 0.8,
        trust.TrustCategory.payment: 4.5 + variance * 0.5,
        trust.TrustCategory.communication: 3.6 + variance * 1.4,
        trust.TrustCategory.reliability: 4.0 + variance * 1.0,
      },
      badges: [
        const trust.Badge(
          id: 'reliable_partner',
          name: 'Reliable Partner',
          nameBn: 'বিশ্বস্ত সঙ্গী',
          emoji: '🛡️',
          category: trust.TrustCategory.reliability,
          rarity: trust.BadgeRarity.uncommon,
          description: 'Complete 25 orders without complaints',
          descriptionBn: '২৫টি অর্ডার অভিযোগ ছাড়াই সম্পন্ন করুন',
          xpReward: 300,
        ),
        const trust.Badge(
          id: 'payment_pro',
          name: 'Payment Pro',
          nameBn: 'পেমেন্ট প্রো',
          emoji: '💰',
          category: trust.TrustCategory.payment,
          rarity: trust.BadgeRarity.common,
          description: 'Make 10 on-time payments',
          descriptionBn: '১০টি সময়মতো পেমেন্ট করুন',
          xpReward: 150,
        ),
      ],
      totalTransactions: 25 + (hash % 75),
      onTimeRate: 0.85 + variance * 0.15,
      averageRating: 4.0 + variance * 1.0,
      lastUpdated: DateTime.now(),
      recentEvents: [
        trust.TrustEvent.orderCompleted,
        trust.TrustEvent.onTimeDelivery,
        trust.TrustEvent.positiveReview,
      ],
    );
  }
}

/// Custom painter for aura ring
class _AuraRingPainter extends CustomPainter {
  final double progress;
  final Color color;
  final Color backgroundColor;

  _AuraRingPainter({
    required this.progress,
    required this.color,
    required this.backgroundColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 8;
    const strokeWidth = 12.0;

    // Background ring
    final bgPaint = Paint()
      ..color = backgroundColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bgPaint);

    // Progress ring
    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    final startAngle = -math.pi / 2; // Start from top
    final sweepAngle = 2 * math.pi * progress;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      progressPaint,
    );

    // Glow effect
    final glowPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth + 4
      ..strokeCap = StrokeCap.round
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      glowPaint,
    );
  }

  @override
  bool shouldRepaint(_AuraRingPainter oldDelegate) {
    return oldDelegate.progress != progress ||
        oldDelegate.color != color ||
        oldDelegate.backgroundColor != backgroundColor;
  }
}
