# Bill Splitting System - Implementation Roadmap

## Vision
Transform Social Ledger from simple 1-on-1 tracking to a powerful group expense management system that Bangladeshi users love.

## Phase 1: Foundation (Week 1-2) ⭐ START HERE

### 1.1 Data Models
```dart
// lib/models/expense_group.dart
class ExpenseGroup {
  final String id;
  final String name;              // "Roommates", "Cox's Bazar Trip"
  final String? description;
  final List<GroupMember> members;
  final DateTime createdAt;
  final String createdBy;
  final GroupType type;
  
  ExpenseGroup({...});
  
  // Serialization
  Map<String, dynamic> toJson();
  factory ExpenseGroup.fromJson(Map<String, dynamic> json);
}

class GroupMember {
  final String id;
  final String name;
  final String? avatar;
  final DateTime joinedAt;
  
  GroupMember({...});
}

enum GroupType {
  roommates('roommates', '🏠 রুমমেট'),
  trip('trip', '✈️ ট্রিপ'),
  friends('friends', '👥 বন্ধুরা'),
  office('office', '💼 অফিস'),
  event('event', '🎉 ইভেন্ট'),
  other('other', '📝 অন্যান্য');
  
  const GroupType(this.key, this.nameBn);
  final String key;
  final String nameBn;
}
```

### 1.2 Group Expense Model
```dart
// lib/models/group_expense.dart
class GroupExpense {
  final String id;
  final String groupId;
  final String description;
  final double totalAmount;
  final String paidBy;            // Member ID who paid
  final String paidByName;
  final DateTime date;
  final ExpenseCategory category;
  final SplitType splitType;
  final Map<String, double> splits; // memberId → amount owed
  final String? notes;
  final String? receipt;
  
  GroupExpense({...});
  
  // Helper methods
  double getShareFor(String memberId);
  bool isSettled(String memberId);
}

enum SplitType {
  equal('equal', 'সমান ভাগ'),
  unequal('unequal', 'আলাদা পরিমাণ'),
  percentage('percentage', 'শতাংশ'),
  shares('shares', 'শেয়ার'),
  itemized('itemized', 'আইটেম অনুযায়ী');
  
  const SplitType(this.key, this.nameBn);
  final String key;
  final String nameBn;
}

enum ExpenseCategory {
  food('food', '🍽️ খাবার'),
  rent('rent', '🏠 ভাড়া'),
  utilities('utilities', '⚡ ইউটিলিটি'),
  transport('transport', '🚗 যাতায়াত'),
  entertainment('entertainment', '🎉 বিনোদন'),
  groceries('groceries', '🛒 বাজার'),
  other('other', '📝 অন্যান্য');
  
  const ExpenseCategory(this.key, this.nameBn);
  final String key;
  final String nameBn;
}
```

### 1.3 Provider Setup
```dart
// lib/providers/expense_group_provider.dart
class ExpenseGroupProvider with ChangeNotifier {
  List<ExpenseGroup> _groups = [];
  List<GroupExpense> _expenses = [];
  
  // CRUD for groups
  Future<ExpenseGroup> createGroup({
    required String name,
    required List<GroupMember> members,
    required GroupType type,
    String? description,
  });
  
  Future<void> addMember(String groupId, GroupMember member);
  Future<void> removeMember(String groupId, String memberId);
  
  // CRUD for expenses
  Future<GroupExpense> addExpense({
    required String groupId,
    required String description,
    required double totalAmount,
    required String paidBy,
    required SplitType splitType,
    required Map<String, double> splits,
    ExpenseCategory? category,
  });
  
  Future<void> deleteExpense(String expenseId);
  
  // Calculations
  Map<String, double> getGroupBalances(String groupId);
  List<Settlement> getSettlementSuggestions(String groupId);
  double getTotalExpenses(String groupId);
  
  // Queries
  List<GroupExpense> getGroupExpenses(String groupId);
  List<ExpenseGroup> getUserGroups(String userId);
}
```

### 1.4 UI Screens

