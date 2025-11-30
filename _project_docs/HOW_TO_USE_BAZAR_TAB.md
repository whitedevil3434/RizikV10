# How to Use Bazar Tab - Developer Guide

## Quick Start

The Bazar Tab ecosystem consists of 5 core services that work together to create a complete social commerce platform.

---

## 1. Feed Filtering & Ranking

### Basic Usage
```dart
import 'package:your_app/services/bazar_feed_engine.dart';
import 'package:your_app/services/role_context_manager.dart';

// Initialize
final roleContext = RoleContextManager();
final feedEngine = BazarFeedEngine(contextManager: roleContext);

// Filter content by role
final filtered = feedEngine.filterContentByRole(allFeedItems);

// Rank by score
final ranked = feedEngine.rankFeedItems(filtered);

// Filter by location (5km radius)
final nearby = feedEngine.filterByRadius(ranked, 5.0);
```

### Advanced Usage
```dart
// Get feed statistics
final stats = feedEngine.getFeedStats(items);
print('Total: ${stats['totalItems']}');
print('Average distance: ${stats['averageDistance']}km');

// Calculate item score
final score = feedEngine.calculateFeedItemScore(item);
print('Item score: $score');

// Track engagement
feedEngine.trackView(item);
feedEngine.trackInteraction(item, 'like');
```

---

## 2. Video Player & Monetization

### Video Player
```dart
import 'package:your_app/widgets/rizik_vibes_player.dart';

RizikVibesPlayer(
  videos: vibeVideos,
  initialIndex: 0,
  onVideoView: (video) {
    // Track view
    analytics.logVideoView(video.id);
  },
  onVideoLike: (video) {
    // Handle like
    videoService.likeVideo(video.id);
  },
  onVideoShare: (video) {
    // Handle share
    shareService.shareVideo(video);
  },
  onInstantOrder: (video, itemId) {
    // Handle instant order
    orderService.createOrder(itemId, video.linkedFoodId);
  },
)
```

### Monetization Calculator
```dart
import 'package:your_app/services/video_monetization_calculator.dart';

final calculator = VideoMonetizationCalculator();

// Calculate view earnings
final viewEarnings = calculator.calculateViewEarnings(
  viewCount: 10000,
  viewEarningRate: 35.0,
  creatorTrustScore: 4.5,
  isViral: true,
);
print('View earnings: ৳$viewEarnings');

// Calculate commission
final commission = calculator.calculateCommissionEarnings(
  orderValue: 500.0,
  commissionRate: 15.0,
  creatorTrustScore: 4.5,
);
print('Commission: ৳$commission');

// Calculate total earnings
final breakdown = calculator.calculateTotalEarnings(
  video: video,
  orderValues: [500, 300, 450],
);
print('Total: ৳${breakdown.totalEarnings}');
print('Views: ৳${breakdown.viewEarnings}');
print('Commissions: ৳${breakdown.commissionEarnings}');

// Process payout
final payout = calculator.payoutCreator(
  creatorId: 'creator123',
  amount: breakdown.totalEarnings,
  videoId: video.id,
  paymentMethod: 'bKash',
);
```

### Discount Popup
```dart
import 'package:your_app/widgets/video_end_discount_popup.dart';

// Show popup when video ends
final accepted = await showVideoEndDiscountPopup(
  context: context,
  video: video,
  onOrderNow: () {
    // Handle order
    orderService.createOrder(video.linkedFoodId);
  },
  discountPercentage: 15,
  discountDuration: Duration(minutes: 5),
);

if (accepted == true) {
  print('User ordered with discount!');
}
```

---

## 3. Variable Rewards

### Generate Rewards
```dart
import 'package:your_app/services/variable_reward_distributor.dart';

final distributor = VariableRewardDistributor();

// Generate reward on trigger
final reward = distributor.generateReward(
  userId: 'user123',
  trigger: RewardTrigger.videoLike,
  trustScoreMultiplier: 1.3,
  auraLevel: 5,
);

if (reward != null) {
  print('🎁 Reward: ${reward.type.label}');
  print('Value: ৳${reward.value}');
  print('Expires: ${reward.timeRemainingFormatted}');
  
  // Show reward popup
  showRewardPopup(context, reward);
}
```

### Check Eligibility
```dart
// Check if user can get reward
final timeLeft = distributor.getTimeUntilNextReward('user123');
if (timeLeft == Duration.zero) {
  print('User is eligible for reward!');
} else {
  print('Next reward in: ${timeLeft.inMinutes} minutes');
}

// Check remaining rewards today
final remaining = distributor.getRemainingRewardsToday('user123');
print('Remaining rewards today: $remaining');
```

