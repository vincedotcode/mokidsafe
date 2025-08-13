import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  Modal,
  Vibration,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { initializeSocket, disconnectSocket, emitEvent } from "@/utils/socket";
import ApiClient from "@/api/client";

const LOCATION_TASK_NAME = "BACKGROUND_LOCATION_TASK";

type GeoFence = {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
};

type ChildData = {
  _id: string;
  name: string;
  familyCode: string;
  parentId: string;
  geoFence?: { radius?: number };
  // ...other fields omitted
};

export default function ChildHomeScreen() {
  const mapRef = useRef<MapView>(null);

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [hasRegionBeenSet, setHasRegionBeenSet] = useState(false);
  const [loading, setLoading] = useState(true);

  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [zoneStatus, setZoneStatus] = useState<"none" | "inside" | "outside">(
    "none"
  );
  const [childData, setChildData] = useState<ChildData | null>(null);



  // Utility: Haversine distance in meters
  const distanceMeters = useMemo(
    () =>
      (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const toRad = (v: number) => (v * Math.PI) / 180;
        const R = 6371000; // meters
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      },
    []
  );

  // Fetch geofences using the parent's ID (from AsyncStorage childData)
  const fetchGeoFences = async (parentId: string) => {
    try {
      const response = await ApiClient.get(`/geofencing/parent/${parentId}`);
      if (response.data?.success) {
        const geoFencesData: GeoFence[] = response.data.geoFences.map((geo: any) => ({
          _id: geo._id,
          name: geo.name,
          latitude: geo.latitude,
          longitude: geo.longitude,
          radius: geo.radius,
        }));
        setGeoFences(geoFencesData);
      } else {
        Alert.alert("No Geofences", response.data?.message ?? "No geofences found.");
      }
    } catch (error: any) {
      console.error("Error fetching geofences:", error);
      Alert.alert("Error", error?.response?.data?.message || "Failed to fetch geofences.");
    }
  };

  // On mount: permissions, initial location, child data, fetch fences
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required!");
        setLoading(false);
        return;
      }

      // Try background permission as well (for continuous updates)
      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== "granted") {
        // We'll still run foreground watcher; warn user
        console.warn("Background permission not granted; only foreground tracking active.");
      }

      // Load childData (contains parentId)
      const childStr = await AsyncStorage.getItem("childData");
      if (childStr) {
        try {
          const parsed: ChildData = JSON.parse(childStr);
          setChildData(parsed);
          if (parsed.parentId) {
            await fetchGeoFences(parsed.parentId);
          }
        } catch (e) {
          console.warn("Failed to parse childData from storage:", e);
        }
      }

      const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");

      // Initial position
      const loc = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
      emitEvent("childLocationUpdate", {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        familyCode: savedFamilyCode,
        timestamp: new Date().toISOString(),
      });
      setLoading(false);
    })();
  }, []);

  // Start socket + background/foreground tracking
  useEffect(() => {
    const socket = initializeSocket();

    const startTrackingLocation = async () => {
      const fg = await Location.getForegroundPermissionsAsync();
      if (fg.status !== "granted") return;

      try {
        // Background tracking (if granted)
        const bg = await Location.getBackgroundPermissionsAsync();
        if (bg.status === "granted") {
          await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
            accuracy: Location.Accuracy.High,
            distanceInterval: 1, // meters
            timeInterval: 1000, // ms
            showsBackgroundLocationIndicator: true,
            foregroundService: {
              notificationTitle: "Location Tracking",
              notificationBody: "Your location is being shared with your parent.",
            },
          });
        }
      } catch (error) {
        console.error("Error starting background location updates:", error);
      }

      // Foreground watcher
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, distanceInterval: 1, timeInterval: 1000 },
        async (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });

          const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
          emitEvent("childLocationUpdate", {
            latitude,
            longitude,
            familyCode: savedFamilyCode,
            timestamp: new Date().toISOString(),
          });

          if (mapRef.current && !hasRegionBeenSet) {
            setHasRegionBeenSet(true);
            mapRef.current.animateToRegion(
              {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              },
              600
            );
          }
        }
      );
    };

    startTrackingLocation();

    return () => {
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRegionBeenSet]);

  // Zone detection: play/stop alarm + vibrate; update modal
  useEffect(() => {
    if (!currentLocation || geoFences.length === 0) return;

    const insideAny = geoFences.some((g) => {
      const d = distanceMeters(
        currentLocation.latitude,
        currentLocation.longitude,
        g.latitude,
        g.longitude
      );
      return d <= g.radius;
    });

    setZoneStatus((prev) => {
      if (insideAny && prev !== "inside") {
        // ENTER alert state
        startAlarm();
        return "inside";
      }
      if (!insideAny && prev === "inside") {
        // EXIT to safe zone
        stopAlarm();
        // show "outside" briefly then hide
        setTimeout(() => setZoneStatus("none"), 2000);
        return "outside";
      }
      // No change
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, geoFences]);

  const startAlarm = async () => {
    try {
      // Vibration pattern (repeat-ish via long duration on Android)
      Vibration.vibrate([0, 800, 400], true); // repeating pattern
      
    } catch (e) {
      console.warn("Alarm start failure:", e);
    }
  };

  const stopAlarm = async () => {
    try {
      Vibration.cancel();
     
    } catch (e) {
      console.warn("Alarm stop failure:", e);
    }
  };

  // Manual recenter
  const handleRedirect = async () => {
    try {
      const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
      const location = await Location.getCurrentPositionAsync({});
      emitEvent("childLocationUpdate", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        familyCode: savedFamilyCode,
        timestamp: new Date().toISOString(),
      });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          600
        );
      }
    } catch (e) {
      console.warn("Redirect failed:", e);
    }
  };

  const renderMarker = () => {
    return (
      <Marker
        coordinate={{
          latitude: currentLocation.latitude || 0,
          longitude: currentLocation.longitude || 0,
        }}
        title="Child"
      >
        <View style={styles.markerContainer}>
          <Ionicons name="person-circle-outline" size={40} color="#2196F3" />
          <Text style={styles.markerText}>Child</Text>
        </View>
      </Marker>
    );
  };

  const initialRegion: Region = useMemo(
    () => ({
      latitude: currentLocation.latitude || -20.1600,
      longitude: currentLocation.longitude || 57.5012,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }),
    [currentLocation]
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={[styles.map, styles.center]}>
          <ActivityIndicator />
          <Text style={{ marginTop: 8 }}>Fetching location…</Text>
        </View>
      ) : (
        <MapView ref={mapRef} style={styles.map} initialRegion={initialRegion} showsUserLocation>
          {renderMarker()}

          {/* Render all geofences */}
          {geoFences.map((g) => (
            <Circle
              key={g._id}
              center={{ latitude: g.latitude, longitude: g.longitude }}
              radius={g.radius}
              strokeColor="rgba(0, 200, 0, 0.9)"
              fillColor="rgba(0, 200, 0, 0.25)"
            />
          ))}
        </MapView>
      )}

      {/* Recenter FAB */}
      <TouchableOpacity style={styles.redirectButton} onPress={handleRedirect}>
        <Ionicons name="navigate" size={24} color="#FFF" />
        <Text style={styles.redirectText}>Go to Location</Text>
      </TouchableOpacity>

      {/* SOS FAB */}
      <TouchableOpacity
        style={styles.sosButton}
        onPress={async () => {
          const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
          emitEvent("sosAlert", {
            message: "Child triggered SOS",
            location: currentLocation,
            familyCode: savedFamilyCode,
          });
          Alert.alert("Emergency SOS", "SOS Alert sent to your parent!", [{ text: "OK" }], {
            cancelable: false,
          });
        }}
      >
        <Ionicons name="alert" size={24} color="#FFF" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>

      {/* Zone status modal */}
      <Modal visible={zoneStatus !== "none"} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              zoneStatus === "inside" ? styles.modalDanger : styles.modalSafe,
            ]}
          >
            <Ionicons
              name={zoneStatus === "inside" ? "warning" : "checkmark-circle"}
              size={32}
              color="#FFF"
            />
            <Text style={styles.modalTitle}>
              {zoneStatus === "inside" ? "RESTRICTED AREA" : "You’re in a safe zone"}
            </Text>
            <Text style={styles.modalText}>
              {zoneStatus === "inside"
                ? "Move out of this area immediately."
                : "You’ve exited the restricted area."}
            </Text>

            {zoneStatus === "inside" ? (
              <TouchableOpacity style={styles.modalBtn} onPress={stopAlarm}>
                <Text style={styles.modalBtnText}>Mute Alarm</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Background task: keep emitting location (state updates are not available here)
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: { data?: any; error?: any }) => {
    if (error) {
      console.error("Error in background location task:", error);
      return;
    }
    if (data) {
      const { locations } = data;
      if (locations && locations.length > 0) {
        const { latitude, longitude } = locations[0].coords;
        const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
        emitEvent("childLocationUpdate", {
          latitude,
          longitude,
          familyCode: savedFamilyCode,
          timestamp: new Date().toISOString(),
        });
        // NOTE: You can't set React state here. If you need zone checks in background,
        // trigger a local notification instead (not shown here).
      }
    }
  }
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center" },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "bold",
  },
  redirectButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#2196F3",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  redirectText: {
    fontSize: 14,
    color: "#FFF",
    marginLeft: 8,
    fontWeight: "600",
  },
  sosButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FF0000",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  sosText: {
    fontSize: 14,
    color: "#FFF",
    marginLeft: 8,
    fontWeight: "700",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: "82%",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
  },
  modalDanger: { backgroundColor: "#D7263D" },
  modalSafe: { backgroundColor: "#2E7D32" },
  modalTitle: {
    color: "#FFF",
    fontSize: 18,
    marginTop: 8,
    fontWeight: "800",
  },
  modalText: {
    color: "#FFF",
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
    opacity: 0.9,
  },
  modalBtn: {
    marginTop: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalBtnText: {
    color: "#FFF",
    fontWeight: "700",
  },
});
