
import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:rizik_v4/services/tts/edge_tts_client.dart';
import 'package:rizik_v4/services/player/universal_player.dart';
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
  final String? error;

  VoiceSessionState({
    this.status = VoiceSessionStatus.disconnected,
    this.transcripts = const [],
    this.error,
  });

  VoiceSessionState copyWith({
    VoiceSessionStatus? status,
    List<TranscriptEntry>? transcripts,
    String? error,
  }) {
    return VoiceSessionState(
      status: status ?? this.status,
      transcripts: transcripts ?? this.transcripts,
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
  
  WebSocketChannel? _signalChannel;
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;

  VoiceSessionNotifier(this._ref) : super(VoiceSessionState());

  Future<void> startSession() async {
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

    // 4. Create Offer & Send to Cloudflare (WHIP/WHEP Logic would go here)
    // For V1, we just establish the PeerConnection object to prove the Uplink.
    // Full WHIP exchange requires specific SDP negotiation which we will handle via the WebSocket signal channel in Phase 4.
    print("✅ WebRTC PeerConnection Initialized for Session: $sessionId");
  }

  void _handleSignal(dynamic data) {
    final msg = jsonDecode(data);
    if (msg['type'] == 'text_stream') {
      _ttsClient.synthesize(msg['content']);
      _ref.read(mojoProvider.notifier).setMojoState(MojoState.speaking);
    }
  }

  void sendText(String text) {
    _signalChannel?.sink.add(jsonEncode({'type': 'text_input', 'text': text}));
  }

  Future<void> disconnect() async {
    await _localStream?.dispose();
    await _peerConnection?.close();
    _signalChannel?.sink.close();
    state = state.copyWith(status: VoiceSessionStatus.disconnected);
  }
}
