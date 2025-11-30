import 'package:flutter/material.dart';

/// 🎯 Pinnable Object Types
/// 
/// V8 Phase 7: Object-Oriented Chat
/// Objects that can be pinned to chat conversations for context-rich discussions.
enum PinnableObjectType {
  bid,
  order,
  product,
  event,
  invoice,
}

/// 🎬 Object Actions
/// 
/// Quick actions available for pinned objects.
enum ObjectAction {
  // Bid actions
  accept,
  counter,
  decline,
  
  // Order actions
  track,
  modify,
  cancel,
  
  // Product actions
  addToCart,
  askQuestion,
  payNow,
  makeOffer,
  
  // Universal actions
  viewDetails,
  share,
  contact,
}

extension ObjectActionExtension on ObjectAction {
  String get label {
    switch (this) {
      case ObjectAction.accept:
        return 'Accept';
      case ObjectAction.counter:
        return 'Counter';
      case ObjectAction.decline:
        return 'Decline';
      case ObjectAction.track:
        return 'Track';
      case ObjectAction.modify:
        return 'Modify';
      case ObjectAction.cancel:
        return 'Cancel';
      case ObjectAction.addToCart:
        return 'Add to Cart';
      case ObjectAction.askQuestion:
        return 'Ask Question';
      case ObjectAction.payNow:
        return 'Pay Now';
      case ObjectAction.makeOffer:
        return 'Make Offer';
      case ObjectAction.viewDetails:
        return 'View Details';
      case ObjectAction.share:
        return 'Share';
      case ObjectAction.contact:
        return 'Contact';
    }
  }
  
  IconData get icon {
    switch (this) {
      case ObjectAction.accept:
        return Icons.check_circle;
      case ObjectAction.counter:
        return Icons.swap_horiz;
      case ObjectAction.decline:
        return Icons.cancel;
      case ObjectAction.track:
        return Icons.local_shipping;
      case ObjectAction.modify:
        return Icons.edit;
      case ObjectAction.cancel:
        return Icons.close;
      case ObjectAction.addToCart:
        return Icons.shopping_cart;
      case ObjectAction.askQuestion:
        return Icons.help_outline;
      case ObjectAction.payNow:
        return Icons.payment;
      case ObjectAction.makeOffer:
        return Icons.local_offer;
      case ObjectAction.viewDetails:
        return Icons.visibility;
      case ObjectAction.share:
        return Icons.share;
      case ObjectAction.contact:
        return Icons.phone;
    }
  }
}

/// 📌 Abstract Pinnable Object
/// 
/// Base class for all objects that can be pinned to chat conversations.
abstract class PinnableObject {
  /// Unique identifier for this object
  String get id;
  
  /// Type of this pinnable object
  PinnableObjectType get type;
  
  /// Display title
  String get title;
  
  /// Supporting subtitle/description
  String get subtitle;
  
  /// Optional image URL
  String? get imageUrl => null;
  
  /// Icon representing this object type
  IconData get icon;
  
  /// Color theme for this object
  Color get themeColor;
  
  /// Quick actions available for this object
  List<ObjectAction> get availableActions;
  
  /// Convert to JSON for serialization
  Map<String, dynamic> toJson();
  
  /// Create from JSON
  static PinnableObject fromJson(Map<String, dynamic> json) {
    final type = PinnableObjectType.values.firstWhere(
      (t) => t.name == json['type'],
      orElse: () => PinnableObjectType.product,
    );
    
    switch (type) {
      case PinnableObjectType.bid:
        return BidObject.fromJson(json);
      case PinnableObjectType.order:
        return OrderObject.fromJson(json);
      case PinnableObjectType.product:
        return ProductObject.fromJson(json);
      case PinnableObjectType.event:
        return EventObject.fromJson(json);
      case PinnableObjectType.invoice:
        return InvoiceObject.fromJson(json);
    }
  }
}

/// 🔨 Bid Object
/// 
/// Represents a bid that can be pinned to chat for negotiation.
class BidObject extends PinnableObject {
  final String bidId;
  final String eventTitle;
  final double totalAmount;
  final int quantity;
  final String? unitPrice;
  final String sellerName;
  final String? sellerId;
  
  BidObject({
    required this.bidId,
    required this.eventTitle,
    required this.totalAmount,
    required this.quantity,
    this.unitPrice,
    required this.sellerName,
    this.sellerId,
  });
  
  @override
  String get id => bidId;
  
  @override
  PinnableObjectType get type => PinnableObjectType.bid;
  
  @override
  String get title => eventTitle;
  
  @override
  String get subtitle => '$quantity items × ৳${unitPrice ?? (totalAmount / quantity).toStringAsFixed(0)} = ৳${totalAmount.toStringAsFixed(0)}';
  
  @override
  IconData get icon => Icons.gavel;
  
  @override
  Color get themeColor => const Color(0xFFFFA500); // Orange
  
  @override
  List<ObjectAction> get availableActions => [
    ObjectAction.accept,
    ObjectAction.counter,
    ObjectAction.viewDetails,
  ];
  
  @override
  Map<String, dynamic> toJson() => {
    'type': type.name,
    'bidId': bidId,
    'eventTitle': eventTitle,
    'totalAmount': totalAmount,
    'quantity': quantity,
    'unitPrice': unitPrice,
    'sellerName': sellerName,
    'sellerId': sellerId,
  };
  
  factory BidObject.fromJson(Map<String, dynamic> json) {
    return BidObject(
      bidId: json['bidId'] as String,
      eventTitle: json['eventTitle'] as String,
      totalAmount: (json['totalAmount'] as num).toDouble(),
      quantity: json['quantity'] as int,
      unitPrice: json['unitPrice'] as String?,
      sellerName: json['sellerName'] as String,
      sellerId: json['sellerId'] as String?,
    );
  }
}

