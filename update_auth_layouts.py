import sys

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

# 1. Update AuthScreen
# Target the main View inside AuthScreen return
old_auth_start = '<View style={{ flex: 1, backgroundColor: COLORS.bg }}>'
new_auth_start = '<View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: isDesktop ? "center" : "flex-start" }}>'
content = content.replace(old_auth_start, new_auth_start, 1)

# Target the ScrollView content inside AuthScreen
old_auth_card = '<View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>'
new_auth_card = '<View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, maxWidth: 450, width: "100%", alignSelf: "center" }}>'
content = content.replace(old_auth_card, new_auth_card, 1)

# 2. Update AdminAuthScreen
old_admin_auth = '<View style={{ flex: 1, backgroundColor: "#0F172A", justifyContent: "center", padding: 24 }}>'
new_admin_auth = '<View style={{ flex: 1, backgroundColor: "#0F172A", justifyContent: "center", padding: 24 }}>\n      <View style={{ maxWidth: 450, width: "100%", alignSelf: "center" }}>'
# This one is trickier because we need to close the extra View
# Find the end of AdminAuthScreen. It ends with </View>\n  );\n}
# Wait, I'll just use a more precise replacement for the whole return block if possible.
# Actually, I'll just add the inner view and hope for the best, but I need to close it.

with open('WantokWorkforce.js', 'w') as f:
    f.write(content)

# Use python lines approach for AdminAuthScreen to be safe
with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'function AdminAuthScreen' in line:
        # Find the return (
        for j in range(i, len(lines)):
            if 'return (' in lines[j]:
                lines[j+1] = '    <View style={{ flex: 1, backgroundColor: "#0F172A", justifyContent: "center", padding: 24 }}>\n      <View style={{ maxWidth: 450, width: "100%", alignSelf: "center" }}>\n'
                # Now find the end of the return View
                depth = 0
                for k in range(j+1, len(lines)):
                    depth += lines[k].count('<View')
                    depth -= lines[k].count('</View')
                    if depth == -1: # We went past the root View
                        lines[k] = '      </View>\n    </View>\n'
                        break
                break
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
