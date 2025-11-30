import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:rizik_v4/core/sdui/renderer.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

class SDUIPreviewScreen extends StatefulWidget {
  const SDUIPreviewScreen({super.key});

  @override
  State<SDUIPreviewScreen> createState() => _SDUIPreviewScreenState();
}

class _SDUIPreviewScreenState extends State<SDUIPreviewScreen> {
  Map<String, dynamic>? _uiData;
  bool _isLoading = true;
  String? _error;
  String _currentRole = 'mover';

  @override
  void initState() {
    super.initState();
    _fetchScreenData();
  }

  Future<void> _fetchScreenData() async {
    try {
      final response = await Supabase.instance.client
          .from('app_screens')
          .select('screen_data')
          .eq('role', _currentRole)
          .single();
      
      if (mounted) {
        setState(() {
          _uiData = response['screen_data'] as Map<String, dynamic>;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = e.toString();
          _isLoading = false;
        });
      }
    }
  }

  void _toggleRole() {
    setState(() {
      _currentRole = _currentRole == 'mover' ? 'seeker' : 'mover';
      _isLoading = true;
      _error = null;
    });
    _fetchScreenData();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: Colors.red, size: 48),
                const SizedBox(height: 16),
                Text(
                  'Error loading SDUI',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(_error!, textAlign: TextAlign.center),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: () {
                    setState(() {
                      _isLoading = true;
                      _error = null;
                    });
                    _fetchScreenData();
                  },
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text('SDUI Preview ($_currentRole)'),
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              setState(() {
                _isLoading = true;
                _error = null;
              });
              _fetchScreenData();
            },
          ),
        ],
      ),
      backgroundColor: Colors.grey.shade100,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: RizikRenderer(uiData: _uiData!),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _toggleRole,
        icon: const Icon(Icons.swap_horiz),
        label: Text('Switch to ${_currentRole == 'mover' ? 'Seeker' : 'Mover'}'),
        backgroundColor: Colors.black,
      ),
    );
  }
}
