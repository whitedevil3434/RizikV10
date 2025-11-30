# 🚀 Co-Pilot Quick Start Guide

## What is Co-Pilot?

Co-Pilot turns your city into a game board. As you move around, opportunities appear as floating pills showing quick gigs you can do to earn money.

**Example:** Walking to class? See a delivery opportunity 300m on your path. Swipe right, earn ৳50 in 5 minutes!

---

## How It Works

### 1. Context Detection
- Tracks your location (simulated for MVP)
- Detects activity (walking, idle, driving)
- Knows your skills and availability

### 2. Smart Matching
- Finds opportunities near you
- Calculates if they're on your path
- Scores relevance (0-100)
- Shows only the best matches

### 3. Floating Pill
- Slides down from top
- Shows opportunity details
- Swipe right to accept
- Swipe left to decline

### 4. Active Tracker
- Shows accepted opportunity
- Start/Complete/Cancel buttons
- Earnings display
- Status indicator

---

## User Flow

```
1. Open app → Co-Pilot starts tracking
2. Move around → System finds opportunities
3. Pill appears → See best opportunity
4. Swipe right → Accept opportunity
5. Tap "Start" → Begin working
6. Complete task → Tap "Complete"
7. Earn money → Added to wallet
8. Return to normal → Original role restored
```

---

## Testing

### See Opportunities:
1. Hot restart app
2. Open Consumer Home
3. Wait 30 seconds
4. Floating pill appears

### Accept Opportunity:
1. Swipe right on pill
2. Confirm in dialog
3. See active tracker at bottom

### Complete Opportunity:
1. Tap "Start" button
2. Do the task
3. Tap "Complete"
4. See celebration message

---

## Opportunity Types

1. **📦 Delivery** - Package delivery
2. **🛍️ Pickup** - Collect items
3. **🔧 Service** - Repair/maintenance
4. **🏃 Errand** - Quick tasks
5. **📚 Teaching** - Tutoring
6. **🛒 Shopping** - Shopping assistance

---

## Key Features

### Smart Scoring:
- **Distance** - Closer is better
- **Detour** - On path is best
- **Earnings** - Higher per minute
- **Time** - Fits your schedule
- **Skills** - You can do it

### Visual Indicators:
- 🔥 **On path** - Minimal detour
- 💰 **Earnings** - Amount you'll earn
- ⏱️ **Time** - How long it takes
- 📍 **Distance** - How far away

### Gestures:
- **Swipe right** - Accept
- **Swipe left** - Decline
- **Tap** - See details

---

## Configuration

### Start Tracking:
```dart
copilot.startTracking(
  userId: 'user_001',
  userSkills: ['delivery', 'teaching'],
  currentRole: 'consumer',
  initialLat: 23.8103, // Your location
  initialLng: 90.4125,
);
```

### Stop Tracking:
```dart
copilot.stopTracking();
```

### Refresh Opportunities:
```dart
copilot.refreshOpportunities();
```

---

## Integration Points

### Consumer Home:
- ✅ Floating pill added
- ✅ Active tracker added
- ✅ Auto-starts tracking
- ✅ Auto-stops on dispose

### Partner Home:
- ⏳ Coming soon

### Rider Home:
- ⏳ Coming soon

---

## Future Enhancements

### Phase 2:
- Real GPS integration
- Backend API connection
- Push notifications
- Payment integration

### Phase 3:
- Machine learning personalization
- Social features (share opportunities)
- Team opportunities (2+ people)
- Leaderboards and badges

---

## Troubleshooting

### No opportunities appearing?
- Wait 30 seconds for first update
- Check if tracking is started
- Verify CoPilotProvider is registered

### Pill not showing?
- Check if you have active opportunity
- Verify widgets are in Stack
- Hot restart the app

### Can't accept opportunity?
- Check if already have active one
- Verify role permissions
- Check skill requirements

---

## Files Reference

**Models:** `lib/models/opportunity.dart`  
**Service:** `lib/services/copilot_service.dart`  
**Provider:** `lib/providers/copilot_provider.dart`  
**Pill UI:** `lib/widgets/floating_opportunity_pill.dart`  
**Tracker UI:** `lib/widgets/active_opportunity_tracker.dart`

---

## Quick Commands

```bash
# Hot restart
r

# Full rebuild
flutter clean
flutter run

# Check for errors
flutter analyze
```

---

**Ready to earn while you move! 🚀**
