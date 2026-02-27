import 'package:freezed_annotation/freezed_annotation.dart';
import 'sdui_component.dart';

part 'sdui_screen.freezed.dart';
part 'sdui_screen.g.dart';

@freezed
class SDUIScreen with _$SDUIScreen {
  const factory SDUIScreen({
    required String screenId,
    required String title,
    @Default(false) bool showAppBar,
    String? backgroundColor, // e.g., "#F5F2EB"
    required List<SDUIComponent> body, // The root components of the screen
  }) = _SDUIScreen;

  factory SDUIScreen.fromJson(Map<String, dynamic> json) =>
      _$SDUIScreenFromJson(json);
}
