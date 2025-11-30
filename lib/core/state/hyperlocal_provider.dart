// Hyperlocal Services Provider
// State management for hyperlocal services marketplace

import 'package:flutter/material.dart';
import 'package:rizik_v4/data/remote/hyperlocal_service.dart';
import 'package:rizik_v4/data/remote/hyperlocal_service.dart' as service;

class HyperlocalProvider extends ChangeNotifier {
  List<HyperlocalService> _allServices = [];
  List<HyperlocalService> _filteredServices = [];
  List<ServiceBooking> _myBookings = [];
  List<ServiceBooking> _myServiceBookings = []; // Bookings for my services
  ServiceType? _selectedType;
  double? _userLat;
  double? _userLng;
  bool _isLoading = false;
  String? _error;

  // Getters
  List<HyperlocalService> get allServices => _allServices;
  List<HyperlocalService> get filteredServices => _filteredServices;
  List<ServiceBooking> get myBookings => _myBookings;
  List<ServiceBooking> get myServiceBookings => _myServiceBookings;
  ServiceType? get selectedType => _selectedType;
  bool get isLoading => _isLoading;
  String? get error => _error;

  /// Initialize with user location
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();

    try {
      // Use mock location for now (Dhanmondi, Dhaka)
      // In production, use actual geolocation
      _userLat = 23.7461;
      _userLng = 90.3742;

      // Load services
      await loadServices();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Load all services
  Future<void> loadServices() async {
    if (_userLat == null || _userLng == null) return;

    _isLoading = true;
    notifyListeners();

    try {
      // In production, fetch from API
      // For now, generate mock data
      _allServices = service.HyperlocalServiceService.generateMockServices(
        userLat: _userLat!,
        userLng: _userLng!,
        count: 20,
      );

      // Filter by proximity
      _filteredServices = service.HyperlocalServiceService.filterByProximity(
        services: _allServices,
        userLat: _userLat!,
        userLng: _userLng!,
      );

      // Sort by distance
      _filteredServices = service.HyperlocalServiceService.sortByDistance(
        services: _filteredServices,
        userLat: _userLat!,
        userLng: _userLng!,
      );

      _error = null;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Filter by service type
  void filterByType(ServiceType? type) {
    _selectedType = type;

    if (type == null) {
      // Show all
      _filteredServices = service.HyperlocalServiceService.filterByProximity(
        services: _allServices,
        userLat: _userLat!,
        userLng: _userLng!,
      );
    } else {
      // Filter by type
      final proximityFiltered =
          service.HyperlocalServiceService.filterByProximity(
        services: _allServices,
        userLat: _userLat!,
        userLng: _userLng!,
      );

      _filteredServices = service.HyperlocalServiceService.filterByType(
        services: proximityFiltered,
        type: type,
      );
    }

    // Sort by distance
    _filteredServices = service.HyperlocalServiceService.sortByDistance(
      services: _filteredServices,
      userLat: _userLat!,
      userLng: _userLng!,
    );

    notifyListeners();
  }

  /// Sort services
  void sortServices(String sortBy) {
    if (sortBy == 'distance') {
      _filteredServices = service.HyperlocalServiceService.sortByDistance(
        services: _filteredServices,
        userLat: _userLat!,
        userLng: _userLng!,
      );
    } else if (sortBy == 'rating') {
      _filteredServices = service.HyperlocalServiceService.sortByRating(
        _filteredServices,
      );
    } else if (sortBy == 'price_low') {
      _filteredServices.sort((a, b) {
        final priceA = a.fixedPrice ?? a.pricePerHour;
        final priceB = b.fixedPrice ?? b.pricePerHour;
        return priceA.compareTo(priceB);
      });
    } else if (sortBy == 'price_high') {
      _filteredServices.sort((a, b) {
        final priceA = a.fixedPrice ?? a.pricePerHour;
        final priceB = b.fixedPrice ?? b.pricePerHour;
        return priceB.compareTo(priceA);
      });
    }

    notifyListeners();
  }

  /// Get services grouped by building
  Map<String, List<HyperlocalService>> getServicesByBuilding() {
    return service.HyperlocalServiceService.groupByBuilding(_filteredServices);
  }

  /// Create booking
  Future<ServiceBooking> createBooking({
    required HyperlocalService selectedService,
    required String consumerId,
    required String consumerName,
    required String consumerPhone,
    required DateTime scheduledTime,
    required int duration,
    required String location,
    String? specialInstructions,
  }) async {
    final totalPrice = service.HyperlocalServiceService.calculateBookingPrice(
      service: selectedService,
      durationMinutes: duration,
    );

    final escrowAmount = service.HyperlocalServiceService.createEscrow(
      totalPrice: totalPrice,
    );

    final booking = ServiceBooking(
      id: 'booking_${DateTime.now().millisecondsSinceEpoch}',
      serviceId: selectedService.id,
      providerId: selectedService.providerId,
      consumerId: consumerId,
      consumerName: consumerName,
      consumerPhone: consumerPhone,
      scheduledTime: scheduledTime,
      duration: duration,
      totalPrice: totalPrice,
      location: location,
      specialInstructions: specialInstructions,
      status: BookingStatus.pending,
      createdAt: DateTime.now(),
      escrowAmount: escrowAmount,
    );

    _myBookings.add(booking);
    notifyListeners();

    return booking;
  }

  /// Confirm booking (provider)
  Future<void> confirmBooking(String bookingId) async {
    final index =
        _myServiceBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _myServiceBookings[index] =
          service.HyperlocalServiceService.confirmBooking(
        _myServiceBookings[index],
      );
      notifyListeners();
    }
  }

  /// Start service
  Future<void> startService(String bookingId) async {
    final index =
        _myServiceBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _myServiceBookings[index] =
          service.HyperlocalServiceService.startService(
        _myServiceBookings[index],
      );
      notifyListeners();
    }
  }

  /// Complete service
  Future<void> completeService(String bookingId) async {
    final index =
        _myServiceBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _myServiceBookings[index] =
          service.HyperlocalServiceService.completeService(
        _myServiceBookings[index],
      );
      notifyListeners();
    }
  }

