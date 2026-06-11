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
  { id: 1, name: "James Kapi", role: "Electrician", rating: 4.8, reviews: 124, location: "Port Moresby", available: true, verified: true, avatar: "JK", type: "blue", tags: ["House & Compound Wiring", "Solar Panel & Inverter Installations", "Electrical Fault Audits"] },
  { id: 2, name: "Mary Teine", role: "Accountant", rating: 4.9, reviews: 87, location: "Lae", available: true, verified: true, avatar: "MT", type: "white", tags: ["Micro-Bookkeeping", "IRC Tax Compliance", "Cloud Ledger Management"] },
  { id: 3, name: "Peter Aihi", role: "Plumber", rating: 4.6, reviews: 203, location: "Madang", available: false, verified: true, avatar: "PA", type: "blue", tags: ["Water Pipe Leak Repairs", "Tuffa Tank Connections", "Bathroom Component Plumbing"] },
  { id: 4, name: "Susan Karo", role: "Nurse", rating: 5.0, reviews: 56, location: "Goroka", available: true, verified: true, avatar: "SK", type: "white", tags: ["Community Nursing", "Basic First Aid", "Wellness Checks"] },
  { id: 5, name: "Tom Waiko", role: "Carpenter", rating: 4.7, reviews: 178, location: "Port Moresby", available: true, verified: false, avatar: "TW", type: "blue", tags: ["Structural Timber Framework", "Housing Extensions", "Corrugated Iron Roofing"] },
  { id: 6, name: "Lucy Mondo", role: "Lawyer", rating: 4.5, reviews: 42, location: "Lae", available: true, verified: true, avatar: "LM", type: "white", tags: ["Legal Document Drafting", "Statutory Declarations Prep", "Customary Land Mediation"] },
  { id: 7, name: "John Vagi", role: "Solar Specialist", rating: 4.9, reviews: 34, location: "Port Moresby", available: true, verified: true, avatar: "JV", type: "blue", tags: ["Solar Panel & Inverter Installations", "Backup Diesel Generator Servicing"] },
  { id: 8, name: "Kila Piki", role: "Tuffa Tank Expert", rating: 4.7, reviews: 89, location: "Lae", available: true, verified: true, avatar: "KP", type: "blue", tags: ["Tuffa Tank Connections", "Water & Fuel Hauling"] },
  { id: 9, name: "Sere Mani", role: "PMV Driver", rating: 4.5, reviews: 210, location: "Port Moresby", available: true, verified: true, avatar: "SM", type: "blue", tags: ["PMV & Taxi Operators", "Logistics & Delivery Riders"] },
  { id: 10, name: "Lulu Gau", role: "Meri Blouse Tailor", rating: 5.0, reviews: 15, location: "Goroka", available: true, verified: true, avatar: "LG", type: "blue", tags: ["Tailoring & Sewing Repairs", "Custom Uniform Screen Printing"] },
  { id: 11, name: "Boni Kero", role: "EasyPay Reseller", rating: 4.8, reviews: 312, location: "Madang", available: true, verified: true, avatar: "BK", type: "white", tags: ["Utility Token Resellers", "Mobile Money Float Agents"] },
  { id: 12, name: "Aro Peni", role: "Land Mediator", rating: 4.6, reviews: 28, location: "Mount Hagen", available: true, verified: true, avatar: "AP", type: "white", tags: ["Customary Land Mediation", "ILG Incorporation Advice"] },
  { id: 13, name: "Henao Morea", role: "Graphic Designer", rating: 4.9, reviews: 67, location: "Port Moresby", available: true, verified: true, avatar: "HM", type: "white", tags: ["Commercial Signage", "E-Commerce Logo Creation", "Digital Printing Layouts"] },
  { id: 14, name: "Koni Karo", role: "Auto Mechanic", rating: 4.7, reviews: 145, location: "Lae", available: true, verified: false, avatar: "KK", type: "blue", tags: ["Mobile Auto Mechanics", "Welding & Metal Fabrication"] },
  { id: 15, name: "Miri Tei", role: "Community Nurse", rating: 5.0, reviews: 43, location: "Alotau", available: true, verified: true, avatar: "MT", type: "white", tags: ["Community Nursing", "Health Literacy Guidance"] },
];

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

