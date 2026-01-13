import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/rizik_mojo.dart';
import 'package:rizik_v4/shared/widgets/navigation/role_switcher_orb.dart';
import 'package:rizik_v4/features/voice/presentation/voice_assistant_palette.dart'; 
import 'package:rizik_v4/core/wrappers/haptic_feedback_wrapper.dart';

class MojoFloatingWidget extends ConsumerWidget {
  const MojoFloatingWidget({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Always show RizikMojo (Mascot)
    return SizedBox(
      width: 80, // Slightly larger touch target
      height: 80,
      child: GestureDetector(
        onLongPress: () {
          // Long Press -> Enter Voice Mode Palette
          HapticFeedbackWrapper().heavy();
          VoiceAssistantPalette.show(context);
        },
        onTap: () {
          // Single Tap -> Show Role Switcher
          debugPrint("Mojo: Single Tap - Role Switcher");
          HapticFeedbackWrapper().light();
          RoleSwitcherOrb.show(context);
        },
        child: const RizikMojo(), 
      ),
    );
  }
}
