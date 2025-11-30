# 🚀 Quick Start: Strategic Deck

## Enable in 3 Steps (5 minutes)

### Step 1: Add Import
Open `lib/screens/main_screen.dart` and add:
```dart
import 'home/consumer_home_strategic_deck.dart';
```

### Step 2: Replace Widget
Find this line:
```dart
ConsumerHome(scrollController: _scrollController)
```

Replace with:
```dart
ConsumerHomeStrategicDeck(scrollController: _scrollController)
```

### Step 3: Hot Reload
Press `r` in terminal or click hot reload button.

**Done!** You now have the Strategic Deck home screen! 🎉

---

## What You'll See

```
┌─────────────────────────────────────┐
│ স্বাগতম, Sabbir!                    │
│ Welcome back                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  ⭕ Level 2 (Master)             │ │
│ │  ▓▓▓▓▓▓░░░░ 3500/5000 XP       │ │
│ │  Master of the Platform         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏆 Daily Quests    [View All]   │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │ Speed Chop ▓▓▓▓▓▓░░░░ 60%   │ │ │
│ │ │ Spice Hunt ▓▓▓░░░░░░░ 30%   │ │ │
│ │ │ Trust Build ░░░░░░░░░░ 0%   │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Your Features                       │
│ আপনার ফিচার                        │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🍽️ মৌলিক অর্ডার        ACTIVE │ │
│ │ Basic Orders                    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📒 খাতা OS              🔒     │ │
│ │ Khata OS                        │ │
│ │ ℹ️ Unlock at Level 1 →          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏘️ হাইপারলোকাল সার্ভিস  🔒    │ │
│ │ Hyperlocal Services             │ │
│ │ ℹ️ Unlock at Level 1 →          │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## Test It

### Test 1: Tap Aura Ring
**Expected:** Navigate to Aura Dashboard

### Test 2: Tap Locked Card
**Expected:** Modal shows unlock requirements

### Test 3: Tap Unlocked Card
**Expected:** Navigate to feature

### Test 4: Pull to Refresh
**Expected:** Reload data

---

## Troubleshooting

### Issue: Blank Screen
**Fix:** Check if AuraProvider is in main.dart:
```dart
ChangeNotifierProvider(create: (_) => AuraProvider()),
```

### Issue: No Features Showing
**Fix:** Features load automatically. Check console for errors.

### Issue: Can't Navigate
**Fix:** Ensure all screens are imported in strategic_deck file.

---

## Files Involved

**New:**
- `lib/screens/home/consumer_home_strategic_deck.dart`
- `lib/widgets/feature_card.dart`
- `lib/widgets/unlock_requirement_modal.dart`
- `lib/widgets/daily_quests_card.dart`

**Existing:**
- `lib/widgets/aura_ring.dart`
- `lib/providers/aura_provider.dart`
- `lib/data/default_features.dart`

---

## Next Steps

1. ✅ Enable Strategic Deck
2. ⏳ Test on device
3. ⏳ Add unlock animations
4. ⏳ Add XP popups

---

**Status:** ✅ READY  
**Time:** 5 minutes  
**Difficulty:** Easy
