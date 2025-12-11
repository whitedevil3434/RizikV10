import 'package:flutter_soloud/flutter_soloud.dart';

void probe() async {
  final soloud = SoLoud.instance;
  AudioSource? source;

  // Check BufferType values
  BufferType? a = BufferType.s16;
  BufferType? b = BufferType.i16;
  BufferType? c = BufferType.float;
  BufferType? d = BufferType.f32;

  // Check dispose method
  if (source != null) {
     soloud.disposeSound(source);
     soloud.disposeSource(source);
  }
}
