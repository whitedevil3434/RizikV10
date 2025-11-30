# Active Files Map - What's Actually Used

## 🎯 Core Application Flow

```
lib/main.dart
  ↓
lib/screens/main_screen.dart
  ↓
├─ Consumer: lib/screens/home/consumer_home.dart
│    ├─ Khata OS: lib/screens/khata_os_merged.dart ✅ ACTIVE
│    ├─ Aura Dashboard: lib/screens/aura_dashboard_screen.dart
│    ├─ Cart: lib/screens/cart_review_screen.dart
│    └─ Orders: lib/screens/orders_screen.dart
│
├─ Partner: lib/screens/home/partner_home.dart
│    ├─ Orders: lib/screens/partner/rizik_now_management_screen.dart
│    ├─ Calendar: lib/screens/partner/meal_calendar_screen.dart
│    └─ Analytics: lib/screens/partner_analytics_screen.dart
│
└─ Rider: lib/screens/home/rider_home.dart
     ├─ Missions: lib/widgets/rider_mission_card.dart
     ├─ Journey: lib/screens/rider/rider_delivery_journey_screen.dart
     └─ Earnings: lib/screens/rider/rider_earnings_screen.dart
```

---

## 📱 Active Screens (Used in Navigation)

### Home Screens (3)
- ✅ `lib/screens/home/consumer_home.dart` - Main consumer interface
- ✅ `lib/screens/home/partner_home.dart` - Main partner interface
- ✅ `lib/screens/home/rider_home.dart` - Main rider interface

### Khata OS (1 - ONLY THIS ONE)
- ✅ `lib/screens/khata_os_merged.dart` - **THE ACTIVE KHATA OS**
- ❌ `lib/screens/khata_os_final.dart` - DELETE (old version)
- ❌ `lib/screens/khata_os_new.dart` - DELETE (old version)
- ❌ `lib/screens/khata_os_professional.dart` - DELETE (old version)
- ❌ `lib/screens/khata_os_v5.dart` - DELETE (old version)

### Core Screens (8)
- ✅ `lib/screens/main_screen.dart` - Main navigation
- ✅ `lib/screens/splash_screen.dart` - App launch
- ✅ `lib/screens/fooddrobe_screen.dart` - Food marketplace
- ✅ `lib/screens/orders_screen.dart` - Order management
- ✅ `lib/screens/wallet_screen.dart` - Wallet/payments
- ✅ `lib/screens/profile_screen.dart` - User profile
- ✅ `lib/screens/cart_review_screen.dart` - Cart checkout
- ✅ `lib/screens/payment_method_screen.dart` - Payment selection

### Feature Screens (12)
- ✅ `lib/screens/aura_dashboard_screen.dart` - Game OS dashboard
- ✅ `lib/screens/copilot_screen.dart` - AI copilot
- ✅ `lib/screens/hyperlocal_marketplace_screen.dart` - Services marketplace
- ✅ `lib/screens/service_booking_screen.dart` - Book services
- ✅ `lib/screens/create_service_screen.dart` - Create service listing
- ✅ `lib/screens/mission_chain_screen.dart` - Mission chains
- ✅ `lib/screens/user_profile_screen.dart` - User profile details
- ✅ `lib/screens/squad_features_hub.dart` - Squad features
- ✅ `lib/screens/order_confirmation_screen.dart` - Order confirmation
- ✅ `lib/screens/order_history_screen.dart` - Order history
- ✅ `lib/screens/order_tracking_screen.dart` - Live tracking
- ✅ `lib/screens/product_details_screen.dart` - Product details

---

## 🔌 Active Providers (All 19 Registered)

```dart
// From lib/main.dart
RoleProvider()              ✅ Role switching
ProfileProvider()           ✅ User profile
FeedProvider()              ✅ Content feed
CartProvider()              ✅ Shopping cart
OrderProvider()             ✅ Consumer orders
PartnerOrderProvider()      ✅ Partner orders
RiderMissionProvider()      ✅ Rider missions
TrustScoreProvider()        ✅ Trust scoring
KhataProvider()             ✅ Khata OS data
MoneybagProvider()          ✅ Wallet/money
InventoryProvider()         ✅ Inventory tracking
ShoppingProvider()          ✅ Shopping lists
SquadProvider()             ✅ Squad management
RizikDhaarProvider()        ✅ Loan system
MoverFloatProvider()        ✅ Float management
DutyRosterProvider()        ✅ Duty scheduling
SquadTribunalProvider()     ✅ Dispute resolution
AuraProvider()              ✅ Game OS/Aura
CoPilotProvider()           ✅ AI copilot
```

