import 'package:flutter/foundation.dart';
import 'package:rizik_v4/data/models/virtual_storefront.dart';
import 'package:rizik_v4/data/models/user_profile.dart';
import 'package:rizik_v4/data/remote/virtual_storefront_service.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';
import 'package:rizik_v4/core/state/profile_provider.dart';

/// Provider for managing virtual storefronts
/// Handles store operations, inventory sync, and filtering
class VirtualStorefrontProvider extends ChangeNotifier {
  final VirtualStorefrontService _service = VirtualStorefrontService();
  
  // State
  List<VirtualStorefront> _allStorefronts = [];
  List<VirtualStorefront> _filteredStorefronts = [];
  VirtualStorefront? _currentStorefront; // For partner viewing their own store
  bool _isLoading = false;
  String? _error;

  // Filters
  String _searchQuery = '';
  String? _categoryFilter;
  double? _minRating;
  double? _maxDistance;
  bool _openOnly = false;
  StoreStatus? _statusFilter;

  // Getters
  List<VirtualStorefront> get allStorefronts => _allStorefronts;
  List<VirtualStorefront> get filteredStorefronts => _filteredStorefronts;
  VirtualStorefront? get currentStorefront => _currentStorefront;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String get searchQuery => _searchQuery;
  String? get categoryFilter => _categoryFilter;
  double? get minRating => _minRating;
  double? get maxDistance => _maxDistance;
  bool get openOnly => _openOnly;

  /// Initialize with mock data
  void initialize() {
    _allStorefronts = _generateMockStorefronts();
    _filteredStorefronts = List.from(_allStorefronts);
    notifyListeners();
  }

  /// Create storefront for partner
  Future<VirtualStorefront> createStorefront({
    required UserProfile partner,
    String? businessName,
    String? category,
    String? description,
    String? storeImage,
    String? businessHours,
    double? latitude,
    double? longitude,
    String? address,
  }) async {
    try {
      _isLoading = true;
      _error = null;
      notifyListeners();

      final storefront = _service.createStorefrontFromPartner(
        partner: partner,
        businessName: businessName,
        category: category,
        description: description,
        storeImage: storeImage,
        businessHours: businessHours,
        latitude: latitude,
        longitude: longitude,
        address: address,
      );

      _allStorefronts.add(storefront);
      _currentStorefront = storefront;
      _applyFilters();

      _isLoading = false;
      notifyListeners();

      return storefront;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      rethrow;
    }
  }

  /// Get storefront by partner ID
  VirtualStorefront? getStorefrontByPartnerId(String partnerId) {
    try {
      return _allStorefronts.firstWhere((s) => s.partnerId == partnerId);
    } catch (e) {
      return null;
    }
  }

  /// Get storefront by ID
  VirtualStorefront? getStorefrontById(String storefrontId) {
    try {
      return _allStorefronts.firstWhere((s) => s.id == storefrontId);
    } catch (e) {
      return null;
    }
  }

  /// Update store status
  void updateStoreStatus({
    required String storefrontId,
    required StoreStatus status,
  }) {
    final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
    if (index != -1) {
      final updated = _service.updateStoreStatus(
        storefront: _allStorefronts[index],
        status: status,
      );
      _allStorefronts[index] = updated;
      
      if (_currentStorefront?.id == storefrontId) {
        _currentStorefront = updated;
      }
      
      _applyFilters();
      notifyListeners();
    }
  }

