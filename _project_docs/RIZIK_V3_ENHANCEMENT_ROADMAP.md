# 🚀 Rizik V3 Enhancement Roadmap
## From v0.5 Skeleton to v3 Super App Ecosystem

**Current Status**: v0.5 - Basic 3-role marketplace with cart/order system  
**Target**: v3 - Complete economic ecosystem with trust, automation, and social impact

---

## 📊 Current v0.5 Implementation Analysis

### ✅ What's Already Built
1. **3-Role System**: Consumer, Partner (Maker), Rider (Mover)
2. **Basic Cart & Orders**: Add to cart, checkout, order tracking
3. **Feed System**: Role-specific home feeds with cards
4. **Navigation**: Bottom nav, role switching, drawer
5. **Providers**: Cart, Order, Feed, Role, Partner Orders, Rider Missions
6. **Swipeable Mission Cards**: Just implemented for riders

### 🔴 Critical Gaps (From Designer Conversation)
The conversation reveals **40+ strategic gaps** across 5 major categories:

---

## 🎯 Phase 1: Foundation Layer (Weeks 1-4)
### Priority: Build Trust & Economic Infrastructure

#### 1.1 Trust Score System (গ্যাপ ১৩)
**Why**: Core to all interactions - lending, hiring, reputation
**Implementation**:
```dart
// lib/models/trust_score.dart
class TrustScore {
  final double score; // 0-5
  final int totalTransactions;
  final double onTimeRate;
  final double qualityScore;
  final List<Badge> badges;
  final Map<String, double> categoryScores; // cooking, delivery, payment
}

// lib/providers/trust_provider.dart
class TrustProvider {
  Future<void> updateTrustScore(String userId, TrustEvent event);
  TrustScore calculateTrustScore(String userId);
  List<Badge> awardBadges(TrustScore score);
}
```

**UI Components**:
- Trust badge display on profiles
- Trust score breakdown modal
- Badge showcase (শাবাশ! system)
- Trust history timeline

#### 1.2 Active Khata OS (অস্ত্র ৩ - Smart Shongshar Khata)
**Why**: Digital ledger for all financial tracking
**Implementation**:
```dart
// lib/models/khata.dart
class Khata {
  final String id;
  final KhataType type; // personal, shared, squad, rent
  final List<KhataEntry> entries;
  final double balance;
  final Map<String, double> categoryBreakdown;
}

class KhataEntry {
  final String id;
  final double amount;
  final KhataCategory category; // food, utility, rent, savings
  final DateTime timestamp;
  final String? attachedReceipt;
  final bool isLocked; // for committed expenses
}

// lib/screens/khata_screen.dart
// - Voice command input (ভয়েস কমান্ড)
// - Auto-categorization
// - Expense predictions
// - Savings goals (সঞ্চয় পট)
```

#### 1.3 Shared Wallet & Squad System (অস্ত্র ৫)
**Why**: Enable group economics (squads, families)
**Implementation**:
```dart
// lib/models/squad.dart
class Squad {
  final String id;
  final SquadType type; // maker, mover, family
  final List<SquadMember> members;
  final SharedWallet wallet;
  final DutyRoster roster;
  final RentLedger? rentLedger; // for maker squads
}

class SharedWallet {
  final double balance;
  final Map<String, double> memberContributions;
  final List<WalletTransaction> transactions;
  final List<LockedFund> lockedFunds; // rent, utilities
}

// lib/screens/squad/squad_management_screen.dart
// - Create/join squad
// - Duty roster management
// - Shared wallet dashboard
// - Squad tribunal (conflict resolution)
```

---

## 🎯 Phase 2: Hyperlocal Economy (Weeks 5-8)
### Priority: Enable P2P Services & Asset Sharing

