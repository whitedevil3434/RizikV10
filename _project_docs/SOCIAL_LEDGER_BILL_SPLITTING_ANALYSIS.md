# Social Ledger: Bill Splitting System - Deep Analysis

## Current State Analysis

### What We Have Now (Basic Split)
```dart
recordSplit({
  personId: 'person_123',
  personName: 'Ahmed',
  totalAmount: 1000,  // Total bill
  yourShare: 500,     // Your portion
  description: 'Restaurant bill',
});
```

**Limitations:**
- ❌ Only 1-on-1 splits (2 people)
- ❌ Assumes 50-50 split
- ❌ No custom split ratios
- ❌ No group splits (3+ people)
- ❌ No itemized splitting
- ❌ No tax/tip handling

## Industry Research: Best Bill Splitting Apps

### 1. **Splitwise** (Market Leader)
**Key Features:**
- ✅ Group expenses with multiple people
- ✅ Unequal splits (by percentage, exact amount, or shares)
- ✅ Itemized bills (who ordered what)
- ✅ Recurring expenses (rent, utilities)
- ✅ Simplify debts (A owes B, B owes C → A owes C)
- ✅ Multiple currencies
- ✅ Expense categories
- ✅ Settlement suggestions

**UX Pattern:**
```
1. Create Group → "Roommates", "Trip to Cox's Bazar"
2. Add Expense → Who paid? How much?
3. Split Method:
   - Equal split
   - Unequal (custom amounts)
   - By percentage
   - By shares
   - Select specific people
4. Settle up → Who pays whom
```

### 2. **Settle Up**
**Key Features:**
- ✅ Smart debt simplification
- ✅ Multiple currencies with auto-conversion
- ✅ Offline mode
- ✅ Export to Excel
- ✅ Payment reminders

### 3. **Tricount**
**Key Features:**
- ✅ Travel-focused
- ✅ Multiple payers per expense
- ✅ Balance optimization
- ✅ PDF reports

### 4. **Google Pay** (Send & Request)
**Key Features:**
- ✅ Direct payment integration
- ✅ Request money with note
- ✅ Split a bill (equal only)
- ✅ Payment history

## Real-World Use Cases (Bangladesh Context)

### 1. **Restaurant Bills** 🍽️
**Scenario:** 4 friends at a restaurant, bill = ৳2,400
```
Options needed:
- Equal split: ৳600 each
- Unequal: Ahmed ৳800, others ৳533 each
- Itemized: Ahmed ordered ৳800 worth, Karim ৳600, etc.
- One person paid, others owe them
```

### 2. **Roommate Expenses** 🏠
**Scenario:** 3 roommates sharing apartment
```
Monthly expenses:
- Rent: ৳15,000 (equal split)
- Electricity: ৳2,500 (by usage/room size)
- Internet: ৳1,000 (equal split)
- Groceries: ৳5,000 (who bought what)
- Maid: ৳3,000 (equal split)

Need: Recurring expenses, monthly settlement
```

### 3. **Trip/Picnic** 🚗
**Scenario:** 6 friends going to Cox's Bazar
```
Expenses:
- Transport: ৳6,000 (Ahmed paid)
- Hotel: ৳12,000 (Karim paid)
- Food Day 1: ৳3,000 (Fatima paid)
- Food Day 2: ৳2,500 (Ahmed paid)
- Activities: ৳4,500 (Shared)

Need: Trip groups, multiple payers, final settlement
```

### 4. **Office Lunch Orders** 🍱
**Scenario:** 5 colleagues ordering from Rizik
```
Order total: ৳2,750
- Ahmed: Biryani ৳350 + Drink ৳50 = ৳400
- Karim: Kacchi ৳450
- Fatima: Thai ৳550
- Sadia: Burger ৳300
- Rahim: Pizza ৳500
+ Delivery: ৳250 (split equally = ৳50 each)
+ Tip: ৳300 (split equally = ৳60 each)

Need: Itemized split, shared costs (delivery/tip)
```

