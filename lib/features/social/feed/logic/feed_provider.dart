import 'package:flutter/material.dart';
import '../data/feed_card_models.dart';
import 'package:rizik_v4/data/models/user_role.dart';

class FeedProvider extends ChangeNotifier {
  // Current user role (default: consumer)
  UserRole _currentRole = UserRole.consumer;
  
  UserRole get currentRole => _currentRole;
  
  // Set user role and notify listeners
  void setRole(UserRole role) {
    if (_currentRole != role) {
      _currentRole = role;
      notifyListeners();
    }
  }
  // Consumer feed items
  final List<FeedCard> _consumerFeedItems = [
    // Card 1: Featured Food Post (Rizik Now)
    FoodCardData(
      id: '1',
      heightFactor: 1.0,
      name: 'সোনাদিয়ার বিফ তেহারি',
      nameBn: 'সোনাদিয়ার বিফ তেহারি',
      image: 'assets/images/food_placeholder.jpg',
      price: 450,
      rating: 4.8,
      category: 'বিফ তেহারি',
      partnerName: 'সোনাদিয়া কিচেন',
      serviceType: ServiceType.rizikNow, // On-demand delivery
    ),
    // Card 2: Review Card (Social Proof)
    ReviewCardData(
      id: '2',
      heightFactor: 0.9,
      userName: 'Ahmed Rahman',
      userAvatar: 'assets/images/avatar_male.png',
      reviewText: 'Amazing homemade taste! Just like my mother used to make.',
      rating: 5.0,
      foodItem: 'Beef Tehari',
      date: '2 hours ago',
      foodId: '1', // Link to food item
      restaurantName: 'Spice Kitchen',
    ),
    // Card 3: Event Card (Bid Post)
    EventCardData(
      id: '3',
      heightFactor: 1.3, // Enlarged
      title: '🔥 বিড ওন!',
      description: '\'ইফতার প্ল্যাটার\' (কাচ্চি ভাই)। শামীম এইমাত্র এটি অর্ডার করেছেন।',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(hours: 2)),
      eventType: 'Bid',
      creatorName: 'Shamim Ahmed', // Creator info
      creatorAvatar: 'assets/images/avatar_male.png',
      creatorId: 'user_123',
      currentBid: 450.0, // Current bid amount
      bidCount: 12, // Number of bids
    ),
    // Card 4: Shop Card (Rizik Bazaar)
    ShopCardData(
      id: '4',
      heightFactor: 1.1,
      shopName: '🏷️ পুরাতন ক্যালকুলেটর',
      shopImage: 'assets/images/shop_placeholder.jpg',
      rating: 4.5,
      reviewCount: 12,
      isOpen: true,
      badge: 'Rizik Bazaar',
    ),
    // Card 5: Reward Card (Rizik Gig)
    RewardCardData(
      id: '5',
      heightFactor: 0.8,
      title: '🔧 প্লাম্বার দরকার?',
      description: 'Gold Aura রেটিং সহ দক্ষ প্লাম্বার পাবেন',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2933/2933245.png',
      pointsRequired: 0,
      expiryDate: DateTime.now().add(const Duration(days: 1)),
    ),
    // Card 6: Another Food Card
    FoodCardData(
      id: '6',
      heightFactor: 1.3,
      name: 'চিকেন কারি',
      nameBn: 'চিকেন কারি',
      image: 'assets/images/food_placeholder.jpg',
      price: 320,
      rating: 4.6,
      category: 'চিকেন',
      partnerName: 'মামার রান্নাঘর',
    ),
    
    // MANAGEMENT CARDS (for Management Hub)
    
    // Card 7: Squad Management Alert
    SquadManagementCardData(
      id: 'squad_1',
      heightFactor: 1.0,
      squadName: 'পরিবার স্কোয়াড',
      memberCount: 4,
      totalEarnings: 2500.0,
      status: 'active',
      alertMessage: 'নতুন আয় বিভাজন প্রস্তাব',
    ),
    
    // Card 8: Meal Plan Status
    MealPlanStatusCardData(
      id: 'meal_1',
      heightFactor: 0.9,
      planName: 'সাপ্তাহিক মিল প্ল্যান',
      todayMeal: '🍱 বিরিয়ানি',
      tomorrowMeal: '🍲 কারি',
      isPaused: false,
      nextDelivery: DateTime.now().add(const Duration(hours: 3)),
      alertMessage: 'আজকের খাবার ৩ ঘণ্টায় আসবে',
    ),
    
