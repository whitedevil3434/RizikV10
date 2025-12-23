import 'dart:async';
import 'dart:typed_data';
import 'package:flutter_soloud/flutter_soloud.dart' as soloud;
import 'package:just_audio/just_audio.dart';
import 'universal_player.dart';

UniversalPlayer getPlatformPlayer() => _PlayerIO();

class _PlayerIO implements UniversalPlayer {
  final soloud.SoLoud _soloud = soloud.SoLoud.instance;
  soloud.AudioSource? _streamSource;
  soloud.SoundHandle? _streamHandle;

  final List<int> _pcmBuffer = [];
  static const int _minBufferSize = 4096; // ~128ms at 16kHz 16bit

  @override
  Future<void> initialize({int sampleRate = 16000}) async {
    // 🛑 DISABLED SoLoud (Causing Crashes & Unused for MP3)
    /*
    if (!_soloud.isInitialized) {
      // Initialize with default settings
      await _soloud.init();
    }
    
    // Create a PCM stream source
    try {
      _streamSource = _soloud.setBufferStream(
        sampleRate: sampleRate,
        channels: soloud.Channels.mono,
        format: soloud.BufferType.s16le, 
      );
    } catch (e) {
      print("❌ SoLoud Setup Error: $e");
      return;
    }

    // Start playing the empty stream immediately protection
    if (_streamSource != null) {
      try {
        _streamHandle = await _soloud.play(_streamSource!);
      } catch (e) {
        print("❌ SoLoud Play Error: $e");
      }
    }
    */
    print("✅ Audio Player Initialized (MP3 Only Mode)");
  }

  @override
  Future<void> playChunk(Uint8List pcmData) async {
    if (_streamSource != null) {
      // Buffer small chunks to prevent Jitter/Buzzing
      _pcmBuffer.addAll(pcmData);

      if (_pcmBuffer.length >= _minBufferSize) {
          try {
            _soloud.addAudioDataStream(_streamSource!, Uint8List.fromList(_pcmBuffer));
            _pcmBuffer.clear();
          } catch (e) {
             print("⚠️ SoLoud Stream Error: $e");
          }
      }
    }
  }

  final AudioPlayer _audioPlayer = AudioPlayer();

  @override
  Future<void> playAudio(Uint8List data) async {
    try {
      await _audioPlayer.stop(); // Stop previous TTS if any
      await _audioPlayer.setAudioSource(MyCustomSource(data));
      await _audioPlayer.play();
    } catch (e) {
      print("❌ JustAudio Error: $e");
    }
  }

  @override
  Future<void> stop() async {
    // Stop SoLoud
    if (_streamHandle != null) {
      if (_soloud.isInitialized) {
        try {
          await _soloud.stop(_streamHandle!);
        } catch (e) {
          print("⚠️ SoLoud Stop Error: $e");
        }
      }
      _streamHandle = null;
    }
    
    // Stop JustAudio
    try {
      await _audioPlayer.stop();
    } catch (_) {}
    
    if (_streamSource != null) {
      if (_soloud.isInitialized) {
        try {
           // disposeSound -> disposeSource (Correct API)
           await _soloud.disposeSource(_streamSource!);
        } catch (_) {}
      }
      _streamSource = null;
    }
  }
}

// Custom Source for JustAudio to play from memory
class MyCustomSource extends StreamAudioSource {
  final Uint8List _buffer;

  MyCustomSource(this._buffer);

  @override
  Future<StreamAudioResponse> request([int? start, int? end]) async {
    start ??= 0;
    end ??= _buffer.length;
    
    // Guard: Clamp to valid range to prevent crash
    if (start < 0) start = 0;
    if (end > _buffer.length) end = _buffer.length;
    if (start > end) start = end;

    // print("🎵 CustomSource Request: start=$start, end=$end, total=${_buffer.length}");

    return StreamAudioResponse(
      sourceLength: _buffer.length,
      contentLength: end - start,
      offset: start,
      stream: Stream.value(_buffer.sublist(start, end)),
      contentType: 'audio/mpeg', 
    );
  }
}
