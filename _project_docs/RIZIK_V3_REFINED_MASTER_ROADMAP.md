# 🚀 Rizik V3 Refined Master Roadmap
## From v0.5 Skeleton to v3 Complete Ecosystem

**Status**: v0.5 → v3 (32-week transformation)  
**Vision**: Not just food delivery - A complete economic operating system for urban communities

---

## 📊 Current State Analysis

### ✅ What Exists (v0.5)
- 3-role system (Consumer, Partner, Rider)
- Basic cart & order flow
- Role-specific home feeds
- Swipeable mission cards (just implemented)
- Provider architecture (Cart, Order, Feed, Missions)

### 🎯 What's Missing (From Designer Conversations)
The conversations reveal **5 critical architectural shifts**:

1. **Home Tab ≠ Marketplace** - Home is "Lifestyle OS", Fooddrobe is "Discovery"
2. **Single vs Squad** - Dual operating systems for individuals and teams
3. **Trust-First** - Everything built on Trust Score foundation
4. **Context-Aware** - Co-Pilot engine that detects user context
5. **Fluent Role Surfing** - Roles find users, not users find roles

---

## 🏗️ V3 Architecture: The Two-Tab System

### Tab 1: Home (Lifestyle OS / Digital Twin)
**Purpose**: Management, not discovery  
**For**: Personal life management

**Dynamic Subscription OS Card** (The Brain):
```dart
// Changes based on user profile
if (user.isStudent) {
  show MessKhataCard(); // Meal toggle, guest add, payment
} else if (user.isHousewife) {
  show SubscriptionManagerCard(); // Milk, water, babysitter
}
```

**Other Home Cards**:
- Live Ledger (Auto-calculated food cost)
- AI Pantry (Auto-deduction from inventory)
- Squad Dashboard (if in squad)
- Active Tasks/Quests

### Tab 2: Fooddrobe/Bazaar (Discovery Engine)
**Purpose**: Opportunity marketplace  
**For**: Finding food, services, assets

**Categories**:
- Food ordering
- C2C marketplace (used items)
- Hyperlocal services (babysitter, tutor)
- Asset rental (fridge space, tools)
- Micro-tasks (runner gigs)

---

## 🎯 Phase 1: Foundation (Weeks 1-4)
### Critical Infrastructure

#### 1.1 Trust Score System (The Foundation)
**Why**: Core to lending, hiring, reputation

```dart
// lib/models/trust_score.dart
class TrustScore {
  final double score; // 0-5
  final Map<String, double> categoryScores; // cooking, delivery, payment
  final List<Badge> badges; // শাবাশ! system
  final int totalTransactions;
  final double onTimeRate;
  
  // Shabash! Badges
  static const badges = [
    'দ্রুততম ⚡', // Fastest
    'বিশ্বস্ত 🛡️', // Trusted
    'মান 🌟', // Quality
    'সামাজিক প্রভাব 💚', // Social Impact
  ];
}
```

**UI Components**:
- Trust badge on all profiles
- Badge showcase screen
- Trust history timeline
- Category breakdown

#### 1.2 Rizik Treasury (Manual Banking OS)
**Why**: V1 needs zero-cost payment system

**The Reference Code Trick**:
```dart
// User adds money
1. User taps [+ Add Money]
2. App generates unique code: RZK-901
3. Shows Bangla QR + instruction: "Write RZK-901 in reference"
4. Backend team receives SMS alert
5. Team searches RZK-901 in admin panel
6. Approves → User's Moneybag updates (2-5 min)
```

**Safety Shield**:
- Never use words "Bank" or "Deposit"
- Use "Wallet Balance" or "Rizik Credit"
- Limit: Max ৳5000 per transaction
- Backup: Personal merchant bKash number

#### 1.3 Active Khata OS (Smart Shongshar Khata)
**Why**: Digital ledger for all financial tracking

