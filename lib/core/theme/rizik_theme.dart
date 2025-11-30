import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
import 'package:rizik_v4/data/models/user_role.dart';

/// 🎨 Rizik Unified Theme System
/// 
/// Integrates the green brand color system with Material Design 3
/// to create a cohesive, professional, and accessible theme.
class RizikTheme {
  
  // ==========================================
  // LIGHT THEME
  // ==========================================
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      
      // Color scheme based on green brand colors
      colorScheme: ColorScheme.fromSeed(
        seedColor: RizikBrandColors.primary,
        brightness: Brightness.light,
        
        // Primary colors
        primary: RizikBrandColors.primary,
        onPrimary: Colors.white,
        primaryContainer: RizikBrandColors.green100,
        onPrimaryContainer: RizikBrandColors.green800,
        
        // Secondary colors
        secondary: RizikBrandColors.green600,
        onSecondary: Colors.white,
        secondaryContainer: RizikBrandColors.green50,
        onSecondaryContainer: RizikBrandColors.green700,
        
        // Tertiary colors
        tertiary: RizikBrandColors.green400,
        onTertiary: Colors.white,
        tertiaryContainer: RizikBrandColors.green100,
        onTertiaryContainer: RizikBrandColors.green800,
        
        // Surface colors
        surface: Colors.white,
        onSurface: const Color(0xFF1C1C1E),
        surfaceVariant: const Color(0xFFF8F9FA),
        onSurfaceVariant: const Color(0xFF6E6E73),
        
        // Background colors
        background: const Color(0xFFF8F9FA),
        onBackground: const Color(0xFF1C1C1E),
        
        // Error colors
        error: const Color(0xFFD32F2F),
        onError: Colors.white,
        errorContainer: const Color(0xFFFFEBEE),
        onErrorContainer: const Color(0xFFB71C1C),
        
        // Outline colors
        outline: const Color(0xFFE5E5EA),
        outlineVariant: const Color(0xFFF0F0F0),
        
        // Shadow and overlay
        shadow: Colors.black,
        scrim: Colors.black,
        inverseSurface: const Color(0xFF1C1C1E),
        onInverseSurface: Colors.white,
        inversePrimary: RizikBrandColors.green200,
      ),
      
      // Typography
      fontFamily: 'Inter',
      fontFamilyFallback: const ['Noto Sans Bengali', 'sans-serif'],
      
