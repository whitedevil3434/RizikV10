// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'sdui_screen.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SDUIScreenImpl _$$SDUIScreenImplFromJson(Map<String, dynamic> json) =>
    _$SDUIScreenImpl(
      screenId: json['screenId'] as String,
      title: json['title'] as String,
      showAppBar: json['showAppBar'] as bool? ?? false,
      backgroundColor: json['backgroundColor'] as String?,
      body: (json['body'] as List<dynamic>)
          .map((e) => SDUIComponent.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$$SDUIScreenImplToJson(_$SDUIScreenImpl instance) =>
    <String, dynamic>{
      'screenId': instance.screenId,
      'title': instance.title,
      'showAppBar': instance.showAppBar,
      'backgroundColor': instance.backgroundColor,
      'body': instance.body,
    };