function HomeScreen({ onNavigate, currentUser }) {
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filtered, setFiltered] = useState(mockWorkers);

  useEffect(() => {
    let result = mockWorkers;

    if (selectedCategory) {
      const category = categories.find(c => c.label === selectedCategory);
      if (category) {
        result = result.filter(w =>
          w.tags.some(tag => category.subcategories.some(sub => tag.toLowerCase().includes(sub.name.toLowerCase()))) ||
          w.role.toLowerCase().includes(selectedCategory.toLowerCase())
        );
      }
    }

    if (searchText) {
      result = result.filter(
        (w) =>
          w.name.toLowerCase().includes(searchText.toLowerCase()) ||
          w.role.toLowerCase().includes(searchText.toLowerCase()) ||
          w.location.toLowerCase().includes(searchText.toLowerCase()) ||
          w.tags.some(t => t.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    setFiltered(result);
  }, [searchText, selectedCategory]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[COLORS.primaryDark, COLORS.primary]}
          style={{
            paddingTop: 20,
            paddingHorizontal: 16,
            paddingBottom: 28,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
                Good morning 👋
              </Text>
              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 }}>
                {currentUser === "customer" ? "Find a Wantok" : "Your Dashboard"}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.3)",
              }}
              onPress={() => onNavigate("profile")}
            >
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          </View>

          {/* Search */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 14,
              paddingVertical: Platform.OS === "ios" ? 12 : 8,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              elevation: 4,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18 }}>🔍</Text>
            <TextInput
              value={searchText}
              onChangeText={(text) => {
                setSearchText(text);
                if (text) setSelectedCategory(null);
              }}
              placeholder="Search skills (e.g. Solar, Tuffa, PMV)..."
              placeholderTextColor={COLORS.textLight}
              style={{
                flex: 1,
                fontSize: 14,
                color: COLORS.text,
                padding: 0,
              }}
            />
            <View
              style={{
                backgroundColor: COLORS.primary,
                borderRadius: 8,
                paddingVertical: 4,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                📍 PNG
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={{ paddingVertical: 20, paddingHorizontal: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>
              Categories
            </Text>
            <TouchableOpacity onPress={() => {
              setSelectedCategory(null);
              setSearchText("");
            }}>
              <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: "600" }}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              marginHorizontal: -5,
            }}
          >
            {categories.map((cat, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setSelectedCategory(cat.label);
                  setSearchText("");
                }}
                style={{
                  width: (width - 32) / 4 - 10,
                  margin: 5,
                  backgroundColor: selectedCategory === cat.label ? cat.color + "22" : "#fff",
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  gap: 6,
                  elevation: 2,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.06,
                  shadowRadius: 8,
                  borderWidth: selectedCategory === cat.label ? 1 : 0,
                  borderColor: cat.color,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: cat.color + "18",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{cat.icon}</Text>
                </View>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: selectedCategory === cat.label ? cat.color : COLORS.textMuted
                  }}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sub-categories Horizontal Scroll (Only when a category is selected) */}
        {selectedCategory && (
          <View style={{ marginBottom: 20 }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
            >
              {categories.find(c => c.label === selectedCategory)?.subcategories.map((sub, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSearchText(searchText === sub.name ? "" : sub.name)}
                  style={{
                    backgroundColor: searchText === sub.name ? COLORS.primary : "#fff",
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: searchText === sub.name ? "#fff" : COLORS.textMuted
                  }}>
                    {sub.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {searchText && categories.find(c => c.label === selectedCategory)?.subcategories.find(s => s.name === searchText) && (
              <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
                <View style={{ backgroundColor: "#F9FAFB", padding: 10, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border }}>
                  <Text style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 18 }}>
                    ℹ️ {categories.find(c => c.label === selectedCategory)?.subcategories.find(s => s.name === searchText).description}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Worker Cards */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 20 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.text }}>
              {searchText || selectedCategory ? `Results (${filtered.length})` : "Top Wantoks Near You"}
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.primary, fontWeight: "600" }}>
              Filter ⚙️
            </Text>
          </View>
          {filtered.length > 0 ? (
            <View style={{ gap: 12 }}>
              {filtered.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  onPress={() => onNavigate("workerDetail", worker)}
                />
              ))}
            </View>
          ) : (
            <View style={{ padding: 40, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: COLORS.textLight }}>No workers found for this selection.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
      {/* Avatar */}
      <View style={{ position: "relative" }}>
        <LinearGradient
          colors={
            worker.type === "blue" ? ["#3B82F6", "#1D4ED8"] : ["#8B5CF6", "#6D28D9"]
          }
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 18 }}>
            {worker.avatar}
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
            backgroundColor: worker.available ? "#10B981" : "#9CA3AF",
            borderWidth: 2,
            borderColor: "#fff",
          }}
        />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.text }}>
                {worker.name}
              </Text>
              {worker.verified && <Text style={{ fontSize: 14 }}>✅</Text>}
            </View>
            <Text
              style={{
                marginTop: 2,
                fontSize: 13,
                color: COLORS.primary,
                fontWeight: "600",
              }}
            >
              {worker.role}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: worker.available ? "#ECFDF5" : "#F3F4F6",
              borderRadius: 8,
              paddingVertical: 3,
              paddingHorizontal: 8,
            }}
          >
            <Text
              style={{
                color: worker.available ? "#059669" : "#6B7280",
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {worker.available ? "Available" : "Busy"}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginVertical: 6,
          }}
        >
          <StarRating rating={worker.rating} />
          <Text style={{ fontSize: 12, fontWeight: "600", color: COLORS.text }}>
            {worker.rating}
          </Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted }}>
            ({worker.reviews} reviews)
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 8 }}>
          <Text style={{ fontSize: 12 }}>📍</Text>
          <Text style={{ fontSize: 12, color: COLORS.textMuted }}>{worker.location}</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {worker.tags.map((tag, i) => (
            <View
              key={i}
              style={{
                backgroundColor: "#F0FDF4",
                borderRadius: 6,
                paddingVertical: 2,
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ color: COLORS.primary, fontSize: 11, fontWeight: "600" }}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
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

function ProfileScreen({ onNavigate, currentUser, onToggleUser, onLogout }) {
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
                {isProvider ? "James Kapi" : "Sarah Mano"}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 4, fontSize: 13 }}>
                {isProvider ? "Electrician · Port Moresby" : "Customer · Lae, PNG"}
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
    mockWorkers.map((w) => ({ ...w, trustScore: Math.floor(70 + Math.random() * 30) }))
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
  const [bookings] = useState([
    { id: 1, workerName: "James Kapi", service: "Electrical Repair", date: "2024-05-20", status: "Completed", amount: "K150" },
    { id: 2, workerName: "Mary Teine", service: "Tax Consultation", date: "2024-05-25", status: "Upcoming", amount: "K200" },
    { id: 3, workerName: "Peter Aihi", service: "Plumbing Maintenance", date: "2024-05-15", status: "Completed", amount: "K120" },
  ]);

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
          {bookings.map((b) => (
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

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient
        colors={[COLORS.primaryDark, COLORS.primary]}
        style={{ height: 200, justifyContent: "center", alignItems: "center" }}
      >
        <Image
          source={require("./assets/logo.jpg")}
          style={{ width: 80, height: 80, borderRadius: 40, marginBottom: 10 }}
        />
        <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900" }}>
          WANTOK WORKFORCE
        </Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.text, marginBottom: 8 }}>
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </Text>
        <Text style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24 }}>
          {mode === "signin" ? "Sign in to continue your journey" : "Join the workforce community in PNG"}
        </Text>

        {mode === "signup" && (
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
              placeholder="e.g. James Kapi"
              value={name}
              onChangeText={setName}
            />
          </View>
        )}

        <View style={{ marginBottom: 16 }}>
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

        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.textLight, marginBottom: 6 }}>
            Password
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
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={() => onAuth({ email, name })}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Text style={{ color: COLORS.textMuted, fontSize: 14 }}>
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}
          </Text>
          <TouchableOpacity onPress={() => setMode(mode === "signin" ? "signup" : "signin")}>
            <Text style={{ color: COLORS.primary, fontWeight: "700", fontSize: 14 }}>
              {mode === "signin" ? "Sign Up" : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
export default function App() {
  const [screen, setScreen] = useState("home");
  const [screenData, setScreenData] = useState(null);
  const [currentUser, setCurrentUser] = useState("customer");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = (to, data = null) => {
    setScreen(to);
    setScreenData(data);
  };

  const handleAuth = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setScreen("home");
  };

  const renderScreen = () => {
    if (!isAuthenticated) {
      return <AuthScreen onAuth={handleAuth} />;
    }

    switch (screen) {
      case "home":
        return <HomeScreen onNavigate={navigate} currentUser={currentUser} />;
      case "workerDetail":
        return <WorkerDetailScreen worker={screenData} onNavigate={navigate} />;
      case "createBooking":
        return <CreateBookingScreen worker={screenData} onNavigate={navigate} />;
      case "booking":
        return <BookingsScreen onNavigate={navigate} />;
      case "trust":
        return <TrustScreen onNavigate={navigate} />;
      case "profile":
        return (
          <ProfileScreen
            onNavigate={navigate}
            currentUser={currentUser}
            onToggleUser={() => setCurrentUser((u) => (u === "customer" ? "provider" : "customer"))}
            onLogout={handleLogout}
          />
        );
      default:
        return <HomeScreen onNavigate={navigate} currentUser={currentUser} />;
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
          source={require("./assets/logo.jpg")}
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
        <View
          style={{
            marginLeft: "auto",
            backgroundColor: COLORS.primaryLight,
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1.5,
            borderColor: "rgba(255,255,255,0.4)",
          }}
        >
          <Text style={{ fontSize: 16 }}>🤝</Text>
        </View>
      </View>

      {/* Screen Content */}
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>{renderScreen()}</View>

      {/* Bottom Nav */}
      {isAuthenticated && (
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
