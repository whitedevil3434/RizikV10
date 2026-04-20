import 'package:freezed_annotation/freezed_annotation.dart';

part 'sdui_models.freezed.dart';
part 'sdui_models.g.dart';

@freezed
class SDUIComponent with _$SDUIComponent {
  const factory SDUIComponent({
    required String type,
    @Default({}) Map<String, dynamic> props,
    @Default([]) List<SDUIComponent> children,
    String? id,
  }) = _SDUIComponent;

  factory SDUIComponent.fromJson(Map<String, dynamic> json) =>
      _$SDUIComponentFromJson(json);
}

@freezed
class SDUIScreen with _$SDUIScreen {
  const factory SDUIScreen({
    required String id,
    required String title,
    required SDUIComponent root,
    @Default({}) Map<String, dynamic> metadata,
  }) = _SDUIScreen;

  factory SDUIScreen.fromJson(Map<String, dynamic> json) =>
      _$SDUIScreenFromJson(json);
}
