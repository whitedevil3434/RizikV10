# 📚 Khata OS - Quick Reference Card

## 🚀 Quick Access
```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (_) => const KhataScreen()),
);
```

## 📁 File Structure
```
lib/
├── screens/
│   ├── khata_screen.dart              # Main screen (3 tabs)
│   ├── expense_entry_screen.dart      # Manual entry form
│   └── monthly_report_screen.dart     # Reports & charts
├── models/
│   ├── khata.dart                     # Khata types & models
│   ├── khata_entry.dart               # Entry with categories
│   └── inventory.dart                 # Inventory & recipes
├── providers/
│   ├── khata_provider.dart            # State management
│   └── inventory_provider.dart        # Inventory state
├── services/
│   ├── voice_input_service.dart       # Voice NLP
│   └── ai_pantry_service.dart         # Cost calculation
└── widgets/
    └── voice_input_widget.dart        # Voice UI
```

## 🎯 Key Features

### 4 Khata Types
- **Personal** (ব্যক্তিগত) - Personal expenses
- **Shared** (শেয়ারড) - Roommate expenses
- **Squad** (স্কোয়াড) - Squad expenses
- **Rent** (ভাড়া) - Rent tracking

### 11 Categories
```
🍽️ Food (খাবার)
🛒 Groceries (মুদি)
💡 Utilities (ইউটিলিটি)
🏠 Rent (ভাড়া)
🚗 Transport (যাতায়াত)
🎬 Entertainment (বিনোদন)
⚕️ Health (স্বাস্থ্য)
📚 Education (শিক্ষা)
🛍️ Shopping (কেনাকাটা)
💰 Savings (সঞ্চয়)
📝 Other (অন্যান্য)
```

## 💻 Code Examples

### Add Expense
```dart
await khataProvider.addExpense(
  description: 'Lunch at restaurant',
  amount: 500.0,
  category: KhataCategory.food,
  notes: 'With friends',
);
```

### Add Income
```dart
await khataProvider.addIncome(
  description: 'Salary',
  amount: 50000.0,
  notes: 'Monthly salary',
);
```

### Auto-log from Order
```dart
await khataProvider.autoLogOrderExpense(order);
```

### Use Recipe
```dart
await inventoryProvider.useRecipe(
  recipe: recipe,
  servings: 4,
  khataProvider: khataProvider, // Auto-logs cost
);
```

### Get Monthly Report
```dart
final report = khataProvider.getMonthlyReport(
  khataId,
  DateTime.now(),
);
```

### Get Recommendations
```dart
final tips = khataProvider.getSavingsRecommendations(khataId);
```

## 🎮 Game Mechanics

### Unlock Requirements
- Use Rizik for **10 days**
- Progress shown: "Day X/10"
- Reward: **500 XP** + Khata OS access

### XP Rewards
| Action | XP |
|--------|-----|
| Add expense | +50 |
| Add income | +50 |
| Monthly review | +100 |
| Follow tip | +150 |
| Unlock feature | +500 |

## 🎨 UI Components

### Main Screen Tabs
1. **এন্ট্রি (Entries)** - List of all entries
2. **রিপোর্ট (Report)** - Monthly charts
3. **ইনভেন্টরি (Inventory)** - Pantry items

### FAB Buttons
- **Purple Mic** 🎤 - Voice input
- **Blue Plus** ➕ - Manual entry

### Entry Card Colors
- **Green border** = Income
- **Red border** = Expense
- **Orange lock** 🔒 = Locked (can't delete)

### Balance Card Colors
- **Green** = Positive balance
- **Red** = Negative balance

## 📊 Report Features

### Summary Cards
- Total Income (আয়)
- Total Expenses (খরচ)
- Net Savings (সঞ্চয়)

### Savings Rate
- **Green (20%+)** = Excellent 🎉
- **Orange (10-20%)** = Good 👍
- **Red (<10%)** = Improve ⚠️

### Charts
- Category breakdown with %
- Top 5 expenses ranking
- Progress bars

### AI Tips
- Personalized recommendations
- Bengali language
- Based on spending patterns

## 🔧 Provider Setup

### main.dart
```dart
MultiProvider(
  providers: [
    ChangeNotifierProvider(create: (_) => KhataProvider()),
    ChangeNotifierProvider(create: (_) => InventoryProvider()),
  ],
  child: MyApp(),
)
```

## 🎯 Common Tasks

### Create New Khata
```dart
await khataProvider.createKhataByType(KhataType.personal);
```

### Switch Khata
```dart
// Use dropdown in app bar
// Or programmatically:
final khata = khataProvider.getKhataById(khataId);
```

### Delete Entry
```dart
await khataProvider.deleteEntry(
  khataId: khataId,
  entryId: entryId,
);
```

### Toggle Entry Checked
```dart
await khataProvider.toggleEntryChecked(
  khataId: khataId,
  entryId: entryId,
);
```

## 🐛 Troubleshooting

### Voice Not Working
- Check mic permissions
- Speak clearly
- Use format: "Category + Amount"

### Entry Not Showing
- Check correct khata selected
- Refresh by switching tabs

### Balance Wrong
- Review all entries
- Check for duplicates
- Verify locked entries

## 📱 User Actions

### Swipe Gestures
- **Swipe left** on entry → Delete
- **Swipe month** → Change month

### Tap Actions
- **Tap entry** → View details
- **Tap mic** → Voice input
- **Tap plus** → Manual entry
- **Tap category** → Filter by category

## 🎓 Best Practices

### Daily
- Log expenses immediately
- Use voice for speed
- Check balance

### Weekly
- Review entries
- Check inventory
- Plan budget

### Monthly
- Review report
- Follow AI tips
- Adjust habits

## 📈 Performance

### Optimization
- Lazy loading for large lists
- Efficient state updates
- Cached calculations
- Minimal rebuilds

### Storage
- SharedPreferences for persistence
- JSON serialization
- Automatic save on changes

## 🔐 Data Security

### Privacy
- Local storage only
- No cloud sync (yet)
- User data stays on device

### Locked Entries
- Rent & utilities
- Can't be deleted
- Prevents accidents

## 🌐 Localization

### Bengali Support
- All UI in Bengali
- Category names
- Error messages
- Recommendations

### English Support
- Voice input
- Code comments
- Documentation

## 📞 Support

### Issues?
- Check diagnostics: 0 errors ✅
- Review documentation
- Contact: support@rizik.app

---

## ✅ Checklist

- [x] All features implemented
- [x] Zero compilation errors
- [x] Bengali translations
- [x] Voice input working
- [x] Auto-logging functional
- [x] Reports with charts
- [x] Inventory tracking
- [x] AI recommendations
- [x] Documentation complete
- [x] Ready for testing

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Date**: November 16, 2024

---

*Keep this card handy for quick reference!* 📚
