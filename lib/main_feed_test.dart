import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/feed_ui/feed_ui.dart';

/// Rizik AI Video Feed - TikTok-style 4-way navigation
/// Displays all AI-generated videos from Wan 2.2 pipeline
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase for video fetching
  await Supabase.initialize(
    url: 'https://dxekolvveoadbaftfsmy.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZWtvbHZ2ZW9hZGJhZnRmc215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzczMTEsImV4cCI6MjA2ODg1MzMxMX0.TRM9nL85CLLjvR5XfZ7YBncwqn0EybTVtt8a46NlZRg',
  );
  
  runApp(const RizikVideoFeedApp());
}

class RizikVideoFeedApp extends StatelessWidget {
  const RizikVideoFeedApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Rizik AI Video Feed',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
      ),
      home: const RizikVideoFeed(),
    );
  }
}

/// All AI-generated videos from Wan 2.2 TURBO pipeline
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

/// Video catalog - All generated videos
final List<VideoContent> generatedVideos = [
  // PRAN Bangladesh Ad
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768173813.mp4',
    title: 'PRAN Bangladesh',
    description: '🥤 PRAN - Pure & Natural! Fresh mango juice for your family. Made with love in Bangladesh 🇧🇩 #PRAN #Bangladesh',
    creator: '@PRAN_Official',
    flowBadge: '🥤 BEVERAGE',
    likes: 15420,
    comments: 892,
  ),
  // Chillox Restaurant Ad
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768172687.mp4',
    title: 'Chillox Restaurant',
    description: '🍔 Chillox - Where taste meets chill! Come enjoy our signature burgers & fried chicken 🍗 #Chillox #FoodLovers',
    creator: '@Chillox_BD',
    flowBadge: '🍔 FOOD',
    likes: 8934,
    comments: 456,
  ),
  // Night Market Scene (Clean 9/10)
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768171454.mp4',
    title: 'Night Food Market',
    description: '🌙 Late night cravings? We got you covered! Street food vibes at its best ✨ #StreetFood #NightMarket',
    creator: '@FoodieStreets',
    flowBadge: '🌙 NIGHT VIBES',
    likes: 12567,
    comments: 734,
  ),
  // Food Commercial (First successful)
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan22_turbo/1768169688.mp4',
    title: 'Food Commercial',
    description: '🔥 Sizzling hot! Fresh from the kitchen to your table. Taste the difference! #FoodAd #Delicious',
    creator: '@FoodStudio',
    flowBadge: '🔥 HOT',
    likes: 9821,
    comments: 523,
  ),
  // Original Wan2GP test
  const VideoContent(
    videoUrl: 'https://pub-b00b750231d04ca29f9683a360790349.r2.dev/wan2gp/1768164188.mp4',
    title: 'Biryani Special',
    description: '🍚 Authentic biryani with all the flavors! Steam rising, spices dancing 🌶️ #Biryani #DesiFood',
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
  // Vertical PageView controller (up/down)
  late PageController _verticalController;
  // Current page index
  int _currentIndex = 0;
  // Like states
  List<bool> _likeStates = [];
  List<int> _likeCounts = [];
  
  // Videos from Supabase
  List<VideoContent> _allVideos = [];
  bool _isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _verticalController = PageController();
    _subscribeToVideos();
  }
  
  void _subscribeToVideos() {
    // Listen to real-time changes in generated_videos table
    Supabase.instance.client
        .from('generated_videos')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .limit(20)
        .listen((List<Map<String, dynamic>> data) {
          
      final supabaseVideos = data.map((json) => VideoContent(
        videoUrl: json['video_url'] ?? '',
        title: json['product_name'] ?? 'AI Generated',
        description: '🚀 ${json['product_name'] ?? 'Product'} - AI Generated Ad! ${json['video_prompt']?.substring(0, 50) ?? ''}... #RizikAI',
        creator: '@Rizik_AI',
        flowBadge: '🤖 ${json['product_type']?.toUpperCase() ?? 'AI'}',
        likes: 0,
        comments: 0,
      )).toList();
      
      if (mounted) {
        setState(() {
          _allVideos = supabaseVideos;
          // Only reset like states if list length changed significantly to avoid resetting user interaction
          if (_likeStates.length != _allVideos.length) {
             _likeStates = List.filled(_allVideos.length, false);
             _likeCounts = _allVideos.map((v) => v.likes).toList();
          }
          _isLoading = false;
        });
        debugPrint('🔥 Realtime Update: ${_allVideos.length} videos loaded');
      }
    }, onError: (error) {
      debugPrint('❌ Supabase Realtime Error: $error');
      // Fallback if stream fails
      if (_allVideos.isEmpty && mounted) {
        setState(() {
            _allVideos = generatedVideos; // From mock data
            _isLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _verticalController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Show loading while fetching from Supabase
    if (_isLoading) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: const [
              CircularProgressIndicator(color: Color(0xFF8B5CF6)),
              SizedBox(height: 16),
              Text(
                'Loading AI Videos...',
                style: TextStyle(color: Colors.white70),
              ),
            ],
          ),
        ),
      );
    }
    
    // Immersive mode after loading
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
    
    return Scaffold(
      backgroundColor: Colors.black,
      body: PageView.builder(
        controller: _verticalController,
        scrollDirection: Axis.vertical, // Up/Down navigation
        itemCount: _allVideos.length,
        onPageChanged: (index) {
          setState(() => _currentIndex = index);
          HapticFeedback.lightImpact();
        },
        itemBuilder: (context, index) {
          final video = _allVideos[index];
          return _buildVideoPage(video, index);
        },
      ),
    );
  }

  Widget _buildVideoPage(VideoContent video, int index) {
    return RizikFeedScaffold(
      // Video backdrop (AI-generated from Wan 2.2)
      videoUrl: video.videoUrl,
      
      // Creator info
      creatorUsername: video.creator,
      creatorAvatarUrl: 'https://i.pravatar.cc/150?img=${index + 10}',
      isVerified: true,
      
      // Content
      description: video.description,
      flowBadge: video.flowBadge,
      audioTitle: 'Original Sound - ${video.creator}',
      
      // Engagement
      likeCount: _likeCounts[index],
      commentCount: video.comments,
      shareCount: (video.likes * 0.1).toInt(),
      isLiked: _likeStates[index],
      
      // User
      userAvatarUrl: 'https://i.pravatar.cc/150?img=5',
      balanceText: '৳12,500',
      
      // Categories
      flowCategories: const ['All', 'Food', 'Brand', 'Market', 'Desi'],
      selectedCategoryIndex: 0,
      onCategorySelected: (i) {},
      
      // Callbacks
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
      onOrbTap: () => debugPrint('Orb tapped'),
      onOrbLongPress: () => debugPrint('Voice AI activated'),
      onSearchTap: () => debugPrint('Search'),
      onNotificationTap: () => debugPrint('Notifications'),
    );
  }

  void _showComments(VideoContent video) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.black.withOpacity(0.95),
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.3,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[600],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                '${video.comments} Comments',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _shareVideo(VideoContent video) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Sharing: ${video.title}'),
        backgroundColor: const Color(0xFF8B5CF6),
      ),
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
              title: const Text('Download Video', style: TextStyle(color: Colors.white)),
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Downloading...')),
                );
              },
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
