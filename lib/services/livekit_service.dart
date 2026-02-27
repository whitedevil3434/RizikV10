// import 'package:flutter_soloud/flutter_soloud.dart'; // Disabled for Web Build stability
import 'dart:async';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:livekit_client/livekit_client.dart';
import 'package:rizik_v4/core/config/env_config.dart';
import 'package:rizik_v4/services/tts/edge_tts_client.dart';

/// LiveKit Voice Service - Replaces Cloudflare Calls
/// Connects to LiveKit Cloud and streams audio to Python Agent
class LiveKitService {
  // LiveKit Configuration
  String get _livekitUrl => EnvConfig.livekitWsUrl;

  Room? _room;
  LocalAudioTrack? _localAudioTrack;
  EventsListener<RoomEvent>? _listener;

  // TTS & Audio Player (The Mouth 👄)
  final RizikEdgeTTSClient _edgeTts = RizikEdgeTTSClient();
  // final SoLoud _soloud = SoLoud.instance; // TODO: Restore
  // AudioSource? _ttsSource;
  StreamSubscription? _audioSub;

  // Stream Controllers for UI updates
  final StreamController<String> _aiResponseController =
      StreamController.broadcast();
  final StreamController<String> _sttResultController =
      StreamController.broadcast();
  final StreamController<void> _interruptController =
      StreamController.broadcast();

  // Public Streams
  Stream<String> get aiStream => _aiResponseController.stream;
  Stream<String> get sttStream => _sttResultController.stream;
  Stream<void> get interruptStream => _interruptController.stream;

  // Connection State
  bool get isConnected => _room?.connectionState == ConnectionState.connected;

  /// Initialize the service
  Future<void> init() async {
    print("✅ LiveKit Service Initialized");

    /* TODO: Restore Audio Playback
    // Initialize SoLoud (WASM Ready)
    if (!_soloud.isInitialized) {
       await _soloud.init();
    }
    
    // Create PCM Buffer Stream (24kHz Mono 16-bit)
    _ttsSource = await _soloud.setBufferStream(
      maxBufferSizeBytes: 1024 * 1024 * 10, // 10MB Buffer
      sampleRate: 24000,
      channels: 1,
    );
    
    // Initialize Playback
    if (_ttsSource != null) {
       await _soloud.play(_ttsSource!, paused: false);
    }
    */

    // Wire up TTS -> SoLoud
    _audioSub = _edgeTts.audioStream.listen((data) {
      /*
       if (_ttsSource != null) {
          _soloud.addAudioDataStream(_ttsSource!, data);
       }
       */
    });
  }

  /// Get authentication token from backend
  Future<String> _getToken(String roomName, String participantName) async {
    final baseUrl = EnvConfig.backendUrl;
    final endpoints = <String>[
      '$baseUrl/api/livekit/token',
      '$baseUrl/api/token',
    ];

    try {
      Exception? lastError;
      for (final endpoint in endpoints) {
        final url = Uri.parse(endpoint);
        try {
          final response = await http
              .post(
                url,
                headers: const {'Content-Type': 'application/json'},
                body: jsonEncode({
                  'room': roomName,
                  'participant': participantName,
                }),
              )
              .timeout(const Duration(seconds: 15));

          if (response.statusCode == 200) {
            final data = jsonDecode(response.body);
            final token = data['token'] as String?;
            if (token == null || token.isEmpty) {
              throw Exception('Empty token response from $endpoint');
            }
            final dispatched = data['dispatched'];
            final dispatchError = data['dispatchError'];
            if (dispatched is bool) {
              if (dispatched) {
                print('🤖 Agent dispatch acknowledged by token API');
              } else if (dispatchError != null) {
                print('⚠️ Agent dispatch not confirmed: $dispatchError');
              }
            }
            if (endpoint != endpoints.first) {
              print('ℹ️ Token endpoint fallback used: $endpoint');
            }
            return token;
          }

          lastError = Exception(
            'Failed to get token from $endpoint: '
            '${response.statusCode} - ${response.body}',
          );
        } catch (e) {
          lastError = Exception('Token fetch error from $endpoint: $e');
        }
      }
      throw lastError ??
          Exception('All token endpoints failed for base URL: $baseUrl');
    } catch (e) {
      print("❌ Token fetch error from $baseUrl: $e");
      print(
          "ℹ️ Set --dart-define=BACKEND_URL=<cloudflare-worker-url> or --dart-define=LOCAL_BACKEND=true");
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
        roomOptions: const RoomOptions(
          adaptiveStream: true,
          dynacast: true,
          defaultAudioPublishOptions: AudioPublishOptions(
            dtx: true,
            audioBitrate: 24000,
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
      // 🔥 FIX: Check for existing participants/tracks (The Agent might be waiting)
      for (var p in _room!.remoteParticipants.values) {
        print("👥 Found remote participant: ${p.identity}");
        for (var t in p.audioTrackPublications) {
          print("   Found track: ${t.sid}");
          if (t.track != null) {
            _handleAgentAudio(t.track as AudioTrack); // Force start
          } else {
            t.subscribe(); // Try manual subscribe
          }
        }
      }
      final localParticipant = _room!.localParticipant;
      if (localParticipant != null) {
        print("👤 Local Participant: ${localParticipant.identity}");
        print(
            "🔊 Audio Tracks Published: ${localParticipant.audioTrackPublications.length}");
        for (var pub in localParticipant.audioTrackPublications) {
          print(
              "   📡 Track: ${pub.name}, muted: ${pub.muted}, subscribed: ${pub.subscribed}");
          final track = pub.track;
          if (track != null) {
            print("   🎙️ Track active: ${!track.muted}, kind: ${track.kind}");
          } else {
            print("   ⚠️ Track is NULL!");
          }
        }
        print(
            "🎤 isMicrophoneEnabled: ${localParticipant.isMicrophoneEnabled()}");
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
        print(
            "📡 Track published by ${event.participant.identity}: ${event.publication.name}");
      })
      ..on<ParticipantConnectedEvent>((event) {
        print("👤 Remote Participant Connected: ${event.participant.identity}");
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

    // 🔥 MONITOR AUDIO LEVELS
    Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_room == null || !isConnected) {
        timer.cancel();
        return;
      }

      // Check Local Mic
      if (_room?.localParticipant != null) {
        final lp = _room!.localParticipant!;
        if (lp.isMicrophoneEnabled()) {
          // We can check audio level if available in metadata or track?
          // Actually LiveKit client provides 'audioLevel' on Participant
          print("🎤 Local Mic (Enabled): ${lp.audioLevel}");
        } else {
          print("🎤 Local Mic: DISABLED");
        }
      }

      // Check Remote Participants
      for (var p in _room!.remoteParticipants.values) {
        print(
            "👤 Remote ${p.identity}: Level ${p.audioLevel} | Speaking: ${p.isSpeaking}");
      }
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
            final text = json['text'] as String;
            _aiResponseController.add(text);
            // 🔥 Speak it!
            _edgeTts.synthesize(text);
            break;
          case 'interrupt':
            _interruptController.add(null);
            /*
            // Stop all active handles for this source
            for (final handle in _soloud.activeSoundHandles) {
                // Ideally check if valid?
                _soloud.stop(handle);
            }
            // Re-play the stream source to be ready for next
            if (_ttsSource != null) _soloud.play(_ttsSource!);
            */
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
    _audioSub?.cancel();
    _edgeTts.dispose();
    /*
    if (_ttsSource != null) {
      _soloud.disposeSource(_ttsSource!);
    }
    _soloud.deinit();
    */
    disconnect();
  }
}
