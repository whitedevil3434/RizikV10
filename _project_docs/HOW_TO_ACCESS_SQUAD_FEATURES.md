# How to Access Squad Features

## Available Squad Screens

All squad-related screens are located in `lib/screens/squad/`:

1. **Squad Creation Screen** - `squad_creation_screen.dart`
2. **Squad Dashboard Screen** - `squad_dashboard_screen.dart`
3. **Income Split Config Screen** - `income_split_config_screen.dart`
4. **Duty Roster Screen** - `duty_roster_screen.dart`
5. **Dispute Filing Screen** - `dispute_filing_screen.dart`
6. **Tribunal Dashboard Screen** - `tribunal_dashboard_screen.dart`

## Current Status

✅ All models created
✅ All services created
✅ All providers created and registered in main.dart
✅ All screens created
❌ Screens not yet integrated into navigation

## Quick Access Methods

### Method 1: Add to Drawer Menu (Recommended)

Add squad menu items to `lib/widgets/frosted_drawer.dart`:

```dart
// In _buildPinnedTools or create a new section
_buildMenuItem(
  icon: Icons.groups,
  title: 'My Squads',
  onTap: () {
    widget.onClose();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SquadDashboardScreen(),
      ),
    );
  },
),
_buildMenuItem(
  icon: Icons.add_circle_outline,
  title: 'Create Squad',
  onTap: () {
    widget.onClose();
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SquadCreationScreen(),
      ),
    );
  },
),
```

### Method 2: Add to Home Screens

Add squad cards to role-specific home screens:

#### Consumer Home (`lib/screens/home/consumer_home.dart`)
```dart
// Add a squad card
GestureDetector(
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SquadDashboardScreen(),
      ),
    );
  },
  child: Card(
    child: ListTile(
      leading: Icon(Icons.groups, color: Colors.blue),
      title: Text('My Squad'),
      subtitle: Text('Manage your squad'),
      trailing: Icon(Icons.arrow_forward_ios),
    ),
  ),
)
```

#### Partner Home (`lib/screens/home/partner_home.dart`)
```dart
// Add squad management card
_buildQuickActionCard(
  context: context,
  icon: Icons.groups,
  title: 'Squad',
  subtitle: 'Manage team',
  color: Colors.purple,
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SquadDashboardScreen(),
      ),
    );
  },
)
```

#### Rider Home (`lib/screens/home/rider_home.dart`)
```dart
// Add squad card in the tools section
_buildToolCard(
  icon: Icons.groups,
  title: 'Squad',
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const SquadDashboardScreen(),
      ),
    );
  },
)
```

### Method 3: Add Routes to main.dart

Add named routes for easier navigation:

```dart
// In MaterialApp routes
routes: {
  '/cart': (context) => const CartReviewScreen(),
  '/payment': (context) => const PaymentMethodScreen(),
  '/squad-dashboard': (context) => const SquadDashboardScreen(),
  '/squad-create': (context) => const SquadCreationScreen(),
  '/duty-roster': (context) => const DutyRosterScreen(),
  '/tribunal': (context) => const TribunalDashboardScreen(),
},
```

Then navigate using:
```dart
Navigator.pushNamed(context, '/squad-dashboard');
```

## Testing Squad Features

### 1. Create a Squad
```dart
// Navigate to squad creation
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => const SquadCreationScreen(),
  ),
);
```

### 2. View Squad Dashboard
```dart
// Navigate to squad dashboard
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => SquadDashboardScreen(
      squadId: 'your_squad_id', // Get from SquadProvider
    ),
  ),
);
```

### 3. File a Dispute
```dart
// Navigate to dispute filing
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DisputeFilingScreen(
      squadId: 'your_squad_id',
      squadMembers: ['member1', 'member2', 'member3'],
    ),
  ),
);
```

### 4. View Tribunal
```dart
// Navigate to tribunal dashboard
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => TribunalDashboardScreen(
      squadId: 'your_squad_id',
    ),
  ),
);
```

### 5. Manage Duty Roster
```dart
// Navigate to duty roster
Navigator.push(
  context,
  MaterialPageRoute(
    builder: (context) => DutyRosterScreen(
      squadId: 'your_squad_id',
    ),
  ),
);
```

## Required Imports

Add these imports where needed:

```dart
import 'package:rizik_v4/screens/squad/squad_creation_screen.dart';
import 'package:rizik_v4/screens/squad/squad_dashboard_screen.dart';
import 'package:rizik_v4/screens/squad/duty_roster_screen.dart';
import 'package:rizik_v4/screens/squad/dispute_filing_screen.dart';
import 'package:rizik_v4/screens/squad/tribunal_dashboard_screen.dart';
import 'package:rizik_v4/screens/squad/income_split_config_screen.dart';
```

## Next Steps

1. Choose an access method (drawer menu recommended for quick testing)
2. Add navigation code to the chosen location
3. Test squad creation flow
4. Test squad dashboard features
5. Test tribunal system
6. Test duty roster

## Feature Overview

### Squad Creation
- Choose squad type (Maker, Mover, Family)
- Set squad name (English & Bengali)
- Set initial wallet contribution
- Generate QR code for member invitation

### Squad Dashboard
- View squad wallet balance
- See locked funds
- View member list with roles
- Track contributions and earnings
- View transaction history
- Access settings

### Tribunal System
- File disputes (6 types)
- Submit evidence
- Vote on disputes (weighted voting)
- View tribunal statistics
- Appeal decisions

### Duty Roster
- Auto-generate weekly rosters
- Fair distribution of duties
- Swap duty shifts
- Track performance
- View calendar

### Income Splitting
- Configure role weightages
- Auto-distribute earnings
- View split history
- Adjust configurations

---

**All systems are ready to use! Just add navigation to access them.** 🎉
