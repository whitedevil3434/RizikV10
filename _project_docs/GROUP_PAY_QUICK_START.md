# Group Pay / Bill Splitting - Quick Start Guide

## 🚀 How to Access

### From Social Ledger
1. Open Rizik app
2. Navigate to Social Ledger
3. Tap the **blue "গ্রুপ খরচ"** button (floating action button)
4. You'll see the Group List screen

### Direct Navigation
```dart
Navigator.pushNamed(context, '/group-expenses');
```

## 📱 User Journey

### 1. Create Your First Group (30 seconds)
```
Tap "+ নতুন গ্রুপ"
  ↓
Select type: 🏠 Roommates
  ↓
Enter name: "Flat 4B Roommates"
  ↓
Add members: Ahmed, Karim, Fatima
  ↓
Tap "গ্রুপ তৈরি করুন"
  ↓
🎉 Group created! +100 XP
```

### 2. Add Your First Expense (45 seconds)
```
Open group dashboard
  ↓
Tap "+ খরচ যোগ করুন"
  ↓
Enter: "Electricity Bill" ৳2,500
  ↓
Category: ⚡ Utilities
  ↓
Paid by: Ahmed
  ↓
Split: সমান ভাগ (Equal)
  ↓
Review: Each pays ৳833
  ↓
Tap "খরচ যোগ করুন"
  ↓
✅ Expense added! +50 XP
```

### 3. Settle Up (20 seconds)
```
Group dashboard → "নিষ্পত্তি করুন"
  ↓
See smart suggestions:
  Karim pays Ahmed ৳833
  Fatima pays Ahmed ৳833
  ↓
Tap "পরিশোধিত হিসেবে চিহ্নিত করুন"
  ↓
Confirm
  ↓
✅ Settled! +100 XP
```

## 🎯 Common Use Cases

### Restaurant Bill (Equal Split)
```
1. Quick split: ৳2,400 ÷ 4 people = ৳600 each
2. Select who paid
3. Done!
```

### Restaurant Bill (Itemized)
```
1. Add items:
   - Biryani ৳350 (Ahmed)
   - Kacchi ৳450 (Karim)
   - Thai ৳550 (Fatima)
2. Add shared costs:
   - Delivery ৳250 (split 3 ways)
   - Tip ৳300 (split 3 ways)
3. Auto-calculates each person's share
```

### Monthly Rent
```
1. Create "Roommates" group
2. Add expense: "November Rent" ৳15,000
3. Equal split: ৳5,000 each
4. Settle at month end
```

### Trip Expenses
```
1. Create "Cox's Bazar Trip" group
2. Add expenses as they happen:
   - Transport (Ahmed paid)
   - Hotel (Karim paid)
   - Food (various people paid)
3. At trip end, settle up
4. Smart algorithm minimizes transactions
```

## 🎮 XP & Rewards

| Action | XP Reward |
|--------|-----------|
| Create group | +100 XP |
| Add expense | +50 XP |
| Settle debt | +100 XP |
| On-time settlement | +150 XP |
| Complete group settlement | +200 XP |

## 🔧 Developer Quick Reference

### Get Provider
```dart
final provider = Provider.of<GroupExpenseProvider>(context);
```

### Create Group
```dart
final group = await provider.createGroup(
  name: 'Roommates',
  type: GroupType.roommates,
  members: [
    GroupMember(
      userId: 'user_1',
      name: 'Ahmed',
      joinedAt: DateTime.now(),
      isAdmin: true,
    ),
    GroupMember(
      userId: 'user_2',
      name: 'Karim',
      joinedAt: DateTime.now(),
    ),
  ],
  createdBy: 'user_1',
);
```

### Add Expense (Equal Split)
```dart
await provider.addExpense(
  groupId: group.id,
  description: 'Electricity Bill',
  amount: 2500,
  paidBy: 'user_1',
  paidByName: 'Ahmed',
  category: ExpenseCategory.utilities,
  splitType: SplitType.equal,
);
```

