import React, { useEffect, useState, useRef } from "react";
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

interface ChildLocation {
  id: string;
  familyCode: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export default function ParentHomeScreen() {
  const { userId: clerkId } = useAuth();
  const { parentDetails } = useParentDetails(clerkId || "");
  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [childLocations, setChildLocations] = useState<ChildLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedGeoFence, setSelectedGeoFence] = useState<GeoFence | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const mapRef = useRef<MapView>(null);

  const fetchUserLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        setLoading(false);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error fetching user location:", error);
      Alert.alert("Error", "Failed to fetch location.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch geofences using the parent's ID
  const fetchGeoFences = async (parentId: string) => {
    try {
      const response = await ApiClient.get(`/geofencing/parent/${parentId}`);
      if (response.data.success) {
        const geoFencesData = response.data.geoFences.map((geo: any) => ({
          _id: geo._id,
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
      console.error("Error fetching geofences:", error);
      Alert.alert("Error", error.response?.data?.message || "Failed to fetch geofences.");
    }
  };

  useEffect(() => {
    fetchUserLocation();
  }, []);

  useEffect(() => {
    if (parentDetails?._id) {
      fetchUserLocation();
      fetchGeoFences(parentDetails._id);
    }
  }, [parentDetails?._id]);

  const redirectToUserLocation = () => {
    if (userLocation && mapRef.current) {
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
        {/* Parent's Location Marker */}
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={styles.parentMarker}>
              <Text style={styles.parentMarkerText}>P</Text>
            </View>
          </Marker>
        )}

        {/* Geofences: Render as a Circle that is touchable */}
        {geoFences.map((geoFence) => (
  <React.Fragment key={geoFence._id}>
    <Circle
      center={{
        latitude: geoFence.latitude,
        longitude: geoFence.longitude,
      }}
      radius={500} // Fixed, larger radius
      strokeColor="rgba(255,0,0,0.8)"
      fillColor="rgba(255,0,0,0.2)"
    />
    <Marker
      coordinate={{
        latitude: geoFence.latitude,
        longitude: geoFence.longitude,
      }}
      onPress={() => {
        setSelectedGeoFence(geoFence);
        setModalVisible(true);
      }}
      opacity={0} // Invisible marker to capture touches
    />
  </React.Fragment>
))}



        {/* Child Location Markers */}
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

    
      {/* My Location Button */}
      <TouchableOpacity style={styles.myPlacesButton} onPress={redirectToUserLocation}>
        <Ionicons name="home" size={18} color="#F5C543" />
        <Text style={styles.myPlacesText}>My Location</Text>
      </TouchableOpacity>

      {/* Modal for Geofence Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.flagContainer}>
              <Ionicons name="flag" size={48} color="red" />
              <Text style={modalStyles.flagText}>
                {selectedGeoFence ? selectedGeoFence.name : ""}
              </Text>
            </View>
            <TouchableOpacity
              style={modalStyles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={modalStyles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 8,
    alignItems: "center",
  },
  flagContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  flagText: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: "#F5C543",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
  parentMarkerText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
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
