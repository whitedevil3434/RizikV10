# Consumer Home: Management Hub Transformation

## 🎯 Vision
Transform Consumer Home from a discovery feed into a **Management Hub** focused on:
- Financial Health (Khata OS, Rizik Dhaar)
- Household Responsibilities (Duty Roster, Inventory)
- Family Management (Squads, Meal Plans)

**Remove**: All food discovery content → Moved to Bazar tab

---

## 📐 New Structure

### 1. Strategic Deck (Top 3 Cards Only)

#### Card 1: 💰 My Khata OS
**Purpose**: Primary financial tracking gateway
**Content**:
- Current balance overview
- Today's expenses
- Shared khata status
- Quick action: "Add Entry"

**Navigation**: → Khata OS Merged Screen

#### Card 2: ⚔️ Rizik Aura (Level Status)
**Purpose**: Gamification encouragement
**Content**:
- Current level (Initiate/Apprentice/etc.)
- XP Progress Bar
- Next level preview
- Recent badges

**Navigation**: → Aura Dashboard Screen

#### Card 3: 💵 Rizik Dhaar / Voucher Hook
**Purpose**: Social Collateral Engine visibility
**Content**:
- Trust Score display
- Available loan amount
- Active vouchers
- Quick action: "Apply for Loan"

**Navigation**: → Loan Dashboard Screen

---

### 2. Masonry Grid (Action Feed - Management Only)

#### Card Type 1: 📦 Active Order Tracker
**Data Source**: OrderProvider
**Content**:
- Live order status
- Delivery ETA
- Partner name
- Order items preview

**Trigger**: When user has active orders
**Action**: Tap → Order Tracking Screen

#### Card Type 2: 🛒 Bazar List Alert
**Data Source**: KhataProvider (Inventory)
**Content**:
- "2 items added to Bazar list"
- Low stock items
- Suggested items based on usage

**Trigger**: When inventory items are low
**Action**: Tap → Khata OS (Shopping tab)

#### Card Type 3: 📅 Family Roster Alert
**Data Source**: DutyRosterProvider
**Content**:
- Today's assigned tasks
- Family member duties
- Overdue tasks
- Completion status

**Trigger**: When duties are assigned/overdue
**Action**: Tap → Duty Roster Screen

#### Card Type 4: 🥕 Kitchen Inventory/Recipe Hook
**Data Source**: InventoryProvider
**Content**:
- Low inventory items
- Recipe suggestions
- Meal plan reminders
- "Your subscribed meal plan starts today"

**Trigger**: Low inventory or meal plan events
**Action**: Tap → Khata OS (Inventory tab) or Meal Plan Screen

#### Card Type 5: 👥 Squad Activity Alert
**Data Source**: SquadProvider
**Content**:
- New squad invitations
- Squad earnings updates
- Dispute notifications
- Income split reminders

**Trigger**: Squad events
**Action**: Tap → Squad Dashboard

#### Card Type 6: 🍱 Meal Plan Status
**Data Source**: MealPlanProvider (if exists)
**Content**:
- Today's meal
- Tomorrow's meal
- Pause/Resume status
- Upcoming deliveries

**Trigger**: Active meal plan
**Action**: Tap → My Meal Plans Screen

---

## 🗑️ Cards to REMOVE from Strategic Deck

These cards are **discovery/opportunity** focused, not management:

- ❌ Flash Sale Card → Move to Bazar tab
- ❌ Active Bid Card → Move to Bazar tab  
- ❌ Social Ledger Card → Keep in masonry grid as alert
- ❌ Bazar Khata Card → Redundant (covered by Khata OS)
- ❌ Rizik Book Card → Redundant (covered by Khata OS)
- ❌ Page Types Demo → Remove (internal demo)

---

## 📊 Data Flow

### Strategic Deck Cards
```dart
final List<Map<String, dynamic>> _strategicDeckCards = [
  {
    'type': 'khata_os',
    'title': '💰 My Khata OS',
    'subtitle': 'Financial Tracking',
  },
  {
    'type': 'aura_ring',
    'title': '⚔️ Rizik Aura',
    'subtitle': 'Level & Progress',
  },
  {
    'type': 'rizik_dhaar',
    'title': '💵 Rizik Dhaar',
    'subtitle': 'Loans & Vouchers',
  },
];
```