    // Card 9: Social Ledger Alert
    SocialLedgerCardData(
      id: 'ledger_1',
      heightFactor: 1.1,
      amountDue: 500.0,
      dueTo: 'সাব্বিরকে',
      amountOwed: 167.0,
      owedFrom: 'শামীমের কাছে',
      hasAlert: true,
    ),
    
    // Card 10: Duty Roster Alert
    DutyRosterAlertCardData(
      id: 'duty_1',
      heightFactor: 0.8,
      taskName: 'রান্নাঘর পরিষ্কার',
      assignedTo: 'আপনার',
      dueDate: DateTime.now().add(const Duration(hours: 2)),
      isOverdue: false,
      completionStatus: 'pending',
      squadId: 'squad_1', // Squad ID for navigation
    ),
    
    // Card 11: Inventory Alert
    InventoryAlertCardData(
      id: 'inventory_1',
      heightFactor: 1.0,
      lowStockItems: ['চাল', 'ডাল', 'তেল'],
      itemCount: 3,
      alertType: 'low_stock',
      actionText: 'বাজার তালিকায় যোগ করুন',
    ),
    
    // Card 12: Active Order Alert
    ActiveOrderAlertCardData(
      id: 'order_1',
      heightFactor: 1.2,
      orderId: 'ORD456',
      partnerName: 'কাচ্চি ভাই',
      status: 'on_the_way',
      estimatedDelivery: DateTime.now().add(const Duration(minutes: 25)),
      items: ['চিকেন বিরিয়ানি', 'বোরহানি'],
      totalAmount: 650.0,
    ),
  ];

  // Partner feed items
  final List<FeedCard> _partnerFeedItems = [
    // CRITICAL ALERT: Missed Order - No one took it (RED)
    EventCardData(
      id: 'p1',
      heightFactor: 1.0,
      title: '⏰ মিসড অর্ডার!',
      description: 'Order #ORD123 - কেউ নেয়নি (৳৪৫০)',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now().subtract(const Duration(minutes: 30)),
      endDate: DateTime.now().subtract(const Duration(minutes: 25)),
      eventType: 'Missed Order', // RED ALERT
    ),
    // OPPORTUNITY: Active Bid Request (GREEN - Hero Card 2x) with Bidding War
    EventCardData(
      id: 'p2',
      heightFactor: 1.8, // HERO CARD - High value bid with thread preview
      title: 'ইফতার ফর ২০',
      description: '২০ জনের জন্য ইফতার প্যাকেজ',
      backgroundImage: 'assets/images/bonus_bg.jpg',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(hours: 2)),
      eventType: 'Bid',
      creatorName: 'Karim Ahmed',
      creatorAvatar: 'assets/images/avatar_male.png',
      creatorId: 'user_456',
      currentBid: 4500.0,
      bidCount: 8,
      category: EventCardCategory.opportunity,
      foodImage: 'assets/images/food_placeholder.jpg',
      hasFullThread: true,
      latestBids: [
        BidComment(
          id: 'bid1',
          partnerName: 'Sultan Kitchen',
          partnerAvatar: 'assets/images/avatar_male.png',
          bidAmount: 4500.0,
          message: 'আমি করতে পারবো! সেরা মানের খাবার',
          timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
        ),
        BidComment(
          id: 'bid2',
          partnerName: 'Spice Master',
          partnerAvatar: 'assets/images/avatar_female.png',
          bidAmount: 4300.0,
          message: 'আমার কাছে সব উপকরণ আছে',
          timestamp: DateTime.now().subtract(const Duration(minutes: 15)),
        ),
        BidComment(
          id: 'bid3',
          partnerName: 'Home Chef',
          partnerAvatar: 'assets/images/avatar_male.png',
          bidAmount: 4200.0,
          message: 'ঘরের স্বাদে তৈরি করবো',
          timestamp: DateTime.now().subtract(const Duration(minutes: 25)),
        ),
      ],
    ),
    // Customer Review
    ReviewCardData(
      id: 'p3',
      heightFactor: 0.9,
      userName: 'Sadia Rahman',
      userAvatar: 'assets/images/avatar_female.png',
      reviewText: 'The biryani was absolutely perfect! Will definitely order again.',
      rating: 5.0,
      foodItem: 'Chicken Biryani',
      date: '1 hour ago',
      foodId: '1',
      restaurantName: 'Your Kitchen',
    ),
    // CRITICAL: Inventory Alert (RED/ORANGE)
    AISuggestCardData(
      id: 'p4',
      heightFactor: 0.9,
      title: '⚠️ মেয়াদ শেষ হচ্ছে!',
      description: '\'দুধ\' (৫ ইউনিট) ১ দিনের মধ্যে মেয়াদ শেষ হবে',
      icon: Icons.warning,
      accentColor: const Color(0xFFFF5722), // Orange alert
    ),
    // OPPORTUNITY: Another Bid Request (GREEN) with Bidding Thread
    EventCardData(
      id: 'p5',
      heightFactor: 1.5, // Taller with food image and thread
      title: 'হোমমেড কারি',
      description: '৪ জনের জন্য ঘরের স্বাদের কারি',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(hours: 3)),
      eventType: 'Bid',
      creatorName: 'Fatima Begum',
      creatorAvatar: 'assets/images/avatar_female.png',
      creatorId: 'user_789',
      currentBid: 750.0,
      bidCount: 5,
      category: EventCardCategory.opportunity,
      foodImage: 'assets/images/food_placeholder.jpg',
      hasFullThread: true,
      latestBids: [
        BidComment(
          id: 'bid1',
          partnerName: 'Ranna Ghor',
          partnerAvatar: 'assets/images/avatar_female.png',
          bidAmount: 750.0,
          message: 'তাজা মশলা দিয়ে বানাবো',
          timestamp: DateTime.now().subtract(const Duration(minutes: 10)),
        ),
        BidComment(
          id: 'bid2',
          partnerName: 'Deshi Kitchen',
          partnerAvatar: 'assets/images/avatar_male.png',
          bidAmount: 700.0,
          message: 'আমার স্পেশালিটি কারি',
          timestamp: DateTime.now().subtract(const Duration(minutes: 20)),
        ),
        BidComment(
          id: 'bid3',
          partnerName: 'Maa er Ranna',
          partnerAvatar: 'assets/images/avatar_female.png',
          bidAmount: 680.0,
          message: 'মায়ের হাতের স্বাদ পাবেন',
          timestamp: DateTime.now().subtract(const Duration(minutes: 30)),
        ),
      ],
    ),
    // OPPORTUNITY: Unclaimed Order (GREEN)
    EventCardData(
      id: 'p6',
      heightFactor: 1.0,
      title: 'আনক্লেইমড অর্ডার',
      description: 'Order #ORD456 - দ্রুত নিন!',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now().subtract(const Duration(minutes: 15)),
      endDate: DateTime.now().add(const Duration(minutes: 5)),
      eventType: 'Unclaimed',
      currentBid: 620.0,
      category: EventCardCategory.opportunity,
    ),
    // Customer Review 2
    ReviewCardData(
      id: 'p7',
      heightFactor: 0.85,
      userName: 'Mahmud Hasan',
      userAvatar: 'assets/images/avatar_male.png',
      reviewText: 'দারুণ স্বাদ! পরিবারের সবাই পছন্দ করেছে।',
      rating: 4.5,
      foodItem: 'Beef Tehari',
      date: '3 hours ago',
      foodId: '2',
      restaurantName: 'Your Kitchen',
    ),
    // PROMOTIONAL: Flash Sale Suggestion (YELLOW)
    AISuggestCardData(
      id: 'p8',
      heightFactor: 0.95,
      title: '💡 ফ্ল্যাশ সেল করুন!',
      description: 'আজ রাতে ২০% ছাড় দিয়ে বিক্রি বাড়ান',
      icon: Icons.lightbulb,
      accentColor: const Color(0xFFFFC107), // Yellow promotional
    ),
    // OPPORTUNITY: Bid Request 3 (GREEN) with Bidding Thread
    EventCardData(
      id: 'p9',
      heightFactor: 1.6, // Taller with cake image and thread
      title: 'বার্থডে কেক',
      description: 'আগামীকাল দরকার - কাস্টম ডিজাইন',
      backgroundImage: 'assets/images/bonus_bg.jpg',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(hours: 18)),
      eventType: 'Bid',
      creatorName: 'Nusrat Jahan',
      creatorAvatar: 'assets/images/avatar_female.png',
      creatorId: 'user_101',
      currentBid: 1100.0,
      bidCount: 12,
      category: EventCardCategory.opportunity,
      foodImage: 'assets/images/food_placeholder.jpg',
      hasFullThread: true,
      latestBids: [
        BidComment(
          id: 'bid1',
          partnerName: 'Cake Studio',
          partnerAvatar: 'assets/images/avatar_female.png',
          bidAmount: 1100.0,
          message: '3D ডিজাইন করতে পারি',
          timestamp: DateTime.now().subtract(const Duration(minutes: 8)),
        ),
        BidComment(
          id: 'bid2',
          partnerName: 'Sweet Treats',
          partnerAvatar: 'assets/images/avatar_male.png',
          bidAmount: 1050.0,
          message: 'ফটো পাঠান, ডিজাইন করে দিচ্ছি',
          timestamp: DateTime.now().subtract(const Duration(minutes: 18)),
        ),
        BidComment(
          id: 'bid3',
          partnerName: 'Baker\'s Delight',
          partnerAvatar: 'assets/images/avatar_female.png',
          bidAmount: 1000.0,
          message: 'ফ্রেশ ক্রিম ব্যবহার করবো',
          timestamp: DateTime.now().subtract(const Duration(minutes: 28)),
        ),
      ],
    ),
    // CRITICAL: Missed Order 2 (RED)
    EventCardData(
      id: 'p10',
      heightFactor: 0.9,
      title: '⏰ মিসড: লাঞ্চ অর্ডার',
      description: 'Order #ORD789 - ৳৩৮০ (কেউ নেয়নি)',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now().subtract(const Duration(hours: 1)),
      endDate: DateTime.now().subtract(const Duration(minutes: 55)),
      eventType: 'Missed Order',
      category: EventCardCategory.critical,
    ),
    // Weekly Bonus
    RewardCardData(
      id: 'p11',
      heightFactor: 0.9,
      title: 'সাপ্তাহিক বোনাস!',
      description: 'সাপ্তাহে ৫০টি অর্ডার করলে ৳১,০০০ বোনাস',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/746/746043.png',
      pointsRequired: 0,
      expiryDate: DateTime.now().add(const Duration(days: 7)),
    ),
    // Customer Review 3
    ReviewCardData(
      id: 'p12',
      heightFactor: 0.9,
      userName: 'Tanvir Islam',
      userAvatar: 'assets/images/avatar_male.png',
      reviewText: 'খুব তাড়াতাড়ি ডেলিভারি হয়েছে। খাবার গরম ছিল।',
      rating: 5.0,
      foodItem: 'Mixed Fried Rice',
      date: '5 hours ago',
      foodId: '3',
      restaurantName: 'Your Kitchen',
    ),
    // CRITICAL: Inventory Low Stock (ORANGE)
    AISuggestCardData(
      id: 'p13',
      heightFactor: 0.9,
      title: '📉 স্টক কম!',
      description: '\'পেঁয়াজ\' এবং \'মরিচ\' স্টক শেষ হয়ে যাচ্ছে',
      icon: Icons.inventory_2,
      accentColor: const Color(0xFFFF9800), // Orange warning
    ),
    // OPPORTUNITY: Bid Request 4 - HERO (GREEN) with Bidding Thread
    EventCardData(
      id: 'p14',
      heightFactor: 1.7, // HERO - High value with thread
      title: 'নুডলস পার্টি',
      description: '১০ জনের জন্য নুডলস পার্টি প্যাকেজ',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(hours: 6)),
      eventType: 'Bid',
      creatorName: 'Rafiq Ahmed',
      creatorAvatar: 'assets/images/avatar_male.png',
      creatorId: 'user_202',
      currentBid: 2300.0,
      bidCount: 15,
      category: EventCardCategory.opportunity,
      foodImage: 'assets/images/food_placeholder.jpg',
      hasFullThread: true,
      latestBids: [
        BidComment(
          id: 'bid1',
          partnerName: 'Chinese Corner',
          partnerAvatar: 'assets/images/avatar_male.png',
          bidAmount: 2300.0,
          message: 'চাইনিজ শেফ আছে আমার',
          timestamp: DateTime.now().subtract(const Duration(minutes: 12)),
        ),
        BidComment(
          id: 'bid2',
          partnerName: 'Noodle House',
          partnerAvatar: 'assets/images/avatar_female.png',
          bidAmount: 2200.0,
          message: 'ভেজিটেবল ফ্রি দিবো',
          timestamp: DateTime.now().subtract(const Duration(minutes: 22)),
        ),
        BidComment(
          id: 'bid3',
          partnerName: 'Fast Food King',
          partnerAvatar: 'assets/images/avatar_male.png',
          bidAmount: 2100.0,
          message: 'দ্রুত ডেলিভারি দিতে পারবো',
          timestamp: DateTime.now().subtract(const Duration(minutes: 32)),
        ),
      ],
    ),
  ];

  // Rider/Mover feed items
  final List<FeedCard> _riderFeedItems = [
    // Delivery Mission 1
    MissionCardData(
      id: 'm1',
      heightFactor: 1.2,
      pickupLocation: 'কাচ্চি ভাই (ধানমন্ডি)',
      dropoffLocation: 'গুলশান ১',
      distance: 4.2,
      estimatedTime: 25,
      reward: 70,
      orderId: 'ডেলিভারি মিশন #DM001',
    ),
    // Delivery Mission 2
    MissionCardData(
      id: 'm2',
      heightFactor: 1.0,
      pickupLocation: 'স্পাইস কিচেন (উত্তরা)',
      dropoffLocation: 'মিরপুর ১০',
      distance: 8.5,
      estimatedTime: 35,
      reward: 120,
      orderId: 'ডেলিভারি মিশন #DM002',
    ),
    // Peak Hour Bonus Event
    EventCardData(
      id: 'm3',
      heightFactor: 1.3,
      title: '🔥 পিক আওয়ার বোনাস!',
      description: 'সন্ধ্যা ৬-৯ টায় ১.৫x রিওয়ার্ড',
      backgroundImage: 'assets/images/bonus_bg.jpg',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(hours: 3)),
      eventType: 'Bonus',
    ),
    // Mission Chain Opportunity
    EventCardData(
      id: 'm4',
      heightFactor: 1.5,
      title: '⚡ মাল্টি-ড্রপ চেইন',
      description: '৩টি ডেলিভারি একসাথে - ৳২৫০ আয়',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now(),
      endDate: DateTime.now().add(const Duration(hours: 2)),
      eventType: 'Mission Chain',
    ),
    // Delivery Mission 3
    MissionCardData(
      id: 'm5',
      heightFactor: 1.1,
      pickupLocation: 'মহাখালী বাজার',
      dropoffLocation: 'বনানী',
      distance: 2.3,
      estimatedTime: 15,
      reward: 40,
      orderId: 'ডেলিভারি মিশন #DM003',
    ),
    // Mover Service - Bike Repair Discount
    RewardCardData(
      id: 'm6',
      heightFactor: 0.9,
      title: '🔧 বাইক মেরামত ছাড়',
      description: 'পার্টনার গ্যারেজে ২০% ছাড় পান',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2933/2933245.png',
      pointsRequired: 0,
      expiryDate: DateTime.now().add(const Duration(days: 7)),
    ),
    // Delivery Mission 4
    MissionCardData(
      id: 'm7',
      heightFactor: 1.0,
      pickupLocation: 'সুলতান কিচেন (মতিঝিল)',
      dropoffLocation: 'শাহবাগ',
      distance: 3.8,
      estimatedTime: 20,
      reward: 60,
      orderId: 'ডেলিভারি মিশন #DM004',
    ),
    // Weekly Bonus
    RewardCardData(
      id: 'm8',
      heightFactor: 0.9,
      title: '🎯 সাপ্তাহিক বোনাস!',
      description: 'সাপ্তাহে ৫০টি ডেলিভারি করলে ৳১,০০০ বোনাস',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/746/746043.png',
      pointsRequired: 0,
      expiryDate: DateTime.now().add(const Duration(days: 7)),
    ),
    // Delivery Mission 5 - Runner Gig
    MissionCardData(
      id: 'm9',
      heightFactor: 1.1,
      pickupLocation: 'ফার্মগেট',
      dropoffLocation: 'কারওয়ান বাজার',
      distance: 1.2,
      estimatedTime: 10,
      reward: 30,
      orderId: '🚶‍♂️ রানার গিগ (হেঁটে)',
    ),
    // Fuel Discount Service
    RewardCardData(
      id: 'm10',
      heightFactor: 0.85,
      title: '⛽ জ্বালানি ছাড়',
      description: 'পার্টনার পেট্রোল পাম্পে ৫% ছাড়',
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
      pointsRequired: 0,
      expiryDate: DateTime.now().add(const Duration(days: 30)),
    ),
  ];

  // Getters for each role's feed
  List<FeedCard> get consumerFeedItems => List.unmodifiable(_consumerFeedItems);
  List<FeedCard> get partnerFeedItems => List.unmodifiable(_partnerFeedItems);
  List<FeedCard> get riderFeedItems => List.unmodifiable(_riderFeedItems);
  
  // 🎯 ROLE-BASED BAZAR TAB FILTERING
  // Bazar Tab shows different content based on user's active role
  List<FeedCard> get bazarFeedItems {
    switch (_currentRole) {
      case UserRole.consumer:
        return _getConsumerBazarItems();
      case UserRole.partner:
        return _getPartnerBazarItems();
      case UserRole.rider:
        return _getMoverBazarItems();
    }
  }
  
  // 🙋‍♂️ CONSUMER (Food Explorer) - Marketplace & Discovery
  List<FeedCard> _getConsumerBazarItems() {
    return List.unmodifiable(_consumerFeedItems.where((item) {
      // ✅ KEEP: Marketplace content
      if (item is FoodCardData) return true; // Rizik Now Food Items
      if (item is ReviewCardData) return true; // Social Proof
      if (item is ShopCardData) return true; // Rizik Bazaar (C2C)
      if (item is EventCardData) return true; // Bidding (Create Request)
      if (item is RewardCardData) return true; // Hyperlocal Services
      if (item is RizikGigCardData) return true; // Service opportunities
      if (item is PublicBidWonCardData) return true; // Bid celebrations
      if (item is RizikBazaarCardData) return true; // Bazaar items
      
      // ❌ REMOVE: Management cards (these belong in Home tab)
      if (item is SquadManagementCardData) return false;
      if (item is MealPlanStatusCardData) return false;
      if (item is SocialLedgerCardData) return false;
      if (item is DutyRosterAlertCardData) return false;
      if (item is InventoryAlertCardData) return false;
      if (item is ActiveOrderAlertCardData) return false;
      
      return false;
    }).toList());
  }
  
  // 🧑‍🍳 PARTNER (Kitchen Master) - Business Opportunities
  List<FeedCard> _getPartnerBazarItems() {
    return List.unmodifiable(_partnerFeedItems.where((item) {
      // ✅ KEEP: Business opportunities
      if (item is EventCardData) {
        // Show ONLY bid requests and unclaimed orders
        return item.eventType == 'Bid' || 
               item.eventType == 'Unclaimed' ||
               item.eventType == 'Missed Order';
      }
      if (item is ReviewCardData) return true; // Customer reviews
      if (item is AISuggestCardData) {
        // Show inventory alerts and AI suggestions
        return true;
      }
      if (item is RewardCardData) return true; // Bulk/Supply offers
      
      // ❌ REMOVE: Consumer-specific content
      if (item is FoodCardData) return false;
      if (item is ShopCardData) return false;
      
      return false;
    }).toList());
  }
  
  // 🚴 MOVER (Speed Warrior) - Delivery Missions
  List<FeedCard> _getMoverBazarItems() {
    return List.unmodifiable(_riderFeedItems.where((item) {
      // ✅ KEEP: Mission opportunities
      if (item is MissionCardData) return true; // Delivery missions
      if (item is EventCardData) {
        // Show ONLY mission-related events (bonuses, peak hours)
        return item.eventType == 'Bonus' || 
               item.eventType == 'Peak Hour' ||
               item.eventType == 'Mission Chain';
      }
      if (item is RewardCardData) return true; // Mover services (bike repair, etc.)
      
      // ❌ REMOVE: Non-mover content
      if (item is FoodCardData) return false;
      if (item is ShopCardData) return false;
      if (item is ReviewCardData) return false;
      
      return false;
    }).toList());
  }

  // Add new post to consumer feed (for food requests, C2C sells, etc.)
  void addConsumerPost(FeedCard newPost) {
    _consumerFeedItems.insert(0, newPost); // Add to top of feed
    notifyListeners();
  }

  // Add new post to partner feed (for new dishes, inventory updates, etc.)
  void addPartnerPost(FeedCard newPost) {
    _partnerFeedItems.insert(0, newPost); // Add to top of feed
    notifyListeners();
  }

  // Add new post to rider feed (for delivery updates, etc.)
  void addRiderPost(FeedCard newPost) {
    _riderFeedItems.insert(0, newPost); // Add to top of feed
    notifyListeners();
  }

  // Helper method to generate unique IDs
  String _generateId() {
    return DateTime.now().millisecondsSinceEpoch.toString();
  }

  // Specific methods for different post types
  void addFoodRequest({
    required String foodName,
    required String category,
    required String description,
    required double budget,
    required String quantity,
    required String urgency,
    required DateTime deadline,
  }) {
    final newPost = EventCardData(
      id: _generateId(),
      heightFactor: 1.1,
      title: '🛍️ নতুন বিড: \'$foodName\'',
      description: 'বাজেট: ৳${budget.toInt()}, $quantity এর জন্য',
      backgroundImage: 'assets/images/event_bg.jpg',
      startDate: DateTime.now(),
      endDate: deadline,
      eventType: 'Food Request',
    );
    addConsumerPost(newPost);
  }

  void addC2CSell({
    required String itemName,
    required String category,
    required String description,
    required double price,
    required String condition,
    required bool isNegotiable,
  }) {
    final newPost = ShopCardData(
      id: _generateId(),
      heightFactor: 1.0,
      shopName: '🏷️ $itemName',
      shopImage: 'assets/images/shop_placeholder.jpg',
      rating: 0.0,
      reviewCount: 0,
      isOpen: true,
      badge: 'C2C Sale - ৳${price.toInt()}',
    );
    addConsumerPost(newPost);
  }

  void addRizikDhaar({
    required String amount,
    required String reason,
    required String repaymentPlan,
    required DateTime dueDate,
  }) {
    final newPost = EventCardData(
      id: _generateId(),
      heightFactor: 0.9,
      title: '💸 নতুন ধার রিকোয়েস্ট',
      description: '৳$amount - $reason',
      backgroundImage: 'assets/images/dhaar_bg.jpg',
      startDate: DateTime.now(),
      endDate: dueDate,
      eventType: 'Rizik Dhaar',
    );
    addConsumerPost(newPost);
  }

  void addNewDish({
    required String dishName,
    required String category,
    required String description,
    required double price,
    required int preparationTime,
    required String spiceLevel,
    required bool isVegetarian,
    required bool isSpecialOffer,
  }) {
    final newPost = FoodCardData(
      id: _generateId(),
      heightFactor: isSpecialOffer ? 1.3 : 1.0,
      name: dishName,
      nameBn: dishName,
      image: 'assets/images/food_placeholder.jpg',
      price: price,
      rating: 0.0,
      category: category,
      partnerName: 'আপনার রান্নাঘর',
    );
    addPartnerPost(newPost);
  }

  // Claim an unclaimed order
  void claimOrder(String orderId) {
    // Find and remove from partner feed (unclaimed items)
    _partnerFeedItems.removeWhere((item) => item.id == orderId);
    
    // In a real app, this would also update the backend and notify the consumer
    // For now, we'll add an "Active Order" card to the partner's feed
    final activeOrder = ActiveOrderAlertCardData(
      id: 'active_$orderId',
      heightFactor: 1.1,
      orderId: orderId.contains('ORD') ? orderId : 'ORD${_generateId().substring(0, 4)}',
      partnerName: 'আপনার রান্নাঘর',
      status: 'preparing',
      estimatedDelivery: DateTime.now().add(const Duration(minutes: 40)),
      items: ['অর্ডার করা আইটেম'],
      totalAmount: 450.0,
    );
    
    _partnerFeedItems.insert(0, activeOrder);
    notifyListeners();
  }
}