  /// Sync inventory from Khata OS
  Future<void> syncInventory({
    required String storefrontId,
    required KhataProvider khataProvider,
  }) async {
    try {
      final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
      if (index == -1) return;

      final updated = await _service.syncInventoryFromKhata(
        storefront: _allStorefronts[index],
        khataProvider: khataProvider,
      );

      _allStorefronts[index] = updated;
      
      if (_currentStorefront?.id == storefrontId) {
        _currentStorefront = updated;
      }

      _applyFilters();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }

  /// Update item quantity
  void updateItemQuantity({
    required String storefrontId,
    required String foodId,
    required int quantity,
  }) {
    final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
    if (index != -1) {
      final updated = _service.updateItemQuantity(
        storefront: _allStorefronts[index],
        foodId: foodId,
        quantity: quantity,
      );
      _allStorefronts[index] = updated;
      
      if (_currentStorefront?.id == storefrontId) {
        _currentStorefront = updated;
      }
      
      notifyListeners();
    }
  }

  /// Deduct item quantity (on order placement)
  void deductItemQuantity({
    required String storefrontId,
    required String foodId,
    required int quantity,
  }) {
    final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
    if (index != -1) {
      try {
        final updated = _service.deductItemQuantity(
          storefront: _allStorefronts[index],
          foodId: foodId,
          quantityToDeduct: quantity,
        );
        _allStorefronts[index] = updated;
        
        if (_currentStorefront?.id == storefrontId) {
          _currentStorefront = updated;
        }
        
        notifyListeners();
      } catch (e) {
        _error = e.toString();
        notifyListeners();
        rethrow;
      }
    }
  }

  /// Increment active orders
  void incrementActiveOrders(String storefrontId) {
    final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
    if (index != -1) {
      final updated = _service.incrementActiveOrders(_allStorefronts[index]);
      _allStorefronts[index] = updated;
      
      if (_currentStorefront?.id == storefrontId) {
        _currentStorefront = updated;
      }
      
      _applyFilters();
      notifyListeners();
    }
  }

  /// Decrement active orders
  void decrementActiveOrders(String storefrontId) {
    final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
    if (index != -1) {
      final updated = _service.decrementActiveOrders(_allStorefronts[index]);
      _allStorefronts[index] = updated;
      
      if (_currentStorefront?.id == storefrontId) {
        _currentStorefront = updated;
      }
      
      _applyFilters();
      notifyListeners();
    }
  }

  /// Update performance metrics
  void updatePerformanceMetrics({
    required String storefrontId,
    double? rating,
    int? reviewCount,
    int? totalOrders,
    double? conversionRate,
    double? averagePreparationTime,
    double? onTimeDeliveryRate,
  }) {
    final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
    if (index != -1) {
      final updated = _service.updatePerformanceMetrics(
        storefront: _allStorefronts[index],
        rating: rating,
        reviewCount: reviewCount,
        totalOrders: totalOrders,
        conversionRate: conversionRate,
        averagePreparationTime: averagePreparationTime,
        onTimeDeliveryRate: onTimeDeliveryRate,
      );
      _allStorefronts[index] = updated;
      
      if (_currentStorefront?.id == storefrontId) {
        _currentStorefront = updated;
      }
      
      _applyFilters();
      notifyListeners();
    }
  }

  /// Update Trust Score and Aura
  void updateTrustAndAura({
    required String storefrontId,
    required double trustScore,
    required int auraLevel,
  }) {
    final index = _allStorefronts.indexWhere((s) => s.id == storefrontId);
    if (index != -1) {
      final updated = _service.updateTrustAndAura(
        storefront: _allStorefronts[index],
        trustScore: trustScore,
        auraLevel: auraLevel,
      );
      _allStorefronts[index] = updated;
      
      if (_currentStorefront?.id == storefrontId) {
        _currentStorefront = updated;
      }
      
      _applyFilters();
      notifyListeners();
    }
  }

  /// Set search query
  void setSearchQuery(String query) {
    _searchQuery = query;
    _applyFilters();
    notifyListeners();
  }

  /// Set category filter
  void setCategoryFilter(String? category) {
    _categoryFilter = category;
    _applyFilters();
    notifyListeners();
  }

  /// Set minimum rating filter
  void setMinRating(double? rating) {
    _minRating = rating;
    _applyFilters();
    notifyListeners();
  }

  /// Set maximum distance filter
  void setMaxDistance(double? distance) {
    _maxDistance = distance;
    _applyFilters();
    notifyListeners();
  }

  /// Set open only filter
  void setOpenOnly(bool openOnly) {
    _openOnly = openOnly;
    _applyFilters();
    notifyListeners();
  }

  /// Set status filter
  void setStatusFilter(StoreStatus? status) {
    _statusFilter = status;
    _applyFilters();
    notifyListeners();
  }

  /// Clear all filters
  void clearFilters() {
    _searchQuery = '';
    _categoryFilter = null;
    _minRating = null;
    _maxDistance = null;
    _openOnly = false;
    _statusFilter = null;
    _applyFilters();
    notifyListeners();
  }

  /// Get stores sorted by score
  List<VirtualStorefront> getStoresByScore({
    double? userLatitude,
    double? userLongitude,
  }) {
    final stores = List<VirtualStorefront>.from(_filteredStorefronts);
    stores.sort((a, b) {
      final scoreA = _service.calculateStoreScore(
        storefront: a,
        userLatitude: userLatitude,
        userLongitude: userLongitude,
      );
      final scoreB = _service.calculateStoreScore(
        storefront: b,
        userLatitude: userLatitude,
        userLongitude: userLongitude,
      );
      return scoreB.compareTo(scoreA);
    });
    return stores;
  }

  /// Get stores by category
  List<VirtualStorefront> getStoresByCategory(String category) {
    return _filteredStorefronts
        .where((s) => s.category == category)
        .toList();
  }

  /// Get open stores
  List<VirtualStorefront> getOpenStores() {
    return _filteredStorefronts
        .where((s) => s.isOpen)
        .toList();
  }

  /// Get verified stores
  List<VirtualStorefront> getVerifiedStores() {
    return _filteredStorefronts
        .where((s) => s.isVerified)
        .toList();
  }

  /// Get stores needing inventory sync
  List<VirtualStorefront> getStoresNeedingSync() {
    return _allStorefronts
        .where((s) => _service.needsInventorySync(s))
        .toList();
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  void _applyFilters() {
    var filtered = List<VirtualStorefront>.from(_allStorefronts);

    // Search query
    if (_searchQuery.isNotEmpty) {
      final query = _searchQuery.toLowerCase();
      filtered = filtered.where((s) {
        return s.storeName.toLowerCase().contains(query) ||
               s.partnerName.toLowerCase().contains(query) ||
               s.category.toLowerCase().contains(query) ||
               (s.description?.toLowerCase().contains(query) ?? false);
      }).toList();
    }

    // Category filter
    if (_categoryFilter != null) {
      filtered = filtered.where((s) => s.category == _categoryFilter).toList();
    }

    // Rating filter
    if (_minRating != null) {
      filtered = filtered.where((s) => s.rating >= _minRating!).toList();
    }

    // Open only filter
    if (_openOnly) {
      filtered = filtered.where((s) => s.isOpen).toList();
    }

    // Status filter
    if (_statusFilter != null) {
      filtered = filtered.where((s) => s.status == _statusFilter).toList();
    }

    _filteredStorefronts = filtered;
  }

  List<VirtualStorefront> _generateMockStorefronts() {
    final now = DateTime.now();
    return [
      VirtualStorefront(
        id: 'store_1',
        partnerId: 'partner_1',
        partnerName: 'Rahim Mia',
        partnerAvatar: 'assets/images/avatar_male.png',
        storeName: 'Rahim\'s Kitchen',
        category: 'Bengali Food',
        tags: ['Biryani', 'Curry', 'Rice'],
        trustScore: 4.5,
        auraLevel: 8,
        rating: 4.7,
        reviewCount: 234,
        totalOrders: 1250,
        status: StoreStatus.open,
        businessHours: '9 AM - 9 PM',
        isVerified: true,
        inventoryMap: {'food_1': 20, 'food_2': 15, 'food_3': 3},
        lastInventorySync: now,
        hasLowStock: true,
        createdAt: now.subtract(const Duration(days: 180)),
        lastUpdated: now,
      ),
      VirtualStorefront(
        id: 'store_2',
        partnerId: 'partner_2',
        partnerName: 'Fatima Begum',
        partnerAvatar: 'assets/images/avatar_female.png',
        storeName: 'Fatima\'s Homemade',
        category: 'Home Cooking',
        tags: ['Healthy', 'Fresh', 'Homemade'],
        trustScore: 4.8,
        auraLevel: 10,
        rating: 4.9,
        reviewCount: 456,
        totalOrders: 2100,
        status: StoreStatus.open,
        businessHours: '8 AM - 8 PM',
        isVerified: true,
        inventoryMap: {'food_4': 10, 'food_5': 25},
        lastInventorySync: now,
        createdAt: now.subtract(const Duration(days: 365)),
        lastUpdated: now,
      ),
      VirtualStorefront(
        id: 'store_3',
        partnerId: 'partner_3',
        partnerName: 'Karim Bhai',
        partnerAvatar: 'assets/images/avatar_male.png',
        storeName: 'Karim\'s Fast Food',
        category: 'Fast Food',
        tags: ['Burger', 'Pizza', 'Quick'],
        trustScore: 3.8,
        auraLevel: 5,
        rating: 4.2,
        reviewCount: 123,
        totalOrders: 580,
        status: StoreStatus.busy,
        businessHours: '11 AM - 11 PM',
        inventoryMap: {'food_6': 30, 'food_7': 20},
        lastInventorySync: now,
        activeOrders: 12,
        createdAt: now.subtract(const Duration(days: 90)),
        lastUpdated: now,
      ),
    ];
  }
}
