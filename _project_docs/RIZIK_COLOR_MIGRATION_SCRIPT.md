# 🔄 Rizik Color Migration Script

## Automated Color Migration Plan

This script helps migrate from hardcoded colors to the unified green brand system.

## 📋 Color Mapping Dictionary

```dart
// color_migration_map.dart
final Map<String, String> colorMigrationMap = {
  // ==========================================
  // EXISTING GREEN COLORS → BRAND COLORS
  // ==========================================
  
  // Primary greens
  'Color(0xFF00B16A)': 'RizikBrandColors.money',
  'Color(0xFF00A150)': 'RizikBrandColors.primary',
  'Color(0xFF2E7D32)': 'RizikBrandColors.khata',
  'Color(0xFF4CAF50)': 'RizikBrandColors.fresh',
  'Color(0xFF66BB6A)': 'RizikBrandColors.available',
  'Color(0xFF06D6A0)': 'RizikBrandColors.profit',
  'Color(0xFF00965A)': 'RizikBrandColors.trust',
  'Color(0xFF00C46A)': 'RizikBrandColors.bazar',
  'Color(0xFF32CD32)': 'RizikBrandColors.organic',
  
  // Light variants
  'Color(0xFFE6F4EE)': 'RizikBrandColors.green100',
  'Color(0xFFE8F5E9)': 'RizikBrandColors.green50',
  'Color(0xFFC8E6C9)': 'RizikBrandColors.green100',
  'Color(0xFFE6F7ED)': 'RizikBrandColors.bazarLight',
  
  // Dark variants
  'Color(0xFF008F42)': 'RizikBrandColors.primaryDark',
  'Color(0xFF1B5E20)': 'RizikBrandColors.green800',
  'Color(0xFF388E3C)': 'RizikBrandColors.green700',
  
  // Material Design greens
  'Colors.green': 'RizikBrandColors.success',
  'Colors.green.shade50': 'RizikBrandColors.green50',
  'Colors.green.shade100': 'RizikBrandColors.green100',
  'Colors.green.shade200': 'RizikBrandColors.green200',
  'Colors.green.shade300': 'RizikBrandColors.green300',
  'Colors.green.shade400': 'RizikBrandColors.green400',
  'Colors.green.shade500': 'RizikBrandColors.green500',
  'Colors.green.shade600': 'RizikBrandColors.green600',
  'Colors.green.shade700': 'RizikBrandColors.green700',
  'Colors.green.shade800': 'RizikBrandColors.green800',
  'Colors.green.shade900': 'RizikBrandColors.green900',
  
  // ==========================================
  // CONTEXT-SPECIFIC REPLACEMENTS
  // ==========================================
  
  // Success states
  'Colors.green.withValues(alpha: 0.1)': 'RizikBrandColors.successBackground',
  'Colors.green.withValues(alpha: 0.2)': 'RizikBrandColors.green100',
  'const Color(0xFF28A745)': 'RizikBrandColors.success',
  
  // Trust and verification
  'const Color(0xFF_66BB6A)': 'RizikBrandColors.verified',
  'const Color(0xFF_FFD700)': 'RizikBrandColors.trust', // Gold trust scores
  
  // ==========================================
  // LEGACY RIZIK COLORS
  // ==========================================
  
  // From existing color schemes
  'RizikColorScheme.primary': 'RizikBrandColors.primary',
  'RizikColorScheme.primaryDark': 'RizikBrandColors.primaryDark',
  'RizikColorScheme.primaryLight': 'RizikBrandColors.primaryLight',
  'RizikColorScheme.success': 'RizikBrandColors.success',
  'RizikColorScheme.paddyGreen': 'RizikBrandColors.organic',
  'RizikColorScheme.textileGreen': 'RizikBrandColors.fresh',
  
  // From professional color system
  'RizikColors.rizikGreen': 'RizikBrandColors.primary',
  'RizikColors.success': 'RizikBrandColors.success',
  'const Color(0xFF00B16A)': 'RizikBrandColors.money',
};
```

## 🔧 Migration Script

```bash
#!/bin/bash
# migrate_colors.sh

# Function to replace colors in a file
migrate_file() {
    local file="$1"
    echo "Migrating colors in: $file"
    
    # Add import statement if not present
    if ! grep -q "import.*rizik_brand_colors.dart" "$file"; then
        # Find the last import statement and add our import after it
        sed -i '/^import.*\.dart.*;$/a import '\''../theme/rizik_brand_colors.dart'\'';' "$file"
    fi
    
    # Replace color references
    sed -i 's/Color(0xFF00B16A)/RizikBrandColors.money/g' "$file"
    sed -i 's/Color(0xFF00A150)/RizikBrandColors.primary/g' "$file"
    sed -i 's/Color(0xFF2E7D32)/RizikBrandColors.khata/g' "$file"
    sed -i 's/Color(0xFF4CAF50)/RizikBrandColors.fresh/g' "$file"
    sed -i 's/Color(0xFF66BB6A)/RizikBrandColors.available/g' "$file"
    sed -i 's/Color(0xFF06D6A0)/RizikBrandColors.profit/g' "$file"
    sed -i 's/Color(0xFF00965A)/RizikBrandColors.trust/g' "$file"
    sed -i 's/Color(0xFF00C46A)/RizikBrandColors.bazar/g' "$file"
    
    # Replace light variants
    sed -i 's/Color(0xFFE8F5E9)/RizikBrandColors.green50/g' "$file"
    sed -i 's/Color(0xFFC8E6C9)/RizikBrandColors.green100/g' "$file"
    sed -i 's/Color(0xFFE6F4EE)/RizikBrandColors.partnerLight/g' "$file"
    
    # Replace Material Design colors
    sed -i 's/Colors\.green\.shade600/RizikBrandColors.green600/g' "$file"
    sed -i 's/Colors\.green\.shade800/RizikBrandColors.green800/g' "$file"
    sed -i 's/Colors\.green/RizikBrandColors.success/g' "$file"
    
    echo "✅ Migrated: $file"
}

# Find all Dart files and migrate them
find lib -name "*.dart" -type f | while read file; do
    migrate_file "$file"
done

echo "🎉 Color migration completed!"
```

