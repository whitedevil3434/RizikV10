# 🔌 Khata Page Type System - Integration Guide

## দ্রুত শুরু করুন (Quick Start)

### ধাপ ১: Provider আপডেট করুন

`lib/providers/khata_provider.dart` এ নতুন method যোগ করুন:

```dart
import '../models/khata_page_type.dart';
import '../widgets/dynamic_khata_page.dart';

class KhataProvider extends ChangeNotifier {
  // ... existing code ...

  /// Get pages with dynamic templates
  Future<List<KhataPageTemplate>> getKhataPages(String khataId) async {
    // TODO: Fetch from Supabase
    // For now, return example pages
    return [
      KhataPageExamples.createInventoryPage(),
      KhataPageExamples.createBazarListPage(),
      KhataPageExamples.createDutyRosterPage(),
    ];
  }

  /// Save page data to backend
  Future<void> savePageData(
    String khataId,
    int pageNumber,
    Map<String, dynamic> data,
  ) async {
    // TODO: Save to Supabase
    print('Saving page $pageNumber data: $data');
    notifyListeners();
  }

  /// Create new page with template
  Future<void> createPage(
    String khataId,
    KhataPageTemplate template,
  ) async {
    // TODO: Save to Supabase
    print('Creating new page: ${template.title}');
    notifyListeners();
  }
}
```

---

### ধাপ ২: KhataOSScreen আপডেট করুন

`lib/screens/khata_os_screen.dart` modify করুন:

```dart
import '../widgets/dynamic_khata_page.dart';
import '../models/khata_page_type.dart';

class _KhataOSScreenState extends State<KhataOSScreen> {
  List<KhataPageTemplate>? _pageTemplates;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadPages();
  }

  Future<void> _loadPages() async {
    final provider = context.read<KhataProvider>();
    final templates = await provider.getKhataPages(widget.khataId);
    
    setState(() {
      _pageTemplates = templates;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_pageTemplates == null || _pageTemplates!.isEmpty) {
      return _buildEmptyState(context);
    }

    // Create dynamic page widgets
    final pageWidgets = List.generate(_pageTemplates!.length, (index) {
      return DynamicKhataPage(
        template: _pageTemplates![index],
        pageNumber: index + 1,
        onDataChanged: (data) {
          _savePageData(index + 1, data);
        },
      );
    });

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text('📚 খাতা OS'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: _showAddPageOptions,
          ),
        ],
      ),
      body: KhataBook(
        pageCount: pageWidgets.length,
        title: 'আমার খাতা',
        pages: pageWidgets,
      ),
    );
  }

  void _savePageData(int pageNumber, Map<String, dynamic> data) {
    final provider = context.read<KhataProvider>();
    provider.savePageData(widget.khataId, pageNumber, data);
  }

  void _showAddPageOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => _AddPageSheet(
        onPageTypeSelected: (template) {
          final provider = context.read<KhataProvider>();
          provider.createPage(widget.khataId, template);
          Navigator.pop(context);
          _loadPages(); // Reload pages
        },
      ),
    );
  }
}
```

---

### ধাপ ৩: Add Page Sheet তৈরি করুন

```dart
class _AddPageSheet extends StatelessWidget {
  final Function(KhataPageTemplate) onPageTypeSelected;

  const _AddPageSheet({required this.onPageTypeSelected});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'নতুন পৃষ্ঠা যোগ করুন',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 20),
          
          _buildPageTypeOption(
            context,
            icon: '📊',
            title: 'গ্রিড/টেবুলার',
            subtitle: 'ইনভেন্টরি, চেকলিস্ট',
            onTap: () => onPageTypeSelected(
              KhataPageExamples.createInventoryPage(),
            ),
          ),
          
          _buildPageTypeOption(
            context,
            icon: '📝',
            title: 'লাইনড/নোটেবল',
            subtitle: 'নোট, রেসিপি',
            onTap: () => onPageTypeSelected(
              KhataPageExamples.createRecipePage(),
            ),
          ),
          
          _buildPageTypeOption(
            context,
            icon: '☑️',
            title: 'চেকলিস্ট',
            subtitle: 'বাজার লিস্ট, টাস্ক',
            onTap: () => onPageTypeSelected(
              KhataPageExamples.createBazarListPage(),
            ),
          ),
          
          _buildPageTypeOption(
            context,
            icon: '📅',
            title: 'প্ল্যানার',
            subtitle: 'ক্যালেন্ডার, ডিউটি রোস্টার',
            onTap: () => onPageTypeSelected(
              KhataPageExamples.createDutyRosterPage(),
            ),
          ),
          
          _buildPageTypeOption(
            context,
            icon: '💰',
            title: 'আর্থিক খাতা',
            subtitle: 'ডেবিট/ক্রেডিট লেজার',
            onTap: () => onPageTypeSelected(
              KhataPageExamples.createFinancialLedgerPage(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPageTypeOption(
    BuildContext context, {
    required String icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Text(icon, style: TextStyle(fontSize: 32)),
      title: Text(title, style: TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(subtitle),
      onTap: onTap,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      tileColor: Colors.grey.shade50,
      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    );
  }
}
```

---

### ধাপ ৪: Supabase Integration

