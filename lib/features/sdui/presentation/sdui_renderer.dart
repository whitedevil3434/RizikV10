import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/sdui_models.dart';
import 'widget_registry.dart';

class SDUIRenderer extends ConsumerWidget {
  final SDUIScreen screen;

  const SDUIRenderer({
    super.key,
    required this.screen,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F2EB),
      appBar: AppBar(
        title: Text(
          screen.title,
          style: const TextStyle(
            color: Color(0xFF031E49),
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: WidgetRegistry.build(screen.root, context),
        ),
      ),
    );
  }
}
