// Full Pipeline Test: Backend → AI Response → TTS → Audio
// Tests: Session creation, WebSocket connection, AI response, TTS synthesis

import 'dart:io';
import 'dart:convert';
import 'dart:async';
import 'package:web_socket_channel/io.dart';
import 'package:http/http.dart' as http;

const BACKEND_URL = 'https://rizik-backend.its-sabbir69.workers.dev';

void main() async {
  print('🧪 FULL PIPELINE TEST - Rizik Voice');
  print('=' * 50);
  
  try {
    // Step 1: Get TTS Config
    print('\n📋 Step 1: Getting TTS Config...');
    final configRes = await http.get(Uri.parse('$BACKEND_URL/api/voice/config'));
    if (configRes.statusCode != 200) {
      print('❌ Config failed: ${configRes.statusCode}');
      return;
    }
    final config = jsonDecode(configRes.body);
    print('✅ TTS Config: ${config['voice_config']['default_voice']}');
    print('   Sec-MS-GEC: ${config['sec_ms_gec'].substring(0, 16)}...');
    
    // Step 2: Create Session
    print('\n📞 Step 2: Creating Calls Session...');
    final sessionRes = await http.post(
      Uri.parse('$BACKEND_URL/api/voice/session'),
      headers: {'Content-Type': 'application/json'},
    );
    if (sessionRes.statusCode != 200) {
      print('❌ Session failed: ${sessionRes.statusCode} - ${sessionRes.body}');
      return;
    }
    final sessionData = jsonDecode(sessionRes.body);
    if (sessionData['sessionId'] == null) {
      print('❌ Session failed: ${sessionRes.body}');
      return;
    }
    print('✅ Session ID: ${sessionData['sessionId'].substring(0, 20)}...');
    
    // Step 3: Connect WebSocket
    print('\n🔌 Step 3: Connecting WebSocket to Brain...');
    final wsUrl = BACKEND_URL.replaceFirst('https://', 'wss://') + '/api/voice/connect';
    print('   URL: $wsUrl');
    
    final completer = Completer<void>();
    String? aiResponse;
    
    final channel = IOWebSocketChannel.connect(Uri.parse(wsUrl));
    
    channel.stream.listen(
      (message) {
        print('📩 Received: $message');
        try {
          final data = jsonDecode(message);
          if (data['type'] == 'ping') {
            print('🏓 Ping received: ${data['message']}');
          } else if (data['type'] == 'ai_response') {
            aiResponse = data['text'];
            print('🗣️ AI Response: $aiResponse');
            completer.complete();
          }
        } catch (e) {
          print('📝 Raw message: $message');
        }
      },
      onError: (error) {
        print('❌ WebSocket Error: $error');
        if (!completer.isCompleted) completer.completeError(error);
      },
      onDone: () {
        print('🔌 WebSocket closed');
        if (!completer.isCompleted) completer.complete();
      },
    );
    
    // Wait a bit for connection, then send ready signal
    await Future.delayed(Duration(milliseconds: 500));
    print('\n📤 Sending ready signal...');
    channel.sink.add(jsonEncode({'type': 'ready'}));
    
    // Wait for AI response (max 30 seconds)
    try {
      await completer.future.timeout(Duration(seconds: 30));
    } on TimeoutException {
      print('⏰ Timeout waiting for AI response');
    }
    
    channel.sink.close();
    
    // Step 4: Test TTS with AI response or fallback
    if (aiResponse == null) {
      aiResponse = 'হ্যালো, আমি রিজিক। আপনাকে সাহায্য করতে পারব।';
      print('\n⚠️ Using fallback text for TTS test');
    }
    
    print('\n🔊 Step 4: Testing Edge TTS...');
    await testEdgeTTS(config, aiResponse!);
    
    print('\n' + '=' * 50);
    print('✅ PIPELINE TEST COMPLETE!');
    
  } catch (e, stack) {
    print('❌ Error: $e');
    print(stack);
  }
  
  exit(0);
}

Future<void> testEdgeTTS(Map<String, dynamic> config, String text) async {
  final connectionId = DateTime.now().millisecondsSinceEpoch.toRadixString(16).padLeft(32, '0');
  final secMsGec = config['sec_ms_gec'];
  
  final wsUri = Uri.parse(
    '${config['wss_url']}?TrustedClientToken=${config['trusted_client_token']}'
    '&ConnectionId=$connectionId'
    '&Sec-MS-GEC=$secMsGec'
    '&Sec-MS-GEC-Version=1-130.0.2849.68'
  );
  
  print('   Connecting to Edge TTS...');
  
  final ws = await WebSocket.connect(
    wsUri.toString(),
    headers: {
      'User-Agent': config['headers']['User-Agent'],
      'Origin': config['headers']['Origin'],
    },
  );
  
  // Send config
  final timestamp = DateTime.now().toUtc().toIso8601String().replaceAll('Z', '000Z');
  ws.add(
    'Path: speech.config\r\n'
    'X-RequestId: $connectionId\r\n'
    'X-Timestamp: $timestamp\r\n'
    'Content-Type: application/json\r\n'
    '\r\n'
    '{"context":{"synthesis":{"audio":{"metadataOptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}'
  );
  
  await Future.delayed(Duration(milliseconds: 100));
  
  // Send SSML
  final ssml = '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="bn-BD">'
    '<voice name="${config['voice_config']['default_voice']}">'
    '<prosody rate="${config['voice_config']['rate']}" pitch="${config['voice_config']['pitch']}">'
    '$text'
    '</prosody></voice></speak>';
  
  ws.add(
    'Path: ssml\r\n'
    'X-RequestId: $connectionId\r\n'
    'X-Timestamp: $timestamp\r\n'
    'Content-Type: application/ssml+xml\r\n'
    '\r\n'
    '$ssml'
  );
  
  print('   SSML sent: "${text.substring(0, text.length > 30 ? 30 : text.length)}..."');
  
  int audioBytes = 0;
  final audioCompleter = Completer<void>();
  
  ws.listen(
    (data) {
      if (data is List<int>) {
        audioBytes += data.length;
        print('   📦 Audio chunk: ${data.length} bytes (total: $audioBytes)');
      } else if (data is String) {
        if (data.contains('turn.end')) {
          print('   ✅ TTS complete!');
          audioCompleter.complete();
        } else if (data.contains('Path:audio')) {
          // Audio metadata
        } else {
          print('   📝 TTS msg: ${data.length > 100 ? data.substring(0, 100) + "..." : data}');
        }
      }
    },
    onError: (e) {
      print('   ❌ TTS Error: $e');
      if (!audioCompleter.isCompleted) audioCompleter.completeError(e);
    },
    onDone: () {
      if (!audioCompleter.isCompleted) audioCompleter.complete();
    },
  );
  
  try {
    await audioCompleter.future.timeout(Duration(seconds: 15));
  } on TimeoutException {
    print('   ⏰ TTS timeout');
  }
  
  await ws.close();
  print('   Total audio: $audioBytes bytes');
  
  if (audioBytes > 0) {
    print('   🔊 TTS SUCCESS - Audio generated!');
  } else {
    print('   ⚠️ No audio generated');
  }
}