#### Create Table
```sql
-- Run this in Supabase SQL Editor
CREATE TABLE khata_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  khata_id UUID REFERENCES khatas(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  page_type_id TEXT NOT NULL,
  title TEXT NOT NULL,
  config JSONB NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(khata_id, page_number)
);

CREATE INDEX idx_khata_pages_khata_id ON khata_pages(khata_id);
CREATE INDEX idx_khata_pages_type ON khata_pages(page_type_id);
```

#### Fetch Pages from Supabase
```dart
Future<List<KhataPageTemplate>> getKhataPages(String khataId) async {
  final response = await supabase
      .from('khata_pages')
      .select()
      .eq('khata_id', khataId)
      .order('page_number');

  if (response == null) return [];

  return (response as List)
      .map((json) => KhataPageTemplate.fromJson(json))
      .toList();
}
```

#### Save Page to Supabase
```dart
Future<void> createPage(String khataId, KhataPageTemplate template) async {
  // Get next page number
  final countResponse = await supabase
      .from('khata_pages')
      .select('page_number')
      .eq('khata_id', khataId)
      .order('page_number', ascending: false)
      .limit(1);

  final nextPageNumber = countResponse.isEmpty 
      ? 1 
      : (countResponse[0]['page_number'] as int) + 1;

  // Insert new page
  await supabase.from('khata_pages').insert({
    'khata_id': khataId,
    'page_number': nextPageNumber,
    'page_type_id': template.type.key,
    'title': template.title,
    'config': template.config,
    'data': template.data,
  });
}
```

#### Update Page Data
```dart
Future<void> savePageData(
  String khataId,
  int pageNumber,
  Map<String, dynamic> data,
) async {
  await supabase
      .from('khata_pages')
      .update({
        'data': data,
        'updated_at': DateTime.now().toIso8601String(),
      })
      .eq('khata_id', khataId)
      .eq('page_number', pageNumber);
}
```

---

### ধাপ ৫: Testing

#### Test 1: Create Different Page Types
```dart
void testPageCreation() async {
  final provider = KhataProvider();
  
  // Create grid page
  await provider.createPage(
    'khata_123',
    KhataPageExamples.createInventoryPage(),
  );
  
  // Create checklist page
  await provider.createPage(
    'khata_123',
    KhataPageExamples.createBazarListPage(),
  );
  
  // Verify
  final pages = await provider.getKhataPages('khata_123');
  print('Created ${pages.length} pages');
}
```

#### Test 2: Data Updates
```dart
void testDataUpdate() async {
  final provider = KhataProvider();
  
  // Update checklist item
  await provider.savePageData(
    'khata_123',
    2, // page number
    {
      'items': [
        {'title': 'চাল', 'checked': true},
        {'title': 'ডাল', 'checked': false},
      ]
    },
  );
}
```

---

## 🎯 Use Cases

### Use Case 1: Active Khata OS (অস্ত্র ৩)
```dart
// Create inventory tracking page
final inventoryPage = KhataPageTemplate.grid(
  title: 'রান্নাঘর ইনভেন্টরি',
  columns: ['আইটেম', 'পরিমাণ', 'শেষ আপডেট'],
  rows: [
    {'আইটেম': 'চাল', 'পরিমাণ': '5 কেজি', 'শেষ আপডেট': '১৫/১১'},
  ],
);
```

### Use Case 2: Shared Bazar List (গ্যাপ ১)
```dart
// Create shared shopping list
final bazarPage = KhataPageTemplate.checklist(
  title: 'শেয়ারড বাজার লিস্ট',
  items: [
    {'title': 'চাল ৫ কেজি', 'checked': false, 'priority': 'high'},
    {'title': 'ডাল ২ কেজি', 'checked': false, 'priority': 'high'},
  ],
  showProgress: true,
);
```

### Use Case 3: Duty Roster (অস্ত্র ৫)
```dart
// Create duty roster
final rosterPage = KhataPageTemplate.planner(
  title: 'সাপ্তাহিক ডিউটি',
  plannerType: 'duty_roster',
  events: {
    'duties': [
      {'day': 'রবি', 'person': 'রহিম', 'task': 'রান্না'},
    ],
  },
);
```

### Use Case 4: Recipe Notes
```dart
// Create recipe page
final recipePage = KhataPageTemplate.lined(
  title: 'বিরিয়ানি রেসিপি',
  lineCount: 25,
  content: 'উপকরণ:\n- চাল ২ কাপ\n- মাংস ৫০০ গ্রাম...',
);
```

---

## ✅ Checklist

- [ ] Models created (`khata_page_type.dart`)
- [ ] Template widgets created (grid, lined, checklist, planner)
- [ ] Dynamic renderer created (`dynamic_khata_page.dart`)
- [ ] Provider updated with new methods
- [ ] KhataOSScreen updated to use dynamic pages
- [ ] Supabase table created
- [ ] Supabase queries implemented
- [ ] Add page sheet created
- [ ] Testing completed
- [ ] Documentation reviewed

---

## 🚀 Next Steps

1. **Test with real data** - Create pages and verify rendering
2. **Add more templates** - Create custom templates as needed
3. **Implement sync** - Real-time sync with Supabase
4. **Add animations** - Smooth transitions between page types
5. **Export feature** - Export pages as PDF/Image

---

**Status:** ✅ Ready for Integration  
**Estimated Time:** 2-3 hours for full integration
