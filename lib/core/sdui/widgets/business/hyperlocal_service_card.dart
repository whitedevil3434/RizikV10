import 'package:flutter/material.dart';

/// Hyperlocal Service Card for nearby service discovery
class HyperlocalServiceCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const HyperlocalServiceCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final serviceName = data['serviceName'] ?? 'Service';
    final providerName = data['providerName'] ?? 'Provider';
    final serviceType = data['serviceType'] ?? 'General';
    final distance = data['distance'] ?? '0 km';
    final price = data['price'];
    final rating = (data['rating'] as num?)?.toDouble() ?? 0.0;
    final isAvailable = data['isAvailable'] ?? true;
    final image = data['image'];
    final trustScore = (data['trustScore'] as num?)?.toDouble() ?? 0.0;

    return Card(
      margin: const EdgeInsets.all(8),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Service Image
          if (image != null)
            ClipRRect(
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(12)),
              child: Image.network(
                image,
                width: double.infinity,
                height: 140,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) {
                  return Container(
                    height: 140,
                    color: Colors.grey.shade200,
                    child: const Icon(Icons.handyman, size: 50),
                  );
                },
              ),
            ),

          // Service Info
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Service Type Badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.purple.shade50,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    serviceType.toUpperCase(),
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.purple.shade700,
                    ),
                  ),
                ),
                const SizedBox(height: 8),

                // Service Name
                Text(
                  serviceName,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),

                // Provider Info
                Row(
                  children: [
                    const Icon(Icons.person, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        providerName,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey.shade600,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (trustScore > 0) ...[
                      const SizedBox(width: 8),
                      Icon(Icons.verified,
                          size: 12, color: Colors.green.shade600),
                      const SizedBox(width: 2),
                      Text(
                        trustScore.toStringAsFixed(1),
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.green.shade600,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 8),

                // Distance & Rating
                Row(
                  children: [
                    Icon(Icons.location_on,
                        size: 14, color: Colors.blue.shade600),
                    const SizedBox(width: 4),
                    Text(
                      distance,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade700,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (rating > 0) ...[
                      const SizedBox(width: 12),
                      const Icon(Icons.star, color: Colors.amber, size: 14),
                      const SizedBox(width: 2),
                      Text(
                        rating.toStringAsFixed(1),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 8),

                // Price & Availability
                Row(
                  children: [
                    if (price != null) ...[
                      const Icon(Icons.attach_money,
                          size: 16, color: Color(0xFF4CAF50)),
                      Text(
                        '৳$price',
                        style: const TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF4CAF50),
                        ),
                      ),
                    ],
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: isAvailable
                            ? Colors.green.shade50
                            : Colors.red.shade50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        isAvailable ? 'Available' : 'Busy',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: isAvailable
                              ? Colors.green.shade700
                              : Colors.red.shade700,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Action Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: isAvailable
                        ? () => print('Book Service: $serviceName')
                        : null,
                    icon: const Icon(Icons.phone, size: 18),
                    label: const Text('Contact Provider'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.purple,
                      foregroundColor: Colors.white,
                      disabledBackgroundColor: Colors.grey.shade300,
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
