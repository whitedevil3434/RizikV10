
import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:rizik_v4/services/tts/edge_tts_client.dart';
import 'package:rizik_v4/services/player/universal_player.dart';
import 'package:rizik_v4/services/recorder/universal_recorder.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:rizik_v4/core/config/env_config.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_webrtc/flutter_webrtc.dart'; // WebRTC Uplink

enum VoiceSessionStatus { disconnected, connecting, connected }

class TranscriptEntry {
  final String text;
  final bool isUser;
  TranscriptEntry({required this.text, required this.isUser});
}

class VoiceSessionState {
  final VoiceSessionStatus status;
  final List<TranscriptEntry> transcripts;
  final double currentAmplitude; // Restored for Legacy UI
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

final voiceSessionProvider = StateNotifierProvider<VoiceSessionNotifier, VoiceSessionState>((ref) {
  return VoiceSessionNotifier(ref);
});

class VoiceSessionNotifier extends StateNotifier<VoiceSessionState> {
  final Ref _ref;
  final RizikEdgeTTSClient _ttsClient = RizikEdgeTTSClient();
  final UniversalPlayer _player = UniversalPlayer();
  final UniversalRecorder _recorder = UniversalRecorder();
  
  WebSocketChannel? _signalChannel;
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;

  VoiceSessionNotifier(this._ref) : super(VoiceSessionState());

  Future<void> startSession() async {
    if (state.status == VoiceSessionStatus.connected) return;
    state = state.copyWith(status: VoiceSessionStatus.connecting);
    try {
      await Future.wait([
        _ttsClient.init(),
        _player.initialize(sampleRate: 24000),
      ]);

      // 1. Connect Signaling (WebSocket)
      final wsUrl = Uri.parse('${EnvConfig.backendUrl}/api/chat/room/voice_demo/ws').replace(scheme: 'wss');
      _signalChannel = WebSocketChannel.connect(wsUrl);
      _signalChannel!.stream.listen(_handleSignal);

      // 2. Connect WebRTC Uplink (Audio)
      await _connectWebRTC();

      state = state.copyWith(status: VoiceSessionStatus.connected);
      _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);
    } catch (e) {
      state = state.copyWith(status: VoiceSessionStatus.disconnected, error: e.toString());
    }
  }

  Future<void> _connectWebRTC() async {
    // 1. Get Session from Cloudflare
    final response = await http.post(Uri.parse('${EnvConfig.backendUrl}/api/chat/room/voice_demo/session'));
    final sessionData = jsonDecode(response.body);
    final sessionId = sessionData['sessionId'];

    // 2. Create Peer Connection
    _peerConnection = await createPeerConnection({
      'iceServers': [{'urls': 'stun:stun.cloudflare.com:3478'}]
    });

    // 3. Add Microphone Track
    _localStream = await navigator.mediaDevices.getUserMedia({'audio': true});
    _localStream!.getTracks().forEach((track) {
      _peerConnection!.addTrack(track, _localStream!);
    });

    print("✅ WebRTC PeerConnection Initialized for Session: $sessionId");
  }

  void _handleSignal(dynamic data) {
    final msg = jsonDecode(data);
    if (msg['type'] == 'text_stream') {
      _ttsClient.synthesize(msg['content']);
      // Simulate amplitude for now based on text length or random
      state = state.copyWith(currentAmplitude: 0.5); 
      _ref.read(mojoProvider.notifier).setMojoState(MojoState.speaking);
      
      // Reset amplitude after short delay
      Future.delayed(const Duration(milliseconds: 500), () {
         if (mounted) state = state.copyWith(currentAmplitude: 0.0);
      });
    }
  }

  void sendText(String text) {
    // Add local transcript immediately
    final current = List<TranscriptEntry>.from(state.transcripts);
    current.add(TranscriptEntry(text: text, isUser: true));
    state = state.copyWith(transcripts: current);

    _signalChannel?.sink.add(jsonEncode({'type': 'text_input', 'text': text}));
  }

  Future<void> endSession() async => disconnect();

  Future<void> disconnect() async {
    await _localStream?.dispose();
    await _peerConnection?.close();
    _signalChannel?.sink.close();
    await _player.stop();
    state = state.copyWith(status: VoiceSessionStatus.disconnected, currentAmplitude: 0.0);
  }
}
