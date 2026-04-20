// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sdui_screen.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

SDUIScreen _$SDUIScreenFromJson(Map<String, dynamic> json) {
  return _SDUIScreen.fromJson(json);
}

/// @nodoc
mixin _$SDUIScreen {
  String get screenId => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  bool get showAppBar => throw _privateConstructorUsedError;
  String? get backgroundColor =>
      throw _privateConstructorUsedError; // e.g., "#F5F2EB"
  List<SDUIComponent> get body => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SDUIScreenCopyWith<SDUIScreen> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SDUIScreenCopyWith<$Res> {
  factory $SDUIScreenCopyWith(
          SDUIScreen value, $Res Function(SDUIScreen) then) =
      _$SDUIScreenCopyWithImpl<$Res, SDUIScreen>;
  @useResult
  $Res call(
      {String screenId,
      String title,
      bool showAppBar,
      String? backgroundColor,
      List<SDUIComponent> body});
}

/// @nodoc
class _$SDUIScreenCopyWithImpl<$Res, $Val extends SDUIScreen>
    implements $SDUIScreenCopyWith<$Res> {
  _$SDUIScreenCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? screenId = null,
    Object? title = null,
    Object? showAppBar = null,
    Object? backgroundColor = freezed,
    Object? body = null,
  }) {
    return _then(_value.copyWith(
      screenId: null == screenId
          ? _value.screenId
          : screenId // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      showAppBar: null == showAppBar
          ? _value.showAppBar
          : showAppBar // ignore: cast_nullable_to_non_nullable
              as bool,
      backgroundColor: freezed == backgroundColor
          ? _value.backgroundColor
          : backgroundColor // ignore: cast_nullable_to_non_nullable
              as String?,
      body: null == body
          ? _value.body
          : body // ignore: cast_nullable_to_non_nullable
              as List<SDUIComponent>,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SDUIScreenImplCopyWith<$Res>
    implements $SDUIScreenCopyWith<$Res> {
  factory _$$SDUIScreenImplCopyWith(
          _$SDUIScreenImpl value, $Res Function(_$SDUIScreenImpl) then) =
      __$$SDUIScreenImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String screenId,
      String title,
      bool showAppBar,
      String? backgroundColor,
      List<SDUIComponent> body});
}

/// @nodoc
class __$$SDUIScreenImplCopyWithImpl<$Res>
    extends _$SDUIScreenCopyWithImpl<$Res, _$SDUIScreenImpl>
    implements _$$SDUIScreenImplCopyWith<$Res> {
  __$$SDUIScreenImplCopyWithImpl(
      _$SDUIScreenImpl _value, $Res Function(_$SDUIScreenImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? screenId = null,
    Object? title = null,
    Object? showAppBar = null,
    Object? backgroundColor = freezed,
    Object? body = null,
  }) {
    return _then(_$SDUIScreenImpl(
      screenId: null == screenId
          ? _value.screenId
          : screenId // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      showAppBar: null == showAppBar
          ? _value.showAppBar
          : showAppBar // ignore: cast_nullable_to_non_nullable
              as bool,
      backgroundColor: freezed == backgroundColor
          ? _value.backgroundColor
          : backgroundColor // ignore: cast_nullable_to_non_nullable
              as String?,
      body: null == body
          ? _value._body
          : body // ignore: cast_nullable_to_non_nullable
              as List<SDUIComponent>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SDUIScreenImpl implements _SDUIScreen {
  const _$SDUIScreenImpl(
      {required this.screenId,
      required this.title,
      this.showAppBar = false,
      this.backgroundColor,
      required final List<SDUIComponent> body})
      : _body = body;

  factory _$SDUIScreenImpl.fromJson(Map<String, dynamic> json) =>
      _$$SDUIScreenImplFromJson(json);

  @override
  final String screenId;
  @override
  final String title;
  @override
  @JsonKey()
  final bool showAppBar;
  @override
  final String? backgroundColor;
// e.g., "#F5F2EB"
  final List<SDUIComponent> _body;
// e.g., "#F5F2EB"
  @override
  List<SDUIComponent> get body {
    if (_body is EqualUnmodifiableListView) return _body;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_body);
  }

  @override
  String toString() {
    return 'SDUIScreen(screenId: $screenId, title: $title, showAppBar: $showAppBar, backgroundColor: $backgroundColor, body: $body)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SDUIScreenImpl &&
            (identical(other.screenId, screenId) ||
                other.screenId == screenId) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.showAppBar, showAppBar) ||
                other.showAppBar == showAppBar) &&
            (identical(other.backgroundColor, backgroundColor) ||
                other.backgroundColor == backgroundColor) &&
            const DeepCollectionEquality().equals(other._body, _body));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, screenId, title, showAppBar,
      backgroundColor, const DeepCollectionEquality().hash(_body));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SDUIScreenImplCopyWith<_$SDUIScreenImpl> get copyWith =>
      __$$SDUIScreenImplCopyWithImpl<_$SDUIScreenImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SDUIScreenImplToJson(
      this,
    );
  }
}

abstract class _SDUIScreen implements SDUIScreen {
  const factory _SDUIScreen(
      {required final String screenId,
      required final String title,
      final bool showAppBar,
      final String? backgroundColor,
      required final List<SDUIComponent> body}) = _$SDUIScreenImpl;

  factory _SDUIScreen.fromJson(Map<String, dynamic> json) =
      _$SDUIScreenImpl.fromJson;

  @override
  String get screenId;
  @override
  String get title;
  @override
  bool get showAppBar;
  @override
  String? get backgroundColor;
  @override // e.g., "#F5F2EB"
  List<SDUIComponent> get body;
  @override
  @JsonKey(ignore: true)
  _$$SDUIScreenImplCopyWith<_$SDUIScreenImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
