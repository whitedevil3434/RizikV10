import 'package:flutter/material.dart';

import 'package:rizik_v4/core/theme/rizik_colors.dart'; // Imported DutyShift
import 'package:rizik_v4/data/models/duty_roster.dart';

/// SDUI Widget: Duty Card (Shift Schedule)
/// Displays current shift status and upcoming schedule
class WidgetDutyCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetDutyCard({
    super.key,
    required this.data,
  });

  @override
  Widget build(BuildContext context) {
    final userId = data['userId'] as String? ?? 'default_user';
    final showUpcoming = data['showUpcoming'] as int? ?? 3;
    final enableSwap = data['enableSwap'] as bool? ?? true;

    final currentShift = _getCurrentShift();
    final upcomingShifts = _getUpcomingShifts(showUpcoming);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300),
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
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFF9C27B0).withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.calendar_today,
                  color: Color(0xFF9C27B0),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Text(
                  '🕐 ডিউটি রোস্টার',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Current Shift Status
          if (currentShift != null) ...[
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF9C27B0).withOpacity(0.2),
                    const Color(0xFF7B1FA2).withOpacity(0.1),
                  ],
                ),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF9C27B0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Text('✅ ', style: TextStyle(fontSize: 18)),
                          Text(
                            'বর্তমান শিফট',
                            style: TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF7B1FA2),
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: const Color(0xFF66BB6A),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Text(
                          'ON DUTY',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          _getShiftTimeDisplay(currentShift),
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade800,
                          ),
                        ),
                      ),
                      Text(
                        _getTimeRemaining(currentShift.endTime),
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF9C27B0),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            const Divider(),
          ],

          // Upcoming Shifts
          const SizedBox(height: 12),
          const Text(
            '📅 আগামী শিফট',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          ...upcomingShifts.map((shift) => _buildShiftItem(shift, enableSwap)),
        ],
      ),
    );
  }

  Widget _buildShiftItem(Shift shift, bool enableSwap) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: Colors.grey.shade50,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Row(
          children: [
            Column(
              children: [
                Text(
                  _getWeekDay(shift.startTime),
                  style: TextStyle(
                    fontSize: 10,
                    color: Colors.grey.shade600,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Text(
                  '${shift.startTime.day}',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    _getShiftTimeDisplay(shift),
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    shift.role.toString().split('.').last,
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ],
              ),
            ),
            if (enableSwap)
              IconButton(
                icon: Icon(Icons.swap_horiz, color: Colors.grey.shade600, size: 20),
                onPressed: () {
                  print('Request shift swap: ${shift.id}');
                },
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
          ],
        ),
      ),
    );
  }

  String _getShiftTimeDisplay(Shift shift) {
    final start = _formatTime(shift.startTime);
    final end = _formatTime(shift.endTime);
    return '$start - $end';
  }

  String _formatTime(DateTime time) {
    final hour = time.hour;
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  String _getWeekDay(DateTime date) {
    const days = ['সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি', 'রবি'];
    return days[(date.weekday - 1) % 7];
  }

  String _getTimeRemaining(DateTime endTime) {
    final now = DateTime.now();
    if (endTime.isBefore(now)) return 'শেষ';
    
    final diff = endTime.difference(now);
    if (diff.inHours > 0) {
      return '${diff.inHours}ঘ ${diff.inMinutes.remainder(60)}মি বাকি';
    } else {
      return '${diff.inMinutes}মি বাকি';
    }
  }

  Shift? _getCurrentShift() {
    final now = DateTime.now();
    // Mock: if current hour is between 9-17, return a shift
    if (now.hour >= 9 && now.hour < 17) {
      return Shift(
        id: 'shift_current',
        memberId: 'worker_123',
        memberName: 'করিম',
        role: DutyRole.delivery,
        startTime: DateTime(now.year, now.month, now.day, 9, 0),
        endTime: DateTime(now.year, now.month, now.day, 17, 0),
        status: ShiftStatus.active,
      );
    }
    return null;
  }

  List<Shift> _getUpcomingShifts(int count) {
    final now = DateTime.now();
    return List.generate(count, (i) {
      final startDate = now.add(Duration(days: i + 1));
      return Shift(
        id: 'shift_${i + 1}',
        memberId: 'worker_123',
        memberName: 'করিম',
        role: DutyRole.delivery,
        startTime: DateTime(startDate.year, startDate.month, startDate.day, 10, 0),
        endTime: DateTime(startDate.year, startDate.month, startDate.day, 18, 0),
        status: ShiftStatus.scheduled,
      );
    });
  }
}
