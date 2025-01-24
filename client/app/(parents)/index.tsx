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
import { initializeSocket, disconnectSocket, emitEvent, listenToEvent, removeEventListener } from "@/utils/socket";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@clerk/clerk-expo";
import useParentDetails from "@/hooks/useParentDetails";
import ApiClient from "@/api/client";

interface GeoFence {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

interface ChildLocationUpdate {
  latitude: number;
  longitude: number;
  familyCode: string;
  timestamp: string;
}

interface ChildLocation {
  id: string; // e.g., "child-<familyCode>"
  familyCode: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function ParentHomeScreen() {
  const { userId: clerkId } = useAuth();
  const { parentDetails, error, refetch } = useParentDetails(clerkId || "");

  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [childLocations, setChildLocations] = useState<ChildLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);

  const socket = initializeSocket();

  const fetchUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access is required.");
      return;
    }
    const location = await Location.getCurrentPositionAsync({});
    setUserLocation({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  const redirectToUserLocation = () => {
    fetchUserLocation()
    if (userLocation && mapRef.current) {
      console.log(userLocation)
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const saveChildLocation = async (data: ChildLocation) => {
    try {
      const storedData = await AsyncStorage.getItem("childLocations");
      const parsedData: ChildLocation[] = storedData ? JSON.parse(storedData) : [];
      const updatedData = parsedData.filter((loc) => loc.id !== data.id);
      updatedData.push(data);
      await AsyncStorage.setItem("childLocations", JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error saving child location to AsyncStorage:", error);
    }
  };

  const loadChildLocations = async () => {
    try {
      const storedData = await AsyncStorage.getItem("childLocations");
      console.log(storedData)
      if (storedData) {
        setChildLocations(JSON.parse(storedData));
      }
    } catch (error) {
      console.error("Error loading child locations from AsyncStorage:", error);
    }
  };

  const handleChildLocationUpdate = (data: ChildLocationUpdate) => {
    const familyCodes = parentDetails?.familyCodes || [];
    if (!familyCodes.includes(data.familyCode)) {
      console.warn("Received data for an unassociated family code:", data.familyCode);
      return;
    }

    const newLocation: ChildLocation = {
      id: `child-${data.familyCode}`,
      familyCode: data.familyCode,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: data.timestamp,
    };

    setChildLocations((prevLocations) => {
      const updatedLocations = prevLocations.filter((loc) => loc.id !== newLocation.id);
      updatedLocations.push(newLocation);
      return updatedLocations;
    });

    saveChildLocation(newLocation);

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: data.latitude,
          longitude: data.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const handleSosAlert = (data: any) => {
    console.log("Received SOS alert:", data);
  };

  useEffect(() => {
    listenToEvent("childLocationUpdate", handleChildLocationUpdate);
    listenToEvent("sosAlert", handleSosAlert);

    return () => {
      removeEventListener("childLocationUpdate");
      removeEventListener("sosAlert");
      console.log("Removed socket event listeners");
    };
  }, [parentDetails]);

  const fetchGeoFences = async (parentId: string) => {
    setLoading(true);
    try {
      const response = await ApiClient.get(`/geofencing/parent/${parentId}`);
      if (response.data.success) {
        const geoFencesData = response.data.geoFences.map((geo: any) => ({
          id: geo._id,
          name: geo.name,
          latitude: geo.latitude,
          longitude: geo.longitude,
          radius: geo.radius,
        }));
        setGeoFences(geoFencesData);
      } else {
        Alert.alert("No Geofences", response.data.message);
      }
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to fetch geofences.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parentDetails?._id) {
      fetchGeoFences(parentDetails?._id);
    }
    fetchUserLocation();
    loadChildLocations(); 
  }, [parentDetails?._id]);

  const testLocation = {
    latitude: -20.1963851,
    longitude: 57.7226468,
    familyCode: "152269",
    timestamp: new Date().toISOString(),
  };


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
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }
      >
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

      <TouchableOpacity style={styles.myPlacesButton} onPress={redirectToUserLocation}>
        <Ionicons name="home" size={18} color="#F5C543" />
        <Text style={styles.myPlacesText}>My Location</Text>
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
