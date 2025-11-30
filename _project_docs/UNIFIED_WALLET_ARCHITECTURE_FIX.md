# 🚨 CRITICAL: Unified Wallet Architecture Fix

## Problem Analysis (সমস্যা বিশ্লেষণ)

### Current WRONG Implementation ❌
```
User has 3 separate wallets:
- Consumer Wallet: ৳100
- Partner Wallet: ৳100  
- Rider Wallet: ৳100
Total: ৳300 (but user only has ৳100!)
```

**Critical Issue:** Money is tied to ROLE, not to USER.

### Correct Implementation ✅
```
User has 1 unified wallet:
- Main Balance: ৳100
- All roles see the SAME ৳100
- Spending/earning updates ONE balance
```

**Correct Behavior:** Money is tied to USER ID, not role.

---

## Architecture Changes

### 1. Database/Model Layer

#### OLD (Wrong):
```dart
class Moneybag {
  MoneybagType type; // personal, partner, rider
  double balance;    // Separate balance per type!
}
```

#### NEW (Correct):
```dart
class UnifiedWallet {
  String userId;           // Money belongs to USER
  double mainBalance;      // ONE balance for all roles
  double lockedFunds;      // For Rizik Dhaar, escrow, etc.
  double availableBalance; // mainBalance - lockedFunds
}
```

### 2. Transaction Layer

#### OLD (Wrong):
```dart
// Deducts from role-specific wallet
if (role == Consumer) deduct from consumerWallet
if (role == Partner) deduct from partnerWallet
```

#### NEW (Correct):
```dart
// Deducts from unified wallet, tracks role in Khata OS
deduct from user.mainBalance
record in KhataOS with sourceRole metadata
```

### 3. Khata OS Integration

**Key Insight:** Wallet stores money, Khata OS tracks HOW it was earned/spent.

```dart
Transaction {
  userId: "user123"
  amount: -50
  sourceRole: "consumer"  // Spent as consumer
  category: "food"
  description: "Ordered biryani"
}

// Same user, different role
Transaction {
  userId: "user123"
  amount: +30
  sourceRole: "partner"   // Earned as partner
  category: "revenue"
  description: "Sold biryani"
}

// Wallet balance: 100 - 50 + 30 = 80 (unified!)
```

---

## Implementation Steps

### Step 1: Update Moneybag Model
- Remove separate wallet types
- Add unified balance fields
- Add transaction history with role metadata

### Step 2: Update Transaction Orchestrator
- Change from `fromWallet: MoneybagType` to `userId: String`
- Add `sourceRole` parameter to track which role made transaction
- Update all transaction methods

### Step 3: Update UI
- Show same balance across all roles
- Add role indicator in transaction history
- Update wallet display logic

### Step 4: Migration Strategy
- Merge existing balances: `unifiedBalance = max(consumer, partner, rider)`
- Preserve transaction history with role tags
- Update all existing code references

---

## Benefits

### 1. User Trust ✅
- Users see their real money
- No confusion about "which wallet"
- Transparent across roles

### 2. Khata OS Power ✅
- Complete financial picture
- Track money flow across roles
- Better insights and analytics

### 3. Role Fluidity ✅
- Seamless role switching
- Earn as partner, spend as consumer
- Natural user experience

---

## Technical Implementation

### New Unified Wallet Model
```dart
class UnifiedWallet {
  final String id;
  final String userId;
  final double mainBalance;
  final double lockedFunds;
  final List<WalletTransaction> transactions;
  
  double get availableBalance => mainBalance - lockedFunds;
  
  // Get transactions by role
  List<WalletTransaction> getTransactionsByRole(UserRole role);
  
  // Get earnings by role
  double getEarningsByRole(UserRole role);
  
  // Get spending by role
  double getSpendingByRole(UserRole role);
}

class WalletTransaction {
  final String id;
  final double amount;
  final UserRole sourceRole;  // Which role made this transaction
  final TransactionType type;
  final DateTime timestamp;
  final String description;
  final Map<String, dynamic> metadata;
}
```

### Updated Transaction Orchestrator
```dart
class UnifiedWalletOrchestrator {
  Future<TransactionResult> executeTransaction({
    required String userId,
    required UserRole sourceRole,  // NEW: Track which role
    required double amount,
    required TransactionType type,
    required String description,
  }) async {
    // Get user's unified wallet
    final wallet = await getUnifiedWallet(userId);
    
    // Check available balance
    if (wallet.availableBalance < amount) {
      return TransactionResult.failure('Insufficient balance');
    }
    
    // Update unified balance
    wallet.mainBalance -= amount;
    
    // Record in Khata OS with role metadata
    await khataProvider.addEntry(
      userId: userId,
      amount: amount,
      sourceRole: sourceRole,  // Track which role
      type: type,
      description: description,
    );
    
    return TransactionResult.success();
  }
}
```

---

## Migration Plan

### Phase 1: Create Unified Wallet Model ✅
- Define new UnifiedWallet class
- Add migration utilities

### Phase 2: Update Transaction Orchestrator ✅
- Modify all transaction methods
- Add role tracking

### Phase 3: Update UI Components ✅
- Show unified balance
- Add role indicators
- Update wallet screens

### Phase 4: Data Migration ✅
- Merge existing wallet balances
- Preserve transaction history
- Update database schema

---

## Testing Strategy

### Property Tests
1. **Balance Consistency**: Balance same across all roles
2. **Transaction Atomicity**: Debit/credit updates unified balance
3. **Role Tracking**: Khata OS correctly tracks source role
4. **Locked Funds**: Locked funds properly reserved

### Integration Tests
1. Order as consumer → Check unified balance decreased
2. Switch to partner → Verify same balance shown
3. Earn as partner → Check unified balance increased
4. Switch to rider → Verify same balance shown

---

## Success Criteria

✅ One user = One wallet balance
✅ Balance consistent across all roles
✅ Khata OS tracks role-specific transactions
✅ Seamless role switching experience
✅ No money "multiplication" bug
✅ Clear transaction history with role tags

---

## Next Steps

1. Implement UnifiedWallet model
2. Update MoneybagTransactionOrchestrator
3. Update all UI components
4. Write migration script
5. Test thoroughly
6. Deploy with data migration

This fix will make Rizik's financial system trustworthy and transparent! 🎯
