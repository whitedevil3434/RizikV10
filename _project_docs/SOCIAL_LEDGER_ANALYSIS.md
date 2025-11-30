# Social Ledger System - Deep Analysis

## What is Social Ledger?

**Social Ledger** is a peer-to-peer money tracking system that helps users manage:
- 💸 **Money you OWE** to others (debts)
- 💰 **Money OWED to you** by others (receivables)
- 🤝 **Social transactions** between friends, family, roommates

## Current Status

### ✅ What Exists:
1. **SocialLedgerCardData** - Masonry grid card showing:
   - `amountDue` - Money you owe
   - `dueTo` - Person you owe to
   - `amountOwed` - Money owed to you
   - `owedFrom` - Person who owes you
   - `hasAlert` - Alert flag

2. **Navigation** - Currently goes to `KhataOSMerged(initialTabIndex: 0)` (Ledger tab)

### ❌ What's Missing:
1. **Social Ledger Screen** - Dedicated screen for managing IOUs
2. **Social Ledger Model** - Data structure for tracking debts
3. **Social Ledger Provider** - State management
4. **Transaction History** - Record of borrowing/lending
5. **Repayment Flow** - Mark debts as paid
6. **Reminders** - Notify about pending payments

## Problem

Currently, tapping Social Ledger card opens the general Khata OS Ledger tab, which is for **personal expense tracking**, NOT for **social debt tracking**. These are different:

| Khata OS Ledger | Social Ledger |
|----------------|---------------|
| Personal expenses | Money between people |
| Income/Expense tracking | Debt/Credit tracking |
| Categories (food, rent, etc.) | Person-to-person IOUs |
| Solo accounting | Social accounting |

## Solution

Create a dedicated **Social Ledger Screen** that shows:

### 1. Overview Section
- Total amount you owe (red)
- Total amount owed to you (green)
- Net balance

### 2. People You Owe (Debts)
```
👤 Ahmed Rahman
   ৳500 - Lunch money
   Due: 3 days ago
   [Remind] [Mark as Paid]
```

### 3. People Who Owe You (Receivables)
```
👤 Fatima Khan
   ৳300 - Shared taxi
   Due: Tomorrow
   [Remind] [Mark as Received]
```

### 4. Transaction History
- All past borrowing/lending
- Settled transactions
- Filters by person/date

## Data Model

```dart
class SocialLedgerEntry {
  final String id;
  final String userId; // Current user
  final String otherPersonId;
  final String otherPersonName;
  final double amount;
  final bool isDebt; // true = you owe, false = they owe you
  final String description;
  final DateTime createdAt;
  final DateTime? dueDate;
  final bool isPaid;
  final DateTime? paidAt;
}
```

## Implementation Plan

### Phase 1: Basic Screen (Quick Win)
1. Create `SocialLedgerScreen` with sample data
2. Show debts and receivables in lists
3. Calculate totals
4. Update navigation to open this screen

### Phase 2: Full Functionality
1. Create `SocialLedgerProvider`
2. Add/Edit/Delete entries
3. Mark as paid functionality
4. Transaction history
5. Reminders/Notifications

## Quick Implementation (Now)

For immediate fix, create a simple Social Ledger screen that:
- Shows the concept clearly
- Uses sample data
- Has proper UI/UX
- Can be enhanced later with real data

This is better than navigating to the wrong screen (Khata OS Ledger).

## Key Insight

**Social Ledger is about RELATIONSHIPS and TRUST**, not just numbers. It's:
- Who borrowed from you
- Who you borrowed from
- Keeping friendships healthy by tracking money clearly
- Avoiding awkward "remember that ৳500?" conversations

This is a SOCIAL feature, not just an accounting feature!
