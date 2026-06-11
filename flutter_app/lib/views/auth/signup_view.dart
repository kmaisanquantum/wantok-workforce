import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../state/app_state.dart';
import '../../models/models.dart';

class SignupView extends StatefulWidget {
  @override
  _SignupViewState createState() => _SignupViewState();
}

class _SignupViewState extends State<SignupView> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  String? _selectedLocation;
  String? _selectedSkill;

  final List<String> _locations = ["Port Moresby", "Lae", "Mount Hagen", "Goroka", "Madang", "Alotau"];
  final List<String> _skills = ["IT Support", "Logistics", "Trades", "Domestic", "Medical", "Professional"];

  @override
  Widget build(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isProvider = state.currentRole == AccountRole.provider;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new, color: Colors.black, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          "Create ${isProvider ? 'Provider' : 'Customer'} Account",
          style: TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildTextField("Full Name", _nameController, Icons.person_outline),
                SizedBox(height: 16),
                _buildTextField("Mobile Number", _phoneController, Icons.phone_android_outlined, isPhone: true),
                SizedBox(height: 16),
                _buildTextField("Email Address", _emailController, Icons.mail_outline),
                SizedBox(height: 16),
                if (!isProvider) ...[
                  _buildDropdown("Location / District", _locations, _selectedLocation, (val) {
                    setState(() => _selectedLocation = val);
                  }),
                ] else ...[
                  _buildDropdown("Primary Skill Category", _skills, _selectedSkill, (val) {
                    setState(() => _selectedSkill = val);
                  }),
                ],
                SizedBox(height: 16),
                _buildTextField("Password", _passwordController, Icons.lock_outline, isPassword: true),
                SizedBox(height: 16),
                _buildTextField("Confirm Password", _confirmPasswordController, Icons.lock_reset_outlined, isPassword: true),
                SizedBox(height: 32),
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: state.isLoading ? null : () => _handleSignup(state),
                    style: ElevatedButton.styleFrom(
                      primary: Color(0xFF1A6B3C),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                    ),
                    child: state.isLoading
                        ? CircularProgressIndicator(color: Colors.white)
                        : Text("SIGN UP", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, IconData icon, {bool isPassword = false, bool isPhone = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey[700])),
        SizedBox(height: 8),
        TextFormField(
          controller: controller,
          obscureText: isPassword,
          keyboardType: isPhone ? TextInputType.phone : (label.contains("Email") ? TextInputType.emailAddress : TextInputType.text),
          validator: (value) {
            if (value == null || value.isEmpty) return "Please enter ${label.toLowerCase()}";
            if (isPhone && !RegExp(r'^\d{7,10}$').hasMatch(value)) return "Enter a valid PNG phone number";
            if (isPassword && value.length < 6) return "Password must be at least 6 characters";
            if (label == "Confirm Password" && value != _passwordController.text) return "Passwords do not match";
            return null;
          },
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

  Widget _buildDropdown(String label, List<String> items, String? currentVal, Function(String?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.grey[700])),
        SizedBox(height: 8),
        DropdownButtonFormField<String>(
          value: currentVal,
          onChanged: onChanged,
          validator: (val) => val == null ? "Please select ${label.toLowerCase()}" : null,
          items: items.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
          decoration: InputDecoration(
            prefixIcon: Icon(Icons.location_on_outlined, size: 20, color: Color(0xFF1A6B3C)),
            filled: true,
            fillColor: Color(0xFFF9F9F9),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          ),
        ),
      ],
    );
  }

  Future<void> _handleSignup(AppState state) async {
    if (_formKey.currentState!.validate()) {
      final success = await state.signup({
        "name": _nameController.text,
        "phone": _phoneController.text,
        "email": _emailController.text,
        "password": _passwordController.text,
        "role": state.currentRole.name,
        "location": _selectedLocation,
        "primarySkill": _selectedSkill,
      });

      if (success) {
        // Success routing is handled by the main app shell observation of state
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Signup failed. Please try again.")));
      }
    }
  }
}
