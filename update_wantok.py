import sys

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

# 1. Add state
search_state = "  const [editingUser, setEditingUser] = useState(null);\n  const [searchQuery, setSearchQuery] = useState('');"
content = content.replace("  const [editingUser, setEditingUser] = useState(null);", search_state)

# 2. Update Header/Toolbar
old_header = """            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B" }}>User Registrations</Text>
              <TouchableOpacity
                onPress={() => { setEditingUser({ roles: ['customer'] }); setModalVisible(true); }}
                style={{ backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>+ New User</Text>
              </TouchableOpacity>
            </View>"""

new_header = """            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B" }}>User Registrations</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: width > 600 ? 400 : "100%" }}>
                <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 }}>
                  <Text style={{ marginRight: 8, fontSize: 14 }}>🔍</Text>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by name, email, or phone..."
                    placeholderTextColor="#94A3B8"
                    style={{ flex: 1, fontSize: 13, color: "#1E293B", padding: 0 }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => { setEditingUser({ roles: ['customer'] }); setModalVisible(true); }}
                  style={{ backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>+ New User</Text>
                </TouchableOpacity>
              </View>
            </View>"""

if old_header in content:
    content = content.replace(old_header, new_header)
else:
    print("Could not find old_header")
    sys.exit(1)

# 3. Filter users
old_map = ") : users.map(u => ("
new_map = ") : users.filter(u => {\n                const q = searchQuery.toLowerCase();\n                return (u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.phone_number?.toLowerCase().includes(q));\n              }).map(u => ("

# The above replacement might be tricky because of potential multiple occurrences,
# but in AdminScreen it's specific to the users tab.
# Let's find the one after "No users found"

users_found_marker = 'No users found.</Text>\n              </View>'
if users_found_marker in content:
    content = content.replace(old_map, new_map, 1) # Only first occurrence after marker if we are careful
else:
    # Try another way
    content = content.replace(old_map, new_map)

with open('WantokWorkforce.js', 'w') as f:
    f.write(content)
