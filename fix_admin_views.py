import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '{activeTab === "dashboard" && (' in line:
        if '<ResponsiveContainer' not in lines[i+1]:
             lines.insert(i+1, '          <ResponsiveContainer style={{ paddingVertical: 16 }}>\n')
             # Find end
             depth = 0
             for j in range(i, len(lines)):
                 depth += lines[j].count('(')
                 depth -= lines[j].count(')')
                 if depth == 0:
                     lines.insert(j, '          </ResponsiveContainer>\n')
                     break
    if '{activeTab === "users" && (' in line:
        if '<ResponsiveContainer' not in lines[i+1]:
             lines.insert(i+1, '          <ResponsiveContainer style={{ paddingVertical: 16 }}>\n')
             depth = 0
             for j in range(i, len(lines)):
                 depth += lines[j].count('(')
                 depth -= lines[j].count(')')
                 if depth == 0:
                     lines.insert(j, '          </ResponsiveContainer>\n')
                     break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
