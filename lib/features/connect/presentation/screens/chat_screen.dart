import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:google_fonts/google_fonts.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];

  // Matrix Theme Colors
  static const Color _matrixBlack = Color(0xFF0D0208);
  static const Color _matrixGreen = Color(0xFF00FF41);
  static const Color _matrixDarkGreen = Color(0xFF003B00);
  static const Color _matrixText = Color(0xFFE0E0E0);

  @override
  void initState() {
    super.initState();
    // Simulate initial matrix "wake up" message
    Future.delayed(const Duration(milliseconds: 500), () {
      _addBotMessage("Wake up, Neo...");
    });
    Future.delayed(const Duration(milliseconds: 2500), () {
      _addBotMessage("The Matrix has you.");
    });
  }

  void _addBotMessage(String text) {
    if (!mounted) return;
    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: false));
    });
    _scrollToBottom();
  }

  void _handleSubmitted(String text) {
    if (text.trim().isEmpty) return;
    _textController.clear();
    setState(() {
      _messages.add(_ChatMessage(text: text, isUser: true));
    });
    _scrollToBottom();

    // Echo bot simulation
    Future.delayed(const Duration(seconds: 1), () {
      _addBotMessage("Encrypted transmission received: $text");
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: _matrixBlack,
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: Text(
          'RIZIK SQUAD CHAT',
          style: GoogleFonts.shareTechMono(
            color: _matrixGreen,
            fontWeight: FontWeight.bold,
            letterSpacing: 2.0,
          ),
        ),
        actions: [
           IconButton(
            icon: const Icon(Icons.call, color: _matrixGreen),
            onPressed: () {
              // TODO: Navigate to Call Screen
            },
          ),
          IconButton(
            icon: const Icon(Icons.more_vert, color: _matrixGreen),
            onPressed: () {},
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1.0),
          child: Container(color: _matrixGreen.withOpacity(0.3), height: 1.0),
        ),
      ),
      body: Stack(
        children: [
          // Background "Digital Rain" effect hint (static for performance)
          Positioned.fill(
            child: Opacity(
              opacity: 0.05,
              child: ListView.builder(
                physics: const NeverScrollableScrollPhysics(),
                itemBuilder: (context, index) {
                  return Text(
                    '101101010101010101010101010101',
                    style: GoogleFonts.shareTechMono(color: _matrixGreen, fontSize: 14),
                    overflow: TextOverflow.ellipsis,
                  );
                },
              ),
            ),
          ),

          Column(
            children: [
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _messages.length,
                  itemBuilder: (context, index) {
                    final message = _messages[index];
                    return _ChatBubble(message: message);
                  },
                ),
              ),
              _buildTextComposer(),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTextComposer() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 8.0),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border(top: BorderSide(color: _matrixGreen.withOpacity(0.3))),
      ),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.add, color: _matrixGreen),
            onPressed: () {},
          ),
          Expanded(
            child: TextField(
              controller: _textController,
              style: GoogleFonts.shareTechMono(color: _matrixGreen),
              decoration: InputDecoration(
                hintText: 'Enter command...',
                hintStyle: GoogleFonts.shareTechMono(color: _matrixGreen.withOpacity(0.5)),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16.0),
              ),
              onSubmitted: _handleSubmitted,
            ),
          ),
          IconButton(
            icon: const Icon(Icons.send, color: _matrixGreen),
            onPressed: () => _handleSubmitted(_textController.text),
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  final String text;
  final bool isUser;
  _ChatMessage({required this.text, required this.isUser});
}

class _ChatBubble extends StatelessWidget {
  final _ChatMessage message;
  static const Color _matrixGreen = Color(0xFF00FF41);
  static const Color _matrixDarkGreen = Color(0xFF003B00);

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final isUser = message.isUser;

    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4.0),
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 10.0),
        decoration: BoxDecoration(
          color: isUser ? _matrixDarkGreen : Colors.black,
          border: Border.all(
            color: isUser ? _matrixGreen : _matrixGreen.withOpacity(0.5),
            width: 1.0,
          ),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(12),
            topRight: const Radius.circular(12),
            bottomLeft: isUser ? const Radius.circular(12) : Radius.zero,
            bottomRight: isUser ? Radius.zero : const Radius.circular(12),
          ),
          boxShadow: [
            BoxShadow(
              color: _matrixGreen.withOpacity(0.1),
              blurRadius: 4,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Text(
          message.text,
          style: GoogleFonts.shareTechMono(
            color: _matrixGreen,
            fontSize: 16.0,
          ),
        ),
      ),
    ).animate().fade(duration: 300.ms).slideX(begin: isUser ? 0.2 : -0.2);
  }
}
