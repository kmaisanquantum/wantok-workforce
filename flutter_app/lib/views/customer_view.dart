import 'package:flutter/material.dart';
import '../models/models.dart';

class CustomerView extends StatelessWidget {
  final List<Category> categories = [
    Category(id: '1', label: 'Electric', icon: '⚡', color: 0xFFFFE0B2),
    Category(id: '2', label: 'Plumbing', icon: '🔧', color: 0xFFE3F2FD),
    Category(id: '3', label: 'Carpentry', icon: '🪚', color: 0xFFF3E5F5),
    Category(id: '4', label: 'Finance', icon: '💼', color: 0xFFE8F5E9),
    Category(id: '5', label: 'Legal', icon: '⚖️', color: 0xFFFFEBEE),
    Category(id: '6', label: 'Medical', icon: '🏥', color: 0xFFFCE4EC),
    Category(id: '7', label: 'Design', icon: '🎨', color: 0xFFFFF3E0),
    Category(id: '8', label: 'More', icon: '📐', color: 0xFFF5F5F5),
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          _buildCategoryGrid(),
          _buildWorkerListHeader(),
          _buildWorkerList(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.all(20),
      color: Colors.white,
      child: TextField(
        decoration: InputDecoration(
          hintText: 'Search skills (e.g. Solar, Tuffa)...',
          prefixIcon: Icon(Icons.search, color: Color(0xFF1A6B3C)),
          filled: true,
          fillColor: Color(0xFFF0F4F0),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(15),
            borderSide: BorderSide.none,
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryGrid() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      child: GridView.builder(
        shrinkWrap: true,
        physics: NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 4,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.85,
        ),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final cat = categories[index];
          return Container(
            decoration: BoxDecoration(
              color: Color(cat.color),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(cat.icon, style: TextStyle(fontSize: 28)),
                SizedBox(height: 6),
                Text(cat.label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87)),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildWorkerListHeader() {
    return Padding(
      padding: EdgeInsets.fromLTRB(16, 20, 16, 12),
      child: Text(
        'Top Wantoks Near You',
        style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF1A1A2E)),
      ),
    );
  }

  Widget _buildWorkerList() {
    // Simulated data for list view builder
    return ListView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      itemCount: 10,
      itemBuilder: (context, index) {
        return _WorkerCard();
      },
    );
  }
}

class _WorkerCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: Offset(0, 4)),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: Color(0xFF1A6B3C),
            child: Text('JK', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          ),
          SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text('Service Provider', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                    SizedBox(width: 4),
                    Icon(Icons.check_circle, size: 14, color: Color(0xFF1A6B3C)),
                  ],
                ),
                Text('Electrician', style: TextStyle(fontSize: 13, color: Color(0xFF1A6B3C), fontWeight: FontWeight.w600)),
                SizedBox(height: 6),
                Row(
                  children: [
                    Icon(Icons.star, size: 14, color: Colors.orange),
                    Text(' 4.8 ', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                    Text('(124 reviews)', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
                SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: ['Wiring', 'Solar'].map((t) => _Tag(label: t)).toList(),
                )
              ],
            ),
          ),
          Container(
            padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: Color(0xFFECFDF5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text('Available', style: TextStyle(color: Color(0xFF059669), fontSize: 10, fontWeight: FontWeight.bold)),
          )
        ],
      ),
    );
  }
}

class _Tag extends StatelessWidget {
  final String label;
  _Tag({required this.label});
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(label, style: TextStyle(color: Color(0xFF1A6B3C), fontSize: 11, fontWeight: FontWeight.w600)),
    );
  }
}
