import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:record/record.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
import 'package:rizik_v4/core/config/env_config.dart';

class VoiceModeScreen extends StatefulWidget {
  const VoiceModeScreen({super.key});

  @override
  State<VoiceModeScreen> createState() => _VoiceModeScreenState();
}

class _VoiceModeScreenState extends State<VoiceModeScreen> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final _audioRecorder = AudioRecorder();
  final _audioPlayer = AudioPlayer();
  
  bool _isRecording = false;
  bool _isProcessing = false;
  bool _isPlaying = false;
  String _statusText = "Tap the Orb to Speak";
  String? _lastResponse;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    _initPermissions();
  }

  Future<void> _initPermissions() async {
    await Permission.microphone.request();
  }

  @override
  void dispose() {
    _controller.dispose();
    _audioRecorder.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _toggleRecording() async {
    if (_isProcessing || _isPlaying) return;

    if (_isRecording) {
      // Stop Recording
      final path = await _audioRecorder.stop();
      setState(() {
        _isRecording = false;
        _statusText = "Processing...";
        _isProcessing = true;
      });
      if (path != null) {
        await _sendAudioToBackend(path);
      }
    } else {
      // Start Recording
      if (await _audioRecorder.hasPermission()) {
        final directory = await getApplicationDocumentsDirectory();
        final path = '${directory.path}/voice_command.m4a';
        
        await _audioRecorder.start(const RecordConfig(), path: path);
        setState(() {
          _isRecording = true;
          _statusText = "Listening...";
        });
      }
    }
  }

  Future<void> _sendAudioToBackend(String filePath) async {
    try {
      final file = File(filePath);
      final bytes = await file.readAsBytes();

      // 2. Send to Backend
      final uri = Uri.parse('${EnvConfig.backendUrl}/api/ai/voice-chat');
      
      final request = http.MultipartRequest('POST', uri)
        ..files.add(await http.MultipartFile.fromPath('audio', filePath, filename: 'audio.m4a'));

      final response = await request.send();
      final responseBody = await response.stream.bytesToString();

      if (response.statusCode == 200) {
        final data = jsonDecode(responseBody);
        final aiText = data['response'];
        // Note: If backend returns audio URL, we play it here.
        // For now, we just show the text.
        
        setState(() {
          _lastResponse = aiText;
          _statusText = "Tap to Reply";
          _isProcessing = false;
        });
      } else {
        setState(() {
          _statusText = "Error: ${response.statusCode}";
          _isProcessing = false;
        });
      }
    } catch (e) {
      print('Error sending audio: $e');
      setState(() {
        _statusText = "Connection Error";
        _isProcessing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // AI Orb Animation
          GestureDetector(
            onTap: _toggleRecording,
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, child) {
                return Container(
                  width: 200 + (_isRecording ? _controller.value * 20 : 0),
                  height: 200 + (_isRecording ? _controller.value * 20 : 0),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: RadialGradient(
                      colors: [
                        _isRecording ? Colors.redAccent : RizikBrandColors.brandPurple,
                        Colors.black,
                      ],
                      stops: const [0.2, 1.0],
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (_isRecording ? Colors.red : RizikBrandColors.brandPurple).withOpacity(0.5),
                        blurRadius: 30 + (_controller.value * 20),
                        spreadRadius: 5,
                      )
                    ],
                  ),
                  child: Center(
                    child: Icon(
                      _isRecording ? Icons.mic : Icons.mic_none,
                      color: Colors.white,
                      size: 64,
                    ),
                  ),
                );
              },
            ),
          ),
          
          const SizedBox(height: 40),
          
          // Status Text
          Text(
            _statusText,
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 24,
              fontWeight: FontWeight.w300,
            ),
          ),
          
          const SizedBox(height: 20),
          
          // AI Response Text
          if (_lastResponse != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _lastResponse!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
