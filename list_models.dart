import 'dart:io';
import 'dart:convert';

const String apiKey = 'AIzaSyCba17jFLjWkWsLG7dhNjO9BwourzWClPw';

void main() async {
  print("🔍 Querying Google for ALL available models...");
  
  // Try v1beta
  await checkEndpoint('v1beta');
  
  // Try v1alpha (sometimes experimental models are here)
  await checkEndpoint('v1alpha');
}

Future<void> checkEndpoint(String version) async {
  final url = Uri.parse('https://generativelanguage.googleapis.com/$version/models?key=$apiKey');
  print('\n--- Checking API Version: $version ---');
  
  final client = HttpClient();
  try {
    final request = await client.getUrl(url);
    final response = await request.close();
    final body = await response.transform(utf8.decoder).join();
    
    if (response.statusCode == 200) {
      final json = jsonDecode(body);
      if (json['models'] != null) {
        final models = json['models'] as List;
        print("✅ Found ${models.length} models:");
        for (var m in models) {
          final name = m['name'].toString().replaceFirst('models/', '');
          final methods = m['supportedGenerationMethods'];
          // Filter for "generateContent" or "bidiGenerateContent"
          if (methods.toString().contains('generateContent')) {
             print("   • $name");
             // Highlight Bidi models
             if (methods.toString().contains('bidiGenerateContent')) {
               print("     🌟 SUPPORTS LIVE AUDIO (Bidi)!");
             }
          }
        }
      }
    } else {
      print("❌ Error: ${response.statusCode}");
      print(body);
    }
  } catch (e) {
    print("❌ Exception: $e");
  } finally {
    client.close();
  }
}
