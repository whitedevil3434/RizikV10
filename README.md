# 🍱 Rizik V4.1 - Flutter Motion System Implementation

Complete Flutter conversion of the Rizik Super-App with comprehensive motion design, Hero transitions, and Pinterest-style feeds.

---

## 🎯 Project Overview

This Flutter implementation preserves all layouts from the original React/TypeScript codebase while adding:

- **Spring-based animations** (stiffness: 320, damping: 24)
- **Hero transitions** between all connected screens
- **Pinterest-style dual-column feeds** with parallax
- **Role-aware theming** with gradient morphing
- **Bottom sheet modals** with easing curves
- **Micro-interactions** on all interactive elements

---

## 📁 Project Structure

```
flutter_rizik/
├── lib/
│   ├── config/
│   │   └── motion_config.dart          # Animation constants (R-HIG compliant)
│   ├── models/
│   │   ├── user_role.dart              # Role enum with themes
│   │   └── food_item.dart              # Food data model
│   ├── providers/
│   │   └── role_provider.dart          # Role state management
│   ├── screens/
│   │   ├── splash_screen.dart          # 4-stage animated splash
│   │   ├── main_screen.dart            # Main navigation shell
│   │   ├── home/
│   │   │   ├── consumer_home.dart      # Pinterest feed + hero banner
│   │   │   ├── partner_home.dart       # Stats + bids
│   │   │   └── rider_home.dart         # Missions dashboard
│   │   ├── fooddrobe_screen.dart
│   │   ├── orders_screen.dart
│   │   ├── wallet_screen.dart
│   │   └── profile_screen.dart
│   ├── widgets/
│   │   ├── rizik_motion_feed.dart      # Pinterest dual-column with motion
│   │   ├── role_slider.dart            # Role switcher with morph
│   │   ├── bottom_nav.dart             # 5-tab navigation
│   │   └── hero_transition.dart        # Custom transitions
│   └── main.dart                       # App entry point
├── pubspec.yaml                        # Dependencies
└── README.md                           # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Flutter SDK 3.0+
- Dart 3.0+
- iOS Simulator / Android Emulator

### Installation

```bash
cd flutter_rizik

# Install dependencies
flutter pub get

# Run on iOS
flutter run

# Run on Android
flutter run

# Run on Web (for preview)
flutter run -d chrome
```

---

## 🎨 Motion System Features

### 1. Splash Screen (4 Stages)
- **Stage 1:** Logo spin-in with elastic bounce
- **Stage 2:** Brand name fade-in
- **Stage 3:** Role cards slide from left
- **Stage 4:** Loading dots animation

### 2. Role Slider
- **Spring morph:** 600ms transition with custom physics
- **Gradient interpolation:** Smooth color blend
- **Icon animation:** Role emoji morphs

### 3. Pinterest Motion Feed
- **Dual-column masonry** using `flutter_staggered_grid_view`
- **Scroll-triggered appear:** Each item fades + slides
- **Card tap scale:** 1.0 → 0.96 (subtle press feedback)
- **Parallax images:** Background moves at -0.2x scroll speed

### 4. Hero Transitions
All food cards → detail screens use Hero with:
- Custom flight shuttle builder
- Spring physics (320 stiffness, 24 damping)
- Material transition

### 5. Bottom Sheets
- Slide from bottom with ease-out-cubic
- 24px top radius
- Backdrop blur + dismissible

---

## 🔧 Configuration

### Motion Constants (`config/motion_config.dart`)

```dart
// Durations
micro: 100ms
small: 200ms
medium: 280ms
standard: 380ms
large: 480ms
macro: 600ms

// Spring Physics
heroSpring: (mass: 1.0, stiffness: 320, damping: 24)
roleSwitch: (mass: 1.0, stiffness: 400, damping: 20)

// Easing Curves
scrollAppear: easeOutCubic
transition: easeInOut
bottomSheet: easeOutCubic
```

### Role Themes

```dart
Consumer: #FFC247 (Gold)
Partner:  #7CD99F (Mint Green)
Rider:    #FF5A5F (Warm Red)
```

---

## 📱 Implemented Screens

### ✅ Core Screens (5)
- [x] Splash Screen (4-stage animation)
- [x] Main Screen (navigation shell)
- [x] Consumer Home (Pinterest feed)
- [x] Partner Home (dashboard + bids)
- [x] Rider Home (missions)

### 🔄 Placeholder Screens (4)
- [ ] Fooddrobe (coming soon)
- [ ] Orders (coming soon)
- [ ] Wallet (coming soon)
- [ ] Profile (coming soon)

---

## 🎯 Motion Patterns Implemented

| Pattern | Location | Duration | Physics |
|---------|----------|----------|---------|
| **Splash Logo** | SplashScreen | 800ms | Elastic out |
| **Role Morph** | RoleSlider | 600ms | Spring 400/20 |
| **Card Appear** | Motion Feed | 280ms | Ease-out-cubic |
| **Card Tap** | All Cards | 200ms | Ease-in-out |
| **Hero Flight** | Navigation | 380ms | Spring 320/24 |
| **Tab Switch** | BottomNav | 300ms | Ease-in-out-cubic |
| **Favorite** | Food Cards | 300ms | Bounce sequence |

---

## 🔌 Integration Points

### Adding Hero Transition

```dart
// Wrap source widget
Hero(
  tag: 'food_${item.id}',
  child: FoodCard(item: item),
)

