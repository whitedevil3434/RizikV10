import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/api/rizik_api_client.dart';
import 'package:rizik_v4/core/wrappers/auth_wrapper.dart';

/// Sourcing Repository Provider
final sourcingRepositoryProvider = Provider((ref) {
  final apiClient = ref.watch(rizikApiClientProvider);
  return SourcingRepository(apiClient);
});

/// Sourcing Repository
/// Handles API calls for the Sourcing System
class SourcingRepository {
  final RizikApiClient _apiClient;

  SourcingRepository(this._apiClient);

  /// Create a sourcing request
  Future<Map<String, dynamic>> createRequest({
    required String productName,
    required String productDetails,
    required double targetPrice,
    required String category,
    List<String>? images,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/sourcing/request', data: {
        'requester_id': user.id,
        'product_name': productName,
        'product_details': productDetails,
        'target_price': targetPrice,
        'category': category,
        'images': images ?? [],
      });
      
      return response.data;
    } catch (e) {
      throw 'Failed to create request: $e';
    }
  }

  /// Submit a solution
  Future<Map<String, dynamic>> submitSolution({
    required String requestId,
    required String sourceUrl,
    required double price,
    required String notes,
    List<String>? proofImages,
  }) async {
    final user = authWrapper.currentUser;
    if (user == null) throw 'User not logged in';

    try {
      final response = await _apiClient.post('/api/sourcing/submit', data: {
        'request_id': requestId,
        'finder_id': user.id,
        'source_url': sourceUrl,
        'price': price,
        'notes': notes,
        'proof_images': proofImages ?? [],
      });
      
      return response.data;
    } catch (e) {
      throw 'Failed to submit solution: $e';
    }
  }

  /// Search knowledge base
  Future<List<dynamic>> searchKnowledge(String query) async {
    try {
      final response = await _apiClient.get('/api/sourcing/search', queryParameters: {
        'q': query,
      });
      
      return response.data['results'] ?? [];
    } catch (e) {
      throw 'Failed to search: $e';
    }
  }

  /// Get active requests
  Future<List<dynamic>> getRequests() async {
    try {
      // Assuming we have an endpoint for this, or we use Supabase directly
      // Since I didn't create a specific 'get all requests' endpoint in backend/index.ts (only create/submit/approve/search),
      // I should probably use Supabase client here for reading data as it's faster/easier for lists.
      // But let's stick to API if possible.
      // Wait, I didn't create GET /api/sourcing/requests.
      // I should use Supabase client for reading lists to leverage RLS directly.
      
      // Actually, let's use Supabase client for reading.
      // I need to access Supabase client.
      final supabase = Supabase.instance.client;
      final response = await supabase
          .from('sourcing_requests')
          .select('*')
          .order('created_at', ascending: false);
      
      return response;
    } catch (e) {
      throw 'Failed to fetch requests: $e';
    }
  }
}