/// 📦 Order Object
/// 
/// Represents an order that can be pinned to chat for tracking/support.
class OrderObject extends PinnableObject {
  final String orderId;
  final String orderTitle;
  final String status;
  final double total;
  final String? estimatedDelivery;
  
  OrderObject({
    required this.orderId,
    required this.orderTitle,
    required this.status,
    required this.total,
    this.estimatedDelivery,
  });
  
  @override
  String get id => orderId;
  
  @override
  PinnableObjectType get type => PinnableObjectType.order;
  
  @override
  String get title => orderTitle;
  
  @override
  String get subtitle {
    final parts = <String>[status, '৳${total.toStringAsFixed(0)}'];
    if (estimatedDelivery != null) parts.add(estimatedDelivery!);
    return parts.join(' • ');
  }
  
  @override
  IconData get icon => Icons.shopping_bag;
  
  @override
  Color get themeColor => const Color(0xFF4CAF50); // Green
  
  @override
  List<ObjectAction> get availableActions => [
    ObjectAction.track,
    ObjectAction.contact,
    ObjectAction.viewDetails,
  ];
  
  @override
  Map<String, dynamic> toJson() => {
    'type': type.name,
    'orderId': orderId,
    'orderTitle': orderTitle,
    'status': status,
    'total': total,
    'estimatedDelivery': estimatedDelivery,
  };
  
  factory OrderObject.fromJson(Map<String, dynamic> json) {
    return OrderObject(
      orderId: json['orderId'] as String,
      orderTitle: json['orderTitle'] as String,
      status: json['status'] as String,
      total: (json['total'] as num).toDouble(),
      estimatedDelivery: json['estimatedDelivery'] as String?,
    );
  }
}

/// 🍔 Product Object
/// 
/// Represents a product that can be pinned to chat for inquiry.
class ProductObject extends PinnableObject {
  final String productId;
  final String productName;
  final double price;
  final String? category;
  final String? sellerName;
  
  ProductObject({
    required this.productId,
    required this.productName,
    required this.price,
    this.category,
    this.sellerName,
  });
  
  @override
  String get id => productId;
  
  @override
  PinnableObjectType get type => PinnableObjectType.product;
  
  @override
  String get title => productName;
  
  @override
  String get subtitle {
    final parts = <String>['৳${price.toStringAsFixed(0)}'];
    if (category != null) parts.add(category!);
    return parts.join(' • ');
  }
  
  @override
  IconData get icon => Icons.fastfood;
  
  @override
  Color get themeColor => const Color(0xFF2196F3); // Blue
  
  @override
  List<ObjectAction> get availableActions => [
    ObjectAction.addToCart,
    ObjectAction.askQuestion,
    ObjectAction.viewDetails,
  ];
  
  @override
  Map<String, dynamic> toJson() => {
    'type': type.name,
    'productId': productId,
    'productName': productName,
    'price': price,
    'category': category,
    'sellerName': sellerName,
  };
  
  factory ProductObject.fromJson(Map<String, dynamic> json) {
    return ProductObject(
      productId: json['productId'] as String,
      productName: json['productName'] as String,
      price: (json['price'] as num).toDouble(),
      category: json['category'] as String?,
      sellerName: json['sellerName'] as String?,
    );
  }
}

/// 📅 Event Object (Placeholder for future)
class EventObject extends PinnableObject {
  final String eventId;
  final String eventTitle;
  final DateTime eventDate;
  
  EventObject({
    required this.eventId,
    required this.eventTitle,
    required this.eventDate,
  });
  
  @override
  String get id => eventId;
  
  @override
  PinnableObjectType get type => PinnableObjectType.event;
  
  @override
  String get title => eventTitle;
  
  @override
  String get subtitle => 'Event on ${eventDate.toString().split(' ')[0]}';
  
  @override
  IconData get icon => Icons.event;
  
  @override
  Color get themeColor => const Color(0xFF9C27B0); // Purple
  
  @override
  List<ObjectAction> get availableActions => [ObjectAction.viewDetails];
  
  @override
  Map<String, dynamic> toJson() => {
    'type': type.name,
    'eventId': eventId,
    'eventTitle': eventTitle,
    'eventDate': eventDate.toIso8601String(),
  };
  
  factory EventObject.fromJson(Map<String, dynamic> json) {
    return EventObject(
      eventId: json['eventId'] as String,
      eventTitle: json['eventTitle'] as String,
      eventDate: DateTime.parse(json['eventDate'] as String),
    );
  }
}

/// 🧾 Invoice Object (Placeholder for future)
class InvoiceObject extends PinnableObject {
  final String invoiceId;
  final double amount;
  final String status;
  
  InvoiceObject({
    required this.invoiceId,
    required this.amount,
    required this.status,
  });
  
  @override
  String get id => invoiceId;
  
  @override
  PinnableObjectType get type => PinnableObjectType.invoice;
  
  @override
  String get title => 'Invoice #$invoiceId';
  
  @override
  String get subtitle => '৳${amount.toStringAsFixed(0)} • $status';
  
  @override
  IconData get icon => Icons.receipt;
  
  @override
  Color get themeColor => const Color(0xFF009688); // Teal
  
  @override
  List<ObjectAction> get availableActions => [
    ObjectAction.viewDetails,
    ObjectAction.share,
  ];
  
  @override
  Map<String, dynamic> toJson() => {
    'type': type.name,
    'invoiceId': invoiceId,
    'amount': amount,
    'status': status,
  };
  
  factory InvoiceObject.fromJson(Map<String, dynamic> json) {
    return InvoiceObject(
      invoiceId: json['invoiceId'] as String,
      amount: (json['amount'] as num).toDouble(),
      status: json['status'] as String,
    );
  }
}
