import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:rizik_v4/features/auth/logic/auth_controller.dart';
import 'package:rizik_v4/core/theme/ui_tokens.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final TextEditingController _phoneController = TextEditingController();
  String? _validationError;

  bool get _isPhoneValid {
    final phone = _phoneController.text.trim();
    final regex = RegExp(r'^01\d{9}$');
    return regex.hasMatch(phone);
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(UiTokens.pagePadding),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 24),
            const Text(
              'Welcome to Rizik',
              style: TextStyle(fontSize: 26, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 8),
            const Text('Enter your phone to continue.'),
            const SizedBox(height: 24),
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              onChanged: (_) => setState(() => _validationError = null),
              decoration: InputDecoration(
                labelText: 'Phone Number',
                hintText: '01XXXXXXXXX',
                errorText: _validationError,
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                if (!_isPhoneValid) {
                  setState(() {
                    _validationError = 'Enter a valid BD number (01XXXXXXXXX)';
                  });
                  return;
                }
                final phone = _phoneController.text.trim();
                ref.read(authProvider).beginLogin(phone);
                context.go('/auth/otp');
              },
              child: const Text('Send OTP'),
            ),
            const SizedBox(height: 16),
            if (auth.pendingPhone != null)
              Text(
                'Pending verification: ${auth.pendingPhone}',
                style: const TextStyle(color: Colors.grey),
              ),
          ],
        ),
      ),
    );
  }
}
