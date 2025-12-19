// Chat Repository (Flutter)
// Connects to Cloudflare Durable Object via WebSocket

import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:rizik_v4/core/config/env_config.dart';

class ChatRepository {
  WebSocketChannel? _channel;
  final StreamController<Map<String, dynamic>> _messageController = StreamController.broadcast();

  Stream<Map<String, dynamic>> get messages => _messageController.stream;

  void connect(String roomId) {
    // Construct WS URL (WSS for production)
    final wsUrl = Uri.parse('${EnvConfig.backendUrl}/api/chat/room/$roomId/ws').replace(scheme: 'wss');

    _channel = WebSocketChannel.connect(wsUrl);

    _channel!.stream.listen(
      (data) {
        try {
          final msg = jsonDecode(data);
          _messageController.add(msg);
        } catch (e) {
          print('Chat Parse Error: $e');
        }
      },
      onError: (e) => print('Chat WS Error: $e'),
      onDone: () => print('Chat WS Closed'),
    );
  }

  void sendMessage(String roomId, String senderId, String content, {String type = 'text'}) {
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
    _channel?.sink.close();
    _messageController.close();
  }
}
