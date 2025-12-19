import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Gig Repository Provider
final gigRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return GigRepository(apiClient);
});

/// Gig Repository
/// Handles API calls for Gig Workflow
class GigRepository {
  final RizikApiClient _apiClient;
  final SupabaseClient _supabase = Supabase.instance.client;

  GigRepository(this._apiClient);

  /// Create a new Gig (God Mode)
  Future<String> createGig({
    required String title,
    required String description,
    required double budget,
    required String category, // 'CIRCUIT', 'JOMI', 'EXPORT', etc.
    required List<String> requiredSkills,
    required DateTime deadline,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _supabase.from('gigs').insert({
        'title': title,
        'description': description,
        'budget': budget,
        'category': category,
        'required_skills': requiredSkills,
        'deadline': deadline.toIso8601String(),
        'status': 'OPEN',
        'client_id': user.id,
        'created_at': DateTime.now().toIso8601String(),
      }).select().single(); // select() returns the inserted row

      print('✅ Gig Created: ${response['id']}');
      return response['id'];
    } catch (e) {
      throw 'Failed to create gig: $e';
    }
  }

  /// Get active gigs
  Future<List<dynamic>> getGigs() async {
    try {
      final response = await _supabase
          .from('gigs')
          .select('*')
          .eq('status', 'OPEN')
          .order('created_at', ascending: false);
      return response;
    } catch (e) {
      print('Gig Fetch Error: $e');
      return [];
    }
  }

  /// Get gig details
  Future<Map<String, dynamic>> getGig(String gigId) async {
    try {
      final response = await _supabase
          .from('gigs')
          .select('*')
          .eq('id', gigId)
          .single();
      return response;
    } catch (e) {
      throw 'Failed to fetch gig: $e';
    }
  }

  /// Submit bid (Hybrid: Supabase + Notification)
  Future<Map<String, dynamic>> submitBid({
    required String gigId,
    required double amount,
    required String coverLetter,
    List<String>? portfolioLinks,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      // 1. Save Bid to DB
      final bidData = {
        'gig_id': gigId,
        'freelancer_id': user.id,
        'amount': amount,
        'cover_letter': coverLetter,
        'portfolio_links': portfolioLinks ?? [],
        'status': 'PENDING',
        'created_at': DateTime.now().toIso8601String(),
      };

      await _supabase.from('gig_bids').insert(bidData);

      // 2. Notify Client (via Edge Function stub)
      // await _apiClient.post('/api/notify', data: {...});

      return {'success': true};
    } catch (e) {
      throw 'Failed to submit bid: $e';
    }
  }

  /// Submit work
  Future<Map<String, dynamic>> submitWork({
    required String gigId,
    required String description,
    required List<String> fileUrls,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      // Update Gig Status
      await _supabase.from('gigs').update({
        'status': 'REVIEW',
        'submission_description': description,
        'submission_files': fileUrls,
        'submitted_at': DateTime.now().toIso8601String(),
      }).eq('id', gigId);

      return {'success': true};
    } catch (e) {
      throw 'Failed to submit work: $e';
    }
  }
}
