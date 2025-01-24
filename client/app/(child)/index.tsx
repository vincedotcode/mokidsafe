import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { initializeSocket, disconnectSocket, emitEvent } from "@/utils/socket";

const LOCATION_TASK_NAME = "BACKGROUND_LOCATION_TASK";

export default function ChildHomeScreen() {
  const mapRef = useRef<MapView>(null);

  // Default map location (e.g., somewhere visible instead of 0,0)
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 37.4220936,
    longitude: -122.083922,
  });

  // We just use this as the initial region
  const [hasRegionBeenSet, setHasRegionBeenSet] = useState(false);

  useEffect(() => {
    console.log("ChildHomeScreen useEffect mounted!");

    const socket = initializeSocket();
    console.log("Socket initialized!");

    // Start tracking location (request permissions, etc.)
    const startTrackingLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required!");
        return;
      }

      const { granted } = await Location.requestBackgroundPermissionsAsync();
      if (!granted) {
        Alert.alert(
          "Background Permission Denied",
          "Background location permission is required for continuous tracking!"
        );
        // You can return here if background tracking is essential
      }

      console.log("Background permission granted? ", granted);

      // Attempt to start background updates
      try {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        });
        console.log("Background location updates started successfully!");
      } catch (error) {
        console.log("Error starting background location updates:", error);
      }

      // Get initial location once
      const initialLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = initialLocation.coords;
      console.log("Initial location:", initialLocation);

      setCurrentLocation({ latitude, longitude });

      // Animate the map to this location if the map is ready
      if (mapRef.current && !hasRegionBeenSet) {
        setHasRegionBeenSet(true);
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      // Emit initial location
      const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
      emitEvent("childLocationUpdate", {
        latitude,
        longitude,
        familyCode: savedFamilyCode,
        timestamp: new Date().toISOString(),
      });
      console.log("Saved family code:", savedFamilyCode);

      // ----- FOREGROUND SUBSCRIPTION (REAL-TIME UPDATES) -----
      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
          timeInterval: 2000,
        },
        async (location) => {
          const { latitude, longitude } = location.coords;
          setCurrentLocation({ latitude, longitude });

          // Keep the map centered on the user if desired
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
          }

          // Emit each location update
          const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
          emitEvent("childLocationUpdate", {
            latitude,
            longitude,
            familyCode: savedFamilyCode,
            timestamp: new Date().toISOString(),
          });
        }
      );
    };

    startTrackingLocation();

    // Cleanup when unmounting
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleZoom = (zoomFactor: number) => {
    // Manually animate to a region with a zoom factor.
    // The current map region can be derived from the current location
    // or read from the map if needed. Here, we base it on currentLocation.
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01 * zoomFactor,
          longitudeDelta: 0.01 * zoomFactor,
        },
        500
      );
    }
  };

  const handleSOS = async () => {
    const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
    emitEvent("sosAlert", {
      message: "Child triggered SOS",
      location: currentLocation,
      familyCode: savedFamilyCode,
    });
    Alert.alert("Emergency SOS", "SOS Alert sent to your parent!", [{ text: "OK" }], {
      cancelable: false,
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        // Instead of controlling region explicitly, just give an initial region.
        // We'll still animate when location updates come in.
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          title="Child"
        >
          <View style={styles.markerContainer}>
            <Ionicons name="person-circle-outline" size={40} color="#2196F3" />
            <Text style={styles.markerText}>Child</Text>
          </View>
        </Marker>

        <Circle
          center={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
          }}
          radius={300}
          strokeColor="rgba(0,255,0,0.8)"
          fillColor="rgba(0,255,0,0.2)"
        />
      </MapView>

      <View style={styles.zoomControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(0.5)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={() => handleZoom(2)}>
          <Ionicons name="remove" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Ionicons name="alert" size={24} color="#FFF" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

// -------- BACKGROUND LOCATION TASK --------
TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({ data, error }: { data?: any; error?: any }) => {
    if (error) {
      console.error("Error in background location task:", error);
      return;
    }
    if (data) {
      const { locations } = data;
      const { latitude, longitude } = locations[0].coords;
      const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");

      // Emit location to socket in the background
      emitEvent("childLocationUpdate", {
        latitude,
        longitude,
        familyCode: savedFamilyCode,
        timestamp: new Date().toISOString(),
      });
    }
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerText: {
    fontSize: 12,
    color: "#2196F3",
    fontWeight: "bold",
  },
  zoomControls: {
    position: "absolute",
    bottom: 180,
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
  sosButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#FF0000",
    padding: 15,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  sosText: {
    fontSize: 14,
    color: "#FFF",
    marginLeft: 8,
  },
});
