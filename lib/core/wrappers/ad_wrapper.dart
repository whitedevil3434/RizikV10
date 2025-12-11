import 'package:google_mobile_ads/google_mobile_ads.dart';
import 'dart:io';

/// AdWrapper - Monetization via Ads
/// Handles Banner, Interstitial, and Rewarded Ads
class AdWrapper {
  static final AdWrapper _instance = AdWrapper._internal();
  factory AdWrapper() => _instance;
  AdWrapper._internal();

  bool _isInitialized = false;

  /// Initialize AdMob
  Future<void> initialize() async {
    if (_isInitialized) return;
    await MobileAds.instance.initialize();
    _isInitialized = true;
  }

  /// Get Banner Ad Unit ID
  String get bannerAdUnitId {
    if (Platform.isAndroid) {
      return 'ca-app-pub-3940256099942544/6300978111'; // Test ID
    } else if (Platform.isIOS) {
      return 'ca-app-pub-3940256099942544/2934735716'; // Test ID
    }
    throw UnsupportedError('Unsupported platform');
  }

  /// Load Banner Ad
  BannerAd loadBannerAd({required Function() onLoaded, required Function(LoadAdError) onFailed}) {
    return BannerAd(
      adUnitId: bannerAdUnitId,
      request: const AdRequest(),
      size: AdSize.banner,
      listener: BannerAdListener(
        onAdLoaded: (_) => onLoaded(),
        onAdFailedToLoad: (ad, error) {
          ad.dispose();
          onFailed(error);
        },
      ),
    )..load();
  }

  // TODO: Implement Interstitial and Rewarded Ads
}

/// Global instance
final adWrapper = AdWrapper();
