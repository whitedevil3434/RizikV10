import 'dart:async';
import 'dart:typed_data';
import 'package:record/record.dart';
import 'universal_recorder.dart';

UniversalRecorder getPlatformRecorder() => _RecorderIO();

class _RecorderIO implements UniversalRecorder {
  final AudioRecorder _audioRecorder = AudioRecorder();
  StreamSubscription? _subscription;

  @override
  Future<bool> hasPermission() {
    return _audioRecorder.hasPermission();
  }

  @override
  Future<void> start(StreamSink<Uint8List> sink) async {
    // Mobile: Use package:record with verified settings
    if (!await hasPermission()) return;

    final stream = await _audioRecorder.startStream(
      const RecordConfig(
        encoder: AudioEncoder.pcm16bits,
        sampleRate: 16000,
        numChannels: 1,
      ),
    );

    _subscription = stream.listen((data) {
      sink.add(data);
    }, onError: (e) {
      sink.addError(e);
    });
  }

  @override
  Future<void> stop() async {
    await _subscription?.cancel();
    await _audioRecorder.stop();
  }
}
