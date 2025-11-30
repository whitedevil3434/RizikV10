import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:lottie/lottie.dart';
import 'package:rizik_v4/core/state/mojo_provider.dart';

class RizikMojo extends StatefulWidget {
  const RizikMojo({super.key});

  @override
  State<RizikMojo> createState() => _RizikMojoState();
}

class _RizikMojoState extends State<RizikMojo> {
  @override
  Widget build(BuildContext context) {
    return Consumer(
      builder: (context, ref, child) {
        final provider = ref.watch(mojoProvider);
        return AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOutBack,
          transform: Matrix4.identity()
            ..scale(provider.state == MojoState.listening ? 1.2 : 1.0),
          transformAlignment: Alignment.center,
          child: SizedBox(
            width: 60,
            height: 60,
            child: _buildLottieAnimation(provider.state),
          ),
        );
      },
    );
  }

  Widget _buildLottieAnimation(MojoState state) {
    String assetPath;
    switch (state) {
      case MojoState.listening:
        assetPath = 'assets/anim/emoji_listening.json';
        break;
      case MojoState.speaking:
        assetPath = 'assets/anim/emoji_speaking.json';
        break;
      case MojoState.idle:
      default:
        assetPath = 'assets/anim/emoji_idle.json';
        break;
    }

    return Lottie.asset(
      assetPath,
      fit: BoxFit.contain,
      errorBuilder: (context, error, stackTrace) {
        // Fallback if Lottie asset is missing
        return Icon(
          state == MojoState.listening
              ? Icons.hearing
              : state == MojoState.speaking
                  ? Icons.record_voice_over
                  : Icons.emoji_emotions,
          size: 40,
          color: Colors.amber,
        );
      },
    );
  }
}
