import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/bazar_feed_item.dart';
import 'package:rizik_v4/data/remote/role_context_manager.dart';
import 'dart:math' as math;

/// Engine for filtering and ranking Bazar Tab feed items based on role and context
/// This is the content discovery system for the Bazar Tab
class BazarFeedEngine {
  final RoleContextManager _contextManager;

  BazarFeedEngine({
    required RoleContextManager contextManager,
  }) : _contextManager = contextManager;

  // ============================================================================
  // ROLE-BASED CONTENT FILTERING
  // ============================================================================

  /// Filter feed items based on current role
  /// This is the main entry point for feed generation
  List<BazarFeedItem> filterContentByRole(List<BazarFeedItem> allItems) {
    final currentRole = _contextManager.currentRole;
    final trustScore = _contextManager.trustScoreValue;

    // Filter by role targeting
    final roleFiltered = allItems.where((item) {
      return item.targetRoles.contains(currentRole);
    }).toList();

    // Filter by Trust Score requirement
    final trustFiltered = roleFiltered.where((item) {
      return trustScore >= item.minTrustScore;
    }).toList();

    // Filter by hyperlocal proximity (if location available)
    final locationFiltered = _filterByLocation(trustFiltered);

    debugPrint('🎯 Feed filtered: ${allItems.length} → ${locationFiltered.length} items');
    debugPrint('   Role: $currentRole, Trust Score: $trustScore');

    return locationFiltered;
  }

  /// Get Consumer-specific feed items
  List<BazarFeedItem> getConsumerFeed(List<BazarFeedItem> allItems) {
    return allItems.where((item) {
      // Consumer sees: Food, Stores, Services, Videos
      return item.type == FeedItemType.food ||
             item.type == FeedItemType.store ||
             item.type == FeedItemType.service ||
             item.type == FeedItemType.video;
    }).toList();
  }

  /// Get Partner-specific feed items
  List<BazarFeedItem> getPartnerFeed(List<BazarFeedItem> allItems) {
    return allItems.where((item) {
      // Partner sees: Bid Requests, Unclaimed Orders, Inventory Alerts
      return item.type == FeedItemType.bidRequest;
    }).toList();
  }

  /// Get Rider-specific feed items
  List<BazarFeedItem> getRiderFeed(List<BazarFeedItem> allItems) {
    return allItems.where((item) {
      // Rider sees: Delivery Missions, Mission Chains
      return item.type == FeedItemType.mission;
    }).toList();
  }

  // ============================================================================
  // TRUST SCORE ACCESS CONTROL
  // ============================================================================

  /// Check if user can access a specific feed item
  bool canAccessItem(BazarFeedItem item) {
    // Check role targeting
    if (!item.targetRoles.contains(_contextManager.currentRole)) {
      return false;
    }

    // Check Trust Score requirement
    if (_contextManager.trustScoreValue < item.minTrustScore) {
      return false;
    }

    return true;
  }

  /// Filter items by Trust Score access control
  List<BazarFeedItem> filterByTrustScore(
    List<BazarFeedItem> items,
    double minScore,
  ) {
    return items.where((item) {
      return _contextManager.trustScoreValue >= minScore;
    }).toList();
  }

  /// Get items that are locked for current user
  List<BazarFeedItem> getLockedItems(List<BazarFeedItem> allItems) {
    return allItems.where((item) => !canAccessItem(item)).toList();
  }

  /// Get unlock requirements for a locked item
  Map<String, dynamic> getItemUnlockRequirements(BazarFeedItem item) {
    final currentTrustScore = _contextManager.trustScoreValue;
    final requiredTrustScore = item.minTrustScore;
    final currentRole = _contextManager.currentRole;
    final targetRoles = item.targetRoles;

    return {
      'isLocked': !canAccessItem(item),
      'currentTrustScore': currentTrustScore,
      'requiredTrustScore': requiredTrustScore,
      'trustScoreGap': math.max(0, requiredTrustScore - currentTrustScore),
      'currentRole': currentRole,
      'targetRoles': targetRoles,
      'needsRoleSwitch': !targetRoles.contains(currentRole),
      'itemType': item.type,
    };
  }

  // ============================================================================
  // HYPERLOCAL GEO-FILTERING
  // ============================================================================