```dart
// lib/models/khata.dart
class Khata {
  final KhataType type; // personal, shared, squad, rent
  final List<KhataEntry> entries;
  final AIAutomation automation; // voice command, auto-categorization
}

// The Auto-Cost Engine
class AutoCostEngine {
  // Knows: 1 plate rice = 100g rice
  // Deducts from AI Pantry automatically
  // Updates Live Ledger: "Today's Food Cost: ৳120"
}
```

---

## 🎯 Phase 2: Dual Operating Systems (Weeks 5-8)
### Single vs Squad Architecture

#### 2.1 Single Maker (Hobbyist/Housewife)
**Tools**:
- Live Ledger (personal only)
- AI Listing (FAB)
- Appointment OS (if tutor)

**Limitations**:
- Cannot see Tier 3 orders (100+ plates)
- Capacity locked

#### 2.2 Squad Maker (Cloud Kitchen/Bachelor Mess)
**Additional Tools**:
```dart
class MakerSquad {
  final SharedWallet wallet; // Tohobil Crisis killer
  final DutyRoster roster; // Jhogra Crisis killer
  final IncomeSplitting splitting; // Auto-split by role weightage
  final ActiveTaskChain taskChain; // Buyer → Cutter notification
  final SquadTribunal tribunal; // Democratic penalty voting
}
```

#### 2.3 Single Mover (Runner/Solo Rider)
**Tools**:
- Tiered Marketplace (Tier 1 & 2 only)
- Mission Chain OS (bundle 3 missions)
- Mover Micro-Float (৳200 daily loan)

#### 2.4 Squad Mover (Logistics Powerhouse)
**Additional Tools**:
```dart
class MoverSquad {
  final SquadDispatcher dispatcher; // Mini-Uber control center
  final PooledIncome pooledIncome; // Split by duty hours, not trips
  final MaintenanceFund maintenanceFund; // Auto-save 5% per trip
  final MultiMoverMission multiMover; // Auto-assign 2 movers for heavy items
  final SquadCollateral collateral; // Security deposit locked
}
```

**Tier 3 Access**: Only squads see heavy missions (fridge delivery, house moving)

---

## 🎯 Phase 3: Co-Pilot Engine (Weeks 9-12)
### Context-Aware Intelligence

#### 3.1 The Fluent Role Surfing
**Concept**: Roles find users, not users find roles

**Example Flow**:
```dart
// Shamim (Student) is walking to library
// Still in [Shamim] personal role

// Co-Pilot detects:
- Identity: Student (verified)
- Context: Walking (GPS/pedometer)
- Status: Idle (free time)

// Co-Pilot knows:
- Nusrat has C2C book delivery
- It's on Shamim's path

// Floating Opportunity Pill appears:
"🚶‍♂️ Runner Gig (On Foot)? (300m) (On your path). Earning: ৳30"

// Shamim taps → Modal:
"Activate as Rider? Your Rider Moneybag is ready."

// He accepts → Delivers → Earns ৳30 → Buys Coke with Rizik Pay
```

**Implementation**:
```dart
class CoPilotEngine {
  Future<Opportunity?> detectOpportunity(User user) async {
    final context = await getUserContext(user);
    
    if (context.isWalking && context.isIdle) {
      final nearbyTasks = await findTasksOnPath(
        user.location,
        user.destination,
      );
      
      if (nearbyTasks.isNotEmpty) {
        return FloatingOpportunityPill(task: nearbyTasks.first);
      }
    }
    
    return null;
  }
}
```

#### 3.2 AI Menu Engineer
**Why**: Suggest recipes based on inventory

```dart
class AIMenuService {
  Future<List<Recipe>> suggestRecipes({
    required List<Ingredient> availableIngredients,
    required double targetProfitMargin,
    required String location,
  }) async {
    // Uses Global Recipe Database
    // Calculates: 1 plate rice = 100g rice
    // Suggests: "Moroccan Tagine - 75% profit, no competition"
  }
}
```

#### 3.3 Meal Toggle & Predictive OS
**Why**: Auto-predict demand

