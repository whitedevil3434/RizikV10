import 'dart:async';
import 'dart:typed_data';
import 'dart:js_interop';
import 'package:web/web.dart' as web;
import 'universal_player.dart';

UniversalPlayer getPlatformPlayer() => _PlayerWeb();

class _PlayerWeb implements UniversalPlayer {
  web.AudioContext? _audioContext;
  double _startTime = 0.0;

  int _sampleRate = 16000;

  @override
  Future<void> initialize({int sampleRate = 16000}) async {
    _sampleRate = sampleRate;
    _audioContext = web.AudioContext();
  }

  @override
  Future<void> playChunk(Uint8List data) async {
    if (_audioContext == null) return;
    
    // Resume context if suspended (common in browsers)
    if (_audioContext!.state == 'suspended') {
      try {
        await _audioContext!.resume().toDart;
      } catch (e) {
        print("WEB PLAYER: Failed to resume context: $e");
      }
    }

    final float32Data = _int16ToFloat32(data);
    final buffer = _audioContext!.createBuffer(1, float32Data.length, _sampleRate); // Configurable Sample Rate
    
    // Copy data to buffer
    buffer.copyToChannel(float32Data.toJS, 0);

    final source = _audioContext!.createBufferSource();
    source.buffer = buffer;
    source.connect(_audioContext!.destination);

    // Schedule playback
    // Ensuring chunks play sequentially without overlap or huge gaps
    final currentTime = _audioContext!.currentTime.toDouble();
    if (_startTime < currentTime) {
      _startTime = currentTime;
    }
    
    source.start(_startTime);
    _startTime += buffer.duration.toDouble();
  }

  @override
  Future<void> stop() async {
    _audioContext?.close();
  }

  Float32List _int16ToFloat32(Uint8List data) {
    final int16View = Int16List.view(data.buffer);
    final float32List = Float32List(int16View.length);
    
    for (var i = 0; i < int16View.length; i++) {
      // Normalize Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
      float32List[i] = int16View[i] / 32768.0;
    }
    return float32List;
  }
}
