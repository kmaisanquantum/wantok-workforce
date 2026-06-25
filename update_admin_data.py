import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

# 1. Update state
for i, line in enumerate(lines):
    if 'const [pendingVouching, setPendingVouching] = useState([]);' in line:
        lines.insert(i + 1, '  const [ledgerStats, setLedgerStats] = useState({ totalEscrowCapital: 0, totalDisbursements: 0, totalRevenue: 0 });\n')
        lines.insert(i + 2, '  const [disputedJobs, setDisputedJobs] = useState([]);\n')
        break

# 2. Add fetchLedgerStats and fetchDisputed
fetch_stats_end = -1
for i, line in enumerate(lines):
    if 'const fetchStats = async () => {' in line:
        depth = 0
        for j in range(i, len(lines)):
            depth += lines[j].count('{')
            depth -= lines[j].count('}')
            if depth == 0:
                fetch_stats_end = j + 1
                break
        break

if fetch_stats_end != -1:
    new_fetches = [
        '\n',
        '  const fetchLedgerStats = async () => {\n',
        '    try {\n',
        '      const adminToken = user?.token;\n',
        '      const res = await fetch(`${API_BASE}/admin/ledger-stats`, {\n',
        '        headers: { \"Authorization\": `Bearer ${adminToken}` }\n',
        '      });\n',
        '      const data = await res.json();\n',
        '      if (data.success) setLedgerStats(data.data);\n',
        '    } catch (e) {}\n',
        '  };\n',
        '\n',
        '  const fetchDisputed = async () => {\n',
        '    try {\n',
        '      const adminToken = user?.token;\n',
        '      const res = await fetch(`${API_BASE}/admin/disputed-jobs`, {\n',
        '        headers: { \"Authorization\": `Bearer ${adminToken}` }\n',
        '      });\n',
        '      const data = await res.json();\n',
        '      if (data.success) setDisputedJobs(data.data);\n',
        '    } catch (e) {}\n',
        '  };\n'
    ]
    lines[fetch_stats_end:fetch_stats_end] = new_fetches

# 3. Update useEffect
for i, line in enumerate(lines):
    if 'if (activeTab === \"dashboard\") {' in line:
        lines.insert(i + 2, '      fetchLedgerStats();\n')
        lines.insert(i + 3, '      fetchDisputed();\n')
        break

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
