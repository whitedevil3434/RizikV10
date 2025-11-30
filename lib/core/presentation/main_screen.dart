import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../routes/app_routes.dart';
import 'package:rizik_v4/core/sdui/widgets/visuals/rizik_mojo.dart';
import 'package:rizik_v4/core/theme/rizik_brand_colors.dart';

class MainScreen extends StatefulWidget {
  final Widget child;

  const MainScreen({super.key, required this.child});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      floatingActionButton: Container(
        height: 72,
        width: 72,
        margin: const EdgeInsets.only(top: 24),
        child: const RizikMojo(),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: NavigationBarTheme(
        data: NavigationBarThemeData(
          indicatorColor: RizikBrandColors.primary.withOpacity(0.1),
          labelTextStyle: MaterialStateProperty.all(
            const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          onDestinationSelected: (index) => _onItemTapped(context, index),
          backgroundColor: Colors.white,
          elevation: 3,
          height: 65,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home, color: RizikBrandColors.primary),
              label: 'Home',
            ),
            NavigationDestination(
              icon: Icon(Icons.shopping_bag_outlined),
              selectedIcon: Icon(Icons.shopping_bag, color: RizikBrandColors.primary),
              label: 'Bazar',
            ),
            // Empty destination for the Mojo button
            NavigationDestination(
              icon: SizedBox.shrink(),
              label: '',
              enabled: false,
            ),
            NavigationDestination(
              icon: Icon(Icons.receipt_long_outlined),
              selectedIcon: Icon(Icons.receipt_long, color: RizikBrandColors.primary),
              label: 'Orders',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline),
              selectedIcon: Icon(Icons.person, color: RizikBrandColors.primary),
              label: 'Profile',
            ),
          ],
        ),
      ),
    );
  }

  void _onItemTapped(BuildContext context, int index) {
    if (index == _currentIndex) return;
    
    setState(() {
      _currentIndex = index;
    });

    switch (index) {
      case 0:
        context.go(AppRoutes.home);
        break;
      case 1:
        context.go(AppRoutes.bazar);
        break;
      case 2:
        // Mojo button - handled by FAB
        break;
      case 3:
        context.go(AppRoutes.orders);
        break;
      case 4:
        context.go(AppRoutes.profile);
        break;
    }
  }
}
