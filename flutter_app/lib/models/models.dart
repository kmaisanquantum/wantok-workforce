/**
 * Core Data Models and Role Enums for Wantok Workforce
 */

enum AccountRole { customer, provider, admin }

enum WorkerStatus { available, busy, offline }

class Category {
  final String id;
  final String label;
  final String icon;
  final int color;

  Category({
    required this.id,
    required this.label,
    required this.icon,
    required this.color,
  });
}

class WorkerProfile {
  final String id;
  final String name;
  final String role;
  final double rating;
  final int reviews;
  final String location;
  final bool isVerified;
  final WorkerStatus status;
  final List<String> tags;
  final String avatarUrl;

  WorkerProfile({
    required this.id,
    required this.name,
    required this.role,
    required this.rating,
    required this.reviews,
    required this.location,
    required this.isVerified,
    required this.status,
    required this.tags,
    required this.avatarUrl,
  });

  factory WorkerProfile.fromJson(Map<String, dynamic> json) {
    return WorkerProfile(
      id: json['id'],
      name: json['name'],
      role: json['role'],
      rating: (json['rating'] as num).toDouble(),
      reviews: json['reviews'],
      location: json['location'],
      isVerified: json['isVerified'],
      status: WorkerStatus.values.firstWhere((e) => e.name == json['status']),
      tags: List<String>.from(json['tags']),
      avatarUrl: json['avatarUrl'],
    );
  }
}

class TransactionLog {
  final String id;
  final String type;
  final double amount;
  final DateTime timestamp;
  final String details;

  TransactionLog({
    required this.id,
    required this.type,
    required this.amount,
    required this.timestamp,
    required this.details,
  });
}
