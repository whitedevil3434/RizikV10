import 'package:flutter/foundation.dart';

/// Parser for live commerce comments to extract order intent
/// Handles Bengali and English patterns like "2 plate dao", "3টা চাই"
class LiveCommerceCommentParser {
  // Bengali number words
  static const Map<String, int> bengaliNumbers = {
    'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5,
    'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'দশ': 10,
    '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5,
    '৬': 6, '৭': 7, '৮': 8, '৯': 9, '১০': 10,
  };

  // English number words
  static const Map<String, int> englishNumbers = {
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  };

  // Order intent keywords (Bengali)
  static const List<String> bengaliOrderKeywords = [
    'চাই', 'দাও', 'দিও', 'নিবো', 'নেবো', 'অর্ডার', 'কিনবো',
    'পাঠাও', 'দিন', 'দেন', 'লাগবে', 'হবে'
  ];

  // Order intent keywords (English)
  static const List<String> englishOrderKeywords = [
    'want', 'need', 'order', 'buy', 'get', 'send', 'give',
    'take', 'please', 'pls', 'plz'
  ];

  // Unit keywords (Bengali)
  static const List<String> bengaliUnits = [
    'টা', 'টি', 'খানা', 'খানি', 'প্লেট', 'পিস', 'বক্স', 'প্যাকেট'
  ];

  // Unit keywords (English)
  static const List<String> englishUnits = [
    'plate', 'plates', 'piece', 'pieces', 'box', 'boxes',
    'packet', 'packets', 'pack', 'packs', 'pc', 'pcs'
  ];

  /// Parse comment and extract order intent
  OrderIntent? parseComment(String comment, {String? itemName}) {
    if (comment.trim().isEmpty) return null;

    final normalized = comment.toLowerCase().trim();
    
    // Check if comment contains order intent
    if (!_hasOrderIntent(normalized)) {
      return null;
    }

    // Extract quantity
    final quantity = _extractQuantity(normalized);
    if (quantity == null || quantity <= 0) {
      return null;
    }

    // Extract item name if not provided
    final extractedItem = itemName ?? _extractItemName(normalized);

    debugPrint('📝 Parsed order: $quantity x $extractedItem from "$comment"');

    return OrderIntent(
      quantity: quantity,
      itemName: extractedItem,
      originalComment: comment,
      confidence: _calculateConfidence(normalized, quantity, extractedItem),
      language: _detectLanguage(normalized),
    );
  }

  /// Check if comment has order intent
  bool _hasOrderIntent(String comment) {
    // Check Bengali keywords
    for (final keyword in bengaliOrderKeywords) {
      if (comment.contains(keyword)) return true;
    }

    // Check English keywords
    for (final keyword in englishOrderKeywords) {
      if (comment.contains(keyword)) return true;
    }

    return false;
  }

  /// Extract quantity from comment
  int? _extractQuantity(String comment) {
    // Try to extract numeric quantity (1-9, 10)
    final numericMatch = RegExp(r'\b(\d+)\b').firstMatch(comment);
    if (numericMatch != null) {
      return int.tryParse(numericMatch.group(1)!);
    }

    // Try Bengali numbers
    for (final entry in bengaliNumbers.entries) {
      if (comment.contains(entry.key)) {
        return entry.value;
      }
    }

    // Try English number words
    for (final entry in englishNumbers.entries) {
      if (comment.contains(entry.key)) {
        return entry.value;
      }
    }

    // Default to 1 if order intent is clear but no quantity specified
    return 1;
  }

  /// Extract item name from comment
  String _extractItemName(String comment) {
    // This is a simplified version
    // In production, this would use NLP or a trained model
    
    // Remove common words and extract potential item name
    final words = comment.split(' ');
    final filtered = words.where((word) {
      return !bengaliOrderKeywords.contains(word) &&
             !englishOrderKeywords.contains(word) &&
             !bengaliUnits.contains(word) &&
             !englishUnits.contains(word) &&
             !bengaliNumbers.containsKey(word) &&
             !englishNumbers.containsKey(word) &&
             !RegExp(r'^\d+$').hasMatch(word);
    }).toList();

    return filtered.isNotEmpty ? filtered.join(' ') : 'item';
  }

  /// Calculate confidence score (0.0 - 1.0)
  double _calculateConfidence(String comment, int quantity, String itemName) {
    double confidence = 0.5; // Base confidence

    // Boost if quantity is explicit
    if (RegExp(r'\b\d+\b').hasMatch(comment)) {
      confidence += 0.2;
    }

    // Boost if unit is specified
    final hasUnit = bengaliUnits.any((unit) => comment.contains(unit)) ||
                    englishUnits.any((unit) => comment.contains(unit));
    if (hasUnit) {
      confidence += 0.15;
    }

    // Boost if item name is meaningful
    if (itemName.length > 3 && itemName != 'item') {
      confidence += 0.15;
    }

    return confidence.clamp(0.0, 1.0);
  }

  /// Detect language of comment
  CommentLanguage _detectLanguage(String comment) {
    // Check for Bengali characters
    final hasBengali = RegExp(r'[\u0980-\u09FF]').hasMatch(comment);
    
    // Check for English characters
    final hasEnglish = RegExp(r'[a-zA-Z]').hasMatch(comment);

    if (hasBengali && hasEnglish) {
      return CommentLanguage.mixed;
    } else if (hasBengali) {
      return CommentLanguage.bengali;
    } else if (hasEnglish) {
      return CommentLanguage.english;
    } else {
      return CommentLanguage.unknown;
    }
  }

