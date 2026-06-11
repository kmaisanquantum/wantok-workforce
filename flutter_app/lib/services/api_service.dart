import 'package:dio/dio.dart';
import '../models/models.dart';

/**
 * Optimized Networking Service for wantok.dspng.tech
 * Uses Dio for interceptors and performance.
 */
class ApiService {
  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.wantok.dspng.tech',
    connectTimeout: const Duration(seconds: 5),
    receiveTimeout: const Duration(seconds: 3),
  ));

  // Singleton pattern for global access
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  /// Fetch workers by category with geo-coordinates for PNG localized search
  Future<List<WorkerProfile>> fetchWorkersByCategory(
    String category,
    double lng,
    double lat,
  ) async {
    try {
      final response = await _dio.get('/workers/search', queryParameters: {
        'category': category,
        'lng': lng,
        'lat': lat,
      });

      if (response.statusCode == 200) {
        return (response.data as List)
            .map((json) => WorkerProfile.fromJson(json))
            .toList();
      }
      return [];
    } catch (e) {
      // Handle error (logging, analytics)
      return [];
    }
  }

  /// Real-time provider availability status sync
  Future<bool> switchProviderStatus(String status) async {
    try {
      final response = await _dio.post('/provider/status', data: {
        'status': status,
      });
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }

  /// Atomic micro-debit lookup for wallet match unlock
  Future<Map<String, dynamic>?> triggerWalletMatchUnlock(String workerUid) async {
    try {
      final response = await _dio.post('/wallet/unlock', data: {
        'workerUid': workerUid,
      });
      return response.data;
    } catch (e) {
      return null;
    }
  }

  /// Upload portfolio image with compression handled client-side
  Future<bool> uploadPortfolioImage(List<int> bytes, String fileName) async {
    try {
      FormData formData = FormData.fromMap({
        "file": MultipartFile.fromBytes(bytes, filename: fileName),
      });
      final response = await _dio.post('/provider/portfolio/upload', data: formData);
      return response.statusCode == 200;
    } catch (e) {
      return false;
    }
  }
}
