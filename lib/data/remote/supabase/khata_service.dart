import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:rizik_v4/data/models/khata.dart';
import 'package:rizik_v4/data/models/khata_entry.dart';

class KhataService {
  SupabaseClient get _client => Supabase.instance.client;

  /// Create a new khata
  Future<Khata> createKhata(Khata khata) async {
    final response = await _client
        .from('khatas')
        .insert(khata.toJson()) // Need to ensure toJson matches DB schema
        .select()
        .single();

    return Khata.fromJson(response);
  }

  /// Get khata by ID
  Future<Khata> getKhataById(String id) async {
    final response = await _client
        .from('khatas')
        .select('''
          *,
          entries:khata_entries(*)
        ''')
        .eq('id', id)
        .single();

    return Khata.fromJson(response);
  }

  /// Get user's khatas
  Future<List<Khata>> getUserKhatas(String userId) async {
    final response = await _client
        .from('khatas')
        .select('''
          *,
          entries:khata_entries(*)
        ''')
        .eq('user_id', userId);

    return (response as List).map((json) => Khata.fromJson(json)).toList();
  }

  /// Add entry to khata
  Future<void> addEntry(KhataEntry entry, String khataId) async {
    final entryJson = entry.toJson();
    entryJson['khata_id'] = khataId; // Add foreign key

    await _client.from('khata_entries').insert(entryJson);
  }

  /// Update entry
  Future<void> updateEntry(KhataEntry entry) async {
    await _client
        .from('khata_entries')
        .update(entry.toJson())
        .eq('id', entry.id);
  }

  /// Delete entry
  Future<void> deleteEntry(String entryId) async {
    await _client.from('khata_entries').delete().eq('id', entryId);
  }
}
