
import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/io.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

/// 🧪 Rizik Autonomous Extreme Test (Bangla Pipeline)
/// This script acts as a Headless Client to verify:
/// 1. Backend Brain (Cloudflare Workers AI + Qwen)
/// 2. Language Capability (Bangla Text Generation)
/// 3. Valid TTS Generation (Edge TTS -> Audio Bytes)

// Configuration
const String BASE_URL = "https://rizik-backend.its-sabbir69.workers.dev";
const String PROMPT = "আমাদের সৌরজগত সম্পর্কে বিস্তারিত বল"; // Complex Bangla Prompt

void main() async {
  print("\n🔥 STARTING EXTREME BANGLA TEST...");
  print("🎯 Target: $BASE_URL");
  print("🗣️ Prompt: $PROMPT\n");

  // 1. Create Session
  print("⏳ [1/4] Creating Session...");
  String sessionId = "";
  try {
    final resp = await http.post(Uri.parse('$BASE_URL/api/voice/session'));
    if (resp.statusCode != 200) throw "Failed: ${resp.body}";
    final data = jsonDecode(resp.body);
    sessionId = data['sessionId'];
    print("✅ Session ID: $sessionId");
  } catch (e) {
    print("❌ Session Creation Failed: $e");
    exit(1);
  }

  // 2. Connect Brain WebSocket
  print("⏳ [2/4] Connecting to Brain (WebSocket)...");
  final wsUrl = BASE_URL.replaceFirst('https://', 'wss://') + '/api/voice/session';
  final channel = IOWebSocketChannel.connect(Uri.parse(wsUrl));
  
  final Completer<String> responseCompleter = Completer();
  
  channel.stream.listen((message) {
    try {
      final data = jsonDecode(message);
      // Wait for the final aggregate response
      if (data['type'] == 'ai_response') {
        print("📨 Received AI Response: ${data['text'].substring(0, 50)}...");
        responseCompleter.complete(data['text']);
      }
    } catch (e) { }
  });

  // 3. Trigger Brain (Simulate Text Input)
  print("⏳ [3/4] Sending Prompt to Brain...");
  channel.sink.add(jsonEncode({
    "type": "text_input",
    "text": PROMPT
  }));

  // Wait for Response (Timeout 30s)
  String aiText = "";
  try {
    aiText = await responseCompleter.future.timeout(Duration(seconds: 30));
  } catch (e) {
    print("❌ Timed out waiting for AI response.");
    exit(1);
  }

  // Validate Bangla
  final banglaRegex = RegExp(r'[\u0980-\u09FF]');
  if (!banglaRegex.hasMatch(aiText)) {
    print("❌ FAILURE: Response does not contain Bangla characters!");
    print("Received: $aiText");
    exit(1);
  }
  print("✅ Valid Bangla Text Detected.");

  // 4. Generate Audio (Edge TTS)
  // We use a simplified internal client here to verify the TTS service availability
  print("⏳ [4/4] Generating Audio via Edge TTS...");
  final audioSize = await _generateAudio(aiText);
  
  if (audioSize > 1000) {
    print("✅ Audio Generated Successfully ($audioSize bytes).");
    print("\n🎉 MISSION SUCCESS: The pipeline is Production Ready via Autonomy.");
  } else {
    print("❌ TTS Failure: Audio too small ($audioSize bytes).");
    exit(1);
  }

  channel.sink.close();
  exit(0);
}

