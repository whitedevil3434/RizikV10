import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/trust_score.dart';
import 'package:rizik_v4/data/remote/trust_notification_service.dart';

/// Service for checking trust score requirements and enforcing restrictions
class TrustScoreCheckService {
  // Minimum trust scores for various features
  static const double minScoreForOrders = 2.0;
  static const double minScoreForRizikDhaar = 4.0;
  static const double minScoreForSquads = 3.5;
  static const double minScoreForPremiumMissions = 4.0;
  static const double minScoreForMoverFloat = 3.8;
  static const double minScoreForHyperlocalServices = 3.0;

  /// Check if user can place orders
  static bool canPlaceOrder(TrustScore trustScore) {
    return trustScore.overall >= minScoreForOrders;
  }

  /// Check if user can access Rizik Dhaar (micro-lending)
  static bool canAccessRizikDhaar(TrustScore trustScore) {
    return trustScore.overall >= minScoreForRizikDhaar;
  }

  /// Check if user can create or join squads
  static bool canAccessSquads(TrustScore trustScore) {
    return trustScore.overall >= minScoreForSquads;
  }

  /// Check if user can access premium missions
  static bool canAccessPremiumMissions(TrustScore trustScore) {
    return trustScore.overall >= minScoreForPremiumMissions;
  }

  /// Check if user can access mover float
  static bool canAccessMoverFloat(TrustScore trustScore) {
    return trustScore.overall >= minScoreForMoverFloat;
  }

  /// Check if user can offer hyperlocal services
  static bool canOfferHyperlocalServices(TrustScore trustScore) {
    return trustScore.overall >= minScoreForHyperlocalServices;
  }

  /// Calculate maximum order amount based on trust score
  static double getMaxOrderAmount(TrustScore trustScore) {
    if (trustScore.overall >= 4.5) return double.infinity; // No limit
    if (trustScore.overall >= 4.0) return 5000.0;
    if (trustScore.overall >= 3.5) return 3000.0;
    if (trustScore.overall >= 3.0) return 2000.0;
    if (trustScore.overall >= 2.5) return 1000.0;
    return 500.0; // Minimum for users with low scores
  }

  /// Calculate maximum loan amount for Rizik Dhaar
  static double getMaxLoanAmount(TrustScore trustScore) {
    if (!canAccessRizikDhaar(trustScore)) return 0.0;
    
    if (trustScore.overall >= 4.8) return 50000.0;
    if (trustScore.overall >= 4.5) return 30000.0;
    if (trustScore.overall >= 4.2) return 20000.0;
    return 10000.0;
  }

  /// Calculate daily float limit for movers
  static double getDailyFloatLimit(TrustScore trustScore) {
    if (!canAccessMoverFloat(trustScore)) return 0.0;
    
    if (trustScore.overall >= 4.8) return 5000.0;
    if (trustScore.overall >= 4.5) return 3000.0;
    if (trustScore.overall >= 4.0) return 2000.0;
    return 1000.0;
  }

  /// Show restriction dialog if feature is not accessible
  static void checkAndShowRestriction({
    required BuildContext context,
    required TrustScore trustScore,
    required String featureName,
    required double requiredScore,
    bool showBengali = false,
  }) {
    if (trustScore.overall < requiredScore) {
      TrustNotificationService.showFeatureRestrictionDialog(
        context,
        featureName: featureName,
        currentScore: trustScore,
        requiredScore: requiredScore,
        showBengali: showBengali,
      );
    }
  }

  /// Get list of restricted features for current trust score
  static List<RestrictedFeature> getRestrictedFeatures(TrustScore trustScore) {
    final restricted = <RestrictedFeature>[];

    if (!canAccessRizikDhaar(trustScore)) {
      restricted.add(RestrictedFeature(
        name: 'Rizik Dhaar',
        nameBn: 'রিজিক ধার',
        description: 'Micro-lending access',
        descriptionBn: 'মাইক্রো-লেন্ডিং সুবিধা',
        requiredScore: minScoreForRizikDhaar,
        icon: Icons.credit_card,
      ));
    }

    if (!canAccessSquads(trustScore)) {
      restricted.add(RestrictedFeature(
        name: 'Squad System',
        nameBn: 'স্কোয়াড সিস্টেম',
        description: 'Team creation and management',
        descriptionBn: 'টিম তৈরি এবং পরিচালনা',
        requiredScore: minScoreForSquads,
        icon: Icons.groups,
      ));
    }

    if (!canAccessPremiumMissions(trustScore)) {
      restricted.add(RestrictedFeature(
        name: 'Premium Missions',
        nameBn: 'প্রিমিয়াম মিশন',
        description: 'High-value deliveries',
        descriptionBn: 'উচ্চ-মূল্যের ডেলিভারি',
        requiredScore: minScoreForPremiumMissions,
        icon: Icons.local_shipping,
      ));
    }

    if (!canAccessMoverFloat(trustScore)) {
      restricted.add(RestrictedFeature(
        name: 'Mover Float',
        nameBn: 'মুভার ফ্লোট',
        description: 'Daily advance for operational costs',
        descriptionBn: 'দৈনিক অগ্রিম খরচ',
        requiredScore: minScoreForMoverFloat,
        icon: Icons.account_balance_wallet,
      ));
    }

    if (!canOfferHyperlocalServices(trustScore)) {
      restricted.add(RestrictedFeature(
        name: 'Hyperlocal Services',
        nameBn: 'হাইপারলোকাল সেবা',
        description: 'Offer services to neighbors',
        descriptionBn: 'প্রতিবেশীদের সেবা প্রদান',
        requiredScore: minScoreForHyperlocalServices,
        icon: Icons.handyman,
      ));
    }

    return restricted;
  }

