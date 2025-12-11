import 'dart:async';
import 'dart:typed_data';
import 'universal_recorder.dart';
import 'dart:js_interop';
import 'package:web/web.dart' as web;

UniversalRecorder getPlatformRecorder() => _RecorderWeb();

class _RecorderWeb implements UniversalRecorder {
  web.AudioContext? _audioContext;
  web.MediaStream? _mediaStream;
  web.ScriptProcessorNode? _processor;
  web.MediaStreamAudioSourceNode? _source;
  
  @override
  Future<bool> hasPermission() async {
    // On web, permission is requested during getUserMedia
    return true; 
  }

  @override
  Future<void> start(StreamSink<Uint8List> sink) async {
    try {
      print("WEB: Requesting Mic Access...");
      final stream = await web.window.navigator.mediaDevices.getUserMedia(
        web.MediaStreamConstraints(audio: true.toJS),
      ).toDart;
      print("WEB: Stream Obtained.");
      
      _mediaStream = stream;
      _audioContext = web.AudioContext();
      
      if (_audioContext!.state == 'suspended') {
        print("WEB: Resuming suspended AudioContext...");
        await _audioContext!.resume().toDart;
      }
      print("WEB: AudioContext State: ${_audioContext!.state}");

      _source = _audioContext!.createMediaStreamSource(stream);
      
      // Buffer size 4096 is a good balance
      _processor = _audioContext!.createScriptProcessor(4096, 1, 1);
      
      _source!.connect(_processor!);
      _processor!.connect(_audioContext!.destination); // Needed for Chrome to fire events

      // Debug flag
      bool hasLogged = false;
      bool hasLoggedSound = false;

      _processor!.onaudioprocess = (web.AudioProcessingEvent event) {
        final inputBuffer = event.inputBuffer;
        final inputData = inputBuffer.getChannelData(0).toDart; // Float32List
        
        // Silence Detection Debug
        double maxAmp = 0.0;
        for (var s in inputData) {
          if (s.abs() > maxAmp) maxAmp = s.abs();
        }
        
        if (maxAmp > 0.01 && !hasLoggedSound) {
             print("🔊 WEB: SOUND DETECTED! Max Amp: $maxAmp");
             hasLoggedSound = true;
        }

        if (!hasLogged) {
            print("WEB: Audio Process Fired! Input Samples: ${inputData.length} (Amp: $maxAmp)");
            hasLogged = true;
        }

        final currentSampleRate = inputBuffer.sampleRate;
        final targetSampleRate = 16000;
        
        // Downsample and Convert
        final pcmData = _resampleAndConvert(
          inputData,
          currentSampleRate.toDouble(),
          targetSampleRate.toDouble(),
        );
        
        if (pcmData.isNotEmpty) {
           sink.add(pcmData);
        }
      }.toJS;

    } catch (e) {
      print("Error initializing Web Recorder: $e");
      sink.addError(e);
    }
  }

  Uint8List _resampleAndConvert(Float32List input, double inRate, double outRate) {
    if (inRate == outRate) {
        return _floatTo16BitPCM(input);
    }
    
    final ratio = inRate / outRate;
    final newLength = (input.length / ratio).ceil();
    final output = Float32List(newLength);
    
    var offsetResult = 0;
    var offsetSource = 0.0;
    
    while (offsetResult < newLength) {
        final nextOffsetSource = offsetSource + ratio;
        
        // Simple Linear Interpolation (or just nearest neighbor for speed)
        // For voice, nearest neighbor at 48k -> 16k is often acceptable, but linear is better.
        // Let's do nearest neighbor to ensure performance first.
        final index = offsetSource.floor();
        if (index < input.length) {
            output[offsetResult] = input[index];
        } else {
             output[offsetResult] = 0.0;
        }

        offsetSource = nextOffsetSource;
        offsetResult++;
    }
    
    return _floatTo16BitPCM(output);
  }

  Uint8List _floatTo16BitPCM(Float32List input) {
    final buffer = Uint8List(input.length * 2);
    final view = ByteData.view(buffer.buffer);
    
    for (var i = 0; i < input.length; i++) {
      var s = input[i];
      // Clamp
      if (s > 1.0) s = 1.0;
      if (s < -1.0) s = -1.0;
      
      // Convert to Int16
      final val = (s * 32767).floor();
      view.setInt16(i * 2, val, Endian.little);
    }
    return buffer;
  }

  @override
  Future<void> stop() async {
     _processor?.disconnect();
     _source?.disconnect();
     _mediaStream?.getTracks().toDart.forEach((track) {
       (track as web.MediaStreamTrack).stop();
     });
     _audioContext?.close();
  }
}

