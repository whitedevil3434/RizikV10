import 'package:url_launcher/url_launcher.dart';

/// PaymentWrapper - Payment Gateway Integration
/// Handles Bkash, Nagad, and other payment methods via deep links or SDKs
class PaymentWrapper {
  static final PaymentWrapper _instance = PaymentWrapper._internal();
  factory PaymentWrapper() => _instance;
  PaymentWrapper._internal();

  /// Pay with Bkash (Deep Link / Web)
  Future<void> payWithBkash(String amount, String invoiceId) async {
    // Placeholder for Bkash payment URL
    final url = Uri.parse('https://payment.bkash.com/pay?amount=$amount&invoice=$invoiceId');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch Bkash payment';
    }
  }

  /// Pay with Nagad (Deep Link / Web)
  Future<void> payWithNagad(String amount, String invoiceId) async {
    // Placeholder for Nagad payment URL
    final url = Uri.parse('https://payment.nagad.com.bd/pay?amount=$amount&invoice=$invoiceId');
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch Nagad payment';
    }
  }

  /// Pay with Stripe (Future)
  Future<void> payWithStripe() async {
    // TODO: Implement Stripe SDK
  }
}

/// Global instance
final paymentWrapper = PaymentWrapper();