#### 2.1 Hyperlocal Services Marketplace (অস্ত্র ১-২)
**Why**: Monetize idle assets and skills
**Implementation**:
```dart
// lib/models/hyperlocal_service.dart
enum ServiceType {
  bataMosla, // বট মশলা (ground spices)
  fridgeSpace, // ফ্রিজ স্পেস
  tutoring, // টিউশনি
  babySitting, // বেবি সিটিং
  cleaning, // পরিষ্কার
  groceryShopping, // বাজার
  microDelivery, // মাইক্রো-ডেলিভারি (flat to flat)
}

class HyperlocalService {
  final String id;
  final ServiceType type;
  final String providerId;
  final double price;
  final String location; // building/area
  final bool isAvailable;
  final TrustScore providerTrust;
}

// lib/screens/hyperlocal/service_marketplace_screen.dart
// - Browse nearby services
// - Filter by building/area
// - Book service with escrow
// - Rate & review
```

#### 2.2 P2P Asset Rental (অস্ত্র ৪)
**Why**: Share underutilized assets
**Implementation**:
```dart
// lib/models/asset_rental.dart
enum AssetType {
  appliance, // fridge, AC, stove
  vehicle, // bicycle, motorcycle
  tool, // pressure cooker, mixer
  space, // storage, parking
}

class RentalAsset {
  final String id;
  final AssetType type;
  final String ownerId;
  final double dailyRate;
  final bool isAvailable;
  final List<RentalBooking> bookings;
  final MaintenanceLog maintenanceLog;
}

// lib/screens/assets/asset_marketplace_screen.dart
// - List assets for rent
// - Browse available assets
// - Booking calendar
// - Damage deposit handling
```

#### 2.3 Micro-Task System (গ্যাপ ২০ - Tasker/Runner Role)
**Why**: Enable micro-earnings for students/idle time
**Implementation**:
```dart
// lib/models/micro_task.dart
class MicroTask {
  final String id;
  final TaskType type; // delivery, shopping, cleaning
  final String description;
  final double reward; // ৫-৫০ টাকা
  final String location;
  final DateTime deadline;
  final TaskStatus status;
}

// lib/screens/tasks/task_marketplace_screen.dart
// - Browse nearby tasks
// - Accept task
// - Complete with proof (photo/signature)
// - Instant payment
```

---

## 🎯 Phase 3: Squad Operations (Weeks 9-12)
### Priority: Enable Team-Based Business

#### 3.1 Maker Squad System (অস্ত্র ৫-৭)
**Why**: Cloud kitchen operations
**Implementation**:
```dart
// lib/models/maker_squad.dart
class MakerSquad extends Squad {
  final DutyRoster dutyRoster;
  final CapacityLock capacityLock; // max meals per day
  final RentLedger rentLedger;
  final SkillMatrix skillMatrix; // who can cook what
  final ActiveRecipeBook recipeBook;
}

class DutyRoster {
  final Map<String, List<Shift>> memberShifts;
  final List<DutySwap> pendingSwaps;
  final Map<String, double> performanceScores;
}

// lib/screens/maker/squad_dashboard_screen.dart
// - Duty roster calendar
// - Capacity management
// - Rent payment tracking
// - Squad performance metrics
```

#### 3.2 Mover Squad System (গ্যাপ ২৮-৩০)
**Why**: Efficient delivery operations
**Implementation**:
```dart
// lib/models/mover_squad.dart
class MoverSquad extends Squad {
  final SquadDispatcher dispatcher;
  final PooledIncome pooledIncome;
  final MaintenanceFund maintenanceFund;
  final List<Vehicle> vehicles;
}

class SquadDispatcher {
  final String leaderId;
  Future<void> assignMission(Mission mission, String moverId);
  List<Mission> getAvailableMissions();
  Map<String, Location> getMemberLocations();
}

// lib/screens/mover/dispatcher_control_screen.dart
// - Live map with member locations
// - Drag-and-drop mission assignment
// - Mission chain optimization
// - Pooled income dashboard
```

#### 3.3 Tiered Mission System (গ্যাপ ১)
**Why**: Prevent competition between single/squad movers
**Implementation**:
```dart
// lib/models/mission_tier.dart
enum MissionTier {
  micro, // ৫-৫০ টাকা, single movers only
  standard, // ৫০-৫০০ টাকা, both
  heavy, // ৫০০+ টাকা, squads only
}

class TieredMissionSystem {
  MissionTier determineTier(Mission mission);
  List<String> getEligibleMovers(Mission mission);
  bool canAcceptMission(String moverId, Mission mission);
}
```

