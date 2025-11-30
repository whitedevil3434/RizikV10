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
    // WakelockPlus.disable(); // Assuming WakelockPlus is imported and needed
    try {
      _meeting.removeMeetingRoomEventListener(this);
      _meeting.removeParticipantsEventListener(this); // Keep this line as it was in the original code
      _meeting.cleanAllNativeListeners();
    } catch (e) {
      print('Error cleaning up meeting listeners: $e');
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
      // 1. Create meeting via backend
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
      print('Meeting created: $_meetingId');

      // 2. Add participant to meeting
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
      print('Participant Data: $participantData');
      // The backend returns 'authToken'
      _authToken = participantData['authToken'] ?? participantData['token']; 
      
      if (_authToken == null) {
        throw Exception('Auth token is null. Response: ${addParticipantResponse.body}');
      }
      print('Participant added, auth token: $_authToken');

      // 3. Initialize RealtimeKit with auth token
      final meetingInfo = RtkMeetingInfo(
        authToken: _authToken!,
        baseDomain: 'realtime.cloudflare.com',
        enableAudio: true,
        enableVideo: true,
      );

      print('Adding meeting room event listener...');
      _meeting.addMeetingRoomEventListener(this);
      
      print('Calling _meeting.init()...');
      try {
        _meeting.init(meetingInfo);
        print('_meeting.init() called successfully');
      } catch (e) {
        print('Exception calling _meeting.init(): $e');
        throw e;
      }

      // Safety timeout
      Future.delayed(const Duration(seconds: 30), () {
        if (mounted && _isInitializing && !_inCall) {
          print('Initialization timed out!');
          setState(() {
            _errorMessage = 'Initialization timed out. Please try again.';
            _isInitializing = false;
          });
        }
      });

    } catch (e) {
      print('Error creating meeting: $e');
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

  // RealtimeKit Event Listeners

  @override
  void onMeetingInitStarted() {
    print('Meeting init started');
  }

  @override
  void onMeetingInitCompleted() {
    print('Meeting init completed, joining room...');
    
    // Join the room after init completes
    _meeting.joinRoom(
      onSuccess: () {
        print('Successfully joined room');
        if (mounted) {
          setState(() {
            _inCall = true;
            _isInitializing = false;
          });
        }
      },
      onError: (error) {
        print('Failed to join room: $error');
        if (mounted) {
          setState(() {
            _errorMessage = 'Failed to join: ${error.toString()}';
            _isInitializing = false;
          });
        }
      },
    );
  }

  @override
  void onMeetingInitFailed(MeetingError error) {
    print('Meeting init failed: ${error.toString()}');
    if (mounted) {
      setState(() {
        _errorMessage = 'Init failed: ${error.toString()}';
        _isInitializing = false;
      });
    }
  }

  @override
  void onMeetingRoomJoinStarted() {
    print('Joining room...');
  }

  @override
  void onMeetingRoomJoined() {
    print('Room joined successfully!');
    if (mounted) {
      setState(() {
        _inCall = true;
        _isInitializing = false;
      });
    }
  }

  @override
  void onMeetingRoomJoinFailed(MeetingError error) {
    print('Room join failed: ${error.toString()}');
    if (mounted) {
      setState(() {
        _errorMessage = 'Join failed: ${error.toString()}';
        _isInitializing = false;
      });
    }
  }

  @override
  void onMeetingRoomLeaveStarted() {
    print('Leaving room...');
  }

  @override
  void onMeetingRoomLeaveCompleted() {
    print('Left room');
    _meeting.removeMeetingRoomEventListener(this);
    _meeting.cleanAllNativeListeners();
    if (mounted) {
      setState(() {
        _inCall = false;
      });
    }
  }

  // RtkParticipantsEventListener methods
  @override
  void onParticipantJoin(RtkRemoteParticipant participant) {
    print('Participant joined: ${participant.name}');
    if (mounted) {
      setState(() {
        _participants.add(participant);
      });
    }
  }

  @override
  void onParticipantLeave(RtkRemoteParticipant participant) {
    print('Participant left: ${participant.name}');
    if (mounted) {
      setState(() {
        _participants.removeWhere((p) => p.id == participant.id);
      });
    }
  }

  @override
  void onActiveParticipantsChanged(List<RtkRemoteParticipant> active) {
    print('Active participants changed: ${active.length}');
  }

  @override
  void onActiveSpeakerChanged(RtkRemoteParticipant? participant) {
    print('Active speaker changed: ${participant?.name}');
  }

  @override
  void onAudioUpdate(RtkRemoteParticipant participant, bool isEnabled) {
    print('Audio update for ${participant.name}: $isEnabled');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${participant.name} audio ${isEnabled ? "enabled" : "disabled"}'),
          duration: const Duration(seconds: 1),
        ),
      );
    }
  }

  @override
  void onVideoUpdate(RtkRemoteParticipant participant, bool isEnabled) {
    print('Video update for ${participant.name}: $isEnabled');
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${participant.name} video ${isEnabled ? "enabled" : "disabled"}'),
          duration: const Duration(seconds: 1),
        ),
      );
      setState(() {
        final index = _participants.indexWhere((p) => p.id == participant.id);
        if (index != -1) {
          _participants[index] = participant;
        }
      });
    }
  }
  
  @override
  void onScreenShareUpdate(RtkRemoteParticipant participant, bool isEnabled) {
    print('Screen share update for ${participant.name}: $isEnabled');
  }
  
  @override
  void onUpdate(RtkParticipants participants) {
      // Full list update if needed
      print('Participants list updated');
  }

  @override
  void onParticipantPinned(RtkRemoteParticipant participant) {
    print('Participant pinned: ${participant.name}');
  }

  @override
  void onParticipantUnpinned(RtkRemoteParticipant participant) {
    print('Participant unpinned: ${participant.name}');
  }

  @override
  void onNewBroadcastMessage(String type, Map<String, dynamic> payload) {
    print('New broadcast message: $type, payload: $payload');
  }

  // Additional required interface methods
  @override
  void onMeetingEnded() {
    print('Meeting ended');
    if (mounted) {
      setState(() {
        _inCall = false;
      });
    }
  }

  @override
  void onMeetingRoomJoinCompleted() {
    print('Meeting room join completed');
    if (mounted) {
      setState(() {
        _inCall = true;
        _isInitializing = false;
      });
    }
  }

  @override
  void onActiveTabUpdate(dynamic activeTab) {
    print('Active tab update: $activeTab');
  }

  @override
  void onSocketConnectionUpdate(dynamic state) {
    print('Socket connection update: $state');
  }

  void _leaveCall() {
    _meeting.leaveRoom(
      onSuccess: () {
        print('Leave room successful');
      },
      onError: (error) {
        print('Leave room error: $error');
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Rizik Connect (RealtimeKit)'),
        backgroundColor: Colors.black,
      ),
      body: Center(
        child: _isInitializing
            ? Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  CircularProgressIndicator(color: Colors.white),
                  SizedBox(height: 16),
                  Text(
                    'Initializing call...',
                    style: TextStyle(color: Colors.white),
                  ),
                ],
              )
            : _inCall
                ? Stack(
                    children: [
                      // Remote Participants Grid
                      if (_participants.isEmpty)
                        const Center(
                          child: Text(
                            'Waiting for others to join...',
                            style: TextStyle(color: Colors.white54),
                          ),
                        )
                      else
                        GridView.builder(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 1.0,
                          ),
                          itemCount: _participants.length,
                          itemBuilder: (context, index) {
                            final participant = _participants[index];
                            return Container(
                              margin: const EdgeInsets.all(4),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.white24),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Stack(
                                children: [
                                  // Remote Video View
                                  VideoView(
                                    meetingParticipant: participant,
                                  ),
                                  // Name Label
                                  Positioned(
                                    bottom: 8,
                                    left: 8,
                                    child: Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      color: Colors.black54,
                                      child: Text(
                                        participant.name ?? 'Unknown',
                                        style: const TextStyle(color: Colors.white),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),

                      // Local Video View (PiP)
                      Positioned(
                        right: 16,
                        bottom: 100,
                        width: 120,
                        height: 160,
                        child: Container(
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white),
                            borderRadius: BorderRadius.circular(8),
                            color: Colors.black,
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: const VideoView(
                              isSelfParticipant: true,
                            ),
                          ),
                        ),
                      ),

                      // Controls
                      Positioned(
                        bottom: 32,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            ElevatedButton(
                              onPressed: _leaveCall,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.red,
                                shape: const CircleBorder(),
                                padding: const EdgeInsets.all(24),
                              ),
                              child: const Icon(Icons.call_end, color: Colors.white),
                            ),
                          ],
                        ),
                      ),
                    ],
                  )
                : Column(
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
                      ElevatedButton(
                        onPressed: _createAndJoinMeeting,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 32,
                            vertical: 16,
                          ),
                        ),
                        child: const Text(
                          'Start Call',
                          style: TextStyle(fontSize: 18),
                        ),
                      ),
                    ],
                  ),
      ),
    );
  }
}
