import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthState extends ChangeNotifier {
  bool isAuthenticated = false;
  String? pendingPhone;

  void beginLogin(String phone) {
    pendingPhone = phone;
    notifyListeners();
  }

  void completeLogin() {
    isAuthenticated = true;
    pendingPhone = null;
    notifyListeners();
  }

  void logout() {
    isAuthenticated = false;
    pendingPhone = null;
    notifyListeners();
  }
}

final authProvider = ChangeNotifierProvider<AuthState>((ref) {
  return AuthState();
});
