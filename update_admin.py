import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

# 1. Update state
for i, line in enumerate(lines):
    if 'const [pendingProviders, setPendingProviders] = useState([]);' in line:
        lines[i] = '  const [pendingProviders, setPendingProviders] = useState([]);\n  const [pendingVouching, setPendingVouching] = useState([]);\n'
        break

# 2. Update fetchPending
start_fetch = -1
end_fetch = -1
for i, line in enumerate(lines):
    if 'const fetchPending = async () => {' in line:
        start_fetch = i
        break

if start_fetch != -1:
    depth = 0
    for i in range(start_fetch, len(lines)):
        depth += lines[i].count('{')
        depth -= lines[i].count('}')
        if depth == 0:
            end_fetch = i + 1
            break

if start_fetch != -1 and end_fetch != -1:
    new_fetch = [
        '  const fetchPending = async () => {\n',
        '    try {\n',
        '      const adminToken = user?.token;\n',
        '      // Fetch Pending Accounts\n',
        '      const resAcc = await fetch(`${API_BASE}/admin/pending-providers`, {\n',
        '        headers: { "Authorization": `Bearer ${adminToken}` }\n',
        '      });\n',
        '      const dataAcc = await resAcc.json().catch(() => ({}));\n',
        '      if (resAcc.ok) {\n',
        '        setPendingProviders(dataAcc.data || dataAcc.providers || dataAcc);\n',
        '      }\n',
        '\n',
        '      // Fetch Pending Community Vouchers\n',
        '      const resVouch = await fetch(`${API_BASE}/admin/pending-vouching`, {\n',
        '        headers: { "Authorization": `Bearer ${adminToken}` }\n',
        '      });\n',
        '      const dataVouch = await resVouch.json().catch(() => ({}));\n',
        '      if (resVouch.ok) {\n',
        '        setPendingVouching(dataVouch.data || []);\n',
        '      }\n',
        '    } catch (e) {\n',
        '      console.error("❌ Admin Data Pipeline Error (Pending): ", e.message);\n',
        '    }\n',
        '  };\n'
    ]
    lines[start_fetch:end_fetch] = new_fetch

# 3. Update UI
start_ui = -1
end_ui = -1
for i, line in enumerate(lines):
    if '{activeSubTab === "verification_queue" && (' in line:
        start_ui = i
        break

if start_ui != -1:
    depth = 0
    for i in range(start_ui, len(lines)):
        depth += lines[i].count('(')
        depth -= lines[i].count(')')
        if depth == 0:
            end_ui = i + 1
            break

if start_ui != -1 and end_ui != -1:
    new_ui = [
        '              {activeSubTab === "verification_queue" && (\n',
        '                <View>\n',
        '                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 16 }}>Account Verification Queue</Text>\n',
        '                  {pendingProviders.length === 0 ? (\n',
        '                    <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 12, alignItems: "center", marginBottom: 24 }}>\n',
        '                      <Text style={{ color: "#94A3B8", fontSize: 13 }}>No pending profiles for review</Text>\n',
        '                    </View>\n',
        '                  ) : (\n',
        '                    pendingProviders.map(prov => (\n',
        '                      <View key={prov.id} style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: "row", gap: 16 }}>\n',
        '                        <View style={{ flex: 1 }}>\n',
        '                          <Text style={{ fontSize: 16, fontWeight: "700", color: "#1E293B" }}>{prov.name}</Text>\n',
        '                          <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: "600" }}>{prov.primary_skill || "General Trade"}</Text>\n',
        '                          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{prov.email} • {prov.phone_number}</Text>\n',
        '                        </View>\n',
        '                        <View style={{ width: 120, gap: 8 }}>\n',
        '                          <TouchableOpacity onPress={() => handleUserAction(prov.id, "approve")} style={{ backgroundColor: "#10B981", padding: 8, borderRadius: 6, alignItems: "center" }}>\n',
        '                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 11 }}>Approve</Text>\n',
        '                          </TouchableOpacity>\n',
        '                          <TouchableOpacity onPress={() => handleUserAction(prov.id, "flag")} style={{ borderWidth: 1, borderColor: "#EF4444", padding: 8, borderRadius: 6, alignItems: "center" }}>\n',
        '                            <Text style={{ color: "#EF4444", fontWeight: "700", fontSize: 11 }}>Flag/Reject</Text>\n',
        '                          </TouchableOpacity>\n',
        '                        </View>\n',
        '                      </View>\n',
        '                    ))\n',
        '                  )}\n',
        '\n',
        '                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 16, marginTop: 12 }}>🤝 Community Vouching Queue</Text>\n',
        '                  {pendingVouching.length === 0 ? (\n',
        '                    <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 12, alignItems: "center" }}>\n',
        '                      <Text style={{ color: "#94A3B8", fontSize: 13 }}>No community vouchers pending</Text>\n',
        '                    </View>\n',
        '                  ) : (\n',
        '                    pendingVouching.map(vouch => (\n',
        '                      <View key={vouch.id} style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: "row", gap: 16 }}>\n',
        '                        <View style={{ flex: 1 }}>\n',
        '                          <Text style={{ fontSize: 15, fontWeight: "800", color: "#1E293B" }}>Gatekeeper: {vouch.gatekeeper_name}</Text>\n',
        '                          <Text style={{ fontSize: 13, color: COLORS.primary, fontWeight: "700" }}>{vouch.gatekeeper_role}</Text>\n',
        '                          <Text style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Contact: {vouch.gatekeeper_contact}</Text>\n',
        '                          <View style={{ height: 1, backgroundColor: "#E2E8F0", marginVertical: 8 }} />\n',
        '                          <Text style={{ fontSize: 12, color: "#1E293B" }}>Provider: <Text style={{ fontWeight: "700" }}>{vouch.provider_name}</Text> ({vouch.provider_email})</Text>\n',
        '                        </View>\n',
        '                        <View style={{ width: 100, gap: 8, justifyContent: "center" }}>\n',
        '                          <TouchableOpacity \n',
        '                            onPress={() => {\n',
        '                              fetch(`${API_BASE}/admin/vouch/${vouch.id}/approve`, {\n',
        '                                method: "POST",\n',
        '                                headers: { "Authorization": `Bearer ${user?.token}` }\n',
        '                              }).then(res => res.ok ? (alert("Vouch Approved"), fetchPending()) : alert("Approval failed"));\n',
        '                            }} \n',
        '                            style={{ backgroundColor: COLORS.primary, padding: 8, borderRadius: 6, alignItems: "center" }}\n',
        '                          >\n',
        '                            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 11 }}>Verify</Text>\n',
        '                          </TouchableOpacity>\n',
        '                        </View>\n',
        '                      </View>\n',
        '                    ))\n',
        '                  )}\n',
        '                </View>\n',
        '              )}\n'
    ]
    lines[start_ui:end_ui] = new_ui

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
