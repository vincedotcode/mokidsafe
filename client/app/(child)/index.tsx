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

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  const [hasRegionBeenSet, setHasRegionBeenSet] = useState(false);
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");

      const location = await Location.getCurrentPositionAsync({});
      emitEvent("childLocationUpdate", {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      });
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
     
    })();
  }, []);
  
  const handleRedirect = async () => {
    const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");

    const location = await Location.getCurrentPositionAsync({});
    emitEvent("childLocationUpdate", {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      familyCode: savedFamilyCode,
      timestamp: new Date().toISOString(),
    });
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000 // Duration of the animation
      );
    }
  };

  useEffect(() => {
    console.log("ChildHomeScreen useEffect mounted!");
    const socket = initializeSocket();

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
        return;
      }

      console.log("Permissions granted!");

      try {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1, // Update every 1 meter
          timeInterval: 1000, // Update every 1 second
          showsBackgroundLocationIndicator: true,
          foregroundService: {
            notificationTitle: "Location Tracking",
            notificationBody: "Your location is being shared with your parent.",
          },
        });
        console.log("Background location updates started!");
      } catch (error) {
        console.error("Error starting background location updates:", error);
      }

      const initialLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = initialLocation.coords;
      setCurrentLocation({ latitude, longitude });

      if (mapRef.current && !hasRegionBeenSet) {
        setHasRegionBeenSet(true);
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }

      const savedFamilyCode = await AsyncStorage.getItem("savedFamilyCode");
      emitEvent("childLocationUpdate", {
        latitude,
        longitude,
        familyCode: savedFamilyCode,
        timestamp: new Date().toISOString(),
      });

      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 1,
          timeInterval: 1000,
        },
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
        }
      );
    };

    startTrackingLocation();

    return () => {
      disconnectSocket();
    };
  }, []);

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

      {/* Redirect Button */}
      <TouchableOpacity style={styles.redirectButton} onPress={handleRedirect}>
        <Ionicons name="navigate" size={24} color="#FFF" />
        <Text style={styles.redirectText}>Go to Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
        <Ionicons name="alert" size={24} color="#FFF" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

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
  redirectButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  redirectText: {
    fontSize: 14,
    color: "#FFF",
    marginLeft: 8,
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
