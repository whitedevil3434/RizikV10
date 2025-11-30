# 📋 Khata Page Type System - Quick Reference

## 🚀 One-Minute Overview

```
Backend sends page_type_id → Frontend renders appropriate template
```

---

## 📊 Five Page Types

| Type | ID | Icon | Use Case | Color |
|------|-----|------|----------|-------|
| Grid/Tabular | `grid` | 📊 | Inventory, Tables | Blue |
| Lined/Noteable | `lined` | 📝 | Notes, Recipes | Orange |
| Checklist | `checklist` | ☑️ | Tasks, Shopping | Green |
| Planner | `planner` | 📅 | Calendar, Roster | Purple |
| Ledger | `ledger` | 💰 | Finance, Expenses | Red/Green |

---

## 💻 Quick Code Examples

### Create Grid Page
```dart
KhataPageTemplate.grid(
  title: 'ইনভেন্টরি',
  columns: ['আইটেম', 'পরিমাণ', 'দাম'],
  rows: [{'আইটেম': 'চাল', 'পরিমাণ': '5kg', 'দাম': '৳250'}],
)
```

### Create Lined Page
```dart
KhataPageTemplate.lined(
  title: 'রেসিপি নোট',
  lineCount: 20,
  content: 'উপকরণ:\n- চাল...',
)
```

### Create Checklist Page
```dart
KhataPageTemplate.checklist(
  title: 'বাজার লিস্ট',
  items: [{'title': 'চাল', 'checked': false, 'priority': 'high'}],
)
```

### Create Planner Page
```dart
KhataPageTemplate.planner(
  title: 'ডিউটি রোস্টার',
  plannerType: 'duty_roster',
  events: {'duties': [{'day': 'রবি', 'person': 'রহিম'}]},
)
```

### Create Ledger Page
```dart
KhataPageTemplate.ledger(
  title: 'খাতা',
  entries: [{'date': '১৫/১১', 'description': 'বেতন', 'amount': '৳50000'}],
)
```

---

## 🗄️ Backend JSON Format

### Grid
```json
{
  "page_type_id": "grid",
  "title": "ইনভেন্টরি",
  "config": {"columns": ["আইটেম", "পরিমাণ"]},
  "data": {"rows": [{"আইটেম": "চাল", "পরিমাণ": "5kg"}]}
}
```

### Lined
```json
{
  "page_type_id": "lined",
  "title": "নোট",
  "config": {"line_count": 20, "show_margin": true},
  "data": {"content": "আমার নোট..."}
}
```

### Checklist
```json
{
  "page_type_id": "checklist",
  "title": "টাস্ক",
  "config": {"show_progress": true},
  "data": {"items": [{"title": "কাজ ১", "checked": false}]}
}
```

### Planner
```json
{
  "page_type_id": "planner",
  "title": "ক্যালেন্ডার",
  "config": {"planner_type": "calendar"},
  "data": {"events": {"15": {"title": "মিটিং"}}}
}
```

### Ledger
```json
{
  "page_type_id": "ledger",
  "title": "খাতা",
  "config": {"show_balance": true},
  "data": {"entries": [{"date": "১৫/১১", "amount": "৳100"}]}
}
```

---

## 🔌 Render Any Page

```dart
// From backend JSON
DynamicKhataPage.fromJson(backendJson, pageNumber: 1)

// From template
DynamicKhataPage(template: template, pageNumber: 1)
```

---

## 📁 File Structure

```
lib/
├── models/
│   └── khata_page_type.dart          # Page type definitions
├── widgets/
│   ├── dynamic_khata_page.dart       # Main renderer
│   └── khata_page_templates/
│       ├── grid_page_template.dart
│       ├── lined_page_template.dart
│       ├── checklist_page_template.dart
│       └── planner_page_template.dart
```

---

## 🗃️ Database Schema

