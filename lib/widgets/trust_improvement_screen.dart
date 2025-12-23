import 'package:flutter/material.dart';
import 'package:rizik_v4/data/models/trust_score.dart';

class TrustImprovementScreen extends StatelessWidget {
  final TrustScore trustScore;
  final bool showBengali;

  const TrustImprovementScreen({
    super.key,
    required this.trustScore,
    this.showBengali = false,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(showBengali ? 'ট্রাস্ট স্কোর উন্নতি' : 'Improve Trust Score'),
      ),
      body: Center(
        child: Text(
          showBengali 
            ? 'শীঘ্রই আসছে...' 
            : 'Coming Soon...',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
      ),
    );
  }
}
