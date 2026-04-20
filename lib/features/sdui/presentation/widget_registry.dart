import 'package:flutter/material.dart';
import '../../features/sdui/domain/sdui_models.dart';
import '../../../core/widgets/rizik_core_ui.dart';
import '../../../core/widgets/rizik_button.dart';

class WidgetRegistry {
  static Widget build(SDUIComponent component, BuildContext context) {
    switch (component.type) {
      case 'column':
        return Column(
          crossAxisAlignment: _parseCrossAxisAlignment(component.props['crossAlign']),
          mainAxisAlignment: _parseMainAxisAlignment(component.props['mainAlign']),
          children: component.children.map((c) => build(c, context)).toList(),
        );

      case 'row':
        return Row(
          crossAxisAlignment: _parseCrossAxisAlignment(component.props['crossAlign']),
          mainAxisAlignment: _parseMainAxisAlignment(component.props['mainAlign']),
          children: component.children.map((c) => build(c, context)).toList(),
        );

      case 'card':
        return RizikCard(
          padding: _parsePadding(component.props['padding']),
          child: component.children.isNotEmpty 
            ? build(component.children.first, context) 
            : const SizedBox.shrink(),
        );

      case 'text':
        return RizikText(
          component.props['text'] ?? '',
          size: (component.props['size'] as num?)?.toDouble() ?? 14.0,
          weight: _parseFontWeight(component.props['weight']),
          color: _parseColor(component.props['color']),
        );

      case 'button':
        return RizikButton(
          onPressed: () {
             // Future: Dispatch action from SDUI
             print("SDUI Button Pressed: ${component.props['action']}");
          },
          child: RizikText(
            component.props['label'] ?? 'Button',
            color: Colors.white,
            weight: FontWeight.w600,
          ),
        );

      case 'padding':
        return Padding(
          padding: _parsePadding(component.props['value']),
          child: component.children.isNotEmpty 
            ? build(component.children.first, context) 
            : const SizedBox.shrink(),
        );

      case 'spacer':
        return const Spacer();

      case 'gap':
        return SizedBox(
          width: (component.props['w'] as num?)?.toDouble(),
          height: (component.props['h'] as num?)?.toDouble(),
        );

      default:
        return Center(child: Text("Unknown Type: ${component.type}"));
    }
  }

  static CrossAxisAlignment _parseCrossAxisAlignment(String? align) {
    switch (align) {
      case 'start': return CrossAxisAlignment.start;
      case 'end': return CrossAxisAlignment.end;
      case 'center': return CrossAxisAlignment.center;
      default: return CrossAxisAlignment.start;
    }
  }

  static MainAxisAlignment _parseMainAxisAlignment(String? align) {
    switch (align) {
      case 'start': return MainAxisAlignment.start;
      case 'end': return MainAxisAlignment.end;
      case 'center': return MainAxisAlignment.center;
      case 'spaceBetween': return MainAxisAlignment.spaceBetween;
      default: return MainAxisAlignment.start;
    }
  }

  static EdgeInsets _parsePadding(dynamic value) {
    if (value is num) return EdgeInsets.all(value.toDouble());
    if (value is List && value.length == 4) {
      return EdgeInsets.fromLTRB(
        (value[0] as num).toDouble(),
        (value[1] as num).toDouble(),
        (value[2] as num).toDouble(),
        (value[3] as num).toDouble(),
      );
    }
    return EdgeInsets.zero;
  }

  static FontWeight _parseFontWeight(dynamic weight) {
    switch (weight) {
      case 300: return FontWeight.w300;
      case 400: return FontWeight.w400;
      case 600: return FontWeight.w600;
      case 700: return FontWeight.w700;
      default: return FontWeight.w400;
    }
  }

  static Color _parseColor(String? colorHex) {
    if (colorHex == null) return const Color(0xFF1A1A1A);
    try {
      return Color(int.parse(colorHex.replaceAll('#', '0xFF')));
    } catch (_) {
      return const Color(0xFF1A1A1A);
    }
  }
}
