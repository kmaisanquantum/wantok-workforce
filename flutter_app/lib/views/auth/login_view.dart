import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/app_state.dart';

class LoginView extends StatefulWidget {
  @override
  _LoginViewState createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final _formKey = GlobalKey<FormState>();
  final _identifierController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text("Welcome Back", style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Color(0xFF1A1A2E))),
              SizedBox(height: 8),
              Text("Sign in to continue your journey", style: TextStyle(color: Colors.grey[600])),
              SizedBox(height: 48),
              _buildTextField("Mobile Number or Email", _identifierController, Icons.person_outline),
              SizedBox(height: 24),
              _buildTextField("Password", _passwordController, Icons.lock_outline, isPassword: true),
              SizedBox(height: 40),
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: state.isLoading ? null : () => _handleLogin(state),
                  style: ElevatedButton.styleFrom(
                    primary: Color(0xFF1A6B3C),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: state.isLoading
                      ? CircularProgressIndicator(color: Colors.white)
                      : Text("LOG IN", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon, {bool isPassword = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey[700])),
        SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: isPassword,
          validator: (val) => val == null || val.isEmpty ? "Please enter ${label.toLowerCase()}" : null,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 20, color: Color(0xFF1A6B3C)),
            filled: true,
            fillColor: Color(0xFFF9F9F9),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }

  Future<void> _handleLogin(AppState state) async {
    if (_formKey.currentState!.validate()) {
      final success = await state.login(_identifierController.text, _passwordController.text);
      if (success) {
        // Main AppShell will react to auth state and route
        Navigator.of(context).popUntil((route) => route.isFirst);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Login failed. Check credentials.")));
      }
    }
  }
}
