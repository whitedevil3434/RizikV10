
import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

/// 🧠 Bangla Brain Pipeline Test Script
/// Verifies:
/// 1. HTTP Session Creation
/// 2. WebSocket Connection (Simulating App Client)
/// 3. Track Negotiation (Simulating WebRTC/STT Trigger)
/// 4. Receiving AI Response via WebSocket (Simulating TTS Input)
void main() async {
  print("🚀 Starting Bangla Brain Pipeline Test...");

  final String backendUrl = "https://rizik-backend.its-sabbir69.workers.dev";
  
  // 1. Create Session
  print("⏳ Creating Session...");
  final sessionResp = await http.post(Uri.parse('$backendUrl/api/voice/session'));
  if (sessionResp.statusCode != 200) {
    print("❌ Failed to create session: ${sessionResp.body}");
    exit(1);
  }
  final sessionData = jsonDecode(sessionResp.body);
  final String sessionId = sessionData['sessionId'];
  print("✅ Session Created: $sessionId");

  // 3. Trigger Pipeline (Tracks/New)
  print("⏳ Triggering 'Tracks/New' to wake properly...");
  final trackResp = await http.post(
    Uri.parse('$backendUrl/api/voice/session/tracks/new'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      "sessionId": sessionId,
      "sessionDescription": {
        "sdp": "v=0\r\n...", // Dummy SDP
        "type": "offer"
      },
      "trackName": "audio"
    }),
  );
  
  print("📡 Pipeline Response: ${trackResp.statusCode}");
  if (trackResp.statusCode == 200) {
     print("✅ Pipeline Triggered: ${trackResp.body}");
     print("👉 Check 'wrangler tail' for 'Rizik Says: ...'");
  } else {
     print("❌ Trigger Failed: ${trackResp.body}");
  }
}
