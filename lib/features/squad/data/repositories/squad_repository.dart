import 'dart:convert';
import 'package:http/http.dart' as http;
import '../../../../data/models/squad.dart';

class SquadRepository {
  final String baseUrl;

  SquadRepository({this.baseUrl = 'http://127.0.0.1:8787'});

  Future<bool> updateCapacityStatus(String squadId, CapacityStatus status) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/squad/$squadId/capacity'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': status.key}),
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        throw Exception('Failed to update capacity: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error updating capacity: $e');
    }
  }

  Future<CapacityStatus> getCapacityStatus(String squadId) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/api/squad/$squadId/capacity'),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final statusStr = data['status'] as String?;
        return CapacityStatus.values.firstWhere(
          (e) => e.key == statusStr,
          orElse: () => CapacityStatus.open,
        );
      } else {
        throw Exception('Failed to get capacity: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error getting capacity: $e');
    }
  }

  Future<String> sendVoiceCommand(String squadId, String userId, String message) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/ai/voice-chat'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'message': message,
          'squadId': squadId,
          'userId': userId,
          'history': []
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return data['ai_response'] ?? data['response'] ?? 'Command processed';
      } else {
        throw Exception('Failed to process voice command: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error sending voice command: $e');
    }
  }
}
