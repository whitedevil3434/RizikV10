import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/data/remote/voice_input_service.dart';

final voiceInputServiceProvider = Provider<VoiceInputService>((ref) {
  return VoiceInputService();
});
