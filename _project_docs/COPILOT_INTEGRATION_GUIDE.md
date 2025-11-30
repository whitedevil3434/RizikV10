# Co-Pilot Opportunity Engine - Integration Guide

## Quick Start

The Co-Pilot Opportunity Engine is now ready to integrate! This system shows users earning opportunities that are on their path with minimal detour.

---

## 1. Register Provider

Add to `lib/main.dart`:

```dart
import 'package:provider/provider.dart';
import 'providers/copilot_provider.dart';

MultiProvider(
  providers: [
    // ... existing providers
    ChangeNotifierProvider(create: (_) => CoPilotProvider()),
  ],
  child: MyApp(),
)
```

---

## 2. Add Floating Pill to Home Screens

Add to `lib/screens/home/consumer_home.dart`, `partner_home.dart`, `rider_home.dart`:

```dart
import '../widgets/floating_opportunity_pill.dart';

@override
Widget build(BuildContext context) {
  return Stack(
    children: [
      // Your existing home screen content
      Scaffold(
        appBar: AppBar(...),
        body: YourHomeContent(),
      ),
      
      // Add floating opportunity pill
      Positioned(
        top: 0,
        left: 0,
        right: 0,
        child: SafeArea(
          child: FloatingOpportunityPill(
            isBengali: _isBengali,
          ),
        ),
      ),
    ],
  );
}
```

---

## 3. Add Co-Pilot Screen to Navigation

Add to drawer or bottom navigation:

```dart
ListTile(
  leading: Icon(Icons.explore),
  title: Text(isBengali ? 'কো-পাইলট' : 'Co-Pilot'),
  onTap: () {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => CoPilotScreen(isBengali: isBengali),
      ),
    );
  },
)
```

---

## 4. Start Tracking on App Launch

Add to your main screen's `initState()`:

```dart
@override
void initState() {
  super.initState();
  _startCoPilot();
}

Future<void> _startCoPilot() async {
  final copilotProvider = context.read<CoPilotProvider>();
  final profileProvider = context.read<ProfileProvider>();
  
  if (profileProvider.userProfile != null) {
    await copilotProvider.startTracking(
      userId: profileProvider.userProfile!.userId,
      userSkills: profileProvider.userProfile!.skills,
      currentRole: profileProvider.currentRole.name,
    );
  }
}
```

---

## 5. Add Required Permissions

### Android (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

### iOS (`ios/Runner/Info.plist`):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to show earning opportunities on your path</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>We need your location to show earning opportunities even when the app is in background</string>
```

---

## 6. Add Geolocator Dependency

Already in `pubspec.yaml`, but verify:

```yaml
dependencies:
  geolocator: ^10.1.0
```

---

## How It Works

### User Experience Flow

1. **User opens app** → Co-Pilot starts tracking location
2. **User moves around** → System detects activity (walking/cycling/driving)
3. **Opportunity found** → Floating pill slides down from top
4. **User taps pill** → Expands to show full details
5. **User accepts** → Switches to temporary role (e.g., rider)
6. **User completes task** → Earns money, switches back to original role

### Behind the Scenes

- Location updates every 30 seconds (battery-efficient)
- Detects user activity from GPS speed
- Predicts destination from movement pattern
- Filters opportunities within 2km and < 300m detour
- Calculates relevance score (0.0-1.0)
- Shows only high-relevance opportunities (> 0.6)

---

## Customization

### Adjust Tracking Interval

In `lib/services/copilot_service.dart`:

```dart
static const int CONTEXT_UPDATE_INTERVAL_SECONDS = 30; // Change to 60 for less frequent
```

### Adjust Maximum Detour

```dart
static const double MAX_DETOUR_METERS = 300; // Change to 500 for more opportunities
```

### Adjust Minimum Relevance Score

In `lib/providers/copilot_provider.dart`:

```dart
if (best != null && best.relevanceScore > 0.6) { // Change to 0.5 for more opportunities
```

---

## Testing

### Test with Mock Data

The system generates mock opportunities automatically. To test:

1. Enable Co-Pilot in the app
2. Move around (or simulate in emulator)
3. Opportunities will appear based on your location

### Test Acceptance Flow

1. Tap floating pill to expand
2. Tap "Accept" button
3. Check that role switches
4. Tap "Complete" in Co-Pilot screen
5. Verify earnings awarded

---

## Production Checklist

Before going live:

- [ ] Replace mock opportunities with real API calls
- [ ] Implement push notifications for high-value opportunities
- [ ] Add opportunity history tracking
- [ ] Add map view for opportunity visualization
- [ ] Test battery usage over 24 hours
- [ ] Test with poor GPS signal
- [ ] Test permission denial handling
- [ ] Add analytics tracking

---

## API Integration (TODO)

Replace mock data in `lib/providers/copilot_provider.dart`:

```dart
// Replace this:
final mockOpportunities = CoPilotService.generateMockOpportunities(
  userLat: _currentContext!.latitude,
  userLng: _currentContext!.longitude,
  count: 10,
);

// With this:
final response = await supabase
  .from('opportunities')
  .select()
  .gte('expires_at', DateTime.now().toIso8601String())
  .order('created_at', ascending: false);

final opportunities = (response as List)
  .map((json) => Opportunity.fromJson(json))
  .toList();
```

---

## Troubleshooting

### Pill Not Showing
- Check that tracking is enabled
- Verify location permissions granted
- Check relevance score threshold
- Ensure opportunities exist within 2km

### Location Not Updating
- Check GPS is enabled on device
- Verify permissions granted
- Check internet connection
- Try restarting tracking

### High Battery Usage
- Increase tracking interval (30s → 60s)
- Reduce position history size (10 → 5)
- Stop tracking when app in background

---

## Next Steps

After integration:

1. **Test thoroughly** with real users
2. **Monitor metrics** (acceptance rate, completion rate)
3. **Gather feedback** on opportunity relevance
4. **Tune algorithms** based on data
5. **Add map view** for better visualization
6. **Implement push notifications** for high-value opportunities

---

## Support

For questions or issues:
- Check `TASK_8_COPILOT_COMPLETE.md` for detailed documentation
- Review code comments in service and provider files
- Test with mock data first before API integration

---

**The Co-Pilot is ready to transform your users into opportunistic earners!** 🚀
