import sys

with open('WantokWorkforce.js', 'r') as f:
    content = f.read()

# Update API_BASE
old_api_base = """const API_BASE = (typeof process !== 'undefined' && (process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL))
  ? (process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL)
  : (Platform.OS === 'web'
      ? (typeof window !== 'undefined' && window.location.origin.includes('wantok.dspng.tech') ? 'https://wantok.dspng.tech/api' : '/api')
      : 'http://45.32.243.144:3000/api');"""

new_api_base = """const API_BASE = (typeof process !== 'undefined' && (process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL))
  ? (process.env.REACT_APP_API_URL || process.env.EXPO_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_URL)
  : (Platform.OS === 'web'
      ? (typeof window !== 'undefined' && (window.location.origin.includes('wantok.dspng.tech') || window.location.hostname === 'wantok.dspng.tech') ? 'https://wantok.dspng.tech/api' : (window.location.origin + '/api'))
      : 'http://45.32.243.144:3000/api');"""

content = content.replace(old_api_base, new_api_base)

# Update fetchStats
old_fetch_stats = """  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data || data);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error (Stats): ", e.message);
    }
  };"""

new_fetch_stats = """  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/dashboard-stats`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Handle { success: true, data: { ... } } or { ... }
        setStats(data.data || data);
      } else {
        console.error("❌ Admin Stats Fetch Failed: ", res.status);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error: ", e.message);
    }
  };"""

content = content.replace(old_fetch_stats, new_fetch_stats)

# Update fetchPending
old_fetch_pending = """  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/pending-providers`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingProviders(data.data || data);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error (Pending): ", e.message);
    }
  };"""

new_fetch_pending = """  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/pending-providers`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingProviders(data.data || data);
      } else {
        console.error("❌ Admin Pending Fetch Failed: ", res.status);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error: ", e.message);
    }
  };"""

content = content.replace(old_fetch_pending, new_fetch_pending)

# Update fetchUsers
old_fetch_users = """  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users?role=${encodeURIComponent(roleFilter)}`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const usersData = data.users || data.data?.users || data.data || data;
        setUsers(Array.isArray(usersData) ? usersData : []);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error (Users): ", e.message);
    } finally { setLoading(false); }
  };"""

new_fetch_users = """  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users?role=${encodeURIComponent(roleFilter)}`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Backend returns { users: [...] }
        const usersData = data.users || data.data?.users || data.data || data;
        setUsers(Array.isArray(usersData) ? usersData : []);
      } else {
        console.error("❌ Admin Users Fetch Failed: ", res.status);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error: ", e.message);
    } finally { setLoading(false); }
  };"""

content = content.replace(old_fetch_users, new_fetch_users)

# Update fetchLogs
old_fetch_logs = """  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/logs`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || data);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error (Logs): ", e.message);
    }
  };"""

new_fetch_logs = """  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/logs`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || data);
      } else {
        console.error("❌ Admin Logs Fetch Failed: ", res.status);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error: ", e.message);
    }
  };"""

content = content.replace(old_fetch_logs, new_fetch_logs)

with open('WantokWorkforce.js', 'w') as f:
    f.write(content)
