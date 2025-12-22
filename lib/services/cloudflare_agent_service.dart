import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:rizik_v4/core/config/env_config.dart';
import 'recorder/universal_recorder.dart'; 
import 'player/universal_player.dart'; 
import 'package:flutter/foundation.dart';

class CloudflareAgentService {
  // --- Configuration ---
  // API Key is now handled securely by the Cloudflare Agent!

  // --- State Variables ---
  WebSocketChannel? _channel;
  StreamSubscription? _audioSub;
  
  final UniversalRecorder _audioRecorder = UniversalRecorder(); 
  final UniversalPlayer _player = UniversalPlayer();
  final _audioStreamController = StreamController<Uint8List>.broadcast();

  bool _isConnected = false;

  // --- API Streams ---
  final _transcriptController = StreamController<String>.broadcast();
  Stream<String> get transcriptStream => _transcriptController.stream;

  /// Initializes audio sessions
  Future<void> init() async {
    if (!await _audioRecorder.hasPermission()) {
      print("❌ Microphone permission denied");
      return;
    }
    await _player.initialize(sampleRate: 24000); // StandardHz
    print("✅ Cloudflare Agent Service Initialized");
  }

  /// Connects to Cloudflare Voice Agent
  Future<void> connect() async {
    if (_isConnected) await disconnect(); 

    try {
      final url = EnvConfig.agentWebSocketUrl;
      print("🔌 Connecting to Agent: $url");
      
      _channel = WebSocketChannel.connect(Uri.parse(url));
      _isConnected = true;

      _channel!.stream.listen(
        (message) {
          if (!_isConnected) return;
          _handleIncomingData(message);
        },
        onError: (error) {
          print("🚨 socket Error: $error");
          disconnect();
        },
        onDone: () {
          print("🔌 Connection Closed");
          disconnect();
        },
      );

      // Start Sending Audio (No Setup Message needed for Stateful Agent)
      // Start Sending Audio (No Setup Message needed for Stateful Agent)
      await _startRecording(); 
      print("⏩ Starting Audio Recording...");

    } catch (e) {
      print("❌ Connection Failed: $e");
      disconnect();
    }
  }

  Future<void> _startRecording() async {
    await _audioSub?.cancel();
    
    // Stream Binary Audio directly
    _audioSub = _audioStreamController.stream.listen((data) {
       if (!_isConnected || _channel == null) return;
       // Sending RAW BINARY (Uint8List)
       // The Realtime Agent STT provider (Whisper) should handle valid audio frames
       _channel?.sink.add(data);
    });

    await _audioRecorder.start(_audioStreamController.sink);
    print("🎤 Streaming Audio to Cloudflare Agent");
  }

  void _handleIncomingData(dynamic message) {
    print("📩 Received Data Type: ${message.runtimeType}");
    try {
      // 1. Binary Audio (TTS Response)
      if (message is Uint8List || message is List<int>) {
        final bytes = Uint8List.fromList(message);
        print("🎧 Received Audio Chunk: ${bytes.length} bytes");
        // Use playAudio for full files (MP3/WAV) instead of playChunk (PCM stream)
        _player.playAudio(bytes);
        return;
      }

      // 2. JSON Messages (Transcripts / Tools)
      if (message is String) {
        final data = jsonDecode(message);
        
        // Handle Transcript
        if (data is Map && data.containsKey('transcript')) {
           _transcriptController.add(data['transcript']);
        }
        
        if (data is Map && data.containsKey('toolCall')) {
           print("🔧 Tool Call Received: ${data['toolCall']}");
           // TODO: Implement Tool Execution
        }

        // 3. Debug Logs (From Server)
        if (data is Map && data.containsKey('type') && data['type'] == 'debug_log') {
           print("🔍 Server: ${data['message']}");
        }
      }
    } catch (e) {
      print("⚠️ Parse Error: $e");
    }
  }

  void sendTextMessage(String text) {
     if (!_isConnected) return;
     print("📤 Sending Text: $text");
     final msg = jsonEncode({
       "type": "text_input",
       "text": text
     });
     _channel?.sink.add(msg);
  }

  Future<void> disconnect() async {
    if (!_isConnected) return;
    _isConnected = false;
    print("🛑 Disconnecting Agent...");

    try {
      await _audioStreamController.close();
      await _audioSub?.cancel();
    } catch (e) {
      print("⚠️ Error closing audio streams: $e");
    }
    _audioSub = null;
    
    try {
      if (_channel != null) {
        await _channel!.sink.close();
      }
    } catch (e) {
      print("⚠️ Error closing socket: $e");
    }
    _channel = null;

    // Wait a bit before killing the player to prevent FFI race conditions
    await Future.delayed(const Duration(milliseconds: 200));

    try {
      await _audioRecorder.stop();
      await _player.stop();
    } catch (e) {
      print("⚠️ Error stopping media: $e");
    }
  }
}
