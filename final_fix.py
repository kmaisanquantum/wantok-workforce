import sys

with open('WantokWorkforce.js', 'r') as f:
    lines = f.readlines()

# 1. Locate and define ResponsiveContainer if missing
has_rc = any('const ResponsiveContainer' in line for line in lines)
if not has_rc:
    # Insert after global constants
    for i, line in enumerate(lines):
        if 'const API_BASE =' in line:
            lines.insert(i + 1, '\nconst ResponsiveContainer = ({ children, style = {} }) => (\n  <View style={[{ width: "100%", maxWidth: MAX_WIDTH, alignSelf: "center", paddingHorizontal: CONTENT_PADDING }, style]}>\n    {children}\n  </View>\n);\n')
            break

# 2. Re-inject Provider components and clean up the mess at the start of SCREENS
start_screens = -1
for i, line in enumerate(lines):
    if '// ─── SCREENS ───────────────────────────────────────────────────────────────' in line:
        start_screens = i
        break

if start_screens != -1:
    # Remove everything between SCREENS header and HomeScreen function that looks like junk
    end_junk = -1
    for j in range(start_screens + 1, len(lines)):
        if 'function HomeScreen' in lines[j]:
            end_junk = j
            break

    if end_junk != -1:
        new_provider_components = """
function ProviderVouchingForm({ user, onVouchSubmitted }) {
  const [gatekeeper, setGatekeeper] = useState({ name: '', role: '', contact: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!gatekeeper.name || !gatekeeper.role || !gatekeeper.contact) {
      alert("Please fill in all gatekeeper details.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/v1/providers/vouch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify(gatekeeper)
      });
      const data = await res.json();
      if (data.success) {
        alert("Verification request sent to community gatekeeper!");
        onVouchSubmitted();
      } else {
        alert(data.error || "Submission failed.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 4, marginTop: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 8 }}>🤝 Community Vouching</Text>
      <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>Verify your skills via a community leader (Church, Village, or School).</Text>
      <TextInput placeholder="Gatekeeper Name (e.g. Pastor John)" value={gatekeeper.name} onChangeText={(v) => setGatekeeper({...gatekeeper, name: v})} style={{ backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 10 }} />
      <TextInput placeholder="Gatekeeper Role (e.g. Village Councillor)" value={gatekeeper.role} onChangeText={(v) => setGatekeeper({...gatekeeper, role: v})} style={{ backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 10 }} />
      <TextInput placeholder="Contact Phone / Email" value={gatekeeper.contact} onChangeText={(v) => setGatekeeper({...gatekeeper, contact: v})} style={{ backgroundColor: COLORS.bg, borderRadius: 10, padding: 12, marginBottom: 16 }} />
      <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting} style={{ backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "700" }}>{isSubmitting ? "SENDING..." : "SUBMIT FOR VALIDATION"}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProviderFinancialDashboard({ user }) {
  const [ledger, setLedger] = useState({ metrics: { totalEarned: 0, fundsInEscrow: 0, withdrawnToWallet: 0 }, history: [] });
  const [loading, setLoading] = useState(true);

  const fetchLedger = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/providers/ledger`, {
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (data.success) setLedger(data.data);
    } catch (err) {
      console.error("Ledger fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLedger(); }, []);

  if (loading) return <Text style={{ textAlign: 'center', padding: 20 }}>Loading Ledger...</Text>;

  return (
    <View style={{ gap: 16 }}>
      <View style={{ backgroundColor: COLORS.primaryDark, borderRadius: 20, padding: 24, flexDirection: isDesktop ? "row" : "column", gap: 24 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>TOTAL EARNED (PGK)</Text>
          <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900", marginTop: 8 }}>K{Number(ledger.metrics.totalEarned).toFixed(2)}</Text>
        </View>
        <View style={{ height: isDesktop ? 60 : 1, width: isDesktop ? 1 : "100%", backgroundColor: "rgba(255,255,255,0.1)" }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>IN ESCROW</Text>
          <Text style={{ color: COLORS.accent, fontSize: 24, fontWeight: "800", marginTop: 4 }}>K{Number(ledger.metrics.fundsInEscrow).toFixed(2)}</Text>
        </View>
        <View style={{ height: isDesktop ? 60 : 1, width: isDesktop ? 1 : "100%", backgroundColor: "rgba(255,255,255,0.1)" }} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" }}>MOBILE WALLET</Text>
          <Text style={{ color: "#10B981", fontSize: 24, fontWeight: "800", marginTop: 4 }}>K{Number(ledger.metrics.withdrawnToWallet).toFixed(2)}</Text>
        </View>
      </View>

      <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.text, marginTop: 8 }}>📜 Permanent Employment Record</Text>
      {ledger.history.length === 0 ? (
        <View style={{ padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ color: COLORS.textMuted }}>No completed job cards found.</Text>
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {ledger.history.map((job) => (
            <View key={job.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 2, borderLeftWidth: 6, borderLeftColor: COLORS.primary }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text }}>{job.service_type}</Text>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>Client: {job.customer_name}</Text>
                </View>
                <View style={{ alignItems: 'right' }}>
                  <Text style={{ fontSize: 20, fontWeight: "900", color: COLORS.primary }}>K{Number(job.price).toFixed(2)}</Text>
                  <Text style={{ fontSize: 10, color: COLORS.textLight, textAlign: 'right' }}>{new Date(job.completed_at || Date.now()).toLocaleDateString()}</Text>
                </View>
              </View>
              <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 12 }} />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Text style={{ fontSize: 14 }}>⭐</Text>
                  <Text style={{ fontWeight: "700", color: COLORS.accent }}>{job.feedback_rating || 5.0} Rating</Text>
                </View>
                <View style={{ backgroundColor: "#F0FDF4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ fontSize: 10, fontWeight: "800", color: "#166534" }}>VERIFIED RECORD</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
\n"""
        lines[start_screens + 1:end_junk] = [new_provider_components]

with open('WantokWorkforce.js', 'w') as f:
    f.writelines(lines)
