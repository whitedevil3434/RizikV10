import 'package:rizik_v4/models/chat/pinnable_object.dart';

class ChatConversation {
  final String id;
  final String participantName;
  final String participantAvatar;
  final String lastMessage;
  final DateTime lastMessageTime;
  final int unreadCount;
  final PinnableObject? pinnedObject;
  final bool isOnline;

  const ChatConversation({
    required this.id,
    required this.participantName,
    required this.participantAvatar,
    required this.lastMessage,
    required this.lastMessageTime,
    this.unreadCount = 0,
    this.pinnedObject,
    this.isOnline = false,
  });

  // Factory for demo data
  factory ChatConversation.demo({
    required String id,
    required String name,
    required String message,
    PinnableObject? pinnedObject,
    int unread = 0,
    bool online = false,
  }) {
    return ChatConversation(
      id: id,
      participantName: name,
      participantAvatar: 'https://i.pravatar.cc/150?u=$id',
      lastMessage: message,
      lastMessageTime: DateTime.now().subtract(Duration(minutes: (int.tryParse(id) ?? 0) * 15)),
      unreadCount: unread,
      pinnedObject: pinnedObject,
      isOnline: online,
    );
  }
}
