import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:http/http.dart' as http;
import 'package:rizik_v4/data/remote/api_service.dart';

/// Service for voice input processing using 'record' package
/// Implements the "Cloudflare Native AI Chain": Audio -> Backend -> Audio
class VoiceInputService {
  final AudioRecorder _audioRecorder = AudioRecorder();
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isListening = false;
  
  bool get isListening => _isListening;

  /// Start listening/recording
  Future<bool> startListening({
    required Function(String) onResult, 
  }) async {
    try {
      if (await _audioRecorder.hasPermission()) {
        final directory = await getApplicationDocumentsDirectory();
        final path = '${directory.path}/voice_command_${DateTime.now().millisecondsSinceEpoch}.m4a';
        
        await _audioRecorder.start(const RecordConfig(), path: path);
        _isListening = true;
        debugPrint('VoiceInputService: Started recording to $path');
        return true;
      } else {
        debugPrint('VoiceInputService: Permission denied');
        return false;
      }
    } catch (e) {
      debugPrint('VoiceInputService: Error starting recording: $e');
      return false;
    }
  }

  /// Stop listening/recording and return file path
  Future<String?> stopListening() async {
    try {
      if (!_isListening) return null;
      
      final path = await _audioRecorder.stop();
      _isListening = false;
      debugPrint('VoiceInputService: Stopped recording at $path');
      return path;
    } catch (e) {
      debugPrint('VoiceInputService: Error stopping recording: $e');
      return null;
    }
  }

  /// Process audio file: Upload -> Cloudflare AI Chain -> Play Audio Response
  /// Returns a map with 'transcript' and 'response' if successful.
  Future<Map<String, String>?> processAudio(String filePath) async {
    try {
      debugPrint('VoiceInputService: Uploading audio to Cloudflare AI Chain...');
      
      // 1. Upload to Backend
      final uri = Uri.parse('${ApiService.baseUrl}/api/ai/voice-chat');
      final request = http.Request('POST', uri);
      
      final file = await File(filePath).readAsBytes();
      request.bodyBytes = file;
      
      final response = await request.send();
      
      if (response.statusCode == 200) {
        debugPrint('VoiceInputService: Received audio response from backend.');
        
        // Extract metadata from headers
        final transcript = response.headers['x-transcript'] ?? '';
        final aiResponse = response.headers['x-ai-response'] ?? '';
        
        debugPrint('VoiceInputService: Transcript: $transcript');
        debugPrint('VoiceInputService: AI Response: $aiResponse');

        // 2. Play Returned Audio
        final responseBytes = await response.stream.toBytes();
        final directory = await getApplicationDocumentsDirectory();
        final responsePath = '${directory.path}/ai_response_${DateTime.now().millisecondsSinceEpoch}.mp3';
        final responseFile = File(responsePath);
        await responseFile.writeAsBytes(responseBytes);
        
        debugPrint('VoiceInputService: Playing response from $responsePath');
        await _audioPlayer.play(DeviceFileSource(responsePath));
        
        return {
          'transcript': transcript,
          'response': aiResponse,
        };
      } else {
        final errorBody = await response.stream.bytesToString();
        debugPrint('VoiceInputService: Backend error: ${response.statusCode} - $errorBody');
        return null;
      }
    } catch (e) {
      debugPrint('VoiceInputService: Error processing audio: $e');
      return null;
    }
  }
  /// Process text input: Upload -> Cloudflare AI Chain (Llama) -> Play Audio Response
  Future<Map<String, String>?> processText(String text) async {
    try {
      debugPrint('VoiceInputService: Uploading text to Cloudflare AI Chain...');
      
      final uri = Uri.parse('${ApiService.baseUrl}/api/ai/voice-chat');
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'text': text}),
      );
      
      if (response.statusCode == 200) {
        debugPrint('VoiceInputService: Received audio response from backend.');
        
        final transcript = response.headers['x-transcript'] ?? text;
        final aiResponse = response.headers['x-ai-response'] ?? '';
        
        final responseBytes = response.bodyBytes;
        final directory = await getApplicationDocumentsDirectory();
        final responsePath = '${directory.path}/ai_response_${DateTime.now().millisecondsSinceEpoch}.mp3';
        final responseFile = File(responsePath);
        await responseFile.writeAsBytes(responseBytes);
        
        debugPrint('VoiceInputService: Playing response from $responsePath');
        await _audioPlayer.play(DeviceFileSource(responsePath));
        
        return {
          'transcript': transcript,
          'response': aiResponse,
        };
      } else {
        debugPrint('VoiceInputService: Backend error: ${response.statusCode} - ${response.body}');
        return null;
      }
    } catch (e) {
      debugPrint('VoiceInputService: Error processing text: $e');
      return null;
    }
  }

  /// Check permissions
  Future<bool> checkPermission() async {
    return await Permission.microphone.request().isGranted;
  }

  /// Dispose recorder and player
  void dispose() {
    _audioRecorder.dispose();
    _audioPlayer.dispose();
  }
}
