/// 🌉 Navigation Context System
/// 
/// Neural Architecture V8 - Phase 5: Contextual Bridges
/// 
/// This system tracks where users came from during navigation,
/// allowing screens to adapt their UI based on origin context.
/// 
/// Philosophy: "Every screen remembers its story"

/// Navigation context types
enum NavigationContext {
  /// User came from watching a Reel/Vibe
  fromReel,
  
  /// User came from a Bid event card
  fromBid,
  
  /// User came from search results
  fromSearch,
  
  /// User came from a chat conversation
  fromChat,
  
  /// User came from general feed (Home tab)
  fromFeed,
  
  /// User came from marketplace listing
  fromMarketplace,
  
  /// User came from squad/group context
  fromSquad,
  
  /// Direct navigation (no context)
  fromNone;
  
  /// Parse context from query parameter string
  static NavigationContext fromString(String? value) {
    if (value == null || value.isEmpty) return NavigationContext.fromNone;
    
    switch (value.toLowerCase()) {
      case 'from_reel':
      case 'reel':
        return NavigationContext.fromReel;
        
      case 'from_bid':
      case 'bid':
        return NavigationContext.fromBid;
        
      case 'from_search':
      case 'search':
        return NavigationContext.fromSearch;
        
      case 'from_chat':
      case 'chat':
        return NavigationContext.fromChat;
        
      case 'from_feed':
      case 'feed':
        return NavigationContext.fromFeed;
        
      case 'from_marketplace':
      case 'marketplace':
        return NavigationContext.fromMarketplace;
        
      case 'from_squad':
      case 'squad':
        return NavigationContext.fromSquad;
        
      default:
        return NavigationContext.fromNone;
    }
  }
  
  /// Convert to query parameter string
  String toQueryParam() {
    switch (this) {
      case NavigationContext.fromReel:
        return 'from_reel';
      case NavigationContext.fromBid:
        return 'from_bid';
      case NavigationContext.fromSearch:
        return 'from_search';
      case NavigationContext.fromChat:
        return 'from_chat';
      case NavigationContext.fromFeed:
        return 'from_feed';
      case NavigationContext.fromMarketplace:
        return 'from_marketplace';
      case NavigationContext.fromSquad:
        return 'from_squad';
      case NavigationContext.fromNone:
        return '';
    }
  }
  
  /// Get human-readable label
  String get label {
    switch (this) {
      case NavigationContext.fromReel:
        return 'From Reel';
      case NavigationContext.fromBid:
        return 'From Bid Event';
      case NavigationContext.fromSearch:
        return 'From Search';
      case NavigationContext.fromChat:
        return 'From Chat';
      case NavigationContext.fromFeed:
        return 'From Feed';
      case NavigationContext.fromMarketplace:
        return 'From Marketplace';
      case NavigationContext.fromSquad:
        return 'From Squad';
      case NavigationContext.fromNone:
        return '';
    }
  }
  
  /// Check if context has visual indicator
  bool get hasVisualIndicator {
    return this != NavigationContext.fromNone;
  }
}

/// Context data model
/// 
/// Carries all contextual information during navigation
class NavigationContextData {
  /// The type of navigation context
  final NavigationContext context;
  
  /// ID of the contextual item (e.g., productId, bidId, reelId)
  final String? itemId;
  
  /// Optional metadata for additional context
  final Map<String, dynamic>? metadata;
  
  const NavigationContextData({
    required this.context,
    this.itemId,
    this.metadata,
  });
  
  /// Create empty context (no origin)
  factory NavigationContextData.none() {
    return const NavigationContextData(
      context: NavigationContext.fromNone,
    );
  }
  
  /// Create from query parameters
  factory NavigationContextData.fromQueryParams(Map<String, String> params) {
    final origin = params['origin'];
    final itemId = params['itemId'];
    
    return NavigationContextData(
      context: NavigationContext.fromString(origin),
      itemId: itemId,
    );
  }
  
  /// Convert to query parameters
  Map<String, String> toQueryParams() {
    final params = <String, String>{};
    
    if (context != NavigationContext.fromNone) {
      params['origin'] = context.toQueryParam();
    }
    
    if (itemId != null && itemId!.isNotEmpty) {
      params['itemId'] = itemId!;
    }
    
    return params;
  }
  
  /// Build URI with context params
  String buildUri(String basePath) {
    final params = toQueryParams();
    if (params.isEmpty) return basePath;
    
    final queryString = params.entries
        .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
        .join('&');
    
    return '$basePath?$queryString';
  }
  
  /// Check if has valid context
  bool get hasContext => context != NavigationContext.fromNone;
  
  /// Copy with modifications
  NavigationContextData copyWith({
    NavigationContext? context,
    String? itemId,
    Map<String, dynamic>? metadata,
  }) {
    return NavigationContextData(
      context: context ?? this.context,
      itemId: itemId ?? this.itemId,
      metadata: metadata ?? this.metadata,
    );
  }
  
  @override
  String toString() {
    return 'NavigationContextData(context: ${context.label}, itemId: $itemId)';
  }
}

/// Helper extension for easy navigation with context
extension ContextualNavigation on String {
  /// Build path with context data
  String withContext(NavigationContextData contextData) {
    return contextData.buildUri(this);
  }
}
