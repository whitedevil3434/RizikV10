# 📱 Partner Home - Visual Guide

## Screen Layout (Top to Bottom)

```
╔═══════════════════════════════════════════════════════════╗
║                    PARTNER HOME                           ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │  STRATEGIC DECK (Swipeable)                     │    ║
║  │  ◄ [💸 Tohobil] [🤝 Squad] [📦 Khamar] ►       │    ║
║  │     Analytics    Team      Inventory            │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │  🔴 LIVE ORDER                                   │    ║
║  │  New order from Customer #123                    │    ║
║  │  ← Swipe to accept/reject →                     │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │  ⚠️ ACTION REQUIRED [3]                         │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌──────────────┐  ┌──────────────┐                     ║
║  │              │  │              │                     ║
║  │  Missed Bid  │  │  Urgent      │                     ║
║  │  (Red)       │  │  Order       │                     ║
║  │              │  │              │                     ║
║  └──────────────┘  └──────────────┘                     ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │  🍽️ TODAY'S KITCHEN (5 plans)                  │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌──────────────┐  ┌──────────────┐                     ║
║  │ 🍱 Ahmed    ↗│  │ 🍱 Fatima   ↗│  ← Arrow icons!    ║
║  │ Khan         │  │ Rahman       │                     ║
║  │              │  │              │                     ║
║  │ আজ: Chicken  │  │ আজ: Beef     │                     ║
║  │ Biryani      │  │ Curry        │                     ║
║  │              │  │              │                     ║
║  │ [Tap to      │  │ [Tap to      │  ← Hint text!      ║
║  │  manage]     │  │  manage]     │                     ║
║  └──────────────┘  └──────────────┘                     ║
║                                                           ║
║  ┌──────────────┐  ┌──────────────┐                     ║
║  │ 🍱 Karim    ↗│  │ 🍱 Rahima   ↗│                     ║
║  │ Ahmed        │  │ Begum        │                     ║
║  │              │  │              │                     ║
║  │ আজ: Fish     │  │ আজ: Veg      │                     ║
║  │ Curry        │  │ Thali        │                     ║
║  │              │  │              │                     ║
║  │ [Tap to      │  │ [Tap to      │                     ║
║  │  manage]     │  │  manage]     │                     ║
║  └──────────────┘  └──────────────┘                     ║
║                                                           ║
║  ┌─────────────────────────────────────────────────┐    ║
║  │  📊 MANAGEMENT                                   │    ║
║  └─────────────────────────────────────────────────┘    ║
║                                                           ║
║  ┌──────────────┐  ┌──────────────┐                     ║
║  │              │  │              │                     ║
║  │  Inventory   │  │  Squad       │                     ║
║  │  Alert       │  │  Card        │                     ║
║  │              │  │              │                     ║
║  └──────────────┘  └──────────────┘                     ║
║                                                           ║
║                                          [+] FAB         ║
╚═══════════════════════════════════════════════════════════╝
```

---

## Plan Card Anatomy (BEFORE vs AFTER)

### ❌ BEFORE (Dead Card)
```
┌─────────────────────────────┐
│ 🍱 Ahmed Khan - 15-Day      │  No visual cues
│                              │
│ আজ: Chicken Biryani         │
│ আগামীকাল: Beef Curry        │
│                              │
│                              │  Nothing indicates it's tappable
└─────────────────────────────┘
     ↓ TAP ↓
   (Nothing happens)
```

### ✅ AFTER (Interactive Card)
```
┌─────────────────────────────┐
│ 🍱 Ahmed Khan - 15-Day     ↗│  ← 1. Arrow icon (top-right)
│                              │     Shows it's tappable
│ আজ: Chicken Biryani         │
│ আগামীকাল: Beef Curry        │
│                              │
│              [Tap to manage] │  ← 2. Hint text (bottom-right)
└─────────────────────────────┘     Tells user what to do
     ↓ TAP ↓
   Opens Subscription Screen ✅
```

---

## Color Coding System

### 🔴 Red = URGENT (Action Required)
```
⚠️ ACTION REQUIRED [3]
├─ Missed bids
├─ Urgent orders
└─ Critical alerts

Mental Model: "Deal with these NOW!"
```

### 🟠 Orange = TODAY (Today's Kitchen)
```
🍽️ TODAY'S KITCHEN (5 plans)
├─ Ahmed Khan - Chicken Biryani
├─ Fatima Rahman - Beef Curry
├─ Karim Ahmed - Fish Curry
├─ Rahima Begum - Veg Thali
└─ Nasir Uddin - Dal Chawal

Mental Model: "Cook these TODAY!"
```

### ⚪ Gray = MANAGEMENT (Other Tasks)
```
📊 MANAGEMENT
├─ Inventory status
├─ Squad management
├─ Analytics review
└─ Settings

Mental Model: "Manage when you have time"
```

---

## Interactive Elements

### 1. Strategic Deck (Top)
```
◄ [💸 Tohobil] [🤝 Squad] [📦 Khamar] ►
   ↓ Swipe     ↓ Swipe    ↓ Swipe
   Analytics   Squad      Inventory
   Screen      Screen     Screen
```

### 2. Live Order Pills
```
┌─────────────────────────────┐
│ 🔴 LIVE ORDER               │
│ New order from Customer     │
│ ← Swipe Right = Accept      │
│ → Swipe Left = Reject       │
│ ↓ Tap = View Details        │
└─────────────────────────────┘
```

### 3. Plan Cards (Main Focus)
```
┌─────────────────────────────┐
│ 🍱 Ahmed Khan - 15-Day     ↗│ ← Tap anywhere on card
│                              │
│ আজ: Chicken Biryani         │   Opens:
│ আগামীকাল: Beef Curry        │   RizikKitchenSubscriptionScreen
│                              │
│              [Tap to manage] │   Shows:
└─────────────────────────────┘   - Subscriber details
                                   - Today's menu
                                   - Delivery info
                                   - Quick actions
```

