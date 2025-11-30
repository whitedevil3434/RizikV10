# How to Access Khata OS

## Quick Access

The new Khata OS screen is ready but needs to be added to your navigation. Here are the ways to access it:

## Option 1: Add Card to Consumer Home (Recommended)

Add the `KhataOSCard` widget to your consumer home screen:

```dart
// In lib/screens/home/consumer_home.dart

import '../../widgets/khata_os_card.dart';

// In the build method, add the card to your list:
children: [
  // ... other cards ...
  
  // Add Khata OS Card
  const KhataOSCard(isBengali: true),
  
  // ... rest of cards ...
],
```

## Option 2: Replace Old Khata Book

Replace the old `KhataBookScreen` navigation with the new `KhataScreen`:

```dart
// Find this in your code:
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => const KhataBookScreen(),
  ),
);

// Replace with:
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => const KhataScreen(isBengali: true),
  ),
);
```

## Option 3: Add to Drawer Menu

If you have a drawer menu, add it there:

```dart
ListTile(
  leading: const Icon(Icons.book),
  title: const Text('Khata OS'),
  onTap: () {
    Navigator.pop(context); // Close drawer
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const KhataScreen(isBengali: true),
      ),
    );
  },
),
```

## Option 4: Add Floating Action Button

Add a quick access button:

```dart
FloatingActionButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const KhataScreen(isBengali: true),
      ),
    );
  },
  child: const Icon(Icons.book),
  tooltip: 'Khata OS',
)
```

## Option 5: Direct Navigation (For Testing)

For quick testing, you can navigate directly from anywhere:

```dart
import 'package:flutter/material.dart';
import 'screens/khata_screen.dart';

// Then anywhere in your code:
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => const KhataScreen(isBengali: true),
  ),
);
```

## Features Available in Khata OS

Once you access it, you'll see:

1. **4 Tabs**: Personal, Shared, Squad, Rent khatas
2. **Balance Card**: Shows current balance, income, and expenses
3. **Book View**: Beautiful page-turning animation
4. **Floating Buttons**:
   - 🎤 Voice Input - Add expenses by speaking
   - ➕ Manual Entry - Add expenses manually
5. **Monthly Report**: Tap the chart icon in app bar
6. **Category Selection**: 11 categories with emojis

## Quick Test

To quickly test the Khata OS:

1. Add this button temporarily to your home screen:

```dart
ElevatedButton(
  onPressed: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const KhataScreen(isBengali: true),
      ),
    );
  },
  child: const Text('Open Khata OS'),
)
```

2. Run the app
3. Tap the button
4. You should see the Khata OS with tabs

## Files to Import

Make sure to import these in your navigation file:

```dart
import 'package:rizik_v4/screens/khata_screen.dart';
import 'package:rizik_v4/widgets/khata_os_card.dart'; // If using the card
```

## Comparison: Old vs New

### Old Khata Book (`KhataBookScreen`)
- Simple book with hardcoded transactions
- No categories
- No voice input
- No reports
- No auto-logging

### New Khata OS (`KhataScreen`)
- ✅ 4 khata types (Personal, Shared, Squad, Rent)
- ✅ 11 expense categories
- ✅ Voice input (Bengali & English)
- ✅ Monthly reports with charts
- ✅ Auto-logging from orders
- ✅ AI Pantry integration
- ✅ Real-time balance calculation

## Next Steps

1. Choose one of the options above
2. Add the navigation code
3. Run the app
4. Test the Khata OS features
5. Add expenses and see them in the book view

## Need Help?

If you want me to add it to a specific location in your code, just let me know where and I'll do it for you!
