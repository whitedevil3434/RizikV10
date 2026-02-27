import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/services/livekit_service.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:permission_handler/permission_handler.dart';
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

final voiceSessionProvider =
    StateNotifierProvider.autoDispose<VoiceSessionNotifier, VoiceSessionState>(
        (ref) {
  final livekitService = LiveKitService();
  return VoiceSessionNotifier(livekitService, ref);
});

// -----------------------------------------------------------------------------
// 2. Controller/Notifier (Logic Layer)
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// 2. Controller/Notifier (Logic Layer)
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 2. Controller/Notifier (Logic Layer)
// -----------------------------------------------------------------------------
class VoiceSessionNotifier extends StateNotifier<VoiceSessionState> {
  final LiveKitService _livekitService;
  final Ref _ref;

  StreamSubscription? _aiSub;
  StreamSubscription? _sttSub;
  StreamSubscription? _interruptSub;

  bool _isDisposed = false;

  VoiceSessionNotifier(this._livekitService, this._ref)
      : super(VoiceSessionState());

  @override
  bool get mounted => !_isDisposed;

  Future<void> startSession() async {
    if (state.status == VoiceSessionStatus.connected ||
        state.status == VoiceSessionStatus.connecting) return;

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
    }

    state = state.copyWith(status: VoiceSessionStatus.connecting, error: null);

    try {
      // 1. Initialize Service
      await _livekitService.init();

      // 2. Setup Listeners
      _aiSub = _livekitService.aiStream.listen((text) {
        print("🗣️ [CLIENT] Received AI Response: $text");
        if (!_isDisposed) {
          final newEntry = TranscriptEntry(text: text, isUser: false);
          state = state.copyWith(
            transcripts: [...state.transcripts, newEntry],
          );
        }
      });

      _sttSub = _livekitService.sttStream.listen((text) {
        print("🎤 [CLIENT] Received User Transcript: $text");
        if (!_isDisposed) {
          final newEntry = TranscriptEntry(text: text, isUser: true);
          state = state.copyWith(
            transcripts: [...state.transcripts, newEntry],
          );
        }
      });

      _interruptSub = _livekitService.interruptStream.listen((_) {
        print("🛑 [CLIENT] Barge-In Triggered!");
        // Visual indicator logic could go here
      });

      // 3. Connect to LiveKit Room
      // TODO: Get real user name from auth profile if available
      await _livekitService.connect(
          roomName: "rizik-room-${DateTime.now().millisecondsSinceEpoch}",
          participantName: "user-${DateTime.now().millisecondsSinceEpoch}");

      if (!_isDisposed) {
        state = state.copyWith(status: VoiceSessionStatus.connected);
        try {
          _ref.read(mojoProvider.notifier).setMojoState(MojoState.listening);
        } catch (e) {
          print("⚠️ Failed to update Mojo state: $e");
        }
      }
    } catch (e) {
      print("❌ LiveKit Connection Failed: $e");
      if (!_isDisposed) {
        state = state.copyWith(
            status: VoiceSessionStatus.disconnected, error: e.toString());
      }
    }
  }

  void sendText(String text) {
    if (!_isDisposed) {
      final newEntry = TranscriptEntry(text: text, isUser: true);
      state = state.copyWith(
        transcripts: [...state.transcripts, newEntry],
      );

      _livekitService.sendTextInput(text);
    }
  }

  Future<void> endSession() async {
    print("🛑 Ending Session...");
    try {
      await _livekitService.disconnect();
    } catch (e) {
      print("⚠️ Error closing LiveKit resources: $e");
    }

    _aiSub?.cancel();
    _sttSub?.cancel();
    _interruptSub?.cancel();

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
    super.dispose();
  }
}