#### Screen 1: Group List
```dart
// lib/screens/expense_groups_screen.dart
class ExpenseGroupsScreen extends StatelessWidget {
  // Shows all groups user is part of
  // Card per group with:
  // - Group name & icon
  // - Member count
  // - Your balance (owed/owing)
  // - Recent activity
  
  // FAB: Create new group
}
```

#### Screen 2: Create Group
```dart
// lib/screens/create_group_screen.dart
class CreateGroupScreen extends StatefulWidget {
  // Step 1: Group name & type
  // Step 2: Add members (name input)
  // Step 3: Confirm & create
}
```

#### Screen 3: Group Dashboard
```dart
// lib/screens/group_dashboard_screen.dart
class GroupDashboardScreen extends StatefulWidget {
  final ExpenseGroup group;
  
  // Shows:
  // - Group header (name, members)
  // - Balance summary (who owes whom)
  // - Expense list
  // - Settle up button
  // - Add expense FAB
}
```

#### Screen 4: Add Group Expense
```dart
// lib/screens/add_group_expense_screen.dart
class AddGroupExpenseScreen extends StatefulWidget {
  final ExpenseGroup group;
  
  // Step 1: Description & amount
  // Step 2: Who paid?
  // Step 3: Split type selection
  // Step 4: Split configuration (based on type)
  // Step 5: Review & confirm
}
```

## Phase 2: Enhanced Splitting (Week 3-4)

### 2.1 Equal Split (Already works)
```
Total: ৳2,400
Members: 4
Each pays: ৳600
```

### 2.2 Unequal Split
```dart
// UI: Slider or input for each person
Ahmed:   ৳800
Karim:   ৳600
Fatima:  ৳500
Sadia:   ৳500
Total:   ৳2,400 ✓
```

### 2.3 Percentage Split
```dart
// UI: Percentage input
Ahmed:   40% = ৳960
Karim:   30% = ৳720
Fatima:  20% = ৳480
Sadia:   10% = ৳240
Total:   100% = ৳2,400 ✓
```

### 2.4 Share-based Split
```dart
// UI: Share count (1x, 2x, 3x)
Ahmed:   2 shares = ৳800
Karim:   2 shares = ৳800
Fatima:  1 share  = ৳400
Sadia:   1 share  = ৳400
Total:   6 shares = ৳2,400 ✓
```

### 2.5 Itemized Split
```dart
// UI: Add items, select who shares each
Items:
- Biryani ৳400 (Ahmed, Karim)
- Kacchi ৳450 (Karim only)
- Thai ৳550 (Fatima, Sadia)
- Pizza ৳500 (Ahmed, Fatima, Sadia)

Shared Costs:
- Delivery ৳250 (all 4)
- Tip ৳250 (all 4)

Calculation:
Ahmed:   ৳200 + ৳167 + ৳62.50 + ৳62.50 = ৳492
Karim:   ৳200 + ৳450 + ৳62.50 + ৳62.50 = ৳775
Fatima:  ৳275 + ৳167 + ৳62.50 + ৳62.50 = ৳567
Sadia:   ৳275 + ৳167 + ৳62.50 + ৳62.50 = ৳567
Total: ৳2,400 ✓
```

## Phase 3: Smart Features (Week 5-6)

### 3.1 Debt Simplification
```dart
// lib/services/debt_simplifier.dart
class DebtSimplifier {
  static List<Settlement> simplify(Map<String, double> balances) {
    // Algorithm: Minimize number of transactions
    // Input: Net balances (+ = owed to them, - = they owe)
    // Output: Optimal payment list
  }
}

// Example:
Before:
- Ahmed owes Karim ৳500
- Karim owes Fatima ৳500
- Fatima owes Ahmed ৳500

After:
- No transactions needed! (circular)
```

### 3.2 Settlement Flow
```dart
// lib/screens/settle_up_screen.dart
class SettleUpScreen extends StatelessWidget {
  final ExpenseGroup group;
  
  // Shows:
  // - Simplified settlements
  // - "Karim pays Ahmed ৳500"
  // - Mark as paid button
  // - Payment method options
}
```

