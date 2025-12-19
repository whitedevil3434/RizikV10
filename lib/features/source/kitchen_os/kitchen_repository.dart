import 'package:supabase_flutter/supabase_flutter.dart';

class KitchenRepository {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Constants
  static const String tableKitchens = 'kitchens';
  static const String tableOrders = 'orders';

  /// Check if kitchen has capacity for new order
  Future<bool> checkCapacity(String kitchenId) async {
    try {
      // 1. Get Kitchen Capacity Settings
      final kitchenData = await _supabase
          .from(tableKitchens)
          .select('max_concurrent_orders, active_orders_count')
          .eq('id', kitchenId)
          .single();

      final maxCapacity = kitchenData['max_concurrent_orders'] as int? ?? 5; // Default 5
      final currentActive = kitchenData['active_orders_count'] as int? ?? 0;

      // 2. Check Capacity Lock
      if (currentActive >= maxCapacity) {
        print('🚫 Capacity Lock Active: $currentActive / $maxCapacity');
        return false; // Locked
      }

      return true; // Open
    } catch (e) {
      print('Kitchen Capacity Check Failed: $e');
      return true; // Fail-open to avoid business loss, or false for safety?
                   // Defaulting to true for MVP availability.
    }
  }

  /// Increment Active Orders (Call when new order accepted)
  Future<void> incrementActiveOrders(String kitchenId) async {
    try {
      await _supabase.rpc('increment_kitchen_active_orders', params: {
        'kitchen_id_param': kitchenId
      });
    } catch (e) {
      print('Failed to increment capacity: $e');
      // Fallback: Client-side update (less safe race conditions)
      // await _supabase.from(tableKitchens).update(...);
    }
  }

  /// Decrement Active Orders (Call when order delivered/cancelled)
  Future<void> decrementActiveOrders(String kitchenId) async {
    try {
      await _supabase.rpc('decrement_kitchen_active_orders', params: {
        'kitchen_id_param': kitchenId
      });
    } catch (e) {
      print('Failed to decrement capacity: $e');
    }
  }
}
