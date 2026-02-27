// Chat Repository (Flutter)
// Connects to Cloudflare Durable Object via WebSocket

import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:rizik_v4/core/config/env_config.dart';

class ChatRepository {
  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _subscription;
  final StreamController<Map<String, dynamic>> _messageController =
      StreamController.broadcast();

  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  void connect(String roomId) {
    final wsUrl = _buildWsUrl(roomId);
    try {
      _subscription?.cancel();
      _channel?.sink.close();

      final channel = WebSocketChannel.connect(wsUrl);
      _channel = channel;

      channel.ready.then((_) {
        _subscription = channel.stream.listen(
          (data) {
            try {
              final msg = jsonDecode(data);
              _messageController.add(msg);
            } catch (e) {
              debugPrint('Chat Parse Error: $e');
            }
          },
          onError: (e) => debugPrint('Chat WS Error: $e'),
          onDone: () => debugPrint('Chat WS Closed'),
        );
      }).catchError((e) {
        debugPrint('Chat connect handshake failed: $e');
        _channel = null;
      });
    } catch (e) {
      debugPrint('Chat connect failed: $e');
    }
  }

  Uri _buildWsUrl(String roomId) {
    final base = Uri.parse(EnvConfig.backendUrl);
    final wsScheme = base.scheme == 'https' ? 'wss' : 'ws';
    return Uri(
      scheme: wsScheme,
      host: base.host,
      port: base.hasPort ? base.port : null,
      path: '/api/chat/room/$roomId/ws',
    );
  }

  void sendMessage(String roomId, String senderId, String content,
      {String type = 'text'}) {
    if (_channel == null) return;

    final payload = {
      'sender': senderId,
      'content': content,
      'type': type,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };

    _channel!.sink.add(jsonEncode(payload));
  }

  void dispose() {
    _subscription?.cancel();
    _channel?.sink.close();
    _messageController.close();
  }
}
