import 'package:hive_flutter/hive_flutter.dart';
import 'hive_adapters.dart';

class LocalDbWrapper {
  static const String boxInventory = 'inventory';
  static const String boxSettings = 'settings';
  static const String boxCache = 'cache';

  static Future<void> init() async {
    await Hive.initFlutter();
    HiveAdapters.registerAdapters();
    
    await Hive.openBox(boxInventory);
    await Hive.openBox(boxSettings);
    await Hive.openBox(boxCache);
  }

  // Generic Put
  static Future<void> put(String boxName, String key, dynamic value) async {
    final box = Hive.box(boxName);
    await box.put(key, value);
  }

  // Generic Get
  static dynamic get(String boxName, String key, {dynamic defaultValue}) {
    final box = Hive.box(boxName);
    return box.get(key, defaultValue: defaultValue);
  }

  // Generic Delete
  static Future<void> delete(String boxName, String key) async {
    final box = Hive.box(boxName);
    await box.delete(key);
  }

  // Clear Box
  static Future<void> clear(String boxName) async {
    final box = Hive.box(boxName);
    await box.clear();
  }
  
  // Get all values from a box
  static List<dynamic> getAll(String boxName) {
    final box = Hive.box(boxName);
    return box.values.toList();
  }
}
