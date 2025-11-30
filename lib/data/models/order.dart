import 'package:rizik_v4/data/models/cart.dart';
import 'package:rizik_v4/data/models/payment_method.dart';

enum OrderStatus {
  pending,
  confirmed,
  preparing,
  readyForPickup,
  outForDelivery,
  delivered,
  cancelled,
}

class Order {
  final String id;
  final List<CartItem> items;
  final double subtotal;
  final double deliveryFee;
  final double tax;
  final double total;
  final PaymentMethodType paymentMethod;
  final OrderStatus status;
  final DateTime createdAt;
  final String deliveryAddress;
  final String? specialInstructions;
  final String? estimatedDeliveryTime;

  Order({
    required this.id,
    required this.items,
    required this.subtotal,
    required this.deliveryFee,
    required this.tax,
    required this.total,
    required this.paymentMethod,
    required this.status,
    required this.createdAt,
    required this.deliveryAddress,
    this.specialInstructions,
    this.estimatedDeliveryTime,
  });

  String get statusText {
    switch (status) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.confirmed:
        return 'Confirmed';
      case OrderStatus.preparing:
        return 'Preparing';
      case OrderStatus.readyForPickup:
        return 'Ready for Pickup';
      case OrderStatus.outForDelivery:
        return 'Out for Delivery';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }

  String get statusEmoji {
    switch (status) {
      case OrderStatus.pending:
        return '⏳';
      case OrderStatus.confirmed:
        return '✅';
      case OrderStatus.preparing:
        return '👨‍🍳';
      case OrderStatus.readyForPickup:
        return '📦';
      case OrderStatus.outForDelivery:
        return '🚴';
      case OrderStatus.delivered:
        return '🎉';
      case OrderStatus.cancelled:
        return '❌';
    }
  }

  Order copyWith({
    String? id,
    List<CartItem>? items,
    double? subtotal,
    double? deliveryFee,
    double? tax,
    double? total,
    PaymentMethodType? paymentMethod,
    OrderStatus? status,
    DateTime? createdAt,
    String? deliveryAddress,
    String? specialInstructions,
    String? estimatedDeliveryTime,
  }) {
    return Order(
      id: id ?? this.id,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      tax: tax ?? this.tax,
      total: total ?? this.total,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      status: status ?? this.status,
      createdAt: createdAt ?? this.createdAt,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      specialInstructions: specialInstructions ?? this.specialInstructions,
      estimatedDeliveryTime:
          estimatedDeliveryTime ?? this.estimatedDeliveryTime,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'items': items.map((item) => item.toJson()).toList(),
      'subtotal': subtotal,
      'deliveryFee': deliveryFee,
      'tax': tax,
      'total': total,
      'paymentMethod': paymentMethod.toString(),
      'status': status.toString(),
      'createdAt': createdAt.toIso8601String(),
      'deliveryAddress': deliveryAddress,
      'specialInstructions': specialInstructions,
      'estimatedDeliveryTime': estimatedDeliveryTime,
    };
  }

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'] as String,
      items: (json['items'] as List)
          .map((item) => CartItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      subtotal: (json['subtotal'] as num).toDouble(),
      deliveryFee: (json['deliveryFee'] as num).toDouble(),
      tax: (json['tax'] as num).toDouble(),
      total: (json['total'] as num).toDouble(),
      paymentMethod: PaymentMethodType.values.firstWhere(
        (e) => e.toString() == json['paymentMethod'],
      ),
      status: OrderStatus.values.firstWhere(
        (e) => e.toString() == json['status'],
      ),
      createdAt: DateTime.parse(json['createdAt'] as String),
      deliveryAddress: json['deliveryAddress'] as String,
      specialInstructions: json['specialInstructions'] as String?,
      estimatedDeliveryTime: json['estimatedDeliveryTime'] as String?,
    );
  }
}
