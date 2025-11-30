import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Use 10.0.2.2 for Android emulator to access host localhost
  static const String baseUrl = 'http://10.0.2.2:8787';

  static Future<Map<String, dynamic>> fetchHomeData() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/home'));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load home data: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching home data: $e');
      // Return a fallback error UI
      return {
        'type': 'center',
        'child': {
          'type': 'text',
          'text': 'Error loading data. Please check backend.',
          'color': 'red',
        }
      };
    }
  }

  static Future<Map<String, dynamic>> fetchGigs() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/gigs'));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load gigs: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching gigs: $e');
      return {
        'type': 'center',
        'child': {
          'type': 'text',
          'text': 'Error loading gigs.',
          'color': 'red',
        }
      };
    }
  }

  static Future<Map<String, dynamic>> fetchGigDetails(String id) async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/gigs/$id'));

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load gig details: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching gig details: $e');
      return {
        'type': 'center',
        'child': {
          'type': 'text',
          'text': 'Error loading gig details.',
          'color': 'red',
        }
      };
    }
  }

  static Future<Map<String, dynamic>> submitApplication(String url, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$url'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to submit application: ${response.statusCode}');
      }
    } catch (e) {
      print('Error submitting application: $e');
      throw e;
    }
  }

  static Future<Map<String, dynamic>> post(String endpoint, Map<String, dynamic> body) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl$endpoint'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(body),
      );

      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to post to $endpoint: ${response.statusCode}');
      }
    } catch (e) {
      print('Error posting to $endpoint: $e');
      throw e;
    }
  }
  static Future<List<dynamic>> fetchList(String endpoint) async {
    try {
      // Support for mock:// protocol
      if (endpoint.startsWith('mock://')) {
        final mockEndpoint = endpoint.substring(7); // Remove 'mock://' prefix
        // Dynamically import MockDataService
        final mockData = await Future.delayed(
          const Duration(milliseconds: 500), // Simulate network delay
          () {
            // For now, we'll return the mock data inline
            if (mockEndpoint.contains('bazar') || mockEndpoint.contains('items')) {
              return [
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
            }
            return [];
          },
        );
        return mockData;
      }
      
      // Handle full URLs or relative paths
      final uri = endpoint.startsWith('http') 
          ? Uri.parse(endpoint) 
          : Uri.parse('$baseUrl$endpoint');
          
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        // Expecting { "items": [...] } or just [...]
        if (data is List) return data;
        if (data is Map && data.containsKey('items')) return data['items'];
        return [];
      } else {
        throw Exception('Failed to load list: ${response.statusCode}');
      }
    } catch (e) {
      print('Error fetching list from $endpoint: $e');
      throw e;
    }
  }
}
