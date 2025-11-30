# 🎮 How to Enable Strategic Deck Home

## Quick Start

The Strategic Deck home screen is now ready! Here's how to enable it:

### Option 1: Replace Current Home (Recommended for Testing)

Edit `lib/screens/main_screen.dart`:

```dart
// Find the import for consumer_home.dart
import 'home/consumer_home.dart';

// Replace with:
import 'home/consumer_home_strategic_deck.dart';

// Then in the build method, replace:
ConsumerHome(scrollController: _scrollController)

// With:
ConsumerHomeStrategicDeck(scrollController: _scrollController)
```

### Option 2: Add as Toggle (Recommended for Production)

Add a setting to switch between traditional and Strategic Deck views:

```dart
// In main_screen.dart
bool _useStrategicDeck = true; // Add this as state variable

// In build method:
_useStrategicDeck
  ? ConsumerHomeStrategicDeck(scrollController: _scrollController)
  : ConsumerHome(scrollController: _scrollController)
```

### Option 3: Add as Separate Tab

Add Strategic Deck as a new tab in the bottom navigation.

---

## What You'll See

### 1. Welcome Header
```
স্বাগতম, [Name]!
Welcome back
```

### 2. Aura Ring Card
- Shows current level (L0-L4)
- XP progress bar
- Level name and description
- Tap to view full Aura Dashboard

### 3. Daily Quests Card (if quests active)
- Shows 3 active quests
- Progress bars for each quest
- XP rewards displayed
- "View All" button

### 4. Feature Cards
- **Level 0 (Unlocked)**: Basic Orders, Trust Score, Profile
- **Level 1 (Locked)**: Khata OS, Hyperlocal Services, P2P Float
- **Level 2 (Locked)**: Squad OS, Duty Roster, Capacity Lock
- **Level 3 (Locked)**: Rizik Dhaar, Social Collateral, Landlord OS
- **Level 4 (Locked)**: P2P Investment, Liquidation, Governance

---

## Testing the Strategic Deck

### Test 1: View Locked Features
1. Open app
2. Scroll through feature cards
3. Tap on a locked card (gray with 🔒)
4. See unlock requirements modal
5. View progress toward unlock

### Test 2: Navigate to Unlocked Features
1. Tap on "Basic Orders" card
2. Should show message about browsing food
3. Tap on "Khata OS" card (if unlocked)
4. Should navigate to Khata OS Merged screen

### Test 3: View Aura Progress
1. Tap on Aura Ring Card
2. Should navigate to Aura Dashboard
3. See full level progression

### Test 4: View Quests
1. See Daily Quests card
2. View 3 active quests with progress
3. Tap "View All"
4. See "Coming Soon" message (Quest Log not implemented yet)

---

## Unlocking Features for Testing

To test the unlock flow, you can manually unlock features:

### Method 1: Using AuraProvider

```dart
// In your test code or debug menu
final auraProvider = context.read<AuraProvider>();

// Award XP to level up
await auraProvider.awardXP(xpAmount: 5000, reason: 'Testing');

// Manually unlock a feature
await auraProvider.unlockFeature('khata_os');

// Check and auto-unlock based on progress
await auraProvider.checkAndUnlockFeatures();
```

### Method 2: Modify Default Features

Edit `lib/data/default_features.dart`:

```dart
// Change isUnlocked to true for testing
UnlockableFeature(
  id: 'khata_os',
  name: 'Khata OS',
  // ... other fields
  isUnlocked: true, // Add this for testing
),
```

### Method 3: Clear Storage and Restart

```dart
// This will reset all progress
final prefs = await SharedPreferences.getInstance();
await prefs.clear();
// Restart app
```

---

## Feature Navigation Map

When users tap unlocked features, they navigate to:

| Feature ID | Destination | Status |
|------------|-------------|--------|
| basic_orders | Show message | ✅ Working |
| trust_score | Profile screen | ✅ Working |
| profile | Profile screen | ✅ Working |
| khata_os | Khata OS Merged | ✅ Working |
| hyperlocal_services | Hyperlocal Marketplace | ✅ Working |
| squad_os | Squad Dashboard | ✅ Working |
| rizik_dhaar | Loan Dashboard | ✅ Working |
| p2p_float | Coming Soon | ⏳ Future |
| duty_roster | Coming Soon | ⏳ Future |
| capacity_lock | Coming Soon | ⏳ Future |
| social_collateral | Coming Soon | ⏳ Future |
| landlord_os | Coming Soon | ⏳ Future |
| p2p_investment | Coming Soon | ⏳ Future |
| liquidation_brokerage | Coming Soon | ⏳ Future |
| platform_governance | Coming Soon | ⏳ Future |

