import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/status.dart' as status;
import 'package:rizik_v4/core/config/env_config.dart';
import 'package:http/http.dart' as http;

/// 🗣️ Rizik Edge TTS Client (The Mouth)
/// Handles the handshake with Microsoft's servers using distributed IP strategy.
class RizikEdgeTTSClient {
  WebSocketChannel? _channel;
  final StreamController<Uint8List> _audioController = StreamController.broadcast();
  
  // Configuration (Fetched Remotely)
  String? _wssUrl;
  String? _trustedToken;
  String? _voice;
  Map<String, String>? _headers;

  Stream<Uint8List> get audioStream => _audioController.stream;

  /// 1. Initialize by fetching Remote Config
  Future<void> init() async {
    try {
      final response = await http.get(Uri.parse('${EnvConfig.backendUrl}/api/voice/config'));
      if (response.statusCode == 200) {
        final config = jsonDecode(response.body);
        _wssUrl = config['wss_url'];
        _trustedToken = config['trusted_client_token'];
        _voice = config['voice_config']['default_voice'];
        _headers = Map<String, String>.from(config['headers']);
        print("✅ TTS Config Loaded: $_voice");
      } else {
        throw "Failed to fetch TTS config";
      }
    } catch (e) {
      print("⚠️ TTS Config Error: $e. Using fallback.");
      // Fallback (Not recommended, but prevents crash)
      _wssUrl = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
      _trustedToken = "6A5AA1D4EAFF4E9FB37E23D68491D6F4"; 
      _voice = "bn-BD-PradeepNeural";
    }
  }

  /// 2. Connect to Microsoft WSS
  Future<void> connect() async {
    if (_wssUrl == null) await init();

    final uri = Uri.parse('$_wssUrl?TrustedClientToken=$_trustedToken');
    _channel = WebSocketChannel.connect(uri);

    _channel!.stream.listen(
      (message) {
        if (message is String) {
          // Check for "Path:audio" metadata in string (rare)
        } else if (message is Uint8List) {
          _parseBinary(message);
        }
      },
      onError: (e) => print("TTS WS Error: $e"),
      onDone: () => print("TTS WS Closed"),
    );

    // Initial Handshake (Required by Edge Protocol)
    _sendText("Content-Type:application/json; charset=utf-8\r\n\r\nPath:speech.config\r\n\r\n" +
        jsonEncode({
          "context": {
            "synthesis": {
              "audio": {
                "metadataoptions": {"sentenceBoundaryEnabled": "false", "wordBoundaryEnabled": "false"},
                "outputFormat": "audio-24khz-48kbitrate-mono-mp3"
              }
            }
          }
        }));
  }

  /// 3. Synthesize Text (SSML)
  void synthesize(String text) {
    if (_channel == null) return;

    final requestId = DateTime.now().millisecondsSinceEpoch.toString();
    final ssml = """
      <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='bn-BD'>
        <voice name='$_voice'>
          <prosody rate='+0%' pitch='+0Hz'>$text</prosody>
        </voice>
      </speak>
    """;

    final payload = "X-RequestId:$requestId\r\n"
        "Content-Type:application/ssml+xml\r\n"
        "Path:ssml\r\n\r\n"
        "$ssml";

    _sendText(payload);
  }

  void _sendText(String data) {
    _channel?.sink.add(data);
  }

  /// 4. Parse Binary Audio from Edge Protocol
  /// The protocol sends headers + binary audio in one blob. We need to strip headers.
  void _parseBinary(Uint8List data) {
    // Find the sequence "Path:audio\r\n" to confirm it's audio
    // Then find the double CRLF "\r\n\r\n" which separates headers from body
    
    // Simplistic parser: Look for the audio marker (binary check is better but text search works for protocol)
    try {
      final headerString = String.fromCharCodes(data.take(128)); // Peek headers
      if (headerString.contains("Path:audio")) {
        // Find split point
        int splitIndex = -1;
        for (int i = 0; i < data.length - 3; i++) {
          if (data[i] == 13 && data[i+1] == 10 && data[i+2] == 13 && data[i+3] == 10) { // \r\n\r\n
            splitIndex = i + 4;
            break;
          }
        }

        if (splitIndex != -1) {
          final audioBytes = data.sublist(splitIndex);
          _audioController.add(audioBytes);
        }
      }
    } catch (e) {
      print("TTS Parse Error: $e");
    }
  }

  void dispose() {
    _channel?.sink.close();
    _audioController.close();
  }
}
