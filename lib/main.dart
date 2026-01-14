// Rizik AI Video Feed - Full 4-Way Navigation
// Up/Down: Video Feed | Left/Right: Features
// Fixed Bottom: Mojo Orb with Wallet/Orders

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/feed_ui/feed_ui.dart';
import 'core/sdui/widgets/visuals/rizik_mojo.dart';
import 'core/wrappers/haptic_feedback_wrapper.dart';
import 'features/voice/presentation/voice_assistant_palette.dart';
import 'shared/widgets/navigation/role_switcher_orb.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase for video fetching
  await Supabase.initialize(
    url: 'https://dxekolvveoadbaftfsmy.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg',
  );

  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  runApp(const ProviderScope(child: RizikVideoFeedApp()));
}

class RizikVideoFeedApp extends StatelessWidget {
  const RizikVideoFeedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rizik',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
      ),
      home: const RizikVideoFeed(),
    );
  }
}

class VideoContent {
  final String videoUrl;
  final String title;
  final String description;
  final String creator;
  final String flowBadge;
  final int likes;
  final int comments;

  const VideoContent({
    required this.videoUrl,
    required this.title,
    required this.description,
    required this.creator,
    required this.flowBadge,
    this.likes = 0,
    this.comments = 0,
  });
}

final List<VideoContent> generatedVideos = [
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768173813.mp4',
    title: 'PRAN Bangladesh',
    description: '🥤 PRAN - Pure & Natural! Fresh mango juice for your family 🇧🇩',
    creator: '@PRAN_Official',
    flowBadge: '🥤 BEVERAGE',
    likes: 15420,
    comments: 892,
  ),
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768172687.mp4',
    title: 'Chillox Restaurant',
    description: '🍔 Chillox - Where taste meets chill! 🍗',
    creator: '@Chillox_BD',
    flowBadge: '🍔 FOOD',
    likes: 8934,
    comments: 456,
  ),
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768171454.mp4',
    title: 'Night Food Market',
    description: '🌙 Late night cravings? Street food vibes ✨',
    creator: '@FoodieStreets',
    flowBadge: '🌙 NIGHT',
    likes: 12567,
    comments: 734,
  ),
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768169688.mp4',
    title: 'Food Commercial',
    description: '🔥 Sizzling hot! Fresh from the kitchen!',
    creator: '@FoodStudio',
    flowBadge: '🔥 HOT',
    likes: 9821,
    comments: 523,
  ),
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan2gp/1768164188.mp4',
    title: 'Biryani Special',
    description: '🍚 Authentic biryani with all the flavors! 🌶️',
    creator: '@BiryaniHouse',
    flowBadge: '🍚 DESI',
    likes: 18234,
    comments: 1023,
  ),
];

class RizikVideoFeed extends StatefulWidget {
  const RizikVideoFeed({super.key});

  @override
  State<RizikVideoFeed> createState() => _RizikVideoFeedState();
}

class _RizikVideoFeedState extends State<RizikVideoFeed> {
  late PageController _horizontalController;
  late PageController _verticalController;
  
  int _currentFeature = 1; // 0=Orders, 1=Feed, 2=Wallet
  int _currentVideo = 0;
  
  late List<bool> _likeStates;
  late List<int> _likeCounts;

  // Supabase Integration
  List<VideoContent> _allVideos = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _horizontalController = PageController(initialPage: 1);
    _verticalController = PageController();
    
    // Initialize with Hardcoded Videos (Audio+Video)
    _allVideos = List.from(generatedVideos);
    _likeStates = List.filled(_allVideos.length, false);
    _likeCounts = _allVideos.map((v) => v.likes).toList();
    _isLoading = false; // Show immediately
    