---

## 4. Live Commerce Comment Parsing

### Parse Comments
```dart
import 'package:your_app/services/live_commerce_comment_parser.dart';

final parser = LiveCommerceCommentParser();

// Parse single comment
final intent = parser.parseComment(
  '2 plate dao',
  itemName: 'Chicken Biryani',
);

if (intent != null) {
  print('Quantity: ${intent.quantity}');
  print('Item: ${intent.itemName}');
  print('Confidence: ${intent.confidence}');
  print('Language: ${intent.language.label}');
}

// Parse multiple comments
final comments = [
  '2 plate dao',
  '৩টা চাই',
  'want one box',
];

final intents = parser.parseComments(
  comments,
  itemName: 'Chicken Biryani',
  minConfidence: 0.5,
);

print('Found ${intents.length} valid orders');
```

### Create Pending Orders
```dart
// Create pending order from comment
final order = parser.createPendingOrder(
  commentId: 'comment123',
  userId: 'user456',
  userName: 'Ahmed',
  videoId: 'video789',
  intent: intent!,
  itemId: 'item123',
  itemPrice: 450.0,
);

if (order != null) {
  print('Order created: ${order.id}');
  print('Total: ৳${order.totalPrice}');
  print('Expires in: ${order.timeRemaining.inMinutes} minutes');
  
  // Show confirmation to user
  showOrderConfirmation(context, order);
}
```

---

## 5. Dam Komao Bargaining

### Initiate Haggle
```dart
import 'package:your_app/services/dam_komao_engine.dart';

final damKomao = DamKomaoEngine();

// Consumer initiates haggle
final request = damKomao.initiateHaggle(
  consumerId: 'consumer123',
  consumerName: 'Ahmed',
  itemId: 'item456',
  itemName: 'Chicken Biryani',
  originalPrice: 500.0,
  targetPrice: 400.0,
  itemImage: 'https://example.com/image.jpg',
  quantity: 2,
  specialInstructions: 'Extra spicy',
  expiryDuration: Duration(hours: 2),
);

print('Request created: ${request.id}');
print('Discount: ${request.discountPercentage.toStringAsFixed(1)}%');
print('Expires in: ${request.timeRemaining.inHours} hours');
```

### Notify Partners
```dart
// Notify nearby partners
final notifiedPartners = await damKomao.notifyNearbyPartners(
  request: request,
  consumerLat: 23.8103,
  consumerLon: 90.4125,
  radiusKm: 5.0,
);

print('Notified ${notifiedPartners.length} partners');
```

### Submit Bid (Partner)
```dart
// Partner submits bid
try {
  final bid = damKomao.submitPartnerBid(
    requestId: request.id,
    partnerId: 'partner789',
    partnerName: 'Spice Kitchen',
    bidPrice: 420.0,
    partnerTrustScore: 4.5,
    partnerRating: 4.8,
    partnerAvatar: 'https://example.com/avatar.jpg',
    message: 'Fresh ingredients, ready in 30 min',
    preparationTime: Duration(minutes: 30),
  );
  
  print('Bid submitted: ৳${bid.bidPrice}');
} catch (e) {
  print('Bid failed: $e');
}
```

### View Bids (Consumer)
```dart
// Get all bids
final bids = damKomao.getBidsForRequest(request.id);
print('Total bids: ${bids.length}');

// Get ranked bids
final rankedBids = damKomao.getRankedBids(request.id);
for (final ranked in rankedBids) {
  print('${ranked.bid.partnerName}: ৳${ranked.bid.bidPrice}');
  print('Score: ${ranked.score.toStringAsFixed(1)}');
  print('Trust: ${ranked.bid.partnerTrustScore}');
  print('---');
}
```

### Accept Bid
```dart
// Consumer accepts winning bid
final order = await damKomao.acceptBid(
  requestId: request.id,
  bidId: winningBid.id,
  onNotifyWinner: (partnerId) async {
    // Notify winning partner
    await notificationService.send(
      partnerId,
      'Congratulations! Your bid was accepted!',
    );
  },
  onNotifyLosers: (partnerIds) async {
    // Notify losing partners
    for (final partnerId in partnerIds) {
      await notificationService.send(
        partnerId,
        'Better luck next time!',
      );
    }
  },
);

print('Order created: ${order.id}');
print('Final price: ৳${order.finalPrice}');
print('Savings: ৳${order.savingsAmount} (${order.savingsPercentage.toStringAsFixed(1)}%)');
```

