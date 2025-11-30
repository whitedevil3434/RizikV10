import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/duty_roster.dart';
import 'package:rizik_v4/data/models/squad.dart';

/// Service for managing duty roster operations
class DutyRosterService {
  /// Generate weekly roster for a squad
  static DutyRoster generateWeeklyRoster({
    required Squad squad,
    required DateTime weekStart,
    Map<String, List<DutyRole>>? memberSkills,
  }) {
    final weekEnd = weekStart.add(const Duration(days: 7));
    final shifts = <Shift>[];
    
    // Default skills if not provided
    final skills = memberSkills ?? _getDefaultSkills(squad.members);
    
    // Generate shifts for each day
    for (int day = 0; day < 7; day++) {
      final date = weekStart.add(Duration(days: day));
      final dailyShifts = _generateDailyShifts(
        date: date,
        squad: squad,
        memberSkills: skills,
        existingShifts: shifts,
      );
      shifts.addAll(dailyShifts);
    }
    
    return DutyRoster(
      id: 'roster_${DateTime.now().millisecondsSinceEpoch}',
      squadId: squad.id,
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      shifts: shifts,
      pendingSwaps: [],
      performanceScores: {},
      createdAt: DateTime.now(),
    );
  }
  
  /// Generate shifts for a single day
  static List<Shift> _generateDailyShifts({
    required DateTime date,
    required Squad squad,
    required Map<String, List<DutyRole>> memberSkills,
    required List<Shift> existingShifts,
  }) {
    final shifts = <Shift>[];
    
    // Define shift times
    final shiftTimes = [
      {'start': 6, 'end': 10, 'roles': [DutyRole.chef, DutyRole.buyer]}, // Morning
      {'start': 10, 'end': 14, 'roles': [DutyRole.chef, DutyRole.delivery]}, // Lunch
      {'start': 14, 'end': 18, 'roles': [DutyRole.cleaner, DutyRole.manager]}, // Afternoon
      {'start': 18, 'end': 22, 'roles': [DutyRole.chef, DutyRole.delivery]}, // Dinner
    ];
    
    // Calculate member workload for fair distribution
    final memberHours = _calculateMemberHours(existingShifts, squad.members);
    
    for (final shiftTime in shiftTimes) {
      final startTime = DateTime(date.year, date.month, date.day, shiftTime['start'] as int);
      final endTime = DateTime(date.year, date.month, date.day, shiftTime['end'] as int);
      final roles = shiftTime['roles'] as List<DutyRole>;
      
      for (final role in roles) {
        // Find best member for this role
        final member = _findBestMemberForRole(
          role: role,
          squad: squad,
          memberSkills: memberSkills,
          memberHours: memberHours,
          startTime: startTime,
          endTime: endTime,
          existingShifts: [...existingShifts, ...shifts],
        );
        
        if (member != null) {
          shifts.add(Shift(
            id: 'shift_${DateTime.now().millisecondsSinceEpoch}_${shifts.length}',
            memberId: member.userId,
            memberName: member.userId, // TODO: Get actual name
            role: role,
            startTime: startTime,
            endTime: endTime,
            status: ShiftStatus.scheduled,
          ));
          
          // Update member hours
          memberHours[member.userId] = (memberHours[member.userId] ?? 0) + 
              (endTime.difference(startTime).inMinutes / 60.0);
        }
      }
    }
    
    return shifts;
  }
  
  /// Find best member for a specific role
  static SquadMember? _findBestMemberForRole({
    required DutyRole role,
    required Squad squad,
    required Map<String, List<DutyRole>> memberSkills,
    required Map<String, double> memberHours,
    required DateTime startTime,
    required DateTime endTime,
    required List<Shift> existingShifts,
  }) {
    // Filter members who have the required skill
    final qualifiedMembers = squad.members.where((member) {
      final skills = memberSkills[member.userId] ?? [];
      return skills.contains(role);
    }).toList();
    
    if (qualifiedMembers.isEmpty) {
      // If no one has the skill, allow anyone
      return squad.members.isNotEmpty ? squad.members.first : null;
    }
    
    // Check for conflicts and find member with least hours
    SquadMember? bestMember;
    double minHours = double.infinity;
    
    for (final member in qualifiedMembers) {
      // Check if member has conflicting shift
      final hasConflict = existingShifts.any((shift) {
        return shift.memberId == member.userId &&
            _shiftsOverlap(shift.startTime, shift.endTime, startTime, endTime);
      });
      
      if (!hasConflict) {
        final hours = memberHours[member.userId] ?? 0;
        if (hours < minHours) {
          minHours = hours;
          bestMember = member;
        }
      }
    }
    
    return bestMember;
  }
  
