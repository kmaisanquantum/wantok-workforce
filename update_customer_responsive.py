import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

# Wrap Customer HomeScreen content in ResponsiveContainer
found_customer_start = False
for i, line in enumerate(lines):
    if 'return (' in line and i > 200: # Look after Provider view
        # Ensure it's the right one
        for j in range(i, i+10):
            if 'Find a Wantok' in lines[j]:
                lines[i+1] = '    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>\n      <ScrollView showsVerticalScrollIndicator={false}>\n        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={{ paddingTop: 20, paddingBottom: 35 }}>\n          <ResponsiveContainer>\n'
                found_customer_start = True
                break
        if found_customer_start:
            # Add closing for LinearGradient's container
            # Find </LinearGradient>
            for k in range(i+2, len(lines)):
                if '</LinearGradient>' in lines[k]:
                    lines[k] = '          </ResponsiveContainer>\n        </LinearGradient>\n'
                    # Now wrap the rest of the content
                    lines.insert(k+1, '        <ResponsiveContainer style={{ paddingVertical: 20 }}>\n')
                    # Find the end of the return View
                    depth = 0
                    for m in range(k+2, len(lines)):
                        depth += lines[m].count('<View')
                        depth -= lines[m].count('</View')
                        if depth == -1:
                            lines.insert(m, '        </ResponsiveContainer>\n')
                            break
                    break
            break

# Update Categories Grid
for i, line in enumerate(lines):
    if 'style={{ width: (width - 32) / 4 - 10,' in line:
        lines[i] = '                style={{ width: isDesktop ? (MAX_WIDTH - 80) / 6 - 10 : (width - 32) / 4 - 10, margin: 5, backgroundColor: selectedCategory === cat.label ? cat.color + "22" : "#fff", borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 6, elevation: 2, borderWidth: selectedCategory === cat.label ? 1 : 0, borderColor: cat.color }}\n'

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
