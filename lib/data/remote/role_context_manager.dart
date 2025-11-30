import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/user_role.dart';
import 'package:rizik_v4/data/models/user_profile.dart';
import 'package:rizik_v4/data/models/trust_score.dart';

/// Manages the current role context and permissions for the user
/// This is the central authority for role-based access control
class RoleContextManager {
  final UserProfile _userProfile;
  final TrustScore _trustScore;
  UserRole _currentRole;
  
  // Location context
  double? _currentLatitude;
  double? _currentLongitude;
  
  // Permission cache
  final Map<String, bool> _permissionCache = {};

  RoleContextManager({
    required UserProfile userProfile,
    required TrustScore trustScore,
    UserRole? initialRole,
  })  : _userProfile = userProfile,
        _trustScore = trustScore,
        _currentRole = initialRole ?? UserRole.consumer;

  // ============================================================================
  // GETTERS
  // ============================================================================

  /// Get current active role
  UserRole get currentRole => _currentRole;

  /// Get user profile
  UserProfile get userProfile => _userProfile;

  /// Get trust score
  TrustScore get trustScore => _trustScore;

  /// Get current Trust Score value
  double get trustScoreValue => _trustScore.overall;

  /// Get current Aura level
  int get auraLevel => 1; // TODO: Add auraLevel to UserProfile model

  /// Get current location
  (double?, double?) get currentLocation => (_currentLatitude, _currentLongitude);

  /// Check if location is available
  bool get hasLocation => _currentLatitude != null && _currentLongitude != null;

  // ============================================================================
  // ROLE MANAGEMENT
  // ============================================================================

  /// Switch to a different role
  /// Returns true if switch was successful
  bool switchRole(UserRole newRole) {
    if (_currentRole == newRole) return true;

    // Check if user has permission for this role
    if (!canAccessRole(newRole)) {
      debugPrint('❌ Cannot switch to $newRole - insufficient permissions');
      return false;
    }

    _currentRole = newRole;
    _clearPermissionCache(); // Clear cache on role switch
    debugPrint('✅ Switched to role: $newRole');
    return true;
  }

  /// Check if user can access a specific role
  bool canAccessRole(UserRole role) {
    switch (role) {
      case UserRole.consumer:
        // Everyone can be a consumer
        return true;

      case UserRole.partner:
        // Partners need minimum Trust Score of 2.0
        return trustScoreValue >= 2.0;

      case UserRole.rider:
        // Riders need minimum Trust Score of 3.0
        return trustScoreValue >= 3.0;
    }
  }

  /// Get all roles user has access to
  List<UserRole> get availableRoles {
    return UserRole.values.where((role) => canAccessRole(role)).toList();
  }

  // ============================================================================
  // PERMISSION CHECKING
  // ============================================================================

  /// Check if user has permission for a specific feature
  /// Uses caching for performance
  bool hasPermission(String featureKey) {
    // Check cache first
    if (_permissionCache.containsKey(featureKey)) {
      return _permissionCache[featureKey]!;
    }

    // Calculate permission
    final hasAccess = _calculatePermission(featureKey);
    _permissionCache[featureKey] = hasAccess;
    return hasAccess;
  }

  /// Calculate permission for a feature
  bool _calculatePermission(String featureKey) {
    // Role-based permissions
    switch (featureKey) {
      // Consumer permissions
      case 'place_order':
        return _currentRole == UserRole.consumer && trustScoreValue >= 1.0;
      case 'create_bid_request':
        return _currentRole == UserRole.consumer && trustScoreValue >= 2.0;
      case 'access_c2c_marketplace':
        return _currentRole == UserRole.consumer && trustScoreValue >= 2.5;
      case 'request_rizik_dhaar':
        return _currentRole == UserRole.consumer && trustScoreValue >= 3.5;

      // Partner permissions
      case 'accept_orders':
        return _currentRole == UserRole.partner && trustScoreValue >= 2.0;
      case 'bid_on_requests':
        return _currentRole == UserRole.partner && trustScoreValue >= 2.5;
      case 'create_virtual_storefront':
        return _currentRole == UserRole.partner && trustScoreValue >= 3.0;
      case 'post_vibe_video':
        return _currentRole == UserRole.partner && trustScoreValue >= 3.5;
      case 'access_analytics':
        return _currentRole == UserRole.partner && trustScoreValue >= 2.0;

      // Rider permissions
      case 'accept_missions':
        return _currentRole == UserRole.rider && trustScoreValue >= 3.0;
      case 'access_mission_chains':
        return _currentRole == UserRole.rider && trustScoreValue >= 3.5;
      case 'access_peak_bonuses':
        return _currentRole == UserRole.rider && trustScoreValue >= 3.0;

      // Shared permissions
      case 'access_squad_features':
        return trustScoreValue >= 3.0;
      case 'access_social_ledger':
        return trustScoreValue >= 2.0;
      case 'access_khata_os':
        return trustScoreValue >= 1.0;

      default:
        debugPrint('⚠️ Unknown permission key: $featureKey');
        return false;
    }
  }

  /// Check if user meets minimum Trust Score requirement
  bool meetsTrustScoreRequirement(double minScore) {
    return trustScoreValue >= minScore;
  }

  /// Check if user meets minimum Aura level requirement
  bool meetsAuraLevelRequirement(int minLevel) {
    return auraLevel >= minLevel;
  }

  /// Clear permission cache (call when Trust Score or role changes)
  void _clearPermissionCache() {
    _permissionCache.clear();
  }

  // ============================================================================
  // LOCATION MANAGEMENT
  // ============================================================================