    // Start fetching Server Videos (Silent/Others)
    _subscribeToVideos();
  }

  void _subscribeToVideos() {
    debugPrint('🔥 Subscribing to Supabase videos...');
    Supabase.instance.client
        .from('generated_videos')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .limit(50)
        .listen((List<Map<String, dynamic>> data) {
          
      final supabaseVideos = data.map((json) {
        final prompt = json['video_prompt'] as String? ?? '';
        final safeDesc = prompt.length > 50 ? prompt.substring(0, 50) : prompt;
        
        return VideoContent(
        videoUrl: json['video_url'] ?? '',
        title: json['product_name'] ?? 'AI Generated',
        description: '🚀 ${json['product_name'] ?? 'Product'} - AI Generated Ad! $safeDesc... #RizikAI',
        creator: '@Rizik_AI',
        flowBadge: '🤖 ${json['product_type']?.toUpperCase() ?? 'AI'}',
        likes: (json['likes'] ?? 0) as int, 
        comments: 0,
      );
      }).toList();
      
      if (mounted) {
        setState(() {
          // MERGE: Generated (Top) + Supabase (Bottom)
          // Avoid duplicates if needed, but for now just concat
          // Filter out Supabase videos that might match generated URLs if necessary?
          // Assuming Generated ones are not in Supabase or we prefer local version.
          
          _allVideos = [...generatedVideos, ...supabaseVideos];
          
          // Re-sync interaction states
          // We need to preserve states for the first N (generated)
          final topStates = _likeStates.take(generatedVideos.length).toList();
          final topCounts = _likeCounts.take(generatedVideos.length).toList();
          
          // New states for server videos
          final bottomStates = List.filled(supabaseVideos.length, false);
          final bottomCounts = supabaseVideos.map((v) => v.likes).toList();
          
          _likeStates = [...topStates, ...bottomStates];
          _likeCounts = [...topCounts, ...bottomCounts];
          
          _isLoading = false;
        });
        debugPrint('✅ Loaded & Merged: ${generatedVideos.length} Local + ${supabaseVideos.length} Server');
      }
    }, onError: (error) {
      debugPrint('❌ Supabase Error: $error');
      // On error, we still have generatedVideos, so do nothing.
    });
  }

  @override
  void dispose() {
    _horizontalController.dispose();
    _verticalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Main content area (horizontal swipe for features)
          PageView(
            controller: _horizontalController,
            onPageChanged: (index) {
              setState(() => _currentFeature = index);
              HapticFeedback.mediumImpact();
            },
            children: [
              _buildOrdersPage(),
              _buildVideoFeed(),
              _buildWalletPage(),
            ],
          ),
          
          // FIXED Bottom Navigation (always visible)
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: _buildFixedBottomNav(),
          ),
          
          // Edge swipe indicators
          _buildEdgeIndicators(),
        ],
      ),
    );
  }

  /// Video Feed with vertical scroll - NO bottom orb (external nav handles it)
  Widget _buildVideoFeed() {
    if (_isLoading) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircularProgressIndicator(color: Color(0xFF8B5CF6)),
            SizedBox(height: 16),
            Text('Loading AI Feed...', style: TextStyle(color: Colors.white54)),
          ],
        ),
      );
    }

    return PageView.builder(
      controller: _verticalController,
      scrollDirection: Axis.vertical,
      itemCount: _allVideos.length,
      onPageChanged: (index) {
        setState(() => _currentVideo = index);
        HapticFeedback.lightImpact();
      },
      itemBuilder: (context, index) {
        final video = _allVideos[index];
        final bool isPlaying = index == _currentVideo; // Only play visible video
        
        // 🔥 STRICT BUFFERING: "Focus on 1, then future"
        // Only keep Current (0) and Next (+1) alive.
        // Dispose Previous (-1) immediately to free decoders.
        final bool shouldBuffer = (index >= _currentVideo) && (index <= _currentVideo + 1); 

        return RizikFeedScaffold(
          videoUrl: video.videoUrl,
          creatorUsername: video.creator,
          creatorAvatarUrl: 'https://i.pravatar.cc/150?img=${index + 10}',
          isVerified: true,
          description: video.description,
          flowBadge: video.flowBadge,
          audioTitle: 'Original Sound - ${video.creator}',
          likeCount: _likeCounts[index],
          commentCount: video.comments,
          shareCount: (video.likes * 0.1).toInt(),
          isLiked: _likeStates[index],
          userAvatarUrl: 'https://i.pravatar.cc/150?img=5',
          balanceText: '৳12,500',
          flowCategories: const ['All', 'Food', 'Brand', 'Market', 'Desi'],
          selectedCategoryIndex: 0,
          onCategorySelected: (i) {},
          // Hide internal orb - we use external nav
          showBottomOrb: false,
          isActive: isPlaying, // Pass Playback State
          shouldBuffer: shouldBuffer, // Pass Resource Control
          onLikeTap: () {
            setState(() {
              _likeStates[index] = !_likeStates[index];
              _likeCounts[index] += _likeStates[index] ? 1 : -1;
            });
            HapticFeedback.mediumImpact();
          },
          onCommentTap: () => _showComments(video),
          onShareTap: () => _shareVideo(video),
          onMoreTap: () => _showMore(video),
          onOrbTap: () {},
          onOrbLongPress: () {},
          onSearchTap: () {},
          onNotificationTap: () {},
        );
      },
    );
  }

  Widget _buildOrdersPage() {
    return Container(
      color: Colors.black,
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.receipt_long, color: Color(0xFF10B981), size: 28),
                  ),
                  const SizedBox(width: 16),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Orders', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      Text('Track your delivery', style: TextStyle(color: Colors.white54, fontSize: 14)),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.receipt_long, size: 80, color: const Color(0xFF10B981).withOpacity(0.3)),
                    const SizedBox(height: 16),
                    const Text('No Active Orders', style: TextStyle(color: Colors.white54, fontSize: 18)),
                    const SizedBox(height: 8),
                    const Text('Swipe right → to Feed', style: TextStyle(color: Colors.white30, fontSize: 14)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 100), // Space for bottom nav
          ],
        ),
      ),
    );
  }

  Widget _buildWalletPage() {
    return Container(
      color: Colors.black,
      child: SafeArea(
        bottom: false,
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF59E0B).withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const Icon(Icons.account_balance_wallet, color: Color(0xFFF59E0B), size: 28),
                  ),
                  const SizedBox(width: 16),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Wallet', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                      Text('৳12,500 Balance', style: TextStyle(color: Color(0xFFF59E0B), fontSize: 14, fontWeight: FontWeight.w600)),
                    ],
                  ),
                ],
              ),
            ),
            Expanded(
              child: Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.account_balance_wallet, size: 80, color: const Color(0xFFF59E0B).withOpacity(0.3)),
                    const SizedBox(height: 16),
                    const Text('Your Wallet', style: TextStyle(color: Colors.white54, fontSize: 18)),
                    const SizedBox(height: 8),
                    const Text('← Swipe left to Feed', style: TextStyle(color: Colors.white30, fontSize: 14)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 100), // Space for bottom nav
          ],
        ),
      ),
    );
  }

  /// FIXED Bottom Navigation with Real Mojo Orb
  Widget _buildFixedBottomNav() {
    return Container(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).padding.bottom + 12,
        left: 24,
        right: 24,
        top: 12,
      ),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.bottomCenter,
          end: Alignment.topCenter,
          colors: [
            Colors.black,
            Colors.black.withOpacity(0.9),
            Colors.transparent,
          ],
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Orders Button
          _buildNavButton(
            icon: Icons.receipt_long,
            label: 'Orders',
            color: const Color(0xFF10B981),
            isActive: _currentFeature == 0,
            onTap: () => _goToPage(0),
          ),
          
          // Mojo Orb (Center) - THE REAL ONE
          GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              if (_currentFeature != 1) {
                _goToPage(1);
              } else {
                RoleSwitcherOrb.show(context);
              }
            },
            onLongPress: () {
              HapticFeedbackWrapper().heavy();
              VoiceAssistantPalette.show(context);
            },
            child: Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF8B5CF6).withOpacity(0.5),
                    blurRadius: 24,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: const RizikMojo(),
            ),
          ),
          
          // Wallet Button
          _buildNavButton(
            icon: Icons.account_balance_wallet,
            label: 'Wallet',
            color: const Color(0xFFF59E0B),
            isActive: _currentFeature == 2,
            onTap: () => _goToPage(2),
          ),
        ],
      ),
    );
  }

  void _goToPage(int page) {
    _horizontalController.animateToPage(
      page,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOutCubic,
    );
    HapticFeedback.lightImpact();
  }

  Widget _buildNavButton({
    required IconData icon,
    required String label,
    required Color color,
    required bool isActive,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        decoration: BoxDecoration(
          color: isActive ? color.withOpacity(0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(24),
          border: isActive ? Border.all(color: color.withOpacity(0.5)) : null,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: isActive ? color : Colors.white54, size: 26),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive ? color : Colors.white54,
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEdgeIndicators() {
    return IgnorePointer(
      child: Stack(
        children: [
          if (_currentFeature > 0)
            Positioned(
              left: 0, top: 0, bottom: 0, width: 4,
              child: Container(color: const Color(0xFF10B981).withOpacity(0.3)),
            ),
          if (_currentFeature < 2)
            Positioned(
              right: 0, top: 0, bottom: 0, width: 4,
              child: Container(color: const Color(0xFFF59E0B).withOpacity(0.3)),
            ),
        ],
      ),
    );
  }

  void _showComments(VideoContent video) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black.withOpacity(0.95),
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6, minChildSize: 0.3, maxChildSize: 0.9, expand: false,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey[600], borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Text('${video.comments} Comments', style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  void _shareVideo(VideoContent video) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('Sharing: ${video.title}'), backgroundColor: const Color(0xFF8B5CF6)),
    );
  }

  void _showMore(VideoContent video) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black.withOpacity(0.95),
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.download, color: Colors.white),
              title: const Text('Download', style: TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.report, color: Colors.white),
              title: const Text('Report', style: TextStyle(color: Colors.white)),
              onTap: () => Navigator.pop(context),
            ),
          ],
        ),
      ),
    );
  }
}