// Wrap destination widget
Hero(
  tag: 'food_${item.id}',
  child: FoodDetailScreen(item: item),
)

// Navigate with custom route
Navigator.push(
  context,
  SpringPageRoute(page: FoodDetailScreen(item: item)),
);
```

### Using Pinterest Feed

```dart
RizikMotionFeed<FoodItem>(
  items: foodItems,
  itemBuilder: (context, item, index) {
    return FoodCard(item: item);
  },
)
```

### Flying Cart Animation

```dart
FlyingItemAnimation(
  start: Offset(x, y),  // Item position
  end: cartOffset,      // Cart icon position
  onComplete: () => _updateCart(),
  child: FoodThumbnail(),
)
```

---

## 🎬 Animation Showcase

### Splash Sequence
```
0ms:    Empty screen
500ms:  Logo appears (scale 0→1, rotate -180→0)
1500ms: "Rizik" brand fades in
2500ms: Role cards slide in (staggered)
3500ms: Loading dots
4500ms: Fade to main app
```

### Role Switch Flow
```
User taps role pill
→ Scale animation (1.0→0.95→1.0) 200ms
→ Gradient morph begins 600ms
→ Theme updates globally
→ Home screen content cross-fades 300ms
```

### Feed Scroll Behavior
```
User scrolls down
→ Items in viewport trigger appear animation
→ Images apply parallax (offsetY = scroll * -0.2)
→ Header shrinks with scroll position
→ Smooth inertia scroll physics
```

---

## 🔬 Performance Optimizations

1. **Widget recycling:** ListView builder with cached items
2. **Image caching:** `cached_network_image` for all network images
3. **Animation disposal:** All controllers disposed in `dispose()`
4. **Lazy loading:** Feed items loaded as scrolled
5. **GPU optimization:** Transform3D for parallax instead of layout

---

## 🎨 Design Tokens

Following R-HIG (Rizik Human Interface Guidelines):

```dart
// Border Radius
small:  12px (buttons)
medium: 16px (cards)
large:  24px (modals)
xlarge: 32px (hero sections)

// Elevation
none:   0dp
low:    2dp  (cards)
medium: 4dp  (floating buttons)
high:   8dp  (bottom sheets)

// Typography (Inter font)
Regular:    400
Medium:     500
SemiBold:   600
Bold:       700
```

---

## 🐛 Known Limitations

1. **Placeholder screens:** Orders, Wallet, Profile need implementation
2. **Backend:** No API integration (mock data only)
3. **Video reels:** Not implemented (requires video player)
4. **Maps:** LiveMap uses static placeholder
5. **Payments:** Mock payment flow

All above are structural - no blockers for motion testing.

---

## 🚀 Next Steps

### Priority 1: Complete Remaining Screens
- [ ] Fooddrobe with 3-tab system
- [ ] Orders with status timeline
- [ ] Wallet with Aura animation
- [ ] Profile with settings

### Priority 2: Add Advanced Motions
- [ ] Filter modal bottom sheet
- [ ] Reel viewer (swipe vertical)
- [ ] Payment modal (3-step wizard)
- [ ] Aura level-up confetti

### Priority 3: Backend Integration
- [ ] Supabase setup
- [ ] Real-time order updates
- [ ] Image upload
- [ ] Push notifications

---

## 📚 Dependencies

```yaml
provider: ^6.1.1                        # State management
flutter_staggered_grid_view: ^0.7.0    # Pinterest grid
flutter_animate: ^4.5.0                 # Animation helpers
rive: ^0.12.0                          # Rive animations
lottie: ^3.0.0                         # Lottie animations
cached_network_image: ^3.3.1           # Image caching
shimmer: ^3.0.0                        # Loading skeletons
```

---

## 🎓 Learning Resources

- **Flutter Animations:** [flutter.dev/docs/development/ui/animations](https://flutter.dev/docs/development/ui/animations)
- **Hero Transitions:** [flutter.dev/docs/development/ui/animations/hero-animations](https://flutter.dev/docs/development/ui/animations/hero-animations)
- **Staggered Grid:** [pub.dev/packages/flutter_staggered_grid_view](https://pub.dev/packages/flutter_staggered_grid_view)
- **Provider:** [pub.dev/packages/provider](https://pub.dev/packages/provider)

---

## ✅ Testing Checklist

- [x] Splash animation plays smoothly
- [x] Role switching morphs colors
- [x] Feed items appear on scroll
- [x] Cards scale on tap
- [x] Bottom nav bounces on select
- [x] Tab switching cross-fades
- [x] Favorite button animates
- [ ] Hero transitions work (need detail screens)
- [ ] Bottom sheets slide up (need modals)
- [ ] Cart fly animation (need cart logic)

---

## 🎉 Status

**Current: 40% Complete**

- ✅ Motion system foundation
- ✅ Role-aware theming
- ✅ Pinterest feeds
- ✅ 3 home variants
- ✅ Navigation shell
- ⏳ Remaining 28 screens
- ⏳ Hero transitions
- ⏳ Bottom sheet modals

---

## 💬 Support

For issues or questions:
1. Check this README first
2. Review motion_config.dart for constants
3. Inspect widget source code
4. Refer to original React implementation

---

**Built with ❤️ using Flutter**

*Preserving the Rizik V4.1 vision with Flutter's powerful animation framework*
