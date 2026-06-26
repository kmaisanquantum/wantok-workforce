import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

def wrap_function_return(func_name, lines):
    found_start = -1
    for i, line in enumerate(lines):
        if f'function {func_name}' in line:
            for j in range(i, len(lines)):
                if 'return (' in lines[j]:
                    found_start = j
                    break
            break

    if found_start != -1:
        # Check if already wrapped
        if '<ResponsiveContainer' in lines[found_start + 2]:
            return lines

        # Standard wrap
        lines.insert(found_start + 2, '      <ResponsiveContainer style={{ paddingVertical: 20 }}>\n')
        # Find end of return View
        depth = 0
        for k in range(found_start + 1, len(lines)):
            depth += lines[k].count('<View')
            depth -= lines[k].count('</View')
            if depth == -1:
                lines.insert(k, '      </ResponsiveContainer>\n')
                break
    return lines

screens = ['TrustScreen', 'BookingsScreen', 'ProfileScreen', 'WorkerDetailScreen']
for screen in screens:
    lines = wrap_function_return(screen, lines)

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
