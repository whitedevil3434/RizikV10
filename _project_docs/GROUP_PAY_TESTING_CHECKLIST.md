# Group Pay / Bill Splitting - Testing Checklist

## 🧪 Manual Testing Guide

### Test Environment Setup
- [ ] App installed and running
- [ ] Social Ledger accessible
- [ ] Group Pay button visible
- [ ] No existing test data

---

## 📱 Feature Testing

### 1. Group Creation Flow
**Test Case 1.1: Create Basic Group**
- [ ] Navigate to Social Ledger
- [ ] Tap "গ্রুপ খরচ" button
- [ ] Tap "+ নতুন গ্রুপ"
- [ ] Select group type: Roommates
- [ ] Enter name: "Test Roommates"
- [ ] Add 2 members: "Alice", "Bob"
- [ ] Tap "গ্রুপ তৈরি করুন"
- [ ] ✅ Group created successfully
- [ ] ✅ Success message shown
- [ ] ✅ +100 XP awarded
- [ ] ✅ Redirected to group list

**Test Case 1.2: Validation**
- [ ] Try creating group without name
- [ ] ✅ Error message shown
- [ ] Try creating group with only 1 member
- [ ] ✅ Error message shown
- [ ] Try creating group with empty member name
- [ ] ✅ Error message shown

**Test Case 1.3: All Group Types**
- [ ] Create Roommates group ✅
- [ ] Create Trip group ✅
- [ ] Create Event group ✅
- [ ] Create Friends group ✅
- [ ] Create Office group ✅
- [ ] Create Family group ✅

---

### 2. Group List Display
**Test Case 2.1: View Groups**
- [ ] Open group list
- [ ] ✅ All created groups visible
- [ ] ✅ Group type emoji shown
- [ ] ✅ Member count correct
- [ ] ✅ Balance indicator shown (if any)

**Test Case 2.2: Group Card Interaction**
- [ ] Tap on a group card
- [ ] ✅ Opens group dashboard
- [ ] ✅ Group details shown
- [ ] ✅ Members listed
- [ ] ✅ Balance section visible

**Test Case 2.3: Empty State**
- [ ] Delete all groups
- [ ] ✅ Empty state shown
- [ ] ✅ Message: "কোনো গ্রুপ নেই"
- [ ] ✅ Instruction to create group

---

### 3. Add Expense - Equal Split
**Test Case 3.1: Basic Equal Split**
- [ ] Open group dashboard
- [ ] Tap "+ খরচ যোগ করুন"
- [ ] Enter description: "Test Expense"
- [ ] Enter amount: 3000
- [ ] Select category: Food
- [ ] Select payer: You
- [ ] Keep split type: Equal
- [ ] ✅ Preview shows: ৳1000 each (3 members)
- [ ] Tap "খরচ যোগ করুন"
- [ ] ✅ Expense added successfully
- [ ] ✅ +50 XP awarded
- [ ] ✅ Expense appears in list

**Test Case 3.2: Balance Update**
- [ ] Check group dashboard
- [ ] ✅ Your balance: +৳2000 (you paid ৳3000, owe ৳1000)
- [ ] ✅ Alice balance: -৳1000
- [ ] ✅ Bob balance: -৳1000
- [ ] ✅ Total balances sum to 0

---

### 4. Add Expense - Unequal Split
**Test Case 4.1: Custom Amounts**
- [ ] Add new expense
- [ ] Description: "Unequal Test"
- [ ] Amount: 2000
- [ ] Split type: Unequal
- [ ] Enter amounts:
  - You: 500
  - Alice: 800
  - Bob: 700
- [ ] ✅ Total shows: ৳2000
- [ ] Confirm
- [ ] ✅ Expense added
- [ ] ✅ Balances updated correctly

**Test Case 4.2: Validation**
- [ ] Try amounts that don't sum to total
- [ ] ✅ Error: "Splits do not sum to total amount"
- [ ] Fix amounts
- [ ] ✅ Can submit

---

### 5. Add Expense - Percentage Split
**Test Case 5.1: Percentage Split**
- [ ] Add new expense
- [ ] Amount: 1000
- [ ] Split type: Percentage
- [ ] Enter percentages:
  - You: 50%
  - Alice: 30%
  - Bob: 20%
- [ ] ✅ Total shows: 100%
- [ ] Confirm
- [ ] ✅ Splits calculated correctly:
  - You: ৳500
  - Alice: ৳300
  - Bob: ৳200