---

## Common Patterns

### 1. Complete Video Flow
```dart
// User watches video
feedEngine.trackView(video);

// User likes video
feedEngine.trackInteraction(video, 'like');

// Check for reward
final reward = distributor.generateReward(
  userId: userId,
  trigger: RewardTrigger.videoLike,
  trustScoreMultiplier: userTrustScore,
  auraLevel: userAuraLevel,
);

// Calculate creator earnings
final earnings = calculator.calculateViewEarnings(
  viewCount: video.viewCount + 1,
  viewEarningRate: video.viewEarningRate,
  creatorTrustScore: video.creatorTrustScore,
  isViral: video.isViral,
);

// Video ends - show discount popup
if (video.isShoppable) {
  final ordered = await showVideoEndDiscountPopup(
    context: context,
    video: video,
    onOrderNow: () => createOrder(video.linkedFoodId),
  );
}
```

### 2. Complete Bargaining Flow
```dart
// 1. Consumer initiates
final request = damKomao.initiateHaggle(...);

// 2. Notify partners
await damKomao.notifyNearbyPartners(...);

// 3. Partners bid
for (final partner in partners) {
  damKomao.submitPartnerBid(...);
}

// 4. Consumer views bids
final rankedBids = damKomao.getRankedBids(request.id);

// 5. Consumer accepts
final order = await damKomao.acceptBid(...);

// 6. Award XP
auraService.awardXP(consumerId, 50);
auraService.awardXP(winnerId, 100);
```

### 3. Complete Live Commerce Flow
```dart
// 1. Parse comment
final intent = parser.parseComment(comment, itemName: itemName);

// 2. Create pending order
final order = parser.createPendingOrder(
  commentId: commentId,
  userId: userId,
  userName: userName,
  videoId: videoId,
  intent: intent!,
  itemPrice: itemPrice,
);

// 3. Show confirmation
final confirmed = await showOrderConfirmation(context, order);

// 4. If confirmed, create actual order
if (confirmed) {
  final actualOrder = await orderService.createOrder(order);
  
  // 5. Award creator commission
  final commission = calculator.calculateCommissionEarnings(
    orderValue: order.totalPrice!,
    commissionRate: video.commissionRate,
    creatorTrustScore: video.creatorTrustScore,
  );
}
```

---

## Error Handling

### Feed Engine
```dart
try {
  final filtered = feedEngine.filterContentByRole(items);
  final ranked = feedEngine.rankFeedItems(filtered);
} catch (e) {
  print('Feed error: $e');
  // Show cached feed or error message
}
```

### Dam Komao
```dart
try {
  final bid = damKomao.submitPartnerBid(...);
} on ArgumentError catch (e) {
  print('Invalid bid: $e');
  showError('Your bid price is not competitive');
} on StateError catch (e) {
  print('Request expired: $e');
  showError('This request has expired');
}
```

### Comment Parser
```dart
final intent = parser.parseComment(comment);
if (intent == null) {
  print('Could not parse comment');
} else if (intent.confidence < 0.7) {
  print('Low confidence, asking for confirmation');
  showConfirmation(intent);
} else {
  print('High confidence, auto-creating order');
  createOrder(intent);
}
```

---

## Testing

### Unit Tests
```dart
test('Feed filtering by role', () {
  final engine = BazarFeedEngine(contextManager: mockContext);
  final filtered = engine.filterContentByRole(testItems);
  expect(filtered.length, lessThan(testItems.length));
});

test('Monetization calculation', () {
  final calculator = VideoMonetizationCalculator();
  final earnings = calculator.calculateViewEarnings(
    viewCount: 1000,
    viewEarningRate: 35.0,
  );
  expect(earnings, 35.0);
});

test('Comment parsing', () {
  final parser = LiveCommerceCommentParser();
  final intent = parser.parseComment('2 plate dao');
  expect(intent?.quantity, 2);
});
```

---

## Performance Tips

1. **Cache feed results** for 15 minutes
2. **Batch comment parsing** for efficiency
3. **Lazy load videos** in player
4. **Debounce bid submissions** to prevent spam
5. **Use pagination** for large feeds

---

## Security Considerations

1. **Validate all prices** server-side
2. **Rate limit** bid submissions
3. **Verify trust scores** from backend
4. **Sanitize comments** before parsing
5. **Encrypt payment data**

---

## Next Steps

1. Integrate with backend APIs
2. Add real-time updates (WebSocket)
3. Implement push notifications
4. Add analytics tracking
5. Write property tests
6. Conduct user testing

---

**Happy coding! 🚀**