---

## 🎯 Phase 4: Financial Infrastructure (Weeks 13-16)
### Priority: Enable Capital Flow & Lending

#### 4.1 Rizik Dhaar (Micro-Lending) (অস্ত্র ২)
**Why**: Provide working capital without cash
**Implementation**:
```dart
// lib/models/rizik_dhaar.dart
class RizikDhaar {
  final String id;
  final String borrowerId;
  final double amount;
  final LoanType type; // ingredient, equipment, fuel
  final LockedVoucher voucher; // can only use at verified vendors
  final RepaymentSchedule schedule;
  final TrustScore requiredTrust;
}

class LockedVoucher {
  final double amount;
  final List<String> allowedVendorIds;
  final DateTime expiryDate;
  bool canUseAt(String vendorId);
}

// lib/screens/finance/rizik_dhaar_screen.dart
// - Apply for loan
// - View approved vendors
// - Repayment tracking
// - Trust score impact
```

#### 4.2 Mover Float System (গ্যাপ ২৬)
**Why**: Enable movers to start work without capital
**Implementation**:
```dart
// lib/models/mover_float.dart
class MoverFloat {
  final String moverId;
  final double dailyLimit; // based on trust score
  final double currentFloat;
  final double repaidToday;
  final AutoRepayment autoRepayment; // 10% per trip
}

// lib/screens/mover/float_management_screen.dart
// - Request daily float
// - View auto-repayment
// - Float history
```

#### 4.3 Digital Collateral Fund (গ্যাপ ২৮)
**Why**: Enable bank loans using platform data
**Implementation**:
```dart
// lib/models/digital_collateral.dart
class DigitalCollateral {
  final String userId;
  final TrustScore trustScore;
  final double monthlyRevenue;
  final int transactionCount;
  final double collateralValue; // calculated
}

class SocialCollateralEngine {
  double calculateCollateralValue(String userId);
  Future<LoanApplication> applyForBankLoan(String userId, double amount);
  Future<void> setupRevenueEscrow(String userId, double percentage);
}
```

---

## 🎯 Phase 5: Automation & Intelligence (Weeks 17-20)
### Priority: Reduce Manual Work

#### 5.1 Meal Toggle & Predictive OS (অস্ত্র ৭)
**Why**: Auto-predict demand
**Implementation**:
```dart
// lib/models/meal_toggle.dart
class MealToggle {
  final String householdId;
  final Map<DateTime, int> mealCounts;
  final List<MealPattern> patterns; // detected patterns
  
  int predictMealCount(DateTime date);
  void autoAdjustCapacity();
}

// lib/screens/consumer/meal_toggle_screen.dart
// - Set meal counts
// - View predictions
// - Auto-notify makers
```

#### 5.2 AI Menu Engineer (গ্যাপ ১)
**Why**: Suggest recipes based on inventory
**Implementation**:
```dart
// lib/services/ai_menu_service.dart
class AIMenuService {
  Future<List<Recipe>> suggestRecipes({
    required List<Ingredient> availableIngredients,
    required double targetProfitMargin,
    required String location,
  });
  
  double calculateProfitMargin(Recipe recipe);
  bool hasCompetition(Recipe recipe, String location);
}
```

#### 5.3 Mission Chain Optimization (অস্ত্র ৩১)
**Why**: Reduce empty trips
**Implementation**:
```dart
// lib/services/mission_chain_service.dart
class MissionChainService {
  List<Mission> optimizeRoute(List<Mission> missions, Location currentLocation);
  double calculateRouteEfficiency(List<Mission> chain);
  Future<void> suggestChainToMover(String moverId);
}
```

---

## 🎯 Phase 6: Social & Gamification (Weeks 21-24)
### Priority: Engagement & Retention

