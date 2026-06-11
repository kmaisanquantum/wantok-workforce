import 'package:flutter/material.dart';

class AdminView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          TabBar(
            labelColor: Color(0xFF1A6B3C),
            unselectedLabelColor: Colors.grey,
            indicatorColor: Color(0xFF1A6B3C),
            tabs: [
              Tab(text: 'Verification Queue'),
              Tab(text: 'Transaction Ledger'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _buildVerificationQueue(),
                _buildTransactionLedger(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVerificationQueue() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Card(
          margin: EdgeInsets.only(bottom: 12),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Column(
              children: [
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: CircleAvatar(child: Text('SA')),
                  title: Text('Samuel Akai'),
                  subtitle: Text('ID: #PNG-2930 | Plumber'),
                  trailing: Text('PENDING', style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton(
                      onPressed: () {},
                      child: Text('View Docs'),
                      style: OutlinedButton.styleFrom(primary: Colors.grey),
                    ),
                    SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: () {},
                      child: Text('APPROVE'),
                      style: ElevatedButton.styleFrom(primary: Color(0xFF1A6B3C)),
                    ),
                  ],
                )
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildTransactionLedger() {
    return ListView.builder(
      padding: EdgeInsets.all(16),
      itemCount: 20,
      itemBuilder: (context, index) {
        return Container(
          padding: EdgeInsets.symmetric(vertical: 12),
          border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(color: Color(0xFFF0FDF4), shape: BoxShape.circle),
                child: Icon(Icons.account_balance_wallet, color: Color(0xFF1A6B3C), size: 20),
              ),
              SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Wallet Unlock - #JK-001', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('Match unlocked for James Kapi', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text('- K15.00', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red)),
                  Text('10:45 AM', style: TextStyle(fontSize: 10, color: Colors.grey)),
                ],
              )
            ],
          ),
        );
      },
    );
  }
}
