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

  /// Get active gigs
  Future<List<dynamic>> getGigs() async {
    // Use Supabase for list fetching
    try {
      final response = await _supabase
          .from('gigs') // Assuming table name
          .select('*')
          .eq('status', 'OPEN')
          .order('created_at', ascending: false);
      return response;
    } catch (e) {
      // Fallback or empty if table doesn't exist yet (schema applied manually)
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

  /// Submit bid
  Future<Map<String, dynamic>> submitBid({
    required String gigId,
    required double amount,
    required String coverLetter,
    List<String>? portfolioLinks,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/gig/$gigId/bid', data: {
        'freelancer_id': user.id,
        'amount': amount,
        'cover_letter': coverLetter,
        'portfolio_links': portfolioLinks ?? [],
      });
      return response.data;
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
      final response = await _apiClient.post('/api/gig/$gigId/submit', data: {
        'freelancer_id': user.id,
        'description': description,
        'file_urls': fileUrls,
      });
      return response.data;
    } catch (e) {
      throw 'Failed to submit work: $e';
    }
  }
}