### Masonry Grid Cards
```dart
// Dynamic cards based on user state
List<FeedCard> _getManagementFeedItems() {
  List<FeedCard> items = [];
  
  // 1. Active Orders
  if (orderProvider.hasActiveOrders) {
    items.add(ActiveOrderCard(...));
  }
  
  // 2. Bazar List Alerts
  if (khataProvider.hasLowStockItems) {
    items.add(BazarListAlertCard(...));
  }
  
  // 3. Duty Roster
  if (dutyRosterProvider.hasPendingDuties) {
    items.add(DutyRosterAlertCard(...));
  }
  
  // 4. Kitchen Inventory
  if (inventoryProvider.hasLowInventory) {
    items.add(InventoryAlertCard(...));
  }
  
  // 5. Squad Alerts
  if (squadProvider.hasNotifications) {
    items.add(SquadAlertCard(...));
  }
  
  // 6. Meal Plan
  if (mealPlanProvider.hasActivePlan) {
    items.add(MealPlanStatusCard(...));
  }
  
  return items;
}
```

---

## 🎨 Visual Design

### Strategic Deck
- **Height**: 20% of screen height
- **Style**: Glassmorphism cards
- **Spacing**: 8px horizontal margin
- **Animation**: Scale on page change

### Masonry Grid
- **Columns**: 2
- **Spacing**: 12px
- **Card Heights**: Dynamic (0.8 to 1.3 factor)
- **Style**: White cards with colored accents

---

## 🔄 User Flow

### Before (Discovery Focus)
```
Consumer Home
├─ Strategic Deck (11 cards)
│  ├─ Food discovery
│  ├─ Flash sales
│  ├─ Active bids
│  └─ Management tools (mixed)
└─ Masonry Grid
   └─ Food posts, reviews, shops
```

### After (Management Focus)
```
Consumer Home (Management Hub)
├─ Strategic Deck (3 cards)
│  ├─ Khata OS (Financial)
│  ├─ Aura (Progress)
│  └─ Rizik Dhaar (Loans)
└─ Masonry Grid (Action Feed)
   ├─ Active Orders
   ├─ Bazar Alerts
   ├─ Duty Roster
   ├─ Inventory
   ├─ Squad Alerts
   └─ Meal Plan

Bazar Tab (Discovery)
└─ All food/shop discovery content
```

---

## 🚀 Implementation Steps

### Step 1: Update Strategic Deck
1. Reduce `_strategicDeckCards` to 3 items
2. Remove flash_sale, active_bid, social_ledger, etc.
3. Keep only: khata_os, aura_ring, rizik_dhaar

### Step 2: Create Management Feed Cards
1. Create new card types in `feed_cards.dart`:
   - `ActiveOrderAlertCard`
   - `BazarListAlertCard`
   - `DutyRosterAlertCard`
   - `InventoryAlertCard`
   - `SquadAlertCard`
   - `MealPlanStatusCard`

### Step 3: Update Masonry Grid
1. Replace `feedProvider.consumerFeedItems` with `_getManagementFeedItems()`
2. Filter to show only management/alert cards
3. Remove food/review/shop cards

### Step 4: Update Navigation
1. Ensure Bazar tab has all discovery content
2. Update card tap handlers to navigate to management screens

---

## ✅ Success Criteria

- [ ] Strategic Deck has exactly 3 cards
- [ ] No food discovery content in Consumer Home
- [ ] Masonry grid shows only management alerts
- [ ] All discovery content accessible in Bazar tab
- [ ] Smooth navigation between management screens
- [ ] Cards appear/disappear based on user state

---

## 📝 Notes

### Existing Cards to Reuse
- ✅ `KhataOSCard` - Already exists
- ✅ `AuraRingCard` - Already exists
- ✅ `RizikDhaarCard` - Already exists

### New Cards to Create
- 🆕 `ActiveOrderAlertCard` - Track live orders
- 🆕 `BazarListAlertCard` - Shopping list notifications
- 🆕 `DutyRosterAlertCard` - Family duty reminders
- 🆕 `InventoryAlertCard` - Low stock alerts
- 🆕 `SquadAlertCard` - Squad notifications
- 🆕 `MealPlanStatusCard` - Meal plan status

### Provider Dependencies
- `OrderProvider` - For active orders
- `KhataProvider` - For inventory/shopping list
- `DutyRosterProvider` - For family duties
- `InventoryProvider` - For kitchen inventory
- `SquadProvider` - For squad alerts
- `AuraProvider` - For level/XP
- `RizikDhaarProvider` - For loans

---

## 🎯 Final Result

**Consumer Home becomes a true Management Hub**:
- Quick access to financial tools
- Real-time household alerts
- Family responsibility tracking
- No distractions from food discovery
- Clean, focused interface for housewives/consumers

**Bazar Tab becomes the Discovery Hub**:
- All food posts
- Restaurant listings
- Reviews and reels
- Flash sales
- Active bids
- Shopping opportunities
