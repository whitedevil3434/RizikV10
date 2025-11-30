# 📚 Khata OS - Dynamic Page Type System

## সিস্টেম ওভারভিউ (System Overview)

এই সিস্টেম ব্যাকএন্ডে (Supabase/SQL) প্রতিটি খাতা পৃষ্ঠাকে একটি নির্দিষ্ট **Page Type ID** দিয়ে ট্যাগ করে। ফ্রন্টএন্ড এই ID পড়ে সঠিক টেমপ্লেট রেন্ডার করে।

## 🎯 পাঁচটি Page Type

### ১. Grid/Tabular (গ্রিড/টেবুলার) 📊
**উদ্দেশ্য:** কাঠামোগত ডেটা লগ করা  
**ব্যবহার:** Inventory, Inspection Checklist, Roll Allocation (অস্ত্র ৩, ৫)

**প্রযুক্তিগত বাস্তবায়ন:**
- Dynamic DataTable widget
- JSON format data input
- Dynamic column headers
- Sortable and editable rows

**Backend JSON Structure:**
```json
{
  "page_type_id": "grid",
  "title": "রান্নাঘর ইনভেন্টরি",
  "config": {
    "columns": ["আইটেম", "পরিমাণ", "দাম", "তারিখ"],
    "editable": true,
    "sortable": true
  },
  "data": {
    "rows": [
      {"আইটেম": "চাল", "পরিমাণ": "5 কেজি", "দাম": "৳250", "তারিখ": "১৫/১১"},
      {"আইটেম": "ডাল", "পরিমাণ": "2 কেজি", "দাম": "৳180", "তারিখ": "১৫/১১"}
    ]
  }
}
```

---

### ২. Lined/Noteable (লাইনড/নোটেবল) 📝
**উদ্দেশ্য:** নোট, রেসিপি, পার্সোনাল গোল ট্র্যাক করা  
**ব্যবহার:** Recipe Notes, Personal Goals, Rizik Academy (অস্ত্র ১৫)

**প্রযুক্তিগত বাস্তবায়ন:**
- CustomPainter for drawing lines
- Rich Text Field for content
- Handwriting-like feel
- Margin line support

**Backend JSON Structure:**
```json
{
  "page_type_id": "lined",
  "title": "রেসিপি নোট - বিরিয়ানি",
  "config": {
    "line_count": 25,
    "show_margin": true,
    "line_spacing": 45.0
  },
  "data": {
    "content": "উপকরণ:\n- বাসমতি চাল ২ কাপ\n- মুরগির মাংস ৫০০ গ্রাম..."
  }
}
```

---

### ৩. Checklist (চেকলিস্ট) ☑️
**উদ্দেশ্য:** দায়িত্ব ট্র্যাক করা  
**ব্যবহার:** Shared Bazar List (গ্যাপ ১), Incentive Cleaning Roster (অস্ত্র ৬)

**প্রযুক্তিগত বাস্তবায়ন:**
- Stateful Checkbox widgets
- Boolean (true/false) values in database
- Progress tracking
- Priority indicators

**Backend JSON Structure:**
```json
{
  "page_type_id": "checklist",
  "title": "শেয়ারড বাজার লিস্ট",
  "config": {
    "show_progress": true,
    "allow_reorder": true
  },
  "data": {
    "items": [
      {"title": "চাল ৫ কেজি", "checked": false, "priority": "high"},
      {"title": "ডাল ২ কেজি", "checked": false, "priority": "high"},
      {"title": "তেল ১ লিটার", "checked": true, "priority": "medium"}
    ]
  }
}
```

---

### ৪. Cover/Planner (কভার/প্ল্যানার) 📅
**উদ্দেশ্য:** গ্রাফিক্যাল প্রদর্শন  
**ব্যবহার:** Duty Roster (অস্ত্র ৫), Social Contract (অস্ত্র ১৬)

