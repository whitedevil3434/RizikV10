import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/seeker/marketplace/logic/cart_provider.dart';

class WidgetCartDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetCartDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    // effectiveData logic if needed in future, currently CartProvider drives everything
    // final effectiveData = data['data'] is Map<String, dynamic> ? data['data'] as Map<String, dynamic> : data;
    
    return Consumer<CartProvider>(
      builder: (context, provider, child) {
        final itemCount = provider.itemCount;
        final totalPrice = provider.cart.total;

        if (itemCount == 0) {
          return const SizedBox.shrink();
        }

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.black,
            borderRadius: BorderRadius.circular(12),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 8,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '$itemCount Items',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '৳${totalPrice.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
              const Icon(Icons.shopping_cart, color: Colors.white),
            ],
          ),
        );
      },
    );
  }
}
