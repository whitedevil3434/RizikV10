import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'dart:async';
import 'package:rizik_v4/data/models/order.dart';
import 'package:rizik_v4/data/models/moneybag.dart';
import 'package:rizik_v4/data/models/khata_entry.dart';
import 'package:rizik_v4/data/models/mission_chain.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/moneybag_provider.dart';
import 'package:rizik_v4/features/seeker/household/logic/khata_provider.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/order_provider.dart';
import 'package:rizik_v4/core/state/aura_provider.dart';
import 'package:rizik_v4/features/social/tribunal/logic/trust_score_provider.dart';
import 'package:rizik_v4/data/remote/mission_chain_detector.dart';

/// Provider for managing rider-side mission operations
/// Handles mission acceptance, rejection, and real-time mission offers
class RiderMissionProvider with ChangeNotifier {
  List<Map<String, dynamic>> _availableMissions = [];
  List<Map<String, dynamic>> _acceptedMissions = [];
  List<Map<String, dynamic>> _completedMissions = [];
  List<MissionChain> _availableChains = []; // Phase 7.4: Mission chains
  List<MissionChain> _acceptedChains = [];
  List<MissionChain> _completedChains = [];
  
  StreamSubscription? _missionsStreamSubscription;
  Timer? _mockMissionTimer;
  final MissionChainDetector _chainDetector = MissionChainDetector();
  
  // Provider dependencies for Phase 7 Task 7.5
  MoneybagProvider? _moneybagProvider;
  KhataProvider? _khataProvider;
  OrderProvider? _orderProvider;
  AuraProvider? _auraProvider;
  TrustScoreProvider? _trustScoreProvider;
  
  List<Map<String, dynamic>> get availableMissions => _availableMissions;
  List<Map<String, dynamic>> get acceptedMissions => _acceptedMissions;
  List<Map<String, dynamic>> get completedMissions => _completedMissions;
  List<MissionChain> get availableChains => _availableChains; // Phase 7.4
  List<MissionChain> get acceptedChains => _acceptedChains;
  List<MissionChain> get completedChains => _completedChains;
  
  int get totalActiveMissions => _acceptedMissions.length + _acceptedChains.length;
  int get totalAvailableMissions => _availableMissions.length + _availableChains.length;

  RiderMissionProvider() {
    _loadMissions();
    _startListeningToMissions();
  }

  // Set provider dependencies (called from UI)
  void setProviders({
    MoneybagProvider? moneybagProvider,
    KhataProvider? khataProvider,
    OrderProvider? orderProvider,
    AuraProvider? auraProvider,
    TrustScoreProvider? trustScoreProvider,
  }) {
    _moneybagProvider = moneybagProvider;
    _khataProvider = khataProvider;
    _orderProvider = orderProvider;
    _auraProvider = auraProvider;
    _trustScoreProvider = trustScoreProvider;
  }

  /// Load missions from local storage
  Future<void> _loadMissions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Load available missions
      final availableJson = prefs.getString('rider_available_missions');
      if (availableJson != null) {
        final List<dynamic> availableList = json.decode(availableJson);
        _availableMissions = availableList
            .map((missionJson) => Map<String, dynamic>.from(missionJson as Map))
            .toList();
      }
      
      // Load accepted missions
      final acceptedJson = prefs.getString('rider_accepted_missions');
      if (acceptedJson != null) {
        final List<dynamic> acceptedList = json.decode(acceptedJson);
        _acceptedMissions = acceptedList
            .map((missionJson) => Map<String, dynamic>.from(missionJson as Map))
            .toList();
      }
      
