import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:rizik_v4/core/state/voice_input_provider.dart';
import 'dart:ui';
import 'dart:async';

class DictationOverlay extends ConsumerStatefulWidget {
  const DictationOverlay({super.key});

  @override
  ConsumerState<DictationOverlay> createState() => _DictationOverlayState();
}

class _DictationOverlayState extends ConsumerState<DictationOverlay> {
  late TextEditingController _textController;
  late FocusNode _focusNode;
  Timer? _hideTimer;
  bool _isVisible = false;
  bool _isEditing = false;

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
    _cancelHideTimer();
    super.dispose();
  }

  void _startHideTimer() {
    _cancelHideTimer();
    // Only hide if not editing
    if (_isEditing) return;
    
    _hideTimer = Timer(const Duration(seconds: 5), () {
      if (mounted && !_isEditing) {
        setState(() => _isVisible = false);
      }
    });
  }

  void _cancelHideTimer() {
    _hideTimer?.cancel();
    _hideTimer = null;
  }

  Future<void> _submitText(String text) async {
    if (text.trim().isEmpty) return;

    setState(() => _isEditing = false);
    _focusNode.unfocus();
    
    // Process text input via provider
    ref.read(mojoProvider).setRecognizedText(text);
    ref.read(mojoProvider).setMojoState(MojoState.speaking); // Show thinking/speaking
    
    final voiceService = ref.read(voiceInputServiceProvider);
    final result = await voiceService.processText(text);
    
    if (result != null) {
      ref.read(mojoProvider).setRecognizedText(result['transcript']!);
      ref.read(mojoProvider).setAiResponseText(result['response']!);
      ref.read(mojoProvider).setMojoState(MojoState.speaking);
      
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

  @override
  Widget build(BuildContext context) {
    // Listen to state changes for visibility logic
    ref.listen(mojoProvider, (previous, next) {
      final state = next.state;
      
      if (state == MojoState.listening || state == MojoState.speaking) {
        // Show immediately
        setState(() => _isVisible = true);
        _cancelHideTimer();
      } else if (state == MojoState.idle) {
        // Start hide timer
        if (_isVisible && !_isEditing) {
          _startHideTimer();
        }
      }
      
      // Update text if not editing
      if (!_isEditing) {
        if (state == MojoState.listening) {
           _textController.text = next.recognizedText.isEmpty ? "Listening..." : next.recognizedText;
        } else if (state == MojoState.speaking) {
           _textController.text = next.aiResponseText;
        } else if (state == MojoState.idle) {
           // If we have text, ensure it's displayed
           final text = next.aiResponseText.isNotEmpty ? next.aiResponseText : next.recognizedText;
           if (text.isNotEmpty) {
             _textController.text = text;
           }
        }
      }
    });

    return AnimatedOpacity(
      opacity: _isVisible ? 1.0 : 0.0,
      duration: const Duration(milliseconds: 500),
      child: Center(
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: _isEditing ? 340 : 300, // Expand slightly when editing
          decoration: BoxDecoration(
            color: _isEditing ? Colors.black.withOpacity(0.8) : Colors.transparent, // Transparent when listening
            borderRadius: BorderRadius.circular(24),
            border: _isEditing ? Border.all(color: Colors.white.withOpacity(0.2)) : null,
            boxShadow: _isEditing ? [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 15,
                spreadRadius: 2,
              ),
            ] : [],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: _isEditing ? 15 : 0, sigmaY: _isEditing ? 15 : 0),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _textController,
                        focusNode: _focusNode,
                        textAlign: _isEditing ? TextAlign.left : TextAlign.center,
                        readOnly: !_isEditing,
                        onTap: () async {
                          if (!_isEditing) {
                            setState(() {
                              _isEditing = true;
                              _isVisible = true;
                            });
                            _cancelHideTimer();
                            
                            // Stop mic via provider
                            await ref.read(voiceInputServiceProvider).stopListening();
                            ref.read(mojoProvider).setMojoState(MojoState.idle);
                            
                            WidgetsBinding.instance.addPostFrameCallback((_) {
                              _focusNode.requestFocus();
                            });
                          }
                        },
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.w500,
                          fontFamily: 'Poppins',
                          shadows: _isEditing ? [] : [
                            const Shadow(
                              blurRadius: 4.0,
                              color: Colors.black87,
                              offset: Offset(0, 2),
                            ),
                          ],
                        ),
                        decoration: InputDecoration(
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding: EdgeInsets.zero,
                          hintText: "Ask Mojo...",
                          hintStyle: TextStyle(color: Colors.white.withOpacity(0.5)),
                        ),
                        maxLines: _isEditing ? 3 : null, // Multiline when editing
                        minLines: 1,
                        textInputAction: TextInputAction.send,
                        onFieldSubmitted: _submitText,
                      ),
                    ),
                    
                    // Send Button (Only visible when editing)
                    if (_isEditing)
                      AnimatedOpacity(
                        opacity: _isEditing ? 1.0 : 0.0,
                        duration: const Duration(milliseconds: 200),
                        child: Container(
                          margin: const EdgeInsets.only(left: 8),
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            color: Colors.white,
                          ),
                          child: IconButton(
                            icon: const Icon(Icons.arrow_upward, color: Colors.black, size: 20),
                            onPressed: () => _submitText(_textController.text),
                            constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
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
    );
  }
}
