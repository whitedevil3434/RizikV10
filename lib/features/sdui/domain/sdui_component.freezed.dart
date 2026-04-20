// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sdui_component.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
    'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models');

SDUIComponent _$SDUIComponentFromJson(Map<String, dynamic> json) {
  return _SDUIComponent.fromJson(json);
}

/// @nodoc
mixin _$SDUIComponent {
  String get type =>
      throw _privateConstructorUsedError; // e.g., 'RizikCard', 'RizikBanner', 'RizikList', 'Gap'
  String? get id => throw _privateConstructorUsedError;
  Map<String, dynamic>? get properties =>
      throw _privateConstructorUsedError; // Styling, text, colors, sizes
  List<SDUIComponent>? get children =>
      throw _privateConstructorUsedError; // Nested components
  Map<String, dynamic>? get actions => throw _privateConstructorUsedError;

  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;
  @JsonKey(ignore: true)
  $SDUIComponentCopyWith<SDUIComponent> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SDUIComponentCopyWith<$Res> {
  factory $SDUIComponentCopyWith(
          SDUIComponent value, $Res Function(SDUIComponent) then) =
      _$SDUIComponentCopyWithImpl<$Res, SDUIComponent>;
  @useResult
  $Res call(
      {String type,
      String? id,
      Map<String, dynamic>? properties,
      List<SDUIComponent>? children,
      Map<String, dynamic>? actions});
}

/// @nodoc
class _$SDUIComponentCopyWithImpl<$Res, $Val extends SDUIComponent>
    implements $SDUIComponentCopyWith<$Res> {
  _$SDUIComponentCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? id = freezed,
    Object? properties = freezed,
    Object? children = freezed,
    Object? actions = freezed,
  }) {
    return _then(_value.copyWith(
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      id: freezed == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
      properties: freezed == properties
          ? _value.properties
          : properties // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      children: freezed == children
          ? _value.children
          : children // ignore: cast_nullable_to_non_nullable
              as List<SDUIComponent>?,
      actions: freezed == actions
          ? _value.actions
          : actions // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ) as $Val);
  }
}

/// @nodoc
abstract class _$$SDUIComponentImplCopyWith<$Res>
    implements $SDUIComponentCopyWith<$Res> {
  factory _$$SDUIComponentImplCopyWith(
          _$SDUIComponentImpl value, $Res Function(_$SDUIComponentImpl) then) =
      __$$SDUIComponentImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call(
      {String type,
      String? id,
      Map<String, dynamic>? properties,
      List<SDUIComponent>? children,
      Map<String, dynamic>? actions});
}

/// @nodoc
class __$$SDUIComponentImplCopyWithImpl<$Res>
    extends _$SDUIComponentCopyWithImpl<$Res, _$SDUIComponentImpl>
    implements _$$SDUIComponentImplCopyWith<$Res> {
  __$$SDUIComponentImplCopyWithImpl(
      _$SDUIComponentImpl _value, $Res Function(_$SDUIComponentImpl) _then)
      : super(_value, _then);

  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? type = null,
    Object? id = freezed,
    Object? properties = freezed,
    Object? children = freezed,
    Object? actions = freezed,
  }) {
    return _then(_$SDUIComponentImpl(
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      id: freezed == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
      properties: freezed == properties
          ? _value._properties
          : properties // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
      children: freezed == children
          ? _value._children
          : children // ignore: cast_nullable_to_non_nullable
              as List<SDUIComponent>?,
      actions: freezed == actions
          ? _value._actions
          : actions // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SDUIComponentImpl implements _SDUIComponent {
  const _$SDUIComponentImpl(
      {required this.type,
      this.id,
      final Map<String, dynamic>? properties,
      final List<SDUIComponent>? children,
      final Map<String, dynamic>? actions})
      : _properties = properties,
        _children = children,
        _actions = actions;

  factory _$SDUIComponentImpl.fromJson(Map<String, dynamic> json) =>
      _$$SDUIComponentImplFromJson(json);

  @override
  final String type;
// e.g., 'RizikCard', 'RizikBanner', 'RizikList', 'Gap'
  @override
  final String? id;
  final Map<String, dynamic>? _properties;
  @override
  Map<String, dynamic>? get properties {
    final value = _properties;
    if (value == null) return null;
    if (_properties is EqualUnmodifiableMapView) return _properties;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

// Styling, text, colors, sizes
  final List<SDUIComponent>? _children;
// Styling, text, colors, sizes
  @override
  List<SDUIComponent>? get children {
    final value = _children;
    if (value == null) return null;
    if (_children is EqualUnmodifiableListView) return _children;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

// Nested components
  final Map<String, dynamic>? _actions;
// Nested components
  @override
  Map<String, dynamic>? get actions {
    final value = _actions;
    if (value == null) return null;
    if (_actions is EqualUnmodifiableMapView) return _actions;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'SDUIComponent(type: $type, id: $id, properties: $properties, children: $children, actions: $actions)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SDUIComponentImpl &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.id, id) || other.id == id) &&
            const DeepCollectionEquality()
                .equals(other._properties, _properties) &&
            const DeepCollectionEquality().equals(other._children, _children) &&
            const DeepCollectionEquality().equals(other._actions, _actions));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      type,
      id,
      const DeepCollectionEquality().hash(_properties),
      const DeepCollectionEquality().hash(_children),
      const DeepCollectionEquality().hash(_actions));

  @JsonKey(ignore: true)
  @override
  @pragma('vm:prefer-inline')
  _$$SDUIComponentImplCopyWith<_$SDUIComponentImpl> get copyWith =>
      __$$SDUIComponentImplCopyWithImpl<_$SDUIComponentImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SDUIComponentImplToJson(
      this,
    );
  }
}

abstract class _SDUIComponent implements SDUIComponent {
  const factory _SDUIComponent(
      {required final String type,
      final String? id,
      final Map<String, dynamic>? properties,
      final List<SDUIComponent>? children,
      final Map<String, dynamic>? actions}) = _$SDUIComponentImpl;

  factory _SDUIComponent.fromJson(Map<String, dynamic> json) =
      _$SDUIComponentImpl.fromJson;

  @override
  String get type;
  @override // e.g., 'RizikCard', 'RizikBanner', 'RizikList', 'Gap'
  String? get id;
  @override
  Map<String, dynamic>? get properties;
  @override // Styling, text, colors, sizes
  List<SDUIComponent>? get children;
  @override // Nested components
  Map<String, dynamic>? get actions;
  @override
  @JsonKey(ignore: true)
  _$$SDUIComponentImplCopyWith<_$SDUIComponentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
