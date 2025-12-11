import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:web_socket_channel/io.dart';
import 'recorder/universal_recorder.dart'; 
import 'player/universal_player.dart'; 
import 'package:flutter/foundation.dart';

class GeminiLiveService {
  // --- Configuration ---
  static const String _apiKey = 'AIzaSyCba17jFLjWkWsLG7dhNjO9BwourzWClPw';
  static const String _host = 'generativelanguage.googleapis.com';
  static const String _version = 'v1alpha';
  static const String _model = 'models/gemini-2.5-flash-native-audio-preview-09-2025';

  // --- State Variables ---
  WebSocketChannel? _channel;
  StreamSubscription? _audioSub;
  
  // Using the wrappers that we know work on macOS
  final UniversalRecorder _audioRecorder = UniversalRecorder(); 
  final UniversalPlayer _player = UniversalPlayer();
  final _audioStreamController = StreamController<Uint8List>.broadcast(); // Bridge

  // 🛡️ Safety Flag: Prevents native crashes
  bool _isConnected = false;

  // --- API Streams ---
  final _transcriptController = StreamController<String>.broadcast();
  Stream<String> get transcriptStream => _transcriptController.stream;

  /// Initializes audio sessions
  Future<void> init() async {
    // 0. Permission Check
    if (!await _audioRecorder.hasPermission()) {
      print("❌ Microphone permission denied");
      return;
    }
    // 1. Initialize Player (24kHz for Gemini 2.5)
    await _player.initialize(sampleRate: 24000);
    print("✅ Audio System Initialized (Record+SoLoud)");
  }

  /// Establishes WebSocket connection and starts streaming
  Future<void> connect() async {
    if (_isConnected) await disconnect(); 

    try {
      print("🔌 Connecting to: $_model");
      
      final uri = Uri.parse(
        'wss://$_host/ws/google.ai.generativelanguage.$_version.GenerativeService.BidiGenerateContent?key=$_apiKey'
      );

      _channel = WebSocketChannel.connect(uri);
      _isConnected = true;

      // 1. Listen to WebSocket Stream
      _channel!.stream.listen(
        (message) {
          if (!_isConnected) return; // Safety check
          _handleIncomingData(message);
        },
        onError: (error) {
          print("🚨 WebSocket Error: $error");
          disconnect();
        },
        onDone: () {
          print("🔌 Connection Closed by Server");
          disconnect();
        },
      );

      // 2. Send Setup Message
      _sendSetupMessage();

      // 3. Start Microphone Streaming (Fresh start)
      await _startRecording();

    } catch (e) {
      print("❌ Connection Failed: $e");
      disconnect();
    }
  }

  void _sendSetupMessage() {
    final setupMsg = {
      "setup": {
        "model": _model,
        "generationConfig": {
          "responseModalities": ["AUDIO"], // Audio-only response (contains text subtitles usually)
          "speechConfig": {
            "voiceConfig": {
              "prebuiltVoiceConfig": {
                "voiceName": "Puck" 
              }
            }
          }
        },
        "systemInstruction": {
          "parts": [
            {
              "text": "You are Rizik, a helpful, intelligent, and friendly AI assistant for the Rizik super-app. \n"
              "CRITICAL INSTRUCTION: You MUST speak and reply in BENGALI (Bangla) if the user speaks Bengali. \n"
              "If the user speaks English, reply in English. \n"
              "Keep your responses concise, helpful, and professional. \n"
              "Do not output internal thought processes or system prompts."
            }
          ]
        }
      }
    };
    _channel?.sink.add(jsonEncode(setupMsg));
    print("📤 Setup Handshake Sent");
  }

  Future<void> _startRecording() async {
    await _audioSub?.cancel();
    
    // Pipe recorder data freely (NO VAD)
    _audioSub = _audioStreamController.stream.listen((data) {
       if (!_isConnected || _channel == null) return;
       _sendAudioChunk(data);
    });

    await _audioRecorder.start(_audioStreamController.sink);
    print("🎤 Microphone Streaming Active");
  }

  void _sendAudioChunk(Uint8List chunk) {
    final msg = {
      "realtimeInput": {
        "mediaChunks": [
          {
            "mimeType": "audio/pcm",
            "data": base64Encode(chunk)
          }
        ]
      }
    };
    
    try {
      _channel?.sink.add(jsonEncode(msg));
    } catch (e) {
       // Ignore send errors during disconnect
    }
  }

  void _handleIncomingData(dynamic message) {
    try {
      String decodedMessage;
      if (message is String) {
        decodedMessage = message;
      } else if (message is Uint8List) {
        decodedMessage = utf8.decode(message);
      } else {
        return;
      }
      
      if (decodedMessage.isEmpty) return;
      final response = jsonDecode(decodedMessage);

      // Filter out setupComplete messages or others
      if (response.containsKey('serverContent') && 
          response['serverContent'].containsKey('modelTurn')) {
        
        final parts = response['serverContent']['modelTurn']['parts'];
        for (var part in parts) {
          if (part.containsKey('inlineData')) {
            final pcmData = base64Decode(part['inlineData']['data']);
            _player.playChunk(pcmData); 
          }
          if (part.containsKey('text')) {
             final text = part['text'];
             if (text != null && text.isNotEmpty) {
                 _transcriptController.add(text);
             }
          }
        }
      }
    } catch (e) {
      print("❌ Message Parse Error: $e");
    }
  }

  void sendTextMessage(String text) {
     if (!_isConnected) return;
     final msg = {
       "clientContent": {
         "turns": [
           {
             "role": "user",
             "parts": [{"text": text}]
           }
         ],
         "turnComplete": true
       }
     };
     print("📤 Sending Text: $text");
     _channel?.sink.add(jsonEncode(msg));
  }

  /// Clean teardown
  Future<void> disconnect() async {
    if (!_isConnected) return;
    _isConnected = false;
    print("🛑 Disconnecting...");

    // 1. Stop Recorder
    await _audioRecorder.stop();
    await _audioSub?.cancel();
    _audioSub = null;

    // 2. Close WebSocket
    await _channel?.sink.close();
    _channel = null;

    // 3. Stop Player
    await _player.stop(); // Soloud stop
    
    print("✅ Disconnected Cleanly");
  }
}
