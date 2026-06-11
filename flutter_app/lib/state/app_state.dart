import 'package:flutter/material.dart';
import '../models/models.dart';
import '../services/api_service.dart';

/**
 * Global State Management for Wantok Workforce
 * Handles role-based UI morphing and global states.
 */
class AppState extends ChangeNotifier {
  final ApiService _api = ApiService();

  AccountRole _currentRole = AccountRole.customer;
  WorkerStatus _providerStatus = WorkerStatus.offline;
  User? _currentUser;
  bool _isAuthenticated = false;
  bool _isLoading = false;

  AccountRole get currentRole => _currentRole;
  WorkerStatus get providerStatus => _providerStatus;
  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  bool get isLoading => _isLoading;

  /// Set selected role during auth flow
  void setAuthRole(AccountRole role) {
    _currentRole = role;
    notifyListeners();
  }

  /// Morph the application between roles with state notification
  void switchRole(AccountRole newRole) {
    if (_currentRole == newRole) return;
    _currentRole = newRole;
    notifyListeners();
  }

  /// Handle User Login
  Future<bool> login(String identifier, String password) async {
    _isLoading = true;
    notifyListeners();

    final response = await _api.login(identifier, password);

    if (response != null) {
      _currentUser = response.user;
      _currentRole = response.user.role;
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// Handle User Signup
  Future<bool> signup(Map<String, dynamic> signupData) async {
    _isLoading = true;
    notifyListeners();

    final response = await _api.signup(signupData);

    if (response != null) {
      _currentUser = response.user;
      _currentRole = response.user.role;
      _isAuthenticated = true;
      _isLoading = false;
      notifyListeners();
      return true;
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// Logout User
  void logout() {
    _currentUser = null;
    _isAuthenticated = false;
    _currentRole = AccountRole.customer;
    notifyListeners();
  }

  /// Sync provider status across the app
  void updateProviderStatus(WorkerStatus status) {
    _providerStatus = status;
    notifyListeners();
  }

  void setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }
}
