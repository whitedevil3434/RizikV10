import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:rizik_v4/routes.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';
import 'package:provider/provider.dart' as provider;
import 'package:rizik_v4/features/seeker/marketplace/logic/order_provider.dart';
import 'package:rizik_v4/features/fintech/wallet/logic/moneybag_provider.dart';

class RizikApp extends ConsumerWidget {
  const RizikApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return provider.MultiProvider(
      providers: [
        provider.ChangeNotifierProvider(create: (_) => OrderProvider()),
        provider.ChangeNotifierProvider(create: (_) => MoneybagProvider()),
      ],
      child: MaterialApp.router(
        title: 'Rizik V10',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: RizikColors.rizikGreen,
            background: RizikColors.background,
          ),
          textTheme: GoogleFonts.hindSiliguriTextTheme(),
          scaffoldBackgroundColor: RizikColors.background,
        ),
        routerConfig: router,
      ),
    );
  }
}
