import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { LineChart } from "react-native-chart-kit";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";
import HeaderWithBackButton from "@/components/layout/back-header";
import ApiClient from "@/api/client";

const { width } = Dimensions.get("window");
const HEADER_HEIGHT = 56; // adjust if your HeaderWithBackButton height differs

// ---- Types based on your sample payload ----
type RawChild = {
  _id: string;
  name: string;
  age?: number;
  parentId: string;
  profilePicture?: string;
};

type LocationPoint = { latitude: number; longitude: number; timestamp?: string };
type ChildViewModel = RawChild & {
  screenTimeData: number[];
  previousLocations: LocationPoint[];
};

// ---- Dummy helpers ----
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

const generateDummyScreenTime = (): number[] =>
  Array.from({ length: 7 }, () => Number(rand(0.5, 4.5).toFixed(1)));

const generateDummyPath = (
  base: { latitude: number; longitude: number },
  points: number = 6
): LocationPoint[] => {
  const out: LocationPoint[] = [];
  let lat = base.latitude;
  let lng = base.longitude;
  for (let i = 0; i < points; i++) {
    lat += rand(-0.01, 0.01);
    lng += rand(-0.01, 0.01);
    out.push({
      latitude: lat,
      longitude: lng,
      timestamp: new Date(Date.now() - (points - i) * 60 * 60 * 1000).toISOString(),
    });
  }
  return out;
};

