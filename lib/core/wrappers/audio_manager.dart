import 'package:audioplayers/audioplayers.dart';

/// AudioManager - Sound Effects & BGM System
/// Handles game-like audio feedback and background music
class AudioManager {
  static final AudioManager _instance = AudioManager._internal();
  factory AudioManager() => _instance;
  AudioManager._internal();

  final AudioPlayer _sfxPlayer = AudioPlayer();
  final AudioPlayer _bgmPlayer = AudioPlayer();
  
  bool _isMuted = false;
  double _sfxVolume = 1.0;
  double _bgmVolume = 0.5;

  /// Initialize audio system
  Future<void> initialize() async {
    // Set audio context if needed
    await AudioPlayer.global.setAudioContext(AudioContextConfig(
      forceSpeaker: false,
      focus: AudioContextConfigFocus.mixed,
      aspect: AudioContextConfigAspect.game,
    ).build());
  }

  /// Play sound effect
  Future<void> playSfx(String assetPath) async {
    if (_isMuted) return;
    try {
      // Create a temporary player for overlapping SFX
      final player = AudioPlayer();
      await player.setVolume(_sfxVolume);
      await player.play(AssetSource(assetPath));
      // Auto dispose after playing
      player.onPlayerComplete.listen((_) => player.dispose());
    } catch (e) {
      print('Error playing SFX: $e');
    }
  }

  /// Play background music (looping)
  Future<void> playBgm(String assetPath) async {
    if (_isMuted) return;
    try {
      await _bgmPlayer.setVolume(_bgmVolume);
      await _bgmPlayer.setReleaseMode(ReleaseMode.loop);
      await _bgmPlayer.play(AssetSource(assetPath));
    } catch (e) {
      print('Error playing BGM: $e');
    }
  }

  /// Stop background music
  Future<void> stopBgm() async {
    await _bgmPlayer.stop();
  }

  /// Pause background music
  Future<void> pauseBgm() async {
    await _bgmPlayer.pause();
  }

  /// Resume background music
  Future<void> resumeBgm() async {
    if (!_isMuted) {
      await _bgmPlayer.resume();
    }
  }

  /// Set mute state
  void setMute(bool muted) {
    _isMuted = muted;
    if (muted) {
      _bgmPlayer.setVolume(0);
    } else {
      _bgmPlayer.setVolume(_bgmVolume);
    }
  }

  /// Set SFX volume (0.0 - 1.0)
  void setSfxVolume(double volume) {
    _sfxVolume = volume.clamp(0.0, 1.0);
  }

  /// Set BGM volume (0.0 - 1.0)
  void setBgmVolume(double volume) {
    _bgmVolume = volume.clamp(0.0, 1.0);
    if (!_isMuted) {
      _bgmPlayer.setVolume(_bgmVolume);
    }
  }

  /// Dispose
  void dispose() {
    _sfxPlayer.dispose();
    _bgmPlayer.dispose();
  }
}

/// Global instance
final audioManager = AudioManager();
