import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:rizik_v4/data/models/duty_roster.dart';
import 'package:rizik_v4/data/models/squad.dart';
import 'package:rizik_v4/data/remote/duty_roster_service.dart';

/// Provider for managing duty rosters
class DutyRosterProvider with ChangeNotifier {
  List<DutyRoster> _rosters = [];
  bool _isLoading = false;
  String? _error;
  
  List<DutyRoster> get rosters => _rosters;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  DutyRosterProvider() {
    _loadRosters();
  }
  
  /// Load rosters from storage
  Future<void> _loadRosters() async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final prefs = await SharedPreferences.getInstance();
      final rostersJson = prefs.getStringList('duty_rosters') ?? [];
      
      _rosters = rostersJson
          .map((json) => DutyRoster.fromJson(jsonDecode(json) as Map<String, dynamic>))
          .toList();
      
      _error = null;
    } catch (e) {
      _error = 'Failed to load rosters: $e';
      debugPrint(_error);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Save rosters to storage
  Future<void> _saveRosters() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final rostersJson = _rosters
          .map((roster) => jsonEncode(roster.toJson()))
          .toList();
      await prefs.setStringList('duty_rosters', rostersJson);
    } catch (e) {
      debugPrint('Error saving rosters: $e');
    }
  }
  
  /// Get roster by ID
  DutyRoster? getRosterById(String id) {
    try {
      return _rosters.firstWhere((roster) => roster.id == id);
    } catch (e) {
      return null;
    }
  }
  
  /// Get current week's roster for a squad
  DutyRoster? getCurrentRoster(String squadId) {
    final now = DateTime.now();
    try {
      return _rosters.firstWhere((roster) {
        return roster.squadId == squadId &&
            now.isAfter(roster.weekStartDate) &&
            now.isBefore(roster.weekEndDate);
      });
    } catch (e) {
      return null;
    }
  }
  
  /// Get all rosters for a squad
  List<DutyRoster> getSquadRosters(String squadId) {
    return _rosters.where((r) => r.squadId == squadId).toList();
  }
  
  /// Generate new weekly roster
  Future<DutyRoster> generateRoster({
    required Squad squad,
    DateTime? weekStart,
    Map<String, List<DutyRole>>? memberSkills,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      // Default to next Monday if not specified
      final start = weekStart ?? _getNextMonday();
      
      // Generate roster
      final roster = DutyRosterService.generateWeeklyRoster(
        squad: squad,
        weekStart: start,
        memberSkills: memberSkills,
      );
      
      _rosters.add(roster);
      await _saveRosters();
      notifyListeners();
      
      _error = null;
      return roster;
    } catch (e) {
      _error = 'Failed to generate roster: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Get next Monday
  DateTime _getNextMonday() {
    final now = DateTime.now();
    final daysUntilMonday = (DateTime.monday - now.weekday + 7) % 7;
    final nextMonday = now.add(Duration(days: daysUntilMonday == 0 ? 7 : daysUntilMonday));
    return DateTime(nextMonday.year, nextMonday.month, nextMonday.day);
  }
  
  /// Request shift swap
  Future<void> requestSwap({
    required String rosterId,
    required String requesterId,
    required String requesterName,
    required String targetId,
    required String targetName,
    required Shift shift,
    required String reason,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final rosterIndex = _rosters.indexWhere((r) => r.id == rosterId);
      if (rosterIndex == -1) {
        throw Exception('Roster not found');
      }
      
      final roster = _rosters[rosterIndex];
      
      // Create swap request
      final swap = DutySwap(
        id: 'swap_${DateTime.now().millisecondsSinceEpoch}',
        requesterId: requesterId,
        requesterName: requesterName,
        targetId: targetId,
        targetName: targetName,
        shift: shift,
        reason: reason,
        status: SwapStatus.pending,
        requestedAt: DateTime.now(),
      );
      
      // Validate swap
      final validation = DutyRosterService.validateSwap(
        swap: swap,
        roster: roster,
      );
      
      if (!validation.valid) {
        throw Exception(validation.reason ?? 'Invalid swap request');
      }
      
      // Add to pending swaps
      final updatedSwaps = [...roster.pendingSwaps, swap];
      _rosters[rosterIndex] = roster.copyWith(
        pendingSwaps: updatedSwaps,
        lastModified: DateTime.now(),
      );
      
      await _saveRosters();
      notifyListeners();
      
      _error = null;
    } catch (e) {
      _error = 'Failed to request swap: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Approve shift swap (squad leader)
  Future<void> approveSwap({
    required String rosterId,
    required String swapId,
    required String approverId,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final rosterIndex = _rosters.indexWhere((r) => r.id == rosterId);
      if (rosterIndex == -1) {
        throw Exception('Roster not found');
      }
      
      final roster = _rosters[rosterIndex];
      final swap = roster.pendingSwaps.firstWhere((s) => s.id == swapId);
      
      // Update swap status
      final updatedSwap = swap.copyWith(
        status: SwapStatus.approved,
        respondedAt: DateTime.now(),
        approvedBy: approverId,
      );
      
      // Process the swap
      var updatedRoster = DutyRosterService.processSwap(
        roster: roster,
        swap: updatedSwap,
      );
      
      _rosters[rosterIndex] = updatedRoster;
      await _saveRosters();
      notifyListeners();
      
      _error = null;
    } catch (e) {
      _error = 'Failed to approve swap: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Reject shift swap
  Future<void> rejectSwap({
    required String rosterId,
    required String swapId,
    String? reason,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final rosterIndex = _rosters.indexWhere((r) => r.id == rosterId);
      if (rosterIndex == -1) {
        throw Exception('Roster not found');
      }
      
      final roster = _rosters[rosterIndex];
      final swapIndex = roster.pendingSwaps.indexWhere((s) => s.id == swapId);
      
      if (swapIndex == -1) {
        throw Exception('Swap request not found');
      }
      
      final swap = roster.pendingSwaps[swapIndex];
      final updatedSwap = swap.copyWith(
        status: SwapStatus.rejected,
        respondedAt: DateTime.now(),
        responseMessage: reason,
      );
      
      final updatedSwaps = List<DutySwap>.from(roster.pendingSwaps);
      updatedSwaps[swapIndex] = updatedSwap;
      
      _rosters[rosterIndex] = roster.copyWith(
        pendingSwaps: updatedSwaps,
        lastModified: DateTime.now(),
      );
      
      await _saveRosters();
      notifyListeners();
      
      _error = null;
    } catch (e) {
      _error = 'Failed to reject swap: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Complete shift
  Future<void> completeShift({
    required String rosterId,
    required String shiftId,
    double? performanceScore,
    String? notes,
  }) async {
    try {
      _isLoading = true;
      notifyListeners();
      
      final rosterIndex = _rosters.indexWhere((r) => r.id == rosterId);
      if (rosterIndex == -1) {
        throw Exception('Roster not found');
      }
      
      final roster = _rosters[rosterIndex];
      
      _rosters[rosterIndex] = DutyRosterService.completeShift(
        roster: roster,
        shiftId: shiftId,
        performanceScore: performanceScore,
        notes: notes,
      );
      
      await _saveRosters();
      notifyListeners();
      
      _error = null;
    } catch (e) {
      _error = 'Failed to complete shift: $e';
      debugPrint(_error);
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Check for missed shifts and update
  Future<void> checkMissedShifts() async {
    try {
      bool hasChanges = false;
      
      for (int i = 0; i < _rosters.length; i++) {
        final updatedRoster = DutyRosterService.checkMissedShifts(_rosters[i]);
        if (updatedRoster != _rosters[i]) {
          _rosters[i] = updatedRoster;
          hasChanges = true;
        }
      }
      
      if (hasChanges) {
        await _saveRosters();
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error checking missed shifts: $e');
    }
  }
  
  /// Get upcoming shifts for a member
  List<Shift> getUpcomingShifts(String memberId) {
    final allShifts = <Shift>[];
    for (final roster in _rosters) {
      allShifts.addAll(roster.getShiftsForMember(memberId));
    }
    
    final now = DateTime.now();
    return allShifts
        .where((shift) => shift.startTime.isAfter(now))
        .toList()
      ..sort((a, b) => a.startTime.compareTo(b.startTime));
  }
  
  /// Get member performance across all rosters
  MemberPerformance? getMemberPerformance(String memberId) {
    int totalShifts = 0;
    int completedShifts = 0;
    int missedShifts = 0;
    double totalScore = 0;
    int scoreCount = 0;
    double totalHours = 0;
    
    for (final roster in _rosters) {
      final perf = roster.performanceScores[memberId];
      if (perf != null) {
        totalShifts += perf.totalShifts;
        completedShifts += perf.completedShifts;
        missedShifts += perf.missedShifts;
        totalHours += perf.totalHours;
        
        if (perf.averageScore > 0) {
          totalScore += perf.averageScore * perf.completedShifts;
          scoreCount += perf.completedShifts;
        }
      }
    }
    
    if (totalShifts == 0) return null;
    
    return MemberPerformance(
      memberId: memberId,
      totalShifts: totalShifts,
      completedShifts: completedShifts,
      missedShifts: missedShifts,
      averageScore: scoreCount > 0 ? totalScore / scoreCount : 0,
      totalHours: totalHours,
    );
  }
  
  /// Get roster statistics
  RosterStatistics? getRosterStatistics(String rosterId) {
    final roster = getRosterById(rosterId);
    if (roster == null) return null;
    
    return DutyRosterService.getRosterStatistics(roster);
  }
  
  /// Refresh rosters
  Future<void> refresh() async {
    await _loadRosters();
  }
  
  /// Clear all rosters (for testing)
  @visibleForTesting
  Future<void> clearRosters() async {
    _rosters.clear();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('duty_rosters');
    notifyListeners();
  }
}
