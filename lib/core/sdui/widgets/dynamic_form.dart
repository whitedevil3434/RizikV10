import 'package:flutter/material.dart';
import 'package:rizik_v4/core/sdui/widget_registry.dart';
import 'package:rizik_v4/core/sdui/form_state_manager.dart';

class DynamicForm extends StatelessWidget {
  final Map<String, dynamic> data;

  const DynamicForm({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final fields = (data['fields'] as List<dynamic>? ?? []);
    final submitAction = data['submitAction']; // Expecting { "type": "call_provider", "provider": "...", "method": "..." }
    final submitLabel = data['submitLabel'] ?? 'Submit';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ...fields.map((fieldData) {
          // Map generic field properties to widget properties
          final Map<String, dynamic> widgetData = <String, dynamic>{
            'type': 'input_field', // Default to input_field, but could be others
            'label': fieldData['label'],
            'hint': fieldData['hint'],
            'field_name': fieldData['field_name'], // Used by FormStateManager via label for now, but should be explicit
            'input_type': fieldData['input_type'], // text, number, etc.
          };
          
          if (fieldData is Map) {
            widgetData.addAll(fieldData.cast<String, dynamic>());
          }
          
          // If the type is explicitly defined in JSON (e.g. 'dropdown'), use it. 
          // Otherwise default to 'input_field' which maps to TextField in registry.
          final widgetType = fieldData['type'] ?? 'input_field';
          
          return Padding(
            padding: const EdgeInsets.only(bottom: 16.0),
            child: WidgetRegistry.build(context, widgetType, widgetData),
          );
        }),
        if (submitAction != null)
          Padding(
            padding: const EdgeInsets.only(top: 8.0),
            child: WidgetRegistry.build(context, 'button', {
              'child': {'type': 'text', 'text': submitLabel, 'color': 'white', 'fontWeight': 'bold'},
              'action': submitAction,
              'padding': 16,
              'color': '#4CAF50', // Rizik Green
              'borderRadius': 8,
            }),
          ),
      ],
    );
  }
}