// Minimal Edge TTS Client for Testing (Matching Python edge-tts protocol exactly)
Future<int> _generateAudio(String text) async {
  final Completer<int> audioCompleter = Completer();
  int totalBytes = 0;
  
  // 1. Fetch TTS Config from Backend (with Sec-MS-GEC)
  print("🔑 Fetching TTS Config...");
  String secMsGec = "";
  String trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
  try {
    final configResp = await http.get(Uri.parse('$BASE_URL/api/voice/config'));
    if (configResp.statusCode == 200) {
      final config = jsonDecode(configResp.body);
      secMsGec = config['sec_ms_gec'] ?? "";
      trustedToken = config['trusted_client_token'] ?? trustedToken;
      print("✅ Got Sec-MS-GEC: ${secMsGec.substring(0, 8)}...");
    }
  } catch (e) {
    print("⚠️ Config fetch failed: $e. Using hardcoded values.");
  }
  
  // 2. Generate ConnectionId (random hex string like Python's connect_id())
  final connectionId = _generateHexId();
  final muid = _generateHexId(); // Random muid for Cookie
  
  // 3. Build URL with ALL params (matching Python edge-tts)
  final wssUrl = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1"
      "?TrustedClientToken=$trustedToken"
      "&ConnectionId=$connectionId"
      "&Sec-MS-GEC=$secMsGec"
      "&Sec-MS-GEC-Version=1-130.0.2849.68";
  
  print("🔗 Connecting to Edge TTS (ConnectionId: ${connectionId.substring(0, 8)}...)");
  
  try {
    // 4. Connect with required headers (matching Python edge-tts WSS_HEADERS)
    final ws = await WebSocket.connect(
      wssUrl,
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Cookie': 'muid=$muid',
      },
    );
    
    print("✅ WebSocket Connected!");
    
    ws.listen((message) {
      if (message is String) {
        print("📩 TTS Text: ${message.substring(0, message.length > 60 ? 60 : message.length)}...");
        if (message.contains("Path:turn.end")) {
          if (!audioCompleter.isCompleted) audioCompleter.complete(totalBytes);
        }
      } else if (message is List<int>) {
        print("📩 TTS Binary: ${message.length} bytes");
        totalBytes += message.length;
      }
    }, onDone: () {
      print("🔌 WebSocket closed.");
      if (!audioCompleter.isCompleted) audioCompleter.complete(totalBytes);
    }, onError: (e) {
      print("❌ TTS Error: $e");
      if (!audioCompleter.isCompleted) audioCompleter.complete(0);
    });
    
    // 5. Send speech.config (matching Python edge-tts format EXACTLY)
    final timestamp = _getJsTimestamp();
    final configPayload = 'X-Timestamp:$timestamp\r\n'
        'Content-Type:application/json; charset=utf-8\r\n'
        'Path:speech.config\r\n\r\n'
        '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}\r\n';
    ws.add(configPayload);
    print("📤 Sent speech.config");
    
    // 6. Wait a moment, then send SSML request
    await Future.delayed(Duration(milliseconds: 100));
    
    final requestId = _generateHexId();
    // Escape special XML characters
    final escapedText = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    final ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>"
        "<voice name='en-US-ChristopherNeural'>"
        "<prosody pitch='+0Hz' rate='+0%' volume='+0%'>$escapedText</prosody>"
        "</voice></speak>";
    
    final ssmlPayload = 'X-RequestId:$requestId\r\n'
        'Content-Type:application/ssml+xml\r\n'
        'X-Timestamp:${timestamp}Z\r\n'
        'Path:ssml\r\n\r\n'
        '$ssml';
    ws.add(ssmlPayload);
    print("📤 Sent SSML request");
    
    return audioCompleter.future.timeout(Duration(seconds: 15));
    
  } catch (e) {
    print("❌ Connection Error: $e");
    return 0;
  }
}

/// Generate random 32-char hex string (like Python's connect_id())
String _generateHexId() {
  final random = List<int>.generate(16, (_) => DateTime.now().microsecondsSinceEpoch % 256);
  return random.map((b) => b.toRadixString(16).padLeft(2, '0')).join('').toUpperCase();
}

/// Generate JavaScript-style timestamp (matching Python edge-tts date_to_string())
String _getJsTimestamp() {
  final now = DateTime.now().toUtc();
  final days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  final months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final day = days[now.weekday % 7];
  final month = months[now.month - 1];
  return '$day $month ${now.day.toString().padLeft(2, '0')} ${now.year} '
      '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')} '
      'GMT+0000 (Coordinated Universal Time)';
}
