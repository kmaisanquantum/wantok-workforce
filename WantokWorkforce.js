import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import categories from "./categories.json";

const { width } = Dimensions.get("window");
const API_BASE = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) ? process.env.REACT_APP_API_URL : (Platform.OS === 'web' ? '/api' : 'http://45.32.243.144:3000');

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


const StarRating = ({ rating }) => {
  const stars = Math.round(rating);
  return (
    <View style={{ flexDirection: "row" }}>
      <Text style={{ color: COLORS.accent, fontSize: 12 }}>
        {"★".repeat(stars)}{"☆".repeat(5 - stars)}
      </Text>
    </View>
  );
};

const TrustBadge = () => (
  <LinearGradient
    colors={[COLORS.primary, COLORS.primaryLight]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={{
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 2,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 10 }}>✓</Text>
    <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>Verified</Text>
  </LinearGradient>
);

// ─── SCREENS ───────────────────────────────────────────────────────────────


function HomeScreen({ onNavigate, currentUser, user, onUpdateUser }) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [isSearching, setIsSearching] = useState(true);

  const fetchNearbyProviders = async () => {
    setIsSearching(true);
    const lat = -9.4438;
    const lon = 147.1803;

    try {
      const url = `${API_BASE}/api/match/nearby?latitude=${lat}&longitude=${lon}${selectedCategory ? '&trade_category=' + selectedCategory : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setNearbyWorkers(data.workers);
      } else {
        alert(data.error || "Matching engine failed.");
      }
    } catch (error) {
      console.error("Match fetch failed:", error);
      alert("Network error while searching.");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!searchText && !selectedCategory) {
      setFiltered([]);
      setNearbyWorkers([]);
      return;
    }
  }, [searchText, selectedCategory]);

  if (currentUser === "provider") {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={{ padding: 24, paddingBottom: 40 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Welcome Back, Provider</Text>
                <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", marginTop: 4 }}>Your Dashboard</Text>
              </View>
              <TouchableOpacity onPress={() => onNavigate("profile")} style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" }}>
                <Text style={{ fontSize: 24 }}>🔧</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <View style={{ padding: 16, marginTop: -20, gap: 16 }}>
            <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 4 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>Work Status</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: user?.is_available ? "#10B981" : "#9CA3AF", marginRight: 6 }} />
                    <Text style={{ fontSize: 13, fontWeight: "600", color: user?.is_available ? "#10B981" : "#6B7280" }}>{user?.is_available ? "Available for Jobs" : "Busy / Offline"}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={async () => {
                  const newStatus = !user?.is_available;
                  onUpdateUser({ ...user, is_available: newStatus });
                  try {
                    await fetch(`${API_BASE}/api/auth/availability`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` }, body: JSON.stringify({ is_available: newStatus }) });
                  } catch (err) {
                    onUpdateUser({ ...user, is_available: !newStatus });
                    alert("Could not update status.");
                  }
                }} style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: user?.is_available ? COLORS.primary : "#E5E7EB", padding: 2, justifyContent: "center" }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", transform: [{ translateX: user?.is_available ? 22 : 0 }], elevation: 2 }} />
                </TouchableOpacity>
              </View>
              <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 16 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: "700", color: COLORS.text }}>Trust Score</Text>
                <Text style={{ fontSize: 16, fontWeight: "900", color: COLORS.primary }}>92%</Text>
              </View>
              <View style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}><View style={{ width: "92%", height: "100%", backgroundColor: COLORS.primary }} /></View>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[COLORS.primaryDark, COLORS.primary]} style={{ paddingTop: 10, paddingHorizontal: 16, paddingBottom: 25, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Good morning 👋</Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 }}>Find a Wantok</Text>
            </View>
            <TouchableOpacity style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.3)" }} onPress={() => onNavigate("profile")}>
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          </View>
          <View style={{ backgroundColor: "#fff", borderRadius: 14, paddingVertical: 8, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, elevation: 4 }}>
            <Text style={{ fontSize: 18 }}>🔍</Text>
            <TextInput value={searchText} onChangeText={setSearchText} placeholder="Search trade or category..." placeholderTextColor={COLORS.textLight} style={{ flex: 1, fontSize: 14, color: COLORS.text, padding: 0 }} />
            <View style={{ backgroundColor: COLORS.primary, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 }}><Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>📍 PNG</Text></View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, marginTop: 15 }}>
          <TouchableOpacity onPress={fetchNearbyProviders} disabled={isSearching} style={{ backgroundColor: COLORS.primary, borderRadius: 14, paddingVertical: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, elevation: 4 }}>
            <Text style={{ fontSize: 18 }}>🛰️</Text>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>{isSearching ? "SEARCHING NEARBY..." : "FIND NEARBY PROVIDERS"}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ paddingVertical: 20, paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 }}>Categories</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 }}>
            {categories.map((cat, i) => (
              <TouchableOpacity key={i} onPress={() => { setSelectedCategory(cat.label); setSearchText(""); }} style={{ width: (width - 32) / 4 - 10, margin: 5, backgroundColor: selectedCategory === cat.label ? cat.color + "22" : "#fff", borderRadius: 14, paddingVertical: 12, alignItems: "center", gap: 6, elevation: 2, borderWidth: selectedCategory === cat.label ? 1 : 0, borderColor: cat.color }}>
                <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                <Text numberOfLines={1} style={{ fontSize: 10, fontWeight: "600", color: selectedCategory === cat.label ? cat.color : COLORS.textMuted }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: 12 }}>
            {nearbyWorkers.length > 0 ? `Nearby Providers (${nearbyWorkers.length})` : "Top Wantoks Near You"}
          </Text>
          {nearbyWorkers.length > 0 ? (
            <View style={{ gap: 12 }}>
              {nearbyWorkers.map((worker) => (
                <WorkerCard key={worker.id} worker={worker} onPress={() => onNavigate("workerDetail", worker)} />
              ))}
            </View>
          ) : (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: COLORS.textLight }}>{isSearching ? "Updating matches..." : "Select a category or click Find Nearby."}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
function WorkerDetailScreen({ worker, onNavigate }) {
  const [booked, setBooked] = useState(true);
  const [tab, setTab] = useState("about");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => onNavigate("home")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Profile</Text>
          </View>

          <View style={{ flexDirection: "column", alignItems: "center", gap: 10 }}>
            <LinearGradient
              colors={
                worker.type === "blue" ? ["#60A5FA", "#2563EB"] : ["#A78BFA", "#7C3AED"]
              }
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.4)",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 28 }}>
                {worker.avatar}
              </Text>
            </LinearGradient>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 22, fontWeight: "800" }}>
                {worker.name}
              </Text>
              <Text
                style={{ color: "rgba(255,255,255,0.8)", marginTop: 4, fontSize: 14 }}
              >
                {worker.role} · {worker.location}
              </Text>
            </View>
            {worker.verified && <TrustBadge />}
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View
          style={{
            marginTop: -20,
            marginHorizontal: 16,
            backgroundColor: "#fff",
            borderRadius: 18,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            padding: 16,
            flexDirection: "row",
          }}
        >
          {[
            { label: "Rating", value: worker.rating, suffix: "★" },
            { label: "Reviews", value: worker.reviews, suffix: "" },
            { label: "Trust", value: worker.verified ? "100%" : "80%", suffix: "" },
          ].map((stat, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                alignItems: "center",
                borderRightWidth: i < 2 ? 1 : 0,
                borderRightColor: COLORS.border,
              }}
            >
              <Text style={{ fontWeight: "800", fontSize: 20, color: COLORS.primary }}>
                {stat.value}
                {stat.suffix}
              </Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.textMuted }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Tabs */}
        <View
          style={{
            flexDirection: "row",
            marginHorizontal: 16,
            marginTop: 20,
            backgroundColor: "#E5E7EB",
            borderRadius: 12,
            padding: 4,
          }}
        >
          {["about", "portfolio", "reviews"].map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: tab === t ? "#fff" : "transparent",
                elevation: tab === t ? 2 : 0,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: tab === t ? 0.1 : 0,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  color: tab === t ? COLORS.primary : COLORS.textMuted,
                  fontWeight: tab === t ? "700" : "500",
                  fontSize: 13,
                  textTransform: "capitalize",
                }}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ padding: 16 }}>
          {tab === "about" && (
            <View style={{ gap: 12 }}>
              <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
                <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: "700", color: COLORS.text }}>
                  About
                </Text>
                <Text style={{ fontSize: 13, color: COLORS.textMuted, lineHeight: 20 }}>
                  Experienced {worker.role.toLowerCase()} with over 8 years in Papua New
                  Guinea. Available for both on-demand and consultative bookings across{" "}
                  {worker.location} and surrounding areas.
                </Text>
              </View>
              <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
                <Text style={{ marginBottom: 10, fontSize: 14, fontWeight: "700", color: COLORS.text }}>
                  Skills
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {worker.tags.map((tag, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: "#F0FDF4",
                        borderRadius: 8,
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderWidth: 1,
                        borderColor: "#BBF7D0",
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.primary,
                          fontSize: 13,
                          fontWeight: "600",
                        }}
                      >
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
                <Text style={{ marginBottom: 10, fontSize: 14, fontWeight: "700", color: COLORS.text }}>
                  Worker Type
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    paddingVertical: 10,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: worker.type === "blue" ? "#EFF6FF" : "#F5F3FF",
                  }}
                >
                  <Text style={{ fontSize: 24 }}>
                    {worker.type === "blue" ? "🔧" : "💼"}
                  </Text>
                  <View>
                    <Text
                      style={{
                        fontWeight: "700",
                        fontSize: 14,
                        color: worker.type === "blue" ? "#1D4ED8" : "#7C3AED",
                      }}
                    >
                      {worker.type === "blue"
                        ? "Blue Collar Worker"
                        : "White Collar Professional"}
                    </Text>
                    <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.textMuted }}>
                      {worker.type === "blue"
                        ? "Visual evidence & image verification"
                        : "Credential vault & cert upload"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {tab === "portfolio" && (
            <View style={{ gap: 12 }}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 16,
                  padding: 16,
                  borderWidth: 2,
                  borderColor: COLORS.border,
                  borderStyle: "dashed",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Text style={{ fontSize: 40 }}>
                  {worker.type === "blue" ? "📸" : "📄"}
                </Text>
                <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.text }}>
                  {worker.type === "blue" ? "Work Portfolio" : "Credential Vault"}
                </Text>
                <Text
                  style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center" }}
                >
                  {worker.type === "blue"
                    ? "Photo evidence of past work uploaded to Cloud Object Storage (S3)"
                    : "Certificates and credentials securely stored"}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    marginHorizontal: -4,
                  }}
                >
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: (width - 64 - 16) / 3,
                        aspectRatio: 1,
                        margin: 4,
                        backgroundColor: `hsl(${i * 40}, 30%, 92%)`,
                        borderRadius: 10,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>
                        {worker.type === "blue" ? "🖼️" : "📋"}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {tab === "reviews" && (
            <View style={{ gap: 10 }}>
              {[
                { name: "K. Peni", text: "Excellent work, very professional and on time!", rating: 5 },
                { name: "A. Haro", text: "Fixed the issue quickly, fair price.", rating: 4 },
                { name: "D. Moke", text: "Would definitely hire again!", rating: 5 },
              ].map((rev, i) => (
                <View
                  key={i}
                  style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14 }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{ fontWeight: "700", fontSize: 14, color: COLORS.text }}
                    >
                      {rev.name}
                    </Text>
                    <StarRating rating={rev.rating} />
                  </View>
                  <Text style={{ fontSize: 13, color: COLORS.textMuted }}>{rev.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingBottom: 20,
            flexDirection: "row",
            gap: 10,
          }}
        >
          <TouchableOpacity
            onPress={() => onNavigate("chat", worker)}
            style={{
              flex: 1,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: "#fff",
              borderWidth: 2,
              borderColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
            }}
          >
            <Text>💬</Text>
            <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 14 }}>
              WhatsApp
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setBooked(true);
              onNavigate("createBooking", worker);
            }}
            style={{
              flex: 2,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 8,
              elevation: 4,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 14,
            }}
          >
            <Text>📅</Text>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>
              Book Now
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function CreateBookingScreen({ worker, onNavigate }) {
  const [type, setType] = useState("on-demand");
  const [confirmed, setConfirmed] = useState(true);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");

  if (!worker) return null;

  if (confirmed)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
          gap: 20,
          backgroundColor: COLORS.bg,
        }}
      >
        <LinearGradient
          colors={["#10B981", "#059669"]}
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            alignItems: "center",
            justifyContent: "center",
            elevation: 8,
            shadowColor: "#10B981",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 32,
          }}
        >
          <Text style={{ fontSize: 48, color: "#fff" }}>✓</Text>
        </LinearGradient>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{ textAlign: "center", fontSize: 24, fontWeight: "800", color: COLORS.text }}
          >
            Booking Confirmed!
          </Text>
          <Text
            style={{
              textAlign: "center",
              marginTop: 8,
              color: COLORS.textMuted,
              fontSize: 14,
            }}
          >
            {worker.name} has been notified via SMS & push notification.
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            padding: 20,
            width: "100%",
            elevation: 2,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.07,
            shadowRadius: 12,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          {[
            ["Worker", worker.name],
            ["Service", worker.role],
            ["Type", type === "on-demand" ? "On-Demand" : "Consultative"],
            ["Date", date || "ASAP"],
            ["Status", "Pending Confirmation"],
          ].map(([k, v], i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderBottomWidth: i < 4 ? 1 : 0,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text style={{ fontSize: 13, color: COLORS.textMuted }}>{k}</Text>
              <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.text }}>
                {v}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => onNavigate("home")}
          style={{
            width: "100%",
            paddingVertical: 16,
            borderRadius: 14,
            backgroundColor: COLORS.primary,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>
    );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => onNavigate("workerDetail", worker)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>←</Text>
            </TouchableOpacity>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              Book {worker.name}
            </Text>
          </View>
        </LinearGradient>

        <View style={{ padding: 16, gap: 14 }}>
          {/* Booking Type */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
            <Text style={{ marginBottom: 12, fontSize: 14, fontWeight: "700", color: COLORS.text }}>
              Booking Type
            </Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                ["on-demand", "⚡", "On-Demand", "Immediate"],
                ["consultative", "📋", "Consultative", "Scheduled"],
              ].map(([val, icon, label, sub]) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => setType(val)}
                  style={{
                    flex: 1,
                    padding: 14,
                    borderRadius: 12,
                    borderWidth: 2,
                    borderColor: type === val ? COLORS.primary : COLORS.border,
                    backgroundColor: type === val ? "#F0FDF4" : "#fff",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>{icon}</Text>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 13,
                      color: type === val ? COLORS.primary : COLORS.text,
                    }}
                  >
                    {label}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 11, color: COLORS.textMuted }}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date/Time */}
          {type === "consultative" && (
            <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
              <Text style={{ marginBottom: 12, fontSize: 14, fontWeight: "700", color: COLORS.text }}>
                Preferred Date
              </Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  fontSize: 14,
                  color: COLORS.text,
                }}
              />
            </View>
          )}

          {/* Notes */}
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
            <Text style={{ marginBottom: 12, fontSize: 14, fontWeight: "700", color: COLORS.text }}>
              Job Notes
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Describe the job or task..."
              multiline
              numberOfLines={4}
              style={{
                width: "100%",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: COLORS.border,
                padding: 12,
                fontSize: 13,
                color: COLORS.text,
                textAlignVertical: "top",
                minHeight: 100,
              }}
            />
          </View>

          {/* Communication Info */}
          <View
            style={{
              backgroundColor: "#F0FDF4",
              borderRadius: 14,
              padding: 14,
              flexDirection: "row",
              gap: 12,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#BBF7D0",
            }}
          >
            <Text style={{ fontSize: 24 }}>📲</Text>
            <View>
              <Text style={{ fontWeight: "700", fontSize: 13, color: COLORS.primary }}>
                SMS & WhatsApp Notification
              </Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.textMuted }}>
                Works in low-bandwidth areas. Multi-lingual support available.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setConfirmed(true)}
            style={{
              paddingVertical: 16,
              borderRadius: 14,
              backgroundColor: COLORS.primary,
              alignItems: "center",
              elevation: 4,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
              Confirm Booking 📅
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function ProfileScreen({ onNavigate, currentUser, onLogout, user, onUpdateUser }) {
  const isProvider = currentUser === "provider";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={{
            paddingTop: 20,
            paddingHorizontal: 16,
            paddingBottom: 40,
          }}
        >
          <Text style={{ color: "#fff", marginBottom: 20, fontSize: 18, fontWeight: "800" }}>
            {isProvider ? "My Provider Profile" : "My Account"}
          </Text>
          <View style={{ flexDirection: "column", alignItems: "center", gap: 10 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.25)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: "rgba(255,255,255,0.4)",
              }}
            >
              <Text style={{ fontSize: 36 }}>👤</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
                {user?.name || (isProvider ? "Service Provider" : "Customer")}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4, fontSize: 13 }}>
                {isProvider ? (user?.primary_skill || "Service Provider") : "Customer"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingVertical: 20, paddingHorizontal: 16, gap: 12 }}>



          {[
            { icon: "🔔", label: "SMS Notifications", sub: "Offline mode enabled" },
            { icon: "🌐", label: "Language", sub: "Tok Pisin / English" },
            { icon: "📶", label: "Low-Bandwidth Mode", sub: "On — saves data" },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                elevation: 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: COLORS.text }}>
                    {item.label}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.textMuted }}>
                    {item.sub}
                  </Text>
                </View>
              </View>
              <Text style={{ color: COLORS.textLight, fontSize: 16 }}>›</Text>
            </TouchableOpacity>
          ))}

          {/* Logout */}
          <TouchableOpacity
            onPress={onLogout}
            style={{
              backgroundColor: "#FFF1F2",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginTop: 12,
              borderWidth: 1,
              borderColor: "#FECDD3",
            }}
          >
            <Text style={{ fontSize: 20 }}>👋</Text>
            <View>
              <Text style={{ fontWeight: "700", fontSize: 14, color: "#E11D48" }}>
                Sign Out
              </Text>
              <Text style={{ marginTop: 2, fontSize: 12, color: "#FB7185" }}>
                Log out of your account
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function TrustScreen({ onNavigate }) {
  const [workers] = useState(
    [].map((w) => ({ ...w, trustScore: Math.floor(70 + Math.random() * 30) }))
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
            Trust & Verification
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4, fontSize: 13 }}>
            Admin Dashboard · All Workers
          </Text>
        </LinearGradient>

        <View style={{ padding: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginHorizontal: -5 }}>
            {[
              { label: "Verified Workers", value: "4", icon: "✅", color: "#10B981" },
              { label: "Pending Review", value: "2", icon: "⏳", color: "#F59E0B" },
              { label: "Total Reviews", value: "690", icon: "⭐", color: "#3B82F6" },
              { label: "Avg Trust Score", value: "87%", icon: "🛡️", color: "#8B5CF6" },
            ].map((stat, i) => (
              <View
                key={i}
                style={{
                  width: (width - 32) / 2 - 10,
                  margin: 5,
                  backgroundColor: "#fff",
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                }}
              >
                <Text style={{ fontSize: 24, marginBottom: 6 }}>{stat.icon}</Text>
                <Text
                  style={{ fontWeight: "800", fontSize: 22, color: stat.color }}
                >
                  {stat.value}
                </Text>
                <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.textMuted }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>

          <Text
            style={{ marginTop: 8, marginBottom: 4, fontSize: 15, fontWeight: "700", color: COLORS.text }}
          >
            Worker Trust Scores
          </Text>

          {workers.map((w) => (
            <View
              key={w.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 14,
                elevation: 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <LinearGradient
                colors={
                  w.type === "blue" ? ["#60A5FA", "#2563EB"] : ["#A78BFA", "#7C3AED"]
                }
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 14 }}>
                  {w.avatar}
                </Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.text }}>
                    {w.name}
                  </Text>
                  <Text
                    style={{
                      fontWeight: "700",
                      fontSize: 13,
                      color: w.trustScore > 85 ? "#10B981" : "#F59E0B",
                    }}
                  >
                    {w.trustScore}%
                  </Text>
                </View>
                <Text style={{ marginVertical: 2, fontSize: 12, color: COLORS.textMuted }}>
                  {w.role}
                </Text>
                <View style={{ height: 6, backgroundColor: "#E5E7EB", borderRadius: 3 }}>
                  <View
                    style={{
                      width: `${w.trustScore}%`,
                      height: "100%",
                      borderRadius: 3,
                      backgroundColor: w.trustScore > 85 ? "#10B981" : "#F59E0B",
                    }}
                  />
                </View>
              </View>
              {w.verified && <Text style={{ fontSize: 18 }}>✅</Text>}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── BOTTOM NAV ─────────────────────────────────────────────────────────────
const PROVIDER_NAV_ITEMS = [
  { key: "home", icon: "📊", label: "Dashboard" },
  { key: "active_jobs", icon: "💼", label: "Jobs" },
  { key: "earnings", icon: "💰", label: "Earnings" },
  { key: "profile", icon: "👤", label: "Profile" },
];

const NAV_ITEMS = [
  { key: "home", icon: "🏠", label: "Home" },
  { key: "trust", icon: "🛡️", label: "Trust" },
  { key: "booking", icon: "📅", label: "Bookings" },
  { key: "profile", icon: "👤", label: "Profile" },
];


function AdminNavigationShell({ renderScreen }) {
  return (
    <View style={{ flex: 1 }}>
      {renderScreen()}
    </View>
  );
}

function ProviderNavigationShell({ renderScreen, navigate, activeNav, onboardingComplete }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
      {onboardingComplete && (
        <View
          style={{
            backgroundColor: "#fff",
            height: Platform.OS === "ios" ? 84 : 68,
            flexDirection: "row",
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingBottom: Platform.OS === "ios" ? 20 : 4,
          }}
        >
          {PROVIDER_NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => navigate(item.key)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: isActive ? "#F0FDF4" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? "800" : "500",
                    color: isActive ? COLORS.primary : COLORS.textMuted,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

function CustomerNavigationShell({ renderScreen, navigate, activeNav, onboardingComplete }) {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
      {onboardingComplete && (
        <View
          style={{
            backgroundColor: "#fff",
            height: Platform.OS === "ios" ? 84 : 68,
            flexDirection: "row",
            alignItems: "center",
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
            paddingBottom: Platform.OS === "ios" ? 20 : 4,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => navigate(item.key)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  paddingVertical: 4,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    backgroundColor: isActive ? "#F0FDF4" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                </View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? "800" : "500",
                    color: isActive ? COLORS.primary : COLORS.textMuted,
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

function BookingsScreen({ onNavigate }) {
  const [bookings] = useState([]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={{
            paddingVertical: 20,
            paddingHorizontal: 16,
            paddingBottom: 24,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>
            My Bookings
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4, fontSize: 13 }}>
            History & Upcoming Jobs
          </Text>
        </LinearGradient>

        <View style={{ padding: 16, gap: 12 }}>
          {bookings.length === 0 ? (
            <View style={{ padding: 40, alignItems: 'center', backgroundColor: '#fff', borderRadius: 16 }}>
              <Text style={{ fontSize: 14, color: COLORS.textMuted, textAlign: 'center' }}>
                No active bookings found.
              </Text>
            </View>
          ) : bookings.map((b) => (
            <View
              key={b.id}
              style={{
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 16,
                elevation: 1,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontWeight: "700", fontSize: 15, color: COLORS.text }}>
                  {b.service}
                </Text>
                <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.primary }}>
                  {b.amount}
                </Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View>
                  <Text style={{ fontSize: 13, color: COLORS.textMuted }}>
                    Worker: {b.workerName}
                  </Text>
                  <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 2 }}>
                    Date: {b.date}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: b.status === "Upcoming" ? "#EFF6FF" : "#F0FDF4",
                    borderRadius: 8,
                    paddingVertical: 4,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text
                    style={{
                      color: b.status === "Upcoming" ? "#1D4ED8" : "#059669",
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {b.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


function RoleSelectionScreen({ onSelectRole }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 20, justifyContent: "center" }}>
      <Text style={{ fontSize: 26, fontWeight: "900", color: COLORS.primary, textAlign: "center", marginBottom: 12 }}>
        Choose Your Role
      </Text>
      <Text style={{ fontSize: 16, color: COLORS.textMuted, textAlign: "center", marginBottom: 40, paddingHorizontal: 20 }}>
        How would you like to use the Wantok Workforce platform today?
      </Text>

      <View style={{ flexDirection: "row", gap: 12 }}>
        <TouchableOpacity
          onPress={() => onSelectRole("customer")}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 20,
            alignItems: "center",
            borderWidth: 2,
            borderColor: COLORS.border,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
        >
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "#F0FDF4", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 36 }}>🤝</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text, textAlign: "center", marginBottom: 8 }}>
            Become a Customer
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", lineHeight: 16 }}>
            I want to find and hire trusted local professionals in Port Moresby.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onSelectRole("provider")}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            borderRadius: 24,
            padding: 20,
            alignItems: "center",
            borderWidth: 2,
            borderColor: COLORS.border,
            elevation: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
          }}
        >
          <View style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 36 }}>🔧</Text>
          </View>
          <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text, textAlign: "center", marginBottom: 8 }}>
            Become a Service Provider
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", lineHeight: 16 }}>
            I want to list my trade, grow my business, and find local jobs.
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ProviderOnboardingScreen({ onComplete, user }) {
  const [trade, setTrade] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!trade || !city) {
      alert("Please fill in both fields.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          primary_skill: trade,
          location_name: city
        })
      });

      const data = await response.json();
      if (response.ok) {
        onComplete({ primary_skill: trade, location_name: city });
      } else {
        alert(data.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Trade profile update error:", error);
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, padding: 24 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 8, marginTop: 40 }}>
        Complete Your Trade Profile
      </Text>
      <Text style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 32 }}>
        Tell us a bit more about your services to get started.
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
          Trade Type
        </Text>
        <TextInput
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 12,
            padding: 14,
            fontSize: 15,
          }}
          placeholder="e.g. Electrician, Plumber, Tailor"
          value={trade}
          onChangeText={setTrade}
        />
      </View>

      <View style={{ marginBottom: 32 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
          City Location
        </Text>
        <TextInput
          style={{
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: COLORS.border,
            borderRadius: 12,
            padding: 14,
            fontSize: 15,
          }}
          placeholder="e.g. Port Moresby, Lae"
          value={city}
          onChangeText={setCity}
        />
      </View>

      <TouchableOpacity
        onPress={handleComplete}
        disabled={!trade || !city || loading}
        style={{
          backgroundColor: (!trade || !city || loading) ? COLORS.textLight : COLORS.primary,
          paddingVertical: 16,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
          {loading ? "SAVING..." : "Complete Profile"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function AuthScreen({ onAuth }) {
  const [loading, setLoading] = useState(false);
  const [dbStatus, setDbStatus] = useState("checking");

  useEffect(() => {
    const checkDB = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      try {
        // First check basic API health
        const apiRes = await fetch(`${API_BASE}/api/health`, { signal: controller.signal });
        if (apiRes.ok) {
          // If API is healthy, check DB health
          const dbRes = await fetch(`${API_BASE}/api/health/db`, { signal: controller.signal });
          if (dbRes.ok) setDbStatus("connected");
          else setDbStatus("online (db issues)");
        } else {
          setDbStatus("error");
        }
      } catch (e) {
        setDbStatus("offline");
      } finally {
        clearTimeout(timeoutId);
      }
    };
    checkDB();
  }, []);
  const [mode, setMode] = useState("signin");
  const [signUpStep, setSignUpStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState(""); // Unified local state for Sign In to fix lag
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(true);

  const handleSignIn = async () => {
    if (!identifier || !password) {
      alert("Please enter both identifier (Phone/Email) and password.");
      return;
    }
    if (loading) return;
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
        signal: controller.signal
      });

      const data = await response.json().catch(() => ({ error: 'Invalid response from server' }));

      if (response.ok) {
        onAuth({ ...data.user, token: data.token }, false);
      } else {
        alert(data.details || data.error || 'Signin failed');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        alert('Server connection timeout. Please check backend logs.');
      } else {
        console.error('SignIn Error:', error);
        alert('Sign-in failed. Please verify your credentials or check connection.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleSignUpNext = async () => {
    if (signUpStep === 1) {
      if (!name || !email) {
        alert("Please provide your full name and email address.");
        return;
      }
      setSignUpStep(2);
    } else {
      if (!phone || !password) {
        alert("Please provide your phone number and create a password.");
        return;
      }
      if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
      }
      if (loading) return;
      setLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, phone, password }),
          signal: controller.signal
        });

        const data = await response.json().catch(() => ({ error: 'Invalid response from server' }));

        if (response.ok) {
          onAuth({ ...data.user, token: data.token }, true);
        } else {
          alert(data.details || data.error || 'Signup failed');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          alert('Server connection timeout. Please check backend logs.');
        } else {
          console.error('SignUp Error:', error);
          alert('Sign-up failed. Please verify your credentials or check connection.');
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={{ height: 200, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={require("./assets/brand_logo.jpg")}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900" }}>
          WANTOK WORKFORCE
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12, backgroundColor: "rgba(0,0,0,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dbStatus === "connected" ? "#4ADE80" : (dbStatus === "checking" ? "#FBBF24" : "#EF4444"), marginRight: 6 }} />
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
            System Status: {dbStatus}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <View style={{ backgroundColor: "#fff", borderRadius: 20, padding: 24, elevation: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 8 }}>
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </Text>
          <Text style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24 }}>
            {mode === "signin"
              ? "Sign in to continue your journey"
              : `Step ${signUpStep} of 2: ${signUpStep === 1 ? "Basic Info" : "Security"}`}
          </Text>

          {mode === "signin" ? (
            <>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
                  Phone Number or Email
                </Text>
                <TextInput
                  style={{
                    backgroundColor: "#fff",
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 10,
                    padding: 12,
                    fontSize: 14,
                  }}
                  placeholder="0000 0000 or email@example.com"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                />
              </View>
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
                  Password
                </Text>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    style={{
                      backgroundColor: "#fff",
                      borderWidth: 1,
                      borderColor: COLORS.border,
                      borderRadius: 10,
                      padding: 12,
                      paddingRight: 50,
                      fontSize: 14,
                    }}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: 12 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>
                      {showPassword ? "HIDE" : "SHOW"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleSignIn}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{loading ? "Signing In..." : "Sign In"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {signUpStep === 1 ? (
                <>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
                      Full Name
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 14,
                      }}
                      placeholder="e.g. John Smith"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
                      Email Address
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 14,
                      }}
                      placeholder="name@example.com"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                    />
                  </View>
                </>
              ) : (
                <>
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
                      Phone Number
                    </Text>
                    <TextInput
                      style={{
                        backgroundColor: "#fff",
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        borderRadius: 10,
                        padding: 12,
                        fontSize: 14,
                      }}
                      placeholder="e.g. 7000 1234"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
                      Create Password
                    </Text>
                    <View style={{ position: 'relative' }}>
                      <TextInput
                        style={{
                          backgroundColor: "#fff",
                          borderWidth: 1,
                          borderColor: COLORS.border,
                          borderRadius: 10,
                          padding: 12,
                          paddingRight: 50,
                          fontSize: 14,
                        }}
                        placeholder="Min. 8 characters"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 12, top: 12 }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.primary }}>
                          {showPassword ? "HIDE" : "SHOW"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}
              <TouchableOpacity
                onPress={handleSignUpNext}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingVertical: 14,
                  borderRadius: 12,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
                  {loading ? "Creating Account..." : (signUpStep === 1 ? "Next Step" : "Create Account")}
                </Text>
              </TouchableOpacity>
              {signUpStep === 2 && (
                <TouchableOpacity onPress={() => setSignUpStep(1)} style={{ alignItems: "center", marginBottom: 16 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>Back to Basic Info</Text>
                </TouchableOpacity>
              )}
            </>
          )}

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
            <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setSignUpStep(1);
            }}>
              <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 14 }}>
                {mode === "signin" ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}




