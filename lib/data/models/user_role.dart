import 'package:flutter/material.dart';

enum UserRole {
  consumer,
  partner,
  rider;

  String get displayName {
    switch (this) {
      case UserRole.consumer:
        return 'Rizik Seeker';
      case UserRole.partner:
        return 'Rizik Source';
      case UserRole.rider:
        return 'Rizik Force';
    }
  }

  String get displayNameBn {
    switch (this) {
      case UserRole.consumer:
        return 'রিজিক সিকার';
      case UserRole.partner:
        return 'রিজিক সোর্স';
      case UserRole.rider:
        return 'রিজিক ফোর্স';
    }
  }

  String get tagline {
    switch (this) {
      case UserRole.consumer:
        return 'Eat, Feel & Share.';
      case UserRole.partner:
        return 'Cook. Create. Earn.';
      case UserRole.rider:
        return 'Deliver. Hustle. Rise.';
    }
  }

  String get taglineBn {
    switch (this) {
      case UserRole.consumer:
        return 'খাও, অনুভব করো এবং শেয়ার করো।';
      case UserRole.partner:
        return 'রান্না করো। সৃষ্টি করো। আয় করো।';
      case UserRole.rider:
        return 'ডেলিভার করো। হাসেল করো। উঠে দাঁড়াও।';
    }
  }

  Color get primaryColor {
    // Use Rizik Green as the primary action color for all roles
    return const Color(0xFF00B16A); // Rizik Green
  }

  LinearGradient get gradient {
    // Use Rizik Green gradient for all roles
    return const LinearGradient(
      colors: [Color(0xFF00B16A), Color(0xFF00965A)], // Rizik Green gradient
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    );
  }

  String get emoji {
    switch (this) {
      case UserRole.consumer:
        return '🛒';
      case UserRole.partner:
        return '👨‍🍳';
      case UserRole.rider:
        return '🏍️';
    }
  }

  String get defaultAvatar {
    // Return placeholder identifier - will be handled by UI components
    switch (this) {
      case UserRole.consumer:
        return 'placeholder_female';
      case UserRole.partner:
        return 'placeholder_male';
      case UserRole.rider:
        return 'placeholder_male';
    }
  }


}

class RoleTheme {
  final Color primary;
  final LinearGradient gradient;
  final String tagline;
  final String taglineBn;

  const RoleTheme({
    required this.primary,
    required this.gradient,
    required this.tagline,
    required this.taglineBn,
  });
}