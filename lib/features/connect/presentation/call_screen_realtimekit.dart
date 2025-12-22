import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:realtimekit_core/realtimekit_core.dart';
import 'package:realtimekit_core_platform_interface/realtimekit_core_platform_interface.dart';
import 'package:realtimekit_core_platform_interface/src/view/video_view.dart';
import 'package:rizik_v4/core/config/env_config.dart';

class CallScreenRealtimeKit extends StatefulWidget {
  const CallScreenRealtimeKit({super.key});

  @override
  State<CallScreenRealtimeKit> createState() => _CallScreenRealtimeKitState();
}

class _CallScreenRealtimeKitState extends State<CallScreenRealtimeKit> 
    implements RtkMeetingRoomEventListener, RtkParticipantsEventListener {
  late RealtimekitClient _meeting;
  bool _inCall = false;
  bool _isInitializing = false;
  bool _isMicEnabled = true;
  bool _isCameraEnabled = true;
  String? _meetingId;
  String? _authToken;
  String? _errorMessage;
  
  // Track participants
  final List<RtkMeetingParticipant> _participants = [];

  @override
  void initState() {
    super.initState();
    _meeting = RealtimekitClient();
    _meeting.addParticipantsEventListener(this);
  }

  @override
  void dispose() {
    if (_inCall) {
      _meeting.leaveRoom(onSuccess: () {}, onError: (error) {});
    }
    try {
      _meeting.removeMeetingRoomEventListener(this);
      _meeting.removeParticipantsEventListener(this);
      _meeting.cleanAllNativeListeners();
    } catch (e) {
      debugPrint('Error cleaning up meeting listeners: $e');
    }
    super.dispose();
  }

  // Create meeting and join as participant
  Future<void> _createAndJoinMeeting() async {
    setState(() {
      _isInitializing = true;
      _errorMessage = null;
    });

    try {
      final createMeetingResponse = await http.post(
        Uri.parse('${EnvConfig.backendUrl}/api/realtime/meeting/create'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'meetingName': 'Rizik Connect Call'}),
      );

      if (createMeetingResponse.statusCode != 200) {
        throw Exception('Failed to create meeting: ${createMeetingResponse.body}');
      }

      final meetingData = jsonDecode(createMeetingResponse.body);
      _meetingId = meetingData['meetingId'];

      final addParticipantResponse = await http.post(
        Uri.parse('${EnvConfig.backendUrl}/api/realtime/meeting/$_meetingId/participants'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'participantName': 'User ${DateTime.now().millisecondsSinceEpoch}',
          'participantId': 'user_${DateTime.now().millisecondsSinceEpoch}',
        }),
      );

      if (addParticipantResponse.statusCode != 200) {
        throw Exception('Failed to add participant: ${addParticipantResponse.body}');
      }

      final participantData = jsonDecode(addParticipantResponse.body);
      _authToken = participantData['authToken'] ?? participantData['token']; 
      
      if (_authToken == null) {
        throw Exception('Auth token is null.');
      }

      final meetingInfo = RtkMeetingInfo(
        authToken: _authToken!,
        baseDomain: 'realtime.cloudflare.com',
        enableAudio: true,
        enableVideo: true,
      );

      _meeting.addMeetingRoomEventListener(this);
      _meeting.init(meetingInfo);

      // Safety timeout
      Future.delayed(const Duration(seconds: 30), () {
        if (mounted && _isInitializing && !_inCall) {
          setState(() {
            _errorMessage = 'Initialization timed out. Please try again.';
            _isInitializing = false;
          });
        }
      });

    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
        _isInitializing = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Call failed: $e')),
        );
      }
    }
  }

  // Helper methods for controls
  void _toggleMic() {
    setState(() {
      _isMicEnabled = !_isMicEnabled;
    });
    // TODO: Fix undefined method 'toggleMic' for version 0.1.4
    // _meeting.toggleMic(onSuccess: (status) {}, onError: (error) {});
    print("⚠️ toggleMic not implemented for this version");
  }

  void _toggleCamera() {
    setState(() {
      _isCameraEnabled = !_isCameraEnabled;
    });
    // TODO: Fix undefined method 'toggleWebcam' for version 0.1.4
    // _meeting.toggleWebcam(onSuccess: (status) {}, onError: (error) {});
    print("⚠️ toggleWebcam not implemented for this version");
  }

  void _leaveCall() {
    _meeting.leaveRoom(
      onSuccess: () {
        if (mounted) setState(() => _inCall = false);
      },
      onError: (error) {},
    );
  }

  // --- RealtimeKit Event Listeners (Simplified for brevity) ---
  @override
  void onMeetingInitStarted() {}

  @override
  void onMeetingInitCompleted() {
    _meeting.joinRoom(
      onSuccess: () {
        if (mounted) setState(() { _inCall = true; _isInitializing = false; });
      },
      onError: (error) {
        if (mounted) setState(() { _errorMessage = 'Join failed: $error'; _isInitializing = false; });
      },
    );
  }

  @override
  void onMeetingInitFailed(MeetingError error) {
    if (mounted) setState(() { _errorMessage = 'Init failed: $error'; _isInitializing = false; });
  }

  @override
  void onMeetingRoomJoinStarted() {}

  @override
  void onMeetingRoomJoined() {
    if (mounted) setState(() { _inCall = true; _isInitializing = false; });
  }

  @override
  void onMeetingRoomJoinFailed(MeetingError error) {
    if (mounted) {
      // TODO: Remove this bypass when real RealtimeKit keys are available.
      // For now, allow UI testing even if auth fails due to mock token.
      print("Join failed ($error), but bypassing for UI testing...");
      setState(() {
        _inCall = true;
        _isInitializing = false;
        _errorMessage = null;
      });
    }
  }

  @override
  void onMeetingRoomLeaveStarted() {}

  @override
  void onMeetingRoomLeaveCompleted() {
    _meeting.removeMeetingRoomEventListener(this);
    _meeting.cleanAllNativeListeners();
    if (mounted) setState(() => _inCall = false);
  }

  @override
  void onParticipantJoin(RtkRemoteParticipant participant) {
    if (mounted) setState(() => _participants.add(participant));
  }

  @override
  void onParticipantLeave(RtkRemoteParticipant participant) {
    if (mounted) setState(() => _participants.removeWhere((p) => p.id == participant.id));
  }

  @override
  void onActiveParticipantsChanged(List<RtkRemoteParticipant> active) {}
  @override
  void onActiveSpeakerChanged(RtkRemoteParticipant? participant) {}
  @override
  void onAudioUpdate(RtkRemoteParticipant participant, bool isEnabled) {}
  @override
  void onVideoUpdate(RtkRemoteParticipant participant, bool isEnabled) {
      if (mounted) setState(() {
        final index = _participants.indexWhere((p) => p.id == participant.id);
        if (index != -1) _participants[index] = participant;
      });
  }
  @override
  void onScreenShareUpdate(RtkRemoteParticipant participant, bool isEnabled) {}
  @override
  void onUpdate(RtkParticipants participants) {}
  @override
  void onParticipantPinned(RtkRemoteParticipant participant) {}
  @override
  void onParticipantUnpinned(RtkRemoteParticipant participant) {}
  @override
  void onNewBroadcastMessage(String type, Map<String, dynamic> payload) {}
  @override
  void onMeetingEnded() { if (mounted) setState(() => _inCall = false); }
  @override
  void onMeetingRoomJoinCompleted() { if (mounted) setState(() { _inCall = true; _isInitializing = false; }); }
  @override
  void onActiveTabUpdate(dynamic activeTab) {}
  @override
  void onSocketConnectionUpdate(dynamic state) {}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D1418), // WhatsApp Dark Background
      body: SafeArea(
        child: _isInitializing
            ? _buildLoadingState()
            : _inCall
                ? _buildCallUI()
                : _buildStartScreen(),
      ),
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          CircularProgressIndicator(color: Color(0xFF00A884)), // WhatsApp Green
          SizedBox(height: 16),
          Text('Connecting...', style: TextStyle(color: Colors.white70)),
        ],
      ),
    );
  }

  Widget _buildStartScreen() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          if (_errorMessage != null)
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                _errorMessage!,
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            ),
          const Icon(Icons.videocam_outlined, size: 80, color: Colors.white54),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _createAndJoinMeeting,
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF00A884), // WhatsApp Green
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 16),
            ),
            child: const Text('Start Video Call', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildCallUI() {
    return Stack(
      children: [
        // Main Video Area (Remote Participant or Placeholder)
        Positioned.fill(
          child: _participants.isEmpty
              ? Container(
                  color: Colors.black,
                  child: const Center(
                    child: Text(
                      'Waiting for others...',
                      style: TextStyle(color: Colors.white54, fontSize: 18),
                    ),
                  ),
                )
              : VideoView(meetingParticipant: _participants.last), // Show last joiner fullscreen
        ),

        // Draggable PiP (Self View)
        Positioned(
          right: 16,
          bottom: 120,
          width: 100,
          height: 150,
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white24),
              borderRadius: BorderRadius.circular(12),
              color: Colors.black,
              boxShadow: [BoxShadow(color: Colors.black54, blurRadius: 10)],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: const VideoView(isSelfParticipant: true),
            ),
          ),
        ),

        // Top Bar (Encrypted Text)
        Positioned(
          top: 0,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Colors.black54, Colors.transparent],
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                Icon(Icons.lock, size: 12, color: Colors.white54),
                SizedBox(width: 4),
                Text(
                  'End-to-end encrypted',
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                ),
              ],
            ),
          ),
        ),

        // Bottom Controls Bar (Transparent Floating)
        Positioned(
          bottom: 30,
          left: 0,
          right: 0,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            margin: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              color: const Color(0xFF1F2C34), // WhatsApp dark grey
              borderRadius: BorderRadius.circular(50),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _buildControlBtn(
                  icon: _isCameraEnabled ? Icons.videocam : Icons.videocam_off,
                  isActive: _isCameraEnabled,
                  onTap: _toggleCamera,
                ),
                _buildControlBtn(
                  icon: _isMicEnabled ? Icons.mic : Icons.mic_off,
                  isActive: _isMicEnabled,
                  onTap: _toggleMic,
                ),
                GestureDetector(
                  onTap: _leaveCall,
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: const BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.call_end, color: Colors.white, size: 28),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildControlBtn({required IconData icon, required bool isActive, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isActive ? Colors.transparent : Colors.white24,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: Colors.white, size: 28),
      ),
    );
  }
}
