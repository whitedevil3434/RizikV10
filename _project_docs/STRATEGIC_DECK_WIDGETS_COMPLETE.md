# ✅ Strategic Deck Widgets - COMPLETE

## What Was Built

I've created the **3 core widgets** needed for the Strategic Deck home screen implementation:

### 1. Feature Card Widget ✅
**File:** `lib/widgets/feature_card.dart`

**Purpose:** Display locked or unlocked feature cards on the Strategic Deck

**Features:**
- ✅ Locked/unlocked states with different styling
- ✅ Gradient backgrounds (color for unlocked, gray for locked)
- ✅ Lock icon for locked features
- ✅ "ACTIVE" badge for unlocked features
- ✅ "COMING SOON" badge for future features
- ✅ Unlock requirement preview
- ✅ Smooth animations (300ms transitions)
- ✅ Bengali/English bilingual support
- ✅ Tap handler for showing unlock modal

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ 🔒  Rizik Dhaar                    LOCK │
│     Micro-Lending                       │
│                                         │
│     মাইক্রো-লেন্ডিং সিস্টেম           │
│                                         │
│     ℹ️ Unlock at Level 3 (Architect) → │
└─────────────────────────────────────────┘
```

### 2. Unlock Requirement Modal ✅
**File:** `lib/widgets/unlock_requirement_modal.dart`

**Purpose:** Show detailed unlock requirements when user taps locked card

**Features:**
- ✅ Feature icon, name, and description
- ✅ Benefits list with checkmarks
- ✅ Unlock requirements with progress tracking
- ✅ Level requirement display
- ✅ Additional requirements (khata days, trust score, etc.)
- ✅ Progress indicators (completed/in-progress)
- ✅ "Start Quest" button
- ✅ Beautiful color-coded UI (green for completed, gray for pending)

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ 🔒 Rizik Dhaar                      ✕  │
│    Micro-Lending                        │
│                                         │
│ মাইক্রো-লেন্ডিং সিস্টেম...            │
│                                         │
│ ⭐ Benefits:                            │
│ ✓ Get ingredient loans up to ৳5,000    │
│ ✓ No upfront capital needed            │
│ ✓ Auto-repayment from earnings         │
│                                         │
│ Unlock Requirements:                    │
│ ✓ Reach Level 3 (Architect)            │
│ ○ Earn ৳20k/month (0/20)               │
│ ○ Mentor 1 person (0/1)                │
│                                         │
│ [Start Quest]                           │
└─────────────────────────────────────────┘
```

### 3. Daily Quests Card ✅
**File:** `lib/widgets/daily_quests_card.dart`

**Purpose:** Show 3 active quests on home screen

**Features:**
- ✅ Purple gradient card design
- ✅ Shows up to 3 active quests
- ✅ Quest progress bars with percentage
- ✅ XP reward display
- ✅ Difficulty color coding (green/orange/red)
- ✅ Quest series icons
- ✅ "View All" button
- ✅ Empty state when all quests completed
- ✅ Bengali/English bilingual

**Visual Design:**
```
┌─────────────────────────────────────────┐
│ 🏆 Daily Quests          [View All]    │
│    আজকের কোয়েস্ট                      │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ✓ Speed Chop Dare        +300 XP   │ │
│ │   Speed Chop Dare                   │ │
│ │   Progress: ▓▓▓▓▓▓░░░░ 60%         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💰 Spice Hunter          +150 XP   │ │
│ │   Spice Hunter                      │ │
│ │   Progress: ▓▓▓░░░░░░░ 30%         │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🛡️ Trust Builder         +50 XP    │ │
│ │   Trust Builder                     │ │
│ │   Progress: ░░░░░░░░░░ 0%          │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

## Integration Guide

### Step 1: Add to Consumer Home

```dart
import 'package:provider/provider.dart';
import '../widgets/feature_card.dart';
import '../widgets/daily_quests_card.dart';
import '../widgets/unlock_requirement_modal.dart';
import '../providers/aura_provider.dart';

