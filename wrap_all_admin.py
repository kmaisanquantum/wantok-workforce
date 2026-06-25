import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

tabs = ["verification", "settings", "logs"]
for tab in tabs:
    start_idx = -1
    for i, line in enumerate(lines):
        if f'{{activeTab === "{tab}" && (' in line:
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
            break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
