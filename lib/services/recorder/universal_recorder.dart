import 'dart:async';
import 'dart:typed_data';

import 'recorder_io.dart' if (dart.library.js_interop) 'recorder_web.dart';

abstract class UniversalRecorder {
  factory UniversalRecorder() => getPlatformRecorder();

  Future<bool> hasPermission();
  Future<void> start(StreamSink<Uint8List> sink);
  Future<void> stop();
}