**Test Case 5.2: Validation**
- [ ] Try percentages that don't sum to 100
- [ ] ✅ Total shown in red
- [ ] ✅ Cannot submit until fixed

---

### 6. Add Expense - Shares Split
**Test Case 6.1: Share-Based Split**
- [ ] Add new expense
- [ ] Amount: 1200
- [ ] Split type: Shares
- [ ] Enter shares:
  - You: 2x
  - Alice: 1x
  - Bob: 1x
- [ ] ✅ Calculates correctly:
  - You: ৳600 (2/4 of total)
  - Alice: ৳300 (1/4 of total)
  - Bob: ৳300 (1/4 of total)

---

### 7. Add Expense - Itemized Split
**Test Case 7.1: Itemized Bill**
- [ ] Add new expense
- [ ] Amount: 2750
- [ ] Split type: Itemized
- [ ] Add items:
  - Biryani ৳350 (You)
  - Kacchi ৳450 (Alice)
  - Thai ৳550 (Bob)
- [ ] Shared costs: ৳1400 (delivery + tip)
- [ ] ✅ Calculates correctly:
  - You: ৳350 + ৳467 = ৳817
  - Alice: ৳450 + ৳467 = ৳917
  - Bob: ৳550 + ৳467 = ৳1017

---

### 8. Balance Tracking
**Test Case 8.1: Multiple Expenses**
- [ ] Add 3-5 expenses with different payers
- [ ] Check balances after each
- [ ] ✅ Balances update correctly
- [ ] ✅ Always sum to 0
- [ ] ✅ Color coding correct (green/red)

**Test Case 8.2: Balance Display**
- [ ] Check group dashboard
- [ ] ✅ Your balance shown prominently
- [ ] ✅ All member balances listed
- [ ] ✅ Visual indicators (arrows, colors)
- [ ] ✅ "Settle Up" button visible if balance > 0

---

### 9. Smart Settlement
**Test Case 9.1: Simple Settlement**
- [ ] Create scenario: You paid ৳3000, others owe ৳1000 each
- [ ] Tap "নিষ্পত্তি করুন"
- [ ] ✅ Shows 2 settlements:
  - Alice pays You ৳1000
  - Bob pays You ৳1000
- [ ] Tap "পরিশোধিত হিসেবে চিহ্নিত করুন" for Alice
- [ ] Confirm
- [ ] ✅ Settlement recorded
- [ ] ✅ +100 XP awarded
- [ ] ✅ Alice's balance now 0
- [ ] ✅ Your balance reduced by ৳1000

**Test Case 9.2: Complex Settlement**
- [ ] Create scenario with circular debts:
  - You owe Alice ৳500
  - Alice owes Bob ৳500
  - Bob owes You ৳500
- [ ] Tap "নিষ্পত্তি করুন"
- [ ] ✅ Shows optimized: No transactions needed!
- [ ] ✅ Or minimal transactions

**Test Case 9.3: All Settled**
- [ ] Settle all debts
- [ ] ✅ Shows "সব সমান! 🎉"
- [ ] ✅ No settlement suggestions
- [ ] ✅ All balances = 0

---

### 10. Social Ledger Integration
**Test Case 10.1: Sync to Social Ledger**
- [ ] Add expense in group
- [ ] Navigate to Social Ledger
- [ ] ✅ Person-to-person transactions created
- [ ] ✅ Balances match group balances
- [ ] ✅ Descriptions include group name

**Test Case 10.2: Bidirectional Sync**
- [ ] Settle debt in group
- [ ] Check Social Ledger
- [ ] ✅ Social Ledger updated
- [ ] ✅ Balances consistent

---

### 11. Aura XP Integration
**Test Case 11.1: XP Awards**
- [ ] Create group → ✅ +100 XP
- [ ] Add expense → ✅ +50 XP
- [ ] Settle debt → ✅ +100 XP
- [ ] Check Aura dashboard
- [ ] ✅ XP total increased
- [ ] ✅ Progress bar updated

---

### 12. Edge Cases
**Test Case 12.1: Single Member Group**
- [ ] Try creating group with 1 member
- [ ] ✅ Validation prevents it

**Test Case 12.2: Zero Amount**
- [ ] Try adding expense with ৳0
- [ ] ✅ Validation prevents it

**Test Case 12.3: Negative Amount**
- [ ] Try entering negative amount
- [ ] ✅ Validation prevents it

