import { useState, useEffect } from "react";

const COLORS = {
  primary: "#1A6B3C",
  primaryLight: "#2E9E5B",
  primaryDark: "#0F4024",
  accent: "#F5A623",
  accentDark: "#C47F0A",
  bg: "#F0F4F0",
  card: "#FFFFFF",
  text: "#1A1A2E",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  danger: "#EF4444",
  info: "#3B82F6",
  border: "#E5E7EB",
  statusBar: "#0F4024",
};

const mockWorkers = [
  { id: 1, name: "James Kapi", role: "Electrician", rating: 4.8, reviews: 124, location: "Port Moresby", available: true, verified: true, avatar: "JK", type: "blue", tags: ["Wiring", "Solar", "Industrial"] },
  { id: 2, name: "Mary Teine", role: "Accountant", rating: 4.9, reviews: 87, location: "Lae", available: true, verified: true, avatar: "MT", type: "white", tags: ["Audit", "Tax", "MYOB"] },
  { id: 3, name: "Peter Aihi", role: "Plumber", rating: 4.6, reviews: 203, location: "Madang", available: false, verified: true, avatar: "PA", type: "blue", tags: ["Pipework", "Gas", "Maintenance"] },
  { id: 4, name: "Susan Karo", role: "Nurse", rating: 5.0, reviews: 56, location: "Goroka", available: true, verified: true, avatar: "SK", type: "white", tags: ["First Aid", "Home Care", "IV"] },
  { id: 5, name: "Tom Waiko", role: "Carpenter", rating: 4.7, reviews: 178, location: "Port Moresby", available: true, verified: false, avatar: "TW", type: "blue", tags: ["Furniture", "Roofing", "Frames"] },
  { id: 6, name: "Lucy Mondo", role: "Lawyer", rating: 4.5, reviews: 42, location: "Lae", available: true, verified: true, avatar: "LM", type: "white", tags: ["Property", "Labour Law", "Contracts"] },
];

const categories = [
  { icon: "⚡", label: "Electric", color: "#F59E0B" },
  { icon: "🔧", label: "Plumbing", color: "#3B82F6" },
  { icon: "🪚", label: "Carpentry", color: "#8B5CF6" },
  { icon: "💼", label: "Finance", color: "#10B981" },
  { icon: "⚖️", label: "Legal", color: "#EF4444" },
  { icon: "🏥", label: "Medical", color: "#EC4899" },
  { icon: "🎨", label: "Design", color: "#F97316" },
  { icon: "📐", label: "More", color: "#6B7280" },
];

const StarRating = ({ rating }) => {
  const stars = Math.round(rating);
  return (
    <span style={{ color: COLORS.accent, fontSize: 12, letterSpacing: -1 }}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)}
    </span>
  );
};

const TrustBadge = ({ score }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 4,
    background: "linear-gradient(135deg, #1A6B3C, #2E9E5B)",
    borderRadius: 20, padding: "2px 8px",
  }}>
    <span style={{ fontSize: 10 }}>✓</span>
    <span style={{ color: "#fff", fontSize: 10, fontWeight: 700 }}>Verified</span>
  </div>
);

// ─── SCREENS ───────────────────────────────────────────────────────────────

