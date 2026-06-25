import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

found_provider = False
for i, line in enumerate(lines):
    if 'if (currentUser === "provider") {' in line:
        found_provider = True
        # Find the return (
        start_return = -1
        for j in range(i, len(lines)):
            if 'return (' in lines[j]:
                start_return = j
                break

        if start_return != -1:
            new_provider_view = [
                '    return (\n',
                '      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>\n',
                '        <ScrollView showsVerticalScrollIndicator={false}>\n',
                '          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={{ padding: 24, paddingBottom: 40 }}>\n',
                '            <ResponsiveContainer>\n',
                '              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>\n',
                '                <View>\n',
                '                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>\n',
                '                    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Welcome Back, Provider</Text>\n',
                '                    {vStatus.verified && (\n',
                '                      <View style={{ backgroundColor: COLORS.accent, borderRadius: 4, paddingHorizontal: 4 }}>\n',
                '                        <Text style={{ fontSize: 9, fontWeight: "900", color: "#fff" }}>VERIFIED</Text>\n',
                '                      </View>\n',
                '                    )}\n',
                '                  </View>\n',
                '                  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", marginTop: 4 }}>Your Dashboard</Text>\n',
                '                </View>\n',
                '                <TouchableOpacity onPress={() => onNavigate("profile")} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" }}>\n',
                '                  <Text style={{ fontSize: 24 }}>🔧</Text>\n',
                '                </TouchableOpacity>\n',
                '              </View>\n',
                '            </ResponsiveContainer>\n',
                '          </LinearGradient>\n',
                '          \n',
                '          <ResponsiveContainer style={{ marginTop: -20, gap: 16 }}>\n',
                '            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>\n',
                '              {/* Left Column: Work Status & Financial Ledger */}\n',
                '              <View style={{ flex: isDesktop ? 2 : 1, gap: 16 }}>\n',
                '                <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 4 }}>\n',
                '                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>\n',
                '                    <View>\n',
                '                      <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>Work Status</Text>\n',
                '                      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>\n',
                '                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: user?.is_available ? "#10B981" : "#9CA3AF", marginRight: 6 }} />\n',
                '                        <Text style={{ fontSize: 13, fontWeight: "600", color: user?.is_available ? "#10B981" : "#6B7280" }}>{user?.is_available ? "Available for Jobs" : "Busy / Offline"}</Text>\n',
                '                      </View>\n',
                '                    </View>\n',
                '                    <TouchableOpacity onPress={async () => {\n',
                '                      const newStatus = !user?.is_available;\n',
                '                      onUpdateUser({ ...user, is_available: newStatus });\n',
                '                      try {\n',
                '                        await fetch(`${API_BASE}/auth/availability`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` }, body: JSON.stringify({ is_available: newStatus }) });\n',
                '                      } catch (err) {\n',
                '                        onUpdateUser({ ...user, is_available: !newStatus });\n',
                '                        alert("Could not update status.");\n',
                '                      }\n',
                '                    }} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: user?.is_available ? COLORS.primary : "#E5E7EB", padding: 2, justifyContent: "center" }}>\n',
                '                      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", transform: [{ translateX: user?.is_available ? 22 : 0 }], elevation: 2 }} />\n',
                '                    </TouchableOpacity>\n',
                '                  </View>\n',
                '                  <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 16 }} />\n',
                '                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>\n',
                '                    <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text }}>Trust Score</Text>\n',
                '                    <Text style={{ fontSize: 16, fontWeight: "900", color: COLORS.primary }}>{vStatus.verified ? "98%" : "92%"}</Text>\n',
                '                  </View>\n',
                '                  <View style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}><View style={{ width: vStatus.verified ? "98%" : "92%", height: "100%", backgroundColor: COLORS.primary }} /></View>\n',
                '                </View>\n',
                '                \n',
                '                <ProviderFinancialDashboard user={user} />\n',
                '              </View>\n',
                '\n',
                '              {/* Right Column: Vouching & Tools */}\n',
                '              <View style={{ flex: isDesktop ? 1 : 1, gap: 16 }}>\n',
                '                {!vStatus.verified && vStatus.vouch_status !== "pending" && (\n',
                '                  <ProviderVouchingForm user={user} onVouchSubmitted={fetchVerification} />\n',
                '                )}\n',
                '                {vStatus.vouch_status === "pending" && (\n',
                '                  <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, alignItems: "center", borderStyle: "dashed", borderWidth: 1, borderColor: COLORS.primary }}>\n',
                '                    <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.primary }}>⏳ Verification Pending</Text>\n',
                '                    <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4, textAlign: "center" }}>Your community gatekeeper request is being reviewed by the Wantok team.</Text>\n',
                '                  </View>\n',
                '                )}\n',
                '                \n',
                '                <View style={{ backgroundColor: "#1E293B", borderRadius: 20, padding: 20 }}>\n',
                '                  <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800", marginBottom: 12 }}>Quick Actions</Text>\n',
                '                  <TouchableOpacity style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 10, marginBottom: 10 }}>\n',
                '                    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>Update Trade Skills</Text>\n',
                '                  </TouchableOpacity>\n',
                '                  <TouchableOpacity style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 10 }}>\n',
                '                    <Text style={{ color: "#fff", textAlign: "center", fontWeight: "700" }}>View Marketplace</Text>\n',
                '                  </TouchableOpacity>\n',
                '                </View>\n',
                '              </View>\n',
                '            </View>\n',
                '          </ResponsiveContainer>\n',
                '        </ScrollView>\n',
                '      </View>\n',
                '    );\n'
            ]

            # Find end of return
            depth = 0
            end_return = -1
            for k in range(start_return, len(lines)):
                depth += lines[k].count('(')
                depth -= lines[k].count(')')
                if depth == 0 and k > start_return:
                    end_return = k + 1
                    break

            if end_return != -1:
                lines[start_return:end_return] = new_provider_view
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