  /// Check if two shifts overlap
  static bool _shiftsOverlap(
    DateTime start1,
    DateTime end1,
    DateTime start2,
    DateTime end2,
  ) {
    return start1.isBefore(end2) && end1.isAfter(start2);
  }
  
  /// Calculate total hours worked by each member
  static Map<String, double> _calculateMemberHours(
    List<Shift> shifts,
    List<SquadMember> members,
  ) {
    final hours = <String, double>{};
    
    // Initialize with 0 for all members
    for (final member in members) {
      hours[member.userId] = 0;
    }
    
    // Sum up hours from shifts
    for (final shift in shifts) {
      hours[shift.memberId] = (hours[shift.memberId] ?? 0) + shift.durationHours;
    }
    
    return hours;
  }
  
  /// Get default skills for members (everyone can do everything)
  static Map<String, List<DutyRole>> _getDefaultSkills(List<SquadMember> members) {
    final skills = <String, List<DutyRole>>{};
    for (final member in members) {
      skills[member.userId] = DutyRole.values;
    }
    return skills;
  }
  
  /// Validate shift swap request
  static SwapValidationResult validateSwap({
    required DutySwap swap,
    required DutyRoster roster,
  }) {
    // Check if shift is in the future
    if (swap.shift != null && swap.shift!.startTime.isBefore(DateTime.now())) {
      return SwapValidationResult(
        valid: false,
        reason: 'Cannot swap past shifts',
        reasonBn: 'অতীতের শিফট অদলবদল করা যাবে না',
      );
    }
    
    // Check if target member has conflicting shift
    if (swap.shift != null) {
      final targetShifts = roster.getShiftsForMember(swap.targetId);
      final hasConflict = targetShifts.any((shift) {
        return _shiftsOverlap(
          shift.startTime,
          shift.endTime,
          swap.shift!.startTime,
          swap.shift!.endTime,
        );
      });
      
      if (hasConflict) {
        return SwapValidationResult(
          valid: false,
          reason: 'Target member has conflicting shift',
          reasonBn: 'লক্ষ্য সদস্যের সাথে শিফট দ্বন্দ্ব আছে',
        );
      }
    }
    
    return SwapValidationResult(valid: true);
  }
  
  /// Process shift swap
  static DutyRoster processSwap({
    required DutyRoster roster,
    required DutySwap swap,
  }) {
    final updatedShifts = roster.shifts.map((shift) {
      if (swap.shift != null && shift.id == swap.shift!.id) {
        return shift.copyWith(
          memberId: swap.targetId,
          memberName: swap.targetName,
          status: ShiftStatus.swapped,
        );
      }
      return shift;
    }).toList();
    
    // Remove the swap from pending
    final updatedSwaps = roster.pendingSwaps
        .where((s) => s.id != swap.id)
        .toList();
    
    return roster.copyWith(
      shifts: updatedShifts,
      pendingSwaps: updatedSwaps,
      lastModified: DateTime.now(),
    );
  }
  
  /// Mark shift as completed
  static DutyRoster completeShift({
    required DutyRoster roster,
    required String shiftId,
    double? performanceScore,
    String? notes,
  }) {
    final updatedShifts = roster.shifts.map((shift) {
      if (shift.id == shiftId) {
        return shift.copyWith(
          status: ShiftStatus.completed,
          completedAt: DateTime.now(),
          performanceScore: performanceScore,
          notes: notes,
        );
      }
      return shift;
    }).toList();
    
    // Update performance scores
    final updatedPerformance = Map<String, MemberPerformance>.from(roster.performanceScores);
    final shift = roster.shifts.firstWhere((s) => s.id == shiftId);
    
    final currentPerf = updatedPerformance[shift.memberId];
    if (currentPerf != null) {
      updatedPerformance[shift.memberId] = MemberPerformance(
        memberId: shift.memberId,
        totalShifts: currentPerf.totalShifts + 1,
        completedShifts: currentPerf.completedShifts + 1,
        missedShifts: currentPerf.missedShifts,
        averageScore: performanceScore != null
            ? ((currentPerf.averageScore * currentPerf.completedShifts) + performanceScore) /
                (currentPerf.completedShifts + 1)
            : currentPerf.averageScore,
        totalHours: currentPerf.totalHours + shift.durationHours,
      );
    } else {
      updatedPerformance[shift.memberId] = MemberPerformance(
        memberId: shift.memberId,
        totalShifts: 1,
        completedShifts: 1,
        missedShifts: 0,
        averageScore: performanceScore ?? 0,
        totalHours: shift.durationHours,
      );
    }
    
    return roster.copyWith(
      shifts: updatedShifts,
      performanceScores: updatedPerformance,
      lastModified: DateTime.now(),
    );
  }
  