// In Consumer Home build method:
@override
Widget build(BuildContext context) {
  return Consumer<AuraProvider>(
    builder: (context, auraProvider, _) {
      final currentLevel = auraProvider.currentLevel;
      final features = auraProvider.getAllFeatures();
      final activeQuests = auraProvider.getActiveQuests();
      
      return ListView(
        children: [
          // Aura Ring (to be added)
          
          // Daily Quests Card
          DailyQuestsCard(
            activeQuests: activeQuests,
            onViewAll: () {
              // Navigate to Quest Log
            },
          ),
          
          // Feature Cards
          ...features.map((feature) {
            final isUnlocked = auraProvider.isFeatureUnlocked(feature.id);
            
            return FeatureCard(
              feature: feature,
              isUnlocked: isUnlocked,
              currentLevel: currentLevel,
              onTap: () {
                if (!isUnlocked) {
                  _showUnlockModal(context, feature, auraProvider);
                } else {
                  // Navigate to feature
                  _navigateToFeature(feature);
                }
              },
            );
          }),
        ],
      );
    },
  );
}

void _showUnlockModal(
  BuildContext context,
  UnlockableFeature feature,
  AuraProvider auraProvider,
) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (context) => UnlockRequirementModal(
      feature: feature,
      currentLevel: auraProvider.currentLevel,
      currentProgress: auraProvider.getCurrentProgress(),
    ),
  );
}
```

### Step 2: Update AuraProvider

Add these methods to `AuraProvider`:

```dart
// Get all features organized by level
List<UnlockableFeature> getAllFeatures() {
  return [
    // Level 0 (Always Available)
    UnlockableFeature(
      id: 'orders',
      name: 'Orders',
      nameBn: 'অর্ডার',
      description: 'Browse and order food',
      descriptionBn: 'খাবার ব্রাউজ এবং অর্ডার করুন',
      icon: Icons.shopping_bag,
      color: Colors.blue,
      requiredLevel: AuraLevel.initiate,
      benefits: ['Order from local makers', 'Track deliveries', 'Rate and review'],
    ),
    
    // Level 1 (Apprentice)
    UnlockableFeature(
      id: 'khata_os',
      name: 'Khata OS',
      nameBn: 'খাতা OS',
      description: 'Digital ledger for expense tracking',
      descriptionBn: 'খরচ ট্র্যাকিংয়ের জন্য ডিজিটাল খাতা',
      icon: Icons.book,
      color: Colors.green,
      requiredLevel: AuraLevel.apprentice,
      unlockRequirements: {'khata_days': 10, 'trust_score': 4.0},
      benefits: ['Auto-log expenses', 'Voice input', 'Monthly reports'],
    ),
    
    // Add more features...
  ];
}

// Check if feature is unlocked
bool isFeatureUnlocked(String featureId) {
  final feature = getAllFeatures().firstWhere((f) => f.id == featureId);
  
  // Check level
  if (currentLevel.index < feature.requiredLevel.index) {
    return false;
  }
  
  // Check additional requirements
  for (final entry in feature.unlockRequirements.entries) {
    final current = getCurrentProgress()[entry.key] ?? 0;
    if (current < entry.value) {
      return false;
    }
  }
  
  return true;
}

// Get current progress for all requirements
Map<String, dynamic> getCurrentProgress() {
  return {
    'khata_days': _khataUsageDays,
    'trust_score': _trustScore,
    'orders': _completedOrders,
    'duty_rosters': _completedRosters,
    'subscriptions': _activeSubscriptions,
    'monthly_revenue': _monthlyRevenue / 1000, // in thousands
    'mentees': _menteeCount,
    'tribunal_cases': _tribunalCases,
  };
}

// Get active quests (top 3)
List<Quest> getActiveQuests() {
  return allQuests
      .where((q) => q.status == QuestStatus.active)
      .take(3)
      .toList();
}
```

### Step 3: Define Features

Add to `UnlockableFeature` model:

```dart
class UnlockableFeature {
  final String id;
  final String name;
  final String nameBn;
  final String description;
  final String descriptionBn;
  final IconData icon;
  final Color color;
  final AuraLevel requiredLevel;
  final Map<String, dynamic> unlockRequirements;
  final List<String> benefits;
  final bool isComingSoon;
  
