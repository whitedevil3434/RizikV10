import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rizik_v4/core/config/env_config.dart';
import 'package:rizik_v4/features/connect/data/chat_repository.dart';

/// Lightweight unread counter for chat badge surfaces.
class ChatBadgeProvider with ChangeNotifier {
  final ChatRepository _chatRepository = ChatRepository();
  int _unreadCount = 0;
  bool _isChatScreenActive = false;

  int get unreadCount => _unreadCount;

  ChatBadgeProvider() {
    _init();
  }

  Future<void> _init() async {
    await _loadUnread();
    _connectBackgroundFeed();
  }

  Future<void> _loadUnread() async {
    final prefs = await SharedPreferences.getInstance();
    _unreadCount = prefs.getInt('chat_unread_count') ?? 0;
    notifyListeners();
  }

  Future<void> _saveUnread() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt('chat_unread_count', _unreadCount);
  }

  void _connectBackgroundFeed() {
    if (EnvConfig.offlineMode) {
      return;
    }
    try {
      _chatRepository.connect('rizik-lobby');
      _chatRepository.messages.listen((_) {
        if (_isChatScreenActive) {
          return;
        }
        incrementUnread();
      });
    } catch (e) {
      debugPrint('Chat badge stream unavailable: $e');
    }
  }

  Future<void> incrementUnread([int by = 1]) async {
    final next = _unreadCount + by;
    if (next == _unreadCount) {
      return;
    }
    _unreadCount = next;
    notifyListeners();
    await _saveUnread();
  }

  Future<void> markAllRead() async {
    if (_unreadCount == 0) {
      return;
    }
    _unreadCount = 0;
    notifyListeners();
    await _saveUnread();
  }

  Future<void> setChatScreenActive(bool active) async {
    _isChatScreenActive = active;
    if (active) {
      await markAllRead();
    }
  }

  @override
  void dispose() {
    _chatRepository.dispose();
    super.dispose();
  }
}