export default function ChildDetailsScreen() {
  const insets = useSafeAreaInsets();

  // ✅ Correct param extraction for a file named [childId].tsx
  const params = useLocalSearchParams<{ childId?: string | string[] }>();
  const childId =params?.id ;

  const { userId: clerkId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<ChildViewModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!clerkId || !childId) return;
    try {
      setLoading(true);
      setError(null);

      // 1) Clerk -> Parent
      const parentRes = await ApiClient.get(`/parents/clerk/${clerkId}`);
      const parentId = parentRes?.data?.parent?._id;
      if (!parentId) throw new Error("Parent not found.");

      // 2) Parent -> Children
      const kidsRes = await ApiClient.get(`/children/by-parent/${parentId}`);
      if (!kidsRes?.data?.success) throw new Error("Failed to fetch children.");
      const children: RawChild[] = kidsRes.data.children ?? [];

      // 3) Select the child by id
      const match = children.find((c) => c._id === childId);
      if (!match) throw new Error("Child not found.");

      // 4) Build the view model with dummy data
      const base = { latitude: -20.16, longitude: 57.5012 };
      const vm: ChildViewModel = {
        ...match,
        profilePicture:
          match.profilePicture ||
          `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(
            match.name || "child"
          )}`,
        screenTimeData: generateDummyScreenTime(),
        previousLocations: generateDummyPath(base, 6),
      };

      setChild(vm);
    } catch (e: any) {
      setError(e?.message || "Failed to load child data.");
    } finally {
      setLoading(false);
    }
  }, [clerkId, childId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const totalScreenTime = useMemo(
    () => (child?.screenTimeData || []).reduce((a, b) => a + b, 0),
    [child?.screenTimeData]
  );

  const firstPoint = child?.previousLocations?.[0];
  const initialRegion = useMemo(
    () =>
      firstPoint
        ? {
            latitude: firstPoint.latitude,
            longitude: firstPoint.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }
        : {
            latitude: -20.16,
            longitude: 57.5012,
            latitudeDelta: 0.2,
            longitudeDelta: 0.2,
          },
    [firstPoint]
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F5C543" />
        <Text style={styles.loaderText}>Loading child data…</Text>
      </View>
    );
  }

  if (error || !child) {
    return (
      <SafeAreaViewWithKeyboard style={styles.safeArea}>
        {/* Absolute header pinned to safe area */}
        <View style={[styles.headerWrap, { top: insets.top }]}>
          <HeaderWithBackButton backRoute="/(parents)/children" />
        </View>
        <View style={[styles.errorContainer, { paddingTop: HEADER_HEIGHT + insets.top }]}>
          <Text style={styles.errorTitle}>Heads up</Text>
          <Text style={styles.errorText}>{error || "Unknown error."}</Text>
        </View>
      </SafeAreaViewWithKeyboard>
    );
  }

  return (
    <SafeAreaViewWithKeyboard style={styles.safeArea}>
      {/* Absolute header pinned to safe area */}
      <View style={[styles.headerWrap, { top: insets.top }]}>
        <HeaderWithBackButton backRoute="/(parents)/children" />
      </View>

      {/* Push content below header + safe top inset */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: HEADER_HEIGHT + insets.top, paddingBottom: 24 }}
      >
        {/* Card: Child info */}
        <View style={[styles.card, styles.row, { alignItems: "center" }]}>
          <Image source={{ uri: child.profilePicture }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childMeta}>
              {typeof child.age === "number" ? `Age: ${child.age}` : "Age: —"}
            </Text>
          </View>
        </View>

        {/* Card: Screen Time */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Screen Time (Last 7 Days)</Text>
          <LineChart
            data={{
              labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
              datasets: [{ data: child.screenTimeData || [], color: () => "#F5C543" }],
            }}
            width={width - 32}
            height={220}
            yAxisSuffix="h"
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: () => "#000",
              labelColor: () => "#666",
              propsForBackgroundLines: { strokeDasharray: "" },
            }}
            bezier
            style={styles.chart}
          />
          <View style={styles.kpisRow}>
            <View style={styles.kpiPill}>
              <Text style={styles.kpiValue}>{totalScreenTime.toFixed(1)}h</Text>
              <Text style={styles.kpiLabel}>Total</Text>
            </View>
            <View style={styles.kpiPill}>
              <Text style={styles.kpiValue}>
                {(totalScreenTime / 7).toFixed(1)}h
              </Text>
              <Text style={styles.kpiLabel}>Avg/day</Text>
            </View>
          </View>
        </View>

        {/* Card: Previous Locations */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Previous Locations</Text>
          <MapView style={styles.map} initialRegion={initialRegion}>
            {(child.previousLocations || []).map((loc, i) => (
              <Marker
                key={`${loc.latitude},${loc.longitude},${i}`}
                coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                title={
                  loc.timestamp
                    ? `Visited on ${new Date(loc.timestamp).toLocaleString()}`
                    : "Visited"
                }
              />
            ))}
            {(child.previousLocations || []).length > 1 && (
              <Polyline
                coordinates={(child.previousLocations || []).map((l) => ({
                  latitude: l.latitude,
                  longitude: l.longitude,
                }))}
                strokeColor="#F5C543"
                strokeWidth={4}
              />
            )}
          </MapView>

          <View style={styles.detailsBlock}>
            <Text style={styles.detailLine}>
              Last Location:{" "}
              {firstPoint
                ? `${firstPoint.latitude.toFixed(5)}, ${firstPoint.longitude.toFixed(5)}`
                : "—"}
            </Text>
            <Text style={styles.detailLine}>
              Last Seen:{" "}
              {firstPoint?.timestamp
                ? new Date(firstPoint.timestamp).toLocaleString()
                : "—"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaViewWithKeyboard>
  );
}

// ---- Styles ----
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F5C543" },
  headerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  row: { flexDirection: "row", gap: 12 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  childName: { fontSize: 22, fontWeight: "800", color: "#111" },
  childMeta: { marginTop: 4, fontSize: 14, color: "#666" },
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#111", marginBottom: 10 },
  chart: { borderRadius: 12 },
  kpisRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  kpiPill: {
    backgroundColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  kpiValue: { color: "#FFF", fontWeight: "800", fontSize: 14, textAlign: "center" },
  kpiLabel: { color: "#FFF", fontSize: 11, opacity: 0.8, textAlign: "center" },
  map: { width: "100%", height: 220, borderRadius: 12, marginTop: 6 },
  detailsBlock: { marginTop: 10, gap: 6 },
  detailLine: { fontSize: 14, color: "#333" },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF",
  },
  loaderText: { color: "#333" },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
    backgroundColor: "#FFF",
  },
  errorTitle: { fontSize: 18, fontWeight: "800", color: "#111" },
  errorText: { fontSize: 14, color: "#A00", textAlign: "center" },
});
