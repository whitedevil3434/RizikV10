import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/rizik_mojo.dart';
import 'package:rizik_v4/shared/widgets/navigation/role_switcher_orb.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'dart:convert';

import 'package:rizik_v4/core/sdui/widgets/visuals/dictation_overlay.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';
import 'package:rizik_v4/core/wrappers/sensor_wrapper.dart';
import 'package:rizik_v4/core/state/voice_input_provider.dart';
import 'package:rizik_v4/features/squad/presentation/providers/squad_dashboard_provider.dart';

class MojoFloatingWidget extends ConsumerStatefulWidget {
  const MojoFloatingWidget({super.key});

  @override
  ConsumerState<MojoFloatingWidget> createState() => _MojoFloatingWidgetState();
}

class _MojoFloatingWidgetState extends ConsumerState<MojoFloatingWidget> {
  late SensorWrapper _sensorWrapper;
  WebSocketChannel? _channel;

  @override
  void initState() {
    super.initState();
    _sensorWrapper = SensorWrapper(
      onProximityChanged: (isNear) {
        // If phone is near ear (or lifted up), activate AI
        final isAiActive = ref.read(mojoProvider).isAiActive;
        if (isNear && !isAiActive) {
          ref.read(mojoProvider).setAiActive(true);
          // Auto-start listening logic
          _startListening();
        } else if (!isNear && isAiActive) {
          // Optional: Auto-stop or keep active? 
          // For now, let's keep it active until manually stopped or timeout
          // ref.read(mojoProvider).setAiActive(false);
        }
      },
    );
    _sensorWrapper.startListening();
    _connectToSquadCore();
  }

  void _connectToSquadCore() {
    // In a real app, get squadId from user profile provider
    const squadId = "default_squad_id"; 
    // Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
    // Replace with your actual Cloudflare Worker URL in production
    final wsUrl = Uri.parse('ws://localhost:8787/api/squad/$squadId/websocket');
    
    try {
      _channel = WebSocketChannel.connect(wsUrl);
      _channel!.stream.listen((message) {
        final data = jsonDecode(message);
        if (data['type'] == 'MEMBER_JOINED') {
          _showJoinSnackbar(data['data']['name']);
        } else if (data['type'] == 'UI_UPDATE') {
          // Update the Global Dashboard Provider
          // This triggers the "Visual Brain" update on the dashboard screen
          ref.read(squadDashboardUiProvider.notifier).updateUi(data['data']);
          print("Mojo: UI Updated via WebSocket");
        }
      }, onError: (error) {
        print("WebSocket Error: $error");
      });
    } catch (e) {
      print("WebSocket Connection Failed: $e");
    }
  }

  void _showJoinSnackbar(String memberName) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.person_add, color: Colors.white),
            const SizedBox(width: 8),
            Text('$memberName just joined the Squad!'),
          ],
        ),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  @override
  void dispose() {
    _sensorWrapper.stopListening();
    _channel?.sink.close();
    super.dispose();
  }

  Future<void> _startListening() async {
    ref.read(mojoProvider).setMojoState(MojoState.listening);
    ref.read(mojoProvider).clearText(); // Clear previous text
    await ref.read(voiceInputServiceProvider).startListening(onResult: (path) {});
  }

  Future<void> _stopAndProcess() async {
    ref.read(mojoProvider).setRecognizedText("Thinking...");
    
    final voiceService = ref.read(voiceInputServiceProvider);
    final path = await voiceService.stopListening();
    
    if (path != null) {
      final result = await voiceService.processAudio(path);
      if (result != null) {
        // Update Provider with Transcript and Response
        ref.read(mojoProvider).setRecognizedText(result['transcript']!);
        ref.read(mojoProvider).setAiResponseText(result['response']!);
        
        // Set state to speaking to trigger typewriter effect
        ref.read(mojoProvider).setMojoState(MojoState.speaking);
        
        Future.delayed(const Duration(seconds: 5), () {
          if (mounted) {
             ref.read(mojoProvider).setMojoState(MojoState.idle);
          }
        });
      } else {
         ref.read(mojoProvider).setRecognizedText("Sorry, I didn't catch that.");
         ref.read(mojoProvider).setMojoState(MojoState.idle);
      }
    } else {
       ref.read(mojoProvider).setMojoState(MojoState.idle);
    }
  }

  @override
  Widget build(BuildContext context) {
    debugPrint("Building MojoFloatingWidget");
    final mojoState = ref.watch(mojoProvider);
    
    // Always show RizikMojo (Mascot), never the Icon
    return SizedBox(
      width: 72,
      height: 72,
      child: GestureDetector(
        onLongPressStart: (_) async {
          // Tap & Hold -> Start Listening
          debugPrint("Mojo: Long Press Start - Listening");
          ref.read(mojoProvider).setAiActive(true);
          await _startListening();
        },
        onLongPressEnd: (_) async {
          // Release -> Stop & Process
          debugPrint("Mojo: Long Press End - Processing");
          await _stopAndProcess();
          // Note: _stopAndProcess handles setting state to speaking/idle
        },
        child: FloatingActionButton(
          onPressed: () {
            // Single Tap -> Show Role Switcher
            debugPrint("Mojo: Single Tap - Role Switcher");
            RoleSwitcherOrb.show(context);
          },
          backgroundColor: Colors.white,
          elevation: 4,
          shape: const CircleBorder(),
          child: const RizikMojo(), // Always visible
        ),
      ),
    );
  }
}