### 5. **Wedding/Event Contributions** 💒
**Scenario:** Friends pooling money for gift
```
Target: ৳10,000 gift
- 10 friends contributing
- Some pay more, some less
- Track who paid, who hasn't

Need: Goal-based collection, contribution tracking
```

## Proposed Enhanced System

### Phase 1: Group Bill Splitting (MVP)

#### New Data Models

```dart
// Group for managing shared expenses
class ExpenseGroup {
  final String id;
  final String name;
  final String description;
  final List<String> memberIds;
  final List<String> memberNames;
  final DateTime createdAt;
  final String createdBy;
  final String? imageUrl;
  final GroupType type; // roommates, trip, event, friends
  
  // Calculated fields
  double get totalExpenses;
  Map<String, double> get memberBalances;
}

enum GroupType {
  roommates,    // Recurring expenses
  trip,         // One-time event
  event,        // Party, wedding, etc.
  friends,      // General group
  office,       // Work colleagues
}

// Enhanced expense with group support
class GroupExpense {
  final String id;
  final String groupId;
  final String description;
  final double totalAmount;
  final String paidBy; // Who paid the bill
  final DateTime date;
  final ExpenseCategory category;
  
  // Split configuration
  final SplitType splitType;
  final Map<String, double> splits; // personId → amount
  
  // Optional
  final List<ExpenseItem>? items; // For itemized bills
  final String? receipt;
  final String? notes;
}

enum SplitType {
  equal,        // Divide equally
  unequal,      // Custom amounts
  percentage,   // By percentage
  shares,       // By shares (1x, 2x, etc.)
  itemized,     // Who ordered what
}

// For itemized bills
class ExpenseItem {
  final String name;
  final double price;
  final List<String> sharedBy; // Who shares this item
}
```

#### Split Calculation Logic

```dart
class BillSplitter {
  /// Equal split among all members
  static Map<String, double> splitEqually({
    required double total,
    required List<String> members,
  }) {
    final perPerson = total / members.length;
    return {for (var m in members) m: perPerson};
  }
  
  /// Custom amounts (must sum to total)
  static Map<String, double> splitByAmounts({
    required Map<String, double> amounts,
  }) {
    return amounts;
  }
  
  /// By percentage
  static Map<String, double> splitByPercentage({
    required double total,
    required Map<String, double> percentages, // Must sum to 100
  }) {
    return percentages.map((id, pct) => MapEntry(id, total * pct / 100));
  }
  
  /// By shares (e.g., A: 2 shares, B: 1 share)
  static Map<String, double> splitByShares({
    required double total,
    required Map<String, int> shares,
  }) {
    final totalShares = shares.values.reduce((a, b) => a + b);
    final perShare = total / totalShares;
    return shares.map((id, s) => MapEntry(id, perShare * s));
  }
  
  /// Itemized split
  static Map<String, double> splitItemized({
    required List<ExpenseItem> items,
    required double sharedCosts, // Delivery, tip, etc.
    required List<String> allMembers,
  }) {
    final balances = <String, double>{};
    
    // Split individual items
    for (final item in items) {
      final perPerson = item.price / item.sharedBy.length;
      for (final person in item.sharedBy) {
        balances[person] = (balances[person] ?? 0) + perPerson;
      }
    }
    
    // Add shared costs equally
    final sharedPerPerson = sharedCosts / allMembers.length;
    for (final person in allMembers) {
      balances[person] = (balances[person] ?? 0) + sharedPerPerson;
    }
    
    return balances;
  }
  
  /// Simplify debts (optimize who pays whom)
  static List<Settlement> simplifyDebts(Map<String, double> balances) {
    // Positive = owed to them, Negative = they owe
    final creditors = <String, double>{};
    final debtors = <String, double>{};
    
    balances.forEach((person, balance) {
      if (balance > 0) {
        creditors[person] = balance;
      } else if (balance < 0) {
        debtors[person] = -balance;
      }
    });
    
    final settlements = <Settlement>[];
    
    // Greedy algorithm: match largest creditor with largest debtor
    while (creditors.isNotEmpty && debtors.isNotEmpty) {
      final maxCreditor = creditors.entries.reduce((a, b) => 
        a.value > b.value ? a : b);
      final maxDebtor = debtors.entries.reduce((a, b) => 
        a.value > b.value ? a : b);
      
      final amount = min(maxCreditor.value, maxDebtor.value);
      
      settlements.add(Settlement(
        from: maxDebtor.key,
        to: maxCreditor.key,
        amount: amount,
      ));
      
      creditors[maxCreditor.key] = maxCreditor.value - amount;
      debtors[maxDebtor.key] = maxDebtor.value - amount;
      
      if (creditors[maxCreditor.key]! < 0.01) creditors.remove(maxCreditor.key);
      if (debtors[maxDebtor.key]! < 0.01) debtors.remove(maxDebtor.key);
    }
    
    return settlements;
  }
}

class Settlement {
  final String from;
  final String to;
  final double amount;
  
  Settlement({required this.from, required this.to, required this.amount});
}
```