```dart
class MealToggle {
  final Map<DateTime, int> mealCounts;
  final List<MealPattern> detectedPatterns;
  
  int predictMealCount(DateTime date) {
    // Learns patterns
    // Auto-notifies makers
    // Sets capacity lock
  }
}
```

---

## 🎯 Phase 4: Hyperlocal Economy (Weeks 13-16)
### P2P Services & Asset Sharing

#### 4.1 Hyperlocal Service Grid
**Services**:
```dart
enum ServiceType {
  bataMosla, // বট মশলা (ground spices)
  fridgeSpace, // ফ্রিজ স্পেস
  tutoring, // টিউশনি
  babySitting, // বেবি সিটিং
  cleaning, // পরিষ্কার
  groceryShopping, // বাজার
  microDelivery, // মাইক্রো-ডেলিভারি (flat to flat)
}
```

**The Micro-Task Engine**:
```dart
// Solves: "Who delivers 2kg onion paste from Flat 6B to 4A?"
class MicroTask {
  final String description;
  final double reward; // ৳5-50
  final String location; // Same building
  
  // Creates "Floating Opportunity Pill" for nearby idle users
}
```

#### 4.2 P2P Asset Rental
```dart
enum AssetType {
  appliance, // fridge, AC, stove
  vehicle, // bicycle, motorcycle
  tool, // pressure cooker, mixer
  space, // storage, parking
}

// Example: Student rents bicycle for ৳50/day
// Uses it for baby sitting gigs
// Returns after earning ৳200
```

#### 4.3 Rizik Dhaar (Micro-Lending)
**Why**: Provide working capital without cash

```dart
class RizikDhaar {
  final LockedVoucher voucher; // Can only use at verified vendors
  final TrustScore requiredTrust;
  
  // Example: ৳5000 voucher for bicycle
  // Can only redeem at verified bicycle shops
  // Prevents cash misuse
}
```

---

## 🎯 Phase 5: Gamification (Weeks 17-20)
### Rizik Aura & Quest System

#### 5.1 5-Level Progression
```dart
enum AuraLevel {
  initiate, // Level 0: Consumer & learner (10 days Khata use)
  apprentice, // Level 1: Micro-monetizer (Trust 4.0+, 5 services)
  master, // Level 2: Cloud kitchen operator (5 duty rosters)
  architect, // Level 3: Scaling (৳20k/month, mentor 1 person)
  apex, // Level 4: Ecosystem leader (3 apprentices, 10 tribunal cases)
}
```

#### 5.2 100+ Killing Tasks/Quests
**Series 1: Trust Builder**
1. The Open Kitchen Challenge (10s video)
2. The Seal Master (50 perfect seals)
3. The Face Reveal (15s hello video)
4. The Rain Warrior (3 deliveries in rain)
5. The Honesty Test (return extra money)

**Series 2: Money Maker**
6. The Midnight Snack (11 PM offer)
7. The Leftover Saver (50% flash sale)
8. The Double Header (2 deliveries, 1 trip)
9. The Rental Boss (rent blender)
10. The Space Seller (rent fridge space)

**Series 3: Social Glue**
11. The Neighborhood Treat (free sample)
12. The Recipe Share (teaser video)
13. The Birthday Special (free cupcake)
14. The Community Donor (1 meal/week to poor)
15. The Group Buyer (5 neighbors, 10kg mango)