      // Load completed missions
      final completedJson = prefs.getString('rider_completed_missions');
      if (completedJson != null) {
        final List<dynamic> completedList = json.decode(completedJson);
        _completedMissions = completedList
            .map((missionJson) => Map<String, dynamic>.from(missionJson as Map))
            .toList();
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading rider missions: $e');
    }
  }

  /// Save missions to local storage
  Future<void> _saveMissions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Save available missions
      final availableJson = json.encode(_availableMissions);
      await prefs.setString('rider_available_missions', availableJson);
      
      // Save accepted missions
      final acceptedJson = json.encode(_acceptedMissions);
      await prefs.setString('rider_accepted_missions', acceptedJson);
      
      // Save completed missions
      final completedJson = json.encode(_completedMissions);
      await prefs.setString('rider_completed_missions', completedJson);
    } catch (e) {
      debugPrint('Error saving rider missions: $e');
    }
  }

  /// Accept a mission
  /// Moves mission from available to accepted queue
  Future<bool> acceptMission(String orderId) async {
    try {
      final missionIndex = _availableMissions.indexWhere(
        (mission) => mission['orderId'] == orderId
      );
      
      if (missionIndex == -1) {
        debugPrint('Mission not found: $orderId');
        return false;
      }
      
      // Get the mission and update its status
      final mission = Map<String, dynamic>.from(_availableMissions[missionIndex]);
      mission['status'] = 'accepted';
      mission['acceptedAt'] = DateTime.now().toIso8601String();
      
      // Remove from available
      _availableMissions.removeAt(missionIndex);
      
      // Add to accepted missions
      _acceptedMissions.add(mission);
      
      await _saveMissions();
      notifyListeners();
      
      // In a real app, this would update the backend
      await _updateMissionStatusInBackend(orderId, 'accepted');
      
      debugPrint('Mission accepted: $orderId');
      return true;
    } catch (e) {
      debugPrint('Error accepting mission: $e');
      return false;
    }
  }

  /// Reject a mission
  /// Removes mission from available queue
  Future<bool> rejectMission(String orderId, {String? reason}) async {
    try {
      final missionIndex = _availableMissions.indexWhere(
        (mission) => mission['orderId'] == orderId
      );
      
      if (missionIndex == -1) {
        debugPrint('Mission not found: $orderId');
        return false;
      }
      
      // Remove from available
      _availableMissions.removeAt(missionIndex);
      
      await _saveMissions();
      notifyListeners();
      
      // In a real app, this would update the backend and reassign to another rider
      await _updateMissionStatusInBackend(orderId, 'rejected');
      
      debugPrint('Mission rejected: $orderId, reason: ${reason ?? "Not specified"}');
      return true;
    } catch (e) {
      debugPrint('Error rejecting mission: $e');
      return false;
    }
  }

  /// Start listening to new mission offers stream
  /// In production, this would connect to Supabase real-time subscriptions
  void _startListeningToMissions() {
    // For now, we'll use a mock implementation that simulates incoming missions
    // In production, this would be replaced with:
    // _missionsStreamSubscription = SupabaseConfig.client
    //     .from('orders')
    //     .stream(primaryKey: ['id'])
    //     .eq('status', 'ready_for_pickup')
    //     .listen(_handleNewMission);
    
    _startMockMissionStream();
  }

  /// Mock mission stream for development/demo
  void _startMockMissionStream() {
    // Simulate receiving new missions every 30-60 seconds
    _mockMissionTimer = Timer.periodic(const Duration(seconds: 45), (timer) {
      if (_availableMissions.length < 5) {
        _simulateNewMission();
      }
    });
  }

  /// Simulate a new incoming mission (for demo purposes)
  void _simulateNewMission() {
    final mission = _generateMockMission(_availableMissions.length);
    _availableMissions.insert(0, mission);
    _saveMissions();
    notifyListeners();
    
    debugPrint('New mission available: ${mission['orderId']}');
  }

  /// Generate mock mission data
  Map<String, dynamic> _generateMockMission(int index) {
    final restaurants = [
      {'name': 'বার্গার কিং', 'address': 'ধানমন্ডি ২৭, ঢাকা'},
      {'name': 'পিজা হাট', 'address': 'গুলশান ১, ঢাকা'},
      {'name': 'কেএফসি', 'address': 'বনানী, ঢাকা'},
      {'name': 'সুলতান ডাইন', 'address': 'মিরপুর ১০, ঢাকা'},
      {'name': 'কাচ্চি ভাই', 'address': 'উত্তরা, ঢাকা'},
    ];
    
    final customers = [
      {'name': 'আহমেদ খান', 'address': 'বাড়ি ১২, রোড ৫, ধানমন্ডি'},
      {'name': 'ফাতিমা রহমান', 'address': 'ফ্ল্যাট ৩বি, গুলশান ২'},
      {'name': 'করিম মিয়া', 'address': 'বাড়ি ৮, বনানী'},
      {'name': 'সাবিনা আক্তার', 'address': 'ফ্ল্যাট ৫এ, মিরপুর ১১'},
      {'name': 'রহিম উদ্দিন', 'address': 'বাড়ি ২০, সেক্টর ৭, উত্তরা'},
    ];
    
    final items = [
      ['চিকেন বার্গার x2', 'ফ্রেঞ্চ ফ্রাই', 'কোক'],
      ['পিজা (লার্জ)', 'গার্লিক ব্রেড', 'পেপসি'],
      ['চিকেন বাকেট', 'কোলসল', 'ফ্যান্টা'],
      ['বিফ কালা ভুনা', 'পোলাও', 'সালাদ'],
      ['কাচ্চি বিরিয়ানি x2', 'বোরহানি', 'রায়তা'],
    ];
    
    final restaurantIndex = index % restaurants.length;
    final customerIndex = index % customers.length;
    final itemIndex = index % items.length;
    
    return {
      'isMission': true,
      'orderId': 'R${1001 + index}',
      'restaurantName': restaurants[restaurantIndex]['name'],
      'pickupAddress': restaurants[restaurantIndex]['address'],
      'customerName': customers[customerIndex]['name'],
      'dropoffAddress': customers[customerIndex]['address'],
      'distance': (2.5 + (index % 5) * 0.5).toStringAsFixed(1),
      'estimatedTime': 10 + (index % 5) * 2,
      'reward': 120 + (index % 5) * 20,
      'items': items[itemIndex],
      'otp': '${1234 + index}',
      'status': 'available',
      'createdAt': DateTime.now().toIso8601String(),
    };
  }

  /// Handle new mission from stream
  /// This will be used when Supabase real-time subscriptions are implemented
  // ignore: unused_element
  void _handleNewMission(List<Map<String, dynamic>> data) {
    try {
      for (var missionData in data) {
        // Check if mission is already in the list
        final exists = _availableMissions.any(
          (m) => m['orderId'] == missionData['orderId']
        );
        
        if (!exists) {
          _availableMissions.insert(0, missionData);
          notifyListeners();
          _saveMissions();
          
          debugPrint('New mission received: ${missionData['orderId']}');
        }
      }
    } catch (e) {
      debugPrint('Error handling new mission: $e');
    }
  }

  /// Update mission status in backend (Supabase)
  Future<void> _updateMissionStatusInBackend(String orderId, String status) async {
    try {
      // In production, this would update Supabase:
      // await SupabaseConfig.client
      //     .from('orders')
      //     .update({'rider_status': status})
      //     .eq('id', orderId);
      
      debugPrint('Backend updated: $orderId -> $status');
    } catch (e) {
      debugPrint('Error updating backend: $e');
    }
  }

  /// Get mission by order ID
  Map<String, dynamic>? getMissionById(String orderId) {
    // Check available missions
    try {
      return _availableMissions.firstWhere(
        (m) => m['orderId'] == orderId
      );
    } catch (e) {
      // Not in available, check accepted
      try {
        return _acceptedMissions.firstWhere(
          (m) => m['orderId'] == orderId
        );
      } catch (e) {
        // Not in accepted, check completed
        try {
          return _completedMissions.firstWhere(
            (m) => m['orderId'] == orderId
          );
        } catch (e) {
          return null;
        }
      }
    }
  }

  /// Complete a mission (Phase 7 Task 7.5)
  /// Moves mission from accepted to completed queue
  /// Releases payment to rider, creates Khata entry, updates Trust Scores
  Future<bool> completeMission(String orderId) async {
    try {
      final missionIndex = _acceptedMissions.indexWhere(
        (mission) => mission['orderId'] == orderId
      );
      
      if (missionIndex == -1) {
        debugPrint('Mission not found in accepted queue: $orderId');
        return false;
      }
      
      // Get the mission and update its status
      final mission = Map<String, dynamic>.from(_acceptedMissions[missionIndex]);
      final reward = (mission['reward'] as num?)?.toDouble() ?? 0.0;
      
      mission['status'] = 'completed';
      mission['completedAt'] = DateTime.now().toIso8601String();
      
      // Phase 7 Task 7.5: Release payment to Rider Moneybag
      if (_moneybagProvider != null && reward > 0) {
        await _releasePaymentToRider(orderId, reward, mission);
      }
      
      // Phase 7 Task 7.5: Create Khata OS entry
      if (_khataProvider != null && reward > 0) {
        await _createKhataEntryForDelivery(orderId, reward, mission);
      }
      
      // Phase 7 Task 7.5: Update order status to delivered
      if (_orderProvider != null) {
        await _orderProvider!.updateOrderStatus(orderId, OrderStatus.delivered);
      }
      
      // Phase 7 Task 7.5: Award XP for delivery completion
      if (_auraProvider != null) {
        await _auraProvider!.awardDeliveryCompletedXP();
        debugPrint('✨ Awarded +75 XP for delivery completed');
      }
      
      // Phase 7 Task 7.5: Update Trust Scores (rider + customer)
      if (_trustScoreProvider != null) {
        await _updateTrustScoresAfterDelivery(orderId, mission);
      }
      
      // Remove from accepted
      _acceptedMissions.removeAt(missionIndex);
      
      // Add to completed
      _completedMissions.insert(0, mission);
      
      await _saveMissions();
      notifyListeners();
      
      await _updateMissionStatusInBackend(orderId, 'completed');
      
      debugPrint('✅ Mission completed: $orderId');
      debugPrint('   Reward: ৳$reward released to rider');
      return true;
    } catch (e) {
      debugPrint('❌ Error completing mission: $e');
      return false;
    }
  }

  /// Release payment from escrow to Rider Moneybag (Phase 7 Task 7.5)
  Future<void> _releasePaymentToRider(
    String orderId,
    double reward,
    Map<String, dynamic> mission,
  ) async {
    try {
      // Calculate split (Mock logic for now)
      // In production, these values should come from the Order model
      final totalOrderValue = (reward * 5); // Assuming delivery fee is ~20%
      final platformFee = totalOrderValue * 0.10; // 10% platform fee
      final partnerAmount = totalOrderValue - platformFee - reward;

      // Distribute funds from Escrow
      await _moneybagProvider!.distributeOrderPayment(
        orderId: orderId,
        totalAmount: totalOrderValue,
        riderFee: reward,
        platformFee: platformFee,
        partnerAmount: partnerAmount,
      );

      debugPrint('💰 Payment distributed from Escrow');
      debugPrint('   Rider: ৳$reward');
      debugPrint('   Partner: ৳${partnerAmount.toStringAsFixed(2)}');
      debugPrint('   Platform: ৳${platformFee.toStringAsFixed(2)}');
    } catch (e) {
      debugPrint('❌ Error releasing payment to rider: $e');
      rethrow;
    }
  }

  /// Create Khata OS entry for delivery earnings (Phase 7 Task 7.5)
  Future<void> _createKhataEntryForDelivery(
    String orderId,
    double reward,
    Map<String, dynamic> mission,
  ) async {
    try {
      final khata = _khataProvider!.personalKhata;
      if (khata == null) {
        debugPrint('⚠️ No personal khata found');
        return;
      }

      await _khataProvider!.addIncome(
        khataId: khata.id,
        description: 'Delivery earnings - ${mission['restaurantName'] ?? 'Order'} to ${mission['customerName'] ?? 'Customer'}',
        amount: reward,
        notes: 'Order: $orderId, Distance: ${mission['distance']}, Time: ${mission['estimatedTime']}',
      );
      
      debugPrint('📒 Khata entry created for delivery: ৳$reward');
    } catch (e) {
      debugPrint('❌ Error creating Khata entry: $e');
      // Don't rethrow - Khata entry is not critical for mission completion
    }
  }

  /// Update Trust Scores after successful delivery (Phase 7 Task 7.5)
  Future<void> _updateTrustScoresAfterDelivery(
    String orderId,
    Map<String, dynamic> mission,
  ) async {
    try {
      // In production, this would:
      // 1. Prompt customer to rate rider
      // 2. Update rider's Trust Score based on rating
      // 3. Update customer's Trust Score (positive for completing transaction)
      
      // For now, we'll simulate a positive interaction
      debugPrint('⭐ Trust Score update triggered for order: $orderId');
      debugPrint('   Rider and customer Trust Scores will be updated after rating');
    } catch (e) {
      debugPrint('❌ Error updating Trust Scores: $e');
      // Don't rethrow - Trust Score update is not critical for mission completion
    }
  }

  /// Manually add a mission to available queue (for testing/demo)
  void addAvailableMission(Map<String, dynamic> mission) {
    if (!_availableMissions.any((m) => m['orderId'] == mission['orderId'])) {
      _availableMissions.insert(0, mission);
      _saveMissions();
      notifyListeners();
    }
  }

  /// Create mission from Order (when order is ready for pickup)
  Map<String, dynamic> createMissionFromOrder(Order order) {
    return {
      'isMission': true,
      'orderId': order.id,
      'restaurantName': 'Cloud Kitchen', // In production, get from order
      'pickupAddress': 'Restaurant Address', // In production, get from order
      'customerName': 'Customer ${order.id.substring(0, 4)}',
      'dropoffAddress': order.deliveryAddress,
      'distance': '3.5', // Calculate based on coordinates
      'estimatedTime': 15,
      'reward': ((order.total * 0.1) + 30).round(),
      'items': order.items.map((item) => '${item.name} x${item.quantity}').toList(),
      'otp': '${1234 + order.id.hashCode % 9000}',
      'status': 'available',
      'createdAt': DateTime.now().toIso8601String(),
    };
  }

  /// Clear all missions (for testing)
  void clearAllMissions() {
    _availableMissions.clear();
    _acceptedMissions.clear();
    _completedMissions.clear();
    _saveMissions();
    notifyListeners();
  }

  @override
  void dispose() {
    _missionsStreamSubscription?.cancel();
    _mockMissionTimer?.cancel();
    super.dispose();
  }

  // ============================================================================
  // Phase 7.4: Mission Chain Management
  // ============================================================================

  /// Add a mission chain to available chains
  void addMissionChain(MissionChain chain) {
    _availableChains.add(chain);
    notifyListeners();
    debugPrint('🔗 Mission chain added: ${chain.id} (${chain.missions.length} missions)');
  }

  /// Accept a mission chain
  Future<void> acceptMissionChain(String chainId) async {
    try {
      final chainIndex = _availableChains.indexWhere((c) => c.id == chainId);
      if (chainIndex == -1) {
        debugPrint('❌ Chain not found: $chainId');
        return;
      }

      final chain = _availableChains[chainIndex];
      
      // Mark as accepted
      final acceptedChain = chain.copyWith(
        isAccepted: true,
        acceptedAt: DateTime.now(),
      );

      _availableChains.removeAt(chainIndex);
      _acceptedChains.add(acceptedChain);
      
      notifyListeners();
      debugPrint('✅ Mission chain accepted: $chainId');
      debugPrint('   Total earnings: ৳${acceptedChain.totalWithBonus.toStringAsFixed(0)}');
    } catch (e) {
      debugPrint('❌ Error accepting mission chain: $e');
    }
  }

  /// Complete a mission within a chain
  Future<void> completeMissionInChain(String chainId, String missionId) async {
    try {
      final chainIndex = _acceptedChains.indexWhere((c) => c.id == chainId);
      if (chainIndex == -1) {
        debugPrint('❌ Accepted chain not found: $chainId');
        return;
      }

      final chain = _acceptedChains[chainIndex];
      final newCompletedCount = chain.completedMissions + 1;
      
      // Update chain progress
      final updatedChain = chain.copyWith(
        completedMissions: newCompletedCount,
        isCompleted: newCompletedCount >= chain.missions.length,
        completedAt: newCompletedCount >= chain.missions.length ? DateTime.now() : null,
      );

      _acceptedChains[chainIndex] = updatedChain;

      // If chain is complete, move to completed and award bonus
      if (updatedChain.isCompleted) {
        _acceptedChains.removeAt(chainIndex);
        _completedChains.insert(0, updatedChain);

        // Award chain completion bonus
        await _awardChainCompletionBonus(updatedChain);
      }

      notifyListeners();
      debugPrint('✅ Mission completed in chain: $missionId');
      debugPrint('   Progress: ${updatedChain.completedMissions}/${updatedChain.missions.length}');
    } catch (e) {
      debugPrint('❌ Error completing mission in chain: $e');
    }
  }

  /// Award bonus for completing a mission chain
  Future<void> _awardChainCompletionBonus(MissionChain chain) async {
    try {
      // Release total payment to rider
      if (_moneybagProvider != null) {
        await _moneybagProvider!.addMoney(
          type: MoneybagType.rider,
          amount: chain.totalWithBonus,
          reference: 'chain_${chain.id}',
        );
        debugPrint('💰 Chain payment released: ৳${chain.totalWithBonus.toStringAsFixed(0)}');
      }

      // Create Khata entry
      if (_khataProvider != null) {
        final personalKhata = _khataProvider!.personalKhata;
        if (personalKhata != null) {
          final entry = KhataEntry.income(
            amount: chain.totalWithBonus,
            description: 'Mission Chain earnings (${chain.missions.length} deliveries)',
            notes: 'Chain ID: ${chain.id}, Efficiency: ${chain.efficiencyScore}',
          );
          // Add metadata manually since income constructor doesn't support it directly yet
          // or we can use copyWith if needed, but for now this is fine.
          // Actually KhataEntry.income doesn't take metadata either based on my view.
          
          _khataProvider!.addEntry(khataId: personalKhata.id, entry: entry);
          debugPrint('📒 Khata entry created for chain: ৳${chain.totalWithBonus.toStringAsFixed(0)}');
        }
      }

      // Award XP for chain completion
      if (_auraProvider != null) {
        final chainXP = _chainDetector.calculateChainXP(chain);
        await _auraProvider!.awardMissionChainXP(missionsInChain: chain.missions.length);
        debugPrint('✨ Awarded +$chainXP XP for mission chain completion');
      }

      debugPrint('🎉 Mission chain completed: ${chain.id}');
      debugPrint('   Total earned: ৳${chain.totalWithBonus.toStringAsFixed(0)}');
      debugPrint('   Bonus: ৳${chain.bonusAmount.toStringAsFixed(0)} (${(chain.bonusAmount / chain.totalEarnings * 100).toStringAsFixed(0)}%)');
      debugPrint('   Efficiency: ${(chain.efficiencyScore * 100).toStringAsFixed(0)}%');
    } catch (e) {
      debugPrint('❌ Error awarding chain completion bonus: $e');
    }
  }

  /// Reject a mission chain
  void rejectMissionChain(String chainId) {
    final chainIndex = _availableChains.indexWhere((c) => c.id == chainId);
    if (chainIndex != -1) {
      _availableChains.removeAt(chainIndex);
      notifyListeners();
      debugPrint('❌ Mission chain rejected: $chainId');
    }
  }

  /// Get chain by ID
  MissionChain? getChainById(String chainId) {
    try {
      return _availableChains.firstWhere((c) => c.id == chainId);
    } catch (e) {
      try {
        return _acceptedChains.firstWhere((c) => c.id == chainId);
      } catch (e) {
        try {
          return _completedChains.firstWhere((c) => c.id == chainId);
        } catch (e) {
          return null;
        }
      }
    }
  }

  /// Remove expired chains
  void removeExpiredChains() {
    final now = DateTime.now();
    _availableChains.removeWhere((chain) => now.isAfter(chain.expiresAt));
    notifyListeners();
  }
}
