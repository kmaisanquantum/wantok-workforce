import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

with open('provider_dashboard_block.js', 'r') as f:
    new_block = f.readlines()

# Search for the lines to replace
start_idx = -1
end_idx = -1
for i, line in enumerate(lines):
    if 'if (currentUser === "provider") {' in line:
        start_idx = i
        break

if start_idx != -1:
    depth = 0
    for i in range(start_idx, len(lines)):
        depth += lines[i].count('{')
        depth -= lines[i].count('}')
        if depth == 0:
            end_idx = i + 1
            break

if start_idx != -1 and end_idx != -1:
    lines[start_idx:end_idx] = new_block
    with open('WantokWorkforce.js', 'w') as f:
        f.writelines(lines)
    print("Successfully updated WantokWorkforce.js")
else:
    print(f"Failed to find block. start: {start_idx}, end: {end_idx}")
