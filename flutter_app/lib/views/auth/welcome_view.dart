import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/app_state.dart';
import '../../models/models.dart';
import 'signup_view.dart';
import 'login_view.dart';

class WelcomeView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context, listen: false);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildHeader(),
              SizedBox(height: 48),
              _buildRoleCard(
                context,
                title: "I need to hire someone",
                subtitle: "Find the best local talent for your tasks",
                icon: Icons.person_search,
                color: Color(0xFF1A6B3C),
                onTap: () {
                  state.setAuthRole(AccountRole.customer);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => SignupView()));
                },
              ),
              SizedBox(height: 20),
              _buildRoleCard(
                context,
                title: "I want to offer my services",
                subtitle: "Join our network of skilled providers",
                icon: Icons.work_outline,
                color: Color(0xFFF5A623),
                onTap: () {
                  state.setAuthRole(AccountRole.provider);
                  Navigator.push(context, MaterialPageRoute(builder: (_) => SignupView()));
                },
              ),
              SizedBox(height: 32),
              TextButton(
                onPressed: () {
                  Navigator.push(context, MaterialPageRoute(builder: (_) => LoginView()));
                },
                child: RichText(
                  text: TextSpan(
                    text: "Already have an account? ",
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                    children: [
                      TextSpan(
                        text: "Log In",
                        style: TextStyle(
                          color: Color(0xFF1A6B3C),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Image.network(
          'https://wantok.dspng.tech/logo.png',
          height: 80,
          errorBuilder: (_, __, ___) => Icon(Icons.handshake, size: 80, color: Color(0xFF1A6B3C)),
        ),
        SizedBox(height: 16),
        Text(
          "WANTOK WORKFORCE",
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
            color: Color(0xFF0F4024),
          ),
        ),
        SizedBox(height: 8),
        Text(
          "The trusted on-demand platform for PNG",
          textAlign: TextAlign.center,
          style: TextStyle(color: Colors.grey[600], fontSize: 14),
        ),
      ],
    );
  }

  Widget _buildRoleCard(
    BuildContext context, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: EdgeInsets.all(24),
          decoration: BoxDecoration(
            border: Border.all(color: Colors.grey[200]!),
            borderRadius: BorderRadius.circular(20),
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.05),
                blurRadius: 10,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            children: [
              Container(
                padding: EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  shape: BoxShape.circle,
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1A1A2E),
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right, color: Colors.grey[400]),
            ],
          ),
        ),
      ),
    );
  }
}
