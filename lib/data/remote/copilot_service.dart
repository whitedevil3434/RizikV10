import 'dart:async';
import 'dart:math';
import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/opportunity.dart';

/// Co-Pilot Service - Context detection and opportunity matching
class CoPilotService {
  static final CoPilotService _instance = CoPilotService._internal();
  factory CoPilotService() => _instance;
  CoPilotService._internal();

  /// Calculate distance between two coordinates (Haversine formula)
  double calculateDistance(
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

  double _toRadians(double degrees) {
    return degrees * pi / 180;
  }

  /// Calculate detour distance if user has a destination
  double? calculateDetour(
    double userLat,
    double userLng,
    double? destLat,
    double? destLng,
    double oppLat,
    double oppLng,
  ) {
    if (destLat == null || destLng == null) return null;

    // Direct distance from user to destination
    final directDistance = calculateDistance(userLat, userLng, destLat, destLng);

    // Distance via opportunity (user -> opp -> dest)
    final toOpp = calculateDistance(userLat, userLng, oppLat, oppLng);
    final oppToDest = calculateDistance(oppLat, oppLng, destLat, destLng);
    final viaOppDistance = toOpp + oppToDest;

    // Detour is the extra distance
    return viaOppDistance - directDistance;
  }

  /// Calculate relevance score for an opportunity
  /// Score is 0-100 based on multiple factors
  double calculateRelevanceScore(
    Opportunity opportunity,
    UserContext context,
  ) {
    double score = 0;

    // Factor 1: Distance (closer is better) - 30 points
    if (opportunity.distanceKm < 0.5) {
      score += 30;
    } else if (opportunity.distanceKm < 1.0) {
      score += 20;
    } else if (opportunity.distanceKm < 2.0) {
      score += 10;
    }

    // Factor 2: Detour (on path is better) - 25 points
    if (opportunity.isOnPath) {
      score += 25;
    } else if (opportunity.detourKm != null && opportunity.detourKm! < 0.5) {
      score += 15;
    }

    // Factor 3: Earnings per minute - 20 points
    final earningsPerMin = opportunity.earningsPerMinute;
    if (earningsPerMin > 20) {
      score += 20;
    } else if (earningsPerMin > 10) {
      score += 15;
    } else if (earningsPerMin > 5) {
      score += 10;
    }

    // Factor 4: Time availability - 15 points
    if (context.availableMinutes != null) {
      if (opportunity.estimatedMinutes <= context.availableMinutes!) {
        score += 15;
      } else if (opportunity.estimatedMinutes <= context.availableMinutes! * 1.2) {
        score += 8;
      }
    } else {
      score += 10; // Default if no time constraint
    }

    // Factor 5: Skill match - 10 points
    if (opportunity.requiredSkills == null || opportunity.requiredSkills!.isEmpty) {
      score += 10; // No skills required
    } else {
      final matchingSkills = opportunity.requiredSkills!
          .where((skill) => context.skills.contains(skill))
          .length;
      final skillMatchRatio = matchingSkills / opportunity.requiredSkills!.length;
      score += skillMatchRatio * 10;
    }

    return score.clamp(0, 100);
  }

  /// Filter opportunities based on user context
  List<Opportunity> filterOpportunities(
    List<Opportunity> opportunities,
    UserContext context,
  ) {
    return opportunities.where((opp) {
      // Must be valid (not expired)
      if (!opp.isValid) return false;

      // Check role requirement
      if (opp.requiredRole != 'any' && opp.requiredRole != context.currentRole) {
        return false;
      }

      // Check distance (max 5km)
      if (opp.distanceKm > 5.0) return false;

      // Check time availability
      if (context.availableMinutes != null) {
        if (opp.estimatedMinutes > context.availableMinutes! * 1.5) {
          return false;
        }
      }

      // Check skills if required
      if (opp.requiredSkills != null && opp.requiredSkills!.isNotEmpty) {
        final hasRequiredSkills = opp.requiredSkills!.every(
          (skill) => context.skills.contains(skill),
        );
        if (!hasRequiredSkills) return false;
      }

      return true;
    }).toList();
  }

  /// Rank opportunities by relevance
  List<Opportunity> rankOpportunities(
    List<Opportunity> opportunities,
    UserContext context,
  ) {
    // Calculate relevance scores
    final scoredOpportunities = opportunities.map((opp) {
      final score = calculateRelevanceScore(opp, context);
      return opp.copyWith(relevanceScore: score);
    }).toList();

    // Sort by relevance score (highest first)
    scoredOpportunities.sort((a, b) => b.relevanceScore.compareTo(a.relevanceScore));

    return scoredOpportunities;
  }

  /// Get top opportunities for user
  List<Opportunity> getTopOpportunities(
    List<Opportunity> allOpportunities,
    UserContext context, {
    int limit = 3,
  }) {
    // Filter valid opportunities
    final filtered = filterOpportunities(allOpportunities, context);

    // Rank by relevance
    final ranked = rankOpportunities(filtered, context);

    // Return top N
    return ranked.take(limit).toList();
  }

  /// Detect user activity from location updates
  /// This is a simplified version - in production, use activity recognition APIs
  String detectActivity(
    double? previousLat,
    double? previousLng,
    double currentLat,
    double currentLng,
    Duration timeDelta,
  ) {
    if (previousLat == null || previousLng == null) {
      return 'stationary';
    }

    final distance = calculateDistance(
      previousLat,
      previousLng,
      currentLat,
      currentLng,
    );

    // Calculate speed (km/h)
    final hours = timeDelta.inSeconds / 3600;
    final speed = distance / hours;

    if (speed < 1) {
      return 'stationary';
    } else if (speed < 6) {
      return 'walking';
    } else if (speed < 30) {
      return 'driving';
    } else {
      return 'driving';
    }
  }

  /// Check if user is idle (stationary for > 5 minutes)
  bool isUserIdle(
    String activity,
    DateTime lastActivityChange,
  ) {
    if (activity != 'stationary') return false;

    final idleDuration = DateTime.now().difference(lastActivityChange);
    return idleDuration.inMinutes >= 5;
  }

  /// Generate sample opportunities for testing
  /// In production, these would come from backend API
  List<Opportunity> generateSampleOpportunities(UserContext context) {
    final now = DateTime.now();
    final random = Random();

    return [
      // Delivery opportunity
      Opportunity(
        id: 'opp_${now.millisecondsSinceEpoch}_1',
        type: OpportunityType.delivery,
        title: 'Deliver package to nearby building',
        titleBn: 'পাশের বিল্ডিংয়ে প্যাকেজ ডেলিভার করুন',
        description: 'Small package, 5 mins walk',
        descriptionBn: 'ছোট প্যাকেজ, ৫ মিনিট হাঁটা',
        pickupLat: context.latitude + (random.nextDouble() - 0.5) * 0.01,
        pickupLng: context.longitude + (random.nextDouble() - 0.5) * 0.01,
        pickupAddress: 'Dhanmondi 27',
        deliveryLat: context.latitude + (random.nextDouble() - 0.5) * 0.02,
        deliveryLng: context.longitude + (random.nextDouble() - 0.5) * 0.02,
        deliveryAddress: 'Dhanmondi 32',
        earning: 50 + random.nextInt(50).toDouble(),
        estimatedMinutes: 5 + random.nextInt(10),
        distanceKm: 0.3 + random.nextDouble() * 0.5,
        expiresAt: now.add(const Duration(minutes: 30)),
        requiredRole: 'any',
        difficultyLevel: 1,
      ),

      // Shopping errand
      Opportunity(
        id: 'opp_${now.millisecondsSinceEpoch}_2',
        type: OpportunityType.shopping,
        title: 'Buy groceries for neighbor',
        titleBn: 'প্রতিবেশীর জন্য মুদি কিনুন',
        description: 'Quick grocery run, ৳200 budget',
        descriptionBn: 'দ্রুত মুদি কেনা, ৳২০০ বাজেট',
        pickupLat: context.latitude + (random.nextDouble() - 0.5) * 0.005,
        pickupLng: context.longitude + (random.nextDouble() - 0.5) * 0.005,
        pickupAddress: 'Agora Supermarket',
        earning: 30 + random.nextInt(20).toDouble(),
        estimatedMinutes: 15 + random.nextInt(10),
        distanceKm: 0.2 + random.nextDouble() * 0.3,
        expiresAt: now.add(const Duration(hours: 1)),
        requiredRole: 'any',
        difficultyLevel: 1,
      ),

      // Teaching opportunity
      Opportunity(
        id: 'opp_${now.millisecondsSinceEpoch}_3',
        type: OpportunityType.teaching,
        title: 'Help student with homework',
        titleBn: 'ছাত্রকে হোমওয়ার্কে সাহায্য করুন',
        description: 'Math tutoring, 30 mins',
        descriptionBn: 'গণিত টিউশন, ৩০ মিনিট',
        pickupLat: context.latitude + (random.nextDouble() - 0.5) * 0.008,
        pickupLng: context.longitude + (random.nextDouble() - 0.5) * 0.008,
        pickupAddress: 'Student\'s home',
        earning: 150 + random.nextInt(100).toDouble(),
        estimatedMinutes: 30,
        distanceKm: 0.5 + random.nextDouble() * 0.5,
        expiresAt: now.add(const Duration(hours: 2)),
        requiredRole: 'any',
        requiredSkills: ['teaching', 'math'],
        difficultyLevel: 2,
      ),
    ];
  }
}
