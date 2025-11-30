import 'package:flutter/material.dart';

/// Action Engine - Maps JSON action strings to Dart functions
/// This is the "Nervous System" that connects SDUI widgets to business logic
class ActionEngine {
  /// Execute an action based on JSON payload
  static Future<void> execute({
    required BuildContext context,
    required String action,
    required Map<String, dynamic> params,
    Function(String)? onSuccess,
    Function(String)? onError,
  }) async {
    try {
      debugPrint('🎬 ActionEngine: Executing "$action" with params: $params');

      switch (action) {
        // Mission Actions
        case 'accept_mission':
          await _acceptMission(params);
          onSuccess?.call('মিশন গ্রহণ সফল হয়েছে!');
          _showSnackbar(context, 'মিশন গ্রহণ সফল হয়েছে!', Colors.green);
          break;

        case 'reject_mission':
          await _rejectMission(params);
          onSuccess?.call('মিশন প্রত্যাখ্যান করা হয়েছে');
          _showSnackbar(context, 'মিশন প্রত্যাখ্যান করা হয়েছে', Colors.orange);
          break;

        // Tribunal Actions
        case 'cast_vote':
          await _castTribunalVote(params);
          onSuccess?.call('ভোট সফলভাবে রেকর্ড করা হয়েছে');
          _showSnackbar(context, 'ভোট সফলভাবে রেকর্ড করা হয়েছে', Colors.blue);
          break;

        // Loan Actions
        case 'apply_loan':
          await _applyForLoan(params);
          onSuccess?.call('ঋণের আবেদন জমা হয়েছে');
          _showSnackbar(context, 'ঋণের আবেদন জমা হয়েছে', Colors.purple);
          break;

        // Shift Actions
        case 'request_swap':
          await _requestShiftSwap(params);
          onSuccess?.call('শিফট স্বাপ রিকোয়েস্ট পাঠানো হয়েছে');
          _showSnackbar(context, 'শিফট স্বাপ রিকোয়েস্ট পাঠানো হয়েছে', Colors.teal);
          break;

        case 'clock_in':
          await _clockIn(params);
          onSuccess?.call('ক্লক ইন সফল');
          _showSnackbar(context, 'ক্লক ইন সফল', Colors.green);
          break;

        case 'clock_out':
          await _clockOut(params);
          onSuccess?.call('ক্লক আউট সফল');
          _showSnackbar(context, 'ক্লক আউট সফল', Colors.green);
          break;

        // Quest Actions
        case 'start_quest':
          await _startQuest(params);
          onSuccess?.call('কোয়েস্ট শুরু হয়েছে!');
          _showSnackbar(context, 'কোয়েস্ট শুরু হয়েছে!', Colors.amber);
          break;

        // Generic Navigation
        case 'navigate':
          _navigate(context, params);
          break;

        // Generic API Call
        case 'api_call':
          await _makeApiCall(params);
          onSuccess?.call('অপারেশন সফল');
          break;

        default:
          throw Exception('Unknown action: $action');
      }
    } catch (e) {
      debugPrint('❌ ActionEngine Error: $e');
      final errorMsg = 'এরর: ${e.toString()}';
      onError?.call(errorMsg);
      _showSnackbar(context, errorMsg, Colors.red);
    }
  }

  // Legacy method for backward compatibility
  static void handleAction(BuildContext context, String actionType, Map<String, dynamic>? data) {
    execute(
      context: context,
      action: actionType,
      params: data ?? {},
    );
  }

  // ============================================================
  // MISSION ACTIONS
  // ============================================================

  static Future<void> _acceptMission(Map<String, dynamic> params) async {
    final missionId = params['missionId'] as String;
    final riderId = params['riderId'] as String?;

    debugPrint('✅ Accepting mission: $missionId for rider: $riderId');

    // TODO: Replace with actual Supabase call
    // await supabase.from('missions').update({
    //   'status': 'accepted',
    //   'rider_id': riderId,
    //   'accepted_at': DateTime.now().toIso8601String(),
    // }).eq('id', missionId);

    await Future.delayed(const Duration(milliseconds: 500));
    debugPrint('Mission $missionId accepted successfully');
  }