**Note**: `hyperlocal_provider_simple.dart` is NOT registered → DELETE

---

## �� Active Widgets (All Used)

### Core UI (8)
- ✅ `lib/widgets/bottom_nav.dart` - Bottom navigation
- ✅ `lib/widgets/global_header.dart` - App header
- ✅ `lib/widgets/frosted_drawer.dart` - Side drawer
- ✅ `lib/widgets/role_slider.dart` - Role switcher
- ✅ `lib/widgets/search_filter_bar.dart` - Search bar
- ✅ `lib/widgets/feed_cards.dart` - Feed items
- ✅ `lib/widgets/trust_score_badge.dart` - Trust display
- ✅ `lib/widgets/trust_score_warning.dart` - Trust warnings

### Khata OS (5)
- ✅ `lib/widgets/khata_os_card.dart` - Khata card
- ✅ `lib/widgets/khata_book.dart` - Book widget
- ✅ `lib/widgets/khata_page.dart` - Page widget
- ✅ `lib/widgets/dynamic_khata_page.dart` - Dynamic pages
- ✅ `lib/widgets/voice_input_widget.dart` - Voice input

### Game OS (6)
- ✅ `lib/widgets/aura_ring.dart` - Aura ring display
- ✅ `lib/widgets/xp_popup.dart` - XP notifications
- ✅ `lib/widgets/level_up_modal.dart` - Level up modal
- ✅ `lib/widgets/badge_showcase.dart` - Badge display
- ✅ `lib/widgets/daily_quests_card.dart` - Quest card
- ✅ `lib/widgets/feature_card.dart` - Feature unlock card
- ✅ `lib/widgets/unlock_requirement_modal.dart` - Unlock modal

### Other (19)
- All other widgets in lib/widgets/ are actively used

---

## 📦 Active Models (All 27 Used)

All models in `lib/models/` are actively used by providers and screens.

---

## 🛠️ Active Services (All 15 Used)

All services in `lib/services/` are actively used by providers.

---

## ⚙️ Configuration (All Used)

All files in `lib/config/` and `lib/data/` are actively used.

---

## 🗑️ Files NOT Used (To Delete)

### Screens (7)
- ❌ `lib/screens/khata_os_final.dart`
- ❌ `lib/screens/khata_os_new.dart`
- ❌ `lib/screens/khata_os_professional.dart`
- ❌ `lib/screens/khata_os_v5.dart`
- ❌ `lib/screens/khata_screen.dart`
- ❌ `lib/screens/home_screen.dart`
- ❌ `lib/screens/virtual_shop_screen.dart`

### Consumer Home Duplicates (5)
- ❌ `lib/screens/home/consumer_home_strategic_deck.dart`
- ❌ `lib/screens/home/consumer_home_v6.dart`
- ❌ `lib/screens/home/consumer_home_v6_fixed.dart`
- ❌ `lib/screens/home/consumer_home.dart.backup`
- ❌ `lib/screens/home/consumer_home.dart.bak`

### Providers (1)
- ❌ `lib/providers/hyperlocal_provider_simple.dart`

### Linux Platform (3)
- ❌ `linux/main.dart`
- ❌ `linux/page.dart`
- ❌ `linux/screen.dart`

### Documentation (~140 files)
- ❌ All .md files except README.md and essential specs

---

## ✅ Summary

**Total Active Code Files**: ~150
- Screens: ~60 files
- Providers: 19 files
- Models: 27 files
- Services: 15 files
- Widgets: 38 files
- Config: 8 files

**Files to Delete**: ~160
- Duplicate screens: 12 files
- Unused code: 4 files
- Documentation: ~140 files
- Other: 4 files

**Result**: Clean, production-ready codebase with no duplicates or unused files.
