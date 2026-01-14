import 'dart:async';
import 'dart:convert';
import 'dart:typed_data'; // dart:io Removed (Web compat)
import 'package:rizik_v4/core/config/env_config.dart';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/web_socket_channel.dart'; // Web Support

/// 🗣️ Rizik Edge TTS Client (The Mouth)
/// Handles the handshake with Microsoft's servers using Sec-MS-GEC token.
/// Protocol verified against Python edge-tts library.
class RizikEdgeTTSClient {
  WebSocketChannel? _ws;
  final StreamController<Uint8List> _audioController = StreamController.broadcast();
  final StreamController<void> _turnEndController = StreamController.broadcast();
  
  // Configuration (Fetched Remotely)
  String? _trustedToken;
  String? _secMsGec;
  String? _voice;

  Stream<Uint8List> get audioStream => _audioController.stream;
  Stream<void> get turnEndStream => _turnEndController.stream; // Signal when TTS finishes a sentence

  /// 1. Initialize by fetching Remote Config (with Sec-MS-GEC)
  Future<void> init() async {
    try {
      final response = await http.get(Uri.parse('${EnvConfig.backendUrl}/api/voice/config'));
      if (response.statusCode == 200) {
        final config = jsonDecode(response.body);
        _trustedToken = config['trusted_client_token'];
        _secMsGec = config['sec_ms_gec'];
        _voice = config['voice_config']['default_voice'];
        print("✅ TTS Config Loaded: $_voice (Sec-MS-GEC: ${_secMsGec?.substring(0, 8)}...)");
      } else {
        throw "Failed to fetch TTS config: ${response.statusCode}";
      }
    } catch (e) {
      print("⚠️ TTS Config Error: $e. Using fallback.");
      _trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
      _voice = "bn-BD-PradeepNeural";
    }
  }

  /// 2. Connect to Microsoft WSS (Matching Python edge-tts protocol)
  Future<void> connect() async {
    if (_secMsGec == null) await init();
    
    // Generate ConnectionId and muid
    final connectionId = _generateHexId();
    final muid = _generateHexId();
    
    final wssUrl = Uri.parse("wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1"
        "?TrustedClientToken=$_trustedToken"
        "&ConnectionId=$connectionId"
        "&Sec-MS-GEC=$_secMsGec"
        "&Sec-MS-GEC-Version=1-130.0.2849.68");
    
    print("🔗 Connecting to Edge TTS...");
    
    try {
      final channel = WebSocketChannel.connect(
        wssUrl,
        protocols: null, 
      );
      
      _ws = channel; // Using channel as "ws"
      
      print("✅ Edge TTS WebSocket Connected!");
      
      // Listen to stream
      channel.stream.listen(
        (message) {
          if (message is String) {
             if (message.contains("Path:turn.end")) {
                 print("🏁 TTS Turn End");
                 _turnEndController.add(null);
             }
          } else if (message is List<int>) {
            _parseBinary(Uint8List.fromList(message));
          }
        },
        onError: (e) => print("🔴 TTS WS Error: $e"),
        onDone: () {
            print("🔌 TTS WS Closed.");
            _ws = null;
        },
      );
      
      // Send speech.config (High Quality MP3)
      final timestamp = _getJsTimestamp();
      final configPayload = 'X-Timestamp:$timestamp\r\n'
          'Content-Type:application/json; charset=utf-8\r\n'
          'Path:speech.config\r\n\r\n'
          '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"true","wordBoundaryEnabled":"false"},"outputFormat":"raw-24khz-16bit-mono-pcm"}}}}\r\n';
      
      channel.sink.add(configPayload);
      print("📤 Sent speech.config");
      
    } catch (e) {
      print("❌ TTS Connection Error: $e");
    }
  }

  /// 3. Synthesize Text (SSML)
  Future<void> synthesize(String text) async {
    // Auto-Reconnect if closed (Relies on onDone setting _ws = null)
    if (_ws == null) {
         print("🔄 TTS Reconnecting...");
         await connect();
    }
    
    if (_ws == null) {
        print("❌ TTS Unavailable. Dropping: $text");
        return; 
    }

    final requestId = _generateHexId();
    final timestamp = _getJsTimestamp();
    
    // Escape XML special characters
    final escapedText = text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
    
    final ssml = "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='bn-BD'>"
        "<voice name='$_voice'>"
        "<prosody pitch='+0Hz' rate='+0%' volume='+0%'>$escapedText</prosody>"
        "</voice></speak>";
    
    final ssmlPayload = 'X-RequestId:$requestId\r\n'
        'Content-Type:application/ssml+xml\r\n'
        'X-Timestamp:${timestamp}Z\r\n'
        'Path:ssml\r\n\r\n'
        '$ssml';
    
    _ws!.sink.add(ssmlPayload);
    print("📤 Sent SSML request for: ${text.substring(0, text.length > 30 ? 30 : text.length)}...");
  }

  /// 4. Parse Binary Audio (Edge TTS format: 2-byte header length + headers + audio)
  void _parseBinary(Uint8List data) {
    try {
      if (data.length < 2) return;
      
      // First 2 bytes = header length (big endian)
      final headerLength = (data[0] << 8) | data[1];
      if (headerLength + 2 > data.length) return;
      
      // Skip header, extract audio
      final audioBytes = data.sublist(headerLength + 2);
      if (audioBytes.isNotEmpty) {
        if (!_audioController.isClosed) {
           _audioController.add(audioBytes);
        }
      }
    } catch (e) {
      print("TTS Parse Error: $e");
    }
  }

  void dispose() {
    _ws?.sink.close();
    if (!_audioController.isClosed) _audioController.close();
    if (!_turnEndController.isClosed) _turnEndController.close();
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
  /// 🛑 Stop Speech
  Future<void> stop() async {
     print("🛑 [EdgeTTS] Cutting off connection...");
     await _ws?.sink.close(); 
     _ws = null;
  }
}