  static Future<void> _rejectMission(Map<String, dynamic> params) async {
    final missionId = params['missionId'] as String;
    final reason = params['reason'] as String?;

    debugPrint('❌ Rejecting mission: $missionId, reason: $reason');

    // TODO: Replace with actual Supabase call
    await Future.delayed(const Duration(milliseconds: 300));
    debugPrint('Mission $missionId rejected');
  }

  // ============================================================
  // TRIBUNAL ACTIONS
  // ============================================================

  static Future<void> _castTribunalVote(Map<String, dynamic> params) async {
    final disputeId = params['disputeId'] as String;
    final voterId = params['voterId'] as String;
    final vote = params['vote'] as String; // 'favor', 'against', 'abstain'
    final weight = params['weight'] as double? ?? 1.0;

    debugPrint('🗳️ Casting vote: $vote for dispute: $disputeId');

    // TODO: Replace with actual Supabase call
    await Future.delayed(const Duration(milliseconds: 400));
    debugPrint('Vote recorded successfully');
  }

  // ============================================================
  // LOAN ACTIONS
  // ============================================================

  static Future<void> _applyForLoan(Map<String, dynamic> params) async {
    final userId = params['userId'] as String;
    final amount = params['amount'] as double;
    final type = params['type'] as String;

    debugPrint('💰 Loan application: ৳$amount for $type');

    // TODO: Replace with actual Supabase call
    await Future.delayed(const Duration(milliseconds: 600));
    debugPrint('Loan application submitted');
  }

  // ============================================================
  // SHIFT ACTIONS
  // ============================================================

  static Future<void> _requestShiftSwap(Map<String, dynamic> params) async {
    final shiftId = params['shiftId'] as String;
    final requesterId = params['requesterId'] as String;

    debugPrint('🔄 Shift swap request for: $shiftId');

    // TODO: Replace with actual Supabase call
    await Future.delayed(const Duration(milliseconds: 350));
    debugPrint('Shift swap request sent');
  }

  static Future<void> _clockIn(Map<String, dynamic> params) async {
    final shiftId = params['shiftId'] as String;
    final workerId = params['workerId'] as String;

    debugPrint('⏰ Clock in: Worker $workerId for shift $shiftId');

    // TODO: Update shift status in Supabase
    await Future.delayed(const Duration(milliseconds: 300));
    debugPrint('Clocked in successfully');
  }

  static Future<void> _clockOut(Map<String, dynamic> params) async {
    final shiftId = params['shiftId'] as String;
    final workerId = params['workerId'] as String;

    debugPrint('⏰ Clock out: Worker $workerId from shift $shiftId');

    // TODO: Update shift status in Supabase
    await Future.delayed(const Duration(milliseconds: 300));
    debugPrint('Clocked out successfully');
  }

  // ============================================================
  // QUEST ACTIONS
  // ============================================================

  static Future<void> _startQuest(Map<String, dynamic> params) async {
    final questId = params['questId'] as String;
    final userId = params['userId'] as String;

    debugPrint('🎯 Starting quest: $questId');

    // TODO: Update quest status in Supabase
    await Future.delayed(const Duration(milliseconds: 400));
    debugPrint('Quest started');
  }

  // ============================================================
  // NAVIGATION ACTIONS
  // ============================================================

  static void _navigate(BuildContext context, Map<String, dynamic> params) {
    final route = params['route'] as String;
    
    debugPrint('🧭 Navigate to: $route');
    
    // TODO: Implement actual navigation
    // Navigator.pushNamed(context, route);
  }

  // ============================================================
  // API CALL ACTIONS
  // ============================================================

  static Future<void> _makeApiCall(Map<String, dynamic> params) async {
    final endpoint = params['endpoint'] as String;
    final method = params['method'] as String? ?? 'GET';

    debugPrint('🌐 API Call: $method $endpoint');

    // TODO: Make actual HTTP call
    await Future.delayed(const Duration(milliseconds: 500));
    debugPrint('API call completed');
  }

  // ============================================================
  // UTILITY METHODS
  // ============================================================

  static void _showSnackbar(BuildContext context, String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: color,
        duration: const Duration(seconds: 2),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}