### Phase 2: Advanced Features

#### 1. **Smart Debt Simplification**
```
Before:
- Ahmed owes Karim ৳500
- Karim owes Fatima ৳500
- Fatima owes Ahmed ৳500

After Simplification:
- No transactions needed! (circular debt)
```

#### 2. **Recurring Expenses**
```dart
class RecurringExpense {
  final String groupId;
  final String description;
  final double amount;
  final RecurrencePattern pattern; // monthly, weekly, etc.
  final SplitType splitType;
  final DateTime startDate;
  final DateTime? endDate;
  
  // Auto-create expenses
  void generateExpenses();
}
```

#### 3. **Payment Integration**
```dart
// Direct payment through app
class PaymentRequest {
  final String from;
  final String to;
  final double amount;
  final String description;
  final PaymentMethod method; // bKash, Nagad, Bank
  
  Future<void> sendPayment();
  Future<void> requestPayment();
}
```

#### 4. **Expense Categories & Analytics**
```
Categories:
- 🍽️ Food & Dining
- 🏠 Rent & Utilities
- 🚗 Transportation
- 🎉 Entertainment
- 🛒 Groceries
- 💊 Healthcare
- 📱 Bills
- ✈️ Travel
- 🎁 Gifts
- 📚 Education
- 👕 Shopping
- 🔧 Maintenance
- 💰 Other

Analytics:
- Spending by category
- Spending by person
- Monthly trends
- Group statistics
```

## Recommended UX Flow

### Creating a Group Split

```
Step 1: Choose Split Type
┌─────────────────────────────┐
│  কিভাবে ভাগ করবেন?          │
│                             │
│  [সমান ভাগ]                 │
│  Equal Split                │
│                             │
│  [আলাদা পরিমাণ]             │
│  Custom Amounts             │
│                             │
│  [আইটেম অনুযায়ী]           │
│  By Items                   │
│                             │
│  [শেয়ার অনুযায়ী]           │
│  By Shares                  │
└─────────────────────────────┘

Step 2: Add People
┌─────────────────────────────┐
│  কারা ভাগ করবে?             │
│                             │
│  ☑ Ahmed                    │
│  ☑ Karim                    │
│  ☑ Fatima                   │
│  ☐ Sadia                    │
│                             │
│  [+ নতুন যোগ করুন]          │
└─────────────────────────────┘

Step 3: Enter Amount
┌─────────────────────────────┐
│  মোট বিল                    │
│  ৳ 2400                     │
│                             │
│  কে পেমেন্ট করেছে?          │
│  [Ahmed ▼]                  │
└─────────────────────────────┘

Step 4: Review Split
┌─────────────────────────────┐
│  প্রতিজনের অংশ              │
│                             │
│  Ahmed    ৳600              │
│  Karim    ৳600              │
│  Fatima   ৳600              │
│  Sadia    ৳600              │
│                             │
│  Ahmed পেমেন্ট করেছে        │
│  বাকিরা Ahmed কে দেবে       │
│                             │
│  [নিশ্চিত করুন]             │
└─────────────────────────────┘
```