function HomeScreen({ onNavigate, currentUser }) {
  const [searchText, setSearchText] = useState("");
  const [filtered, setFiltered] = useState(mockWorkers);

  useEffect(() => {
    if (!searchText) { setFiltered(mockWorkers); return; }
    setFiltered(mockWorkers.filter(w =>
      w.name.toLowerCase().includes(searchText.toLowerCase()) ||
      w.role.toLowerCase().includes(searchText.toLowerCase()) ||
      w.location.toLowerCase().includes(searchText.toLowerCase())
    ));
  }, [searchText]);

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${COLORS.primaryDark} 0%, ${COLORS.primary} 100%)`,
        padding: "20px 16px 28px",
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, margin: 0 }}>Good morning 👋</p>
            <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "2px 0 0" }}>
              {currentUser === "customer" ? "Find a Wantok" : "Your Dashboard"}
            </h2>
          </div>
          <div style={{
            width: 42, height: 42, borderRadius: 21,
            background: "rgba(255,255,255,0.2)", display: "flex",
            alignItems: "center", justifyContent: "center",
            border: "2px solid rgba(255,255,255,0.3)",
            fontSize: 18, cursor: "pointer",
          }} onClick={() => onNavigate("profile")}>
            👤
          </div>
        </div>

        {/* Search */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "10px 14px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}>
          <span style={{ fontSize: 18 }}>🔍</span>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Search skills, roles, location..."
            style={{
              border: "none", outline: "none", flex: 1,
              fontSize: 14, color: COLORS.text, background: "transparent",
            }}
          />
          <div style={{
            background: COLORS.primary, borderRadius: 8, padding: "4px 10px",
            color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>
            📍 PNG
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "20px 16px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text }}>Categories</h3>
          <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>See All</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {categories.map((cat, i) => (
            <div key={i} onClick={() => setSearchText(cat.label)} style={{
              background: "#fff", borderRadius: 14, padding: "12px 8px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              transition: "transform 0.15s",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: cat.color + "18", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>{cat.icon}</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted }}>{cat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Worker Cards */}
      <div style={{ padding: "8px 16px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: COLORS.text }}>
            {searchText ? `Results (${filtered.length})` : "Top Wantoks Near You"}
          </h3>
          <span style={{ fontSize: 12, color: COLORS.primary, fontWeight: 600 }}>Filter ⚙️</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(worker => (
            <WorkerCard key={worker.id} worker={worker} onPress={() => onNavigate("workerDetail", worker)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkerCard({ worker, onPress }) {
  return (
    <div onClick={onPress} style={{
      background: "#fff", borderRadius: 18, padding: 16,
      boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start",
      border: `1px solid ${COLORS.border}`,
      transition: "box-shadow 0.2s",
    }}>
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: worker.type === "blue"
            ? "linear-gradient(135deg, #3B82F6, #1D4ED8)"
            : "linear-gradient(135deg, #8B5CF6, #6D28D9)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 1,
        }}>{worker.avatar}</div>
        <div style={{
          position: "absolute", bottom: -3, right: -3,
          width: 16, height: 16, borderRadius: 8,
          background: worker.available ? "#10B981" : "#9CA3AF",
          border: "2px solid #fff",
        }} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text }}>{worker.name}</h4>
              {worker.verified && <span style={{ fontSize: 14 }}>✅</span>}
            </div>
            <p style={{ margin: "2px 0", fontSize: 13, color: COLORS.primary, fontWeight: 600 }}>{worker.role}</p>
          </div>
          <div style={{
            background: worker.available ? "#ECFDF5" : "#F3F4F6",
            color: worker.available ? "#059669" : "#6B7280",
            borderRadius: 8, padding: "3px 8px", fontSize: 11, fontWeight: 700,
          }}>
            {worker.available ? "Available" : "Busy"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0" }}>
          <StarRating rating={worker.rating} />
          <span style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{worker.rating}</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>({worker.reviews} reviews)</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <span style={{ fontSize: 12 }}>📍</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>{worker.location}</span>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {worker.tags.map((tag, i) => (
            <span key={i} style={{
              background: "#F0FDF4", color: COLORS.primary,
              borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function WorkerDetailScreen({ worker, onNavigate }) {
  const [booked, setBooked] = useState(false);
  const [tab, setTab] = useState("about");

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      {/* Header */}
      <div style={{
        background: `linear-gradient(160deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
        padding: "16px 16px 40px",
        position: "relative",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div onClick={() => onNavigate("home")} style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.2)", display: "flex",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", fontWeight: 700,
          }}>←</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Profile</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 88, height: 88, borderRadius: 24,
            background: worker.type === "blue"
              ? "linear-gradient(135deg, #60A5FA, #2563EB)"
              : "linear-gradient(135deg, #A78BFA, #7C3AED)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: 800, fontSize: 28,
            border: "3px solid rgba(255,255,255,0.4)",
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}>{worker.avatar}</div>
          <div style={{ textAlign: "center" }}>
            <h2 style={{ color: "#fff", margin: 0, fontSize: 22, fontWeight: 800 }}>{worker.name}</h2>
            <p style={{ color: "rgba(255,255,255,0.8)", margin: "4px 0 0", fontSize: 14 }}>{worker.role} · {worker.location}</p>
          </div>
          {worker.verified && <TrustBadge />}
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        margin: "-20px 16px 0",
        background: "#fff", borderRadius: 18,
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        padding: "16px", display: "flex",
      }}>
        {[
          { label: "Rating", value: worker.rating, suffix: "★" },
          { label: "Reviews", value: worker.reviews, suffix: "" },
          { label: "Trust", value: worker.verified ? "100%" : "80%", suffix: "" },
        ].map((stat, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center",
            borderRight: i < 2 ? `1px solid ${COLORS.border}` : "none",
          }}>
            <p style={{ margin: 0, fontWeight: 800, fontSize: 20, color: COLORS.primary }}>
              {stat.value}{stat.suffix}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textMuted }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", margin: "20px 16px 0", background: "#E5E7EB", borderRadius: 12, padding: 4 }}>
        {["about", "portfolio", "reviews"].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{
            flex: 1, textAlign: "center", padding: "8px 0", borderRadius: 10,
            background: tab === t ? "#fff" : "transparent",
            color: tab === t ? COLORS.primary : COLORS.textMuted,
            fontWeight: tab === t ? 700 : 500, fontSize: 13, cursor: "pointer",
            boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
            textTransform: "capitalize", transition: "all 0.2s",
          }}>{t}</div>
        ))}
      </div>

      <div style={{ padding: "16px" }}>
        {tab === "about" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 700, color: COLORS.text }}>About</h4>
              <p style={{ margin: 0, fontSize: 13, color: COLORS.textMuted, lineHeight: 1.6 }}>
                Experienced {worker.role.toLowerCase()} with over 8 years in Papua New Guinea. Available for both on-demand and consultative bookings across {worker.location} and surrounding areas.
              </p>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: COLORS.text }}>Skills</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {worker.tags.map((tag, i) => (
                  <span key={i} style={{
                    background: "#F0FDF4", color: COLORS.primary, borderRadius: 8,
                    padding: "6px 12px", fontSize: 13, fontWeight: 600, border: `1px solid #BBF7D0`,
                  }}>{tag}</span>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
              <h4 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: COLORS.text }}>Worker Type</h4>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 14px", borderRadius: 12,
                background: worker.type === "blue" ? "#EFF6FF" : "#F5F3FF",
              }}>
                <span style={{ fontSize: 24 }}>{worker.type === "blue" ? "🔧" : "💼"}</span>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: worker.type === "blue" ? "#1D4ED8" : "#7C3AED" }}>
                    {worker.type === "blue" ? "Blue Collar Worker" : "White Collar Professional"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textMuted }}>
                    {worker.type === "blue" ? "Visual evidence & image verification" : "Credential vault & cert upload"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "portfolio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: "#fff", borderRadius: 16, padding: 16,
              border: `2px dashed ${COLORS.border}`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 40 }}>{worker.type === "blue" ? "📸" : "📄"}</span>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: COLORS.text }}>
                {worker.type === "blue" ? "Work Portfolio" : "Credential Vault"}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.textMuted, textAlign: "center" }}>
                {worker.type === "blue"
                  ? "Photo evidence of past work uploaded to Cloud Object Storage (S3)"
                  : "Certificates and credentials securely stored"}
              </p>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, width: "100%",
              }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{
                    aspectRatio: "1", background: `hsl(${i * 40}, 30%, 92%)`,
                    borderRadius: 10, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: 24,
                  }}>{worker.type === "blue" ? "🖼️" : "📋"}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "reviews" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { name: "K. Peni", text: "Excellent work, very professional and on time!", rating: 5 },
              { name: "A. Haro", text: "Fixed the issue quickly, fair price.", rating: 4 },
              { name: "D. Moke", text: "Would definitely hire again!", rating: 5 },
            ].map((rev, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{rev.name}</span>
                  <StarRating rating={rev.rating} />
                </div>
                <p style={{ margin: 0, fontSize: 13, color: COLORS.textMuted }}>{rev.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        padding: "0 16px 20px",
        display: "flex", gap: 10,
      }}>
        <div style={{
          flex: 1, padding: "14px", borderRadius: 14,
          background: "#fff", border: `2px solid ${COLORS.primary}`,
          textAlign: "center", cursor: "pointer",
          color: COLORS.primary, fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }} onClick={() => onNavigate("chat", worker)}>
          <span>💬</span> WhatsApp
        </div>
        <div onClick={() => { setBooked(true); onNavigate("booking", worker); }} style={{
          flex: 2, padding: "14px", borderRadius: 14,
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
          textAlign: "center", cursor: "pointer",
          color: "#fff", fontWeight: 700, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: `0 4px 14px ${COLORS.primary}60`,
        }}>
          <span>📅</span> Book Now
        </div>
      </div>
    </div>
  );
}