  /// Cancel booking
  Future<void> cancelBooking({
    required String bookingId,
    required String reason,
  }) async {
    final index = _myBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _myBookings[index] = service.HyperlocalServiceService.cancelBooking(
        booking: _myBookings[index],
        reason: reason,
      );
      notifyListeners();
    }
  }

  /// Add review
  Future<void> addReview({
    required String bookingId,
    required double rating,
    required String review,
  }) async {
    final index = _myBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _myBookings[index] = service.HyperlocalServiceService.addReview(
        booking: _myBookings[index],
        rating: rating,
        review: review,
      );
      notifyListeners();
    }
  }

  /// Release escrow (auto or manual)
  Future<void> releaseEscrow(String bookingId) async {
    final index = _myBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      _myBookings[index] = service.HyperlocalServiceService.releaseEscrow(
        _myBookings[index],
      );
      notifyListeners();
    }
  }

  /// Check and auto-release escrows
  Future<void> checkAutoReleaseEscrows() async {
    bool updated = false;

    for (int i = 0; i < _myBookings.length; i++) {
      if (service.HyperlocalServiceService.shouldAutoReleaseEscrow(
        _myBookings[i],
      )) {
        _myBookings[i] = service.HyperlocalServiceService.releaseEscrow(
          _myBookings[i],
        );
        updated = true;
      }
    }

    if (updated) {
      notifyListeners();
    }
  }

  /// Get distance to service
  double getDistanceToService(HyperlocalService selectedService) {
    if (_userLat == null || _userLng == null) return 0;
    return service.HyperlocalServiceService.calculateDistance(
      _userLat!,
      _userLng!,
      selectedService.latitude,
      selectedService.longitude,
    );
  }

  /// Refresh services
  Future<void> refresh() async {
    await loadServices();
  }
}
