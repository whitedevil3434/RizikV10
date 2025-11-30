import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rizik_v4/core/theme/morph_engine.dart';

class RizikSliverAppBar extends ConsumerWidget implements PreferredSizeWidget {
  const RizikSliverAppBar({super.key});

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final morph = ref.watch(morphEngineProvider);

    return AppBar(
      backgroundColor: Colors.transparent,
      elevation: 0,
      titleSpacing: 16,
      leadingWidth: 0,
      leading: const SizedBox.shrink(),
      title: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Rizik',
            style: GoogleFonts.hindSiliguri(
              fontWeight: FontWeight.w900,
              fontSize: 24,
              color: Colors.black87,
              height: 1.0,
            ),
          ),
          Text(
            morph.roleSubtitle,
            style: GoogleFonts.hindSiliguri(
              fontWeight: FontWeight.w500,
              fontSize: 12,
              color: morph.primaryColor,
              height: 1.0,
            ),
          ),
        ],
      ),
      actions: [
        Stack(
          alignment: Alignment.topRight,
          children: [
            IconButton(
              onPressed: () {},
              icon: const Icon(Icons.notifications_outlined, color: Colors.black87, size: 28),
            ),
            Positioned(
              right: 12,
              top: 12,
              child: Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(width: 8),
        Padding(
          padding: const EdgeInsets.only(right: 16.0),
          child: CircleAvatar(
            radius: 18,
            backgroundColor: Colors.grey.shade200,
            child: Icon(Icons.person, color: Colors.grey.shade600, size: 20),
          ),
        ),
      ],
    );
  }
}