function BookingScreen({ worker, onNavigate }) {
  const [type, setType] = useState("on-demand");
  const [confirmed, setConfirmed] = useState(false);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  if (confirmed) return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 20, background: COLORS.bg }}>
      <div style={{
        width: 100, height: 100, borderRadius: 50,
        background: "linear-gradient(135deg, #10B981, #059669)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 48, boxShadow: "0 8px 32px #10B98160",
        animation: "pulse 1s",
      }}>✓</div>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: COLORS.text }}>Booking Confirmed!</h2>
        <p style={{ margin: "8px 0 0", color: COLORS.textMuted, fontSize: 14 }}>
          {worker.name} has been notified via SMS & push notification.
        </p>
      </div>
      <div style={{
        background: "#fff", borderRadius: 18, padding: 20, width: "100%",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: `1px solid ${COLORS.border}`,
      }}>
        {[
          ["Worker", worker.name],
          ["Service", worker.role],
          ["Type", type === "on-demand" ? "On-Demand" : "Consultative"],
          ["Date", date || "ASAP"],
          ["Status", "Pending Confirmation"],
        ].map(([k, v], i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${COLORS.border}` : "none" }}>
            <span style={{ fontSize: 13, color: COLORS.textMuted }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{v}</span>
          </div>
        ))}
      </div>
      <div onClick={() => onNavigate("home")} style={{
        width: "100%", padding: 16, borderRadius: 14,
        background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
        textAlign: "center", cursor: "pointer",
        color: "#fff", fontWeight: 700, fontSize: 15,
      }}>Back to Home</div>
    </div>
  );

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      <div style={{
        background: `linear-gradient(160deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
        padding: "16px 16px 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div onClick={() => onNavigate("workerDetail", worker)} style={{
            width: 36, height: 36, borderRadius: 10,
            background: "rgba(255,255,255,0.2)", display: "flex",
            alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#fff", fontWeight: 700,
          }}>←</div>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Book {worker.name}</span>
        </div>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Booking Type */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: COLORS.text }}>Booking Type</h4>
          <div style={{ display: "flex", gap: 10 }}>
            {[["on-demand", "⚡", "On-Demand", "Immediate"], ["consultative", "📋", "Consultative", "Scheduled"]].map(([val, icon, label, sub]) => (
              <div key={val} onClick={() => setType(val)} style={{
                flex: 1, padding: 14, borderRadius: 12,
                border: `2px solid ${type === val ? COLORS.primary : COLORS.border}`,
                background: type === val ? "#F0FDF4" : "#fff",
                cursor: "pointer", textAlign: "center",
                transition: "all 0.2s",
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: type === val ? COLORS.primary : COLORS.text }}>{label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 11, color: COLORS.textMuted }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Date/Time */}
        {type === "consultative" && (
          <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
            <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: COLORS.text }}>Preferred Date</h4>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{
                width: "100%", padding: 12, borderRadius: 10,
                border: `1px solid ${COLORS.border}`, fontSize: 14,
                outline: "none", color: COLORS.text, boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* Notes */}
        <div style={{ background: "#fff", borderRadius: 16, padding: 16 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: COLORS.text }}>Job Notes</h4>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Describe the job or task..."
            rows={4}
            style={{
              width: "100%", borderRadius: 10, border: `1px solid ${COLORS.border}`,
              padding: 12, fontSize: 13, outline: "none", resize: "none",
              color: COLORS.text, lineHeight: 1.5, boxSizing: "border-box",
            }}
          />
        </div>

        {/* Communication Info */}
        <div style={{
          background: "#F0FDF4", borderRadius: 14, padding: 14,
          display: "flex", gap: 12, alignItems: "center",
          border: `1px solid #BBF7D0`,
        }}>
          <span style={{ fontSize: 24 }}>📲</span>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: COLORS.primary }}>SMS & WhatsApp Notification</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textMuted }}>Works in low-bandwidth areas. Multi-lingual support available.</p>
          </div>
        </div>

        <div onClick={() => setConfirmed(true)} style={{
          padding: 16, borderRadius: 14,
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
          textAlign: "center", cursor: "pointer",
          color: "#fff", fontWeight: 700, fontSize: 15,
          boxShadow: `0 4px 16px ${COLORS.primary}50`,
        }}>
          Confirm Booking 📅
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ onNavigate, currentUser, onToggleUser }) {
  const isProvider = currentUser === "provider";

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      <div style={{
        background: `linear-gradient(160deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
        padding: "20px 16px 40px",
      }}>
        <h2 style={{ color: "#fff", margin: "0 0 20px", fontSize: 18, fontWeight: 800 }}>
          {isProvider ? "My Provider Profile" : "My Account"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, border: "3px solid rgba(255,255,255,0.4)",
          }}>👤</div>
          <div style={{ textAlign: "center" }}>
            <h3 style={{ color: "#fff", margin: 0, fontWeight: 800 }}>{isProvider ? "James Kapi" : "Sarah Mano"}</h3>
            <p style={{ color: "rgba(255,255,255,0.75)", margin: "4px 0 0", fontSize: 13 }}>
              {isProvider ? "Electrician · Port Moresby" : "Customer · Lae, PNG"}
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 12 }}>

        {/* Toggle Role */}
        <div style={{
          background: "#fff", borderRadius: 16, padding: 16,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>{isProvider ? "🔧" : "🙋"}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: COLORS.text }}>
                {isProvider ? "Provider Mode" : "Customer Mode"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textMuted }}>Switch app view</p>
            </div>
          </div>
          <div onClick={onToggleUser} style={{
            padding: "8px 16px", borderRadius: 10, cursor: "pointer",
            background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryLight})`,
            color: "#fff", fontWeight: 700, fontSize: 12,
          }}>
            Switch to {isProvider ? "Customer" : "Provider"}
          </div>
        </div>

        {isProvider && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: 16,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <h4 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: COLORS.text }}>Trust Score</h4>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: COLORS.textMuted }}>Verification Score</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.primary }}>92%</span>
                </div>
                <div style={{ height: 8, background: "#E5E7EB", borderRadius: 4 }}>
                  <div style={{ width: "92%", height: "100%", background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryLight})`, borderRadius: 4 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {[
          { icon: "🔔", label: "SMS Notifications", sub: "Offline mode enabled" },
          { icon: "🌐", label: "Language", sub: "Tok Pisin / English" },
          { icon: "📶", label: "Low-Bandwidth Mode", sub: "On — saves data" },
          { icon: "🔒", label: "Privacy & Security", sub: "Auth secured" },
          { icon: "❓", label: "Help & Support", sub: "WhatsApp / Direct dial" },
        ].map((item, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 14, padding: "14px 16px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)", cursor: "pointer",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: COLORS.text }}>{item.label}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textMuted }}>{item.sub}</p>
              </div>
            </div>
            <span style={{ color: COLORS.textLight, fontSize: 16 }}>›</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrustScreen({ onNavigate }) {
  const [workers, setWorkers] = useState(mockWorkers.map(w => ({ ...w, trustScore: Math.floor(70 + Math.random() * 30) })));

  return (
    <div style={{ flex: 1, overflowY: "auto", background: COLORS.bg }}>
      <div style={{
        background: `linear-gradient(160deg, ${COLORS.primaryDark}, ${COLORS.primary})`,
        padding: "20px 16px 24px",
      }}>
        <h2 style={{ color: "#fff", margin: 0, fontSize: 18, fontWeight: 800 }}>Trust & Verification</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", margin: "4px 0 0", fontSize: 13 }}>Admin Dashboard · All Workers</p>
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
        }}>
          {[
            { label: "Verified Workers", value: "4", icon: "✅", color: "#10B981" },
            { label: "Pending Review", value: "2", icon: "⏳", color: "#F59E0B" },
            { label: "Total Reviews", value: "690", icon: "⭐", color: "#3B82F6" },
            { label: "Avg Trust Score", value: "87%", icon: "🛡️", color: "#8B5CF6" },
          ].map((stat, i) => (
            <div key={i} style={{
              background: "#fff", borderRadius: 14, padding: "14px 16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</div>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 22, color: stat.color }}>{stat.value}</p>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.textMuted }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <h3 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 700, color: COLORS.text }}>Worker Trust Scores</h3>

        {workers.map(w => (
          <div key={w.id} style={{
            background: "#fff", borderRadius: 14, padding: 14,
            boxShadow: "0 1px 6px rgba(0,0,0,0.05)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: w.type === "blue"
                ? "linear-gradient(135deg, #60A5FA, #2563EB)"
                : "linear-gradient(135deg, #A78BFA, #7C3AED)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: 14, flexShrink: 0,
            }}>{w.avatar}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: COLORS.text }}>{w.name}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: w.trustScore > 85 ? "#10B981" : "#F59E0B" }}>{w.trustScore}%</span>
              </div>
              <p style={{ margin: "2px 0 6px", fontSize: 12, color: COLORS.textMuted }}>{w.role}</p>
              <div style={{ height: 6, background: "#E5E7EB", borderRadius: 3 }}>
                <div style={{
                  width: `${w.trustScore}%`, height: "100%", borderRadius: 3,
                  background: w.trustScore > 85
                    ? "linear-gradient(90deg, #10B981, #34D399)"
                    : "linear-gradient(90deg, #F59E0B, #FCD34D)",
                  transition: "width 0.5s",
                }} />
              </div>
            </div>
            {w.verified && <span style={{ fontSize: 18 }}>✅</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BOTTOM NAV ─────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { key: "home", icon: "🏠", label: "Home" },
  { key: "trust", icon: "🛡️", label: "Trust" },
  { key: "booking", icon: "📅", label: "Bookings" },
  { key: "profile", icon: "👤", label: "Profile" },
];

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("home");
  const [screenData, setScreenData] = useState(null);
  const [currentUser, setCurrentUser] = useState("customer");

  const navigate = (to, data = null) => {
    setScreen(to);
    setScreenData(data);
  };

  const renderScreen = () => {
    switch (screen) {
      case "home": return <HomeScreen onNavigate={navigate} currentUser={currentUser} />;
      case "workerDetail": return <WorkerDetailScreen worker={screenData} onNavigate={navigate} />;
      case "booking": return <BookingScreen worker={screenData} onNavigate={navigate} />;
      case "trust": return <TrustScreen onNavigate={navigate} />;
      case "profile": return <ProfileScreen onNavigate={navigate} currentUser={currentUser} onToggleUser={() => setCurrentUser(u => u === "customer" ? "provider" : "customer")} />;
      default: return <HomeScreen onNavigate={navigate} currentUser={currentUser} />;
    }
  };

  const activeNav = ["home", "trust", "booking", "profile"].includes(screen) ? screen : "home";

  return (
    <div style={{
      display: "flex", justifyContent: "center", alignItems: "center",
      minHeight: "100vh", background: "#1A1A2E",
      fontFamily: "'Nunito', 'Segoe UI', sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
        input, textarea { font-family: 'Nunito', sans-serif; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}</style>

      {/* Phone Shell */}
      <div style={{
        width: 390, height: 820,
        background: "#000",
        borderRadius: 48,
        boxShadow: "0 0 0 8px #1a1a1a, 0 0 0 10px #333, 0 40px 80px rgba(0,0,0,0.6)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        position: "relative",
      }}>
        {/* Status Bar */}
        <div style={{
          background: COLORS.statusBar, height: 44,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 20px",
        }}>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>9:41</span>
          <div style={{
            width: 100, height: 26, background: "#000", borderRadius: 13,
            position: "absolute", left: "50%", transform: "translateX(-50%)",
            top: 8,
          }} />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: "#fff", fontSize: 12 }}>📶</span>
            <span style={{ color: "#fff", fontSize: 12 }}>🔋</span>
          </div>
        </div>

        {/* App Header Brand */}
        <div style={{
          background: COLORS.statusBar, height: 32,
          display: "flex", alignItems: "center", paddingLeft: 16,
          gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>🤝</span>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: 0.5 }}>WANTOK WORKFORCE</span>
          <span style={{
            marginLeft: "auto", marginRight: 16,
            background: COLORS.accent, color: "#fff",
            borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 700,
          }}>PNG</span>
        </div>

        {/* Screen Content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: COLORS.bg }}>
          {renderScreen()}
        </div>

        {/* Bottom Nav */}
        <div style={{
          background: "#fff", height: 68,
          display: "flex", alignItems: "center",
          borderTop: `1px solid ${COLORS.border}`,
          paddingBottom: 4,
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeNav === item.key;
            return (
              <div key={item.key} onClick={() => navigate(item.key)} style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3,
                cursor: "pointer", padding: "4px 0",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 12,
                  background: isActive ? "#F0FDF4" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s",
                  fontSize: 20,
                }}>{item.icon}</div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 800 : 500,
                  color: isActive ? COLORS.primary : COLORS.textMuted,
                }}>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
