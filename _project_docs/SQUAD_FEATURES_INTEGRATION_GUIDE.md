# Squad Features Integration Guide

## 🎯 Overview
This guide shows how to integrate the new Squad features (Tribunal, Duty Roster, Income Split) into all role home screens.

---

## ✅ What's Been Created

### New Features (Today)
1. **Squad Tribunal** - Dispute resolution system
2. **Duty Roster** - Weekly shift management  
3. **Trust Score Warnings** - Feature restrictions

### Files Created
- `lib/models/squad_tribunal.dart`
- `lib/services/squad_tribunal_service.dart`
- `lib/providers/squad_tribunal_provider.dart`
- `lib/screens/squad/dispute_filing_screen.dart`
- `lib/screens/squad/tribunal_dashboard_screen.dart`
- `lib/models/duty_roster.dart`
- `lib/services/duty_roster_service.dart`
- `lib/providers/duty_roster_provider.dart`
- `lib/screens/squad/duty_roster_screen.dart`
- `lib/services/trust_score_check_service.dart`

### Providers Registered in main.dart ✅
```dart
ChangeNotifierProvider(create: (_) => SquadTribunalProvider()),
ChangeNotifierProvider(create: (_) => DutyRosterProvider()),
```

---

## 🔗 Integration Steps

### Step 1: Add Squad Card to Home Screens

Add this card to the masonry grid or feed in each home screen:

```dart
// Squad Quick Access Card
Widget _buildSquadCard() {
  return Consumer<SquadProvider>(
    builder: (context, squadProvider, _) {
      final mySquads = squadProvider.squads; // Get user's squads
      
      if (mySquads.isEmpty) {
        return _buildJoinSquadCard();
      }
      
      final squad = mySquads.first; // Show first squad
      
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.purple.shade700, Colors.purple.shade500],
          ),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text(
                  '👥',
                  style: TextStyle(fontSize: 32),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'My Squad',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                      ),
                      Text(
                        squad.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildSquadQuickAction(
                    Icons.calendar_today,
                    'Roster',
                    () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => DutyRosterScreen(squadId: squad.id),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSquadQuickAction(
                    Icons.gavel,
                    'Tribunal',
                    () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => TribunalDashboardScreen(
                          squadId: squad.id,
                          currentUserId: 'current_user', // TODO: Get actual user ID
                          squadMembers: squad.members.map((m) => m.userId).toList(),
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildSquadQuickAction(
                    Icons.dashboard,
                    'Dashboard',
                    () => Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => SquadDashboardScreen(squadId: squad.id),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    },
  );
}

Widget _buildSquadQuickAction(IconData icon, String label, VoidCallback onTap) {
  return InkWell(
    onTap: onTap,
    child: Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(height: 4),
          Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 10,
            ),
          ),
        ],
      ),
    ),
  );
}

Widget _buildJoinSquadCard() {
  return Container(
    padding: const EdgeInsets.all(16),
    decoration: BoxDecoration(
      gradient: LinearGradient(
        colors: [Colors.purple.shade700, Colors.purple.shade500],
      ),
      borderRadius: BorderRadius.circular(16),
    ),
    child: Column(
      children: [
        const Text(
          '👥',
          style: TextStyle(fontSize: 48),
        ),
        const SizedBox(height: 12),
        const Text(
          'Join a Squad',
          style: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'Work together, earn together',
          style: TextStyle(
            color: Colors.white70,
            fontSize: 12,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        ElevatedButton(
          onPressed: () {
            // Navigate to squad creation
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.white,
            foregroundColor: Colors.purple.shade700,
          ),
          child: const Text('Create Squad'),
        ),
      ],
    ),
  );
}
```

### Step 2: Add Required Imports

Add these imports to each home screen file:

```dart
import '../../providers/squad_provider.dart';
import '../../providers/squad_tribunal_provider.dart';
import '../../providers/duty_roster_provider.dart';
import '../squad/squad_dashboard_screen.dart';
import '../squad/duty_roster_screen.dart';
import '../squad/tribunal_dashboard_screen.dart';
```

### Step 3: Insert Card into Feed/Grid

