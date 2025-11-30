import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/core/state/profile_provider.dart';
import 'package:rizik_v4/data/models/user_role.dart';

class WidgetProfileDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetProfileDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final role = _parseRole(data['role'] as String? ?? 'consumer');

    return Consumer<ProfileProvider>(
      builder: (context, provider, child) {
        final profile = provider.profile;
        final avatar = provider.getAvatarForRole(role);
        final title = provider.getTitleForRole(role);

        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF4facfe), Color(0xFF00f2fe)],
            ),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 32,
                child: Text(profile.name[0], style: const TextStyle(fontSize: 24)),
                backgroundColor: Colors.white,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      profile.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      title,
                      style: const TextStyle(
                        fontSize: 14,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  UserRole _parseRole(String roleStr) {
    switch (roleStr.toLowerCase()) {
      case 'partner': return UserRole.partner;
      case 'rider': return UserRole.rider;
      default: return UserRole.consumer;
    }
  }
}
