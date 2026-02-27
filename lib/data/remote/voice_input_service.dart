class VoiceInputService {
  Future<void> stopListening() async {
    // Placeholder for stopping listening if managed centrally
    return;
  }

  Future<Map<String, String>?> processText(
    String text, {
    required String squadId,
    required String userId,
  }) async {
    try {
      // Stubbed to disable legacy API calls
      return null;
    } catch (e) {
      print('Exception processing text: $e');
      return null;
    }
  }
}
