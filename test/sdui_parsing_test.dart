import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:rizik_v4/features/sdui/domain/sdui_models.dart';

void main() {
  group('SDUI Model Parsing', () {
    test('Should parse a complex column with children correctly', () {
      const jsonStr = '''
      {
        "type": "column",
        "props": {"padding": 16},
        "children": [
          {
            "type": "text",
            "props": {"text": "Hello SDUI"}
          }
        ]
      }
      ''';
      
      final json = jsonDecode(jsonStr);
      final component = SDUIComponent.fromJson(json);
      
      expect(component.type, equals('column'));
      expect(component.props['padding'], equals(16));
      expect(component.children.length, equals(1));
      expect(component.children.first.type, equals('text'));
      expect(component.children.first.props['text'], equals('Hello SDUI'));
    });

    test('Should parse a full SDUIScreen', () {
      const jsonStr = '''
      {
        "id": "home_sd",
        "title": "Test Screen",
        "root": {
          "type": "card",
          "props": {"padding": 20},
          "children": []
        }
      }
      ''';
      
      final json = jsonDecode(jsonStr);
      final screen = SDUIScreen.fromJson(json);
      
      expect(screen.id, equals('home_sd'));
      expect(screen.title, equals('Test Screen'));
      expect(screen.root.type, equals('card'));
    });
  });
}
