import 'package:flutter/material.dart';

/// Bazar Feed Card for social commerce feed items
class BazarFeedCard extends StatelessWidget {
  final Map<String, dynamic> data;

  const BazarFeedCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final creatorName = data['creatorName'] ?? 'User';
    final creatorAvatar = data['creatorAvatar'];
    final itemName = data['itemName'] ?? 'Item';
    final price = data['price'] ?? 0;
    final image = data['image'];
    final caption = data['caption'] ?? '';
    final likes = data['likes'] ?? 0;
    final comments = data['comments'] ?? 0;
    final shares = data['shares'] ?? 0;
    final isVideo = data['isVideo'] ?? false;

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Creator Header
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundImage: creatorAvatar != null
                      ? NetworkImage(creatorAvatar)
                      : null,
                  child: creatorAvatar == null
                      ? const Icon(Icons.person, size: 20)
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        creatorName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        'Posted 2h ago',
                        style: TextStyle(
                          fontSize: 11,
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.more_vert, size: 20),
                  onPressed: () {},
                ),
              ],
            ),
          ),

          // Content Image/Video
          if (image != null)
            Stack(
              children: [
                Image.network(
                  image,
                  width: double.infinity,
                  height: 300,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      height: 300,
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.image, size: 60),
                    );
                  },
                ),
                if (isVideo)
                  Positioned(
                    bottom: 12,
                    right: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.7),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Row(
                        children: const [
                          Icon(Icons.play_arrow, color: Colors.white, size: 16),
                          SizedBox(width: 4),
                          Text(
                            '1:24',
                            style: TextStyle(color: Colors.white, fontSize: 11),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),

          // Product Info
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        itemName,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                        ),
                      ),
                    ),
                    Text(
                      '৳$price',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF4CAF50),
                      ),
                    ),
                  ],
                ),
                if (caption.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  Text(
                    caption,
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.grey.shade700,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ],
            ),
          ),

          // Engagement Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                _buildEngagementButton(
                  Icons.favorite_border,
                  '$likes',
                  Colors.red,
                ),
                const SizedBox(width: 16),
                _buildEngagementButton(
                  Icons.comment_outlined,
                  '$comments',
                  Colors.blue,
                ),
                const SizedBox(width: 16),
                _buildEngagementButton(
                  Icons.share_outlined,
                  '$shares',
                  Colors.green,
                ),
                const Spacer(),
                ElevatedButton.icon(
                  onPressed: () => print('Add to Cart: $itemName'),
                  icon: const Icon(Icons.shopping_cart, size: 16),
                  label: const Text('Order', style: TextStyle(fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF4CAF50),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
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

  Widget _buildEngagementButton(IconData icon, String count, Color color) {
    return InkWell(
      onTap: () {},
      child: Row(
        children: [
          Icon(icon, size: 20, color: Colors.grey.shade600),
          const SizedBox(width: 4),
          Text(
            count,
            style: TextStyle(
              fontSize: 12,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }
}
