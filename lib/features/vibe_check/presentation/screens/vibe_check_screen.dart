import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/vibe_check/data/vibe_check_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';

/// Vibe Check Screen
/// AI Chat Interface for analyzing vibes
class VibeCheckScreen extends ConsumerStatefulWidget {
  const VibeCheckScreen({super.key});

  @override
  ConsumerState<VibeCheckScreen> createState() => _VibeCheckScreenState();
}

class _VibeCheckScreenState extends ConsumerState<VibeCheckScreen> {
  final _textController = TextEditingController();
  final List<Map<String, dynamic>> _messages = [];
  bool _isLoading = false;

  Future<void> _analyze() async {
    final text = _textController.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'role': 'user', 'content': text});
      _isLoading = true;
    });
    _textController.clear();

    try {
      final result = await ref.read(vibeCheckRepositoryProvider).analyzeText(text);
      final analysis = result['analysis'] ?? 'No analysis available';
      final score = result['vibe_score'] ?? 0;

      setState(() {
        _messages.add({
          'role': 'ai',
          'content': analysis,
          'score': score,
        });
      });
    } catch (e) {
      toastWrapper.showError(e.toString());
      setState(() {
        _messages.add({'role': 'error', 'content': 'Failed to analyze vibe.'});
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Vibe Check AI')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isUser = msg['role'] == 'user';
                final isError = msg['role'] == 'error';

                return Align(
                  alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(16),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isUser ? Colors.blue : (isError ? Colors.red[100] : Colors.grey[200]),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          msg['content'],
                          style: TextStyle(color: isUser ? Colors.white : Colors.black),
                        ),
                        if (msg['score'] != null) ...[
                          const SizedBox(height: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black12,
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Vibe Score: ${msg['score']}/100',
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          if (_isLoading) const LinearProgressIndicator(),
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _textController,
                    decoration: const InputDecoration(
                      hintText: 'Paste chat or type text...',
                      border: OutlineInputBorder(),
                    ),
                    maxLines: null,
                  ),
                ),
                const SizedBox(width: 8),
                IconButton(
                  onPressed: _isLoading ? null : _analyze,
                  icon: const Icon(Icons.send),
                  color: Colors.blue,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
