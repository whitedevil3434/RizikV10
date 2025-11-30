import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Handles deep link navigation logic for Rizik V7.1
class DeepLinkHandler {
  // Scheme and Host definitions
  static const String scheme = 'rizik';
  static const String host = 'app';

  /// Initialize deep link handling
  /// Note: GoRouter handles most platform deep linking automatically
  /// This method is for custom handling or logging
  static Future<void> init() async {
    // Initialize any specific deep link listeners if needed
    debugPrint('🔗 DeepLinkHandler initialized');
  }

  /// Handle a raw link string and navigate
  static void handleLink(BuildContext context, String link) {
    try {
      final uri = Uri.parse(link);
      if (uri.scheme == scheme && uri.host == host) {
        final path = uri.path;
        final queryParams = uri.queryParameters;
        
        debugPrint('🔗 Handling deep link: $path with params: $queryParams');
        
        // Navigate using GoRouter
        if (queryParams.isNotEmpty) {
          context.go(Uri(path: path, queryParameters: queryParams).toString());
        } else {
          context.go(path);
        }
      }
    } catch (e) {
      debugPrint('⚠️ Error handling deep link: $e');
    }
  }
}