#### 6.1 Rizik Aura (5-Level Progression)
**Why**: Gamify growth and learning
**Implementation**:
```dart
// lib/models/rizik_aura.dart
enum AuraLevel {
  initiate, // Level 0: Consumer & learner
  apprentice, // Level 1: Micro-monetizer
  master, // Level 2: Cloud kitchen operator
  architect, // Level 3: Scaling & formalization
  apex, // Level 4: Ecosystem leader
}

class AuraProgression {
  AuraLevel currentLevel;
  int xp;
  List<Badge> badges;
  List<Quest> activeQuests;
  
  void completeQuest(Quest quest);
  void awardXP(int amount);
  bool canLevelUp();
}

// lib/screens/aura/aura_dashboard_screen.dart
// - Level progress
// - Active quests
// - Badge showcase
// - Leaderboard
```

#### 6.2 Quest System (Track A & B)
**Why**: Guide users through features
**Implementation**:
```dart
// lib/models/quest.dart
enum QuestTrack {
  economic, // Track A: Business quests
  social, // Track B: Social impact quests
}

class Quest {
  final String id;
  final QuestTrack track;
  final String title;
  final String description;
  final int xpReward;
  final List<QuestStep> steps;
  final QuestDifficulty difficulty;
}

// Example Quests:
// - "Speed Chop Dare" (physical skill)
// - "Spice Hunter" (sourcing)
// - "Trojan Horse" (social impact)
// - "4-Task Tower" (productivity)
```

#### 6.3 Shabash! Badge System (অস্ত্র ১৩)
**Why**: Social recognition
**Implementation**:
```dart
// lib/models/badge.dart
class Badge {
  final String id;
  final String name;
  final String nameBn;
  final String emoji;
  final BadgeCategory category;
  final BadgeRarity rarity;
}

// Badge Categories:
// - Speed (দ্রুততম ⚡)
// - Trust (বিশ্বস্ত 🛡️)
// - Quality (মান 🌟)
// - Social Impact (সামাজিক প্রভাব 💚)
// - Skill (দক্ষতা 🥋)
```

---

## 🎯 Phase 7: Advanced Features (Weeks 25-28)
### Priority: Complete Ecosystem

#### 7.1 Landlord OS (অস্ত্র ৫)
**Why**: Enable squad-landlord relationship
**Implementation**:
```dart
// lib/models/landlord_os.dart
class LandlordOS {
  final String landlordId;
  final List<Property> properties;
  final List<Squad> tenantSquads;
  final RentLedger rentLedger;
  final AssetAudit assetAudit;
}

class RentLedger {
  final Map<String, List<RentPayment>> squadPayments;
  final double securityDeposit;
  final LiquidationProtocol liquidationProtocol;
}

// lib/screens/landlord/landlord_dashboard_screen.dart
// - Property management
// - Rent tracking
// - Squad performance
// - Asset audit photos
```

#### 7.2 Liquidation OS (গ্যাপ ১৭)
**Why**: Handle squad breakups gracefully
**Implementation**:
```dart
// lib/models/liquidation_os.dart
class LiquidationOS {
  Future<void> initiateBreakup(String squadId);
  Future<void> settleDebts();
  Future<void> distributeAssets();
  Future<void> returnSecurityDeposit();
  Future<void> sellRemainingAssets(); // via P2P marketplace
}
```

#### 7.3 Data Monetization (V1 অস্ত্র)
**Why**: Long-term revenue
**Implementation**:
```dart
// lib/services/data_broker_service.dart
class DataBrokerService {
  Future<void> sellAnonymizedData({
    required DataType type,
    required List<String> partners, // banks, CPG companies
  });
  
  // Data types:
  // - Utility consumption patterns
  // - Credit vetting reports
  // - Sourcing knowledge base
}
```

---

## 🎯 Phase 8: Polish & Launch (Weeks 29-32)
### Priority: Production Ready

#### 8.1 Supabase Integration
**Why**: Real-time data, auth, storage
**Tables**:
```sql
-- Core tables
users (id, role, trust_score, aura_level)
squads (id, type, members, wallet_balance)
khatas (id, user_id, type, entries)
missions (id, tier, status, assigned_to)
services (id, type, provider_id, price)
assets (id, type, owner_id, rental_rate)
quests (id, track, steps, rewards)
badges (id, user_id, badge_type, earned_at)

-- Financial tables
loans (id, borrower_id, amount, voucher_id)
floats (id, mover_id, daily_limit, repaid)
rent_ledger (id, squad_id, landlord_id, payments)

-- Trust & reputation
trust_scores (id, user_id, score, breakdown)
reviews (id, reviewer_id, reviewee_id, rating)
tribunal_cases (id, squad_id, case_details, verdict)
```

