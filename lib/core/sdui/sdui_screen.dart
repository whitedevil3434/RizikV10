import 'package:flutter/material.dart';
import 'package:rizik_v4/data/remote/supabase/sdui_service.dart';
import 'package:rizik_v4/core/sdui/renderer.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
import 'package:rizik_v4/core/shell/rizik_scaffold.dart';
import 'package:rizik_v4/shared/widgets/loaders/rizik_shell_shimmer.dart';

class SDUIScreen extends StatefulWidget {
  final String role;
  final String screenId;

  const SDUIScreen({
    super.key,
    required this.role,
    required this.screenId,
  });

  @override
  State<SDUIScreen> createState() => _SDUIScreenState();
}

class _SDUIScreenState extends State<SDUIScreen> {
  final SduiService _sduiService = SduiService();
  late Future<Map<String, dynamic>> _screenDataFuture;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void didUpdateWidget(SDUIScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.role != widget.role || oldWidget.screenId != widget.screenId) {
      _loadData();
    }
  }

  void _loadData() {
    _screenDataFuture = _sduiService.fetchScreen(widget.role, screenId: widget.screenId);
  }

  Future<void> _refresh() async {
    setState(() {
      _loadData();
    });
    await _screenDataFuture;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RizikColors.background,
      body: RefreshIndicator(
        onRefresh: _refresh,
        child: FutureBuilder<Map<String, dynamic>>(
          future: _screenDataFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const RizikShellShimmer();
            } else if (snapshot.hasError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 48),
                    const SizedBox(height: 16),
                    Text('Error: ${snapshot.error}', textAlign: TextAlign.center),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _refresh,
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              );
            } else if (snapshot.hasData) {
              return SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: RepaintBoundary(
                  child: RizikRenderer(uiData: snapshot.data!),
                ),
                ),
              );
            } else {
              return const Center(child: Text('No data available'));
            }
          },
        ),
      ),
    );
  }
}
