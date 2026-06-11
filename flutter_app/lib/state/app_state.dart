import 'package:flutter/material.dart';
import '../models/models.dart';

/**
 * Global State Management for Wantok Workforce
 * Handles role-based UI morphing and global states.
 */
class AppState extends ChangeNotifier {
  AccountRole _currentRole = AccountRole.customer;
  WorkerStatus _providerStatus = WorkerStatus.offline;
  bool _isLoading = false;

  AccountRole get currentRole => _currentRole;
  WorkerStatus get providerStatus => _providerStatus;
  bool get isLoading => _isLoading;

  /// Morph the application between roles with state notification
  void switchRole(AccountRole newRole) {
    if (_currentRole == newRole) return;
    _currentRole = newRole;
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