#### 8.2 Real-time Features
- Live mission tracking
- Squad chat
- Instant notifications
- Live location sharing

#### 8.3 Security & Privacy
- Data vault protocol
- Permission marketplace
- Encrypted khatas
- GDPR compliance

---

## 📈 Implementation Priority Matrix

### Must Have (v1.0)
1. Trust Score System
2. Active Khata OS
3. Shared Wallet & Squads
4. Hyperlocal Services
5. Micro-Task System
6. Rizik Dhaar (Lending)
7. Mover Float

### Should Have (v2.0)
1. Maker Squad Operations
2. Mover Squad Dispatch
3. Tiered Mission System
4. Meal Toggle & Predictions
5. AI Menu Engineer
6. Rizik Aura (Gamification)
7. Quest System

### Nice to Have (v3.0)
1. Landlord OS
2. Liquidation OS
3. Data Monetization
4. Advanced Analytics
5. Social Impact Tracking
6. Investment Platform

---

## 🛠️ Technical Architecture

### State Management
```dart
// Enhanced provider structure
providers/
  ├── trust_provider.dart
  ├── khata_provider.dart
  ├── squad_provider.dart
  ├── hyperlocal_provider.dart
  ├── task_provider.dart
  ├── loan_provider.dart
  ├── float_provider.dart
  ├── aura_provider.dart
  └── quest_provider.dart
```

### Screen Structure
```dart
screens/
  ├── khata/
  │   ├── khata_dashboard_screen.dart
  │   ├── expense_entry_screen.dart
  │   └── savings_goal_screen.dart
  ├── squad/
  │   ├── squad_creation_screen.dart
  │   ├── squad_dashboard_screen.dart
  │   ├── duty_roster_screen.dart
  │   └── squad_tribunal_screen.dart
  ├── hyperlocal/
  │   ├── service_marketplace_screen.dart
  │   ├── asset_rental_screen.dart
  │   └── task_marketplace_screen.dart
  ├── finance/
  │   ├── rizik_dhaar_screen.dart
  │   ├── float_management_screen.dart
  │   └── loan_application_screen.dart
  ├── aura/
  │   ├── aura_dashboard_screen.dart
  │   ├── quest_list_screen.dart
  │   └── badge_showcase_screen.dart
  └── maker/
      ├── squad_dashboard_screen.dart
      ├── capacity_management_screen.dart
      └── recipe_suggestion_screen.dart
```

---

## 🎨 UI/UX Enhancements

### Design System
- **Colors**: Rizik Green (#00B16A), Craft Brown, Festive Gold
- **Typography**: Bengali + English support
- **Animations**: Smooth transitions, micro-interactions
- **Haptics**: Contextual feedback

### Key Screens to Redesign
1. **Home Feeds**: Add khata summary, squad status, active quests
2. **Profile**: Show trust score, aura level, badges
3. **Wallet**: Integrate khata, shared wallet, float
4. **Orders**: Add mission tracking, squad dispatch

---

## 📊 Success Metrics

### Economic Metrics
- Total transaction volume
- Average trust score
- Loan repayment rate
- Squad formation rate
- Asset utilization rate

### Engagement Metrics
- Daily active users
- Quest completion rate
- Badge earning rate
- Aura level distribution
- Retention rate

### Social Impact Metrics
- Hyperlocal transactions
- Micro-task completions
- Squad success rate
- Community fund contributions

---

## 🚦 Next Steps

1. **Review this roadmap** with the team
2. **Prioritize Phase 1** features
3. **Design Supabase schema**
4. **Create UI mockups** for key screens
5. **Start with Trust Score System** (foundation for everything)

---

**Note**: This roadmap transforms Rizik from a simple food delivery app into a complete economic operating system for urban communities, exactly as envisioned in the designer conversation.
