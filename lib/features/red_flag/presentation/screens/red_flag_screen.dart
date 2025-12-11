import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/red_flag/data/red_flag_repository.dart';
import 'package:rizik_v4/core/wrappers/toast_wrapper.dart';
import 'package:fl_chart/fl_chart.dart'; // Assuming fl_chart is used for visualization, or we build a custom gauge

/// Red Flag Screen
/// Input form and result visualization
class RedFlagScreen extends ConsumerStatefulWidget {
  const RedFlagScreen({super.key});

  @override
  ConsumerState<RedFlagScreen> createState() => _RedFlagScreenState();
}

class _RedFlagScreenState extends ConsumerState<RedFlagScreen> {
  final _inputController = TextEditingController();
  bool _isLoading = false;
  Map<String, dynamic>? _result;

  Future<void> _analyze() async {
    final input = _inputController.text.trim();
    if (input.isEmpty) return;

    setState(() {
      _isLoading = true;
      _result = null;
    });

    try {
      final data = await ref.read(redFlagRepositoryProvider).analyzeRisk(input);
      setState(() => _result = data);
    } catch (e) {
      toastWrapper.showError(e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Red Flag Meter 🚩')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text(
              'Detect potential risks in profiles, messages, or job offers.',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _inputController,
              decoration: const InputDecoration(
                labelText: 'Paste text or profile link',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.warning_amber),
              ),
              maxLines: 4,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _isLoading ? null : _analyze,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
              child: _isLoading
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Analyze Risk'),
            ),
            const SizedBox(height: 32),
            if (_result != null) _buildResult(_result!),
          ],
        ),
      ),
    );
  }

  Widget _buildResult(Map<String, dynamic> data) {
    final riskScore = data['risk_score'] ?? 0; // 0-100
    final analysis = data['analysis'] ?? 'No analysis';
    final flags = (data['flags'] as List?)?.map((e) => e.toString()).toList() ?? [];

    Color color = Colors.green;
    String level = 'Safe';
    if (riskScore > 30) {
      color = Colors.orange;
      level = 'Caution';
    }
    if (riskScore > 70) {
      color = Colors.red;
      level = 'High Risk';
    }

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          children: [
            // Gauge Visualization (Simple Circular Progress for now)
            Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  height: 150,
                  width: 150,
                  child: CircularProgressIndicator(
                    value: riskScore / 100,
                    strokeWidth: 15,
                    backgroundColor: Colors.grey[200],
                    color: color,
                  ),
                ),
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      '$riskScore%',
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: color),
                    ),
                    Text(level, style: TextStyle(color: color, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 24),
            Text(
              analysis,
              textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 16),
            ),
            if (flags.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 8),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Detected Flags:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red[800])),
              ),
              const SizedBox(height: 8),
              ...flags.map((flag) => Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: Row(
                  children: [
                    const Icon(Icons.flag, color: Colors.red, size: 16),
                    const SizedBox(width: 8),
                    Expanded(child: Text(flag)),
                  ],
                ),
              )),
            ],
          ],
        ),
      ),
    );
  }
}
