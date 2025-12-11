import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:web_socket_channel/io.dart';

// Standalone Test Script for Gemini Live API
// Usage: dart terminal_test.dart

void main() async {
  print("🚀 Starting Gemini Live API Terminal Test...");

  const apiKey = 'AIzaSyApPdpkGkubCYo2Hv4qYKqDgw-rPSLQzDM'; // New Key
  const model = 'models/gemini-2.0-flash-exp';

  final uri = Uri.parse(
    'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=$apiKey'
  );

  print("🔌 Connecting to: $uri");

  try {
    final channel = IOWebSocketChannel.connect(uri);

    // Stream Listener
    channel.stream.listen((message) {
      final response = jsonDecode(message);
      
      print("\n📥 --- RECEIVED FRAME ---");
      if (response.containsKey('serverContent')) {
        print("✅ Server Content");
        final content = response['serverContent'];
        if (content.containsKey('modelTurn')) {
            final parts = content['modelTurn']['parts'] as List;
            for (var part in parts) {
                if (part.containsKey('text')) {
                    print("📝 TEXT: ${part['text']}");
                }
                if (part.containsKey('inlineData')) {
                     final data = part['inlineData']['data'] as String;
                     print("🔊 AUDIO: ${data.length} bytes (Base64)");
                }
            }
        }
      } else {
        print("ℹ️ Other: ${response.keys.toList()}");
        print(message);
      }
    }, onError: (e) {
      print("🚨 SEVERE ERROR: $e");
    }, onDone: () {
      print("❌ Disconnected by Server");
      print("   Code: ${channel.closeCode}");
      print("   Reason: ${channel.closeReason}");
    });

    // Send Setup
    final setup = {
      "setup": {
        "model": model,
        "generation_config": {
          "response_modalities": ["AUDIO", "TEXT"],
          "speech_config": {
            "voice_config": { "prebuilt_voice_config": { "voice_name": "Puck" } }
          }
        },
        "system_instruction": {
            "parts": [{ "text": "Hello. Say 'Test Successful' in Bengali." }]
        }
      }
    };
    
    print("📤 Sending Setup...");
    channel.sink.add(jsonEncode(setup));

    // Send a text trigger to ensure it responds
    await Future.delayed(Duration(seconds: 2));
    final trigger = {
      "client_content": {
        "turns": [
          {
            "role": "user",
            "parts": [{"text": "Hello, are you hearing me?"}]
          }
        ],
        "turn_complete": true
      }
    };
    print("📤 Sending Trigger Text...");
    channel.sink.add(jsonEncode(trigger));

    // Keep alive for a bit
    await Future.delayed(Duration(seconds: 10));
    print("🔚 Test Finished.");
    exit(0);

  } catch (e) {
    print("🚨 EXCEPTION: $e");
  }
}
