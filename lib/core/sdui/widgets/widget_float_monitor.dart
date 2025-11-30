import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/mover_float.dart';
import 'package:rizik_v4/data/remote/mover_float_service.dart';
import 'package:rizik_v4/core/theme/rizik_colors.dart';

/// SDUI Widget: Mover Float Monitor
/// Displays mover cash float balance, daily limit, and auto-deduction tracking
class WidgetFloatMonitor extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetFloatMonitor({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    final moverId = data['moverId'] as String? ?? 'default_mover';
    final showRepaymentPreview = data['showRepaymentPreview'] as bool? ?? true;

    final moverFloat = _getMockMoverFloat(moverId);
    final stats = MoverFloatService.getStatistics(moverFloat);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF00BFA5), Color(0xFF00897B)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF00BFA5).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          const Row(
            children: [
              Icon(Icons.account_balance, color: Colors.white, size: 24),
              SizedBox(width: 8),
              Text(
                '💵 মুভার ফ্লোট',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Available Float (Large Display)
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: [
                Text(
                  'উপলব্ধ ফ্লোট',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '৳${moverFloat.currentFloat.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 42,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF00BFA5),
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  '৳${moverFloat.dailyLimit.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildUsageBar(moverFloat, stats),
          const SizedBox(height: 24),
          _buildStatsGrid(moverFloat, stats),
          
          const SizedBox(height: 12),
          
          // Repayment Countdown
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.access_time, color: Colors.white70, size: 16),
                    const SizedBox(width: 6),
                    const Text(
                      'পরবর্তী রিসেট',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
                Text(
                  _getTimeUntilMidnight(),
                  style: const TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          
          if (showRepaymentPreview && moverFloat.remainingBalance > 0) ...[
            const SizedBox(height: 12),
            const Divider(color: Colors.white24),
            const SizedBox(height: 8),
            _buildRepaymentPreview(moverFloat),
          ],
        ],
      ),
    );
  }

  Widget _buildUsageBar(MoverFloat moverFloat, FloatStatistics stats) {
    final usagePercent = moverFloat.dailyLimit > 0 
        ? (moverFloat.dailyLimit - moverFloat.currentFloat) / moverFloat.dailyLimit 
        : 0.0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'ব্যবহার (Usage)',
              style: TextStyle(color: Colors.grey.shade600),
            ),
            Text(
              '${(usagePercent * 100).toStringAsFixed(1)}%',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
          ],
        ),
        const SizedBox(height: 8),
        LinearProgressIndicator(
          value: usagePercent.clamp(0.0, 1.0),
          backgroundColor: Colors.grey.shade200,
          valueColor: AlwaysStoppedAnimation<Color>(
            usagePercent > 0.8 ? Colors.red : Colors.blue,
          ),
        ),
      ],
    );
  }

  Widget _buildStatsGrid(MoverFloat moverFloat, FloatStatistics stats) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 12,
      crossAxisSpacing: 12,
      childAspectRatio: 1.5,
      children: [
        _buildStatCard(
          'দৈনিক সীমা', 
          'Daily Limit', 
          '৳${moverFloat.dailyLimit}', 
          Icons.speed
        ),
        _buildStatCard(
          'অবশিষ্ট', 
          'Remaining', 
          '৳${moverFloat.currentFloat}', 
          Icons.account_balance_wallet
        ),
        _buildStatCard(
          'পরিশোধিত', 
          'Repaid Today', 
          '৳${moverFloat.repaidToday}', 
          Icons.check_circle_outline
        ),
        _buildStatCard(
          'মোট ব্যবহার', 
          'Total Used', 
          '৳${stats.totalDeposited}', 
          Icons.history
        ),
      ],
    );
  }

  Widget _buildStatCard(String titleBn, String titleEn, String value, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade600),
          const SizedBox(height: 8),
          Text(
            titleBn,
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: const Color(0xFF7C4DFF),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRepaymentPreview(MoverFloat moverFloat) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.15),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            '💡 পরবর্তী মিশনে',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'যদি আয় ৳500',
                style: TextStyle(
                  fontSize: 11,
                  color: Colors.white.withOpacity(0.9),
                ),
              ),
              const Text(
                '→ ৳50 কেটে নেওয়া হবে',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _getTimeUntilMidnight() {
    final now = DateTime.now();
    final midnight = DateTime(now.year, now.month, now.day + 1);
    final difference = midnight.difference(now);
    
    final hours = difference.inHours;
    final minutes = difference.inMinutes.remainder(60);
    
    return '${hours}ঘ ${minutes}মি';
  }

  MoverFloat _getMockMoverFloat(String moverId) {
    return MoverFloat(
      id: 'flt_123',
      moverId: moverId,
      dailyLimit: 2000,
      currentFloat: 1500,
      repaidToday: 500,
      status: FloatStatus.active,
      lastResetDate: DateTime.now().subtract(const Duration(hours: 8)),
      transactions: [],
      autoRepayment: const AutoRepayment(remainingBalance: 0),
      trustScore: 85,
    );
  }
}