```sql
CREATE TABLE khata_pages (
  id UUID PRIMARY KEY,
  khata_id UUID REFERENCES khatas(id),
  page_number INTEGER,
  page_type_id TEXT,  -- 'grid', 'lined', 'checklist', 'planner', 'ledger'
  title TEXT,
  config JSONB,
  data JSONB
);
```

---

## 🎯 Common Use Cases

### Inventory Tracking (অস্ত্র ৩)
```dart
KhataPageTemplate.grid(
  title: 'Active Khata Inventory',
  columns: ['Item', 'Qty', 'Status'],
  rows: inventoryData,
)
```

### Shopping List (গ্যাপ ১)
```dart
KhataPageTemplate.checklist(
  title: 'Shared Bazar List',
  items: bazarItems,
  showProgress: true,
)
```

### Duty Roster (অস্ত্র ৫)
```dart
KhataPageTemplate.planner(
  title: 'Weekly Duties',
  plannerType: 'duty_roster',
  events: dutyData,
)
```

### Recipe Notes
```dart
KhataPageTemplate.lined(
  title: 'Biryani Recipe',
  content: recipeText,
)
```

### Personal Finance
```dart
KhataPageTemplate.ledger(
  title: 'My Khata',
  entries: transactions,
)
```

---

## ⚡ Quick Integration

### Step 1: Add to Provider
```dart
Future<List<KhataPageTemplate>> getKhataPages(String khataId) async {
  final response = await supabase
    .from('khata_pages')
    .select()
    .eq('khata_id', khataId);
  
  return response.map((json) => KhataPageTemplate.fromJson(json)).toList();
}
```

### Step 2: Render in Screen
```dart
final templates = await provider.getKhataPages(khataId);
final pages = templates.map((t, i) => 
  DynamicKhataPage(template: t, pageNumber: i + 1)
).toList();

KhataBook(pages: pages)
```

### Step 3: Handle Updates
```dart
DynamicKhataPage(
  template: template,
  pageNumber: 1,
  onDataChanged: (data) {
    provider.savePageData(khataId, 1, data);
  },
)
```

---

## 🎨 Styling

| Template | Background | Accent | Border |
|----------|-----------|--------|--------|
| Grid | Cream | Blue | Light Blue |
| Lined | Cream | Orange | Tan |
| Checklist | Cream | Green | Light Green |
| Planner | Cream | Purple | Light Purple |
| Ledger | Cream | Red/Green | Brown |

---

## ✅ Features Checklist

- [x] Five page types implemented
- [x] Dynamic rendering from JSON
- [x] Backend integration ready
- [x] Data change callbacks
- [x] Bengali text support
- [x] Page flip animation compatible
- [x] Responsive design
- [x] Accessibility support

---

## 📚 Documentation

- `KHATA_PAGE_TYPE_SYSTEM.md` - Full system documentation
- `KHATA_PAGE_TYPE_INTEGRATION_GUIDE.md` - Integration steps
- `KHATA_PAGE_TYPE_VISUAL_GUIDE.md` - Visual examples
- `KHATA_PAGE_TYPE_QUICK_REFERENCE.md` - This file

---

## 🆘 Troubleshooting

### Page not rendering?
Check `page_type_id` matches one of: `grid`, `lined`, `checklist`, `planner`, `ledger`

### Data not saving?
Verify `onDataChanged` callback is connected to provider

### Wrong template showing?
Ensure backend JSON structure matches expected format

### Styling issues?
Check that all templates use cream background (`#FFFEF7`)

---

## 🔗 Related Features

- **Khata OS** - Main ledger system
- **Active Khata** (অস্ত্র ৩) - Uses Grid template
- **Roll Allocation** (অস্ত্র ৫) - Uses Planner template
- **Shared Bazar** (গ্যাপ ১) - Uses Checklist template
- **Rizik Academy** (অস্ত্র ১৫) - Uses Lined template

---

**Quick Reference Version:** 1.0  
**Print this page for easy reference!**
