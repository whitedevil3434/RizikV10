import 'dart:async';
import 'dart:io'; // 🔥 Required for Platform check
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:livekit_client/livekit_client.dart';
import 'package:rizik_v4/core/config/env_config.dart';



/// LiveKit Voice Service - Replaces Cloudflare Calls
/// Connects to LiveKit Cloud and streams audio to Python Agent
class LiveKitService {
  // LiveKit Configuration
  static const String _livekitUrl = 'wss://rizik-ai-femz194x.livekit.cloud';
  
  Room? _room;
  LocalAudioTrack? _localAudioTrack;
  EventsListener<RoomEvent>? _listener;
  
  // Stream Controllers for UI updates
  final StreamController<String> _aiResponseController = StreamController.broadcast();
  final StreamController<String> _sttResultController = StreamController.broadcast();
  final StreamController<void> _interruptController = StreamController.broadcast();
  
  // Public Streams
  Stream<String> get aiStream => _aiResponseController.stream;
  Stream<String> get sttStream => _sttResultController.stream;
  Stream<void> get interruptStream => _interruptController.stream;
  
  // Connection State
  bool get isConnected => _room?.connectionState == ConnectionState.connected;
  
  /// Initialize the service
  Future<void> init() async {
    print("✅ LiveKit Service Initialized");
  }

  /// Get authentication token from backend
  Future<String> _getToken(String roomName, String participantName) async {
    final url = Uri.parse('${EnvConfig.backendUrl}/api/token'); // Vercel path
    
    try {
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'room': roomName,
          'participant': participantName,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['token'] as String;
      } else {
        throw Exception('Failed to get token: ${response.statusCode}');
      }
    } catch (e) {
      print("❌ Token fetch error: $e");
      rethrow;
    }
  }

  /// Connect to LiveKit room
  Future<void> connect({
    required String roomName,
    required String participantName,
  }) async {
    try {
      print("🔌 Connecting to LiveKit room: $roomName");
      
      // 1. Get authentication token
      final token = await _getToken(roomName, participantName);
      print("✅ Token received");
      
      // 2. Create room with options
      _room = Room(
        roomOptions: RoomOptions(
          adaptiveStream: true,
          dynacast: true,
          defaultAudioPublishOptions: const AudioPublishOptions(
            dtx: true,
            audioBitrate: 24000, // 🔥 Apex Fix: Ensure proper Opus encoding
          ),
        ),
      );
      
      // 3. Set up event listeners
      _setupRoomListeners();
      
      // 4. Connect to room
      await _room!.connect(_livekitUrl, token);
      print("✅ Connected to LiveKit room!");
      
      // 5. Enable microphone
      await _room!.localParticipant?.setMicrophoneEnabled(true);
      print("🎤 Microphone enabled");

      // 🔥 FIX: Force Speaker Output (Critical for Mobile/macOS)
      try {
        await Hardware.instance.setSpeakerphoneOn(true);
        print("🔊 Forced Speakerphone: ON");
      } catch (e) {
        print("⚠️ Failed to set speakerphone: $e");
      }
      
      // 6. Debug: Check audio track status
      final localParticipant = _room!.localParticipant;
      if (localParticipant != null) {
        print("👤 Local Participant: ${localParticipant.identity}");
        print("🔊 Audio Tracks Published: ${localParticipant.audioTrackPublications.length}");
        for (var pub in localParticipant.audioTrackPublications) {
          print("   📡 Track: ${pub.name}, muted: ${pub.muted}, subscribed: ${pub.subscribed}");
          final track = pub.track;
          if (track != null) {
            print("   🎙️ Track active: ${!track.muted}, kind: ${track.kind}");
          } else {
            print("   ⚠️ Track is NULL!");
          }
        }
        print("🎤 isMicrophoneEnabled: ${localParticipant.isMicrophoneEnabled()}");
      } else {
        print("❌ Local Participant is NULL!");
      }
      
    } catch (e) {
      print("❌ LiveKit connection error: $e");
      rethrow;
    }
  }

  /// Set up room event listeners
  void _setupRoomListeners() {
    if (_room == null) return;
    
    _listener = _room!.createListener();
    
    _listener!
      ..on<TrackPublishedEvent>((event) {
        print("📡 Track published by ${event.participant.identity}: ${event.publication.name}");
      })
      ..on<TrackSubscribedEvent>((event) {
        print("🎧 Track subscribed from ${event.participant.identity}");
        if (event.track is AudioTrack) {
          _handleAgentAudio(event.track as AudioTrack);
        }
      })
      ..on<DataReceivedEvent>((event) {
        _handleDataMessage(event.data, event.topic);
      })
      ..on<RoomDisconnectedEvent>((event) {
        print("🛑 Disconnected from room: ${event.reason}");
      });
  }

  /// Handle data channel messages from agent (STT results, AI responses)
  void _handleDataMessage(List<int> data, String? topic) {
    try {
      final message = utf8.decode(data);
      print("📨 Data message [${topic ?? 'default'}]: $message");
      
      // Try to parse as JSON
      try {
        final json = jsonDecode(message);
        
        switch (json['type']) {
          case 'stt_result':
            _sttResultController.add(json['text'] as String);
            break;
          case 'ai_response':
            _aiResponseController.add(json['text'] as String);
            break;
          case 'interrupt':
            _interruptController.add(null);
            break;
          default:
            print("📝 Message: ${json['type']}");
        }
      } catch (e) {
        // Not JSON, treat as plain text transcript
        if (topic == 'lk.transcription') {
          _sttResultController.add(message);
        }
      }
    } catch (e) {
      print("⚠️ Data message decode error: $e");
    }
  }

  /// Handle audio from the agent (TTS playback)
  void _handleAgentAudio(AudioTrack track) {
    print("🔊 Handling agent audio track - starting playback");
    // 🔥 FIX: Explicitly start and MAX volume
    if (track is RemoteAudioTrack) {
      track.start();
      print("🔊 Audio Started (Speakerphone: ON)");
    }
  }

  /// Send text message to agent via data channel
  Future<void> sendTextInput(String text) async {
    if (_room == null || !isConnected) {
      print("⚠️ Cannot send: Not connected");
      return;
    }

    final message = jsonEncode({
      'type': 'text_input',
      'text': text,
    });

    await _room!.localParticipant?.publishData(
      utf8.encode(message),
      topic: 'chat',
    );
    print("📤 Sent text input: $text");
  }

  /// Disconnect from room
  Future<void> disconnect() async {
    print("🛑 Disconnecting from LiveKit...");
    
    _listener?.dispose();
    _listener = null;
    
    await _localAudioTrack?.stop();
    _localAudioTrack = null;
    
    await _room?.disconnect();
    _room = null;
    
    print("✅ Disconnected");
  }

  /// Cleanup resources
  void dispose() {
    _aiResponseController.close();
    _sttResultController.close();
    _interruptController.close();
    disconnect();
  }
}
