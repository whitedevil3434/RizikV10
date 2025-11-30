import 'package:flutter/material.dart';
import 'package:rizik_v4/core/shell/rizik_scaffold.dart';

class SeekerHomeScreen extends StatelessWidget {
  const SeekerHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const RizikScaffold(initialRole: 'seeker');
  }
}
