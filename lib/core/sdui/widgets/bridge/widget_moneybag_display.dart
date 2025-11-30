import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/moneybag_provider.dart';
import 'package:rizik_v4/data/models/moneybag.dart';
import 'package:rizik_v4/features/fintech/wallet/presentation/moneybag_card.dart';

class WidgetMoneybagDisplay extends StatelessWidget {
  final Map<String, dynamic> data;

  const WidgetMoneybagDisplay({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    final effectiveData = data['data'] is Map<String, dynamic> 
        ? data['data'] as Map<String, dynamic> 
        : data;
    final typeStr = effectiveData['wallet_type'] as String? ?? 'personal';
    final MoneybagType type = _parseType(typeStr);

    return Consumer<MoneybagProvider>(
      builder: (context, provider, child) {
        final moneybag = provider.moneybags[type];
        final balance = moneybag?.balance ?? 0.0;

        // Prepare data for MoneyBagCard
        final cardData = {
          'balance': '৳ ${balance.toStringAsFixed(0)}',
          'label': _getTypeName(type),
          'show_add_button': true, // Could be dynamic based on user role/permissions
        };

        return MoneyBagCard(data: cardData);
      },
    );
  }

  MoneybagType _parseType(String type) {
    switch (type.toLowerCase()) {
      case 'partner': return MoneybagType.partner;
      case 'rider': return MoneybagType.rider;
      case 'escrow': return MoneybagType.escrow;
      case 'personal':
      default: return MoneybagType.personal;
    }
  }

  String _getTypeName(MoneybagType type) {
    switch (type) {
      case MoneybagType.personal: return 'Personal Wallet';
      case MoneybagType.partner: return 'Partner Wallet';
      case MoneybagType.rider: return 'Rider Wallet';
      case MoneybagType.escrow: return 'Escrow Wallet';
    }
  }
}
