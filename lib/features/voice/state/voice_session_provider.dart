import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/services/cloudflare_agent_service.dart';
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
  final agentService = CloudflareAgentService();
  return VoiceSessionNotifier(agentService, ref);
});

// -----------------------------------------------------------------------------
// 2. Controller/Notifier (Logic Layer)
// -----------------------------------------------------------------------------
class VoiceSessionNotifier extends StateNotifier<VoiceSessionState> {
  final CloudflareAgentService _agentService;
  final Ref _ref;
  final RizikEdgeTTSClient _ttsClient = RizikEdgeTTSClient();
  final UniversalPlayer _player = UniversalPlayer();
  final UniversalRecorder _recorder = UniversalRecorder();
  
  WebSocketChannel? _signalChannel;
  RTCPeerConnection? _peerConnection;
  MediaStream? _localStream;

  VoiceSessionNotifier(this._agentService, this._ref) : super(VoiceSessionState());

  Future<void> startSession() async {
    if (state.status == VoiceSessionStatus.connected || state.status == VoiceSessionStatus.connecting) return;

    state = state.copyWith(status: VoiceSessionStatus.connecting, error: null);

    // Initialize Audio Engine & Permissions
    await _agentService.init();

    // Listen to transcript stream
    _agentService.transcriptStream.listen((text) {
        final current = List<TranscriptEntry>.from(state.transcripts);
        current.add(TranscriptEntry(text: text, isUser: false)); // AI Response
        if (current.length > 50) current.removeAt(0); // Keep buffer size reasonable
        
        state = state.copyWith(transcripts: current);
        
        // Pulse Mojo
        _ref.read(mojoProvider.notifier).setMojoState(MojoState.processing);
        Future.delayed(const Duration(seconds: 2), () {
             if (state.status == VoiceSessionStatus.connected) {
                _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);
             }
        });
    }, onError: (e) {
        state = state.copyWith(error: e.toString());
    });

    try {
      await _agentService.connect();
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

    // 2. Send to Agent
    _agentService.sendTextMessage(text);
  }

  Future<void> endSession() async {
    await _agentService.disconnect();
    state = state.copyWith(status: VoiceSessionStatus.disconnected);
    _ref.read(mojoProvider.notifier).setMojoState(MojoState.idle);
  }

  @override
  void dispose() {
    _agentService.disconnect();
    super.dispose();
  }
}
