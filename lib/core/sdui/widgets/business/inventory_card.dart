import 'package:flutter/material.dart';

/// Inventory Card for maker inventory management
class InventoryCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const InventoryCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final itemName = data['itemName'] ?? 'Item';
    final category = data['category'] ?? 'General';
    final stockLevel = data['stockLevel'] ?? 0;
    final lowStockThreshold = data['lowStockThreshold'] ?? 10;
    final price = data['price'];
    final image = data['image'];
    final sku = data['sku'] ?? '';

    final isLowStock = stockLevel <= lowStockThreshold;
    final isOutOfStock = stockLevel == 0;

    return Card(
      margin: const EdgeInsets.all(8),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Item Image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: image != null
                  ? Image.network(
                      image,
                      width: 80,
                      height: 80,
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) {
                        return Container(
                          width: 80,
                          height: 80,
                          color: Colors.grey.shade200,
                          child: const Icon(Icons.inventory, size: 30),
                        );
                      },
                    )
                  : Container(
                      width: 80,
                      height: 80,
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.inventory, size: 30),
                    ),
            ),
            const SizedBox(width: 12),

            // Item Details
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Category Badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      category.toUpperCase(),
                      style: TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue.shade700,
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),

                  // Item Name
                  Text(
                    itemName,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (sku.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      'SKU: $sku',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                  const SizedBox(height: 8),

                  // Stock Level
                  Row(
                    children: [
                      Icon(
                        Icons.inventory_2,
                        size: 16,
                        color: isOutOfStock
                            ? Colors.red
                            : isLowStock
                                ? Colors.orange
                                : Colors.green,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Stock: $stockLevel',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isOutOfStock
                              ? Colors.red
                              : isLowStock
                                  ? Colors.orange
                                  : Colors.green,
                        ),
                      ),
                    ],
                  ),
                  if (isLowStock && !isOutOfStock) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Low stock warning!',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.orange.shade700,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                  if (isOutOfStock) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Out of stock!',
                      style: TextStyle(
                        fontSize: 10,
                        color: Colors.red.shade700,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                  if (price != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      '৳$price',
                      style: const TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF4CAF50),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Actions Menu
            PopupMenuButton<String>(
              icon: const Icon(Icons.more_vert, size: 20),
              onSelected: (value) {
                print('Action: $value for $itemName');
              },
              itemBuilder: (context) => [
                const PopupMenuItem(
                  value: 'edit',
                  child: Text('Edit Item'),
                ),
                const PopupMenuItem(
                  value: 'restock',
                  child: Text('Restock'),
                ),
                const PopupMenuItem(
                  value: 'delete',
                  child: Text('Delete'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
