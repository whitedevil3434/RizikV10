import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/widget_registry.dart';

class RizikRenderer extends StatelessWidget {
  final Map<String, dynamic> uiData;

  const RizikRenderer({
    super.key,
    required this.uiData,
  });

  @override
  Widget build(BuildContext context) {
    final type = uiData['type'];
    if (type == null) {
      print('Error: Widget type is null in RizikRenderer');
      return const SizedBox.shrink();
    }
    print('RizikRenderer building root widget: $type');
    return WidgetRegistry.build(context, type, uiData);
  }
}
