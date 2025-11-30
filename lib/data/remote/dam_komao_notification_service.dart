import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/dam_komao.dart';
import 'package:rizik_v4/data/models/user_profile.dart';
import 'package:rizik_v4/data/models/trust_score.dart';

/// Service for handling Dam Komao notifications
/// Manages partner targeting and push notifications for haggling requests
class DamKomaoNotificationService {
  // Mock partner database for simulation
  // In production, this would be a backend query
  final List<UserProfile> _mockPartners = [
    UserProfile(
      id: 'partner_1',
      name: 'Karim Kitchen',
      phoneNumber: '+8801700000001',
      role: UserRole.partner,
      trustScore: const TrustScore(
        overall: 4.5,
        categories: {},
        totalTransactions: 150,
        onTimeRate: 0.95,
        averageRating: 4.8,
        badges: [],
        lastUpdated: null, // Will be set in constructor
        recentEvents: [],
      ),
      joinedAt: DateTime.now(),
    ),
    UserProfile(
      id: 'partner_2',
      name: 'Dhaka Biryani House',
      phoneNumber: '+8801700000002',
      role: UserRole.partner,
      trustScore: const TrustScore(
        overall: 3.8,
        categories: {},
        totalTransactions: 80,
        onTimeRate: 0.85,
        averageRating: 4.2,
        badges: [],
        lastUpdated: null,
        recentEvents: [],
      ),
      joinedAt: DateTime.now(),
    ),
    UserProfile(
      id: 'partner_3',
      name: 'Spicy Corner',
      phoneNumber: '+8801700000003',
      role: UserRole.partner,
      trustScore: const TrustScore(
        overall: 2.5,
        categories: {},
        totalTransactions: 20,
        onTimeRate: 0.70,
        averageRating: 3.5,
        badges: [],
        lastUpdated: null,
        recentEvents: [],
      ),
      joinedAt: DateTime.now(),
    ),
  ];

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
      // Must be a partner
      if (partner.role != UserRole.partner) return false;
      
      // Must have minimum Trust Score (2.0)
      if (partner.trustScore.overall < 2.0) return false;
      
      // TODO: Check if partner offers items in this category
      // TODO: Check if partner is within radius (geo-query)
      
      return true;
    }).toList();
  }

  /// Sort partners to prioritize high-trust and reliable ones
  void _sortPartnersByRelevance(List<UserProfile> partners) {
    partners.sort((a, b) {
      // Primary sort: Trust Score
      final trustDiff = b.trustScore.overall.compareTo(a.trustScore.overall);
      if (trustDiff != 0) return trustDiff;
      
      // Secondary sort: Total Transactions
      return b.trustScore.totalTransactions.compareTo(a.trustScore.totalTransactions);
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
