enum PaymentMethodType {
  cash,
  card,
  mobileBanking,
  wallet,
}

class PaymentMethod {
  final PaymentMethodType type;
  final String name;
  final String icon;
  final String? description;
  final bool isEnabled;

  const PaymentMethod({
    required this.type,
    required this.name,
    required this.icon,
    this.description,
    this.isEnabled = true,
  });

  static const List<PaymentMethod> availableMethods = [
    PaymentMethod(
      type: PaymentMethodType.cash,
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay with cash when your order arrives',
    ),
    PaymentMethod(
      type: PaymentMethodType.card,
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay securely with your card',
    ),
    PaymentMethod(
      type: PaymentMethodType.mobileBanking,
      name: 'Mobile Banking',
      icon: '📱',
      description: 'bKash, Nagad, Rocket',
    ),
    PaymentMethod(
      type: PaymentMethodType.wallet,
      name: 'Rizik Wallet',
      icon: '👛',
      description: 'Use your wallet balance',
    ),
  ];
}

class MobileBankingProvider {
  final String name;
  final String logo;
  final String accountNumber;

  const MobileBankingProvider({
    required this.name,
    required this.logo,
    required this.accountNumber,
  });

  static const List<MobileBankingProvider> providers = [
    MobileBankingProvider(
      name: 'bKash',
      logo: '🟣',
      accountNumber: '01XXX-XXXXXX',
    ),
    MobileBankingProvider(
      name: 'Nagad',
      logo: '🟠',
      accountNumber: '01XXX-XXXXXX',
    ),
    MobileBankingProvider(
      name: 'Rocket',
      logo: '🔵',
      accountNumber: '01XXX-XXXXXX',
    ),
  ];
}