**প্রযুক্তিগত বাস্তবায়ন:**
- Fixed Template Widget
- Calendar view
- Duty roster view
- Schedule view
- Auto plug-in from database

**Backend JSON Structure (Duty Roster):**
```json
{
  "page_type_id": "planner",
  "title": "সাপ্তাহিক ডিউটি রোস্টার",
  "config": {
    "planner_type": "duty_roster",
    "show_weekends": true
  },
  "data": {
    "events": {
      "duties": [
        {"day": "রবি", "person": "রহিম", "task": "রান্না"},
        {"day": "সোম", "person": "করিম", "task": "পরিষ্কার"}
      ]
    }
  }
}
```

**Backend JSON Structure (Calendar):**
```json
{
  "page_type_id": "planner",
  "title": "নভেম্বর ২০২৫",
  "config": {
    "planner_type": "calendar",
    "show_weekends": true
  },
  "data": {
    "events": {
      "15": {"title": "মিটিং", "time": "১০:০০"},
      "20": {"title": "পেমেন্ট", "time": "১৫:০০"}
    }
  }
}
```

---

### ৫. Ledger (আর্থিক খাতা) 💰
**উদ্দেশ্য:** ক্লাসিক ডেবিট/ক্রেডিট লেজার  
**ব্যবহার:** Personal Khata, Shared Khata, Rent Tracking

**প্রযুক্তিগত বাস্তবায়ন:**
- Traditional ledger format
- Debit/Credit columns
- Balance calculation
- Entry locking

**Backend JSON Structure:**
```json
{
  "page_type_id": "ledger",
  "title": "ব্যক্তিগত খাতা",
  "config": {
    "show_balance": true,
    "currency": "৳"
  },
  "data": {
    "entries": [
      {
        "id": "entry_1",
        "date": "১৫/১১",
        "description": "বেতন",
        "amount": "৳50000",
        "isCredit": true,
        "isChecked": false,
        "timestamp": "2025-11-15T10:00:00Z",
        "isLocked": false
      }
    ]
  }
}
```

---

## 🔧 Implementation Files

### Models
- `lib/models/khata_page_type.dart` - Page type definitions and template configurations

### Widgets (Templates)
- `lib/widgets/khata_page_templates/grid_page_template.dart` - Grid/Tabular renderer
- `lib/widgets/khata_page_templates/lined_page_template.dart` - Lined/Noteable renderer
- `lib/widgets/khata_page_templates/checklist_page_template.dart` - Checklist renderer
- `lib/widgets/khata_page_templates/planner_page_template.dart` - Planner/Calendar renderer
- `lib/widgets/khata_page.dart` - Traditional ledger renderer (existing)

### Dynamic Renderer
- `lib/widgets/dynamic_khata_page.dart` - Main router that reads page_type_id and renders appropriate template

---

## 📖 Usage Examples

### Example 1: Render from Backend JSON
```dart
// Backend sends this JSON
final backendJson = {
  "page_type_id": "grid",
  "title": "রান্নাঘর ইনভেন্টরি",
  "config": {"columns": ["আইটেম", "পরিমাণ", "দাম"]},
  "data": {"rows": [...]}
};

// Frontend renders automatically
final page = DynamicKhataPage.fromJson(
  backendJson,
  pageNumber: 1,
  onDataChanged: (data) {
    // Save to backend
    print('Data changed: $data');
  },
);
```

### Example 2: Create Programmatically
```dart
// Create a checklist page
final template = KhataPageTemplate.checklist(
  title: 'শেয়ারড বাজার লিস্ট',
  items: [
    {'title': 'চাল ৫ কেজি', 'checked': false, 'priority': 'high'},
    {'title': 'ডাল ২ কেজি', 'checked': false, 'priority': 'high'},
  ],
  showProgress: true,
);

// Render the page
final page = DynamicKhataPage(
  template: template,
  pageNumber: 1,
);
```

