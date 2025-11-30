import 'package:flutter/foundation.dart';

/// Cart Item Model
class CartItem {
  final String id;
  final String foodId;
  final String name;
  final String nameBn;
  final String image;
  final double price;
  final int quantity;
  final String restaurantId;
  final String restaurantName;
  final List<String> customizations;

  CartItem({
    required this.id,
    required this.foodId,
    required this.name,
    required this.nameBn,
    required this.image,
    required this.price,
    required this.quantity,
    required this.restaurantId,
    required this.restaurantName,
    this.customizations = const [],
  });

  double get subtotal => price * quantity;

  CartItem copyWith({
    String? id,
    String? foodId,
    String? name,
    String? nameBn,
    String? image,
    double? price,
    int? quantity,
    String? restaurantId,
    String? restaurantName,
    List<String>? customizations,
  }) {
    return CartItem(
      id: id ?? this.id,
      foodId: foodId ?? this.foodId,
      name: name ?? this.name,
      nameBn: nameBn ?? this.nameBn,
      image: image ?? this.image,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
      restaurantId: restaurantId ?? this.restaurantId,
      restaurantName: restaurantName ?? this.restaurantName,
      customizations: customizations ?? this.customizations,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'foodId': foodId,
      'name': name,
      'nameBn': nameBn,
      'image': image,
      'price': price,
      'quantity': quantity,
      'restaurantId': restaurantId,
      'restaurantName': restaurantName,
      'customizations': customizations,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'] as String,
      foodId: json['foodId'] as String,
      name: json['name'] as String,
      nameBn: json['nameBn'] as String? ?? '',
      image: json['image'] as String,
      price: (json['price'] as num).toDouble(),
      quantity: json['quantity'] as int,
      restaurantId: json['restaurantId'] as String,
      restaurantName: json['restaurantName'] as String,
      customizations: List<String>.from(json['customizations'] ?? []),
    );
  }
}

/// Cart Model
class Cart {
  final List<CartItem> items;
  final String deliveryAddress;
  final double deliveryFee;
  final double taxRate;

  Cart({
    required this.items,
    this.deliveryAddress = '',
    this.deliveryFee = 50.0,
    this.taxRate = 0.05, // 5% tax
  });

  factory Cart.empty() {
    return Cart(items: []);
  }

  double get subtotal => items.fold(0, (sum, item) => sum + item.subtotal);
  
  double get tax => subtotal * taxRate;
  
  double get total => subtotal + deliveryFee + tax;
  
  int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  
  bool get isEmpty => items.isEmpty;
  
  bool get isNotEmpty => items.isNotEmpty;

  Cart copyWith({
    List<CartItem>? items,
    String? deliveryAddress,
    double? deliveryFee,
    double? taxRate,
  }) {
    return Cart(
      items: items ?? this.items,
      deliveryAddress: deliveryAddress ?? this.deliveryAddress,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      taxRate: taxRate ?? this.taxRate,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'items': items.map((item) => item.toJson()).toList(),
      'deliveryAddress': deliveryAddress,
      'deliveryFee': deliveryFee,
      'taxRate': taxRate,
    };
  }

  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      items: (json['items'] as List)
          .map((item) => CartItem.fromJson(item))
          .toList(),
      deliveryAddress: json['deliveryAddress'] as String? ?? '',
      deliveryFee: (json['deliveryFee'] as num?)?.toDouble() ?? 50.0,
      taxRate: (json['taxRate'] as num?)?.toDouble() ?? 0.05,
    );
  }
}
