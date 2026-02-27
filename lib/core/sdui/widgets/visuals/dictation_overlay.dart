import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:rizik_v4/core/state/voice_input_provider.dart';
import 'dart:ui';
import 'dart:async';
import 'package:provider/provider.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rizik_v4/features/force/team_ops/logic/squad_provider.dart';
import 'package:go_router/go_router.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';

class DictationOverlay extends ConsumerStatefulWidget {
  const DictationOverlay({super.key});

  @override
  ConsumerState<DictationOverlay> createState() => _DictationOverlayState();
}

class _DictationOverlayState extends ConsumerState<DictationOverlay> {
  late TextEditingController _textController;
  late FocusNode _focusNode;
  bool _isEditing = false;
  bool _isVisible = false;
  Timer? _hideTimer;

  @override
  void initState() {
    super.initState();
    _textController = TextEditingController();
    _focusNode = FocusNode();
  }

  @override
  void dispose() {
    _textController.dispose();
    _focusNode.dispose();
    _hideTimer?.cancel();
    super.dispose();
  }

  void _startHideTimer() {
    _hideTimer?.cancel();
    if (_isEditing) return;

    _hideTimer = Timer(const Duration(seconds: 5), () {
      if (mounted && !_isEditing) {
        setState(() => _isVisible = false);
      }
    });
  }

  Future<void> _submitText(String text) async {
    if (text.trim().isEmpty) return;

    setState(() => _isEditing = false);
    _focusNode.unfocus();

    // Update UI immediately
    ref.read(mojoProvider).setRecognizedText(text);
    ref.read(mojoProvider).setMojoState(MojoState.speaking);
    _tryNavigateByCommand(text);

    // Get Context
    String? userId;
    String? squadId;
    try {
      final user = Supabase.instance.client.auth.currentUser;
      userId = user?.id;

      // Try to get squad from provider
      // We use context.read because SquadProvider is likely a Provider, not Riverpod provider
      if (mounted) {
        final squadProvider = context.read<SquadProvider>();
        if (squadProvider.squads.isNotEmpty) {
          squadId = squadProvider.squads.first.id;
        }
      }
    } catch (e) {
      debugPrint("DictationOverlay: Failed to get context: $e");
    }

    // Process via service
    final voiceService = ref.read(voiceInputServiceProvider);
    final result = await voiceService.processText(
      text,
      squadId: squadId ?? "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      userId: userId ?? "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    );

    if (result != null) {
      ref.read(mojoProvider).setRecognizedText(result['transcript']!);
      ref.read(mojoProvider).setAiResponseText(result['response']!);
      ref.read(mojoProvider).setMojoState(MojoState.speaking);
      _tryNavigateByCommand(result['transcript']!);
      _tryNavigateByCommand(result['response']!);

      Future.delayed(const Duration(seconds: 5), () {
        if (mounted) {
          ref.read(mojoProvider).setMojoState(MojoState.idle);
        }
      });
    } else {
      ref.read(mojoProvider).setRecognizedText("Sorry, I didn't catch that.");
      ref.read(mojoProvider).setMojoState(MojoState.idle);
    }
  }

  void _tryNavigateByCommand(String sourceText) {
    final route = _routeFromCommand(
      sourceText,
      ref.read(userRoleProvider),
    );
    if (route == null || !mounted) {
      return;
    }

    if (GoRouterState.of(context).uri.toString() == route) {
      return;
    }

    GoRouter.of(context).go(route);
    setState(() => _isVisible = false);
  }

  String? _routeFromCommand(String raw, UserRole role) {
    final text = raw.toLowerCase().trim();
    if (text.isEmpty) {
      return null;
    }

    if (text.contains('chat') || text.contains('message')) {
      return '/chat';
    }
    if (text.contains('alert') || text.contains('notification')) {
      return '/alerts';
    }
    if (text.contains('squad') || text.contains('team')) {
      return '/squad/dashboard';
    }
    if (text.contains('inventory') || text.contains('stock')) {
      return '/inventory';
    }
    if (text.contains('call') || text.contains('video')) {
      return '/connect';
    }
    if (text.contains('live agent') || text.contains('voice')) {
      return '/live-agent';
    }
    if (text.contains('gig') || text.contains('mission')) {
      return '/force';
    }
    if (text.contains('wallet') ||
        text.contains('khata') ||
        text.contains('earning')) {
      switch (role) {
        case UserRole.force:
          return '/force';
        case UserRole.source:
          return '/source';
        case UserRole.seeker:
          return '/seeker';
      }
    }
    if (text.contains('order') ||
        text.contains('food') ||
        text.contains('ride')) {
      return '/seeker';
    }
    if (text.contains('business') ||
        text.contains('source') ||
        text.contains('profit')) {
      return '/source';
    }
    return null;
  }

