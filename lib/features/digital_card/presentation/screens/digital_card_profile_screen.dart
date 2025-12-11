import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/features/digital_card/data/digital_card_repository.dart';
import 'package:rizik_v4/features/digital_card/presentation/screens/digital_card_editor_screen.dart';
import 'package:qr_flutter/qr_flutter.dart';

/// Digital Card Profile Screen
/// View and share digital card
class DigitalCardProfileScreen extends ConsumerWidget {
  const DigitalCardProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // In a real app, we'd use a FutureProvider for this
    // For simplicity, fetching in build (not recommended usually, but okay for prototype)
    // Better to use a FutureBuilder here
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Digital Card'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const DigitalCardEditorScreen()),
            ),
          ),
        ],
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: ref.read(digitalCardRepositoryProvider).getMyCard(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          
          final data = snapshot.data ?? {};
          final profile = data['profile_data'] ?? {};
          final name = profile['name'] ?? 'Your Name';
          final title = profile['title'] ?? 'Your Title';
          final userId = data['user_id'] ?? 'unknown';

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              children: [
                // Card Preview
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Colors.blue, Colors.purple],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        offset: const Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Column(
                    children: [
                      const CircleAvatar(
                        radius: 40,
                        backgroundColor: Colors.white,
                        child: Icon(Icons.person, size: 40, color: Colors.grey),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        title,
                        style: const TextStyle(
                          color: Colors.white70,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          _buildSocialIcon(Icons.email),
                          const SizedBox(width: 16),
                          _buildSocialIcon(Icons.phone),
                          const SizedBox(width: 16),
                          _buildSocialIcon(Icons.language),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
                
                // QR Code
                const Text('Scan to Connect', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                QrImageView(
                  data: 'https://rizik.app/card/$userId',
                  version: QrVersions.auto,
                  size: 200.0,
                ),
                const SizedBox(height: 32),
                
                // Share Button
                ElevatedButton.icon(
                  onPressed: () {
                    // Share logic
                  },
                  icon: const Icon(Icons.share),
                  label: const Text('Share Card Link'),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSocialIcon(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white),
    );
  }
}