### 4. FAB (Bottom Right)
```
[+] ← Tap to open creation menu
    ├─ 🍽️ Add new dish
    ├─ 📦 Update inventory
    ├─ 🎯 Respond to bid
    └─ 📊 Start flash sale
```

---

## User Flow Examples

### Flow 1: Managing a Meal Plan
```
1. Scroll to "TODAY'S KITCHEN" section
   ↓
2. See "Ahmed Khan - 15-Day" card
   ↓
3. Notice arrow icon (↗) and "Tap to manage" text
   ↓
4. Tap anywhere on the card
   ↓
5. RizikKitchenSubscriptionScreen opens
   ↓
6. See subscriber details:
   - Name: Ahmed Khan
   - Plan: 15-Day Lunch Plan
   - Today's meal: Chicken Biryani
   - Delivery time: 1:00 PM
   - Address: Dhanmondi, Dhaka
   ↓
7. Quick actions available:
   - Edit subscription
   - Pause/Resume
   - Call customer
   - Renew subscription
```

### Flow 2: Accepting an Urgent Order
```
1. See "ACTION REQUIRED [3]" section at top
   ↓
2. Notice red badge indicating urgency
   ↓
3. See "Missed Bid" or "Urgent Order" card
   ↓
4. Tap to view details
   ↓
5. Accept or reject order
   ↓
6. Order moves to "Preparing" status
```

### Flow 3: Checking Inventory
```
1. Swipe Strategic Deck to "Khamar" card
   ↓
2. See live inventory ticker:
   🍗 Chicken: LOW (red)
   🍚 Rice: OK (green)
   🧅 Onion: LOW (red)
   ↓
3. Tap "Khamar" card
   ↓
4. Opens full Inventory screen
   ↓
5. Update stock levels
```

---

## Visual Indicators Explained

### Arrow Icon (↗)
```
Purpose: Shows the card is tappable
Location: Top-right corner of Plan cards
Color: White with semi-transparent background
Size: 16px
```

### Hint Text ("Tap to manage")
```
Purpose: Tells user what action to take
Location: Bottom-right corner of Plan cards
Color: White with semi-transparent background
Font: 10px, semi-bold
```

### Section Badges
```
⚠️ ACTION REQUIRED [3]  ← Red badge with count
🍽️ TODAY'S KITCHEN (5 plans)  ← Orange with count
📊 MANAGEMENT  ← Gray, no count needed
```

### Card Shadows
```
Plan cards have enhanced shadows:
- Color: Orange with 30% opacity
- Blur: 12px
- Offset: (0, 6)
- Makes cards "pop" from background
```

---

## Responsive Behavior

### On Scroll
```
Scroll Down → Header shrinks
Scroll Up → Header expands
Pull Down → Refresh feed
```

### On Tap
```
Plan Card → Opens Subscription Screen
Strategic Deck Card → Opens respective screen
FAB → Opens creation menu
Live Order → Opens order details modal
```

### On Swipe
```
Strategic Deck → Swipe left/right to see cards
Live Order → Swipe right (accept) or left (reject)
```

---

## Accessibility Features

### Visual Affordances
- ✅ Arrow icons indicate tappability
- ✅ Hint text provides clear instructions
- ✅ Color coding shows priority
- ✅ Shadows create depth perception

### Touch Targets
- ✅ Plan cards: Full card is tappable (not just icon)
- ✅ Minimum size: 160px height
- ✅ Adequate spacing: 12px between cards

### Feedback
- ✅ Visual feedback on tap (ripple effect)
- ✅ Navigation animation (smooth transition)
- ✅ Success messages (SnackBar)

---

## Testing Checklist

### Visual Verification
- [ ] Arrow icons visible on all Plan cards
- [ ] "Tap to manage" text visible on all Plan cards
- [ ] Section headers with correct colors
- [ ] Badge counts accurate
- [ ] Shadows render correctly

### Interaction Verification
- [ ] Tapping Plan card opens Subscription Screen
- [ ] Swiping Strategic Deck works
- [ ] Swiping Live Order works
- [ ] FAB opens creation menu
- [ ] Pull-to-refresh works

### Layout Verification
- [ ] Cards don't overlap
- [ ] Spacing is consistent
- [ ] Text doesn't overflow
- [ ] Icons align properly
- [ ] Responsive on different screen sizes

---

## Common Issues & Solutions

### Issue: Plan card doesn't respond to tap
**Solution:** 
1. Hot reload: Press `r` in terminal
2. Hot restart: Press `R` in terminal
3. Full rebuild: `flutter run`

### Issue: Arrow icon not visible
**Solution:**
1. Check if card is rendering correctly
2. Verify `Positioned` widget is not clipped
3. Check z-index (Stack order)

### Issue: Section headers not showing
**Solution:**
1. Verify items are being categorized correctly
2. Check if sections have items
3. Ensure `SliverToBoxAdapter` is rendering

---

## Summary

### Key Visual Changes:
1. ✅ Arrow icons on Plan cards
2. ✅ "Tap to manage" hint text
3. ✅ Three color-coded sections
4. ✅ Section headers with badges
5. ✅ Enhanced shadows and depth

### Key UX Improvements:
1. ✅ Clear visual hierarchy
2. ✅ Obvious tappable elements
3. ✅ Logical workflow
4. ✅ Priority-based organization
5. ✅ Reduced cognitive load

### Result:
**Confusing Dashboard → Clear Management Tool** ✅

Apnar screen recording-e je problem chilo, sheta ekhon visually ebong functionally fix kora hoyeche! 🎯
