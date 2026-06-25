import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'function AdminAuthScreen' in line:
        start_return = -1
        for j in range(i, len(lines)):
            if 'return (' in lines[j]:
                start_return = j
                break

        if start_return != -1:
            new_view = [
                '    return (\n',
                '      <View style={{ flex: 1, backgroundColor: "#0F172A", justifyContent: "center", padding: 24 }}>\n',
                '        <View style={{ maxWidth: 450, width: "100%", alignSelf: "center" }}>\n',
                '          <View style={{ alignItems: "center", marginBottom: 40 }}>\n',
                '            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#334155", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>\n',
                '              <Text style={{ fontSize: 32 }}>🔐</Text>\n',
                '            </View>\n',
                '            <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1 }}>\n',
                '              ADMIN PORTAL\n',
                '            </Text>\n',
                '            <Text style={{ color: "#94A3B8", fontSize: 14, marginTop: 8 }}>\n',
                '              Wantok Workforce Back-Office\n',
                '            </Text>\n',
                '          </View>\n',
                '\n',
                '          <View style={{ backgroundColor: "#1E293B", borderRadius: 16, padding: 24, elevation: 8 }}>\n',
                '            <View style={{ marginBottom: 16 }}>\n',
                '              <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase" }}>\n',
                '                Admin Identifier\n',
                '              </Text>\n',
                '              <TextInput\n',
                '                style={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#334155" }}\n',
                '                placeholder="Username or Email"\n',
                '                placeholderTextColor="#475569"\n',
                '                value={identifier}\n',
                '                onChangeText={setIdentifier}\n',
                '                autoCapitalize="none"\n',
                '              />\n',
                '            </View>\n',
                '\n',
                '            <View style={{ marginBottom: 24 }}>\n',
                '              <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase" }}>\n',
                '                Security Key\n',
                '              </Text>\n',
                '              <View style={{ position: "relative" }}>\n',
                '                <TextInput\n',
                '                  style={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 8, padding: 12, paddingRight: 48, borderWidth: 1, borderColor: "#334155" }}\n',
                '                  placeholder="Enter password"\n',
                '                  placeholderTextColor="#475569"\n',
                '                  value={password}\n',
                '                  onChangeText={setPassword}\n',
                '                  secureTextEntry={!showPassword}\n',
                '                />\n',
                '                <TouchableOpacity\n',
                '                  onPress={() => setShowPassword(!showPassword)}\n',
                '                  style={{ position: "absolute", right: 12, top: 12 }}\n',
                '                >\n',
                '                  <Text style={{ fontSize: 18 }}>{showPassword ? "👁️" : "🔒"}</Text>\n',
                '                </TouchableOpacity>\n',
                '              </View>\n',
                '            </View>\n',
                '\n',
                '            <TouchableOpacity\n',
                '              onPress={handleAdminLogin}\n',
                '              disabled={loading}\n',
                '              style={{\n',
                '                backgroundColor: "#3B82F6",\n',
                '                padding: 16,\n',
                '                borderRadius: 8,\n',
                '                alignItems: "center",\n',
                '                opacity: loading ? 0.7 : 1\n',
                '              }}\n',
                '            >\n',
                '              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>\n',
                '                {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}\n',
                '              </Text>\n',
                '            </TouchableOpacity>\n',
                '          </View>\n',
                '\n',
                '          <TouchableOpacity\n',
                '            onPress={() => { if (Platform.OS === "web") window.location.href = "/"; }}\n',
                '            style={{ marginTop: 24, alignItems: "center" }}\n',
                '          >\n',
                '            <Text style={{ color: "#475569", fontSize: 13 }}>Return to Public Site</Text>\n',
                '          </TouchableOpacity>\n',
                '        </View>\n',
                '      </View>\n',
                '    );\n'
            ]

            depth = 0
            end_return = -1
            for k in range(start_return, len(lines)):
                depth += lines[k].count('(')
                depth -= lines[k].count(')')
                if depth == 0 and k > start_return:
                    end_return = k + 1
                    break

            if end_return != -1:
                lines[start_return:end_return] = new_view
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
