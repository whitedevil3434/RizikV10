import 'package:flutter_soloud/flutter_soloud.dart';

void probe() async {
  final soloud = SoLoud.instance;
  
  // Test 1: Check available enums (Types will error if not found)
  // BufferFormat? bf; 
  // PCMFormat? pf;
  // BufferingType? bt;

  // Test 2: Check method signature properties
  // The error message from analyze will reveal the expected parameters
  await soloud.setBufferStream(
     0, // Try positional
     Channels.mono, 
  );
  
  await soloud.setBufferStream(
    sampleRate: 16000,
    channels: Channels.mono,
    bufferSize: 100,
    maxBufferSize: 100,
    format: null,
  );
  
  // Check valid enum names by trying to assign specific types
  // This will fail if type doesn't exist
  dynamic a = BufferFormat.i16; 
  dynamic b = PCMFormat.i16;
}