### 3.3 Expense Analytics
```dart
// lib/screens/group_analytics_screen.dart
class GroupAnalyticsScreen extends StatelessWidget {
  // Charts:
  // - Spending by category (pie chart)
  // - Spending by person (bar chart)
  // - Timeline (line chart)
  // - Total stats
}
```

## Phase 4: Advanced Features (Week 7-8)

### 4.1 Recurring Expenses
```dart
class RecurringExpense {
  final String groupId;
  final String description;
  final double amount;
  final RecurrencePattern pattern;
  final SplitType splitType;
  final DateTime startDate;
  final DateTime? endDate;
}

enum RecurrencePattern {
  daily, weekly, monthly, yearly
}

// Auto-create expenses on schedule
```

### 4.2 Payment Reminders
```dart
// Gentle notifications:
// "Karim, you owe Ahmed ৳500 from Restaurant bill"
// "Reminder: Settle up with your Roommates group"
```

### 4.3 Export & Reports
```dart
// Export to:
// - PDF report
// - Excel spreadsheet
// - Share via WhatsApp
```

### 4.4 Receipt Scanning (Future)
```dart
// OCR to extract:
// - Total amount
// - Items
// - Date
// - Merchant
```

## Integration with Existing Features

### 1. Rizik Order Integration
```dart
// When order is completed:
// "Split this order with friends?"
// → Creates group expense automatically
// → Pre-fills items from order
```

### 2. Squad Integration
```dart
// Maker Squad: Split ingredient costs
// Mover Squad: Split fuel expenses
// Use existing squad members as group
```

### 3. Trust Score Integration
```dart
// Track payment reliability
// "Ahmed always pays on time" → +trust
// "Karim often delays" → -trust
```

## UI/UX Guidelines

### Design Principles
1. **Bengali First** - All primary text in Bengali
2. **Visual Clarity** - Color-coded balances (green/red)
3. **Quick Actions** - Minimal taps to split
4. **Smart Defaults** - Equal split as default
5. **Transparency** - Always show calculations

### Color Coding
- 🟢 Green: Money owed to you
- 🔴 Red: Money you owe
- ⚪ Gray: Settled/balanced
- 🔵 Blue: Neutral info

### Icons
- 🏠 Roommates
- ✈️ Trip
- 👥 Friends
- 💼 Office
- 🎉 Event
- 🍽️ Food
- 🚗 Transport

## Testing Strategy

### Unit Tests
- Split calculations
- Balance calculations
- Debt simplification
- Edge cases (0 amounts, negative, etc.)

### Integration Tests
- Create group flow
- Add expense flow
- Settlement flow
- Data persistence

### User Testing
- 5 users test group creation
- 5 users test expense splitting
- Collect feedback on UX
- Iterate based on findings

## Success Metrics

### Engagement
- Groups created per user
- Expenses added per group
- Daily active users
- Retention rate

### Satisfaction
- NPS score
- App store ratings
- User feedback
- Feature requests

### Business
- Increased session time
- Reduced churn
- Cross-feature usage
- Viral coefficient (invites)

## Launch Strategy

### Soft Launch (Week 9)
1. Beta test with 50 users
2. Collect feedback
3. Fix critical bugs
4. Iterate on UX

### Public Launch (Week 10)
1. Announce in app
2. Social media campaign
3. Tutorial videos
4. Press release

### Post-Launch (Week 11+)
1. Monitor metrics
2. User support
3. Feature improvements
4. Marketing push

## Conclusion

This roadmap transforms Social Ledger from a basic IOU tracker into a comprehensive group expense management system that rivals Splitwise while being perfectly tailored for Bangladeshi users.

**Key Differentiators:**
- 🇧🇩 Bengali-first UX
- 🍽️ Food order integration
- 👥 Squad integration
- 💚 Trust score integration
- 🎯 Hyperlocal context

**Timeline:** 10 weeks to full launch
**Effort:** 2 developers full-time
**Impact:** High - This could be a killer feature!

Let's build it! 🚀
