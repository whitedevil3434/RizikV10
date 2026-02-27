import 'package:freezed_annotation/freezed_annotation.dart';

part 'sdui_component.freezed.dart';
part 'sdui_component.g.dart';

@freezed
class SDUIComponent with _$SDUIComponent {
  const factory SDUIComponent({
    required String type, // e.g., 'RizikCard', 'RizikBanner', 'RizikList', 'Gap'
    String? id,
    Map<String, dynamic>? properties, // Styling, text, colors, sizes
    List<SDUIComponent>? children, // Nested components
    Map<String, dynamic>? actions, // OnTap event mapping
  }) = _SDUIComponent;

  factory SDUIComponent.fromJson(Map<String, dynamic> json) =>
      _$SDUIComponentFromJson(json);
}