function AdminAuthScreen({ onAuth }) {
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async () => {
    if (!identifier || !password) {
      alert("Please enter admin credentials.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Strict Role Check: Must be admin
        if (data.user.roles && data.user.roles.includes('admin')) {
          onAuth({ ...data.user, token: data.token }, false);
        } else {
          alert("Access Denied: Administrative privileges required.");
          if (Platform.OS === 'web') window.location.href = '/';
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Admin Login Error:', error);
      alert('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#0F172A", justifyContent: "center", padding: 24 }}>
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#334155", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          <Text style={{ fontSize: 32 }}>🔐</Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900", letterSpacing: 1 }}>
          ADMIN PORTAL
        </Text>
        <Text style={{ color: "#94A3B8", fontSize: 14, marginTop: 8 }}>
          Wantok Workforce Back-Office
        </Text>
      </View>

      <View style={{ backgroundColor: "#1E293B", borderRadius: 16, padding: 24, elevation: 8 }}>
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase" }}>
            Admin Identifier
          </Text>
          <TextInput
            style={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#334155" }}
            placeholder="Username or Email"
            placeholderTextColor="#475569"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />
        </View>

        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: "#94A3B8", fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase" }}>
            Security Key
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 8, padding: 12, paddingRight: 48, borderWidth: 1, borderColor: "#334155" }}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              placeholderTextColor="#475569"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: 12, top: 12 }}
            >
              <Text style={{ fontSize: 18 }}>{showPassword ? "👁️" : "🔒"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleAdminLogin}
          disabled={loading}
          style={{
            backgroundColor: "#3B82F6",
            padding: 16,
            borderRadius: 8,
            alignItems: "center",
            opacity: loading ? 0.7 : 1
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
            {loading ? "AUTHENTICATING..." : "AUTHORIZE ACCESS"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => { if (Platform.OS === 'web') window.location.href = '/'; }}
        style={{ marginTop: 24, alignItems: "center" }}
      >
        <Text style={{ color: "#475569", fontSize: 13 }}>Return to Public Site</Text>
      </TouchableOpacity>
    </View>
  );
}

function AdminScreen({ onNavigate, onLogout, user }) {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, users, verification, logs
  const [stats, setStats] = useState({ totalCustomers: 0, totalProviders: 0, totalMatches: 0 });
  const [pendingProviders, setPendingProviders] = useState([]);
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/dashboard-stats`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.data || data);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error (Stats): ", e.message);
    }
  };

  const fetchPending = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/pending-providers`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingProviders(data.data || data);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error (Pending): ", e.message);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/users?role=${encodeURIComponent(roleFilter)}`, {
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
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/logs`, {
        headers: { "Authorization": `Bearer ${user?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.data || data);
      }
    } catch (e) {
      console.error("❌ Admin Data Pipeline Error (Logs): ", e.message);
    }
  };

  useEffect(() => {
    let interval;
    if (activeTab === "dashboard") {
      fetchStats();
      // Regular polling for real-time Redis counters
      interval = setInterval(fetchStats, 10000); // every 10 seconds
    }
    if (activeTab === "verification") fetchPending();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "logs") fetchLogs();

    return () => { if (interval) clearInterval(interval); };
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [roleFilter]);

  const handleUserAction = async (userId, action, data = {}) => {
    try {
      const token = user?.token;
      let res;
      if (action === 'delete') {
        res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } else if (action === 'update') {
        res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(data)
        });
      } else if (action === 'create') {
        res = await fetch(`${API_BASE}/api/admin/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify(data)
        });
      } else if (action === 'approve') {
        res = await fetch(`${API_BASE}/api/admin/approve/${userId}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } else if (action === 'flag') {
        res = await fetch(`${API_BASE}/api/admin/flag/${userId}`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
      }

      if (res && res.ok) {
        if (activeTab === "users") fetchUsers();
        if (activeTab === "verification") fetchPending();
        if (activeTab === "dashboard") fetchStats();
        setModalVisible(false);
      } else {
        alert("Action failed");
      }
    } catch (e) { alert("Error connecting to server"); }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {/* Header */}
      <View style={{ backgroundColor: "#1E293B", padding: 20, paddingTop: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff" }}>Wantok Admin</Text>
          <Text style={{ fontSize: 12, color: "#94A3B8" }}>SaaS Control Portal</Text>
        </View>
        <TouchableOpacity onPress={onLogout} style={{ backgroundColor: "#334155", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
          <Text style={{ color: "#F1F5F9", fontWeight: "700", fontSize: 12 }}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Top Nav */}
      <View style={{ flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }}>
        {[
          { id: "dashboard", label: "Dashboard", icon: "📊" },
          { id: "users", label: "Users", icon: "👥" },
          { id: "verification", label: "Queue", icon: "⏳" },
          { id: "logs", label: "Logs", icon: "📜" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              paddingVertical: 14,
              alignItems: "center",
              borderBottomWidth: 3,
              borderBottomColor: activeTab === tab.id ? COLORS.primary : "transparent"
            }}
          >
            <Text style={{ fontSize: 16, marginBottom: 2 }}>{tab.icon}</Text>
            <Text style={{ fontSize: 11, fontWeight: "700", color: activeTab === tab.id ? COLORS.primary : "#64748B" }}>
              {tab.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }}>
        {activeTab === "dashboard" && (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
              <View style={{ flex: 1, backgroundColor: "#fff", padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: "#3B82F6", elevation: 2 }}>
                <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>TOTAL CUSTOMERS</Text>
                <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E293B", marginTop: 4 }}>{stats.totalCustomers}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: "#fff", padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: "#F59E0B", elevation: 2 }}>
                <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>TOTAL PROVIDERS</Text>
                <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E293B", marginTop: 4 }}>{stats.totalProviders}</Text>
              </View>
            </View>
            <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: "#10B981", elevation: 2 }}>
              <Text style={{ fontSize: 12, color: "#64748B", fontWeight: "600" }}>COMPLETED MATCHES</Text>
              <Text style={{ fontSize: 24, fontWeight: "800", color: "#1E293B", marginTop: 4 }}>{stats.totalMatches}</Text>
            </View>
          </View>
        )}

        {activeTab === "users" && (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B" }}>User Registrations</Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, minWidth: width > 600 ? 400 : "100%" }}>
                <View style={{ flex: 1, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0", elevation: 2 }}>
                  <Text style={{ marginRight: 8, fontSize: 14 }}>🔍</Text>
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by name, email, or phone..."
                    placeholderTextColor="#94A3B8"
                    style={{ flex: 1, fontSize: 13, color: "#1E293B", padding: 0 }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => { setEditingUser({ roles: ['customer'] }); setModalVisible(true); }}
                  style={{ backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
                >
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>+ New User</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Quick Filter */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              {["All Roles", "Service Providers", "Customers"].map(f => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setRoleFilter(f)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20,
                    backgroundColor: roleFilter === f ? COLORS.primary : "#E2E8F0",
                    borderWidth: 1,
                    borderColor: roleFilter === f ? COLORS.primary : "#CBD5E1"
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: "700", color: roleFilter === f ? "#fff" : "#475569" }}>
                    {f.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {loading ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: "#64748B", fontSize: 14 }}>Loading records...</Text>
              </View>
            ) : users.length === 0 ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <Text style={{ color: "#64748B", fontSize: 14 }}>No users found.</Text>
              </View>
            ) : users.filter(u => {
                const q = searchQuery.toLowerCase();
                return (
                  (u.name || "").toLowerCase().includes(q) ||
                  (u.email || "").toLowerCase().includes(q) ||
                  (u.phone_number || "").toLowerCase().includes(q)
                );
              }).map(u => (
              <View key={u.id} style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, elevation: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#1E293B" }}>{u.name}</Text>
                      <Text style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(u.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text style={{ fontSize: 12, color: "#64748B", marginBottom: 6 }}>{u.email} • {u.phone_number}</Text>

                    {u.roles?.includes('provider') && u.trade_type && (
                      <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: "600", marginBottom: 6 }}>
                        📍 {u.city_location || 'PNG'} • {u.trade_type}
                      </Text>
                    )}

                    <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
                      {(Array.isArray(u.roles) ? u.roles : []).map(r => (
                        <View key={r} style={{
                          backgroundColor: r === 'provider' ? "#DCFCE7" : (r === 'customer' ? "#DBEAFE" : "#E2E8F0"),
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6
                        }}>
                          <Text style={{
                            fontSize: 10,
                            fontWeight: "800",
                            color: r === 'provider' ? "#166534" : (r === 'customer' ? "#1E40AF" : "#475569")
                          }}>{r.toUpperCase()}</Text>
                        </View>
                      ))}
                      {u.is_verified && <View style={{ backgroundColor: "#F0FDF4", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "#BBF7D0" }}><Text style={{ fontSize: 10, fontWeight: "800", color: "#15803D" }}>✅ VERIFIED</Text></View>}
                      {u.is_flagged && <View style={{ backgroundColor: "#FEF2F2", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: "#FECDD3" }}><Text style={{ fontSize: 10, fontWeight: "800", color: "#B91C1C" }}>🚩 FLAGGED</Text></View>}
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    <TouchableOpacity onPress={() => { setEditingUser(u); setModalVisible(true); }} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 14 }}>✏️</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => handleUserAction(u.id, 'delete')} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 14 }}>🗑️</Text></TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === "verification" && (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 16 }}>Verification Queue</Text>
            {pendingProviders.length === 0 ? (
              <Text style={{ textAlign: "center", color: "#64748B", marginTop: 40 }}>No pending verifications</Text>
            ) : (
              pendingProviders.map(prov => (
                <View key={prov.id} style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12 }}>
                  <Text style={{ fontSize: 16, fontWeight: "700" }}>{prov.name}</Text>
                  <Text style={{ fontSize: 13, color: "#64748B" }}>{prov.primary_skill || "Provider"}</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                    <TouchableOpacity onPress={() => handleUserAction(prov.id, 'approve')} style={{ flex: 1, backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: "center" }}>
                      <Text style={{ color: "#fff", fontWeight: "700" }}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleUserAction(prov.id, 'flag')} style={{ flex: 1, borderWidth: 1, borderColor: "#EF4444", padding: 10, borderRadius: 8, alignItems: "center" }}>
                      <Text style={{ color: "#EF4444", fontWeight: "700" }}>Flag</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "logs" && (
          <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: "#1E293B", marginBottom: 16 }}>System Events</Text>
            {logs.map(log => (
              <View key={log.id} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 8, borderLeftWidth: 4, borderLeftColor: log.level === 'SEC' ? "#EF4444" : "#3B82F6" }}>
                <Text style={{ fontSize: 13, fontWeight: "700" }}>{log.event}</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: "#64748B" }}>{log.level}</Text>
                  <Text style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(log.timestamp).toLocaleTimeString()}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* CRUD Modal */}
      {modalVisible && (
        <View style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 20, maxHeight: "90%" }}>
            <ScrollView>
              <Text style={{ fontSize: 20, fontWeight: "900", color: "#1E293B", marginBottom: 20 }}>
                {editingUser?.id ? "Edit Account" : "Provision New Account"}
              </Text>

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 6 }}>FULL NAME</Text>
              <TextInput
                value={editingUser?.name}
                onChangeText={(t) => setEditingUser({...editingUser, name: t})}
                placeholder="e.g. John Doe"
                style={{ backgroundColor: "#F1F5F9", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}
              />

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 6 }}>EMAIL ADDRESS</Text>
              <TextInput
                value={editingUser?.email}
                onChangeText={(t) => setEditingUser({...editingUser, email: t})}
                placeholder="e.g. john@example.com"
                autoCapitalize="none"
                style={{ backgroundColor: "#F1F5F9", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}
              />

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 6 }}>PHONE NUMBER</Text>
              <TextInput
                value={editingUser?.phone_number}
                onChangeText={(t) => setEditingUser({...editingUser, phone_number: t})}
                placeholder="e.g. 70000000"
                style={{ backgroundColor: "#F1F5F9", padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 14 }}
              />

              <Text style={{ fontSize: 11, fontWeight: "700", color: "#64748B", marginBottom: 6 }}>SYSTEM ROLE</Text>
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
                {['customer', 'provider', 'admin'].map(r => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setEditingUser({...editingUser, role: r})}
                    style={{
                      flex: 1,
                      padding: 10,
                      borderRadius: 8,
                      backgroundColor: (editingUser?.role === r || editingUser?.roles?.includes(r)) ? COLORS.primary : "#F1F5F9",
                      alignItems: "center"
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: "800", color: (editingUser?.role === r || editingUser?.roles?.includes(r)) ? "#fff" : "#64748B" }}>
                      {r.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B" }}>Verified Status</Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>Trust badge visibility</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditingUser({...editingUser, is_verified: !editingUser?.is_verified})}
                  style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: editingUser?.is_verified ? "#10B981" : "#E2E8F0", padding: 2 }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", transform: [{ translateX: editingUser?.is_verified ? 20 : 0 }] }} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B" }}>Flag Account</Text>
                  <Text style={{ fontSize: 12, color: "#64748B" }}>Restrict access immediately</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setEditingUser({...editingUser, is_flagged: !editingUser?.is_flagged})}
                  style={{ width: 44, height: 24, borderRadius: 12, backgroundColor: editingUser?.is_flagged ? "#EF4444" : "#E2E8F0", padding: 2 }}
                >
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", transform: [{ translateX: editingUser?.is_flagged ? 20 : 0 }] }} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, padding: 16, alignItems: "center" }}>
                  <Text style={{ fontWeight: "700", color: "#64748B" }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleUserAction(editingUser?.id, editingUser?.id ? 'update' : 'create', editingUser)}
                  style={{ flex: 1, backgroundColor: "#1E293B", padding: 16, borderRadius: 12, alignItems: "center" }}
                >
                  <Text style={{ fontWeight: "800", color: "#fff" }}>{editingUser?.id ? "Update Account" : "Create User"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === "web") {
      const path = window.location.pathname;
      if (path === "/@dm1n") {
        setScreen("admin-auth");
      }
    }
  }, []);
  const [screen, setScreen] = useState("home");
  const [screenData, setScreenData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  const navigate = (to, data = null) => {
    setScreen(to);
    setScreenData(data);
  };

  const handleAuth = (userData, isSignUp = false) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (isSignUp) {
      setCurrentUser(null);
      setOnboardingComplete(false);
    } else {
      // Handle login with existing persona
      const persona = userData.active_persona || (userData.roles && userData.roles[0]) || 'customer';
      setCurrentUser(persona);

      // If provider, check if they have completed profile (role/location)
      if (persona === 'provider' && (!userData.primary_skill || !userData.location_name)) {
        setOnboardingComplete(false);
      } else {
        setOnboardingComplete(true);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCurrentUser(null);
    setOnboardingComplete(false);
    setScreen("home");
  };

  const renderScreen = () => {
    // Hidden Admin Route Handling
    if (screen === "admin-auth") {
      if (isAuthenticated && user?.roles?.includes('admin')) {
        setCurrentUser('admin');
        setScreen('admin');
        setOnboardingComplete(true);
      }
      return <AdminAuthScreen onAuth={handleAuth} />;
    }

    // Role-based Access Guard for Admin Screen
    if (screen === "admin" && (!user?.roles?.includes('admin') || currentUser !== 'admin')) {
      alert("Unauthorized access attempt.");
      handleLogout();
      return <AuthScreen onAuth={handleAuth} />;
    }

    if (!isAuthenticated) {
      return <AuthScreen onAuth={handleAuth} />;
    }
    if (!currentUser) {
      return <RoleSelectionScreen onSelectRole={async (role) => {
        // Optimistic UI update
        setCurrentUser(role);
        if (role === "customer") setOnboardingComplete(true);
        else setOnboardingComplete(false);

        // In a real app, we'd call the API here:
        try { await fetch(`${API_BASE}/api/auth/select-role`, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` }, body: JSON.stringify({ role }) }); } catch (e) { console.error("Role selection persistence failed", e); }
      }} />;
    }

    if (currentUser === "provider" && !onboardingComplete) {
      return <ProviderOnboardingScreen user={user} onComplete={(details) => {
        setUser({ ...user, ...details });
        setOnboardingComplete(true);
      }} />;
    }

    switch (screen) {
      case "home":
        return <HomeScreen
          onNavigate={navigate}
          currentUser={currentUser}

          user={user}
          onUpdateUser={(updated) => setUser(updated)}
        />;
      case "workerDetail":
        return <WorkerDetailScreen worker={screenData} onNavigate={navigate} />;
      case "createBooking":
        return <CreateBookingScreen worker={screenData} onNavigate={navigate} />;
      case "booking":
        return <BookingsScreen onNavigate={navigate} />;
      case "trust":
        return <TrustScreen onNavigate={navigate} />;
      case "admin":
        return <AdminScreen onNavigate={navigate} onLogout={handleLogout} user={user} />;
      case "profile":
        return (
          <ProfileScreen
            onNavigate={navigate}
            currentUser={currentUser}

            onLogout={handleLogout}
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
          />
        );
      case "active_jobs":
        return (
          <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>Active Jobs</Text>
            <Text style={{ marginTop: 8, color: COLORS.textMuted }}>No active jobs at the moment.</Text>
          </View>
        );
      case "earnings":
        return (
          <View style={{ flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>Earnings</Text>
            <Text style={{ marginTop: 8, color: COLORS.textMuted }}>K0.00</Text>
          </View>
        );
      default:
        return <HomeScreen
          onNavigate={navigate}
          currentUser={currentUser}

          user={user}
          onUpdateUser={(updated) => setUser(updated)}
        />;
    }
  };

  const activeNav = ["home", "trust", "booking", "profile", "active_jobs", "earnings"].includes(screen)
    ? screen
    : "home";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.statusBar }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.statusBar} />

      {/* App Header Brand */}
      <View
        style={{
          backgroundColor: COLORS.statusBar,
          height: 50,
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          gap: 8,
        }}
      >
        <Image
          source={require("./assets/brand_logo.jpg")}
          style={{ width: 32, height: 32, borderRadius: 16, resizeMode: "contain" }}
        />
        <Text
          style={{
            color: "#fff",
            fontWeight: "900",
            fontSize: 15,
            letterSpacing: 0.5,
          }}
        >
          WANTOK WORKFORCE
        </Text>

      </View>

      {/* Isolated Role-Specific Layout Shells */}
      {!isAuthenticated || !currentUser ? (
        <View style={{ flex: 1, backgroundColor: COLORS.bg }}>{renderScreen()}</View>
      ) : currentUser === 'admin' ? (
        <AdminNavigationShell renderScreen={renderScreen} />
      ) : currentUser === 'provider' ? (
        <ProviderNavigationShell
          renderScreen={renderScreen}
          navigate={navigate}
          activeNav={activeNav}
          onboardingComplete={onboardingComplete}
        />
      ) : (
        <CustomerNavigationShell
          renderScreen={renderScreen}
          navigate={navigate}
          activeNav={activeNav}
          onboardingComplete={onboardingComplete}
        />
      )}
    </SafeAreaView>
  );
}
function WorkerCard({ worker, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 12,
        flexDirection: "row",
        gap: 14,
        borderWidth: 1,
        borderColor: COLORS.border,
      }}
    >
      <View style={{ position: "relative" }}>
        <LinearGradient
          colors={["#3B82F6", "#1D4ED8"]}
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
            {worker.name ? worker.name.charAt(0) : "W"}
          </Text>
        </LinearGradient>
        <View
          style={{
            position: "absolute",
            bottom: -3,
            right: -3,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#10B981",
            borderWidth: 2,
            borderColor: "#fff",
          }}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.text }}>{worker.name}</Text>
              {worker.is_verified && <Text style={{ fontSize: 14 }}>✅</Text>}
            </View>
            <Text style={{ marginTop: 2, fontSize: 13, color: COLORS.primary, fontWeight: "600" }}>
              {worker.primary_skill || "General Trade"}
            </Text>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 6 }}>
          <StarRating rating={4.8} />
          <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.text }}>4.8</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 12 }}>📍</Text>
            <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
              {worker.distance_km ? `${parseFloat(worker.distance_km).toFixed(1)} km away` : worker.location_name || "Nearby"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 12 }}>🛡️</Text>
            <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: "700" }}>
              {worker.is_verified ? "98% Trust" : "85% Trust"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
