import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const TIMELINE = [
  { day: "Jun 1", status: "present" as const, time: "08:30 AM", notes: "Arrived at Manali base camp" },
  { day: "Jun 2", status: "present" as const, time: "07:45 AM", notes: "Trek to Solang Valley" },
  { day: "Jun 3", status: "present" as const, time: "08:00 AM", notes: "Rest day – equipment check" },
  { day: "Jun 4", status: "present" as const, time: "06:30 AM", notes: "Summit attempt Day 1" },
  { day: "Jun 5", status: "absent" as const, time: "—", notes: "Weather hold" },
  { day: "Jun 6", status: "present" as const, time: "07:00 AM", notes: "Summit attempt resumed" },
  { day: "Jun 7", status: "present" as const, time: "08:15 AM", notes: "Return to base camp" },
  { day: "Jun 8", status: "present" as const, time: "08:30 AM", notes: "Guest activities day" },
  { day: "Jun 9", status: "present" as const, time: "07:45 AM", notes: "Final trek day" },
  { day: "Jun 10", status: "pending" as const, time: "—", notes: "Pending check-in" },
  { day: "Jun 11", status: "pending" as const, time: "—", notes: "" },
  { day: "Jun 12", status: "pending" as const, time: "—", notes: "" },
  { day: "Jun 13", status: "pending" as const, time: "—", notes: "" },
  { day: "Jun 14", status: "pending" as const, time: "—", notes: "" },
  { day: "Jun 15", status: "pending" as const, time: "—", notes: "" },
];

type Status = "present" | "absent" | "pending";

export default function TripScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topInset = Platform.OS === "web" ? 67 : insets.top;

  const statusColor = (s: Status) => {
    if (s === "present") return colors.success;
    if (s === "absent") return colors.error;
    return colors.warning;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topInset + 16, paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.pageTitle, { color: colors.foreground }]}>Trip Details</Text>

        {/* Hero Card */}
        <LinearGradient
          colors={["#FFF8F0", "#F8F8FA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <View style={[styles.heroBadge, { backgroundColor: `${colors.success}18` }]}>
            <View style={[styles.dot, { backgroundColor: colors.success }]} />
            <Text style={[styles.heroBadgeText, { color: colors.success }]}>Active Trip</Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.foreground }]}>
            Himalayan Adventure Trek
          </Text>
          <View style={styles.heroDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={15} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>Manali, Himachal Pradesh</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="calendar" size={15} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>June 1 – June 15, 2025</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="people" size={15} color={colors.primary} />
              <Text style={[styles.detailText, { color: colors.mutedForeground }]}>24 Guests</Text>
            </View>
          </View>
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: `${colors.primary}18`, borderColor: `${colors.primary}40` }]}>
              <Ionicons name="star" size={11} color={colors.primary} />
              <Text style={[styles.chipText, { color: colors.primary }]}>Lead Guide</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
              <Ionicons name="shield-checkmark" size={11} color={colors.mutedForeground} />
              <Text style={[styles.chipText, { color: colors.mutedForeground }]}>Verified</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { label: "Total Days", value: "15", icon: "calendar-outline" as const },
            { label: "Completed", value: "9", icon: "checkmark-circle-outline" as const },
            { label: "Remaining", value: "6", icon: "time-outline" as const },
          ].map((s) => (
            <View key={s.label} style={[styles.miniStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name={s.icon} size={18} color={colors.primary} />
              <Text style={[styles.miniVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.miniLbl, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Daily Timeline */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DAILY REPORTING TIMELINE</Text>
        <View style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TIMELINE.map((item, i) => (
            <View key={item.day} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.tlDot, { backgroundColor: statusColor(item.status) }]} />
                {i < TIMELINE.length - 1 && (
                  <View style={[styles.tlLine, { backgroundColor: colors.border }]} />
                )}
              </View>
              <View style={[styles.tlContent, { opacity: item.status === "pending" ? 0.5 : 1 }]}>
                <View style={styles.tlHeader}>
                  <Text style={[styles.tlDay, { color: colors.foreground }]}>{item.day}</Text>
                  <View style={[styles.tlBadge, { backgroundColor: `${statusColor(item.status)}14` }]}>
                    <Text style={[styles.tlBadgeText, { color: statusColor(item.status) }]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>
                {item.time !== "—" && (
                  <Text style={[styles.tlTime, { color: colors.mutedForeground }]}>Check-in: {item.time}</Text>
                )}
                {!!item.notes && (
                  <Text style={[styles.tlNotes, { color: colors.mutedForeground }]}>{item.notes}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20 },
  pageTitle: { fontSize: 26, fontFamily: "Montserrat_700Bold", marginBottom: 16 },
  heroCard: { borderRadius: 20, padding: 20, borderWidth: 1, marginBottom: 16 },
  heroBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5, marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  heroBadgeText: { fontSize: 11, fontFamily: "Montserrat_600SemiBold" },
  heroTitle: { fontSize: 20, fontFamily: "Montserrat_700Bold", marginBottom: 16, lineHeight: 28 },
  heroDetails: { gap: 10, marginBottom: 16 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  detailText: { fontSize: 13, fontFamily: "Montserrat_400Regular" },
  chipRow: { flexDirection: "row", gap: 8 },
  chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, gap: 5 },
  chipText: { fontSize: 11, fontFamily: "Montserrat_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  miniStat: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, gap: 4 },
  miniVal: { fontSize: 22, fontFamily: "Montserrat_700Bold" },
  miniLbl: { fontSize: 10, fontFamily: "Montserrat_500Medium", textAlign: "center" },
  sectionLabel: { fontSize: 10, fontFamily: "Montserrat_600SemiBold", letterSpacing: 1.4, marginBottom: 10 },
  timelineCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  timelineRow: { flexDirection: "row" },
  timelineLeft: { width: 24, alignItems: "center" },
  tlDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5 },
  tlLine: { width: 1.5, flex: 1, marginTop: 4 },
  tlContent: { flex: 1, paddingLeft: 12, paddingBottom: 18 },
  tlHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  tlDay: { fontSize: 14, fontFamily: "Montserrat_600SemiBold" },
  tlBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tlBadgeText: { fontSize: 10, fontFamily: "Montserrat_600SemiBold" },
  tlTime: { fontSize: 11, fontFamily: "Montserrat_400Regular", marginBottom: 2 },
  tlNotes: { fontSize: 11, fontFamily: "Montserrat_400Regular" },
});