  /// Filter items by location proximity
  List<BazarFeedItem> _filterByLocation(List<BazarFeedItem> items) {
    if (!_contextManager.hasLocation) {
      return items; // No location filtering if location unavailable
    }

    final (userLat, userLon) = _contextManager.currentLocation;
    if (userLat == null || userLon == null) return items;

    // Filter items within reasonable distance (default 10km)
    return items.where((item) {
      final distance = item.distanceFrom(userLat, userLon);
      if (distance == null) return true; // Include items without location
      return distance <= 10.0; // 10km radius
    }).toList();
  }

  /// Filter items by specific radius
  List<BazarFeedItem> filterByRadius(
    List<BazarFeedItem> items,
    double radiusKm,
  ) {
    if (!_contextManager.hasLocation) {
      return items;
    }

    final (userLat, userLon) = _contextManager.currentLocation;
    if (userLat == null || userLon == null) return items;

    return items.where((item) {
      final distance = item.distanceFrom(userLat, userLon);
      if (distance == null) return true;
      return distance <= radiusKm;
    }).toList();
  }

  /// Sort items by distance (nearest first)
  List<BazarFeedItem> sortByDistance(List<BazarFeedItem> items) {
    if (!_contextManager.hasLocation) {
      return items;
    }

    final (userLat, userLon) = _contextManager.currentLocation;
    if (userLat == null || userLon == null) return items;

    final itemsWithDistance = items.map((item) {
      final distance = item.distanceFrom(userLat, userLon);
      return (item, distance);
    }).toList();

    itemsWithDistance.sort((a, b) {
      final distA = a.$2 ?? double.infinity;
      final distB = b.$2 ?? double.infinity;
      return distA.compareTo(distB);
    });

    return itemsWithDistance.map((tuple) => tuple.$1).toList();
  }

  // ============================================================================
  // FEED RANKING ALGORITHM
  // ============================================================================

  /// Calculate feed item score for ranking
  /// Higher score = higher priority in feed
  double calculateFeedItemScore(BazarFeedItem item) {
    double score = 100.0; // Base score

    // 1. Distance penalty (hyperlocal priority)
    final distance = _getItemDistance(item);
    if (distance != null) {
      // Closer items get higher scores
      // 0km = +50, 1km = +40, 2km = +30, 5km = +10, 10km = 0
      final distanceBoost = math.max(0, 50 - (distance * 5));
      score += distanceBoost;
    }

    // 2. Trust Score compatibility boost
    final trustScoreBoost = _calculateTrustScoreBoost(item);
    score += trustScoreBoost;

    // 3. Aura level boost
    final auraBoost = _calculateAuraBoost(item);
    score += auraBoost;

    // 4. Recency boost
    final recencyBoost = _calculateRecencyBoost(item);
    score += recencyBoost;

    // 5. Engagement boost (for items with engagement metrics)
    final engagementBoost = _calculateEngagementBoost(item);
    score += engagementBoost;

    return score;
  }

  /// Rank feed items by calculated score
  List<BazarFeedItem> rankFeedItems(List<BazarFeedItem> items) {
    final itemsWithScores = items.map((item) {
      final score = calculateFeedItemScore(item);
      return (item, score);
    }).toList();

    itemsWithScores.sort((a, b) => b.$2.compareTo(a.$2)); // Descending order

    debugPrint('📊 Feed ranked: ${items.length} items');
    if (itemsWithScores.isNotEmpty) {
      debugPrint('   Top score: ${itemsWithScores.first.$2.toStringAsFixed(1)}');
      debugPrint('   Bottom score: ${itemsWithScores.last.$2.toStringAsFixed(1)}');
    }

    return itemsWithScores.map((tuple) => tuple.$1).toList();
  }

  // ============================================================================
  // SCORING HELPERS
  // ============================================================================

  /// Get distance to item
  double? _getItemDistance(BazarFeedItem item) {
    if (!_contextManager.hasLocation) return null;
    final (userLat, userLon) = _contextManager.currentLocation;
    return item.distanceFrom(userLat, userLon);
  }

