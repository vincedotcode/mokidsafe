import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";

import useParentDetails from "@/hooks/useParentDetails";
import ApiClient from "@/api/client";
import { initializeSocket, disconnectSocket } from "@/utils/socket";

type GeoFence = {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
};

type ChildLocation = {
  id: string;           // familyCode (or childId if you emit it)
  familyCode: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

const CHILD_LOCATIONS_KEY = "lastChildLocations";

export default function ParentHomeScreen() {
  const { userId: clerkId } = useAuth();
  const { parentDetails } = useParentDetails(clerkId || "");

  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [childLocations, setChildLocations] = useState<ChildLocation[]>([]);
  const [selectedGeoFence, setSelectedGeoFence] = useState<GeoFence | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ---------- Helpers ----------
  const redirectToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        600
      );
    }
  };

  const upsertChildLocation = async (incoming: ChildLocation) => {
    setChildLocations((prev) => {
      const idx = prev.findIndex((c) => c.id === incoming.id);
      const next = idx >= 0 ? [...prev.slice(0, idx), incoming, ...prev.slice(idx + 1)] : [incoming, ...prev];
      // Persist latest snapshot
      AsyncStorage.setItem(CHILD_LOCATIONS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const loadCachedChildLocations = async () => {
    try {
      const raw = await AsyncStorage.getItem(CHILD_LOCATIONS_KEY);
      if (!raw) return;
      const parsed: ChildLocation[] = JSON.parse(raw);
      if (Array.isArray(parsed)) setChildLocations(parsed);
    } catch {}
  };

  const fetchGeoFences = async (parentId: string) => {
    try {
      const response = await ApiClient.get(`/geofencing/parent/${parentId}`);
      if (response.data?.success) {
        const data: GeoFence[] = response.data.geoFences.map((g: any) => ({
          _id: g._id,
          name: g.name,
          latitude: g.latitude,
          longitude: g.longitude,
          radius: g.radius,
        }));
        setGeoFences(data);
      } else {
        Alert.alert("No Geofences", response.data?.message ?? "No geofences found.");
      }
    } catch (error: any) {
      Alert.alert("Error", error?.response?.data?.message || "Failed to fetch geofences.");
    }
  };

  const fetchUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch {
      Alert.alert("Error", "Failed to fetch location.");
    }
  };

  // ---------- Effects ----------
  // Boot: permissions + cached child locations
  useEffect(() => {
    (async () => {
      await loadCachedChildLocations();
      await fetchUserLocation();
      setLoading(false);
    })();
  }, []);

  // Fetch fences when parent is known
  useEffect(() => {
    if (parentDetails?._id) {
      fetchGeoFences(parentDetails._id);
    }
  }, [parentDetails?._id]);

  // Socket hookup: receive live child updates and cache them
  useEffect(() => {
    const socket = initializeSocket();

    // Expecting payload like:
    // { latitude, longitude, familyCode, timestamp }
    socket.on("childLocationUpdate", (payload: any) => {
      const id = payload.familyCode ?? payload.childId ?? "unknown";
      if (!payload?.latitude || !payload?.longitude || !id) return;

      const incoming: ChildLocation = {
        id,
        familyCode: payload.familyCode ?? id,
        latitude: Number(payload.latitude),
        longitude: Number(payload.longitude),
        timestamp: payload.timestamp || new Date().toISOString(),
      };
      upsertChildLocation(incoming);
    });

    return () => {
      socket.off("childLocationUpdate");
      disconnectSocket();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F5C543" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : {
                latitude: -20.16,
                longitude: 57.5012,
                latitudeDelta: 0.2,
                longitudeDelta: 0.2,
              }
        }
      >
        {/* Parent marker (customized) */}
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={styles.parentMarker}>
              <Text style={styles.parentMarkerText}>P</Text>
            </View>
          </Marker>
        )}

        {/* Geofences (circle + labeled marker) */}
        {geoFences.map((g) => (
          <React.Fragment key={g._id}>
            <Circle
              center={{ latitude: g.latitude, longitude: g.longitude }}
              radius={g.radius}
              strokeColor="rgba(255,0,0,0.85)"
              fillColor="rgba(255,0,0,0.2)"
            />
            <Marker
              coordinate={{ latitude: g.latitude, longitude: g.longitude }}
              onPress={() => {
                setSelectedGeoFence(g);
                setModalVisible(true);
              }}
            >
              <View style={styles.geofenceMarker}>
                <Ionicons name="flag" size={16} color="#fff" />
                <Text style={styles.geofenceText} numberOfLines={1}>
                  {g.name}
                </Text>
              </View>
            </Marker>
          </React.Fragment>
        ))}

        {/* Live + cached child locations */}
        {childLocations.map((c) => (
          <Marker
            key={c.id}
            coordinate={{ latitude: c.latitude, longitude: c.longitude }}
            title={`Child • ${c.familyCode}`}
            description={`Last update: ${new Date(c.timestamp).toLocaleString()}`}
            pinColor="blue"
          />
        ))}
      </MapView>

      {/* Recenter */}
      <TouchableOpacity style={styles.myPlacesButton} onPress={redirectToUserLocation}>
        <Ionicons name="navigate" size={18} color="#F5C543" />
        <Text style={styles.myPlacesText}>My Location</Text>
      </TouchableOpacity>

      {/* Geofence details modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.flagContainer}>
              <Ionicons name="flag" size={48} color="red" />
              <Text style={modalStyles.flagText}>{selectedGeoFence?.name ?? ""}</Text>
              {selectedGeoFence && (
                <Text style={modalStyles.flagMeta}>
                  {selectedGeoFence.latitude.toFixed(5)}, {selectedGeoFence.longitude.toFixed(5)} • {selectedGeoFence.radius}m
                </Text>
              )}
            </View>
            <TouchableOpacity style={modalStyles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={modalStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },

  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  parentMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  parentMarkerText: { color: "#FFF", fontSize: 18, fontWeight: "bold" },

  geofenceMarker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E53935",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  geofenceText: { color: "#fff", marginLeft: 6, fontWeight: "700", maxWidth: 160, fontSize: 12 },

  myPlacesButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  myPlacesText: { marginLeft: 8, color: "#F5C543", fontWeight: "bold" },
});

const modalStyles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", padding: 20, backgroundColor: "#FFF", borderRadius: 12, alignItems: "center" },
  flagContainer: { alignItems: "center", marginBottom: 16 },
  flagText: { marginTop: 10, fontSize: 18, fontWeight: "bold", color: "red", textAlign: "center" },
  flagMeta: { marginTop: 6, fontSize: 13, color: "#555" },
  closeButton: { backgroundColor: "#F5C543", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeButtonText: { color: "#FFF", fontWeight: "bold" },
});
