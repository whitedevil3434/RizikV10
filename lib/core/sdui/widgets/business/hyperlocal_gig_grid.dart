import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class HyperlocalGigGrid extends StatelessWidget {
  final Map<String, dynamic> data;

  const HyperlocalGigGrid({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final List<dynamic> gigs = data['gigs'] ?? [];

    if (gigs.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('No nearby gigs found.'),
        ),
      );
    }

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.85,
      ),
      itemCount: gigs.length,
      itemBuilder: (context, index) {
        final gig = gigs[index];
        return _buildGigCard(context, gig);
      },
    );
  }

  Widget _buildGigCard(BuildContext context, Map<String, dynamic> gig) {
    final String title = gig['title'] ?? 'Unknown Gig';
    final String location = gig['location'] ?? 'Unknown Location';
    final String payout = gig['payout'] ?? '--';
    final String? imageUrl = gig['image'];
    final Map<String, dynamic>? action = gig['action'];

    return GestureDetector(
      onTap: () {
        if (action != null && action['type'] == 'navigate') {
          final url = action['url'];
          if (url != null) {
            GoRouter.of(context).go(url);
          }
        }
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: imageUrl != null
                  ? Image.network(
                      imageUrl,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: Colors.grey[200],
                        child: const Center(
                          child: Icon(Icons.broken_image, color: Colors.grey),
                        ),
                      ),
                    )
                  : Container(
                      color: Colors.blue[50],
                      child: const Center(
                        child: Icon(Icons.work, color: Colors.blue),
                      ),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.all(8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    location,
                    style: TextStyle(
                      color: Colors.grey[600],
                      fontSize: 12,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    payout,
                    style: const TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
