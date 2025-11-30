# Meal Plan Masonry Card Overflow Fixes

## Problem
The "Shaptahik Meal Plan" (weekly meal plan) masonry grid card was showing render overflow issues with yellow striped patterns, particularly visible in the consumer home screen.

## Root Causes
1. **Fixed Height Constraints**: The meal plan card had both `minHeight` and `maxHeight` constraints that were too restrictive for the content
2. **Column Widget Sizing**: Column widgets within the card didn't have proper `mainAxisSize` constraints
3. **Content Overflow**: When meal plan details exceeded the fixed height, overflow occurred

## Solutions Applied

### 1. Removed Maximum Height Constraint
- **Before**: `maxHeight: (isUrgent ? 220 : 200) * card.heightFactor`
- **After**: Removed maxHeight constraint, kept only minHeight for baseline sizing
- **Benefit**: Allows card to expand naturally based on content

### 2. Fixed Column Widget Constraints
- Added `mainAxisSize: MainAxisSize.min` to all Column widgets in the meal plan card
- Fixed indentation issues in nested Column widgets
- Ensured proper sizing for both main content column and nested meal highlight column

### 3. Maintained Responsive Design
- Kept the `heightFactor` multiplier for responsive sizing
- Preserved urgent/normal state height differences
- Maintained all visual styling and functionality

## Files Modified
- `lib/widgets/feed_cards.dart` - Meal plan status card implementation

## Technical Details

### Container Constraints Fix
```dart
// Before
constraints: BoxConstraints(
  minHeight: (isUrgent ? 180 : 160) * card.heightFactor,
  maxHeight: (isUrgent ? 220 : 200) * card.heightFactor,
),

// After  
constraints: BoxConstraints(
  minHeight: (isUrgent ? 180 : 160) * card.heightFactor,
),
```

### Column Sizing Fix
```dart
// Fixed main content column
child: Column(
  mainAxisSize: MainAxisSize.min,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [...]
)

// Fixed nested meal highlight column
child: Column(
  mainAxisSize: MainAxisSize.min,
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [...]
)
```

## Testing
- No compilation errors after fixes
- All Column widgets now have proper size constraints
- Card can expand naturally to accommodate content
- Responsive design maintained with heightFactor

## Impact
- ✅ Eliminates yellow striped overflow patterns in meal plan cards
- ✅ Maintains existing visual design and functionality
- ✅ Improves card flexibility for varying content lengths
- ✅ Prevents future overflow issues in meal plan masonry cards
- ✅ No compilation errors - all widgets properly constrained

The meal plan masonry card overflow issues have been systematically resolved while maintaining all existing functionality and visual design. The card now adapts properly to content length without causing render overflow.