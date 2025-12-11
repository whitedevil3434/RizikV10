import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/theme/rizik_colors.dart';
import 'package:rizik_v4/features/squad/presentation/screens/squad_dashboard_screen.dart';

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> {
  final TextEditingController _voiceInputController = TextEditingController();
  bool _isProcessing = false;
  String? _aiResponse;

  Future<void> _sendVoiceCommand() async {
    if (_voiceInputController.text.isEmpty) return;

    setState(() {
      _isProcessing = true;
      _aiResponse = null;
    });

    try {
      final response = await ref.read(squadRepositoryProvider).sendVoiceCommand(
            'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Mock User ID
            _voiceInputController.text,
          );

      if (mounted) {
        setState(() {
          _aiResponse = response;
          _isProcessing = false;
          _voiceInputController.clear();
        });
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(response)),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isProcessing = false;
          _aiResponse = 'Error: $e';
        });
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to process command: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inventory Voice-Log'),
        backgroundColor: RizikColors.cardSurface,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Instructions
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: RizikColors.rizikGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Column(
                children: [
                  Icon(Icons.mic, size: 48, color: RizikColors.rizikGreen),
                  SizedBox(height: 8),
                  Text(
                    'Speak or type to update inventory',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  Text(
                    'Example: "5kg chal add koro"',
                    style: TextStyle(color: RizikColors.secondaryText),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Input Area
            TextField(
              controller: _voiceInputController,
              decoration: InputDecoration(
                hintText: 'Type command here...',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                suffixIcon: IconButton(
                  icon: _isProcessing
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.send),
                  onPressed: _isProcessing ? null : _sendVoiceCommand,
                ),
              ),
              onSubmitted: (_) => _sendVoiceCommand(),
            ),
            
            const SizedBox(height: 24),

            // AI Response Area
            if (_aiResponse != null)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'AI Response:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Colors.green,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(_aiResponse!),
                  ],
                ),
              ),

            const Spacer(),
            
            // Mock Inventory List (Placeholder)
            const Text(
              'Recent Updates',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
            ),
            const SizedBox(height: 8),
            Expanded(
              child: ListView(
                children: const [
                  ListTile(
                    leading: Icon(Icons.inventory_2_outlined),
                    title: Text('Rice (Chal)'),
                    subtitle: Text('Added 5kg • Just now'),
                    trailing: Text('+5 kg', style: TextStyle(color: Colors.green)),
                  ),
                  ListTile(
                    leading: Icon(Icons.inventory_2_outlined),
                    title: Text('Oil (Tel)'),
                    subtitle: Text('Added 2L • 2 hours ago'),
                    trailing: Text('+2 L', style: TextStyle(color: Colors.green)),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
