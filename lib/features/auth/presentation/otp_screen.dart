import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rizik_v4/features/auth/logic/auth_controller.dart';
import 'package:rizik_v4/core/theme/ui_tokens.dart';

class OtpScreen extends ConsumerStatefulWidget {
  const OtpScreen({super.key});

  @override
  ConsumerState<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends ConsumerState<OtpScreen> {
  final TextEditingController _otpController = TextEditingController();
  String? _errorText;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('OTP Verification')),
      body: Padding(
        padding: const EdgeInsets.all(UiTokens.pagePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (auth.pendingPhone == null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  borderRadius: UiTokens.cardBorderRadius,
                  border: Border.all(color: UiTokens.borderColor(context)),
                ),
                child: const Text(
                    'No pending login found. Go back and request OTP again.'),
              ),
            Text(
              'Code sent to ${auth.pendingPhone ?? 'your number'}',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              onChanged: (_) => setState(() => _errorText = null),
              decoration: InputDecoration(
                labelText: '6-digit OTP',
                hintText: '123456',
                errorText: _errorText,
              ),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {
                final otp = _otpController.text.trim();
                if (otp.length != 6) {
                  setState(() => _errorText = 'OTP must be exactly 6 digits');
                  return;
                }
                if (auth.pendingPhone == null) {
                  setState(() =>
                      _errorText = 'No pending phone. Request OTP first.');
                  return;
                }
                ref.read(authProvider).completeLogin();
                context.go('/seeker');
              },
              child: const Text('Verify and Continue'),
            ),
            TextButton(
              onPressed: () => context.go('/auth'),
              child: const Text('Back to Login'),
            ),
          ],
        ),
      ),
    );
  }
}
