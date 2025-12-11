import 'dart:async';
import 'dart:typed_data';

import 'player_io.dart' if (dart.library.js_interop) 'player_web.dart';

abstract class UniversalPlayer {
  factory UniversalPlayer() => getPlatformPlayer();

  Future<void> initialize({int sampleRate = 16000});
  Future<void> playChunk(Uint8List data);
  Future<void> stop();
}
