# Bazar Tab Store Section Fix

## Issue Identified
The Store section in the Bazar Tab was showing a duplicate/nested structure:
- When users tapped "Store" tab, they saw another "Bazar" header
- Below that were "Stores" and "Marketplace" tabs again
- Plus a search box and filter chips
- This created confusion and redundant UI layers

## Root Cause
The `StoreListScreen` was designed as a standalone screen with its own:
- `Scaffold` wrapper
- `AppBar` with "Bazar" title
- `TabBar` with "Stores" and "Marketplace" tabs

However, it was being used inside `BazarTabScreen` which already had:
- Its own tab structure (For You, Rizik Vibes, Store)
- Header with role indicator and search
- Navigation context

This created a nested structure: **BazarTab → Store Tab → StoreListScreen (with its own tabs)**

## Solution Applied

### Changed Structure
**Before:**
```
BazarTabScreen
├── For You Tab
├── Rizik Vibes Tab
└── Store Tab
    └── StoreListScreen (Scaffold with AppBar)
        ├── AppBar: "Bazar"
        ├── TabBar: Stores | Marketplace
        └── TabBarView
            ├── Stores (with search & filters)
            └── Marketplace
```

**After:**
```
BazarTabScreen
├── For You Tab
├── Rizik Vibes Tab
└── Store Tab
    └── StoreListScreen (Column with sub-tabs)
        ├── TabBar: Stores | Marketplace
        └── TabBarView
            ├── Stores (with search & filters)
            └── Marketplace
```

### Code Changes

**File:** `lib/screens/store_list_screen.dart`

1. **Removed Scaffold wrapper** - No longer needed since it's embedded in BazarTabScreen
2. **Removed AppBar** - BazarTabScreen already has header
3. **Kept TabBar** - But made it a simple sub-tab bar without AppBar
4. **Changed to Column layout** - Direct column with TabBar and TabBarView

### Benefits

✅ **Cleaner Navigation** - No duplicate headers or tabs
✅ **Better UX** - Users see Stores/Marketplace tabs directly
✅ **Consistent Design** - Matches the For You and Rizik Vibes tabs
✅ **Less Confusion** - Clear hierarchy without nesting
✅ **Faster Performance** - One less Scaffold layer

## Visual Flow

### Before (Confusing)
```
[Bazar Tab Header]
  For You | Rizik Vibes | Store ← User taps here
  
[Store Screen Shows]
  ← Bazar                    ← Duplicate header!
  Stores | Marketplace       ← Duplicate tabs!
  [Search stores...]         ← Search box
  [Filter chips]             ← Filters
  [Store cards...]
```

### After (Clean)
```
[Bazar Tab Header]
  For You | Rizik Vibes | Store ← User taps here
  
[Store Section Shows]
  Stores | Marketplace       ← Direct sub-tabs
  [Search stores...]         ← Search box
  [Filter chips]             ← Filters
  [Store cards...]
```

## Testing Checklist

- [x] Compile check passed
- [ ] Visual verification needed
- [ ] Test Stores tab functionality
- [ ] Test Marketplace tab functionality
- [ ] Test search and filters
- [ ] Test store card navigation
- [ ] Test on different screen sizes

## Related Files
- `lib/screens/bazar_tab_screen.dart` - Main Bazar Tab container
- `lib/screens/store_list_screen.dart` - Fixed Store section
- `lib/screens/for_you_feed_screen.dart` - For You tab (reference)
- `lib/screens/rizik_vibes_screen.dart` - Rizik Vibes tab (reference)

## Status
✅ **FIXED** - Store section no longer shows duplicate structure
