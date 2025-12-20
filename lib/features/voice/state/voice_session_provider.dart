
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

/// State of the voice session
enum VoiceSessionStatus {
  disconnected,
  connecting,
  connected,
  reconnecting,
}

/// Transcript Entry Model
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

/// 🧠 The Orchestrator (MIT-Grade Implementation)
/// Connects "The Brain" (Cloudflare DO) with "The Mouth" (Edge TTS) and "The Ear" (Recorder).
class VoiceSessionNotifier extends StateNotifier<VoiceSessionState> {
  final Ref _ref;
  
  // The Mouth
  final RizikEdgeTTSClient _ttsClient = RizikEdgeTTSClient();
  
  // The Ear & Voice (Playback)
  final UniversalRecorder _recorder = UniversalRecorder();
  final UniversalPlayer _player = UniversalPlayer();
  
  // The Brain Connection
  WebSocketChannel? _doChannel;
  StreamSubscription? _ttsAudioSub;
  StreamSubscription? _recorderSub;

  VoiceSessionNotifier(this._ref) : super(VoiceSessionState());

  /// 🚀 Ignite the Session
  Future<void> startSession() async {
    if (state.status == VoiceSessionStatus.connected) return;

    state = state.copyWith(status: VoiceSessionStatus.connecting, error: null);
    
    try {
      // 1. Initialize Subsystems (Parallel Execution)
      await Future.wait([
        _ttsClient.init(),
        _player.initialize(sampleRate: 24000), // Edge TTS Standard
        // _recorder.init() // if needed
      ]);

      // 2. Connect "The Mouth" to "The Speaker"
      // Stream audio bytes directly from TTS client to Player buffer
      await _ttsAudioSub?.cancel();
      await _ttsClient.connect(); // Connect to Microsoft Swarm
      _ttsAudioSub = _ttsClient.audioStream.listen((audioChunk) {
        _player.playChunk(audioChunk);
        
        // Visual Feedback: Mojo talks
        _ref.read(mojoProvider.notifier).setMojoState(MojoState.speaking);
      });

      // 3. Connect "The Brain" (Cloudflare Durable Object)
      // Note: We use a hardcoded room ID 'demo' for now, but this should be dynamic.
      final wsUrl = Uri.parse('${EnvConfig.backendUrl}/api/chat/room/voice_demo/ws').replace(scheme: 'wss');
      _doChannel = WebSocketChannel.connect(wsUrl);
      
      _doChannel!.stream.listen(_handleBrainSignal, 
        onError: (e) => _handleError("Brain Connection Lost: $e"),
        onDone: () => endSession()
      );

      // 4. Connect "The Ear" (Microphone)
      if (await _recorder.hasPermission()) {
        final stream = StreamController<Uint8List>();
        _recorderSub = stream.stream.listen((audioData) {
           // Future: Stream audio to STT via Cloudflare
           // For V1 Text-Mode, we skip this
        });
        // await _recorder.start(stream.sink); // Disabled for Text-First V1
      }

      state = state.copyWith(status: VoiceSessionStatus.connected);
      _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);

    } catch (e) {
      _handleError("Initialization Failed: $e");
    }
  }

  /// 🧠 Handle Signals from Cloudflare DO
  void _handleBrainSignal(dynamic data) {
    try {
      final msg = jsonDecode(data);
      
      if (msg['type'] == 'text_stream') {
        final text = msg['content'];
        
        // 1. Update UI Transcript
        _addTranscript(text, isUser: false);
        
        // 2. Feed the Mouth (TTS)
        _ttsClient.synthesize(text);
        
        // 3. Mojo Feedback
        _ref.read(mojoProvider.notifier).setMojoState(MojoState.processing);
      }
    } catch (e) {
      print("Signal Parse Error: $e");
    }
  }

  /// 📨 Send User Input (Text Mode for V1)
  void sendText(String text) {
    if (state.status != VoiceSessionStatus.connected) return;
    
    // 1. UI Update
    _addTranscript(text, isUser: true);
    
    // 2. Send to Brain
    final payload = {
      'type': 'text_input',
      'text': text,
      'timestamp': DateTime.now().millisecondsSinceEpoch
    };
    _doChannel?.sink.add(jsonEncode(payload));
  }

  void _addTranscript(String text, {required bool isUser}) {
    final current = List<TranscriptEntry>.from(state.transcripts);
    current.add(TranscriptEntry(text: text, isUser: isUser));
    if (current.length > 50) current.removeAt(0); // Buffer safety
    state = state.copyWith(transcripts: current);
  }

  void _handleError(String errorMsg) {
    state = state.copyWith(
      status: VoiceSessionStatus.disconnected,
      error: errorMsg,
    );
    _ref.read(mojoProvider.notifier).setMojoState(MojoState.idle);
    disconnect();
  }

  Future<void> endSession() async => disconnect();

  Future<void> disconnect() async {
    await _ttsAudioSub?.cancel();
    await _recorderSub?.cancel();
    await _recorder.stop();
    await _player.stop();
    _doChannel?.sink.close();
    _ttsClient.dispose();
    
    state = state.copyWith(status: VoiceSessionStatus.disconnected);
  }

  @override
  void dispose() {
    disconnect();
    super.dispose();
  }
}
