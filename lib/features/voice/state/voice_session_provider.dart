import 'dart:io';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/services/cloudflare_agent_service.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:rizik_v4/services/tts/edge_tts_client.dart';
import 'package:rizik_v4/services/player/universal_player.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart';
import 'package:record/record.dart';
import 'dart:typed_data';
import 'dart:async';

enum VoiceSessionStatus { disconnected, connecting, connected }

class TranscriptEntry {
  final String text;
  final bool isUser;
  TranscriptEntry({required this.text, required this.isUser});
}

class VoiceSessionState {
  final VoiceSessionStatus status;
  final List<TranscriptEntry> transcripts;
  final double currentAmplitude; 
  final String? error;

  VoiceSessionState({
    this.status = VoiceSessionStatus.disconnected,
    this.transcripts = const [],
    this.currentAmplitude = 0.0,
    this.error,
  });

  VoiceSessionState copyWith({
    VoiceSessionStatus? status,
    List<TranscriptEntry>? transcripts,
    double? currentAmplitude,
    String? error,
  }) {
    return VoiceSessionState(
      status: status ?? this.status,
      transcripts: transcripts ?? this.transcripts,
      currentAmplitude: currentAmplitude ?? this.currentAmplitude,
      error: error ?? this.error,
    );
  }
}

final voiceSessionProvider = StateNotifierProvider.autoDispose<VoiceSessionNotifier, VoiceSessionState>((ref) {
  final agentService = CloudflareAgentService();
  return VoiceSessionNotifier(agentService, ref);
});

// -----------------------------------------------------------------------------
// 2. Controller/Notifier (Logic Layer)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// 2. Controller/Notifier (Logic Layer)
// -----------------------------------------------------------------------------
class VoiceSessionNotifier extends StateNotifier<VoiceSessionState> {
  final CloudflareAgentService _agentService;
  final Ref _ref;
  final RizikEdgeTTSClient _ttsClient = RizikEdgeTTSClient();
  final UniversalPlayer _audioPlayer = UniversalPlayer();
  final AudioRecorder _audioRecorder = AudioRecorder();
  StreamSubscription? _recordSub;
  StreamSubscription? _ttsSub;
  StreamSubscription? _turnEndSub;
  StreamSubscription? _sttSub;
  final List<int> _mp3Buffer = [];
  
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;

  bool _isDisposed = false;

  VoiceSessionNotifier(this._agentService, this._ref) : super(VoiceSessionState());

  @override
  bool get mounted => !_isDisposed;