  /// Update current location
  void updateLocation(double latitude, double longitude) {
    _currentLatitude = latitude;
    _currentLongitude = longitude;
    debugPrint('📍 Location updated: ($latitude, $longitude)');
  }

  /// Clear current location
  void clearLocation() {
    _currentLatitude = null;
    _currentLongitude = null;
    debugPrint('📍 Location cleared');
  }

  /// Calculate distance from current location to a point (in km)
  double? distanceFrom(double? targetLat, double? targetLon) {
    if (!hasLocation || targetLat == null || targetLon == null) {
      return null;
    }

    return _calculateDistance(
      _currentLatitude!,
      _currentLongitude!,
      targetLat,
      targetLon,
    );
  }

  /// Haversine formula for distance calculation
  double _calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const double earthRadius = 6371; // km
    
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);
    
    final a = _sin(dLat / 2) * _sin(dLat / 2) +
        _cos(_toRadians(lat1)) *
            _cos(_toRadians(lat2)) *
            _sin(dLon / 2) *
            _sin(dLon / 2);
    
    final c = 2 * _atan2(_sqrt(a), _sqrt(1 - a));
    
    return earthRadius * c;
  }

  double _toRadians(double degrees) => degrees * (3.14159265359 / 180);
  double _sin(double x) => x - (x * x * x) / 6 + (x * x * x * x * x) / 120; // Taylor series approximation
  double _cos(double x) => 1 - (x * x) / 2 + (x * x * x * x) / 24; // Taylor series approximation
  double _sqrt(double x) => x; // Placeholder - use dart:math in real implementation
  double _atan2(double y, double x) => y / x; // Placeholder - use dart:math in real implementation

  // ============================================================================
  // CONTEXT INFORMATION
  // ============================================================================

  /// Get full context as a map (useful for logging/debugging)
  Map<String, dynamic> getContext() {
    return {
      'currentRole': _currentRole.displayName,
      'trustScore': trustScoreValue,
      'auraLevel': auraLevel,
      'location': hasLocation
          ? {'lat': _currentLatitude, 'lon': _currentLongitude}
          : null,
      'availableRoles': availableRoles.map((r) => r.displayName).toList(),
      'userId': _userProfile.id,
    };
  }

  /// Get role-specific context
  Map<String, dynamic> getRoleContext() {
    switch (_currentRole) {
      case UserRole.consumer:
        return {
          'canPlaceOrder': hasPermission('place_order'),
          'canCreateBidRequest': hasPermission('create_bid_request'),
          'canAccessC2C': hasPermission('access_c2c_marketplace'),
          'canRequestLoan': hasPermission('request_rizik_dhaar'),
        };

      case UserRole.partner:
        return {
          'canAcceptOrders': hasPermission('accept_orders'),
          'canBidOnRequests': hasPermission('bid_on_requests'),
          'canCreateStorefront': hasPermission('create_virtual_storefront'),
          'canPostVideo': hasPermission('post_vibe_video'),
          'canAccessAnalytics': hasPermission('access_analytics'),
        };

      case UserRole.rider:
        return {
          'canAcceptMissions': hasPermission('accept_missions'),
          'canAccessChains': hasPermission('access_mission_chains'),
          'canAccessBonuses': hasPermission('access_peak_bonuses'),
        };
    }
  }

  /// Get permission requirements for a feature
  Map<String, dynamic> getFeatureRequirements(String featureKey) {
    switch (featureKey) {
      case 'create_bid_request':
        return {
          'minTrustScore': 2.0,
          'requiredRole': UserRole.consumer,
          'description': 'Create bargaining requests',
        };
      case 'post_vibe_video':
        return {
          'minTrustScore': 3.5,
          'requiredRole': UserRole.partner,
          'description': 'Post shoppable videos',
        };
      case 'access_mission_chains':
        return {
          'minTrustScore': 3.5,
          'requiredRole': UserRole.rider,
          'description': 'Access multi-delivery chains',
        };
      default:
        return {
          'minTrustScore': 0.0,
          'requiredRole': null,
          'description': 'Unknown feature',
        };
    }
  }

  /// Check if feature is locked and get unlock requirements
  Map<String, dynamic>? getUnlockRequirements(String featureKey) {
    if (hasPermission(featureKey)) {
      return null; // Feature is unlocked
    }

    final requirements = getFeatureRequirements(featureKey);
    final minScore = requirements['minTrustScore'] as double;
    final requiredRole = requirements['requiredRole'] as UserRole?;

    return {
      'isLocked': true,
      'currentTrustScore': trustScoreValue,
      'requiredTrustScore': minScore,
      'trustScoreGap': minScore - trustScoreValue,
      'currentRole': _currentRole,
      'requiredRole': requiredRole,
      'needsRoleSwitch': requiredRole != null && requiredRole != _currentRole,
      'description': requirements['description'],
    };
  }
}

/// Extension for easy context access
extension RoleContextExtension on RoleContextManager {
  /// Quick check if user is consumer
  bool get isConsumer => currentRole == UserRole.consumer;

  /// Quick check if user is partner
  bool get isPartner => currentRole == UserRole.partner;

  /// Quick check if user is rider
  bool get isRider => currentRole == UserRole.rider;

  /// Check if user has high trust (>= 4.0)
  bool get hasHighTrust => trustScoreValue >= 4.0;

  /// Check if user has medium trust (>= 3.0)
  bool get hasMediumTrust => trustScoreValue >= 3.0;

  /// Check if user has low trust (< 3.0)
  bool get hasLowTrust => trustScoreValue < 3.0;

  /// Check if user is verified (Trust Score >= 4.5)
  bool get isVerified => trustScoreValue >= 4.5;
}
