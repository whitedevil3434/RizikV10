import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/dam_komao.dart';
import 'package:rizik_v4/data/models/user_profile.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/models/user_role.dart';

/// Service for handling Dam Komao notifications
/// Manages partner targeting and push notifications for haggling requests
class DamKomaoNotificationService {
  // Mock partner database for simulation
  // In production, this would be a backend query
  final List<UserProfile> _mockPartners = [
    _buildPartnerProfile(
      id: 'partner_1',
      name: 'Karim Kitchen',
      trust: 4.5,
      txCount: 150,
      onTimeRate: 0.95,
      avgRating: 4.8,
    ),
    _buildPartnerProfile(
      id: 'partner_2',
      name: 'Dhaka Biryani House',
      trust: 3.8,
      txCount: 80,
      onTimeRate: 0.85,
      avgRating: 4.2,
    ),
    _buildPartnerProfile(
      id: 'partner_3',
      name: 'Spicy Corner',
      trust: 2.5,
      txCount: 20,
      onTimeRate: 0.70,
      avgRating: 3.5,
    ),
  ];

  static UserProfile _buildPartnerProfile({
    required String id,
    required String name,
    required double trust,
    required int txCount,
    required double onTimeRate,
    required double avgRating,
  }) {
    return UserProfile(
      id: id,
      name: name,
      roleAvatars: const {
        UserRole.consumer: 'placeholder_female',
        UserRole.partner: 'placeholder_male',
        UserRole.rider: 'placeholder_male',
      },
      roleTitles: const {
        UserRole.consumer: 'Consumer',
        UserRole.partner: 'Partner',
        UserRole.rider: 'Rider',
      },
      trustScore: TrustScore(
        userId: id,
        overall: trust,
        categories: const {},
        totalTransactions: txCount,
        onTimeRate: onTimeRate,
        averageRating: avgRating,
        badges: const [],
        lastUpdated: DateTime.now(),
        recentEvents: const [],
      ),
    );
  }

  /// Notify nearby partners about a new haggling request
  Future<List<String>> notifyPartners(DamKomaoRequest request) async {
    debugPrint('🔔 Starting partner notification for request: ${request.id}');
    
    // 1. Find eligible partners
    final eligiblePartners = _findEligiblePartners(request);
    
    // 2. Sort by relevance (Trust Score, etc.)
    _sortPartnersByRelevance(eligiblePartners);
    
    // 3. Select top N partners
    final selectedPartners = eligiblePartners.take(10).toList();
    
    // 4. Send notifications (simulated)
    final notifiedPartnerIds = <String>[];
    for (final partner in selectedPartners) {
      final success = await _sendPushNotification(partner, request);
      if (success) {
        notifiedPartnerIds.add(partner.id);
      }
    }
    
    debugPrint('✅ Notified ${notifiedPartnerIds.length} partners');
    return notifiedPartnerIds;
  }

  /// Find partners who match the request criteria
  List<UserProfile> _findEligiblePartners(DamKomaoRequest request) {
    return _mockPartners.where((partner) {
      // Must have partner role metadata present.
      if (!partner.roleTitles.containsKey(UserRole.partner)) return false;
      
      // Must have minimum Trust Score (2.0)
      if ((partner.trustScore?.overall ?? 0) < 2.0) return false;
      
      // TODO: Check if partner offers items in this category
      // TODO: Check if partner is within radius (geo-query)
      
      return true;
    }).toList();
  }

  /// Sort partners to prioritize high-trust and reliable ones
  void _sortPartnersByRelevance(List<UserProfile> partners) {
    partners.sort((a, b) {
      // Primary sort: Trust Score
      final trustDiff = (b.trustScore?.overall ?? 0).compareTo(a.trustScore?.overall ?? 0);
      if (trustDiff != 0) return trustDiff;
      
      // Secondary sort: Total Transactions
      return (b.trustScore?.totalTransactions ?? 0)
          .compareTo(a.trustScore?.totalTransactions ?? 0);
    });
  }

  /// Simulate sending a push notification
  Future<bool> _sendPushNotification(UserProfile partner, DamKomaoRequest request) async {
    // Simulate network delay
    await Future.delayed(const Duration(milliseconds: 100));
    
    debugPrint('   📱 Notification sent to ${partner.name} (${partner.id})');
    debugPrint('      "New Bid Request: ${request.itemName} for ৳${request.targetPrice}"');
    
    return true;
  }
}