  /// Mark shift as missed
  static DutyRoster markShiftMissed({
    required DutyRoster roster,
    required String shiftId,
  }) {
    final updatedShifts = roster.shifts.map((shift) {
      if (shift.id == shiftId) {
        return shift.copyWith(status: ShiftStatus.missed);
      }
      return shift;
    }).toList();
    
    // Update performance scores
    final updatedPerformance = Map<String, MemberPerformance>.from(roster.performanceScores);
    final shift = roster.shifts.firstWhere((s) => s.id == shiftId);
    
    final currentPerf = updatedPerformance[shift.memberId];
    if (currentPerf != null) {
      updatedPerformance[shift.memberId] = MemberPerformance(
        memberId: shift.memberId,
        totalShifts: currentPerf.totalShifts + 1,
        completedShifts: currentPerf.completedShifts,
        missedShifts: currentPerf.missedShifts + 1,
        averageScore: currentPerf.averageScore,
        totalHours: currentPerf.totalHours,
      );
    } else {
      updatedPerformance[shift.memberId] = MemberPerformance(
        memberId: shift.memberId,
        totalShifts: 1,
        completedShifts: 0,
        missedShifts: 1,
        averageScore: 0,
        totalHours: 0,
      );
    }
    
    return roster.copyWith(
      shifts: updatedShifts,
      performanceScores: updatedPerformance,
      lastModified: DateTime.now(),
    );
  }
  
  /// Check for missed shifts and update status
  static DutyRoster checkMissedShifts(DutyRoster roster) {
    final now = DateTime.now();
    var updatedRoster = roster;
    
    for (final shift in roster.shifts) {
      if (shift.isOverdue && shift.status == ShiftStatus.scheduled) {
        updatedRoster = markShiftMissed(
          roster: updatedRoster,
          shiftId: shift.id,
        );
      }
    }
    
    return updatedRoster;
  }
  
  /// Get roster statistics
  static RosterStatistics getRosterStatistics(DutyRoster roster) {
    final totalShifts = roster.shifts.length;
    final completedShifts = roster.shifts.where((s) => s.status == ShiftStatus.completed).length;
    final missedShifts = roster.shifts.where((s) => s.status == ShiftStatus.missed).length;
    final upcomingShifts = roster.upcomingShifts.length;
    
    // Calculate average performance score
    final scoresWithValues = roster.shifts
        .where((s) => s.performanceScore != null)
        .map((s) => s.performanceScore!)
        .toList();
    
    final averagePerformance = scoresWithValues.isNotEmpty
        ? scoresWithValues.reduce((a, b) => a + b) / scoresWithValues.length
        : 0.0;
    
    return RosterStatistics(
      totalShifts: totalShifts,
      completedShifts: completedShifts,
      missedShifts: missedShifts,
      upcomingShifts: upcomingShifts,
      completionRate: roster.completionRate,
      averagePerformance: averagePerformance,
    );
  }
  
  /// Get member with most hours
  static String? getMemberWithMostHours(DutyRoster roster) {
    if (roster.performanceScores.isEmpty) return null;
    
    String? topMember;
    double maxHours = 0;
    
    roster.performanceScores.forEach((memberId, performance) {
      if (performance.totalHours > maxHours) {
        maxHours = performance.totalHours;
        topMember = memberId;
      }
    });
    
    return topMember;
  }
  
  /// Get member with best performance
  static String? getMemberWithBestPerformance(DutyRoster roster) {
    if (roster.performanceScores.isEmpty) return null;
    
    String? topMember;
    double maxScore = 0;
    
    roster.performanceScores.forEach((memberId, performance) {
      if (performance.averageScore > maxScore && performance.completedShifts > 0) {
        maxScore = performance.averageScore;
        topMember = memberId;
      }
    });
    
    return topMember;
  }
}

/// Swap validation result
class SwapValidationResult {
  final bool valid;
  final String? reason;
  final String? reasonBn;
  
  SwapValidationResult({
    required this.valid,
    this.reason,
    this.reasonBn,
  });
}

/// Roster statistics
class RosterStatistics {
  final int totalShifts;
  final int completedShifts;
  final int missedShifts;
  final int upcomingShifts;
  final double completionRate;
  final double averagePerformance;
  
  RosterStatistics({
    required this.totalShifts,
    required this.completedShifts,
    required this.missedShifts,
    required this.upcomingShifts,
    required this.completionRate,
    required this.averagePerformance,
  });
}
