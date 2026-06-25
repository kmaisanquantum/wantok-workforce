import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

# Look for the mess around line 210
start_fix = -1
for i, line in enumerate(lines):
    if 'return (' in line and i > 200:
        if 'Find a Wantok' in "".join(lines[i:i+30]):
            start_fix = i
            break

if start_fix != -1:
    # We want to replace the whole return block for the customer view
    # to be clean.
    new_return = [
        '  return (\n',
        '    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>\n',
        '      <ScrollView showsVerticalScrollIndicator={false}>\n',
        '        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={{ paddingTop: 20, paddingBottom: 35 }}>\n',
        '          <ResponsiveContainer>\n',
        '            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>\n',
        '              <View>\n',
        '                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Good morning 👋</Text>\n',
        '                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 }}>Find a Wantok</Text>\n',
        '              </View>\n',
        '              <TouchableOpacity style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" }} onPress={() => onNavigate("profile")}>\n',
        '                <Text style={{ fontSize: 18 }}>👤</Text>\n',
        '              </TouchableOpacity>\n',
        '            </View>\n',
        '            <View style={{ backgroundColor: "#fff", borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, elevation: 4 }}>\n',
        '              <Text style={{ fontSize: 18 }}>🔍</Text>\n',
        '              <TextInput value={searchText} onChangeText={setSearchText} placeholder="Search trade or category..." placeholderTextColor={COLORS.textLight} style={{ flex: 1, fontSize: 14, color: COLORS.text, padding: 0 }} />\n',
        '              <View style={{ backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 }}><Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>📍 PNG</Text></View>\n',
        '            </View>\n',
        '          </ResponsiveContainer>\n',
        '        </LinearGradient>\n',
        '\n',
        '        <ResponsiveContainer style={{ paddingVertical: 20 }}>\n',
        '          <TouchableOpacity onPress={fetchNearbyProviders} disabled={isSearching} style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, elevation: 4 }}>\n',
        '            <Text style={{ fontSize: 18 }}>🛰️</Text>\n',
        '            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{isSearching ? "SEARCHING NEARBY..." : "FIND NEARBY PROVIDERS"}</Text>\n',
        '          </TouchableOpacity>\n',
        '\n',
        '          <View style={{ paddingVertical: 20 }}>\n',
        '            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 }}>Categories</Text>\n',
        '            <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 }}>\n',
        '              {categories.map((cat, i) => (\n',
        '                <TouchableOpacity key={i} onPress={() => { setSelectedCategory(cat.label); setSearchText(""); }} style={{ width: isDesktop ? (MAX_WIDTH - 80) / 6 - 10 : (width - 32) / 4 - 10, margin: 5, backgroundColor: selectedCategory === cat.label ? cat.color + "22" : "#fff", borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 6, elevation: 2, borderWidth: selectedCategory === cat.label ? 1 : 0, borderColor: cat.color }}>\n',
        '                  <Text style={{ fontSize: 22 }}>{cat.icon}</Text>\n',
        '                  <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "600", color: selectedCategory === cat.label ? cat.color : COLORS.textMuted }}>{cat.label}</Text>\n',
        '                </TouchableOpacity>\n',
        '              ))}\n',
        '            </View>\n',
        '          </View>\n',
        '        </ResponsiveContainer>\n',
        '      </ScrollView>\n',
        '    </View>\n',
        '  );\n',
        '}\n'
    ]

    # Find the end of the return
    depth = 0
    end_fix = -1
    for k in range(start_fix, len(lines)):
        depth += lines[k].count('(')
        depth -= lines[k].count(')')
        if depth == 0 and k > start_fix:
            end_fix = k + 1
            break

    if end_fix != -1:
        # Check if the next line is a closing brace for the function
        if '}' in lines[end_fix]:
            end_fix += 1
        lines[start_fix:end_fix] = new_return

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