## 📝 Manual Migration Checklist

### High Priority Files
- [ ] `lib/main.dart` - Update theme
- [ ] `lib/screens/home/consumer_home.dart`
- [ ] `lib/screens/home/partner_home.dart`
- [ ] `lib/screens/home/rider_home.dart`
- [ ] `lib/widgets/bottom_nav.dart`
- [ ] `lib/widgets/global_header.dart`
- [ ] `lib/widgets/frosted_drawer.dart`

### Feature Screens
- [ ] `lib/screens/khata_os_*.dart`
- [ ] `lib/screens/fooddrobe_screen.dart`
- [ ] `lib/screens/wallet_screen.dart`
- [ ] `lib/screens/orders_screen.dart`
- [ ] `lib/screens/squad/*.dart`

### Widget Components
- [ ] `lib/widgets/feed_cards.dart`
- [ ] `lib/widgets/trust_score_*.dart`
- [ ] `lib/widgets/rider_mission_card.dart`
- [ ] `lib/widgets/infinite_meal_calendar.dart`
- [ ] `lib/widgets/khata_*.dart`

## 🔍 Verification Script

```dart
// verify_migration.dart
import 'dart:io';

void main() {
  final libDir = Directory('lib');
  final hardcodedGreenPattern = RegExp(r'Color\(0xFF[0-9A-F]{2}[A-B][0-9A-F]{1}[0-9A-F]{2}\)');
  
  libDir.listSync(recursive: true).forEach((file) {
    if (file.path.endsWith('.dart')) {
      final content = File(file.path).readAsStringSync();
      final matches = hardcodedGreenPattern.allMatches(content);
      
      if (matches.isNotEmpty) {
        print('⚠️  Found hardcoded green colors in: ${file.path}');
        matches.forEach((match) {
          print('   - ${match.group(0)}');
        });
      }
    }
  });
  
  print('✅ Migration verification completed!');
}
```

## 📊 Migration Progress Tracker

```dart
// migration_progress.dart
class MigrationProgress {
  static const Map<String, bool> filesMigrated = {
    // Core files
    'lib/main.dart': false,
    'lib/theme/rizik_theme.dart': true,
    'lib/theme/rizik_brand_colors.dart': true,
    
    // Home screens
    'lib/screens/home/consumer_home.dart': false,
    'lib/screens/home/partner_home.dart': true, // Already updated
    'lib/screens/home/rider_home.dart': false,
    
    // Feature screens
    'lib/screens/khata_os_final.dart': false,
    'lib/screens/fooddrobe_screen.dart': false,
    'lib/screens/wallet_screen.dart': false,
    'lib/screens/orders_screen.dart': false,
    
    // Widgets
    'lib/widgets/bottom_nav.dart': false,
    'lib/widgets/global_header.dart': false,
    'lib/widgets/frosted_drawer.dart': true, // Partially updated
    'lib/widgets/feed_cards.dart': false,
    'lib/widgets/trust_score_warning.dart': false,
    'lib/widgets/rider_mission_card.dart': true, // Already updated
    'lib/widgets/infinite_meal_calendar.dart': false,
    'lib/widgets/khata_page.dart': false,
  };
  
  static double get completionPercentage {
    final completed = filesMigrated.values.where((v) => v).length;
    return (completed / filesMigrated.length) * 100;
  }
  
  static List<String> get remainingFiles {
    return filesMigrated.entries
        .where((entry) => !entry.value)
        .map((entry) => entry.key)
        .toList();
  }
}
```

## 🎯 Testing After Migration

### 1. Visual Testing
```dart
// Run visual regression tests
flutter test test/visual_regression_test.dart
```

### 2. Accessibility Testing
```dart
// Test contrast ratios
flutter test test/accessibility_test.dart
```

### 3. Performance Testing
```dart
// Measure color rendering performance
flutter test test/performance_test.dart
```

## 🚀 Deployment Strategy

### 1. Gradual Rollout
- Deploy to staging environment first
- A/B test with small user group
- Monitor for visual inconsistencies
- Full production deployment

### 2. Rollback Plan
- Keep backup of original color files
- Feature flag for new color system
- Quick rollback mechanism if issues arise

### 3. Monitoring
- Track user feedback on new colors
- Monitor app performance metrics
- Check accessibility compliance

This migration script and plan ensures a smooth transition to the unified green brand color system while maintaining app stability and user experience.