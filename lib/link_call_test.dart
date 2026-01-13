import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:rizik_v4/core/feed_ui/feed_ui.dart';
import 'package:rizik_v4/features/voice/presentation/voice_assistant_palette.dart';

/// Test entry point for Rizik Link Call
void main() {
  runApp(
    const ProviderScope(
      child: FeedTestApp(),
    ),
  );
}

class FeedTestApp extends StatelessWidget {
  const FeedTestApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rizik Link Call Test',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
      ),
      home: const FeedTestScreen(),
    );
  }
}

class FeedTestScreen extends StatefulWidget {
  const FeedTestScreen({super.key});

  @override
  State<FeedTestScreen> createState() => _FeedTestScreenState();
}

class _FeedTestScreenState extends State<FeedTestScreen> {
  bool _isLiked = false;
  int _likeCount = 2547;
  int _selectedCategory = 0;

  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
         debugPrint('🤖 Auto-launching Voice Assistant for Test...');
         VoiceAssistantPalette.show(context);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return RizikFeedScaffold(
      // Video backdrop (Animated WebP from R2)
      videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/feed_videos/rizik_reel_1767893570.webp',
      
      // Creator info
      creatorUsername: '@CyberChef_AI',
      creatorAvatarUrl: 'https://i.pravatar.cc/150?img=12',
      isVerified: true,
      
      // Content
      description: '🔥 Testing Link Call System via Voice Assistant! Long Press the Orb below to start. 🎤✨',
      flowBadge: '🎙️ LINK CALL TEST',
      audioTitle: 'Original Sound - @CyberChef_AI',
      
      // Engagement
      likeCount: _likeCount,
      commentCount: 342,
      shareCount: 89,
      isLiked: _isLiked,
      
      // User
      userAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      balanceText: '৳12,500',
      
      // Categories
      flowCategories: const ['Trending', 'Food', 'Tech', 'Music', 'Gaming', 'Art'],
      selectedCategoryIndex: _selectedCategory,
      onCategorySelected: (index) {
        setState(() => _selectedCategory = index);
      },
      
      // Callbacks
      onLikeTap: () {
        setState(() {
          _isLiked = !_isLiked;
          _likeCount += _isLiked ? 1 : -1;
        });
      },
      onOrbLongPress: () {
        debugPrint('Orb long pressed - Launching Voice Assistant');
        VoiceAssistantPalette.show(context);
      },
      onOrbTap: () => debugPrint('Orb tapped'),
      onCommentTap: () => debugPrint('Comment tapped'),
      onShareTap: () => debugPrint('Share tapped'),
      onMoreTap: () => debugPrint('More tapped'),
      onSearchTap: () => debugPrint('Search tapped'),
      onNotificationTap: () => debugPrint('Notifications tapped'),
    );
  }
}
