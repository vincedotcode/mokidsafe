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
import { io } from "socket.io-client";
import { initializeSocket, disconnectSocket, emitEvent,listenToEvent } from "@/utils/socket";

// Example imports for your auth and parent details hooks
import { useAuth } from "@clerk/clerk-expo";         // <--- Your actual path
import useParentDetails  from "@/hooks/useParentDetails"; // <--- Your actual path

// If you prefer the existing socket utilities (initializeSocket, etc.), feel free to import and use them instead.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://default-url.com/api";
const socket = io(BASE_URL);

interface GeoFence {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface ChildLocationUpdate {
  // The payload we receive from the socket
  latitude: number;
  longitude: number;
  familyCode: string;
  timestamp: string;
}

interface ChildLocation {
  // The structure we use to render on the map
  id: string;    // e.g., "child-<familyCode>"
  familyCode: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function ParentHomeScreen() {
  // 1) Get clerkId (parent user ID) from your auth
  const { userId: clerkId } = useAuth();

  // 2) Fetch parent details, which presumably includes familyCodes
  const { parentDetails, error, refetch } = useParentDetails(clerkId || "");

  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [childLocations, setChildLocations] = useState<ChildLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  // -------------------------------
  //  A) Setup socket listener
  // -------------------------------
  const socket = initializeSocket();
  const testLocation = {
    latitude: -20.1963851,
    longitude: 57.7226468,
    familyCode: "152269",
    timestamp: new Date().toISOString(),
  };


  useEffect(() => {

    emitEvent("childLocationUpdate", testLocation);
  }, [socket]);

  useEffect(() => {

    // Listen for real-time location updates from the socket
    listenToEvent("childLocationUpdate", (data: ChildLocationUpdate) => {
      // data = { latitude, longitude, familyCode, timestamp }

      console.log(data)
      // Check if the parent's familyCodes include the child's familyCode
      const familyCodes = parentDetails?.familyCodes || [];

      if (!familyCodes.includes(data.familyCode)) {
        // If this family code isn't part of the parent's codes, ignore it
        return;
      }

      // The parent is allowed to see this child's location
      setChildLocations((prevLocations) => {

        const existingIndex = prevLocations.findIndex(
          (child) => child.id === `child-${data.familyCode}`
        );
        if (existingIndex !== -1) {
          // Update existing child's location
          const updatedLocations = [...prevLocations];
          updatedLocations[existingIndex] = {
            ...updatedLocations[existingIndex],
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp,
          };
          return updatedLocations;
        } else {
          // Add new child's location
          return [
            ...prevLocations,
            {
              id: `child-${data.familyCode}`,
              familyCode: data.familyCode,
              latitude: data.latitude,
              longitude: data.longitude,
              timestamp: data.timestamp,
            },
          ];
        }
      });
    });

    // Cleanup socket listener
    return () => {
      socket.off("locationUpdate"); // remove just this event listener
      // socket.disconnect();        // or fully disconnect the socket if not used further
    };
  }, [socket]);

  // -------------------------------
  //  B) Zoom Handler
  // -------------------------------
  const handleZoom = (zoomFactor: number) => {
    emitEvent("childLocationUpdate", testLocation);
    if (mapRegion && mapRef.current) {
      const newRegion = {
        ...mapRegion,
        latitudeDelta: mapRegion.latitudeDelta * zoomFactor,
        longitudeDelta: mapRegion.longitudeDelta * zoomFactor,
      };
      setMapRegion(newRegion);
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  // -------------------------------
  //  C) Mock GeoFence Fetch
  // -------------------------------
  useEffect(() => {
    // Simulate fetching geofences from an API
    setTimeout(() => {
      const mockGeoFences: GeoFence[] = [
        {
          _id: "1",
          name: "Home",
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 300,
        },
        {
          _id: "2",
          name: "School",
          latitude: 37.7849,
          longitude: -122.4094,
          radius: 500,
        },
      ];
      setGeoFences(mockGeoFences);
      setMapRegion({
        latitude: mockGeoFences[0].latitude,
        longitude: mockGeoFences[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      setLoading(false);
    }, 1000);
  }, []);

  // -------------------------------
  //  D) Render
  // -------------------------------
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F5C543" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map Section */}
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={mapRegion || undefined}
      >
        {/* Render GeoFences */}
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

        {/* Render Child Locations */}
        {childLocations.map((child) => (
          <Marker
            key={child.id}
            coordinate={{
              latitude: child.latitude,
              longitude: child.longitude,
            }}
            title={`Child (FamilyCode: ${child.familyCode})`}
            description={`Last update: ${child.timestamp}`}
            pinColor="blue"
          />
        ))}
      </MapView>

      {/* Zoom Buttons */}
      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(0.5)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(2)}>
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

// ---------------------
//  Styles
// ---------------------
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
  },
});
