// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sdui_models.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SDUIComponentImpl _$$SDUIComponentImplFromJson(Map<String, dynamic> json) =>
    _$SDUIComponentImpl(
      type: json['type'] as String,
      props: json['props'] as Map<String, dynamic>? ?? const {},
      children: (json['children'] as List<dynamic>?)
              ?.map((e) => SDUIComponent.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      id: json['id'] as String?,
    );

Map<String, dynamic> _$$SDUIComponentImplToJson(_$SDUIComponentImpl instance) =>
    <String, dynamic>{
      'type': instance.type,
      'props': instance.props,
      'children': instance.children,
      'id': instance.id,
    };

_$SDUIScreenImpl _$$SDUIScreenImplFromJson(Map<String, dynamic> json) =>
    _$SDUIScreenImpl(
      id: json['id'] as String,
      title: json['title'] as String,
      root: SDUIComponent.fromJson(json['root'] as Map<String, dynamic>),
      metadata: json['metadata'] as Map<String, dynamic>? ?? const {},
    );

Map<String, dynamic> _$$SDUIScreenImplToJson(_$SDUIScreenImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'title': instance.title,
      'root': instance.root,
      'metadata': instance.metadata,
    };
