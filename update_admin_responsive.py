import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

# Wrap the dashboard content in ResponsiveContainer
start_dashboard = -1
end_dashboard = -1
for i, line in enumerate(lines):
    if '{activeTab === "dashboard" && (' in line:
        start_dashboard = i
        lines[i] = '        {activeTab === "dashboard" && (\n          <ResponsiveContainer style={{ paddingVertical: 16 }}>\n'
        break

if start_dashboard != -1:
    depth = 0
    for i in range(start_dashboard, len(lines)):
        depth += lines[i].count('(')
        depth -= lines[i].count(')')
        if depth == 0:
            end_dashboard = i
            lines[i] = '          </ResponsiveContainer>\n        )}\n'
            break

# Update user list view too
for i, line in enumerate(lines):
    if '{activeTab === "users" && (' in line:
        lines[i] = '        {activeTab === "users" && (\n          <ResponsiveContainer style={{ paddingVertical: 16 }}>\n'
        depth = 0
        for j in range(i, len(lines)):
            depth += lines[j].count('(')
            depth -= lines[j].count(')')
            if depth == 0:
                lines[j] = '          </ResponsiveContainer>\n        )}\n'
                break
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
