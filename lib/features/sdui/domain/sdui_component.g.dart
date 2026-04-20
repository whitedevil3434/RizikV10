// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sdui_component.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SDUIComponentImpl _$$SDUIComponentImplFromJson(Map<String, dynamic> json) =>
    _$SDUIComponentImpl(
      type: json['type'] as String,
      id: json['id'] as String?,
      properties: json['properties'] as Map<String, dynamic>?,
      children: (json['children'] as List<dynamic>?)
          ?.map((e) => SDUIComponent.fromJson(e as Map<String, dynamic>))
          .toList(),
      actions: json['actions'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$SDUIComponentImplToJson(_$SDUIComponentImpl instance) =>
    <String, dynamic>{
      'type': instance.type,
      'id': instance.id,
      'properties': instance.properties,
      'children': instance.children,
      'actions': instance.actions,
    };
