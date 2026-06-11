import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../state/app_state.dart';
import '../models/models.dart';

class ProviderView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          _buildStatusCard(context),
          SizedBox(height: 16),
          _buildIncomingJobAlert(),
          SizedBox(height: 24),
          _buildPortfolioHeader(),
          _buildPortfolioGrid(),
        ],
      ),
    );
  }

  Widget _buildStatusCard(BuildContext context) {
    final state = Provider.of<AppState>(context);
    final isOnline = state.providerStatus == WorkerStatus.available;

    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isOnline ? Color(0xFF1A6B3C) : Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Color(0xFFE5E7EB)),
        boxShadow: [
          BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 5)),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isOnline ? 'You are Available' : 'You are Offline',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: isOnline ? Colors.white : Colors.black87,
                  ),
                ),
                Text(
                  isOnline ? 'Jobs will appear in real-time' : 'Switch toggle to receive jobs',
                  style: TextStyle(
                    fontSize: 13,
                    color: isOnline ? Colors.white70 : Colors.grey,
                  ),
                ),
              ],
            ),
          ),
          Switch.adaptive(
            value: isOnline,
            activeColor: Colors.white,
            activeTrackColor: Color(0xFF2E9E5B),
            onChanged: (val) {
              state.updateProviderStatus(val ? WorkerStatus.available : WorkerStatus.offline);
            },
          )
        ],
      ),
    );
  }

  Widget _buildIncomingJobAlert() {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.orange.shade200),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Icon(Icons.bolt, color: Colors.orange),
              SizedBox(width: 10),
              Text('NEW JOB NEARBY', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.orange.shade900)),
            ],
          ),
          SizedBox(height: 10),
          Text('Tuffa Tank Valve Repair - Gordons Area', style: TextStyle(fontWeight: FontWeight.w600)),
          SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: TextButton(
                  onPressed: () {},
                  child: Text('REJECT'),
                  style: TextButton.styleFrom(primary: Colors.grey),
                ),
              ),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {},
                  child: Text('ACCEPT (K15.00)'),
                  style: ElevatedButton.styleFrom(
                    primary: Color(0xFF1A6B3C),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildPortfolioHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.between,
      children: [
        Text('Work Portfolio', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        TextButton.icon(
          onPressed: () {},
          icon: Icon(Icons.add_a_photo, size: 18),
          label: Text('Upload'),
          style: TextButton.styleFrom(primary: Color(0xFF1A6B3C)),
        ),
      ],
    );
  }

  Widget _buildPortfolioGrid() {
    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      itemCount: 6,
      itemBuilder: (context, index) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey.shade200),
          ),
          child: Icon(Icons.image, color: Colors.grey.shade400),
        );
      },
    );
  }
}
