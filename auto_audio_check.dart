import 'dart:io';
import 'dart:convert';
import 'dart:typed_data';
import 'dart:math';

// Single Key Check for the "Ultimate Guide"
const String apiKey = 'AIzaSyCba17jFLjWkWsLG7dhNjO9BwourzWClPw';

const List<String> candidateModels = [
  'models/gemini-2.5-flash-native-audio-preview-09-2025',
  'models/gemini-live-2.5-flash-preview-native-audio',
  'models/gemini-2.5-flash-preview-09-2025',
  'models/gemini-exp-1206', // Bonus check
];

Future<void> main() async {
  print('⚙️ Generating synthetic audio (1-second Beep)...');
  final List<int> wavBytes = generateSineWaveWav(
    durationMs: 1000, 
    frequency: 440,   
    sampleRate: 24000 
  );
  final String base64Audio = base64Encode(wavBytes);
  print('✅ Audio Generated\n');

  final client = HttpClient();

  for (final model in candidateModels) {
    print('🔍 Testing Model: $model');
    await testModel(client, model, apiKey, base64Audio);
    print('--------------------------------------------------\n');
    await Future.delayed(Duration(seconds: 1)); 
  }
  
  client.close();
}

Future<void> testModel(HttpClient client, String model, String key, String base64Audio) async {
  // Trying v1alpha as experimental models often live there
  final url = Uri.parse(
      'https://generativelanguage.googleapis.com/v1alpha/$model:generateContent?key=$key'); 

  final requestBody = jsonEncode({
    "contents": [
      {
        "parts": [
          {
             "text": "Describe this sound."
          },
          {
            "inlineData": {
              "mimeType": "audio/wav",
              "data": base64Audio
            }
          }
        ]
      }
    ]
  });

  try {
    final request = await client.postUrl(url);
    request.headers.contentType = ContentType.json;
    request.write(requestBody);
    final response = await request.close();
    
    final responseBody = await response.transform(utf8.decoder).join();

    if (response.statusCode == 200) {
      print('✅ SUCCESS! ($model) is WORKING.');
      print('   Response: ${parseGeminiResponse(responseBody).substring(0, 50)}...');
    } else {
      print('❌ FAILED: Status ${response.statusCode}');
      if (responseBody.contains("not found")) {
         print('   Reason: 404 Model Not Found');
      } else if (responseBody.contains("quota")) {
         print('   Reason: 429 Quota Exceeded (Limit: 0?)');
      } else {
         print('   Raw: ${responseBody.substring(0, min(responseBody.length, 150))}');
      }
    }
  } catch (e) {
    print('❌ Network Error: $e');
  }
}

// --- Helper Functions ---

List<int> generateSineWaveWav({required int durationMs, required int frequency, required int sampleRate}) {
  final int numSamples = (durationMs * sampleRate) ~/ 1000;
  final int byteRate = sampleRate * 2; 
  final int dataSize = numSamples * 2;
  final int totalSize = 36 + dataSize;

  final ByteData header = ByteData(44);
  
  writeString(header, 0, 'RIFF');
  header.setUint32(4, totalSize, Endian.little);
  writeString(header, 8, 'WAVE');
  
  writeString(header, 12, 'fmt ');
  header.setUint32(16, 16, Endian.little); 
  header.setUint16(20, 1, Endian.little);  
  header.setUint16(22, 1, Endian.little);  
  header.setUint32(24, sampleRate, Endian.little);
  header.setUint32(28, byteRate, Endian.little);
  header.setUint16(32, 2, Endian.little);  
  header.setUint16(34, 16, Endian.little); 
  
  writeString(header, 36, 'data');
  header.setUint32(40, dataSize, Endian.little);

  final List<int> pcmData = [];
  for (int i = 0; i < numSamples; i++) {
    final double t = i / sampleRate;
    final double sample = sin(2 * pi * frequency * t);
    final int intSample = (sample * 32767).toInt();
    pcmData.add(intSample & 0xFF);
    pcmData.add((intSample >> 8) & 0xFF);
  }

  return header.buffer.asUint8List() + pcmData;
}

void writeString(ByteData data, int offset, String value) {
  for (int i = 0; i < value.length; i++) {
    data.setUint8(offset + i, value.codeUnitAt(i));
  }
}

String parseGeminiResponse(String jsonString) {
  try {
    final data = jsonDecode(jsonString);
    return data['candidates'][0]['content']['parts'][0]['text'];
  } catch (e) {
    return jsonString;
  }
}