  @override
  Widget build(BuildContext context) {
    // Listen to state changes
    ref.listen(mojoProvider, (previous, next) {
      final state = next.state;

      if (!_isEditing) {
        if (state == MojoState.listening) {
          _textController.text = next.recognizedText.isEmpty
              ? "Listening..."
              : next.recognizedText;
          setState(() => _isVisible = true);
          _hideTimer?.cancel();
        } else if (state == MojoState.speaking) {
          _textController.text = next.aiResponseText;
          setState(() => _isVisible = true);
          _hideTimer?.cancel();
        } else if (state == MojoState.idle) {
          if (_isVisible) _startHideTimer();
        }
      }
    });

    // Dynamic padding for keyboard
    final bottomPadding = MediaQuery.of(context).viewInsets.bottom;
    const baseBottomPadding = 100.0; // Above Mojo

    return Align(
      alignment: Alignment.bottomCenter,
      child: AnimatedOpacity(
        opacity: _isVisible ? 1.0 : 0.0,
        duration: const Duration(milliseconds: 300),
        child: Padding(
          padding: EdgeInsets.only(bottom: baseBottomPadding + bottomPadding),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: _isEditing ? 340 : 300,
            decoration: BoxDecoration(
              color: _isEditing
                  ? Colors.white
                  : Colors.black.withValues(alpha: 0.6),
              borderRadius: BorderRadius.circular(24),
              border:
                  _isEditing ? Border.all(color: Colors.grey.shade300) : null,
              boxShadow: _isEditing
                  ? [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.1),
                        blurRadius: 10,
                        spreadRadius: 2,
                        offset: const Offset(0, 4),
                      ),
                    ]
                  : [],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                child: Padding(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    children: [
                      Expanded(
                        child: TextFormField(
                          controller: _textController,
                          focusNode: _focusNode,
                          textAlign:
                              _isEditing ? TextAlign.left : TextAlign.center,
                          readOnly: !_isEditing,
                          style: TextStyle(
                            color: _isEditing ? Colors.black87 : Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Poppins',
                            shadows: _isEditing
                                ? []
                                : [
                                    const Shadow(
                                      blurRadius: 4.0,
                                      color: Colors.black54,
                                      offset: Offset(0, 2),
                                    ),
                                  ],
                          ),
                          decoration: InputDecoration(
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                            hintText: "Ask Mojo...",
                            hintStyle: TextStyle(
                                color: _isEditing
                                    ? Colors.grey
                                    : Colors.white.withValues(alpha: 0.7)),
                          ),
                          maxLines: _isEditing ? 3 : 1,
                          minLines: 1,
                          textInputAction: TextInputAction.send,
                          onTap: () async {
                            if (!_isEditing) {
                              setState(() {
                                _isEditing = true;
                                _isVisible = true;
                              });
                              _hideTimer?.cancel();

                              // Stop mic
                              await ref
                                  .read(voiceInputServiceProvider)
                                  .stopListening();
                              ref
                                  .read(mojoProvider)
                                  .setMojoState(MojoState.idle);

                              // Request focus
                              WidgetsBinding.instance.addPostFrameCallback((_) {
                                _focusNode.requestFocus();
                              });
                            }
                          },
                          onFieldSubmitted: _submitText,
                        ),
                      ),

                      // Send Button (Only when editing)
                      if (_isEditing)
                        AnimatedOpacity(
                          opacity: _isEditing ? 1.0 : 0.0,
                          duration: const Duration(milliseconds: 200),
                          child: Container(
                            margin: const EdgeInsets.only(left: 8),
                            decoration: const BoxDecoration(
                              shape: BoxShape.circle,
                              color: Colors.black,
                            ),
                            child: IconButton(
                              icon: const Icon(Icons.arrow_upward,
                                  color: Colors.white, size: 20),
                              onPressed: () =>
                                  _submitText(_textController.text),
                              constraints: const BoxConstraints(
                                  minWidth: 36, minHeight: 36),
                              padding: EdgeInsets.zero,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
