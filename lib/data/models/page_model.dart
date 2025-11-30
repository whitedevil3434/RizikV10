import 'package:rizik_v4/data/models/khata_entry.dart';

/// Theme types for modular khata pages
enum KhataThemeType {
  hisabKhata,    // Classic yellow ledger design
  bazarList,     // Checkbox style for shopping lists
  blankNote,     // Clean white notebook style
}

/// Individual page data model for modular architecture
class PageModel {
  final String id;
  final String title;
  final List<KhataEntry> entries;
  final KhataThemeType theme;
  final DateTime createdAt;
  final DateTime updatedAt;

  PageModel({
    String? id,
    required this.title,
    List<KhataEntry>? entries,
    this.theme = KhataThemeType.hisabKhata,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) : id = id ?? DateTime.now().millisecondsSinceEpoch.toString(),
       entries = entries ?? [],
       createdAt = createdAt ?? DateTime.now(),
       updatedAt = updatedAt ?? DateTime.now();

  /// Create a copy with updated values
  PageModel copyWith({
    String? title,
    List<KhataEntry>? entries,
    KhataThemeType? theme,
    DateTime? updatedAt,
  }) {
    return PageModel(
      id: id,
      title: title ?? this.title,
      entries: entries ?? this.entries,
      theme: theme ?? this.theme,
      createdAt: createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
    );
  }

  /// Add a new entry to this page
  PageModel addEntry(KhataEntry entry) {
    final newEntries = List<KhataEntry>.from(entries)..add(entry);
    return copyWith(entries: newEntries);
  }

  /// Remove an entry from this page
  PageModel removeEntry(int index) {
    final newEntries = List<KhataEntry>.from(entries)..removeAt(index);
    return copyWith(entries: newEntries);
  }

  /// Update an existing entry
  PageModel updateEntry(int index, KhataEntry entry) {
    final newEntries = List<KhataEntry>.from(entries);
    newEntries[index] = entry;
    return copyWith(entries: newEntries);
  }

  /// Change the theme of this page
  PageModel changeTheme(KhataThemeType newTheme) {
    return copyWith(theme: newTheme);
  }

  /// Create empty page
  factory PageModel.empty() {
    return PageModel(
      title: 'নতুন পৃষ্ঠা',
      entries: [],
    );
  }

  /// Convert to JSON for persistence
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'entries': entries.map((e) => e.toJson()).toList(),
      'theme': theme.name,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Create from JSON
  factory PageModel.fromJson(Map<String, dynamic> json) {
    return PageModel(
      id: json['id'],
      title: json['title'],
      entries: (json['entries'] as List).map((e) => KhataEntry.fromJson(e)).toList(),
      theme: KhataThemeType.values.firstWhere(
        (e) => e.name == json['theme'],
        orElse: () => KhataThemeType.hisabKhata,
      ),
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }
}
