
import 'dart:convert';
import 'dart:io';

Future<void> main() async {
  final url = Uri.parse('https://rizik-web.its-sabbir69.workers.dev/api/voice/session');
  print('🧠 Probing Brain at: $url');

  try {
    final client = HttpClient();
    final request = await client.postUrl(url);

    // Add any necessary headers here. The current implementation doesn't strictly require them but good practice.
    // request.headers.contentType = ContentType.json;

    print('📡 Sending signal...');
    final response = await request.close();

    final responseBody = await response.transform(utf8.decoder).join();

    print('📥 Response Status: ${response.statusCode}');
    print('📦 Response Body:');
    print(responseBody);

    if (response.statusCode == 200) {
      print('✅ CONNECTION SUCCESSFUL: The Brain is Awake.');

      // Parse JSON to confirm structure
      try {
        final data = jsonDecode(responseBody);
        if (data.containsKey('sessionId')) {
           print('🔑 Session ID received: ${data['sessionId']}');
        } else {
           print('⚠️ Warning: Session ID missing from response.');
        }
      } catch (e) {
        print('⚠️ Warning: Could not parse JSON response.');
      }

    } else {
      print('❌ CONNECTION FAILED: The Brain responded with error.');
    }
  } catch (e) {
    print('💥 NETWORK ERROR: $e');
  }
}
