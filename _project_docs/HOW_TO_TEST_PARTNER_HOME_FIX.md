# 🧪 Partner Home Fix - Testing Guide

## আপনার Screen Recording-এ যে সমস্যা দেখেছিলেন

### ❌ আগে (Broken):
1. **Dead Plan Cards**: হলুদ "Plan" cards (Ahmed Khan, Fatima Rahman) tap করলে কিছু হতো না
2. **Confusing Layout**: কোনটা urgent, কোনটা scheduled - বোঝা যেত না
3. **Hidden Inventory**: Kitchen/Inventory OS card buried ছিল

### ✅ এখন (Fixed):
1. **Tappable Plan Cards**: প্রতিটি Plan card-এ arrow icon + "Tap to manage" text আছে
2. **Clear Sections**: তিনটি আলাদা section:
   - **ACTION REQUIRED** (লাল) - Urgent items
   - **TODAY'S KITCHEN** (কমলা) - আজকের meal plans
   - **MANAGEMENT** (ধূসর) - অন্যান্য
3. **Prominent Inventory**: Strategic Deck-এ সহজে access করা যায়

## Testing Steps

### Step 1: Launch App as Partner
```bash
flutter run
```
1. Main screen-এ যান
2. Bottom navigation-এ "Partner" role select করুন
3. Partner Home screen দেখুন

### Step 2: Test Strategic Deck (Top Cards)
1. **Swipe করুন** left/right - তিনটি card দেখবেন:
   - 💸 **Tohobil** (Analytics) - Tap করলে Analytics screen
   - 🤝 **Squad** (Team) - Tap করলে Squad Management
   - 📦 **Khamar** (Inventory) - Tap করলে Inventory screen

2. **Rizik Kitchen Card** tap করুন:
   - ✅ `RizikKitchenSubscriptionScreen` open হবে
   - ✅ Subscriber list দেখবেন (Ahmed Khan, Fatima Rahman, etc.)

### Step 3: Test Plan Cards (Yellow/Orange Cards)
এটাই আপনার main concern ছিল!

1. **"TODAY'S KITCHEN" section** scroll করুন
2. যেকোনো **হলুদ/কমলা Plan card** দেখুন:
   - ✅ Top-right corner-এ **arrow icon** দেখবেন
   - ✅ Bottom-right corner-এ **"Tap to manage"** text দেখবেন
3. **Card-এ tap করুন**:
   - ✅ `RizikKitchenSubscriptionScreen` open হবে
   - ✅ Oi specific subscriber-er details দেখবেন

### Step 4: Test Section Organization
1. **ACTION REQUIRED** section (যদি থাকে):
   - লাল badge দেখবেন
   - Urgent orders/alerts এখানে থাকবে
   
2. **TODAY'S KITCHEN** section:
   - কমলা badge দেখবেন
   - আজকের সব meal plans এখানে
   - প্রতিটি card tappable
   
3. **MANAGEMENT** section:
   - অন্যান্য management cards
   - Inventory alerts, Squad cards, etc.

### Step 5: Test Live Order Pills
1. যদি কোনো **pending order** থাকে:
   - Top-এ "LIVE ORDER" pill দেখবেন
   - **Swipe right** = Accept order
   - **Swipe left** = Reject order
   - **Tap** = Order details modal

### Step 6: Test Pull-to-Refresh
1. Screen-এর top থেকে **pull down** করুন
2. "ফিড রিফ্রেশ হয়েছে!" message দেখবেন

## Expected Behavior

### ✅ Plan Card Tap করলে:
```
Partner Home → Tap Plan Card → RizikKitchenSubscriptionScreen
```

### ✅ Subscription Screen-এ:
1. **Header**: Live stats (Active, Expiring, New subscribers)
2. **Filter Bar**: সব, সাপ্তাহিক, মাসিক, শেষ হচ্ছে
3. **Subscriber List**: Expandable cards
4. **Swipe Gestures**:
   - Swipe right = Renew subscription
   - Swipe left = Call subscriber
5. **Tap to Expand**: Full details + Quick actions

### ✅ Plan Management Features:
- আজকের menu দেখা
- Delivery address/time
- Customer preferences
- Pause/Resume subscription
- Call customer
- Edit subscription
- Renew subscription

## Troubleshooting

### যদি Plan Cards এখনো tap না হয়:
1. **Hot Reload করুন**: `r` press করুন terminal-এ
2. **Hot Restart করুন**: `R` press করুন
3. **Full Rebuild করুন**: `flutter run` আবার

### যদি Subscriber Data না দেখায়:
1. `MealSubscriptionProvider` initialized হয়েছে কিনা check করুন
2. Mock data load হয়েছে কিনা verify করুন
3. Console-এ error আছে কিনা দেখুন

### যদি Navigation কাজ না করে:
1. `RizikKitchenSubscriptionScreen` import হয়েছে কিনা check করুন
2. Route properly configured আছে কিনা verify করুন

## Visual Indicators (আপনার Screen Recording-এ দেখবেন)

### Plan Card Visual Cues:
```
┌─────────────────────────────┐
│ 🍱 Ahmed Khan - 15-Day     ↗│ ← Arrow icon (top-right)
│                              │
│ আজ: Chicken Biryani         │
│ আগামীকাল: Beef Curry        │
│                              │
│              [Tap to manage] │ ← Hint text (bottom-right)
└─────────────────────────────┘
```

### Section Headers:
```
⚠️ ACTION REQUIRED [3]  ← Red badge
🍽️ TODAY'S KITCHEN (5 plans)  ← Orange badge
📊 MANAGEMENT  ← Gray badge
```

## Success Criteria

### ✅ Fix #1 Complete:
- [ ] Plan cards have visible arrow icons
- [ ] Plan cards have "Tap to manage" text
- [ ] Tapping opens RizikKitchenSubscriptionScreen
- [ ] Navigation works smoothly

### ✅ Fix #2 Complete:
- [ ] Three clear sections visible
- [ ] Section headers with icons and badges
- [ ] Items properly categorized
- [ ] Logical workflow (Urgent → Today → Management)

### ✅ Fix #3 Complete:
- [ ] Inventory card in Strategic Deck
- [ ] Easy access to Kitchen OS
- [ ] Inventory status visible

## Next Actions

### If Everything Works:
1. ✅ Mark this fix as complete
2. ✅ Test with real subscriber data
3. ✅ Get user feedback from actual Makers

### If Issues Found:
1. 📝 Document specific issues
2. 🔍 Check console for errors
3. 💬 Share screen recording of the issue

## আপনার Original Concern-এর Answer

> "how a maker will understand and manage"

**এখন Maker clearly বুঝবে:**
1. **Urgent কি?** → ACTION REQUIRED section
2. **আজ কি রান্না করতে হবে?** → TODAY'S KITCHEN section
3. **কোন customer-এর plan manage করতে হবে?** → Plan card tap করুন
4. **Inventory status কি?** → Strategic Deck-এ Inventory card

**Clear Workflow:**
```
Morning → Check ACTION REQUIRED → Accept urgent orders
       → Check TODAY'S KITCHEN → See meal plans
       → Tap Plan Card → Manage specific subscriber
       → Check Inventory → Ensure ingredients available
```

এটাই হলো আপনার "Rizik Kitchen" - একটা **central command center** যেখানে Maker সব কিছু manage করতে পারবে!