**Series 4: Efficiency Hack**
16. The 10-Minute Prep (5 orders in 10 min)
17. The Smart Stocker (order rice 3 days early)
18. The Zero Waste (1 week, no waste)
19. The Shortcut Finder (faster than GPS)
20. The One-Tap Reorder (last week's list)

**Series 5: Skill Master**
21. The New Cuisine (first Thai dish)
22. The Photo Pro (3 professional photos)
23. The Cost Controller (reduce cost ৳10/plate)
24. The Map Master (5 locations without GPS)
25. The Budget Boss (save ৳1000/month)

---

## 🎯 Phase 6: Campus Launch Strategy (Weeks 21-24)
### The Viral Marketing Engine

#### 6.1 Campus Tycoon Tournament
**Concept**: Real-life game on launch day

**3 Competitions**:
1. **Street Food War** (Chefs)
   - 10-15 food stalls
   - No cash allowed, only Rizik QR
   - Highest sales wins

2. **Human Logistics Race** (Movers)
   - Treasure boxes hidden in campus
   - Micro-missions on app
   - Fastest mover wins bike gear

3. **Gig Bazaar** (Service Providers)
   - Profile picture booth (৳10)
   - Mehedi art (৳20)
   - CV review (৳50)
   - Most clients wins

**The QR Queue Strategy**:
- Entry gate has giant QR
- Scan for free welcome drink
- Live leaderboard on big screen
- Flash deals every hour

#### 6.2 Inter-Department Fundraising Challenge
**Concept**: Clubs compete to raise funds

**How It Works**:
```dart
// Debate Club registers as "Partner Squad"
// They earn through:
1. Food sales (Debate Special Khichuri)
2. Delivery tasks (juniors as runners, 20% to fund)
3. Referrals (commission per signup)

// Live Leaderboard:
1. Debate Club: ৳12,500
2. BBA Dept: ৳10,200
3. Law Dept: ৳8,000

// Winner gets ৳10,000 bonus from Rizik
```

**Why This Works**:
- Free user acquisition (clubs do marketing)
- Feature testing (high-volume, real-time)
- Emotional connection (their app, their dreams)

#### 6.3 Monthly Micro-Events
1. **Month-End Feast** (Last Friday)
   - Budget meals (৳50-70)
   - Mass orders = free delivery
   - "Zero Waste Hero" badge

2. **Squad Shera League** (Monthly)
   - Most 5-star orders wins
   - Prize: ৳5000 or 0% commission

3. **Bazar Championship** (Monthly)
   - Who saved most money?
   - Prize: Rizik Credit voucher

4. **Skill Swap Saturday** (Weekly)
   - Flash discounts on services
   - "Community Builder" badge

---

## 🎯 Phase 7: Advanced Features (Weeks 25-28)
### Complete Ecosystem

#### 7.1 Landlord OS
```dart
class LandlordOS {
  final RentLedger rentLedger; // Auto-payment from squad wallet
  final AssetAudit assetAudit; // Monthly photos of flat
  final LiquidationProtocol liquidation; // Breakup handling
}
```

#### 7.2 Social Collateral Engine
```dart
// Enables bank loans using platform data
class SocialCollateralEngine {
  double calculateCollateralValue(TrustScore score, double revenue);
  Future<void> setupRevenueEscrow(double percentage); // 50% to bank
  
  // Rizik becomes guarantor for squad loans
}
```

#### 7.3 Data Monetization
```dart
// Sell anonymized data to:
- Banks (credit vetting)
- CPG companies (consumption patterns)
- Market research firms

// Revenue goes to:
- Digital Collateral Fund
- Local Impact Fund
```

---

## 🎯 Phase 8: Polish & Launch (Weeks 29-32)

### 8.1 Supabase Schema
```sql
-- Core tables
users (id, role, trust_score, aura_level, context)
squads (id, type, members, wallet_balance, duty_roster)
khatas (id, user_id, type, entries, ai_automation)
missions (id, tier, status, assigned_to, chain_id)
services (id, type, provider_id, price, location)
assets (id, type, owner_id, rental_rate, bookings)
quests (id, track, steps, rewards, completion_rate)
badges (id, user_id, badge_type, earned_at)
trust_scores (id, user_id, score, category_breakdown)
opportunities (id, user_id, context, shown_at, accepted)

-- Financial tables
treasury (id, user_id, reference_code, amount, status)
loans (id, borrower_id, amount, voucher_id, trust_required)
floats (id, mover_id, daily_limit, repaid, auto_deduct)
rent_ledger (id, squad_id, landlord_id, payments, audit_photos)
```

### 8.2 Real-time Features
- Live mission tracking
- Squad chat
- Instant notifications
- Live location sharing
- Co-Pilot opportunity detection

### 8.3 Security & Privacy
- Data vault protocol
- Permission marketplace
- Encrypted khatas
- Reference code system

---

## 📊 Implementation Priority

### Must Have (v1.0) - Weeks 1-12
1. ✅ Trust Score System
2. ✅ Rizik Treasury (Manual Banking)
3. ✅ Active Khata OS
4. ✅ Dual OS (Single vs Squad)
5. ✅ Co-Pilot Engine
6. ✅ Hyperlocal Services
7. ✅ Micro-Task System

### Should Have (v2.0) - Weeks 13-20
1. ✅ Rizik Dhaar (Lending)
2. ✅ Mover Float
3. ✅ AI Menu Engineer
4. ✅ Meal Toggle
5. ✅ Rizik Aura
6. ✅ 100+ Quests
7. ✅ Campus Launch Events

### Nice to Have (v3.0) - Weeks 21-32
1. ✅ Landlord OS
2. ✅ Social Collateral
3. ✅ Data Monetization
4. ✅ Advanced Analytics
5. ✅ Investment Platform

---

## 🎨 UI/UX Key Screens

### Home Tab (Lifestyle OS)
```dart
// Dynamic based on user profile
StackedDeck([
  DynamicSubscriptionCard(), // Changes: Mess vs Family
  LiveLedgerCard(), // Auto-calculated costs
  AIPantryCard(), // Auto-deduction
  SquadDashboardCard(), // If in squad
  ActiveQuestsCard(),
]);
```

### Fooddrobe Tab (Discovery)
```dart
Tabs([
  FoodOrdering(),
  C2CMarketplace(),
  HyperlocalServices(),
  AssetRental(),
  MicroTasks(),
]);
```

### Floating Opportunity Pill
```dart
// Appears contextually
if (coPilot.detectsOpportunity()) {
  showFloatingPill(
    "🚶‍♂️ Runner Gig? (300m) ৳30"
  );
}
```

---

## 🚦 Success Metrics

### Economic
- Transaction volume
- Average trust score
- Loan repayment rate
- Squad formation rate
- Asset utilization rate

### Engagement
- Daily active users
- Quest completion rate
- Badge earning rate
- Aura level distribution
- Role switching frequency

### Social Impact
- Hyperlocal transactions
- Micro-task completions
- Squad success rate
- Community fund contributions

---

## 🎯 Next Immediate Steps

1. **Week 1**: Implement Trust Score System
2. **Week 2**: Build Rizik Treasury (Manual Banking)
3. **Week 3**: Create Active Khata OS
4. **Week 4**: Design Dual OS Architecture
5. **Week 5**: Start Co-Pilot Engine
6. **Week 6-8**: Build Hyperlocal Services
7. **Week 9-12**: Implement Gamification
8. **Week 13-16**: Campus Launch Prep
9. **Week 17-20**: Execute Campus Events
10. **Week 21-32**: Scale & Refine

---

## 💡 Key Insights from Designer Conversations

1. **Home ≠ Marketplace**: Separate management from discovery
2. **Context is King**: Co-Pilot detects and suggests, not user searches
3. **Fluent Role Surfing**: Roles find users automatically
4. **Trust First**: Everything built on trust score
5. **Dual OS**: Single and Squad operate differently
6. **Gamification**: 100+ quests keep users engaged
7. **Campus Strategy**: Clubs become marketing engine
8. **Manual Banking**: Zero-cost treasury for V1
9. **Auto-Cost Engine**: AI calculates food costs automatically
10. **Floating Pills**: Contextual opportunities appear magically

---

**This roadmap transforms Rizik from a food delivery app into a complete economic operating system that becomes part of users' daily lives through context-aware intelligence and fluent role surfing.**

🚀 Ready to build the future!