  /// Calculate Trust Score compatibility boost
  double _calculateTrustScoreBoost(BazarFeedItem item) {
    // Items matching user's Trust Score level get a boost
    final userScore = _contextManager.trustScoreValue;
    final itemMinScore = item.minTrustScore;

    if (userScore >= itemMinScore + 1.0) {
      return 20.0; // Well above requirement
    } else if (userScore >= itemMinScore) {
      return 10.0; // Meets requirement
    } else {
      return 0.0; // Below requirement (shouldn't appear in feed)
    }
  }

  /// Calculate Aura level boost
  double _calculateAuraBoost(BazarFeedItem item) {
    // Higher Aura users get slight boost on all content
    final auraLevel = _contextManager.auraLevel;
    return auraLevel * 2.0; // +2 points per Aura level
  }

  /// Calculate recency boost
  double _calculateRecencyBoost(BazarFeedItem item) {
    final now = DateTime.now();
    final age = now.difference(item.timestamp);

    if (age.inMinutes < 5) {
      return 30.0; // Very fresh (< 5 min)
    } else if (age.inMinutes < 30) {
      return 20.0; // Fresh (< 30 min)
    } else if (age.inHours < 2) {
      return 10.0; // Recent (< 2 hours)
    } else if (age.inHours < 24) {
      return 5.0; // Today
    } else {
      return 0.0; // Old
    }
  }

  /// Calculate engagement boost
  double _calculateEngagementBoost(BazarFeedItem item) {
    // Type-specific engagement metrics
    if (item is FoodFeedItem) {
      return item.rating * 5.0; // +5 per rating star
    } else if (item is BidRequestFeedItem) {
      return item.bidCount * 2.0; // +2 per bid
    } else if (item is StoreFeedItem) {
      return item.rating * 3.0; // +3 per rating star
    }
    return 0.0;
  }

  // ============================================================================
  // ENGAGEMENT TRACKING
  // ============================================================================

  /// Track user engagement with feed item
  void trackEngagement({
    required BazarFeedItem item,
    required String engagementType, // 'view', 'like', 'share', 'order'
  }) {
    debugPrint('📈 Engagement tracked: ${item.id} - $engagementType');
    
    // In production, this would:
    // 1. Update item engagement metrics
    // 2. Update user personalization profile
    // 3. Send analytics event
    // 4. Adjust future feed ranking
  }

  /// Track feed item view
  void trackView(BazarFeedItem item) {
    trackEngagement(item: item, engagementType: 'view');
  }

  /// Track feed item interaction
  void trackInteraction(BazarFeedItem item, String interactionType) {
    trackEngagement(item: item, engagementType: interactionType);
  }

  // ============================================================================
  // FEED REFRESH
  // ============================================================================

  /// Refresh feed with new content
  /// In production, this would fetch from backend
  Future<List<BazarFeedItem>> refreshFeed({
    List<BazarFeedItem>? cachedItems,
    bool forceRefresh = false,
  }) async {
    debugPrint('🔄 Refreshing feed...');

    // In production:
    // 1. Fetch new items from backend
    // 2. Merge with cached items
    // 3. Apply filters and ranking
    // 4. Return sorted feed

    // For now, return cached items or empty list
    if (cachedItems != null && !forceRefresh) {
      return filterContentByRole(cachedItems);
    }

    return [];
  }

  // ============================================================================
  // FEED STATISTICS
  // ============================================================================

  /// Get feed statistics
  Map<String, dynamic> getFeedStats(List<BazarFeedItem> items) {
    final typeCount = <FeedItemType, int>{};
    for (final item in items) {
      typeCount[item.type] = (typeCount[item.type] ?? 0) + 1;
    }

    final avgDistance = _calculateAverageDistance(items);

    return {
      'totalItems': items.length,
      'itemsByType': typeCount.map((k, v) => MapEntry(k.name, v)),
      'averageDistance': avgDistance,
      'hasLocation': _contextManager.hasLocation,
      'currentRole': _contextManager.currentRole.displayName,
      'trustScore': _contextManager.trustScoreValue,
    };
  }

  /// Calculate average distance of items
  double? _calculateAverageDistance(List<BazarFeedItem> items) {
    if (!_contextManager.hasLocation) return null;

    final distances = items
        .map((item) => _getItemDistance(item))
        .whereType<double>()
        .toList();

    if (distances.isEmpty) return null;

    return distances.reduce((a, b) => a + b) / distances.length;
  }
}