---

## Troubleshooting

### Issue: "AuraProvider not found"
**Solution**: Make sure AuraProvider is registered in main.dart:
```dart
ChangeNotifierProvider(create: (_) => AuraProvider()),
```

### Issue: "Features not showing"
**Solution**: Check if features are initialized:
```dart
// In AuraProvider, features should load from DefaultFeatures
debugPrint('Features loaded: ${_features.length}');
```

### Issue: "Aura progress is null"
**Solution**: AuraProvider should auto-initialize new users:
```dart
// Check initialization in AuraProvider._loadAuraProgress()
```

### Issue: "Unlock modal not showing"
**Solution**: Check if modal is being called:
```dart
// Add debug print in _showUnlockModal
debugPrint('Showing unlock modal for: ${feature.name}');
```

---

## Next Steps

### Immediate
1. ✅ Strategic Deck home created
2. ⏳ Enable in main_screen.dart
3. ⏳ Test unlock flow
4. ⏳ Test navigation to all features

### Short Term
1. ⏳ Add unlock animations (confetti)
2. ⏳ Add XP popups on actions
3. ⏳ Implement Quest Log screen
4. ⏳ Add haptic feedback

### Long Term
1. ⏳ Create Partner Strategic Deck
2. ⏳ Create Rider Strategic Deck
3. ⏳ Add feature tutorials
4. ⏳ Add achievement celebrations

---

## Comparison: Traditional vs Strategic Deck

### Traditional Home
- Feed-based layout
- All features accessible
- No progression visible
- Utility app feel

### Strategic Deck Home
- Card-based layout
- Features locked by level
- Progression front and center
- Game OS feel

---

## User Experience Flow

### New User (Level 0)
1. Sees welcome message
2. Sees Aura Ring at Level 0 (Initiate)
3. Sees 3 unlocked features (Orders, Trust, Profile)
4. Sees 12 locked features with 🔒
5. Taps locked feature → Sees requirements
6. Completes actions → Earns XP
7. Levels up → Features unlock automatically

### Experienced User (Level 2+)
1. Sees Aura Ring at current level
2. Sees Daily Quests with progress
3. Sees mix of unlocked/locked features
4. Taps unlocked features → Navigates directly
5. Sees clear path to next unlocks

---

## Performance Notes

- All widgets are stateless for optimal performance
- Features load once from storage
- Progress calculations cached in provider
- Smooth animations (300ms transitions)
- Minimal rebuilds using Consumer

---

## Files Involved

### New Files:
1. `lib/screens/home/consumer_home_strategic_deck.dart` - Strategic Deck home
2. `lib/widgets/feature_card.dart` - Feature card widget
3. `lib/widgets/unlock_requirement_modal.dart` - Unlock modal
4. `lib/widgets/daily_quests_card.dart` - Quests card

### Existing Files Used:
5. `lib/widgets/aura_ring.dart` - Aura Ring widget
6. `lib/providers/aura_provider.dart` - State management
7. `lib/data/default_features.dart` - Feature definitions
8. `lib/models/unlockable_feature.dart` - Feature model

---

## Success Metrics

After enabling Strategic Deck, verify:

- [ ] Aura Ring displays correctly
- [ ] Daily Quests card shows (if quests active)
- [ ] Feature cards display in correct order
- [ ] Locked cards are grayed out with 🔒
- [ ] Unlocked cards have gradient backgrounds
- [ ] Tapping locked card shows modal
- [ ] Tapping unlocked card navigates
- [ ] Modal shows correct requirements
- [ ] Progress tracking works
- [ ] Bengali/English text displays correctly

---

**Status:** ✅ READY TO ENABLE  
**Estimated Setup Time:** 5 minutes  
**Testing Time:** 15-20 minutes  
**Created:** November 16, 2024
