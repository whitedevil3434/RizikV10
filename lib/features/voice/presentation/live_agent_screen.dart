import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:rizik_v4/core/theme/ui_tokens.dart';
import 'package:rizik_v4/features/voice/state/voice_session_provider.dart';

class LiveAgentScreen extends ConsumerStatefulWidget {
  const LiveAgentScreen({super.key});

  @override
  ConsumerState<LiveAgentScreen> createState() => _LiveAgentScreenState();
}

class _LiveAgentScreenState extends ConsumerState<LiveAgentScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  String _status = 'Initializing...';
  bool _isConnecting = false;
  bool _micDenied = false;

  @override
  void initState() {
    super.initState();
    _connect();
  }

  Future<void> _connect() async {
    setState(() {
      _isConnecting = true;
      _micDenied = false;
      _status = 'Checking microphone permission...';
    });

    // On some desktop builds, permission_handler may not be wired.
    // Fail open here and let lower layers handle mic availability.
    try {
      final status = await Permission.microphone.request();
      if (!mounted) return;
      if (status != PermissionStatus.granted) {
        setState(() {
          _status = 'Microphone permission denied';
          _isConnecting = false;
          _micDenied = true;
        });
        return;
      }
    } on MissingPluginException {
      if (!mounted) return;
      setState(() {
        _status = 'Microphone permission handler unavailable (desktop mode)';
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _status = 'Microphone check skipped: $e';
      });
    }

    try {
      setState(() => _status = 'Connecting...');
      await ref.read(voiceSessionProvider.notifier).startSession();
      if (!mounted) return;
      final state = ref.read(voiceSessionProvider);
      if (state.error != null && state.error!.isNotEmpty) {
        setState(() {
          _status = 'Connection error: ${state.error}';
          _isConnecting = false;
        });
        return;
      }
      setState(() {
        _status = 'Rizik Active (Cloudflare Edition)';
        _isConnecting = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _status = 'Error: $e';
        _isConnecting = false;
      });
    }
  }

  Future<void> _openSettings() async {
    await openAppSettings();
  }

  void _handleSend() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    ref.read(voiceSessionProvider.notifier).sendText(text);
    _textController.clear();
    _scrollToBottom();
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
  void dispose() {
    ref.read(voiceSessionProvider.notifier).endSession();
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;
    final sessionState = ref.watch(voiceSessionProvider);
    final chatHistory = sessionState.transcripts;
    final hasSessionError =
        sessionState.error != null && sessionState.error!.isNotEmpty;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.close, color: Colors.black),
          onPressed: () {
            ref.read(voiceSessionProvider.notifier).endSession();
            if (context.mounted) Navigator.pop(context);
          },
        ),
        title: Column(
          children: [
            const Text(
              'Rizik Live Agent',
              style: TextStyle(
                color: Colors.black,
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              _status,
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          if (_micDenied || hasSessionError)
            Padding(
              padding: const EdgeInsets.fromLTRB(
                UiTokens.pagePadding,
                4,
                UiTokens.pagePadding,
                10,
              ),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: UiTokens.cardBorderRadius,
                  border: Border.all(color: UiTokens.borderColor(context)),
                  color: Colors.amber.withValues(alpha: 0.08),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _micDenied
                          ? 'Microphone permission is required for voice session.'
                          : 'Live agent failed to connect: ${sessionState.error}',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ElevatedButton(
                          onPressed: _isConnecting ? null : _connect,
                          child: const Text('Retry'),
                        ),
                        if (_micDenied)
                          OutlinedButton(
                            onPressed: _openSettings,
                            child: const Text('Open Settings'),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              itemCount: chatHistory.length,
              itemBuilder: (context, index) {
                final item = chatHistory[index];
                final isUser = item.isUser;

                return Align(
                  alignment:
                      isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(
                        maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.black : Colors.grey[200],
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(16),
                        topRight: const Radius.circular(16),
                        bottomLeft: isUser
                            ? const Radius.circular(16)
                            : const Radius.circular(4),
                        bottomRight: isUser
                            ? const Radius.circular(4)
                            : const Radius.circular(16),
                      ),
                    ),
                    child: Text(
                      item.text,
                      style: TextStyle(
                        color: isUser ? Colors.white : Colors.black87,
                        fontSize: 16,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: EdgeInsets.fromLTRB(16, 12, 16, 12 + bottomPadding),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey[200]!)),
              boxShadow: const [
                BoxShadow(
                    color: Colors.black12, blurRadius: 4, offset: Offset(0, -2))
              ],
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    enabled: !_isConnecting && !_micDenied,
                    decoration: InputDecoration(
                      hintText: 'Type or ask Rizik...',
                      hintStyle: TextStyle(color: Colors.grey[400]),
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16, vertical: 12),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(30),
                        borderSide: BorderSide.none,
                      ),
                    ),
                    onSubmitted: (_) => _handleSend(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: (_isConnecting || _micDenied) ? null : _handleSend,
                  child: CircleAvatar(
                    radius: 24,
                    backgroundColor: (_isConnecting || _micDenied)
                        ? Colors.grey
                        : Colors.black,
                    child: const Icon(
                      Icons.arrow_upward,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
