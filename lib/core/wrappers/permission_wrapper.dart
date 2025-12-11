import 'package:permission_handler/permission_handler.dart';

/// PermissionWrapper - Smart Permission Handling
/// Manages app permissions with status checks and requests
class PermissionWrapper {
  static final PermissionWrapper _instance = PermissionWrapper._internal();
  factory PermissionWrapper() => _instance;
  PermissionWrapper._internal();

  /// Check status of a permission
  Future<PermissionStatus> check(Permission permission) async {
    return await permission.status;
  }

  /// Request a permission
  Future<PermissionStatus> request(Permission permission) async {
    return await permission.request();
  }

  /// Request multiple permissions
  Future<Map<Permission, PermissionStatus>> requestMultiple(
    List<Permission> permissions,
  ) async {
    return await permissions.request();
  }

  /// Open app settings
  Future<bool> openSettings() async {
    return await openAppSettings();
  }

  /// Check if permission is permanently denied
  Future<bool> isPermanentlyDenied(Permission permission) async {
    return await permission.isPermanentlyDenied;
  }

  /// Check if permission is restricted (iOS)
  Future<bool> isRestricted(Permission permission) async {
    return await permission.isRestricted;
  }

  /// Check if permission is limited (iOS 14+)
  Future<bool> isLimited(Permission permission) async {
    return await permission.isLimited;
  }
}

/// Global instance
final permissionWrapper = PermissionWrapper();
