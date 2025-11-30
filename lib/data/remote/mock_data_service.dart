class MockDataService {
  /// Mock data for Bazar (Marketplace) items
  static List<Map<String, dynamic>> get bazarItems => [
        {
          'id': '1',
          'name': 'Fresh Vegetables',
          'category': 'Food',
          'price': 150,
          'image': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
          'vendor': 'Green Market',
          'rating': 4.5,
        },
        {
          'id': '2',
          'name': 'Dairy Products',
          'category': 'Food',
          'price': 200,
          'image': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80',
          'vendor': 'Fresh Dairy Co.',
          'rating': 4.8,
        },
        {
          'id': '3',
          'name': 'Rice (5kg)',
          'category': 'Grocery',
          'price': 450,
          'image': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80',
          'vendor': 'Grain House',
          'rating': 4.3,
        },
        {
          'id': '4',
          'name': 'Cooking Oil',
          'category': 'Grocery',
          'price': 180,
          'image': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
          'vendor': 'Oil Mart',
          'rating': 4.6,
        },
        {
          'id': '5',
          'name': 'Fresh Fruits',
          'category': 'Food',
          'price': 220,
          'image': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80',
          'vendor': 'Fruit Paradise',
          'rating': 4.7,
        },
        {
          'id': '6',
          'name': 'Snacks Pack',
          'category': 'Food',
          'price': 120,
          'image': 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80',
          'vendor': 'Snack Hub',
          'rating': 4.2,
        },
      ];

  /// Mock data for Missions/Gigs
  static List<Map<String, dynamic>> get missions => [
        {
          'id': 'mission_1',
          'title': 'Food Delivery - Mirpur',
          'type': 'delivery',
          'payment': 150,
          'distance': '2.5 km',
          'duration': '30 min',
          'icon': 'restaurant',
        },
        {
          'id': 'mission_2',
          'title': 'Package Pickup',
          'type': 'pickup',
          'payment': 200,
          'distance': '5 km',
          'duration': '45 min',
          'icon': 'local_shipping',
        },
        {
          'id': 'mission_3',
          'title': 'Grocery Run',
          'type': 'shopping',
          'payment': 180,
          'distance': '3 km',
          'duration': '1 hour',
          'icon': 'shopping_bag',
        },
      ];

  /// Mock data for Asset Rentals
  static List<Map<String, dynamic>> get assetRentals => [
        {
          'id': 'asset_1',
          'assetName': 'Deep Freezer (300L)',
          'category': 'Appliances',
          'rentalPrice': 500,
          'priceUnit': 'day',
          'image': 'https://images.unsplash.com/photo-1571175351579-4d4c8b955866?auto=format&fit=crop&w=400&q=80',
          'ownerName': 'Karim Bhai',
          'isAvailable': true,
          'rating': 4.8,
        },
        {
          'id': 'asset_2',
          'assetName': 'Bicycle (Mountain)',
          'category': 'Transport',
          'rentalPrice': 100,
          'priceUnit': 'day',
          'image': 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?auto=format&fit=crop&w=400&q=80',
          'ownerName': 'Rahim Store',
          'isAvailable': true,
          'rating': 4.5,
        },
        {
          'id': 'asset_3',
          'assetName': 'Generator (5KVA)',
          'category': 'Equipment',
          'rentalPrice': 1200,
          'priceUnit': 'day',
          'image': 'https://images.unsplash.com/photo-1609852550704-7862c8fb0e18?auto=format&fit=crop&w=400&q=80',
          'ownerName': 'Power Solutions',
          'isAvailable': false,
          'rating': 4.9,
        },
        {
          'id': 'asset_4',
          'assetName': 'Sewing Machine',
          'category': 'Tools',
          'rentalPrice': 200,
          'priceUnit': 'day',
          'image': 'https://images.unsplash.com/photo-1597740985671-2a8a3b3b4b9f?auto=format&fit=crop&w=400&q=80',
          'ownerName': 'Tailor Hub',
          'isAvailable': true,
          'rating': 4.6,
        },
      ];

  /// Get mock data by endpoint
  static Map<String, dynamic> getMockData(String endpoint) {
    if (endpoint.contains('bazar') || endpoint.contains('items')) {
      return {'items': bazarItems};
    } else if (endpoint.contains('missions') || endpoint.contains('gigs')) {
      return {'items': missions};
    } else if (endpoint.contains('rental') || endpoint.contains('assets')) {
      return {'items': assetRentals};
    }

    // Bazar Feed Items (Social Commerce)
    if (endpoint == 'mock://feed/bazar') {
      return {
        'items': [
          {
            'creatorName': 'Chef Kabir',
            'creatorAvatar': 'https://i.pravatar.cc/150?img=12',
            'itemName': 'Beef Tehari Special',
            'price': 280,
            'image': 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
            'caption': 'Fresh homemade tehari with premium beef! Limited quantity available today 🔥',
            'likes': 142,
            'comments': 28,
            'shares': 15,
            'isVideo': false,
          },
          {
            'creatorName': 'Tasty Kitchen',
            'creatorAvatar': 'https://i.pravatar.cc/150?img=25',
            'itemName': 'Chicken Biriyani Family Pack',
            'price': 650,
            'image': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
            'caption': '🍛 Hyderabadi style biriyani for 4 people. Order now!',
            'likes': 298,
            'comments': 45,
            'shares': 32,
            'isVideo': true,
          },
        ],
      };
    }

    // Video Commerce
    if (endpoint == 'mock://videos/featured') {
      return {
        'videos': [
          {
            'creatorName': 'Food Vlogger Rafi',
            'thumbnailUrl': 'https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=400',
            'caption': 'Making the BEST Kacchi Biriyani at home! 😍 #foodie #biriyani',
            'views': 25000,
            'likes': 3200,
            'earnings': 875.50,
            'duration': '3:24',
            'isViral': true,
          },
          {
            'creatorName': 'Kitchen Hacks BD',
            'thumbnailUrl': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
            'caption': 'Quick 10-minute breakfast recipe 🍳',
            'views': 8500,
            'likes': 720,
            'earnings': 297.50,
            'duration': '1:42',
            'isViral': false,
          },
        ],
      };
    }

    // Dam Komao Negotiations
    if (endpoint == 'mock://negotiations/active') {
      return {
        'negotiations': [
          {
            'itemName': 'Fresh Hilsha Fish (2kg)',
            'originalPrice': 1800,
            'targetPrice': 1400,
            'lowestBid': 1550,
           'bidCount': 7,
            'timeRemaining': '45 min',
            'consumerName': 'Anika Rahman',
            'itemImage': 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400',
            'status': 'active',
          },
          {
            'itemName': 'Premium Beef (5kg)',
            'originalPrice': 3000,
            'targetPrice': 2600,
            'lowestBid': 2750,
            'bidCount': 12,
            'timeRemaining': '1h 20min',
            'consumerName': 'Farhad Hossain',
            'itemImage': 'https://images.unsplash.com/photo-1588347818036-8f447b2c0b33?w=400',
            'status': 'active',
          },
        ],
      };
    }

    // Virtual Storefronts
    if (endpoint == 'mock://storefronts/featured') {
      return {
        'storefronts': [
          {
            'storeName': 'Mama\'s Kitchen',
            'ownerName': 'Sultana Begum',
            'storeImage': 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
            'rating': 4.8,
            'reviewCount': 156,
            'category': 'Homemade Food',
            'isOpen': true,
            'itemCount': 24,
            'trustScore': 4.7,
          },
          {
            'storeName': 'Fresh Produce Hub',
            'ownerName': 'Kamal Ahmed',
            'storeImage': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400',
            'rating': 4.6,
            'reviewCount': 89,
            'category': 'Grocery',
            'isOpen': true,
            'itemCount': 156,
            'trustScore': 4.5,
          },
        ],
      };
    }

    // Hyperlocal Services
    if (endpoint == 'mock://services/nearby') {
      return {
        'services': [
          {
            'serviceName': 'AC Repair & Servicing',
            'providerName': 'Rafiq Electronics',
            'serviceType': 'Repair',
            'distance': '0.8 km',
            'price': 500,
            'rating': 4.7,
            'isAvailable': true,
            'image': 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
            'trustScore': 4.6,
          },
          {
            'serviceName': 'Home Cleaning Service',
            'providerName': 'CleanPro BD',
            'serviceType': 'Cleaning',
            'distance': '1.2 km',
            'price': 800,
            'rating': 4.9,
            'isAvailable': true,
            'image': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400',
            'trustScore': 4.8,
          },
          {
            'serviceName': 'Plumbing Services',
            'providerName': 'Master Plumber',
            'serviceType': 'Plumbing',
            'distance': '0.5 km',
            'price': 350,
            'rating': 4.5,
            'isAvailable': false,
            'image': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400',
            'trustScore': 4.3,
          },
        ],
      };
    }

    // Group Expenses
    if (endpoint == 'mock://expenses/squad') {
      return {
        'expenses': [
          {
            'expenseName': 'Squad Grocery Shopping',
            'totalAmount': 2400,
            'paidBy': 'Tariq',
            'category': 'Groceries',
            'date': 'Nov 23',
            'splits': [
              {'name': 'Tariq', 'amount': 800, 'isPaid': true},
              {'name': 'Nadia', 'amount': 800, 'isPaid': true},
              {'name': 'Sabbir', 'amount': 800, 'isPaid': false},
            ],
          },
          {
            'expenseName': 'Internet Bill',
            'totalAmount': 1200,
            'paidBy': 'Nadia',
            'category': 'Utilities',
            'date': 'Nov 20',
            'splits': [
              {'name': 'Tariq', 'amount': 400, 'isPaid': false},
              {'name': 'Nadia', 'amount': 400, 'isPaid': true},
              {'name': 'Sabbir', 'amount': 400, 'isPaid': true},
            ],
          },
        ],
      };
    }

    // Duty Roster
    if (endpoint == 'mock://roster/weekly') {
      return {
        'weekOf': 'Week of Nov 20-26',
        'weekDuties': [
          {
            'day': 'Mon',
            'taskType': 'child_pickup',
            'assignedTo': 'Papa',
            'time': '3:00 PM',
            'isCompleted': true,
          },
          {
            'day': 'Tue',
            'taskType': 'cooking',
            'assignedTo': 'Mama',
            'time': '7:00 PM',
            'isCompleted': true,
          },
          {
            'day': 'Wed',
            'taskType': 'doctor',
            'assignedTo': 'Nanu',
            'time': '10:00 AM',
            'isCompleted': false,
          },
          {
            'day': 'Thu',
            'taskType': 'cleaning',
            'assignedTo': 'Papa',
            'time': '6:00 PM',
            'isCompleted': false,
          },
          {
            'day': 'Fri',
            'taskType': 'child_pickup',
            'assignedTo': 'Mama',
            'time': '3:00 PM',
            'isCompleted': false,
          },
        ],
      };
    }

    // Inventory Items
    if (endpoint == 'mock://inventory/items') {
      return {
        'items': [
          {
            'itemName': 'Organic Honey (500ml)',
            'category': 'Food',
            'stockLevel': 45,
            'lowStockThreshold': 10,
            'price': 450,
            'image': 'https://images.unsplash.com/photo-1587049352846-4a222e784422?w=400',
            'sku': 'HON-500-001',
          },
          {
            'itemName': 'Handmade Soap Set',
            'category': 'Beauty',
            'stockLevel': 8,
            'lowStockThreshold': 10,
            'price': 250,
            'image': 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=400',
            'sku': 'SOAP-SET-002',
          },
          {
            'itemName': 'Fresh Eggs (12 pcs)',
            'category': 'Food',
            'stockLevel': 0,
            'lowStockThreshold': 5,
            'price': 120,
            'image': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400',
            'sku': 'EGG-12-003',
          },
        ],
      };
    }

    return {'message': 'Mock endpoint not found'};
  }
}
