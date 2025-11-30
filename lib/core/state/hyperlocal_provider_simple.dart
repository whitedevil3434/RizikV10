import 'package:flutter/material.dart';
import 'package:rizik_v4/data/remote/hyperlocal_service.dart';
import 'package:rizik_v4/data/remote/hyperlocal_service.dart';

/// Simplified Hyperlocal Provider for MVP
class HyperlocalProvider extends ChangeNotifier {
  List<HyperlocalService> _allServices = [];
  List<HyperlocalService> _filteredServices = [];
  List<ServiceBooking> _myBookings = [];
  ServiceType? _selectedType;
  double _userLat = 23.8103; // Dhaka default
  double _userLng = 90.4125;
  bool _isLoading = false;

  // Getters
  List<HyperlocalService> get allServices => _allServices;
  List<HyperlocalService> get filteredServices => _filteredServices;
  List<ServiceBooking> get myBookings => _myBookings;
  ServiceType? get selectedType => _selectedType;
  bool get isLoading => _isLoading;

  /// Initialize and load services
  Future<void> initialize({double? lat, double? lng}) async {
    _isLoading = true;
    notifyListeners();

    if (lat != null) _userLat = lat;
    if (lng != null) _userLng = lng;

    // Generate mock services
    _allServices = HyperlocalServiceService.generateMockServices(
      userLat: _userLat,
      userLng: _userLng,
      count: 15,
    );

    // Filter by proximity
    _filteredServices = HyperlocalServiceService.filterByProximity(
      services: _allServices,
      userLat: _userLat,
      userLng: _userLng,
    );

    // Sort by distance
    _filteredServices = HyperlocalServiceService.sortByDistance(
      services: _filteredServices,
      userLat: _userLat,
      userLng: _userLng,
    );

    _isLoading = false;
    notifyListeners();
  }

  /// Filter by service type
  void filterByType(ServiceType? type) {
    _selectedType = type;

    if (type == null) {
      _filteredServices = HyperlocalServiceService.filterByProximity(
        services: _allServices,
        userLat: _userLat,
        userLng: _userLng,
      );
    } else {
      final proximityFiltered = HyperlocalServiceService.filterByProximity(
        services: _allServices,
        userLat: _userLat,
        userLng: _userLng,
      );
      _filteredServices = HyperlocalServiceService.filterByType(
        services: proximityFiltered,
        type: type,
      );
    }

    _filteredServices = HyperlocalServiceService.sortByDistance(
      services: _filteredServices,
      userLat: _userLat,
      userLng: _userLng,
    );

    notifyListeners();
  }

  /// Search services
  void searchServices(String query) {
    if (query.isEmpty) {
      filterByType(_selectedType);
      return;
    }

    _filteredServices = HyperlocalServiceService.searchServices(
      services: _filteredServices,
      query: query,
    );

    notifyListeners();
  }

  /// Create booking
  Future<ServiceBooking> createBooking({
    required HyperlocalService service,
    required String consumerId,
    required String consumerName,
    required String consumerPhone,
    required DateTime scheduledTime,
    required int duration,
    required String location,
    String? specialInstructions,
  }) async {
    final totalPrice = HyperlocalServiceService.calculateBookingPrice(
      service: service,
      durationMinutes: duration,
    );

    final booking = ServiceBooking(
      id: 'booking_${DateTime.now().millisecondsSinceEpoch}',
      serviceId: service.id,
      providerId: service.providerId,
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
      escrowAmount: totalPrice, // Hold full amount in escrow
    );

    _myBookings.add(booking);
    notifyListeners();

    return booking;
  }

  /// Confirm booking (provider action)
  void confirmBooking(String bookingId) {
    final index = _myBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      final booking = _myBookings[index];
      _myBookings[index] = ServiceBooking(
        id: booking.id,
        serviceId: booking.serviceId,
        providerId: booking.providerId,
        consumerId: booking.consumerId,
        consumerName: booking.consumerName,
        consumerPhone: booking.consumerPhone,
        scheduledTime: booking.scheduledTime,
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        location: booking.location,
        specialInstructions: booking.specialInstructions,
        status: BookingStatus.confirmed,
        createdAt: booking.createdAt,
        confirmedAt: DateTime.now(),
        escrowAmount: booking.escrowAmount,
      );
      notifyListeners();
    }
  }

  /// Complete booking
  void completeBooking(String bookingId) {
    final index = _myBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      final booking = _myBookings[index];
      _myBookings[index] = ServiceBooking(
        id: booking.id,
        serviceId: booking.serviceId,
        providerId: booking.providerId,
        consumerId: booking.consumerId,
        consumerName: booking.consumerName,
        consumerPhone: booking.consumerPhone,
        scheduledTime: booking.scheduledTime,
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        location: booking.location,
        specialInstructions: booking.specialInstructions,
        status: BookingStatus.completed,
        createdAt: booking.createdAt,
        confirmedAt: booking.confirmedAt,
        completedAt: DateTime.now(),
        escrowAmount: booking.escrowAmount,
        escrowReleased: true,
      );
      notifyListeners();
    }
  }

  /// Cancel booking
  void cancelBooking(String bookingId, String reason) {
    final index = _myBookings.indexWhere((b) => b.id == bookingId);
    if (index != -1) {
      final booking = _myBookings[index];
      _myBookings[index] = ServiceBooking(
        id: booking.id,
        serviceId: booking.serviceId,
        providerId: booking.providerId,
        consumerId: booking.consumerId,
        consumerName: booking.consumerName,
        consumerPhone: booking.consumerPhone,
        scheduledTime: booking.scheduledTime,
        duration: booking.duration,
        totalPrice: booking.totalPrice,
        location: booking.location,
        specialInstructions: booking.specialInstructions,
        status: BookingStatus.cancelled,
        createdAt: booking.createdAt,
        confirmedAt: booking.confirmedAt,
        cancelledAt: DateTime.now(),
        cancellationReason: reason,
        escrowAmount: booking.escrowAmount,
      );
      notifyListeners();
    }
  }
}
