import 'dart:async';
import 'dart:typed_data';
import 'package:flutter_soloud/flutter_soloud.dart';
import 'universal_player.dart';

UniversalPlayer getPlatformPlayer() => _PlayerIO();

class _PlayerIO implements UniversalPlayer {
  final SoLoud _soloud = SoLoud.instance;
  AudioSource? _streamSource;
  SoundHandle? _streamHandle;

  @override
  Future<void> initialize({int sampleRate = 24000}) async {
    if (!_soloud.isInitialized) {
      // Initialize with default settings
      await _soloud.init();
    }
    
    // Create a PCM stream source
    // setBufferStream is synchronous in v3.x and takes named arguments
    try {
      _streamSource = _soloud.setBufferStream(
        sampleRate: sampleRate,
        channels: Channels.mono,
        format: BufferType.s16le, 
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
  }

  @override
  Future<void> playChunk(Uint8List pcmData) async {
    if (_streamSource != null) {
      try {
        _soloud.addAudioDataStream(_streamSource!, pcmData);
      } catch (e) {
        // print("❌ SoLoud Stream Error: $e"); // Silenced to avoid flood
      }
    }
  }

  @override
  Future<void> stop() async {
    if (_streamHandle != null) {
      try {
        await _soloud.stop(_streamHandle!);
      } catch (_) {}
      _streamHandle = null;
    }
    
    if (_streamSource != null) {
        try {
           // disposeSound -> disposeSource (Correct API)
           await _soloud.disposeSource(_streamSource!);
        } catch (_) {}
        _streamSource = null;
    }
  }
}
