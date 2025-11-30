class SupabaseService {
  // TODO: Initialize Supabase client

  Future<Map<String, dynamic>> fetchScreen(String screenId) async {
    // TODO: Fetch from Supabase
    // Returning mock data for now to test the renderer
    return {
      'type': 'screen',
      'id': screenId,
      'children': []
    };
  }
}
