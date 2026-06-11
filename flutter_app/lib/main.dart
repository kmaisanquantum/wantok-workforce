import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'state/app_state.dart';
import 'models/models.dart';
import 'views/customer_view.dart';
import 'views/provider_view.dart';
import 'views/admin_view.dart';
import 'views/auth/welcome_view.dart';

void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => AppState(),
      child: WantokApp(),
    ),
  );
}

class WantokApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Wantok Workforce',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: Color(0xFF1A6B3C),
        colorScheme: ColorScheme.fromSeed(
          seedColor: Color(0xFF1A6B3C),
          primary: Color(0xFF1A6B3C),
          secondary: Color(0xFFF5A623),
        ),
        scaffoldBackgroundColor: Color(0xFFF0F4F0),
        fontFamily: 'Inter',
      ),
      home: AppShell(),
    );
  }
}

class AppShell extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    if (!state.isAuthenticated) {
      return WelcomeView();
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            Image.network('https://wantok.dspng.tech/logo.png', height: 32, errorBuilder: (_, __, ___) => Icon(Icons.handshake, color: Color(0xFF1A6B3C))),
            SizedBox(width: 10),
            Text('WANTOK', style: TextStyle(color: Colors.black, fontWeight: FontWeight.w900, fontSize: 16)),
          ],
        ),
        actions: [
          _buildUserAction(context, state),
        ],
      ),
      body: AnimatedSwitcher(
        duration: Duration(milliseconds: 500),
        child: _getBody(state.currentRole),
      ),
      bottomNavigationBar: _buildBottomNav(state.currentRole),
    );
  }

  Widget _getBody(AccountRole role) {
    switch (role) {
      case AccountRole.customer:
        return CustomerView(key: ValueKey('customer'));
      case AccountRole.provider:
        return ProviderView(key: ValueKey('provider'));
      case AccountRole.admin:
        return AdminView(key: ValueKey('admin'));
    }
  }

  Widget _buildUserAction(BuildContext context, AppState state) {
    return PopupMenuButton<String>(
      icon: Icon(Icons.account_circle, color: Color(0xFF1A6B3C)),
      onSelected: (val) {
        if (val == 'logout') state.logout();
      },
      itemBuilder: (context) => [
        PopupMenuItem(enabled: false, child: Text('Hi, ${state.currentUser?.name ?? "User"}')),
        PopupMenuItem(value: 'logout', child: Row(
          children: [
            Icon(Icons.logout, size: 18, color: Colors.red),
            SizedBox(width: 8),
            Text('Logout', style: TextStyle(color: Colors.red)),
          ],
        )),
      ],
    );
  }

  Widget _buildBottomNav(AccountRole role) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      selectedItemColor: Color(0xFF1A6B3C),
      unselectedItemColor: Colors.grey,
      currentIndex: 0,
      items: [
        BottomNavigationBarItem(icon: Icon(Icons.home_filled), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Explore'),
        BottomNavigationBarItem(icon: Icon(Icons.calendar_today), label: 'Bookings'),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
      ],
    );
  }
}
