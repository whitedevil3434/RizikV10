// Co-Pilot Opportunity Provider
// State management for opportunity engine

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/opportunity.dart';
import 'package:rizik_v4/data/remote/copilot_service.dart';

class CoPilotProvider extends ChangeNotifier {
  final CoPilotService _service = CoPilotService();
  
  UserContext? _currentContext;
  List<Opportunity> _availableOpportunities = [];
  List<Opportunity> _topOpportunities = [];
  AcceptedOpportunity? _activeOpportunity;
  Timer? _contextUpdateTimer;
  bool _isTracking = false;
  
  // For simulating location updates
  double? _previousLat;
  double? _previousLng;
  DateTime? _lastActivityChange;

  // Getters
  UserContext? get currentContext => _currentContext;
  List<Opportunity> get availableOpportunities => _availableOpportunities;
  List<Opportunity> get topOpportunities => _topOpportunities;
  AcceptedOpportunity? get activeOpportunity => _activeOpportunity;
  bool get isTracking => _isTracking;
  bool get hasActiveOpportunity => _activeOpportunity != null && _activeOpportunity!.isActive;

  /// Start tracking user context
  /// For MVP, we'll use simulated location. In production, use Geolocator
  Future<void> startTracking({
    required String userId,
    required List<String> userSkills,
    required String currentRole,
    double? initialLat,
    double? initialLng,
  }) async {
    if (_isTracking) return;

    _isTracking = true;
    
    // Use provided location or default to Dhaka coordinates
    _previousLat = initialLat ?? 23.8103; // Dhaka
    _previousLng = initialLng ?? 90.4125;
    _lastActivityChange = DateTime.now();

    // Start periodic context updates (every 30 seconds)
    _contextUpdateTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _updateContext(
        userId: userId,
        userSkills: userSkills,
        currentRole: currentRole,
      ),
    );

    // Initial update
    await _updateContext(
      userId: userId,
      userSkills: userSkills,
      currentRole: currentRole,
    );

    notifyListeners();
  }

  /// Stop tracking user context
  void stopTracking() {
    _contextUpdateTimer?.cancel();
    _contextUpdateTimer = null;
    _isTracking = false;
    _previousLat = null;
    _previousLng = null;
    notifyListeners();
  }

  /// Update user context
  Future<void> _updateContext({
    required String userId,
    required List<String> userSkills,
    required String currentRole,
  }) async {
    try {
      // Simulate location update (small random movement)
      // In production, use actual GPS
      final currentLat = _previousLat! + (DateTime.now().millisecond % 10 - 5) * 0.0001;
      final currentLng = _previousLng! + (DateTime.now().millisecond % 10 - 5) * 0.0001;

      // Detect activity
      final activity = _service.detectActivity(
        _previousLat,
        _previousLng,
        currentLat,
        currentLng,
        const Duration(seconds: 30),
      );

      // Check if idle
      final isIdle = _service.isUserIdle(activity, _lastActivityChange!);

      // Update activity change time if activity changed
      if (_currentContext?.activity != activity) {
        _lastActivityChange = DateTime.now();
      }

      // Build context
      _currentContext = UserContext(
        userId: userId,
        latitude: currentLat,
        longitude: currentLng,
        activity: activity,
        isIdle: isIdle,
        timestamp: DateTime.now(),
        skills: userSkills,
        currentRole: currentRole,
        availableMinutes: 60, // Default 1 hour availability
      );

      // Update previous position
      _previousLat = currentLat;
      _previousLng = currentLng;

      // Find opportunities
      await _findOpportunities();

      notifyListeners();
    } catch (e) {
      debugPrint('Error updating context: $e');
    }
  }

  /// Find opportunities for current context
  Future<void> _findOpportunities() async {
    if (_currentContext == null) return;
    if (hasActiveOpportunity) return; // Don't show new if one is active

    // Generate sample opportunities (in production, fetch from API)
    _availableOpportunities = _service.generateSampleOpportunities(_currentContext!);

    // Calculate distances and detours
    _availableOpportunities = _availableOpportunities.map((opp) {
      final distance = _service.calculateDistance(
        _currentContext!.latitude,
        _currentContext!.longitude,
        opp.pickupLat,
        opp.pickupLng,
      );

      final detour = _service.calculateDetour(
        _currentContext!.latitude,
        _currentContext!.longitude,
        _currentContext!.destinationLat,
        _currentContext!.destinationLng,
        opp.pickupLat,
        opp.pickupLng,
      );

      return opp.copyWith(
        distanceKm: distance,
        detourKm: detour,
      );
    }).toList();

    // Get top 3 opportunities
    _topOpportunities = _service.getTopOpportunities(
      _availableOpportunities,
      _currentContext!,
      limit: 3,
    );
  }

  /// Accept an opportunity
  Future<void> acceptOpportunity(
    Opportunity opportunity,
    String temporaryRole,
  ) async {
    _activeOpportunity = AcceptedOpportunity(
      opportunity: opportunity,
      acceptedAt: DateTime.now(),
      temporaryRole: temporaryRole,
      status: 'accepted',
    );

    // Remove from top opportunities
    _topOpportunities.remove(opportunity);

    notifyListeners();
  }

  /// Start working on accepted opportunity
  void startOpportunity() {
    if (_activeOpportunity == null) return;

    _activeOpportunity = _activeOpportunity!.copyWith(
      status: 'in_progress',
    );

    notifyListeners();
  }

  /// Complete active opportunity
  Future<void> completeOpportunity() async {
    if (_activeOpportunity == null) return;

    _activeOpportunity = _activeOpportunity!.copyWith(
      status: 'completed',
      completedAt: DateTime.now(),
    );

    notifyListeners();

    // Clear after showing completion for 3 seconds
    await Future.delayed(const Duration(seconds: 3));
    _activeOpportunity = null;
    notifyListeners();
  }

  /// Cancel active opportunity
  void cancelOpportunity() {
    if (_activeOpportunity == null) return;

    _activeOpportunity = _activeOpportunity!.copyWith(
      status: 'cancelled',
    );

    notifyListeners();

    // Clear immediately
    _activeOpportunity = null;
  }

  /// Manually refresh opportunities
  Future<void> refreshOpportunities() async {
    if (_currentContext == null) return;
    await _findOpportunities();
    notifyListeners();
  }

  /// Update user's destination (for detour calculation)
  void setDestination(double? lat, double? lng) {
    if (_currentContext == null) return;

    _currentContext = _currentContext!.copyWith(
      destinationLat: lat,
      destinationLng: lng,
    );

    // Recalculate opportunities with new detour info
    _findOpportunities();
    notifyListeners();
  }

  @override
  void dispose() {
    stopTracking();
    super.dispose();
  }
}
