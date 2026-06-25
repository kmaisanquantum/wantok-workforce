import sys

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

# 1. Update Provider Dashboard structure for responsive 2/3 split
old_provider_block_start = '          <View style={{ padding: 16, marginTop: -20, gap: 16 }}>'
new_provider_block_start = '          <ResponsiveContainer style={{ marginTop: -20, gap: 16 }}>\n            <View style={{ flexDirection: isDesktop ? "row" : "column", gap: 16 }}>\n              <View style={{ flex: isDesktop ? 2 : 1, gap: 16 }}>'

content = content.replace(old_provider_block_start, new_provider_block_start, 1)

# We need to find where to close the split views.
# It should be after <ProviderFinancialDashboard user={user} />
# and before the end of the ScrollView.

# I'll use a more surgical approach with lines.

with open('WantokWorkforce.js', 'w') as f:
    f.write(content)

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '<ProviderFinancialDashboard user={user} />' in line:
        lines.insert(i + 1, '              </View>\n              <View style={{ flex: isDesktop ? 1 : 1, gap: 16 }}>\n')
        # Now find the end of the Provider View
        # Search for </ScrollView>
        for j in range(i + 2, len(lines)):
            if '</ScrollView>' in lines[j]:
                lines.insert(j, '              </View>\n            </View>\n          </ResponsiveContainer>\n')
                break
        break

# 2. Update ProviderFinancialDashboard for horizontal metrics
for i, line in enumerate(lines):
    if 'function ProviderFinancialDashboard' in line:
        # Find the inner metric container
        for j in range(i, len(lines)):
            if '<View style={{ backgroundColor: COLORS.primaryDark' in lines[j]:
                lines[j] = '      <View style={{ backgroundColor: COLORS.primaryDark, borderRadius: 20, padding: 24, flexDirection: isDesktop ? "row" : "column", alignItems: isDesktop ? "center" : "flex-start", gap: 24 }}>\n'
                # Refactor the metrics inner layout
                # This is hard because it's a single line from the previous sed.
                # I'll just replace the whole function content if I can.
                break
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
