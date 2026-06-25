import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

# 1. Add isDesktop
for i, line in enumerate(lines):
    if 'function AdminScreen({ onNavigate, onLogout, user }) {' in line:
        lines.insert(i + 1, '  const { width: screenWidth } = Dimensions.get(\"window\");\n  const isDesktop = screenWidth > 1024;\n')
        break

# 2. Update Dashboard UI
start_dashboard = -1
end_dashboard = -1
for i, line in enumerate(lines):
    if '{activeTab === "dashboard" && (' in line:
        start_dashboard = i
        break

if start_dashboard != -1:
    depth = 0
    for i in range(start_dashboard, len(lines)):
        depth += lines[i].count('(')
        depth -= lines[i].count(')')
        if depth == 0:
            end_dashboard = i + 1
            break

if start_dashboard != -1 and end_dashboard != -1:
    new_dashboard = [
        '        {activeTab === \"dashboard\" && (\n',
        '          <View style={{ padding: 16, gap: 16 }}>\n',
        '            {/* Responsive Metrics Grid */}\n',
        '            <View style={{ flexDirection: isDesktop ? \"row\" : \"column\", gap: 12 }}>\n',
        '              {[ \n',
        '                { label: \"TOTAL CUSTOMERS\", val: stats.totalCustomers, color: \"#3B82F6\" },\n',
        '                { label: \"TOTAL PROVIDERS\", val: stats.totalProviders, color: \"#F59E0B\" },\n',
        '                { label: \"COMPLETED MATCHES\", val: stats.totalMatches, color: \"#10B981\" },\n',
        '                { label: \"ESCROW CAPITAL\", val: `K${parseFloat(ledgerStats.totalEscrowCapital || 0).toFixed(2)}`, color: \"#8B5CF6\" },\n',
        '                { label: \"PLATFORM REVENUE\", val: `K${parseFloat(ledgerStats.totalRevenue || 0).toFixed(2)}`, color: \"#EC4899\" }\n',
        '              ].map((m, idx) => (\n',
        '                <View key={idx} style={{ flex: 1, backgroundColor: \"#fff\", padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: m.color, elevation: 2 }}>\n',
        '                  <Text style={{ fontSize: 10, color: \"#64748B\", fontWeight: \"800\" }}>{m.label}</Text>\n',
        '                  <Text style={{ fontSize: 20, fontWeight: \"900\", color: \"#1E293B\", marginTop: 4 }}>{m.val}</Text>\n',
        '                </View>\n',
        '              ))}\n',
        '            </View>\n',
        '\n',
        '            {/* Main Content Split Layout */}\n',
        '            <View style={{ flexDirection: isDesktop ? \"row\" : \"column\", gap: 16 }}>\n',
        '              {/* LEFT COLUMN: Tables (2/3) */}\n',
        '              <View style={{ flex: isDesktop ? 2 : 1, gap: 16 }}>\n',
        '                {/* Dispute List Table */}\n',
        '                <View style={{ backgroundColor: \"#fff\", borderRadius: 16, padding: 20, elevation: 2 }}>\n',
        '                  <Text style={{ fontSize: 16, fontWeight: \"800\", color: \"#1E293B\", marginBottom: 16 }}>🚨 Critical Disputes (Milestone Arbitration)</Text>\n',
        '                  {disputedJobs.length === 0 ? (\n',
        '                    <Text style={{ color: \"#64748B\", fontSize: 13, fontStyle: \"italic\" }}>No active disputes requiring intervention.</Text>\n',
        '                  ) : (\n',
        '                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>\n',
        '                      <View>\n',
        '                        <View style={{ flexDirection: \"row\", borderBottomWidth: 1, borderBottomColor: \"#E2E8F0\", paddingBottom: 8, marginBottom: 8 }}>\n',
        '                          <Text style={{ width: 150, fontWeight: \"700\", fontSize: 12 }}>SERVICE</Text>\n',
        '                          <Text style={{ width: 120, fontWeight: \"700\", fontSize: 12 }}>CUSTOMER</Text>\n',
        '                          <Text style={{ width: 100, fontWeight: \"700\", fontSize: 12, textAlign: \"right\" }}>AMOUNT</Text>\n',
        '                          <Text style={{ width: 150, fontWeight: \"700\", fontSize: 12, textAlign: \"center\" }}>ACTIONS</Text>\n',
        '                        </View>\n',
        '                        {disputedJobs.map(job => (\n',
        '                          <View key={job.id} style={{ flexDirection: \"row\", alignItems: \"center\", marginBottom: 12 }}>\n',
        '                            <Text style={{ width: 150, fontSize: 13 }}>{job.service_type}</Text>\n',
        '                            <Text style={{ width: 120, fontSize: 13, color: \"#64748B\" }}>{job.customer_name}</Text>\n',
        '                            <Text style={{ width: 100, fontSize: 13, fontWeight: \"700\", textAlign: \"right\" }}>K{job.price}</Text>\n',
        '                            <View style={{ width: 150, flexDirection: \"row\", justifyContent: \"center\", gap: 8 }}>\n',
        '                              <TouchableOpacity \n',
        '                                onPress={() => handleUserAction(job.id, \"release_payout\")}\n',
        '                                style={{ backgroundColor: \"#10B981\", padding: 6, borderRadius: 4 }}\n',
        '                              >\n',
        '                                <Text style={{ color: \"#fff\", fontSize: 10, fontWeight: \"700\" }}>RELEASE</Text>\n',
        '                              </TouchableOpacity>\n',
        '                              <TouchableOpacity \n',
        '                                onPress={() => handleUserAction(job.id, \"refund_escrow\")}\n',
        '                                style={{ backgroundColor: \"#EF4444\", padding: 6, borderRadius: 4 }}\n',
        '                              >\n',
        '                                <Text style={{ color: \"#fff\", fontSize: 10, fontWeight: \"700\" }}>REFUND</Text>\n',
        '                              </TouchableOpacity>\n',
        '                            </View>\n',
        '                          </View>\n',
        '                        ))}\n',
        '                      </View>\n',
        '                    </ScrollView>\n',
        '                  )}\n',
        '                </View>\n',
        '\n',
        '                {/* User Registrations Table (Dashboard Preview) */}\n',
        '                <View style={{ backgroundColor: \"#fff\", borderRadius: 16, padding: 20, elevation: 2 }}>\n',
        '                  <View style={{ flexDirection: \"row\", justifyContent: \"space-between\", alignItems: \"center\", marginBottom: 16 }}>\n',
        '                    <Text style={{ fontSize: 16, fontWeight: \"800\", color: \"#1E293B\" }}>👥 Recent User Activity</Text>\n',
        '                    <TouchableOpacity onPress={() => setActiveTab(\"users\")}>\n',
        '                      <Text style={{ color: COLORS.primary, fontWeight: \"700\", fontSize: 12 }}>VIEW ALL →</Text>\n',
        '                    </TouchableOpacity>\n',
        '                  </View>\n',
        '                  {users.slice(0, 5).map(u => (\n',
        '                    <View key={u.id} style={{ flexDirection: \"row\", justifyContent: \"space-between\", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: \"#F1F5F9\" }}>\n',
        '                      <View>\n',
        '                        <Text style={{ fontWeight: \"700\", fontSize: 13 }}>{u.name}</Text>\n',
        '                        <Text style={{ fontSize: 11, color: \"#64748B\" }}>{u.email}</Text>\n',
        '                      </View>\n',
        '                      <View style={{ alignItems: \"right\" }}>\n',
        '                        <View style={{ backgroundColor: u.role === \"provider\" ? \"#DCFCE7\" : \"#DBEAFE\", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>\n',
        '                          <Text style={{ fontSize: 10, fontWeight: \"800\", color: u.role === \"provider\" ? \"#166534\" : \"#1E40AF\" }}>{u.role.toUpperCase()}</Text>\n',
        '                        </View>\n',
        '                        <Text style={{ fontSize: 10, color: \"#94A3B8\", marginTop: 2 }}>{new Date(u.created_at).toLocaleDateString()}</Text>\n',
        '                      </View>\n',
        '                    </View>\n',
        '                  ))}\n',
        '                </View>\n',
        '              </View>\n',
        '\n',
        '              {/* RIGHT COLUMN: Sidebar Widgets (1/3) */}\n',
        '              <View style={{ flex: isDesktop ? 1 : 1, gap: 16 }}>\n',
        '                {/* Quick Action Widget */}\n',
        '                <View style={{ backgroundColor: \"#1E293B\", borderRadius: 16, padding: 20, elevation: 2 }}>\n',
        '                  <Text style={{ fontSize: 15, fontWeight: \"800\", color: \"#fff\", marginBottom: 12 }}>🛠️ Administrative Tools</Text>\n',
        '                  <TouchableOpacity onPress={handleForceSync} style={{ backgroundColor: \"rgba(255,255,255,0.1)\", padding: 12, borderRadius: 10, marginBottom: 10 }}>\n',
        '                    <Text style={{ color: \"#fff\", fontWeight: \"700\", textAlign: \"center\" }}>Database Force Reconciliation</Text>\n',
        '                  </TouchableOpacity>\n',
        '                  <TouchableOpacity onPress={() => setActiveTab(\"settings\")} style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 10 }}>\n',
        '                    <Text style={{ color: \"#fff\", fontWeight: \"700\", textAlign: \"center\" }}>Global System Controls</Text>\n',
        '                  </TouchableOpacity>\n',
        '                </View>\n',
        '\n',
        '                {/* Revenue Summary Widget */}\n',
        '                <View style={{ backgroundColor: \"#fff\", borderRadius: 16, padding: 20, elevation: 2 }}>\n',
        '                   <Text style={{ fontSize: 15, fontWeight: \"800\", color: \"#1E293B\", marginBottom: 16 }}>💰 Financial Health</Text>\n',
        '                   <View style={{ gap: 12 }}>\n',
        '                      <View>\n',
        '                        <Text style={{ fontSize: 11, color: \"#64748B\" }}>TOTAL DISBURSEMENTS</Text>\n',
        '                        <Text style={{ fontSize: 18, fontWeight: \"900\", color: \"#10B981\" }}>K{parseFloat(ledgerStats.totalDisbursements || 0).toFixed(2)}</Text>\n',
        '                      </View>\n',
        '                      <View style={{ height: 1, backgroundColor: \"#F1F5F9\" }} />\n',
        '                      <View>\n',
        '                        <Text style={{ fontSize: 11, color: \"#64748B\" }}>ACTIVE ESCROW FLOW</Text>\n',
        '                        <Text style={{ fontSize: 18, fontWeight: \"900\", color: \"#8B5CF6\" }}>K{parseFloat(ledgerStats.totalEscrowCapital || 0).toFixed(2)}</Text>\n',
        '                      </View>\n',
        '                   </View>\n',
        '                </View>\n',
        '              </View>\n',
        '            </View>\n',
        '          </View>\n',
        '        )}\n'
    ]
    lines[start_dashboard:end_dashboard] = new_dashboard

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