  /// Check if user should see warning banner
  static bool shouldShowWarningBanner(TrustScore trustScore) {
    return trustScore.overall < 3.0;
  }

  /// Get warning severity level
  static WarningSeverity getWarningSeverity(TrustScore trustScore) {
    if (trustScore.overall >= 3.0) return WarningSeverity.none;
    if (trustScore.overall >= 2.5) return WarningSeverity.low;
    if (trustScore.overall >= 2.0) return WarningSeverity.medium;
    return WarningSeverity.high;
  }

  /// Get warning message based on severity
  static String getWarningMessage(TrustScore trustScore, {bool showBengali = false}) {
    final severity = getWarningSeverity(trustScore);
    
    switch (severity) {
      case WarningSeverity.high:
        return showBengali
            ? 'জরুরি: আপনার ট্রাস্ট স্কোর খুবই কম। অনেক ফিচার সীমাবদ্ধ করা হয়েছে।'
            : 'Critical: Your trust score is very low. Many features are restricted.';
      case WarningSeverity.medium:
        return showBengali
            ? 'সতর্কতা: আপনার ট্রাস্ট স্কোর কম। কিছু ফিচার সীমাবদ্ধ।'
            : 'Warning: Your trust score is low. Some features are restricted.';
      case WarningSeverity.low:
        return showBengali
            ? 'মনোযোগ: আপনার ট্রাস্ট স্কোর উন্নতি প্রয়োজন।'
            : 'Attention: Your trust score needs improvement.';
      case WarningSeverity.none:
        return '';
    }
  }

  /// Get escalation actions based on trust score
  static List<EscalationAction> getEscalationActions(TrustScore trustScore) {
    final actions = <EscalationAction>[];

    if (trustScore.overall < 2.0) {
      actions.add(EscalationAction(
        type: EscalationActionType.accountReview,
        message: 'Account under review',
        messageBn: 'অ্যাকাউন্ট পর্যালোচনাধীন',
        severity: WarningSeverity.high,
      ));
    }

    if (trustScore.overall < 2.5) {
      actions.add(EscalationAction(
        type: EscalationActionType.featureRestriction,
        message: 'Premium features restricted',
        messageBn: 'প্রিমিয়াম ফিচার সীমাবদ্ধ',
        severity: WarningSeverity.medium,
      ));
    }

    if (trustScore.overall < 3.0) {
      actions.add(EscalationAction(
        type: EscalationActionType.warningNotification,
        message: 'Improvement required',
        messageBn: 'উন্নতি প্রয়োজন',
        severity: WarningSeverity.low,
      ));
    }

    return actions;
  }
}

/// Restricted feature model
class RestrictedFeature {
  final String name;
  final String nameBn;
  final String description;
  final String descriptionBn;
  final double requiredScore;
  final IconData icon;

  RestrictedFeature({
    required this.name,
    required this.nameBn,
    required this.description,
    required this.descriptionBn,
    required this.requiredScore,
    required this.icon,
  });
}

/// Warning severity levels
enum WarningSeverity {
  none,
  low,
  medium,
  high,
}

/// Escalation action types
enum EscalationActionType {
  warningNotification,
  featureRestriction,
  accountReview,
  accountSuspension,
}

/// Escalation action model
class EscalationAction {
  final EscalationActionType type;
  final String message;
  final String messageBn;
  final WarningSeverity severity;

  EscalationAction({
    required this.type,
    required this.message,
    required this.messageBn,
    required this.severity,
  });
}
