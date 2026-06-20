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
const API_BASE = Platform.OS === 'web' ? '' : 'http://45.32.243.144:3000';

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


function HomeScreen({ onNavigate, currentUser, onSwitchPersona, user, onUpdateUser }) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filtered, setFiltered] = useState([]);
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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
            <TouchableOpacity onPress={() => onSwitchPersona("customer")} style={{ backgroundColor: "#ECFDF5", borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1.5, borderColor: "#A7F3D0" }}>
              <Text style={{ color: "#047857", fontWeight: "800", fontSize: 15 }}>Switch to Customer Mode</Text>
            </TouchableOpacity>
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
  const [booked, setBooked] = useState(false);
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
  const [confirmed, setConfirmed] = useState(false);
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

function ProfileScreen({ onNavigate, currentUser, onToggleUser, onLogout, user, onUpdateUser }) {
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
                {isProvider ? ((user?.role || "Electrician") + " · " + (user?.location || "Port Moresby")) : "Customer · Lae, PNG"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingVertical: 20, paddingHorizontal: 16, gap: 12 }}>
          {/* Toggle Role */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 22 }}>{isProvider ? "🔧" : "🙋"}</Text>
              <View>
                <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.text }}>
                  {isProvider ? "Provider Mode" : "Customer Mode"}
                </Text>
                <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.textMuted }}>
                  Switch app view
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onToggleUser}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 10,
                backgroundColor: COLORS.primary,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>
                Switch to {isProvider ? "Customer" : "Provider"}
              </Text>
            </TouchableOpacity>
          </View>

          {isProvider && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: user?.is_available ? "#10B981" : "#9CA3AF" }} />
                <View>
                  <Text style={{ fontWeight: "700", fontSize: 14, color: COLORS.text }}>
                    {user?.is_available ? "Available for Work" : "Busy / Offline"}
                  </Text>
                  <Text style={{ marginTop: 2, fontSize: 12, color: COLORS.textMuted }}>
                    Toggle your status
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={async () => {
                  const newStatus = !user?.is_available;
                  onUpdateUser({ ...user, is_available: newStatus });

                  try {
                    const response = await fetch(`${API_BASE}/api/auth/availability`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user?.token}`
                      },
                      body: JSON.stringify({ is_available: newStatus })
                    });
                    if (!response.ok) throw new Error('Failed to update status');
                  } catch (err) {
                    console.error('Availability update failed:', err);
                    onUpdateUser({ ...user, is_available: !newStatus });
                    alert("Could not update status.");
                  }
                }}
                style={{
                  width: 50,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: user?.is_available ? COLORS.primary : "#E5E7EB",
                  padding: 2,
                  justifyContent: "center"
                }}
              >
                <View style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: "#fff",
                  transform: [{ translateX: user?.is_available ? 22 : 0 }],
                  elevation: 2,
                }} />
              </TouchableOpacity>
            </View>
          )}

          {isProvider && (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 16,
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.06,
                shadowRadius: 8,
              }}
            >
              <Text style={{ marginBottom: 14, fontSize: 14, fontWeight: "700", color: COLORS.text }}>
                Trust Score
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
                      Verification Score
                    </Text>
                    <Text
                      style={{ fontSize: 12, fontWeight: "700", color: COLORS.primary }}
                    >
                      92%
                    </Text>
                  </View>
                  <View
                    style={{ height: 8, backgroundColor: "#E5E7EB", borderRadius: 4 }}
                  >
                    <View
                      style={{
                        width: "92%",
                        height: "100%",
                        backgroundColor: COLORS.primary,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {[
            { icon: "🔔", label: "SMS Notifications", sub: "Offline mode enabled" },
            { icon: "🌐", label: "Language", sub: "Tok Pisin / English" },
            { icon: "📶", label: "Low-Bandwidth Mode", sub: "On — saves data" },
            { icon: "🔒", label: "Privacy & Security", sub: "Auth secured" },
            { icon: "❓", label: "Help & Support", sub: "WhatsApp / Direct dial" },
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
const NAV_ITEMS = [
  { key: "home", icon: "🏠", label: "Home" },
  { key: "trust", icon: "🛡️", label: "Trust" },
  { key: "booking", icon: "📅", label: "Bookings" },
  { key: "profile", icon: "👤", label: "Profile" },
];

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

function ProviderOnboardingScreen({ onComplete }) {
  const [trade, setTrade] = useState("");
  const [city, setCity] = useState("");

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
        onPress={() => onComplete({ role: trade, location: city })}
        disabled={!trade || !city}
        style={{
          backgroundColor: (!trade || !city) ? COLORS.textLight : COLORS.primary,
          paddingVertical: 16,
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
          Complete Profile
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
        const res = await fetch(`${API_BASE}/api/health/db`, { signal: controller.signal });
        if (res.ok) setDbStatus("connected");
        else setDbStatus("error");
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
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!identifier || !password) {
      alert("Please enter both identifier (Phone/Email) and password.");
      return;
    }
    if (loading) return;
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

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
        alert('Request timed out. Please try again.');
      } else {
        console.error('SignIn Error:', error);
        alert('Network error. Is the server running?');
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
          alert('Request timed out. Please try again.');
        } else {
          console.error('SignUp Error:', error);
          alert('Network error. Is the server running?');
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
          <TextInput
            style={{ backgroundColor: "#0F172A", color: "#fff", borderRadius: 8, padding: 12, borderWidth: 1, borderColor: "#334155" }}
            placeholder="Enter password"
            placeholderTextColor="#475569"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
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

function AdminScreen({ onNavigate }) {
  const [stats, setStats] = useState({ totalCustomers: 0, totalProviders: 0, totalMatches: 0 });
  const [pendingProviders, setPendingProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const token = user?.token;
      const [statsRes, providersRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/stats`, {
          headers: { "Authorization": `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/admin/pending-providers`, {
          headers: { "Authorization": `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (providersRes.ok) setPendingProviders(await providersRes.json());
    } catch (error) {
      console.error("Admin data fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAction = async (providerId, action) => {
    try {
      const token = user?.token;
      const endpoint = action === 'approve' ? `/api/admin/approve/${providerId}` : `/api/admin/flag/${providerId}`;
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert("Action failed.");
      }
    } catch (error) {
      alert("Error performing action.");
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <View style={{ backgroundColor: COLORS.primary, padding: 20, paddingTop: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
        <Text style={{ fontSize: 24, fontWeight: "900", color: "#fff", marginBottom: 4 }}>Back-Office</Text>
        <Text style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>Command Module • Port Moresby HQ</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        {/* Statistics Grid */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 16, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Customers</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.primary }}>{loading ? "..." : stats.totalCustomers}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 16, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Providers</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: "#F5A623" }}>{loading ? "..." : stats.totalProviders}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "#fff", padding: 16, borderRadius: 16, elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}>
            <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>Matches</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.secondary }}>{loading ? "..." : stats.totalMatches}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 12 }}>Provider Verification Queue</Text>

        {pendingProviders.length === 0 && !loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text style={{ color: COLORS.textMuted }}>No pending verifications.</Text>
          </View>
        ) : (
          pendingProviders.map((prov) => (
            <View key={prov.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <View>
                  <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.text }}>{prov.name}</Text>
                  <Text style={{ fontSize: 13, color: COLORS.textMuted }}>{prov.primary_skill || "General Trade"}</Text>
                </View>
                <View style={{ backgroundColor: "#FEF3C7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#92400E" }}>PENDING</Text>
                </View>
              </View>

              <Text style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>
                {prov.email} • {prov.phone_number}
              </Text>

              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => handleAction(prov.id, 'approve')}
                  style={{ flex: 1, backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, alignItems: "center" }}
                >
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Approve Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleAction(prov.id, 'flag')}
                  style={{ flex: 1, backgroundColor: "#fff", padding: 10, borderRadius: 8, alignItems: "center", borderWidth: 1, borderColor: COLORS.danger }}
                >
                  <Text style={{ color: COLORS.danger, fontSize: 13, fontWeight: "700" }}>Flag Account</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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
  const [currentUser, setCurrentUser] = useState(null); // "customer" or "provider"
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
      if (persona === 'provider' && (!userData.role || !userData.location)) {
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
      if (isAuthenticated) {
        if (user?.roles?.includes('admin')) {
          setCurrentUser('admin');
          setScreen('admin');
          setOnboardingComplete(true);
        } else {
          handleLogout();
          alert("Unauthorized access attempt.");
          return <AuthScreen onAuth={handleAuth} />;
        }
      }
      return <AdminAuthScreen onAuth={handleAuth} />;
    }

    if (!isAuthenticated) {
      return <AuthScreen onAuth={handleAuth} />;
    }

    // Role-based Access Guard for Admin Screen
    if (screen === "admin" && (!user?.roles?.includes('admin') || currentUser !== 'admin')) {
      handleLogout();
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
      return <ProviderOnboardingScreen onComplete={(details) => {
        setUser({ ...user, ...details });
        setOnboardingComplete(true);
      }} />;
    }

    switch (screen) {
      case "home":
        return <HomeScreen
          onNavigate={navigate}
          currentUser={currentUser}
          onSwitchPersona={(role) => setCurrentUser(role)}
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
        return <AdminScreen onNavigate={navigate} />;
      case "profile":
        return (
          <ProfileScreen
            onNavigate={navigate}
            currentUser={currentUser}
            onToggleUser={async () => {
              const targetRole = currentUser === 'customer' ? 'provider' : 'customer';

              // Optimistic switch
              setCurrentUser(targetRole);

              if (targetRole === 'provider') {
                if (user?.role && user?.location) {
                  setOnboardingComplete(true);
                } else {
                  setOnboardingComplete(false);
                }
              } else {
                setOnboardingComplete(true);
              }

              // We would ideally call API here to update active_persona
              try { await fetch(`${API_BASE}/api/auth/switch-persona`, { method: "PATCH", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${user?.token}` }, body: JSON.stringify({ role: targetRole }) }); } catch (e) { console.error("Persona switch persistence failed", e); }
            }}
            onLogout={handleLogout}
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
          />
        );
      default:
        return <HomeScreen
          onNavigate={navigate}
          currentUser={currentUser}
          onSwitchPersona={(role) => setCurrentUser(role)}
          user={user}
          onUpdateUser={(updated) => setUser(updated)}
        />;
    }
  };

  const activeNav = ["home", "trust", "booking", "profile"].includes(screen)
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

      {/* Screen Content */}
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>{renderScreen()}</View>

      {/* Bottom Nav */}
      {isAuthenticated && currentUser && onboardingComplete && (
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