      // App bar theme
      appBarTheme: AppBarTheme(
        elevation: 0,
        centerTitle: false,
        backgroundColor: Colors.white,
        foregroundColor: const Color(0xFF1C1C1E),
        surfaceTintColor: Colors.transparent,
        systemOverlayStyle: const SystemUiOverlayStyle(
          statusBarColor: Colors.transparent,
          statusBarIconBrightness: Brightness.dark,
        ),
        titleTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Color(0xFF1C1C1E),
        ),
      ),
      
      // Card theme
      // Card theme
      /* cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        shadowColor: Colors.black.withValues(alpha: 0.05),
        color: Colors.white,
        surfaceTintColor: Colors.transparent,
      ), */
      
      // Button themes
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: RizikBrandColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ).copyWith(
          backgroundColor: MaterialStateProperty.resolveWith((states) {
            if (states.contains(MaterialState.pressed)) {
              return RizikBrandColors.buttonPressed;
            }
            if (states.contains(MaterialState.hovered)) {
              return RizikBrandColors.buttonHover;
            }
            if (states.contains(MaterialState.disabled)) {
              return RizikBrandColors.buttonDisabled;
            }
            return RizikBrandColors.buttonPrimary;
          }),
        ),
      ),
      
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: RizikBrandColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
          textStyle: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: RizikBrandColors.primary,
          side: BorderSide(color: RizikBrandColors.green200),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
      
      // Floating Action Button theme
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: RizikBrandColors.primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      
      // Chip theme
      chipTheme: ChipThemeData(
        backgroundColor: RizikBrandColors.green50,
        labelStyle: TextStyle(color: RizikBrandColors.green700),
        selectedColor: RizikBrandColors.primary,
        checkmarkColor: Colors.white,
        deleteIconColor: RizikBrandColors.green600,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
      ),
      
      // Progress indicator theme
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: RizikBrandColors.primary,
        linearTrackColor: RizikBrandColors.green100,
        circularTrackColor: RizikBrandColors.green100,
      ),
      
      // Switch theme
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return RizikBrandColors.primary;
          }
          return Colors.grey;
        }),
        trackColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return RizikBrandColors.green200;
          }
          return Colors.grey.shade300;
        }),
      ),
      
      // Checkbox theme
      checkboxTheme: CheckboxThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return RizikBrandColors.primary;
          }
          return Colors.transparent;
        }),
        checkColor: MaterialStateProperty.all(Colors.white),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(4),
        ),
      ),
      
      // Radio theme
      radioTheme: RadioThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return RizikBrandColors.primary;
          }
          return Colors.grey;
        }),
      ),
      
      // Slider theme
      sliderTheme: SliderThemeData(
        activeTrackColor: RizikBrandColors.primary,
        inactiveTrackColor: RizikBrandColors.green100,
        thumbColor: RizikBrandColors.primary,
        overlayColor: RizikBrandColors.green100,
        valueIndicatorColor: RizikBrandColors.primary,
        valueIndicatorTextStyle: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
      
      // Input decoration theme
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: RizikBrandColors.green200),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: RizikBrandColors.green200),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: RizikBrandColors.primary, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD32F2F)),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFFD32F2F), width: 2),
        ),
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        labelStyle: TextStyle(color: RizikBrandColors.green600),
        hintStyle: const TextStyle(color: Color(0xFF8E8E93)),
      ),
      
      // Bottom navigation bar theme
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: RizikBrandColors.primary,
        unselectedItemColor: const Color(0xFF8E8E93),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
        selectedLabelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
      
      // Tab bar theme
      // Tab bar theme
      /* tabBarTheme: TabBarTheme(
        labelColor: RizikBrandColors.primary,
        unselectedLabelColor: const Color(0xFF8E8E93),
        indicator: UnderlineTabIndicator(
          borderSide: BorderSide(color: RizikBrandColors.primary, width: 2),
        ),
        labelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
      ), */
      
      // Snack bar theme
      snackBarTheme: SnackBarThemeData(
        backgroundColor: RizikBrandColors.green800,
        contentTextStyle: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        actionTextColor: RizikBrandColors.green200,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        behavior: SnackBarBehavior.floating,
      ),
      
      // Dialog theme
      /* dialogTheme: DialogTheme(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        elevation: 8,
        titleTextStyle: const TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.w600,
          color: Color(0xFF1C1C1E),
        ),
        contentTextStyle: const TextStyle(
          fontSize: 16,
          color: Color(0xFF6E6E73),
        ),
      ), */
      
      // Bottom sheet theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        elevation: 8,
      ),
      
      // List tile theme
      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        selectedTileColor: RizikBrandColors.green50,
        selectedColor: RizikBrandColors.primary,
        iconColor: const Color(0xFF6E6E73),
        textColor: const Color(0xFF1C1C1E),
      ),
      
      // Divider theme
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE5E5EA),
        thickness: 0.5,
        space: 1,
      ),
    );
  }
  
  // ==========================================
  // DARK THEME (Future implementation)
  // ==========================================
  
  static ThemeData get darkTheme {
    // TODO: Implement dark theme with green brand colors
    return lightTheme; // Placeholder
  }
  
  // ==========================================
  // ROLE-SPECIFIC THEME VARIATIONS
  // ==========================================
  
  /// Get theme with role-specific green accent
  static ThemeData getThemeForRole(UserRole role) {
    final baseTheme = lightTheme;
    final roleGreen = RizikBrandColors.getRoleGreen(role);
    
    return baseTheme.copyWith(
      colorScheme: baseTheme.colorScheme.copyWith(
        primary: roleGreen,
        primaryContainer: RizikBrandColors.getRoleGreenLight(role),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: baseTheme.elevatedButtonTheme.style?.copyWith(
          backgroundColor: MaterialStateProperty.all(roleGreen),
        ),
      ),
      floatingActionButtonTheme: baseTheme.floatingActionButtonTheme.copyWith(
        backgroundColor: roleGreen,
      ),
    );
  }
  
  // ==========================================
  // FEATURE-SPECIFIC THEME VARIATIONS
  // ==========================================
  
  /// Get theme with feature-specific green accent
  static ThemeData getThemeForFeature(String feature) {
    final baseTheme = lightTheme;
    final featureGreen = RizikBrandColors.getFeatureGreen(feature);
    
    return baseTheme.copyWith(
      colorScheme: baseTheme.colorScheme.copyWith(
        primary: featureGreen,
      ),
    );
  }
}