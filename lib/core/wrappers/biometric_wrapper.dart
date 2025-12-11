import 'package:local_auth/local_auth.dart';
import 'package:flutter/services.dart';

/// BiometricWrapper - Fingerprint/FaceID Authentication
/// Handles secure local authentication
class BiometricWrapper {
  static final BiometricWrapper _instance = BiometricWrapper._internal();
  factory BiometricWrapper() => _instance;
  BiometricWrapper._internal();

  final LocalAuthentication _auth = LocalAuthentication();

  /// Check if biometrics are available
  Future<bool> isAvailable() async {
    try {
      final canCheck = await _auth.canCheckBiometrics;
      final isDeviceSupported = await _auth.isDeviceSupported();
      return canCheck && isDeviceSupported;
    } on PlatformException catch (_) {
      return false;
    }
  }

  /// Get available biometric types
  Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } on PlatformException catch (_) {
      return <BiometricType>[];
    }
  }

  /// Authenticate user
  Future<bool> authenticate({
    String reason = 'Please authenticate to access Rizik',
    bool sticky = true,
    bool sensitiveTransaction = false,
  }) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: AuthenticationOptions(
          stickyAuth: sticky,
          sensitiveTransaction: sensitiveTransaction,
          biometricOnly: true,
        ),
      );
    } on PlatformException catch (e) {
      print('Biometric auth failed: $e');
      return false;
    }
  }

  /// Stop authentication
  Future<void> stopAuthentication() async {
    await _auth.stopAuthentication();
  }
}

/// Global instance
final biometricWrapper = BiometricWrapper();
