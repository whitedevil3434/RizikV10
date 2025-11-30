import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/widget_registry.dart';
import 'dart:convert';

/// SDUI Debug Screen (Hour 4: The Playground)
/// Allows testing widgets by pasting JSON payloads
class SDUIDebugScreen extends StatefulWidget {
  const SDUIDebugScreen({super.key});

  @override
  State<SDUIDebugScreen> createState() => _SDUIDebugScreenState();
}

class _SDUIDebugScreenState extends State<SDUIDebugScreen> {
  final TextEditingController _jsonController = TextEditingController();
  Map<String, dynamic>? _parsedData;
  String? _errorMessage;

  // Sample JSON templates for quick testing
  final Map<String, String> _templates = {
    'Mission Offer': '''{
  "type": "rizik_mission_offer",
  "missionId": "mission_123",
  "showMap": true,
  "autoRefresh": false
}''',
    'Trust Aura': '''{
  "type": "rizik_trust_aura",
  "profileId": "user_123",
  "showCategories": true,
  "compact": false
}''',
    'Aura Card': '''{
  "type": "rizik_aura_card",
  "userId": "user_123",
  "showQuests": true,
  "compact": false
}''',
    'Dhaar Status': '''{
  "type": "rizik_dhaar_status",
  "userId": "user_123",
  "showVouchers": true,
  "showSchedule": true
}''',
    'Float Monitor': '''{
  "type": "rizik_float_monitor",
  "moverId": "mover_123",
  "showRepaymentPreview": true
}''',
    'Tribunal Case': '''{
  "type": "rizik_tribunal_case",
  "disputeId": "dispute_101",
  "showEvidence": true,
  "userId": "user_123"
}''',
    'Duty Card': '''{
  "type": "rizik_duty_card",
  "userId": "user_123",
  "showUpcoming": 3,
  "enableSwap": true
}''',
    'Expense Summary': '''{
  "type": "rizik_expense_summary",
  "groupId": "group_456",
  "showCategories": true,
  "limit": 5
}''',
  };

  @override
  void initState() {
    super.initState();
    // Load Mission Offer template by default
    _jsonController.text = _templates['Mission Offer']!;
  }

  void _renderWidget() {
    setState(() {
      _errorMessage = null;
      try {
        _parsedData = jsonDecode(_jsonController.text) as Map<String, dynamic>;
      } catch (e) {
        _errorMessage = 'Invalid JSON: ${e.toString()}';
        _parsedData = null;
      }
    });
  }

  void _loadTemplate(String templateName) {
    setState(() {
      _jsonController.text = _templates[templateName]!;
      _errorMessage = null;
      _parsedData = null;
    });
  }

  void _clearOutput() {
    setState(() {
      _parsedData = null;
      _errorMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade100,
      appBar: AppBar(
        title: const Text('🧪 SDUI Debug Playground'),
        backgroundColor: const Color(0xFF7C4DFF),
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _clearOutput,
            tooltip: 'Clear Output',
          ),
        ],
      ),
      body: Row(
        children: [
          // Left Panel: JSON Input
          Expanded(
            flex: 2,
            child: Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    '📝 JSON Payload',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  
                  // Template Selector
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: _templates.keys.map((name) {
                      return ActionChip(
                        label: Text(name, style: const TextStyle(fontSize: 11)),
                        onPressed: () => _loadTemplate(name),
                        backgroundColor: Colors.blue.shade50,
                        labelStyle: const TextStyle(color: Colors.blue),
                      );
                    }).toList(),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // JSON TextField
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade900,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.all(12),
                      child: TextField(
                        controller: _jsonController,
                        maxLines: null,
                        expands: true,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontSize: 12,
                          color: Colors.greenAccent,
                        ),
                        decoration: const InputDecoration(
                          border: InputBorder.none,
                          hintText: 'Paste your JSON here...',
                          hintStyle: TextStyle(color: Colors.grey),
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 16),
                  
                  // Render Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: _renderWidget,
                      icon: const Icon(Icons.play_arrow),
                      label: const Text('⚡ Render Widget'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF66BB6A),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Right Panel: Widget Preview
          Expanded(
            flex: 3,
            child: Container(
              color: Colors.grey.shade200,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        '📱 Preview',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_parsedData != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '✓ Rendered: ${_parsedData!['type']}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Widget Display
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      padding: const EdgeInsets.all(16),
                      child: _buildPreview(),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPreview() {
    if (_errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, color: Colors.red, size: 64),
            const SizedBox(height: 16),
            Text(
              _errorMessage!,
              style: const TextStyle(color: Colors.red, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }

    if (_parsedData == null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.code, color: Colors.grey.shade400, size: 64),
            const SizedBox(height: 16),
            Text(
              'Paste JSON and click "Render Widget"',
              style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
            ),
          ],
        ),
      );
    }

    // Render the widget using WidgetRegistry
    try {
      return SingleChildScrollView(
        child: WidgetRegistry.build(context, _parsedData!['type'] ?? 'unknown', _parsedData!),
      );
    } catch (e) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.warning, color: Colors.orange, size: 64),
            const SizedBox(height: 16),
            Text(
              'Render Error: ${e.toString()}',
              style: const TextStyle(color: Colors.orange, fontSize: 14),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    }
  }

  @override
  void dispose() {
    _jsonController.dispose();
    super.dispose();
  }
}
