
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
import 'package:flutter_webrtc/flutter_webrtc.dart';

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

      final wsUrl = Uri.parse('${EnvConfig.backendUrl}/api/chat/room/voice_demo/ws').replace(scheme: 'wss');
      _signalChannel = WebSocketChannel.connect(wsUrl);
      _signalChannel!.stream.listen(_handleSignal);

      await _connectWebRTC();

      state = state.copyWith(status: VoiceSessionStatus.connected);
      _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);
    } catch (e) {
      state = state.copyWith(status: VoiceSessionStatus.disconnected, error: e.toString());
    }
  }

  Future<void> _connectWebRTC() async {
    final response = await http.post(Uri.parse('${EnvConfig.backendUrl}/api/chat/room/voice_demo/session'));
    final sessionData = jsonDecode(response.body);
    final sessionId = sessionData['sessionId'];

    _peerConnection = await createPeerConnection({
      'iceServers': [{'urls': 'stun:stun.cloudflare.com:3478'}]
    });

    _localStream = await navigator.mediaDevices.getUserMedia({'audio': true});
    _localStream!.getTracks().forEach((track) {
      _peerConnection!.addTrack(track, _localStream!);
    });

    print("✅ WebRTC Session: $sessionId");
  }

  void _handleSignal(dynamic data) {
    try {
      final msg = jsonDecode(data);
      
      // 🌊 STREAMING LOGIC
      if (msg['type'] == 'text_stream') {
        final token = msg['content'];
        
        // 1. Update UI (Append Mode)
        _updateLastTranscript(token);
        
        // 2. Speak Immediately (No waiting for full sentence in V1)
        _ttsClient.synthesize(token);
        _ref.read(mojoProvider.notifier).setMojoState(MojoState.speaking);
        
        Future.delayed(const Duration(milliseconds: 300), () {
           if (mounted) _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);
        });
      }
    } catch (e) {
      print('Signal Error: $e');
    }
  }

  void _updateLastTranscript(String token) {
    final currentList = List<TranscriptEntry>.from(state.transcripts);
    
    if (currentList.isNotEmpty && !currentList.last.isUser) {
      // Append to last AI message
      final lastMsg = currentList.removeLast();
      currentList.add(TranscriptEntry(text: lastMsg.text + token, isUser: false));
    } else {
      // Start new AI message
      currentList.add(TranscriptEntry(text: token, isUser: false));
    }
    
    state = state.copyWith(transcripts: currentList);
  }

  void sendText(String text) {
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