### Add Expense (Itemized)
```dart
await provider.addExpense(
  groupId: group.id,
  description: 'Restaurant Bill',
  amount: 2750,
  paidBy: 'user_1',
  paidByName: 'Ahmed',
  category: ExpenseCategory.food,
  splitType: SplitType.itemized,
  items: [
    ExpenseItem(
      name: 'Biryani',
      price: 350,
      sharedBy: ['user_1'],
    ),
    ExpenseItem(
      name: 'Kacchi',
      price: 450,
      sharedBy: ['user_2'],
    ),
  ],
);
```

### Get Balances
```dart
final balances = provider.getGroupBalances(group.id);
// Returns: {'user_1': 1666.67, 'user_2': -833.33, 'user_3': -833.33}
// Positive = owed to them, Negative = they owe
```

### Simplify Debts
```dart
final settlements = provider.simplifyDebts(group.id);
// Returns optimized list of who should pay whom
```

### Record Settlement
```dart
await provider.recordSettlement(
  groupId: group.id,
  from: 'user_2',
  to: 'user_1',
  amount: 833.33,
);
```

## 🎨 UI Components

### Group Card
Shows on Group List screen:
- Group name & type emoji
- Member count
- Your balance (red/green)
- Last activity

### Expense Card
Shows on Group Dashboard:
- Category emoji
- Description
- Amount
- Who paid
- Split breakdown

### Settlement Card
Shows on Settlement screen:
- From person → To person
- Amount
- Action button

## 🔍 Troubleshooting

### "Splits do not sum to total amount"
- Check that custom splits add up to the total
- For percentage: must sum to 100%
- For itemized: items + shared costs = total

### "Group not found"
- Ensure group ID is correct
- Check if group is archived

### Balance not updating
- Refresh the screen
- Check if expense was added successfully
- Verify split calculations

## 📊 Data Storage

All data is stored locally using SharedPreferences:
- `expense_groups` - List of groups
- `group_expenses` - List of expenses
- `settlements` - List of settlements

## 🔗 Integration Points

### Social Ledger
- Each group expense creates person-to-person transactions
- Syncs automatically when expense is added
- Updates Social Ledger balances

### Khata OS
- Group expenses logged to personal Khata
- Category mapping maintained
- Monthly reports include group spending

### Aura System
- XP awarded for all actions
- Contributes to level progression
- Unlocks advanced features

### Trust Score
- Timely settlements improve trust
- Late payments decrease trust
- Consistent behavior tracked

## 🎯 Best Practices

### For Users
1. Create groups for recurring expenses (roommates, office)
2. Add expenses immediately (don't forget!)
3. Settle up regularly (monthly or after events)
4. Use itemized split for fairness
5. Add notes for clarity

### For Developers
1. Always validate splits before saving
2. Handle edge cases (0 amounts, single member)
3. Test with real-world scenarios
4. Provide clear error messages
5. Sync to Social Ledger after expense

## 🚦 Status Indicators

### Balance Colors
- 🟢 Green: Money owed to you
- 🔴 Red: Money you owe
- ⚪ Gray: All settled

### Expense Status
- Active: Ongoing debt
- Settled: Fully paid
- Partial: Partially paid
- Cancelled: Cancelled expense

## 📱 Screenshots Locations

(To be added after UI testing)
- Group List Screen
- Create Group Screen
- Group Dashboard
- Add Expense Screen
- Settlement Screen

## 🎓 Learning Path

1. **Beginner**: Create group → Add equal split expense → Settle
2. **Intermediate**: Use itemized split → Multiple expenses → Smart settlement
3. **Advanced**: Recurring expenses → Analytics → Budget tracking

## 🔮 Coming Soon

- Recurring expenses (auto-create monthly)
- Payment integration (bKash, Nagad)
- Receipt scanning (OCR)
- Group analytics
- Export to PDF
- WhatsApp sharing

---

**Need Help?**
- Check `GROUP_PAY_COMPLETE_DESIGN.md` for detailed design
- Check `GROUP_PAY_IMPLEMENTATION_COMPLETE.md` for implementation details
- Review code comments for inline documentation

**Ready to Split Bills?** 🎉
Open Social Ledger → Tap "গ্রুপ খরচ" → Start splitting!
