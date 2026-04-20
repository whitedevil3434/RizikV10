// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'sdui_models.dart';

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
  String get type => throw _privateConstructorUsedError;
  Map<String, dynamic> get props => throw _privateConstructorUsedError;
  List<SDUIComponent> get children => throw _privateConstructorUsedError;
  String? get id => throw _privateConstructorUsedError;

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
      Map<String, dynamic> props,
      List<SDUIComponent> children,
      String? id});
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
    Object? props = null,
    Object? children = null,
    Object? id = freezed,
  }) {
    return _then(_value.copyWith(
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      props: null == props
          ? _value.props
          : props // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      children: null == children
          ? _value.children
          : children // ignore: cast_nullable_to_non_nullable
              as List<SDUIComponent>,
      id: freezed == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
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
      Map<String, dynamic> props,
      List<SDUIComponent> children,
      String? id});
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
    Object? props = null,
    Object? children = null,
    Object? id = freezed,
  }) {
    return _then(_$SDUIComponentImpl(
      type: null == type
          ? _value.type
          : type // ignore: cast_nullable_to_non_nullable
              as String,
      props: null == props
          ? _value._props
          : props // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
      children: null == children
          ? _value._children
          : children // ignore: cast_nullable_to_non_nullable
              as List<SDUIComponent>,
      id: freezed == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String?,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SDUIComponentImpl implements _SDUIComponent {
  const _$SDUIComponentImpl(
      {required this.type,
      final Map<String, dynamic> props = const {},
      final List<SDUIComponent> children = const [],
      this.id})
      : _props = props,
        _children = children;

  factory _$SDUIComponentImpl.fromJson(Map<String, dynamic> json) =>
      _$$SDUIComponentImplFromJson(json);

  @override
  final String type;
  final Map<String, dynamic> _props;
  @override
  @JsonKey()
  Map<String, dynamic> get props {
    if (_props is EqualUnmodifiableMapView) return _props;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_props);
  }

  final List<SDUIComponent> _children;
  @override
  @JsonKey()
  List<SDUIComponent> get children {
    if (_children is EqualUnmodifiableListView) return _children;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_children);
  }

  @override
  final String? id;

  @override
  String toString() {
    return 'SDUIComponent(type: $type, props: $props, children: $children, id: $id)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SDUIComponentImpl &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other._props, _props) &&
            const DeepCollectionEquality().equals(other._children, _children) &&
            (identical(other.id, id) || other.id == id));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(
      runtimeType,
      type,
      const DeepCollectionEquality().hash(_props),
      const DeepCollectionEquality().hash(_children),
      id);

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
      final Map<String, dynamic> props,
      final List<SDUIComponent> children,
      final String? id}) = _$SDUIComponentImpl;

  factory _SDUIComponent.fromJson(Map<String, dynamic> json) =
      _$SDUIComponentImpl.fromJson;

  @override
  String get type;
  @override
  Map<String, dynamic> get props;
  @override
  List<SDUIComponent> get children;
  @override
  String? get id;
  @override
  @JsonKey(ignore: true)
  _$$SDUIComponentImplCopyWith<_$SDUIComponentImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SDUIScreen _$SDUIScreenFromJson(Map<String, dynamic> json) {
  return _SDUIScreen.fromJson(json);
}

/// @nodoc
mixin _$SDUIScreen {
  String get id => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  SDUIComponent get root => throw _privateConstructorUsedError;
  Map<String, dynamic> get metadata => throw _privateConstructorUsedError;

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
      {String id,
      String title,
      SDUIComponent root,
      Map<String, dynamic> metadata});

  $SDUIComponentCopyWith<$Res> get root;
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
    Object? id = null,
    Object? title = null,
    Object? root = null,
    Object? metadata = null,
  }) {
    return _then(_value.copyWith(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      root: null == root
          ? _value.root
          : root // ignore: cast_nullable_to_non_nullable
              as SDUIComponent,
      metadata: null == metadata
          ? _value.metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
    ) as $Val);
  }

  @override
  @pragma('vm:prefer-inline')
  $SDUIComponentCopyWith<$Res> get root {
    return $SDUIComponentCopyWith<$Res>(_value.root, (value) {
      return _then(_value.copyWith(root: value) as $Val);
    });
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
      {String id,
      String title,
      SDUIComponent root,
      Map<String, dynamic> metadata});

  @override
  $SDUIComponentCopyWith<$Res> get root;
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
    Object? id = null,
    Object? title = null,
    Object? root = null,
    Object? metadata = null,
  }) {
    return _then(_$SDUIScreenImpl(
      id: null == id
          ? _value.id
          : id // ignore: cast_nullable_to_non_nullable
              as String,
      title: null == title
          ? _value.title
          : title // ignore: cast_nullable_to_non_nullable
              as String,
      root: null == root
          ? _value.root
          : root // ignore: cast_nullable_to_non_nullable
              as SDUIComponent,
      metadata: null == metadata
          ? _value._metadata
          : metadata // ignore: cast_nullable_to_non_nullable
              as Map<String, dynamic>,
    ));
  }
}

/// @nodoc
@JsonSerializable()
class _$SDUIScreenImpl implements _SDUIScreen {
  const _$SDUIScreenImpl(
      {required this.id,
      required this.title,
      required this.root,
      final Map<String, dynamic> metadata = const {}})
      : _metadata = metadata;

  factory _$SDUIScreenImpl.fromJson(Map<String, dynamic> json) =>
      _$$SDUIScreenImplFromJson(json);

  @override
  final String id;
  @override
  final String title;
  @override
  final SDUIComponent root;
  final Map<String, dynamic> _metadata;
  @override
  @JsonKey()
  Map<String, dynamic> get metadata {
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(_metadata);
  }

  @override
  String toString() {
    return 'SDUIScreen(id: $id, title: $title, root: $root, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SDUIScreenImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.root, root) || other.root == root) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(ignore: true)
  @override
  int get hashCode => Object.hash(runtimeType, id, title, root,
      const DeepCollectionEquality().hash(_metadata));

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
      {required final String id,
      required final String title,
      required final SDUIComponent root,
      final Map<String, dynamic> metadata}) = _$SDUIScreenImpl;

  factory _SDUIScreen.fromJson(Map<String, dynamic> json) =
      _$SDUIScreenImpl.fromJson;

  @override
  String get id;
  @override
  String get title;
  @override
  SDUIComponent get root;
  @override
  Map<String, dynamic> get metadata;
  @override
  @JsonKey(ignore: true)
  _$$SDUIScreenImplCopyWith<_$SDUIScreenImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