**Test Case 12.4: Very Large Amount**
- [ ] Enter ৳999,999,999
- [ ] ✅ Handles correctly
- [ ] ✅ Displays properly

**Test Case 12.5: Decimal Amounts**
- [ ] Enter ৳1234.56
- [ ] ✅ Handles correctly
- [ ] ✅ Splits calculate accurately

---

### 13. UI/UX Testing
**Test Case 13.1: Navigation**
- [ ] All back buttons work ✅
- [ ] FABs accessible ✅
- [ ] Smooth transitions ✅
- [ ] No navigation bugs ✅

**Test Case 13.2: Visual Feedback**
- [ ] Success messages shown ✅
- [ ] Error messages clear ✅
- [ ] Loading indicators work ✅
- [ ] Colors appropriate ✅

**Test Case 13.3: Bengali Text**
- [ ] All labels in Bengali ✅
- [ ] ৳ symbol displayed ✅
- [ ] Numbers formatted correctly ✅
- [ ] Text readable ✅

**Test Case 13.4: Responsive Design**
- [ ] Works on small screens ✅
- [ ] Works on large screens ✅
- [ ] No overflow issues ✅
- [ ] Touch targets adequate ✅

---

### 14. Data Persistence
**Test Case 14.1: App Restart**
- [ ] Create groups and expenses
- [ ] Close app completely
- [ ] Reopen app
- [ ] ✅ All data persisted
- [ ] ✅ Balances correct
- [ ] ✅ No data loss

**Test Case 14.2: Multiple Sessions**
- [ ] Use app over multiple days
- [ ] ✅ Data remains consistent
- [ ] ✅ No corruption

---

### 15. Error Handling
**Test Case 15.1: Network Issues**
- [ ] Turn off internet
- [ ] Try using features
- [ ] ✅ Works offline (local storage)
- [ ] ✅ No crashes

**Test Case 15.2: Invalid Data**
- [ ] Try entering special characters
- [ ] Try very long names
- [ ] ✅ Handles gracefully
- [ ] ✅ Clear error messages

---

## 🎯 Acceptance Criteria

### Must Pass (Critical)
- [ ] Can create groups
- [ ] Can add expenses
- [ ] Can view balances
- [ ] Can settle debts
- [ ] All 5 split methods work
- [ ] Data persists
- [ ] No crashes

### Should Pass (Important)
- [ ] Social Ledger sync works
- [ ] XP rewards work
- [ ] Validation works
- [ ] UI is polished
- [ ] Bengali text correct

### Nice to Have (Optional)
- [ ] Smooth animations
- [ ] Quick performance
- [ ] Helpful messages
- [ ] Intuitive flows

---

## 📊 Test Results Template

### Test Session: [Date]
**Tester:** [Name]
**Device:** [Model]
**OS:** [Version]
**App Version:** [Version]

#### Summary
- Total Tests: __
- Passed: __
- Failed: __
- Blocked: __
- Pass Rate: __%

#### Critical Issues
1. [Issue description]
2. [Issue description]

#### Minor Issues
1. [Issue description]
2. [Issue description]

#### Suggestions
1. [Suggestion]
2. [Suggestion]

---

## 🐛 Bug Report Template

### Bug #[Number]
**Title:** [Short description]
**Severity:** Critical / High / Medium / Low
**Priority:** P0 / P1 / P2 / P3

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots:**
[Attach screenshots]

**Environment:**
- Device: [Model]
- OS: [Version]
- App Version: [Version]

---

## ✅ Sign-Off

### Testing Complete
- [ ] All critical tests passed
- [ ] All important tests passed
- [ ] No blocking issues
- [ ] Documentation reviewed
- [ ] Ready for production

**Tested By:** _______________
**Date:** _______________
**Signature:** _______________

---

## 📝 Notes

### Testing Tips
1. Test on multiple devices
2. Test with real-world scenarios
3. Test edge cases thoroughly
4. Document all issues
5. Retest after fixes

### Common Issues to Watch For
- Rounding errors in splits
- Balance calculation bugs
- UI overflow on small screens
- Data persistence issues
- Navigation bugs

### Performance Benchmarks
- Group creation: < 1s
- Expense addition: < 2s
- Balance calculation: < 0.5s
- Settlement: < 1s
- Screen transitions: < 0.3s

---

**Happy Testing!** 🧪
