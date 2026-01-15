import 'package:flutter/material.dart';
import '../icons/rizik_icons.dart';

/// RizikActionRail - Unified Right-Side Action Panel
/// No duplicates! Single panel with 5 unique actions
/// Design: Dap, Say, Spread, Save, Options
class RizikActionRail extends StatelessWidget {
  // Dap (Like)
  final bool isDapped;
  final int dapCount;
  final VoidCallback? onDap;
  final VoidCallback? onDapLongPress;
  
  // Say (Comment)
  final int sayCount;
  final VoidCallback? onSay;
  final VoidCallback? onSayLongPress;
  
  // Spread (Share)
  final int spreadCount;
  final VoidCallback? onSpread;
  final VoidCallback? onSpreadLongPress;
  
  // Save (Bookmark)
  final bool isSaved;
  final VoidCallback? onSave;
  final VoidCallback? onSaveLongPress;
  
  // Options (More)
  final VoidCallback? onOptions;
  final VoidCallback? onOptionsLongPress;
  
  // Creator Avatar
  final String? creatorAvatarUrl;
  final VoidCallback? onCreatorTap;

  const RizikActionRail({
    super.key,
    // Dap
    this.isDapped = false,
    this.dapCount = 0,
    this.onDap,
    this.onDapLongPress,
    // Say
    this.sayCount = 0,
    this.onSay,
    this.onSayLongPress,
    // Spread
    this.spreadCount = 0,
    this.onSpread,
    this.onSpreadLongPress,
    // Save
    this.isSaved = false,
    this.onSave,
    this.onSaveLongPress,
    // Options
    this.onOptions,
    this.onOptionsLongPress,
    // Creator
    this.creatorAvatarUrl,
    this.onCreatorTap,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Creator Avatar (if provided)
          if (creatorAvatarUrl != null) ...[
            _buildCreatorAvatar(),
            const SizedBox(height: 24),
          ],
          
          // 🤜🏻💥🤛🏻 DAP - The unified reaction
          DapIcon(
            isDapped: isDapped,
            dapCount: dapCount,
            onDap: onDap,
            onLongPress: onDapLongPress,
          ),
          const SizedBox(height: 20),
          
          // 💬 SAY - Comment
          SayIcon(
            commentCount: sayCount,
            onTap: onSay,
            onLongPress: onSayLongPress,
          ),
          const SizedBox(height: 20),
          
          // ↗️ SPREAD - Share
          SpreadIcon(
            shareCount: spreadCount,
            onTap: onSpread,
            onLongPress: onSpreadLongPress,
          ),
          const SizedBox(height: 20),
          
          // 🔖 SAVE - Bookmark
          SaveIcon(
            isSaved: isSaved,
            onTap: onSave,
            onLongPress: onSaveLongPress,
          ),
          const SizedBox(height: 20),
          
          // ⋯ OPTIONS - More
          OptionsIcon(
            onTap: onOptions,
            onLongPress: onOptionsLongPress,
          ),
        ],
      ),
    );
  }

  Widget _buildCreatorAvatar() {
    return GestureDetector(
      onTap: onCreatorTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.3),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
          image: creatorAvatarUrl != null
              ? DecorationImage(
                  image: NetworkImage(creatorAvatarUrl!),
                  fit: BoxFit.cover,
                )
              : null,
          color: creatorAvatarUrl == null ? Colors.grey.shade800 : null,
        ),
        child: creatorAvatarUrl == null
            ? const Icon(Icons.person, color: Colors.white54, size: 24)
            : null,
      ),
    );
  }
}
