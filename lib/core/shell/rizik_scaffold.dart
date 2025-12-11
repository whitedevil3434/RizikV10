import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/state/user_role_state.dart';
import 'package:rizik_v4/core/theme/morph_engine.dart';
import 'package:rizik_v4/core/sdui/sdui_screen.dart';
import 'package:rizik_v4/shared/widgets/headers/rizik_sliver_appbar.dart';
import 'package:rizik_v4/shared/widgets/navigation/rizik_bottom_nav.dart';
import 'package:rizik_v4/core/ai/presentation/mojo_floating_widget.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/dictation_overlay.dart';

class RizikScaffold extends ConsumerStatefulWidget {
  final String initialRole;
  const RizikScaffold({super.key, this.initialRole = 'seeker'});

  @override
  ConsumerState<RizikScaffold> createState() => _RizikScaffoldState();
}

class _RizikScaffoldState extends ConsumerState<RizikScaffold> {
  int _selectedIndex = 0;

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

  @override
  Widget build(BuildContext context) {
    final morph = ref.watch(morphEngineProvider);
    final role = ref.watch(userRoleProvider);

    return Scaffold(
      extendBody: true,
      appBar: const RizikSliverAppBar(),
      body: Stack(
        children: [
          // 1. Dynamic Background
          _buildDynamicBackground(morph),

          // 2. Body Content
          SafeArea(
            bottom: false,
            child: _buildBody(role.name),
          ),
          
          // 3. Dictation Overlay (Global Position)
          // Self-managed positioning (Align + Padding)
          const DictationOverlay(),
        ],
      ),
      bottomNavigationBar: RizikBottomNav(
        selectedIndex: _selectedIndex,
        onIndexChanged: (index) => setState(() => _selectedIndex = index),
      ),
      floatingActionButton: const MojoFloatingWidget(),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
    );
  }

  Widget _buildDynamicBackground(MorphEngine morph) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeInOut,
      color: morph.backgroundColor,
      width: double.infinity,
      height: double.infinity,
    );
  }

  Widget _buildBody(String roleName) {
    // Switch body based on index
    switch (_selectedIndex) {
      case 0:
        return SDUIScreen(role: roleName, screenId: 'home'); 
      case 1:
        return SDUIScreen(role: roleName, screenId: 'bazar');
      case 2:
        return const SizedBox(); // Placeholder for Mojo (center)
      case 3:
        return SDUIScreen(role: roleName, screenId: 'orders');
      case 4:
        return SDUIScreen(role: roleName, screenId: 'profile');
      default:
        return const SizedBox();
    }
  }
}
