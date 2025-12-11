
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/rizik_mojo.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
import 'package:rizik_v4/features/voice/state/voice_session_provider.dart';
import 'dart:ui';

class VoiceAssistantPalette extends ConsumerStatefulWidget {
  const VoiceAssistantPalette({super.key});

  static Future<void> show(BuildContext context) async {
    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black.withOpacity(0.1), // Subtle dimming
      builder: (context) => const VoiceAssistantPalette(),
    );
    // Cleanup when sheet closes
    final container = ProviderScope.containerOf(context, listen: false);
    container.read(voiceSessionProvider.notifier).endSession();
  }

  @override
  ConsumerState<VoiceAssistantPalette> createState() => _VoiceAssistantPaletteState();
}

class _VoiceAssistantPaletteState extends ConsumerState<VoiceAssistantPalette> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // Auto-connect when palette opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(voiceSessionProvider.notifier).startSession();
    });
  }

  void _scrollToBottom() {
    if (_scrollController.hasClients) {
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final sessionState = ref.watch(voiceSessionProvider);
    
    // Auto-scroll on new transcript
    ref.listen(voiceSessionProvider, (previous, next) {
      if (next.transcripts.length > (previous?.transcripts.length ?? 0)) {
        Future.delayed(const Duration(milliseconds: 100), _scrollToBottom);
      }
    });

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          height: MediaQuery.of(context).size.height * 0.5, // Half screen height
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.9), // Glassmorphism base
            borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
            boxShadow: [
               BoxShadow(
                 color: Colors.black.withOpacity(0.1),
                 blurRadius: 20,
                 offset: const Offset(0, -5),
               ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.max,
            children: [
              // 1. Drag Handle
              Center(
                child: Container(
                  margin: const EdgeInsets.only(top: 12, bottom: 8),
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withOpacity(0.4),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // 2. Transcript Area (Chat-like)
              Expanded(
                child: ListView.builder(
                  controller: _scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  itemCount: sessionState.transcripts.length,
                  itemBuilder: (context, index) {
                    final entry = sessionState.transcripts[index];
                    final text = entry.text;
                    final isUser = entry.isUser;
                    
                    return Align(
                      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        decoration: BoxDecoration(
                          color: isUser 
                              ? RizikBrandColors.brandPurple.withOpacity(0.1) 
                              : Colors.grey.withOpacity(0.05),
                          borderRadius: BorderRadius.only(
                             topLeft: const Radius.circular(16),
                             topRight: const Radius.circular(16),
                             bottomLeft: isUser ? const Radius.circular(16) : Radius.zero,
                             bottomRight: isUser ? Radius.zero : const Radius.circular(16),
                          ),
                        ),
                        child: Text(
                          text,
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.black87,
                            fontWeight: isUser ? FontWeight.w500 : FontWeight.w400,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),

              // 3. Status Indicator (Connecting/Error)
              if (sessionState.status == VoiceSessionStatus.connecting)
                 const Padding(
                   padding: EdgeInsets.only(bottom: 8.0),
                   child: Text("Connecting to Rizik Voice Brain...", style: TextStyle(color: Colors.grey, fontSize: 12)),
                 ),
              
              if (sessionState.error != null)
                 Padding(
                   padding: const EdgeInsets.only(bottom: 8.0),
                   child: Text("Error: ${sessionState.error}", style: const TextStyle(color: Colors.red, fontSize: 12)),
                 ),

              // 4. Controls Dock
              Container(
                padding: const EdgeInsets.fromLTRB(32, 16, 32, 40),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Close Button
                    _CircleButton(
                      icon: Icons.close_rounded,
                      color: Colors.grey.shade200,
                      iconColor: Colors.black54,
                      onTap: () {
                        ref.read(voiceSessionProvider.notifier).endSession();
                        Navigator.of(context).pop();
                      },
                    ),

                    // THE ORB (Centerpiece)
                    SizedBox(
                      width: 80,
                      height: 80,
                      child: RizikMojo(
                        amplitude: sessionState.currentAmplitude, // Reactive!
                        
                      ),
                    ),

                    // Keyboard/Input Button
                    _CircleButton(
                      icon: Icons.keyboard_rounded,
                      color: Colors.grey.shade200,
                      iconColor: Colors.black54,
                      onTap: () {
                        _showTextInputDialog(context);
                      },
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showTextInputDialog(BuildContext context) {
    final TextEditingController textController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: Colors.white.withOpacity(0.95),
        title: const Text("Type to Rizik"),
        content: TextField(
          controller: textController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: "Say something...",
            border: OutlineInputBorder(),
          ),
          onSubmitted: (value) {
            if (value.isNotEmpty) {
              ref.read(voiceSessionProvider.notifier).sendText(value);
              Navigator.pop(context);
            }
          },
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancel"),
          ),
          TextButton(
            onPressed: () {
              final text = textController.text;
              if (text.isNotEmpty) {
                ref.read(voiceSessionProvider.notifier).sendText(text);
                Navigator.pop(context);
              }
            },
            child: const Text("Send"),
          ),
        ],
      ),
    );
  }
}

class _CircleButton extends StatelessWidget {
  final IconData icon;
  final Color color;
  final Color iconColor;
  final VoidCallback onTap;

  const _CircleButton({
    required this.icon,
    required this.color,
    required this.iconColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 56,
        height: 56,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: iconColor, size: 28),
      ),
    );
  }
}
