import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "res = await fetch(`${API_BASE}/admin/queue/override`" in line:
        new_actions = [
            '      } else if (action === "release_payout") {\n',
            '        res = await fetch(`${API_BASE}/admin/release-payout/${userId}`, {\n',
            '          method: "POST",\n',
            '          headers: { "Authorization": `Bearer ${adminToken}` }\n',
            '        });\n',
            '      } else if (action === "refund_escrow") {\n',
            '        res = await fetch(`${API_BASE}/admin/refund-escrow/${userId}`, {\n',
            '          method: "POST",\n',
            '          headers: { "Authorization": `Bearer ${adminToken}` }\n',
            '        });\n'
        ]
        lines[i-1:i-1] = new_actions
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
