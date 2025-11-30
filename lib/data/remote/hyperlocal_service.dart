import 'dart:math';
import 'package:rizik_v4/data/remote/hyperlocal_service.dart';

/// Service layer for Hyperlocal Services
class HyperlocalServiceService {
  static final HyperlocalServiceService _instance = HyperlocalServiceService._internal();
  factory HyperlocalServiceService() => _instance;
  HyperlocalServiceService._internal();

  /// Calculate distance between two coordinates (Haversine formula)
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    const earthRadius = 6371; // km
    final dLat = _toRadians(lat2 - lat1);
    final dLon = _toRadians(lon2 - lon1);

    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRadians(lat1)) *
            cos(_toRadians(lat2)) *
            sin(dLon / 2) *
            sin(dLon / 2);

    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return earthRadius * c;
  }

  static double _toRadians(double degrees) {
    return degrees * pi / 180;
  }

  /// Filter services by proximity (within 500m)
  static List<HyperlocalService> filterByProximity({
    required List<HyperlocalService> services,
    required double userLat,
    required double userLng,
    double maxDistanceKm = 0.5, // 500m default
  }) {
    return services.where((service) {
      final distance = calculateDistance(
        userLat,
        userLng,
        service.latitude,
        service.longitude,
      );
      return distance <= maxDistanceKm && service.isAvailable;
    }).toList();
  }

  /// Sort services by distance
  static List<HyperlocalService> sortByDistance({
    required List<HyperlocalService> services,
    required double userLat,
    required double userLng,
  }) {
    final servicesWithDistance = services.map((service) {
      final distance = calculateDistance(
        userLat,
        userLng,
        service.latitude,
        service.longitude,
      );
      return {'service': service, 'distance': distance};
    }).toList();

    servicesWithDistance.sort((a, b) =>
        (a['distance'] as double).compareTo(b['distance'] as double));

    return servicesWithDistance
        .map((item) => item['service'] as HyperlocalService)
        .toList();
  }

  /// Filter services by type
  static List<HyperlocalService> filterByType({
    required List<HyperlocalService> services,
    required ServiceType type,
  }) {
    return services.where((service) => service.type == type).toList();
  }

  /// Search services by query
  static List<HyperlocalService> searchServices({
    required List<HyperlocalService> services,
    required String query,
  }) {
    final lowerQuery = query.toLowerCase();
    return services.where((service) {
      return service.title.toLowerCase().contains(lowerQuery) ||
          service.titleBn.contains(query) ||
          service.description.toLowerCase().contains(lowerQuery) ||
          service.descriptionBn.contains(query);
    }).toList();
  }

  /// Generate mock services for testing
  static List<HyperlocalService> generateMockServices({
    required double userLat,
    required double userLng,
    int count = 20,
  }) {
    final random = Random();
    final services = <HyperlocalService>[];
    final now = DateTime.now();

    final serviceTemplates = [
      {
        'type': ServiceType.cleaning,
        'title': 'House Cleaning Service',
        'titleBn': 'ঘর পরিষ্কার সেবা',
        'description': 'Professional cleaning for your home',
        'descriptionBn': 'আপনার বাড়ির জন্য পেশাদার পরিষ্কার',
        'pricePerHour': 200.0,
        'duration': 120,
      },
      {
        'type': ServiceType.cooking,
        'title': 'Home Cooking Service',
        'titleBn': 'বাড়িতে রান্নার সেবা',
        'description': 'Delicious home-cooked meals',
        'descriptionBn': 'সুস্বাদু ঘরে রান্না করা খাবার',
        'pricePerHour': 150.0,
        'duration': 90,
      },
      {
        'type': ServiceType.tutoring,
        'title': 'Math Tutoring',
        'titleBn': 'গণিত টিউশন',
        'description': 'Expert math tutoring for students',
        'descriptionBn': 'ছাত্রদের জন্য বিশেষজ্ঞ গণিত টিউশন',
        'pricePerHour': 300.0,
        'duration': 60,
      },
      {
        'type': ServiceType.repair,
        'title': 'Home Repair Service',
        'titleBn': 'বাড়ি মেরামত সেবা',
        'description': 'Fix anything in your home',
        'descriptionBn': 'আপনার বাড়িতে যেকোনো কিছু ঠিক করুন',
        'pricePerHour': 250.0,
        'duration': 120,
      },
      {
        'type': ServiceType.childcare,
        'title': 'Babysitting Service',
        'titleBn': 'শিশু দেখাশোনা সেবা',
        'description': 'Trusted childcare at your home',
        'descriptionBn': 'আপনার বাড়িতে বিশ্বস্ত শিশু যত্ন',
        'pricePerHour': 180.0,
        'duration': 180,
      },
      {
        'type': ServiceType.laundry,
        'title': 'Laundry Service',
        'titleBn': 'লন্ড্রি সেবা',
        'description': 'Wash and iron your clothes',
        'descriptionBn': 'আপনার কাপড় ধোয়া এবং ইস্ত্রি',
        'pricePerHour': 100.0,
        'duration': 60,
      },
    ];

    for (int i = 0; i < count; i++) {
      final template = serviceTemplates[i % serviceTemplates.length];
      
      // Random location within 500m
      final latOffset = (random.nextDouble() - 0.5) * 0.009; // ~500m
      final lngOffset = (random.nextDouble() - 0.5) * 0.009;

      services.add(HyperlocalService(
        id: 'service_${now.millisecondsSinceEpoch}_$i',
        providerId: 'provider_$i',
        providerName: 'Provider ${i + 1}',
        providerPhone: '+880171234${5000 + i}',
        providerTrustScore: 3.5 + random.nextDouble() * 1.5,
        type: template['type'] as ServiceType,
        title: template['title'] as String,
        titleBn: template['titleBn'] as String,
        description: template['description'] as String,
        descriptionBn: template['descriptionBn'] as String,
        pricePerHour: template['pricePerHour'] as double,
        fixedPrice: random.nextBool() ? (template['pricePerHour'] as double) * 2 : null,
        estimatedDuration: template['duration'] as int,
        latitude: userLat + latOffset,
        longitude: userLng + lngOffset,
        address: 'Building ${i + 1}, Dhanmondi',
        building: 'Building ${(i % 5) + 1}',
        radius: 500,
        skills: ['professional', 'experienced'],
        photos: [],
        status: ServiceStatus.active,
        createdAt: now.subtract(Duration(days: random.nextInt(30))),
        completedBookings: random.nextInt(50),
        rating: 3.5 + random.nextDouble() * 1.5,
        reviewCount: random.nextInt(20),
      ));
    }

    return services;
  }

  /// Calculate total price for booking
  static double calculateBookingPrice({
    required HyperlocalService service,
    required int durationMinutes,
  }) {
    if (service.fixedPrice != null) {
      return service.fixedPrice!;
    }
    final hours = durationMinutes / 60;
    return service.pricePerHour * hours;
  }

  /// Check if service is available at specific time
  static bool isAvailableAt({
    required HyperlocalService service,
    required DateTime time,
  }) {
    if (!service.isAvailable) return false;
    if (service.availableFrom != null && time.isBefore(service.availableFrom!)) {
      return false;
    }
    if (service.availableUntil != null && time.isAfter(service.availableUntil!)) {
      return false;
    }
    return true;
  }

  /// Group services by building
  static Map<String, List<HyperlocalService>> groupByBuilding(
    List<HyperlocalService> services,
  ) {
    final Map<String, List<HyperlocalService>> grouped = {};
    for (final service in services) {
      if (!grouped.containsKey(service.building)) {
        grouped[service.building] = [];
      }
      grouped[service.building]!.add(service);
    }
    return grouped;
  }

  /// Sort services by rating
  static List<HyperlocalService> sortByRating(
    List<HyperlocalService> services,
  ) {
    final sorted = List<HyperlocalService>.from(services);
    sorted.sort((a, b) => b.rating.compareTo(a.rating));
    return sorted;
  }

  /// Create escrow for booking
  static double createEscrow({required double totalPrice}) {
    return totalPrice; // Hold full amount in escrow
  }

  /// Confirm booking (provider action)
  static ServiceBooking confirmBooking(ServiceBooking booking) {
    return ServiceBooking(
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
      escrowReleased: booking.escrowReleased,
    );
  }

  /// Start service
  static ServiceBooking startService(ServiceBooking booking) {
    return ServiceBooking(
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
      status: BookingStatus.inProgress,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      startedAt: DateTime.now(),
      escrowAmount: booking.escrowAmount,
      escrowReleased: booking.escrowReleased,
    );
  }

  /// Complete service
  static ServiceBooking completeService(ServiceBooking booking) {
    return ServiceBooking(
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
      startedAt: booking.startedAt,
      completedAt: DateTime.now(),
      escrowAmount: booking.escrowAmount,
      escrowReleased: booking.escrowReleased,
    );
  }

  /// Cancel booking
  static ServiceBooking cancelBooking({
    required ServiceBooking booking,
    required String reason,
  }) {
    return ServiceBooking(
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
      startedAt: booking.startedAt,
      completedAt: booking.completedAt,
      cancelledAt: DateTime.now(),
      cancellationReason: reason,
      escrowAmount: booking.escrowAmount,
      escrowReleased: true, // Release escrow on cancellation
    );
  }

  /// Add review to booking
  static ServiceBooking addReview({
    required ServiceBooking booking,
    required double rating,
    required String review,
  }) {
    return ServiceBooking(
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
      status: booking.status,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      startedAt: booking.startedAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      escrowAmount: booking.escrowAmount,
      escrowReleased: booking.escrowReleased,
      rating: rating,
      review: review,
    );
  }

  /// Release escrow payment
  static ServiceBooking releaseEscrow(ServiceBooking booking) {
    return ServiceBooking(
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
      status: booking.status,
      createdAt: booking.createdAt,
      confirmedAt: booking.confirmedAt,
      startedAt: booking.startedAt,
      completedAt: booking.completedAt,
      cancelledAt: booking.cancelledAt,
      cancellationReason: booking.cancellationReason,
      escrowAmount: booking.escrowAmount,
      escrowReleased: true,
      rating: booking.rating,
      review: booking.review,
    );
  }

  /// Check if escrow should be auto-released (24 hours after completion)
  static bool shouldAutoReleaseEscrow(ServiceBooking booking) {
    if (booking.escrowReleased) return false;
    if (booking.status != BookingStatus.completed) return false;
    if (booking.completedAt == null) return false;

    final hoursSinceCompletion =
        DateTime.now().difference(booking.completedAt!).inHours;
    return hoursSinceCompletion >= 24;
  }
}
