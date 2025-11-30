/// Khata Page Type System
/// Defines different template types for dynamic page rendering
/// Backend stores page_type_id, frontend renders accordingly

enum KhataPageType {
  /// 1. Grid/Tabular Template
  /// For structured data like Inventory, Inspection Checklist
  /// Used in: Active Khata OS (অস্ত্র ৩), Roll Allocation (অস্ত্র ৫)
  grid('grid', 'গ্রিড/টেবুলার', '📊'),
  
  /// 2. Lined/Noteable Template
  /// For notes, recipes, personal goals, tutoring schedules
  /// Used in: Recipe Notes, Personal Goals, Rizik Academy (অস্ত্র ১৫)
  lined('lined', 'লাইনড/নোটেবল', '📝'),
  
  /// 3. Checklist Template
  /// For task tracking with checkboxes
  /// Used in: Shared Bazar List (গ্যাপ ১), Incentive Cleaning Roster (অস্ত্র ৬)
  checklist('checklist', 'চেকলিস্ট', '☑️'),
  
  /// 4. Cover/Planner Template
  /// For graphical displays like calendars, duty rosters
  /// Used in: Duty Roster (অস্ত্র ৫), Social Contract (অস্ত্র ১৬)
  planner('planner', 'কভার/প্ল্যানার', '📅'),
  
  /// 5. Financial Ledger (Traditional)
  /// Classic debit/credit ledger format
  /// Used in: Personal Khata, Shared Khata, Rent Tracking
  ledger('ledger', 'আর্থিক খাতা', '💰');

  const KhataPageType(this.key, this.nameBn, this.emoji);
  
  final String key;
  final String nameBn;
  final String emoji;
  
  /// Get page type from key
  static KhataPageType fromKey(String key) {
    return KhataPageType.values.firstWhere(
      (type) => type.key == key,
      orElse: () => KhataPageType.ledger,
    );
  }
}

/// Page Template Configuration
/// Defines how data should be rendered for each page type
class KhataPageTemplate {
  final KhataPageType type;
  final String title;
  final Map<String, dynamic> config;
  final Map<String, dynamic>? data;

  const KhataPageTemplate({
    required this.type,
    required this.title,
    required this.config,
    this.data,
  });

  /// Create Grid/Tabular template
  factory KhataPageTemplate.grid({
    required String title,
    required List<String> columns,
    required List<Map<String, dynamic>> rows,
    bool editable = true,
  }) {
    return KhataPageTemplate(
      type: KhataPageType.grid,
      title: title,
      config: {
        'columns': columns,
        'editable': editable,
        'sortable': true,
      },
      data: {
        'rows': rows,
      },
    );
  }

  /// Create Lined/Noteable template
  factory KhataPageTemplate.lined({
    required String title,
    int lineCount = 20,
    bool showMargin = true,
    String? content,
  }) {
    return KhataPageTemplate(
      type: KhataPageType.lined,
      title: title,
      config: {
        'line_count': lineCount,
        'show_margin': showMargin,
        'line_spacing': 45.0,
      },
      data: {
        'content': content ?? '',
      },
    );
  }

  /// Create Checklist template
  factory KhataPageTemplate.checklist({
    required String title,
    required List<Map<String, dynamic>> items,
    bool showProgress = true,
  }) {
    return KhataPageTemplate(
      type: KhataPageType.checklist,
      title: title,
      config: {
        'show_progress': showProgress,
        'allow_reorder': true,
      },
      data: {
        'items': items,
      },
    );
  }

  /// Create Planner/Calendar template
  factory KhataPageTemplate.planner({
    required String title,
    required String plannerType, // 'calendar', 'duty_roster', 'schedule'
    required Map<String, dynamic> events,
  }) {
    return KhataPageTemplate(
      type: KhataPageType.planner,
      title: title,
      config: {
        'planner_type': plannerType,
        'show_weekends': true,
      },
      data: {
        'events': events,
      },
    );
  }

  /// Create Financial Ledger template
  factory KhataPageTemplate.ledger({
    required String title,
    required List<Map<String, dynamic>> entries,
    bool showBalance = true,
  }) {
    return KhataPageTemplate(
      type: KhataPageType.ledger,
      title: title,
      config: {
        'show_balance': showBalance,
        'currency': '৳',
      },
      data: {
        'entries': entries,
      },
    );
  }

  /// Convert to JSON for backend storage
  Map<String, dynamic> toJson() {
    return {
      'page_type_id': type.key,
      'title': title,
      'config': config,
      'data': data,
    };
  }

  /// Create from JSON (from backend)
  factory KhataPageTemplate.fromJson(Map<String, dynamic> json) {
    return KhataPageTemplate(
      type: KhataPageType.fromKey(json['page_type_id'] as String),
      title: json['title'] as String,
      config: json['config'] as Map<String, dynamic>,
      data: json['data'] as Map<String, dynamic>?,
    );
  }
}
