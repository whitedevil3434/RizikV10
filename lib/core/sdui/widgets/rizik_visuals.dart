import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:rizik_v4/core/sdui/widget_registry.dart';

/// Renders a container with a linear gradient background and rounded corners.
class RizikGradientCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const RizikGradientCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final effectiveData = data['data'] is Map<String, dynamic> 
        ? data['data'] as Map<String, dynamic> 
        : data;

    final colorsData = (effectiveData['colors'] as List<dynamic>?)?.cast<String>() ?? ['#FFFFFF', '#FFFFFF'];
    final colors = colorsData.map((c) => _parseColor(c)).toList();
    final radius = (effectiveData['radius'] as num?)?.toDouble() ?? 12.0;
    final childData = effectiveData['child'];

    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(radius),
      ),
      child: childData != null
          ? WidgetRegistry.build(context, childData['type'], childData)
          : _buildDefaultContent(context, effectiveData),
    );
  }

  Widget? _buildDefaultContent(BuildContext context, Map<String, dynamic> data) {
    final title = data['title'] as String?;
    final subtitle = data['subtitle'] as String?;
    final iconName = data['icon'] as String?;
    
    if (title == null) return null;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          if (iconName != null) ...[
            Icon(_parseIconData(iconName), color: Colors.white, size: 32),
            const SizedBox(width: 16),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                if (subtitle != null)
                  Text(subtitle, style: const TextStyle(color: Colors.white70, fontSize: 14)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _parseIconData(String name) {
    switch (name) {
      case 'sentiment_satisfied': return Icons.sentiment_satisfied;
      case 'sentiment_dissatisfied': return Icons.sentiment_dissatisfied;
      case 'attach_money': return Icons.attach_money;
      case 'bar_chart': return Icons.bar_chart;
      default: return Icons.star;
    }
  }

  Color _parseColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }
}

/// Uses BackdropFilter to create a glassmorphism effect.
/// Uses BackdropFilter to create a glassmorphism effect.
class RizikGlassCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const RizikGlassCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    // Handle nested data structure if present
    final effectiveData = data['data'] is Map<String, dynamic> 
        ? data['data'] as Map<String, dynamic> 
        : data;

    final blur = (effectiveData['blur'] as num?)?.toDouble() ?? 10.0;
    final opacity = (effectiveData['opacity'] as num?)?.toDouble() ?? 0.1;
    final childData = effectiveData['child'];
    final radius = (effectiveData['radius'] as num?)?.toDouble() ?? 12.0;

    return ClipRRect(
      borderRadius: BorderRadius.circular(radius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blur, sigmaY: blur),
        child: Container(
          color: Colors.white.withOpacity(opacity),
          child: childData != null
              ? WidgetRegistry.build(context, childData['type'], childData)
              : _buildDefaultContent(context, effectiveData),
        ),
      ),
    );
  }

  Widget? _buildDefaultContent(BuildContext context, Map<String, dynamic> data) {
    final title = data['title'] as String?;
    final subtitle = data['subtitle'] as String?;
    final description = data['description'] as String?;
    final iconName = data['icon'] as String?;
    final iconColorHex = data['iconColor'] as String? ?? '#000000';
    
    if (title == null) return null;

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              if (iconName != null) ...[
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _parseColor(iconColorHex).withOpacity(0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(_parseIconData(iconName), color: _parseColor(iconColorHex), size: 24),
                ),
                const SizedBox(width: 12),
              ],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    if (subtitle != null)
                      Text(subtitle, style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                  ],
                ),
              ),
            ],
          ),
          if (description != null) ...[
            const SizedBox(height: 12),
            Text(description, style: const TextStyle(fontSize: 14)),
          ],
        ],
      ),
    );
  }

  Color _parseColor(String hexString) {
    try {
      final buffer = StringBuffer();
      if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
      buffer.write(hexString.replaceFirst('#', ''));
      return Color(int.parse(buffer.toString(), radix: 16));
    } catch (e) {
      if (hexString == 'blue') return Colors.blue;
      if (hexString == 'green') return Colors.green;
      if (hexString == 'red') return Colors.red;
      return Colors.black;
    }
  }

  IconData _parseIconData(String name) {
    switch (name) {
      case 'attach_money': return Icons.attach_money;
      case 'bar_chart': return Icons.bar_chart;
      case 'sentiment_satisfied': return Icons.sentiment_satisfied;
      default: return Icons.info;
    }
  }

}

/// An icon that animates based on the command (e.g., a pulsing red dot for alerts).
class RizikAnimIcon extends StatelessWidget {
  final Map<String, dynamic> data;

  const RizikAnimIcon({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final iconName = data['icon_name'] as String? ?? 'help';
    final colorHex = data['color'] as String? ?? '#000000';
    final size = (data['size'] as num?)?.toDouble() ?? 24.0;
    final animationType = data['animation'] as String?;

    final iconData = _parseIconData(iconName);
    final color = _parseColor(colorHex);

    Widget iconWidget = Icon(
      iconData,
      color: color,
      size: size,
    );

    if (animationType == 'pulse') {
      iconWidget = iconWidget.animate(onPlay: (controller) => controller.repeat(reverse: true))
          .scale(duration: 600.ms, begin: const Offset(1, 1), end: const Offset(1.2, 1.2));
    } else if (animationType == 'spin') {
      iconWidget = iconWidget.animate(onPlay: (controller) => controller.repeat())
          .rotate(duration: 1.seconds);
    }

    return iconWidget;
  }

  Color _parseColor(String hexString) {
    final buffer = StringBuffer();
    if (hexString.length == 6 || hexString.length == 7) buffer.write('ff');
    buffer.write(hexString.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  IconData _parseIconData(String name) {
    switch (name) {
      case 'home': return Icons.home;
      case 'person': return Icons.person;
      case 'work': return Icons.work;
      case 'school': return Icons.school;
      case 'add': return Icons.add;
      case 'search': return Icons.search;
      case 'notifications': return Icons.notifications;
      case 'warning': return Icons.warning;
      case 'check_circle': return Icons.check_circle;
      case 'favorite': return Icons.favorite;
      case 'settings': return Icons.settings;
      case 'star': return Icons.star;
      default: return Icons.help;
    }
  }
}