  Future<void> startSession() async {
    if (state.status == VoiceSessionStatus.connected || state.status == VoiceSessionStatus.connecting) return;

    // 0. Permission Check
    try {
      var status = await Permission.microphone.status;
      if (!status.isGranted) {
        status = await Permission.microphone.request();
        if (status != PermissionStatus.granted) {
           print("❌ Microphone permission denied");
           state = state.copyWith(error: "Microphone permission denied");
           return;
        }
      }
    } catch (e) {
      print("⚠️ Permission check failed (likely Desktop): $e");
      // Continue anyway, as getUserMedia triggers OS prompt on MacOS/Windows
    }

    state = state.copyWith(status: VoiceSessionStatus.connecting, error: null);

    try {
      // 1. Get Session ID from Backend via HTTP
      final sessionData = await _agentService.createSession();
      final sessionId = sessionData['sessionId']!;
      final callsAppId = sessionData['callsAppId']!;

      print("✅ Starting WebRTC Session: $sessionId");

      // 2. Initialize WebRTC Logic
      _peerConnection = await createPeerConnection({
        'iceServers': [{'urls': 'stun:stun.cloudflare.com:3478'}]
      });

      // 3. Audio Input (Microphone) via WebRTC
      _localStream = await navigator.mediaDevices.getUserMedia({'audio': true});
      _localStream!.getTracks().forEach((track) {
        _peerConnection!.addTrack(track, _localStream!);
      });

      // 4. Handle Tracks from Remote (Agent Audio)
      _peerConnection!.onTrack = (event) {
        if (event.track.kind == 'audio') {
           final remoteStream = event.streams[0];
           print("🎧 Remote Audio Track Received: ${remoteStream.id}");
        }
      };

      // 5. Create Offer & Set Local Description
      final offer = await _peerConnection!.createOffer();
      await _peerConnection!.setLocalDescription(offer);
      
      // 🔥 FIX: Connect to Brain WebSocket BEFORE track negotiation
      // so we don't miss the AI response sent during processAudioLoop
      _agentService.connectBrain();
      await _audioPlayer.initialize(sampleRate: 24000);
      await _ttsClient.connect();
      
      // Listen for AI Responses (set up BEFORE track negotiation triggers AI)
      _agentService.aiStream.listen((text) {
        print("🗣️ [CLIENT] Received AI Response: $text");
        // A. Update UI
        if (!_isDisposed) {
          final newEntry = TranscriptEntry(text: text, isUser: false);
          state = state.copyWith(
            transcripts: [...state.transcripts, newEntry],
          );
        }
        // B. Speak (TTS)
        _ttsClient.synthesize(text);
      });
      
      // 🔥 Listen for User Transcripts (STT Feedback)
      // 🔥 Listen for User Transcripts (STT Feedback)
      _sttSub?.cancel(); // Cancel potential duplicate
      _sttSub = _agentService.sttStream.listen((text) {
         print("🎤 [CLIENT] Received User Transcript: $text");
         if (!_isDisposed) {
            final newEntry = TranscriptEntry(text: text, isUser: true);
            state = state.copyWith(
              transcripts: [...state.transcripts, newEntry],
            );
         }
      });

      // 🔥 Listen for Interrupt Signal (Barge-In)
      _agentService.interruptStream.listen((_) {
         print("🛑 [CLIENT] Barge-In Triggered! Stopping TTS...");
         if (!_isDisposed) {
             _ttsClient.stop(); // Stop fetching
             _audioPlayer.stop(); // Stop playing
             _mp3Buffer.clear(); // Clear buffer
         }
      });
      
      // Play TTS Audio in UI
      // Play TTS Audio in UI
      // Play TTS Audio in UI (MP3 Buffering Strategy)
      _ttsSub = _ttsClient.audioStream.listen((audioBytes) {
         _mp3Buffer.addAll(audioBytes);
      });
      
      _turnEndSub = _ttsClient.turnEndStream.listen((_) {
         if (_mp3Buffer.isNotEmpty && !_isDisposed) {
             print("🔊 [CLIENT] Playing Full Turn MP3: ${_mp3Buffer.length} bytes");
             _audioPlayer.playAudio(Uint8List.fromList(_mp3Buffer));
             _mp3Buffer.clear();
         }
      });
      
      // 🎤 Start Recording Audio for Voice-to-Brain
      try {
        bool hasPerm = false;
        if (Platform.isMacOS) {
           print("🖥️ Running on macOS - Assuming permissions (Entitlements verified)");
           hasPerm = true;
        } else {
           hasPerm = await _audioRecorder.hasPermission();
        }

        if (hasPerm) {
          final stream = await _audioRecorder.startStream(const RecordConfig(
            encoder: AudioEncoder.pcm16bits,
            sampleRate: 16000,
            numChannels: 1,
          ));
          
          _recordSub = stream.listen((chunk) {
            print("🎤 Sending ${chunk.length} bytes"); // Verbose
            _agentService.sendAudioChunk(chunk);
          });
          print("🎤 Audio Recorder Started (Streaming to Brain)");
        }
      } catch (e) {
        print("❌ Recorder Error: $e");
      }

      // 6. Signal Backend (Exchange SDP) - This triggers processAudioLoop
      final answerData = await _agentService.publishTrack(
        sessionId: sessionId,
        sdpOffer: offer.sdp!,
        trackName: "user_audio",
      );

      // 7. Set Remote Description (Answer)
      final answerSdp = answerData['sessionDescription']['sdp'];
      final answer = RTCSessionDescription(answerSdp, 'answer');
      await _peerConnection!.setRemoteDescription(answer);
      
      print("✅ WebRTC Handshake Complete!");
      
      // 🔥 FIX: Wait for WebSocket to fully connect before sending ready
      await Future.delayed(const Duration(milliseconds: 500));
      _agentService.sendReady();


      // For V1 MVP, we mark as connected once handshake is done.
      if (!_isDisposed) {
        state = state.copyWith(status: VoiceSessionStatus.connected);
        try {
          _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);
        } catch (e) {
          print("⚠️ Failed to update Mojo state: $e");
        }
      }

    } catch (e) {
      print("❌ WebRTC Connection Failed: $e");
      if (!_isDisposed) {
        state = state.copyWith(status: VoiceSessionStatus.disconnected, error: e.toString());
      }
    }
  }

  void _handleSignal(dynamic data) {
      // Placeholder for DataChannel logic
  }

  void sendText(String text) {
    // Also send user text to UI
    if (!_isDisposed) {
       final newEntry = TranscriptEntry(text: text, isUser: true);
       state = state.copyWith(
         transcripts: [...state.transcripts, newEntry],
       );
       
       // Send to backend via WebSocket
       _agentService.sendInput(text);
    }
  }

  Future<void> endSession() async {
    print("🛑 Ending Session...");
    try {
      await _recordSub?.cancel();
      _recordSub = null;
      await _ttsSub?.cancel();
      _ttsSub = null;
      await _turnEndSub?.cancel();
      _turnEndSub = null;
      await _sttSub?.cancel();
      _sttSub = null;
      _mp3Buffer.clear();

      try { // Safe stop
         if (await _audioRecorder.isRecording()) {
            await _audioRecorder.stop();
         }
      } catch (_) {}
      
      _ttsClient.dispose(); // Cleanup TTS
      await _audioPlayer.stop(); // Stop any audio
      if (_localStream != null) {
        _localStream!.getTracks().forEach((track) => track.stop());
        await _localStream?.dispose();
      }
      await _peerConnection?.close();
    } catch (e) {
      print("⚠️ Error closing WebRTC resources: $e");
    }
    
    _localStream = null;
    _peerConnection = null;
    
    if (!_isDisposed) {
        state = state.copyWith(status: VoiceSessionStatus.disconnected);
        try {
          _ref.read(mojoProvider.notifier).setMojoState(MojoState.idle);
        } catch (e) {
           // Ignore if provider is gone
        }
    }
  }

  @override
  void dispose() {
    _isDisposed = true;
    print("🗑️ VoiceSessionNotifier Disposed");
    endSession();
    _audioRecorder.dispose();
    super.dispose();
  }
}
