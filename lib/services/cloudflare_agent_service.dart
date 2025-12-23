import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:http/http.dart' as http;
import 'package:web_socket_channel/io.dart';
import 'package:rizik_v4/core/config/env_config.dart';

class CloudflareAgentService {
  // Config
  final String _baseUrl = EnvConfig.backendUrl;
  IOWebSocketChannel? _brainChannel;
  final StreamController<String> _aiResponseController = StreamController.broadcast();
  final StreamController<String> _sttResultController = StreamController.broadcast();

  Stream<String> get aiStream => _aiResponseController.stream;
  Stream<String> get sttStream => _sttResultController.stream;
  final StreamController<void> _interruptController = StreamController.broadcast();
  Stream<void> get interruptStream => _interruptController.stream;

  /// Initializes service (Permissions check moved to Logic Layer)
  Future<void> init() async {
    print("✅ Cloudflare Agent Service Initialized (HTTP + WS Mode)");
  }

  /// 🔌 Connect to Brain (WebSocket) for AI Responses
  void connectBrain() {
    try {
      // Convert https:// -> wss:// and use /connect for Brain WebSocket
      final wsUrl = _baseUrl.replaceFirst('https://', 'wss://') + '/api/voice/connect';
      print("🧠 Connecting to Rizik Brain: $wsUrl");
      
      _brainChannel = IOWebSocketChannel.connect(Uri.parse(wsUrl));
      print("🧠 Channel created, setting up listeners...");
      
      _brainChannel!.stream.listen((message) {
        print("🧠 RAW Brain Message: $message");
        try {
          final data = jsonDecode(message);
          print("🧠 Parsed message type: ${data['type']}");
          if (data['type'] == 'ai_response') {
            final text = data['text'];
            print("🗣️ Rizik Brain Says: $text");
            _aiResponseController.add(text);
          } else if (data['type'] == 'ping') {
            print("🏓 Ping received: ${data['message']}");
          } else if (data['type'] == 'text_stream') {
            print("📝 Stream chunk: ${data['content']}");
          } else if (data['type'] == 'stt_result') {
            final text = data['text'];
            print("🎤 STT Final: $text");
             _sttResultController.add(text);
          } else if (data['type'] == 'interrupt') {
             print("🛑 Interrupt Signal Received");
             _interruptController.add(null);
          }
        } catch (e) {
          print("⚠️ Brain Message Error: $e");
        }
      }, onError: (e) {
        print("❌ Brain Connection Error: $e");
      }, onDone: () {
        print("🛑 Brain Connection Closed");
      });
      
      print("✅ Brain listeners set up, connection pending...");
    } catch (e) {
      print("❌ Failed to connect Brain: $e");
    }
  }

  /// 🚀 Signal backend that client is ready
  void sendReady() {
    if (_brainChannel != null) {
      print("📤 Sending 'ready' signal to Brain...");
      _brainChannel!.sink.add(jsonEncode({'type': 'ready'}));
    } else {
      print("⚠️ Cannot send ready: Brain not connected");
    }
  }

  /// 📝 Send text input to Brain
  void sendInput(String text) {
    if (_brainChannel != null) {
      print("📤 Sending text input to Brain: $text");
      _brainChannel!.sink.add(jsonEncode({
        'type': 'text_input',
        'text': text
      }));
    } else {
      print("⚠️ Cannot send input: Brain not connected");
    }
  }

  /// 🎤 Send audio chunk (binary) to Brain
  void sendAudioChunk(Uint8List bytes) {
    if (_brainChannel != null && _brainChannel!.sink != null) {
      _brainChannel!.sink.add(bytes);
    }
  }




  /// Creates a new Voice Session via HTTP
  /// Returns { sessionId, callsAppId }
  Future<Map<String, String>> createSession() async {
    // 1. Create Session on Backend
    final url = Uri.parse('$_baseUrl/api/voice/session');
    print("🔌 Creating Session via HTTP: $url");

    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print("🔍 Full Backend Response: ${response.body}");
        
        if (data['sessionId'] == null) {
          throw Exception("Backend returned null sessionId. Data: $data");
        }
        
        print("✅ Session Created: ${data['sessionId']}");
        return {
          'sessionId': data['sessionId'],
          'callsAppId': data['callsAppId'] ?? '',
        };
      } else {
        throw Exception("Failed to create session: ${response.statusCode} - ${response.body}");
      }
    } catch (e) {
      print("❌ Error creating session: $e");
      rethrow;
    }
  }

  /// 2. Publish Track (Signaling)
  /// Sends the local SDP Offer to Backend Proxy -> Cloudflare Calls.
  /// 2. Publish Track (Signaling)
  /// Sends the local SDP Offer to Backend Proxy -> Cloudflare Calls.
  Future<Map<String, dynamic>> publishTrack({
    required String sessionId,
    required String sdpOffer,
    required String trackName,
  }) async {
    final url = Uri.parse('$_baseUrl/api/voice/session/tracks/new');

    // 1. Create Body Map
    final Map<String, dynamic> requestBodyMap = {
      "sessionId": sessionId,
      "sessionDescription": {
        "sdp": sdpOffer,
        "type": "offer",
      },
      "trackName": trackName,
    };

    // 2. Encode to String explicitly
    final String jsonBodyString = jsonEncode(requestBodyMap);

    print("📡 Negotiating Track via Backend: $url");
    print('📦 Sending Body (Check if this starts with { ): $jsonBodyString');

    try {
      // 3. Send Request
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonBodyString,
      );

      // 4. Check Response
      if (response.statusCode != 200 && response.statusCode != 201) {
        print("❌ Backend Error: ${response.body}");
        throw Exception("Failed to negotiate track: ${response.statusCode} - ${response.body}");
      }
      
      print("✅ Track Negotiated. Response: ${response.body}");
      
      final data = jsonDecode(response.body);

      // 1. Smart Check: Is data wrapped or direct?
      // If 'sessionDescription' key exists, use it; otherwise, the data itself is the answer.
      final answerMap = data.containsKey('sessionDescription') 
          ? data['sessionDescription'] 
          : data;

      if (answerMap['sdp'] == null) {
          throw Exception("Missing SDP in response: $data");
      }
      
      print('✅ Received Remote Description: ${answerMap['type']}');

      // Return consistent structure for the consumer (VoiceSessionProvider)
      // We reconstruct the map so consumers don't break if they expect 'sessionDescription' key
      return {
        'sessionDescription': answerMap
      };
    } catch (e) {
      print("❌ WebRTC Connection Failed: $e");
      rethrow;
    }
  }

  /// Cleanup (No active connections to close in this stateless service)
  Future<void> disconnect() async {
    print("🛑 Service Disconnected");
  }
}