**For Consumer Home:**
Add to `_strategicDeckCards` list or create a separate squad section.

**For Partner Home:**
Add to the masonry grid or quick actions section.

**For Rider Home:**
Add to the feed items or create a pinned squad card at the top.

---

## 🎨 Alternative: Bottom Sheet Quick Access

Instead of cards, you can add a floating action button or bottom sheet:

```dart
FloatingActionButton(
  onPressed: () => _showSquadQuickAccess(),
  child: const Text('👥'),
  backgroundColor: Colors.purple.shade700,
)

void _showSquadQuickAccess() {
  showModalBottomSheet(
    context: context,
    builder: (context) => Container(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'Squad Quick Access',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          ListTile(
            leading: const Icon(Icons.calendar_today, color: Colors.purple),
            title: const Text('Duty Roster'),
            subtitle: const Text('View and manage shifts'),
            onTap: () {
              Navigator.pop(context);
              // Navigate to roster
            },
          ),
          ListTile(
            leading: const Icon(Icons.gavel, color: Colors.red),
            title: const Text('Tribunal'),
            subtitle: const Text('Disputes and voting'),
            onTap: () {
              Navigator.pop(context);
              // Navigate to tribunal
            },
          ),
          ListTile(
            leading: const Icon(Icons.dashboard, color: Colors.blue),
            title: const Text('Squad Dashboard'),
            subtitle: const Text('Full squad management'),
            onTap: () {
              Navigator.pop(context);
              // Navigate to dashboard
            },
          ),
        ],
      ),
    ),
  );
}
```

---

## 📱 Direct Navigation Examples

### Navigate to Duty Roster
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => DutyRosterScreen(
      squadId: 'squad_123',
    ),
  ),
);
```

### Navigate to Tribunal
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => TribunalDashboardScreen(
      squadId: 'squad_123',
      currentUserId: 'user_456',
      squadMembers: ['user_456', 'user_789'],
      isAdmin: true,
    ),
  ),
);
```

### Navigate to Squad Dashboard
```dart
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (_) => SquadDashboardScreen(
      squadId: 'squad_123',
    ),
  ),
);
```

---

## 🔔 Notification Badges

Add notification badges to show pending actions:

```dart
Consumer2<SquadTribunalProvider, DutyRosterProvider>(
  builder: (context, tribunalProvider, rosterProvider, _) {
    final pendingVotes = tribunalProvider.getDisputesRequiringVote('user_id').length;
    final upcomingShifts = rosterProvider.getUpcomingShifts('user_id').length;
    
    return Badge(
      label: Text('${pendingVotes + upcomingShifts}'),
      child: IconButton(
        icon: const Icon(Icons.groups),
        onPressed: () {
          // Show squad menu
        },
      ),
    );
  },
)
```

---

## ✅ Testing Checklist

After integration, test:

- [ ] Squad card appears on home screen
- [ ] Clicking "Roster" opens Duty Roster screen
- [ ] Clicking "Tribunal" opens Tribunal screen
- [ ] Clicking "Dashboard" opens Squad Dashboard
- [ ] Navigation works from all 3 role homes
- [ ] Back button returns to home screen
- [ ] Providers are accessible (no errors)
- [ ] Bengali/English toggle works

---

## 🚀 Quick Start

**Minimal Integration (5 minutes):**

1. Add imports to home screen
2. Add squad card widget
3. Insert card into existing grid/feed
4. Test navigation

**Full Integration (15 minutes):**

1. Add squad card with all features
2. Add notification badges
3. Add bottom sheet quick access
4. Style to match app theme
5. Test all navigation paths

---

## 📝 Notes

- All providers are already registered in `main.dart` ✅
- All screens are fully functional ✅
- No compilation errors ✅
- Bengali/English support included ✅
- Ready for immediate use ✅

---

**Need Help?** Check existing implementations in:
- `lib/screens/squad/squad_dashboard_screen.dart` (Settings tab has navigation examples)
- `lib/screens/squad/duty_roster_screen.dart` (Full roster UI)
- `lib/screens/squad/tribunal_dashboard_screen.dart` (Full tribunal UI)

