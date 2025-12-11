import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Theme Mode Provider
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  ThemeModeNotifier() : super(ThemeMode.system) {
    _loadTheme();
  }

  static const _storage = FlutterSecureStorage();
  static const _keyTheme = 'theme_mode';

  /// Load saved theme
  Future<void> _loadTheme() async {
    final savedTheme = await _storage.read(key: _keyTheme);
    if (savedTheme != null) {
      if (savedTheme == 'light') state = ThemeMode.light;
      else if (savedTheme == 'dark') state = ThemeMode.dark;
      else state = ThemeMode.system;
    }
  }

  /// Set theme mode
  Future<void> setTheme(ThemeMode mode) async {
    state = mode;
    String value = 'system';
    if (mode == ThemeMode.light) value = 'light';
    if (mode == ThemeMode.dark) value = 'dark';
    await _storage.write(key: _keyTheme, value: value);
  }

  /// Toggle theme
  void toggleTheme() {
    if (state == ThemeMode.light) {
      setTheme(ThemeMode.dark);
    } else {
      setTheme(ThemeMode.light);
    }
  }
}

/// ThemeWrapper - Helper for accessing theme data
class ThemeWrapper {
  static final ThemeWrapper _instance = ThemeWrapper._internal();
  factory ThemeWrapper() => _instance;
  ThemeWrapper._internal();

  /// Get current theme data
  ThemeData getTheme(BuildContext context) => Theme.of(context);

  /// Get text theme
  TextTheme getTextTheme(BuildContext context) => Theme.of(context).textTheme;

  /// Get color scheme
  ColorScheme getColors(BuildContext context) => Theme.of(context).colorScheme;

  /// Check if dark mode is active
  bool isDarkMode(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark;
  }
}

/// Global instance
final themeWrapper = ThemeWrapper();