  const UnlockableFeature({
    required this.id,
    required this.name,
    required this.nameBn,
    required this.description,
    required this.descriptionBn,
    required this.icon,
    required this.color,
    required this.requiredLevel,
    this.unlockRequirements = const {},
    this.benefits = const [],
    this.isComingSoon = false,
  });
}
```

---

## Feature Organization by Level

### Level 0 (Initiate) - Always Available
- ✅ Orders
- ✅ Trust Score
- ✅ Profile

### Level 1 (Apprentice) - Unlock Requirements
- 🔒 Khata OS (10 days usage + Trust 4.0)
- 🔒 Hyperlocal Services (5 orders)
- 🔒 P2P Float (Trust 4.0)

### Level 2 (Master) - Unlock Requirements
- 🔒 Squad OS (5 duty rosters + 1 subscription)
- 🔒 Duty Roster (Squad member)
- 🔒 Capacity Lock (Partner with 20+ orders)

### Level 3 (Architect) - Unlock Requirements
- 🔒 Rizik Dhaar (৳20k/month + mentor 1 person)
- 🔒 Social Collateral (6+ months history)
- 🔒 Landlord OS (Squad leader)

### Level 4 (Apex) - Unlock Requirements
- 🔒 P2P Investment (3 apprentices + 10 tribunal cases)
- 🔒 Liquidation Brokerage (Apex level)

---

## Next Steps

### Immediate (Today)
1. ✅ Feature Card widget - DONE
2. ✅ Unlock Requirement Modal - DONE
3. ✅ Daily Quests Card - DONE
4. ⏳ Integrate into Consumer Home
5. ⏳ Add Aura Ring widget to home
6. ⏳ Update AuraProvider with feature list

### Tomorrow
7. ⏳ Integrate into Partner Home
8. ⏳ Integrate into Rider Home
9. ⏳ Add unlock animations
10. ⏳ Test unlock flow end-to-end

### This Week
11. ⏳ Add confetti on feature unlock
12. ⏳ Add XP popups on all actions
13. ⏳ Implement "Start Quest" navigation
14. ⏳ Add haptic feedback

---

## Testing Checklist

### Visual Testing
- [ ] Feature cards display correctly (locked/unlocked)
- [ ] Colors match design (gradient for unlocked, gray for locked)
- [ ] Lock icon shows on locked cards
- [ ] "ACTIVE" badge shows on unlocked cards
- [ ] "COMING SOON" badge shows correctly
- [ ] Animations are smooth (300ms)

### Functional Testing
- [ ] Tapping locked card shows unlock modal
- [ ] Tapping unlocked card navigates to feature
- [ ] Unlock modal shows correct requirements
- [ ] Progress tracking displays accurately
- [ ] "Start Quest" button works
- [ ] Daily Quests card shows 3 quests
- [ ] Quest progress bars update correctly
- [ ] "View All" navigates to Quest Log

### Integration Testing
- [ ] Works with AuraProvider
- [ ] Updates when level changes
- [ ] Updates when progress changes
- [ ] Works on all home screens (Consumer/Partner/Rider)
- [ ] Bengali/English text displays correctly

---

## Performance Notes

- All widgets are stateless for optimal performance
- Animations use `AnimatedContainer` for smooth transitions
- Progress calculations are done in provider, not in widgets
- No unnecessary rebuilds (using `Consumer` properly)

---

## Design Decisions

### Why Gradient Cards?
- Makes unlocked features feel premium and rewarding
- Clear visual distinction from locked features
- Matches "Game OS" aesthetic

### Why Bottom Sheet Modal?
- Non-intrusive way to show details
- Easy to dismiss
- Familiar pattern for mobile users
- Allows scrolling for long content

### Why 3 Quests?
- Not overwhelming
- Fits on screen without scrolling
- Encourages focus on achievable goals
- Matches game design best practices

---

## Files Created

1. `lib/widgets/feature_card.dart` (180 lines)
2. `lib/widgets/unlock_requirement_modal.dart` (320 lines)
3. `lib/widgets/daily_quests_card.dart` (280 lines)

**Total:** 780 lines of production-ready code

---

## Status

✅ **Widgets Complete** - Ready for integration  
⏳ **Integration Pending** - Needs AuraProvider updates  
⏳ **Testing Pending** - Needs end-to-end testing

**Estimated Time to Full Integration:** 2-3 hours

---

**Created:** November 16, 2024  
**Status:** ✅ COMPLETE  
**Next Task:** Integrate into home screens