  /// Parse multiple comments in batch
  List<OrderIntent> parseComments(
    List<String> comments, {
    String? itemName,
    double minConfidence = 0.5,
  }) {
    final intents = <OrderIntent>[];

    for (final comment in comments) {
      final intent = parseComment(comment, itemName: itemName);
      if (intent != null && intent.confidence >= minConfidence) {
        intents.add(intent);
      }
    }

    return intents;
  }

  /// Create pending order from comment
  PendingOrder? createPendingOrder({
    required String commentId,
    required String userId,
    required String userName,
    required String videoId,
    required OrderIntent intent,
    String? itemId,
    double? itemPrice,
  }) {
    if (intent.confidence < 0.5) {
      debugPrint('⚠️ Low confidence order intent: ${intent.confidence}');
      return null;
    }

    return PendingOrder(
      id: _generateOrderId(),
      commentId: commentId,
      userId: userId,
      userName: userName,
      videoId: videoId,
      itemId: itemId,
      itemName: intent.itemName,
      quantity: intent.quantity,
      itemPrice: itemPrice,
      totalPrice: itemPrice != null ? itemPrice * intent.quantity : null,
      originalComment: intent.originalComment,
      confidence: intent.confidence,
      language: intent.language,
      createdAt: DateTime.now(),
      status: PendingOrderStatus.pending,
    );
  }

  /// Generate unique order ID
  String _generateOrderId() {
    return 'PO_${DateTime.now().millisecondsSinceEpoch}';
  }

  /// Validate order intent
  bool validateIntent(OrderIntent intent, {double minConfidence = 0.5}) {
    return intent.confidence >= minConfidence &&
           intent.quantity > 0 &&
           intent.quantity <= 100 && // Reasonable max
           intent.itemName.isNotEmpty;
  }
}

/// Detected order intent from comment
class OrderIntent {
  final int quantity;
  final String itemName;
  final String originalComment;
  final double confidence;
  final CommentLanguage language;

  const OrderIntent({
    required this.quantity,
    required this.itemName,
    required this.originalComment,
    required this.confidence,
    required this.language,
  });

  Map<String, dynamic> toJson() {
    return {
      'quantity': quantity,
      'item_name': itemName,
      'original_comment': originalComment,
      'confidence': confidence,
      'language': language.key,
    };
  }
}

/// Comment language detection
enum CommentLanguage {
  bengali('bengali', 'বাংলা'),
  english('english', 'English'),
  mixed('mixed', 'Mixed'),
  unknown('unknown', 'Unknown');

  const CommentLanguage(this.key, this.label);
  final String key;
  final String label;
}

/// Pending order from live commerce comment
class PendingOrder {
  final String id;
  final String commentId;
  final String userId;
  final String userName;
  final String videoId;
  final String? itemId;
  final String itemName;
  final int quantity;
  final double? itemPrice;
  final double? totalPrice;
  final String originalComment;
  final double confidence;
  final CommentLanguage language;
  final DateTime createdAt;
  final PendingOrderStatus status;
  final DateTime? confirmedAt;
  final DateTime? cancelledAt;

  const PendingOrder({
    required this.id,
    required this.commentId,
    required this.userId,
    required this.userName,
    required this.videoId,
    this.itemId,
    required this.itemName,
    required this.quantity,
    this.itemPrice,
    this.totalPrice,
    required this.originalComment,
    required this.confidence,
    required this.language,
    required this.createdAt,
    required this.status,
    this.confirmedAt,
    this.cancelledAt,
  });

  /// Check if order is expired (30 minutes)
  bool get isExpired {
    return DateTime.now().difference(createdAt) > const Duration(minutes: 30);
  }

  /// Check if order needs confirmation
  bool get needsConfirmation {
    return status == PendingOrderStatus.pending && !isExpired;
  }

  PendingOrder copyWith({
    String? id,
    String? commentId,
    String? userId,
    String? userName,
    String? videoId,
    String? itemId,
    String? itemName,
    int? quantity,
    double? itemPrice,
    double? totalPrice,
    String? originalComment,
    double? confidence,
    CommentLanguage? language,
    DateTime? createdAt,
    PendingOrderStatus? status,
    DateTime? confirmedAt,
    DateTime? cancelledAt,
  }) {
    return PendingOrder(
      id: id ?? this.id,
      commentId: commentId ?? this.commentId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      videoId: videoId ?? this.videoId,
      itemId: itemId ?? this.itemId,
      itemName: itemName ?? this.itemName,
      quantity: quantity ?? this.quantity,
      itemPrice: itemPrice ?? this.itemPrice,
      totalPrice: totalPrice ?? this.totalPrice,
      originalComment: originalComment ?? this.originalComment,
      confidence: confidence ?? this.confidence,
      language: language ?? this.language,
      createdAt: createdAt ?? this.createdAt,
      status: status ?? this.status,
      confirmedAt: confirmedAt ?? this.confirmedAt,
      cancelledAt: cancelledAt ?? this.cancelledAt,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'comment_id': commentId,
      'user_id': userId,
      'user_name': userName,
      'video_id': videoId,
      'item_id': itemId,
      'item_name': itemName,
      'quantity': quantity,
      'item_price': itemPrice,
      'total_price': totalPrice,
      'original_comment': originalComment,
      'confidence': confidence,
      'language': language.key,
      'created_at': createdAt.toIso8601String(),
      'status': status.key,
      'confirmed_at': confirmedAt?.toIso8601String(),
      'cancelled_at': cancelledAt?.toIso8601String(),
    };
  }
}

/// Pending order status
enum PendingOrderStatus {
  pending('pending', 'Pending Confirmation'),
  confirmed('confirmed', 'Confirmed'),
  cancelled('cancelled', 'Cancelled'),
  expired('expired', 'Expired');

  const PendingOrderStatus(this.key, this.label);
  final String key;
  final String label;
}
