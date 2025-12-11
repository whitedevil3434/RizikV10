import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/data/local/local_db_wrapper.dart';
import '../models/inventory_item.dart';

class InventoryRepository {
  final SupabaseClient _supabase = Supabase.instance.client;
  static const String _boxName = LocalDbWrapper.boxInventory;

  // Fetch from Local (Instant)
  List<InventoryItem> getLocalInventory() {
    final data = LocalDbWrapper.getAll(_boxName);
    return data.map((e) => InventoryItem.fromJson(Map<String, dynamic>.from(e))).toList();
  }

  // Fetch from Remote & Sync
  Future<List<InventoryItem>> syncInventory(String squadId) async {
    try {
      // 1. Fetch from Supabase
      final response = await _supabase
          .from('inventory')
          .select()
          .eq('squad_id', squadId);

      final List<dynamic> data = response as List<dynamic>;
      final items = data.map((json) => InventoryItem.fromJson(json)).toList();

      // 2. Update Local Hive
      await LocalDbWrapper.clear(_boxName); // Simple strategy: Remote overwrites local
      for (var item in items) {
        await LocalDbWrapper.put(_boxName, item.id, item.toJson());
      }

      return items;
    } catch (e) {
      // If offline, return local
      return getLocalInventory();
    }
  }

  // Add Item (Optimistic UI)
  Future<void> addItem(InventoryItem item) async {
    // 1. Save Local
    await LocalDbWrapper.put(_boxName, item.id, item.toJson());

    // 2. Save Remote (Fire & Forget / Queue)
    try {
      await _supabase.from('inventory').insert(item.toJson());
    } catch (e) {
      // TODO: Add to OfflineSyncWrapper queue
      print("Offline: Queued for sync");
    }
  }
}