### Group Dashboard

```
┌─────────────────────────────┐
│  🏠 Roommates Group          │
│  3 members • 12 expenses    │
├─────────────────────────────┤
│  Overall Balance            │
│                             │
│  Ahmed    +৳2,500 (owed)    │
│  Karim    -৳1,200 (owes)    │
│  Fatima   -৳1,300 (owes)    │
│                             │
│  [Settle Up]                │
├─────────────────────────────┤
│  Recent Expenses            │
│                             │
│  🍽️ Restaurant              │
│  ৳2,400 • Ahmed paid        │
│  3 days ago                 │
│                             │
│  ⚡ Electricity Bill         │
│  ৳2,500 • Karim paid        │
│  1 week ago                 │
│                             │
│  [+ Add Expense]            │
└─────────────────────────────┘
```

## Implementation Priority

### Phase 1 (MVP) - 2 weeks
1. ✅ Group creation
2. ✅ Add members
3. ✅ Equal split expenses
4. ✅ Track who paid
5. ✅ Calculate balances
6. ✅ Simple settlement

### Phase 2 - 3 weeks
1. ✅ Unequal splits (custom amounts)
2. ✅ Itemized bills
3. ✅ Expense categories
4. ✅ Group dashboard
5. ✅ Settlement suggestions

### Phase 3 - 4 weeks
1. ✅ Debt simplification
2. ✅ Recurring expenses
3. ✅ Payment reminders
4. ✅ Export reports
5. ✅ Analytics

### Phase 4 - Future
1. ✅ Payment integration (bKash, Nagad)
2. ✅ Receipt scanning (OCR)
3. ✅ Multi-currency
4. ✅ Offline mode
5. ✅ Web dashboard

## Competitive Advantages for Rizik

### 1. **Food-First Integration**
- Split Rizik orders automatically
- Restaurant bill templates
- Food category insights

### 2. **Squad Integration**
- Maker Squads can split income
- Mover Squads can split fuel costs
- Built-in trust scores

### 3. **Bengali-First UX**
- All labels in Bengali
- Local payment methods
- Bangladesh-specific categories

### 4. **Hyperlocal Context**
- Common BD expenses (CNG, rickshaw)
- Local restaurant chains
- Eid/festival expense tracking

## Key Insights from Research

### What Users Want:
1. **Simplicity** - Quick splits without complexity
2. **Flexibility** - Multiple split methods
3. **Transparency** - Clear who owes what
4. **Reminders** - Gentle nudges to settle
5. **History** - Track past expenses
6. **Fairness** - Accurate calculations

### What to Avoid:
1. ❌ Too many steps to split
2. ❌ Confusing UI
3. ❌ Forced equal splits
4. ❌ No edit/delete options
5. ❌ Aggressive reminders
6. ❌ Hidden fees

## Conclusion

The current basic split system is a good start, but to compete with Splitwise and make it truly useful for Bangladeshi users, we need:

1. **Group support** - Essential for real-world use
2. **Multiple split methods** - Equal, unequal, itemized
3. **Smart settlements** - Optimize who pays whom
4. **Food integration** - Leverage Rizik's core strength
5. **Bengali UX** - Make it feel local and familiar

**Next Steps:**
1. Implement Group model and provider
2. Create group creation flow
3. Add expense with split options
4. Build group dashboard
5. Test with real users

This will make Social Ledger a killer feature that keeps users engaged and coming back to Rizik!
