import 'package:supabase_flutter/supabase_flutter.dart';

/// ReferralWrapper - Growth Engine
/// Generates and tracks referral links
class ReferralWrapper {
  static final ReferralWrapper _instance = ReferralWrapper._internal();
  factory ReferralWrapper() => _instance;
  ReferralWrapper._internal();

  final SupabaseClient _supabase = Supabase.instance.client;

  /// Generate referral link for current user
  Future<String> generateReferralLink() async {
    final user = _supabase.auth.currentUser;
    if (user == null) throw 'User not logged in';

    // In a real app, this would use Firebase Dynamic Links or Branch.io
    // For now, we generate a deep link scheme
    return 'rizik://referral?code=${user.id}';
  }

  /// Track referral install
  Future<void> trackReferral(String referralCode) async {
    final user = _supabase.auth.currentUser;
    if (user == null) return;

    // Call backend to record referral
    await _supabase.rpc('track_referral', params: {
      'referrer_id': referralCode,
      'new_user_id': user.id,
    });
  }

  /// Get referral stats
  Future<Map<String, dynamic>> getReferralStats() async {
    final user = _supabase.auth.currentUser;
    if (user == null) return {};

    final response = await _supabase
        .from('user_referrals')
        .select('count')
        .eq('referrer_id', user.id)
        .count(CountOption.exact);
    
    return {
      'total_referrals': response.count,
      'earnings': (response.count ?? 0) * 50, // 50 taka per referral example
    };
  }
}

/// Global instance
final referralWrapper = ReferralWrapper();