### Example 3: Use in KhataBook
```dart
KhataBook(
  pageCount: 5,
  title: 'আমার খাতা',
  pages: [
    DynamicKhataPage.fromJson(page1Json, 1),
    DynamicKhataPage.fromJson(page2Json, 2),
    DynamicKhataPage.fromJson(page3Json, 3),
  ],
)
```

---

## 🗄️ Database Schema (Supabase)

### Table: khata_pages
```sql
CREATE TABLE khata_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  khata_id UUID REFERENCES khatas(id),
  page_number INTEGER NOT NULL,
  page_type_id TEXT NOT NULL, -- 'grid', 'lined', 'checklist', 'planner', 'ledger'
  title TEXT NOT NULL,
  config JSONB NOT NULL, -- Template configuration
  data JSONB, -- Page data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX idx_khata_pages_khata_id ON khata_pages(khata_id);
CREATE INDEX idx_khata_pages_type ON khata_pages(page_type_id);
```

### Example Query
```sql
-- Get all pages for a khata
SELECT * FROM khata_pages 
WHERE khata_id = 'xxx-xxx-xxx' 
ORDER BY page_number;

-- Get only checklist pages
SELECT * FROM khata_pages 
WHERE page_type_id = 'checklist';
```

---

## 🎨 Visual Design

### Color Scheme
- **Grid:** Blue accent (`Colors.blue.shade600`)
- **Lined:** Amber/Orange accent (`Colors.amber`)
- **Checklist:** Green accent (`Colors.green.shade600`)
- **Planner:** Purple accent (`Colors.purple`)
- **Ledger:** Red/Green for debit/credit

### Paper Texture
All templates use cream paper color (`Color(0xFFFFFEF7)`) with subtle line patterns for authentic khata feel.

---

## 🚀 Integration with Existing Features

### Active Khata OS (অস্ত্র ৩)
Use **Grid** template for inventory tracking:
```dart
KhataPageTemplate.grid(
  title: 'Active Khata Inventory',
  columns: ['Item', 'Quantity', 'Status'],
  rows: inventoryData,
)
```

### Roll Allocation (অস্ত্র ৫)
Use **Planner** template for duty roster:
```dart
KhataPageTemplate.planner(
  title: 'Duty Roster',
  plannerType: 'duty_roster',
  events: dutyData,
)
```

### Shared Bazar List (গ্যাপ ১)
Use **Checklist** template:
```dart
KhataPageTemplate.checklist(
  title: 'Shared Bazar List',
  items: bazarItems,
  showProgress: true,
)
```

### Rizik Academy (অস্ত্র ১৫)
Use **Lined** template for tutoring notes:
```dart
KhataPageTemplate.lined(
  title: 'Tutoring Schedule',
  lineCount: 20,
  content: scheduleNotes,
)
```

---

## ✅ Benefits

1. **Flexibility:** Backend can create any type of page dynamically
2. **Reusability:** Same templates used across different features
3. **Scalability:** Easy to add new page types
4. **Type Safety:** Strongly typed with enums and models
5. **Beautiful UI:** Authentic khata feel with paper textures
6. **Interactive:** Real-time updates with onDataChanged callbacks

---

## 🔮 Future Enhancements

1. **Custom Templates:** Allow users to create their own templates
2. **Template Marketplace:** Share templates with other users
3. **AI Suggestions:** Auto-suggest template based on content
4. **Offline Support:** Cache templates for offline use
5. **Export:** Export pages as PDF/Image
6. **Collaboration:** Real-time collaborative editing

---

## 📝 Notes

- All templates support Bengali text
- Page flip animation works with all templates
- Templates are responsive and work on all screen sizes
- Data changes are tracked and can be synced to backend
- Templates maintain authentic khata aesthetics

---

**Created:** November 15, 2025  
**Version:** 1.0  
**Status:** ✅ Implementation Complete
