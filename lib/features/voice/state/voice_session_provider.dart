
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/services/gemini_live_service.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';

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
  final geminiService = GeminiLiveService();
  return VoiceSessionNotifier(geminiService, ref);
});

class VoiceSessionNotifier extends StateNotifier<VoiceSessionState> {
  final GeminiLiveService _geminiService;
  final Ref _ref;

  VoiceSessionNotifier(this._geminiService, this._ref) : super(VoiceSessionState());

  Future<void> startSession() async {
    if (state.status == VoiceSessionStatus.connected || state.status == VoiceSessionStatus.connecting) return;

    state = state.copyWith(status: VoiceSessionStatus.connecting, error: null);

    // Initialize Audio Engine & Permissions
    await _geminiService.init();

    // Listen to transcript stream
    _geminiService.transcriptStream.listen((text) {
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
      await _geminiService.connect();
       state = state.copyWith(status: VoiceSessionStatus.connected);
       _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);
    } catch (e) {
      state = state.copyWith(
        status: VoiceSessionStatus.disconnected,
        error: e.toString(),
      );
      _ref.read(mojoProvider.notifier).setMojoState(MojoState.idle);
    }
  }

  Future<void> sendText(String text) async {
    if (text.isEmpty) return;
    
    // 1. Add to local transcript locally (User Side)
    final current = List<TranscriptEntry>.from(state.transcripts);
    current.add(TranscriptEntry(text: text, isUser: true));
    state = state.copyWith(transcripts: current);

    // 2. Send to Gemini
    _geminiService.sendTextMessage(text);
  }

  Future<void> endSession() async {
    await _geminiService.disconnect();
    state = state.copyWith(status: VoiceSessionStatus.disconnected);
    _ref.read(mojoProvider.notifier).setMojoState(MojoState.idle);
  }

  @override
  void dispose() {
    _geminiService.disconnect();
    super.dispose();
  }
}
