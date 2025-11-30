import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthState extends ChangeNotifier {
  bool isAuthenticated = false;
}

final authProvider = ChangeNotifierProvider<AuthState>((ref) {
  return AuthState();
});
