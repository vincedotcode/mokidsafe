import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Alert,
} from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import ApiClient from "@/api/client";
import useParentDetails from "@/hooks/useParentDetails";
import { useAuth } from "@clerk/clerk-expo";

interface GeoFence {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function ParentHomeScreen() {
  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId: clerkId } = useAuth();
  const { parentDetails, error } = useParentDetails(clerkId || "");
  const mapRef = useRef<MapView>(null); // Reference to the MapView
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const fetchGeoFences = async (parentId: string) => {
    try {
      const response = await ApiClient.get(`/geofencing/parent/${parentId}`);
      if (response.data.success) {
        setGeoFences(response.data.geoFences);
        // Set the initial region to the first geofence
        if (response.data.geoFences.length) {
          const firstGeoFence = response.data.geoFences[0];
          setMapRegion({
            latitude: firstGeoFence.latitude,
            longitude: firstGeoFence.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        Alert.alert("No Geofences Found", response.data.message);
      }
    } catch (error: any) {
      console.error("Error fetching geofences:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch geofences."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleZoom = (zoomFactor: number) => {
    if (mapRegion && mapRef.current) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta * zoomFactor,
        longitudeDelta: mapRegion.longitudeDelta * zoomFactor,
      };
      setMapRegion(newRegion); // Update the region state
      mapRef.current.animateToRegion(newRegion, 2000); // Animate to the new region
    }
  };

  useEffect(() => {
    if (parentDetails?._id) {
      fetchGeoFences(parentDetails._id);
    }
  }, [parentDetails]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F5C543" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion || undefined} // Set initial region dynamically
      >
        {/* GeoFences */}
        {geoFences.map((geoFence) => (
          <React.Fragment key={geoFence._id}>
            <Marker
              coordinate={{
                latitude: geoFence.latitude,
                longitude: geoFence.longitude,
              }}
              title={geoFence.name}
            />
            <Circle
              center={{
                latitude: geoFence.latitude,
                longitude: geoFence.longitude,
              }}
              radius={geoFence.radius}
              strokeColor="rgba(255,0,0,0.8)"
              fillColor="rgba(255,0,0,0.2)"
            />
          </React.Fragment>
        ))}
      </MapView>

      {/* Zoom Buttons */}
      <View style={styles.zoomControls}>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => handleZoom(0.5)} // Zoom in
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.zoomButton}
          onPress={() => handleZoom(2)} // Zoom out
        >
          <Ionicons name="remove" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* My Places Button */}
      <TouchableOpacity style={styles.myPlacesButton}>
        <Ionicons name="home" size={18} color="#F5C543" />
        <Text style={styles.myPlacesText}>My Places</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
  myPlacesText: {
    marginLeft: 8,
    color: "#F5C543",
    fontWeight: "bold",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  zoomControls: {
    position: "absolute",
    bottom: 50,
    right: 20,
    flexDirection: "column",
  },
  zoomButton: {
    backgroundColor: "#F5C543",
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 3,
  },
});
