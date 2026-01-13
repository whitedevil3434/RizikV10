import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';
import 'package:rizik_v4/core/theme/morph_engine.dart';
import 'package:rizik_v4/core/sdui/sdui_screen.dart';
import 'package:rizik_v4/shared/widgets/headers/rizik_glass_top_bar.dart';
import 'package:rizik_v4/shared/widgets/navigation/rizik_glass_nav.dart';
import 'package:rizik_v4/core/ai/presentation/mojo_floating_widget.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/dictation_overlay.dart';
import 'package:rizik_v4/core/feed_ui/components/cinematic_video_backdrop.dart';
import 'package:rizik_v4/core/feed_ui/components/edge_animations.dart';

/// RizikScaffold - The Living App Shell
/// 
/// Architecture:
/// - Cinematic video background
/// - 4-side edge animations
/// - Glass top bar
/// - Minimalist 2-button navigation (Orders | Mojo | Wallet)
class RizikScaffold extends ConsumerStatefulWidget {
  final String initialRole;
  const RizikScaffold({super.key, this.initialRole = 'seeker'});

  @override
  ConsumerState<RizikScaffold> createState() => _RizikScaffoldState();
}

class _RizikScaffoldState extends ConsumerState<RizikScaffold> {
  // 0 = Orders (left), 1 = Wallet (right)
  // 2 = Home (default, center) - Mojo handles AI interaction
  int _selectedIndex = 2;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
       ref.read(userRoleProvider.notifier).setRoleFromString(widget.initialRole);
    });
  }

  @override
  void didUpdateWidget(RizikScaffold oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialRole != widget.initialRole) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        ref.read(userRoleProvider.notifier).setRoleFromString(widget.initialRole);
      });
    }
  }

  void _onNavIndexChanged(int index) {
    setState(() {
      // Toggle logic: If tapping the already selected tab, return to Home (2)
      // Otherwise, switch to the selected tab
      if (_selectedIndex == index) {
        _selectedIndex = 2; // Go to Home
      } else {
        _selectedIndex = index;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final morph = ref.watch(morphEngineProvider);
    final role = ref.watch(userRoleProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      extendBody: true,
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          // Layer 1: Cinematic Video Background
          _buildCinematicBackground(morph),
          
          // Layer 2: 4-Side Edge Animations
          const EdgeAnimations(),

          // Layer 3: Glass Top Bar
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: RizikGlassTopBar(),
          ),

          // Layer 4: Body Content (with safe area)
          Positioned.fill(
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.only(top: 8), // Below top bar
                child: _buildBody(role.name),
              ),
            ),
          ),
          
          // Layer 5: Dictation Overlay
          const DictationOverlay(),

          // Layer 6: Glass Bottom Navigation
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: SafeArea(
              child: RizikGlassNav(
                selectedIndex: _selectedIndex,
                onIndexChanged: _onNavIndexChanged,
              ),
            ),
          ),

          // Layer 7: Mojo Orb (Center floating)
          Positioned(
            bottom: 50,
            left: 0,
            right: 0,
            child: Center(child: const MojoFloatingWidget()),
          ),
        ],
      ),
    );
  }

  Widget _buildCinematicBackground(MorphEngine morph) {
    // Living UI Engine - Cinematic Video Background
    const String sampleVideoUrl = 
        'https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4';
    
    return CinematicVideoBackdrop(
      videoUrl: sampleVideoUrl,
      looping: true,
      showGlassOverlay: false,
      glassBlur: 5.0,
      glassOpacity: 0.3,
      fallbackWidget: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFF0a0a0f), // Near black
              Color(0xFF1a1a2e), // Dark blue
              Color(0xFF16213e), // Deep navy
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBody(String roleName) {
    // New 2-button layout:
    // 0 = Orders/Earnings (left button)
    // 1 = Wallet/Moneybag (right button)
    // 2 = Home (default)
    switch (_selectedIndex) {
      case 0:
        // Orders - show orders/earnings based on role
        return SDUIScreen(role: roleName, screenId: 'orders');
      case 1:
        // Wallet - show moneybag/wallet
        return SDUIScreen(role: roleName, screenId: 'profile'); // Wallet in profile for now
      case 2:
      default:
        // Default: Home feed
        return SDUIScreen(role: roleName, screenId: 'home');
    }
  }
}

