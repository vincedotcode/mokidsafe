import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  Modal,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import ApiClient from "../../api/client";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import useParentDetails from "@/hooks/useParentDetails";
import * as Location from "expo-location";

const { height } = Dimensions.get("window");

interface GeoFence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}

export default function GeoFencingScreen() {
  const [geoFences, setGeoFences] = useState<GeoFence[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const { userId: clerkId } = useAuth();
  const { parentDetails, error, refetch } = useParentDetails(clerkId || "");
  const mapRef = React.useRef<MapView>(null); // Reference to MapView


  const fetchGeoFences = async (parentId: string) => {
    setFetching(true);
    try {
      const response = await ApiClient.get(`/geofencing/parent/${parentId}`);
      console.log("geofencing", response);

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
      console.error("Error fetching geofences:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to fetch geofences."
      );
    } finally {
      setFetching(false);
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    setModalVisible(true);
  };

  const handleAddGeoFence = async () => {
    if (!name || !selectedLocation) {
      Alert.alert("Error", "Please provide a name for the geofencing area.");
      return;
    }


    setLoading(true);
    try {
      const response = await ApiClient.post("/geofencing", {
        parentId: parentDetails?._id,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        radius: 100,
        name,
      });

      const newGeoFence = {
        id: response.data.geoFence._id,
        name: response.data.geoFence.name,
        latitude: response.data.geoFence.latitude,
        longitude: response.data.geoFence.longitude,
        radius: 1000,
      };

      setGeoFences([...geoFences, newGeoFence]);
      setName("");
      setSelectedLocation(null);
      setModalVisible(false);
      Alert.alert("Success", "Geofence added successfully!");
    } catch (error: any) {
      console.error("Error adding geofence:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to add geofence. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };
  const redirectToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01, // Adjust zoom level
          longitudeDelta: 0.01,
        },
        1000 // Animation duration in milliseconds
      );
    }
  };

  const handleRemoveGeoFence = async (id: string) => {
    setLoading(true);
    try {
      const response = await ApiClient.delete(`/geofencing/${id}`);
      if (response.data.success) {
        setGeoFences(geoFences.filter((geoFence) => geoFence.id !== id));
        Alert.alert("Success", "Geofence removed successfully!");
      } else {
        Alert.alert("Error", "Failed to remove geofence.");
      }
    } catch (error: any) {
      console.error("Error removing geofence:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to remove geofence."
      );
    } finally {
      setLoading(false);
    }
  };


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
      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);

      // ✅ Move the map to the user's location
      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude: newLocation.latitude,
            longitude: newLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    } catch (error) {
      console.error("Error fetching user location:", error);
      Alert.alert("Error", "Failed to fetch location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parentDetails?._id) {
      fetchGeoFences(parentDetails?._id);
    }
    fetchUserLocation(); // Fetch user location when the screen loads
  }, [parentDetails?._id]);


  return (
    <View style={styles.container}>
      {/* Full-Screen Map */}
      <MapView
        style={styles.map}
        ref={mapRef}
        onPress={handleMapPress}
        initialRegion={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
        }
      >
        {geoFences.map((geoFence) => (
          <React.Fragment key={geoFence.id}>
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
              strokeColor="rgba(0,0,255,0.5)"
              fillColor="rgba(0,0,255,0.2)"
            />
          </React.Fragment>
        ))}
         {/* ✅ Parent's Location Marker */}
         {userLocation && (
          <Marker coordinate={userLocation} title="Your Location">
            <View style={styles.parentMarker}>
              <Text style={styles.parentMarkerText}>P</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Drawer Trigger */}
         {/* Redirect Button */}
         <TouchableOpacity style={styles.redirectButton} onPress={redirectToUserLocation}>
        <Ionicons name="navigate" size={18} color="#FFF" />
        <Text style={styles.redirectText}>Go to My Location</Text>
      </TouchableOpacity>


      {!drawerVisible && (
        <TouchableOpacity
          style={styles.drawerButton}
          onPress={() => setDrawerVisible(true)}
        >
          <Text style={styles.drawerButtonText}>View Geofences</Text>
        </TouchableOpacity>
      )}

      {/* Drawer */}
      {drawerVisible && (
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Your Geofences</Text>
            <TouchableOpacity
              onPress={() => setDrawerVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={geoFences}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.geoFenceItem}>
                <Text style={styles.geoFenceName}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveGeoFence(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>No geofences added yet.</Text>
            }
          />
        </View>
      )}

      {/* Add Geofence Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Geofence</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter geofence name"
              value={name}
              onChangeText={setName}
            />
            {loading ? (
              <ActivityIndicator size="large" color="#F5C543" />
            ) : (
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleAddGeoFence}
                >
                  <Text style={styles.modalButtonText}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Fetching Indicator */}
      {fetching && (
        <ActivityIndicator
          size="large"
          color="#F5C543"
          style={styles.fetchingIndicator}
        />
      )}
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
  drawerButton: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -100 }],
    width: 200,
    paddingVertical: 10,
    backgroundColor: "#F5C543",
    borderRadius: 8,
    alignItems: "center",
  },
  drawerButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  drawer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: height * 0.75,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  drawerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 8,
  },
  geoFenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  geoFenceName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  removeButton: {
    backgroundColor: "#FF3B30",
    padding: 8,
    borderRadius: 8,
  },
  emptyListText: {
    textAlign: "center",
    color: "#888",
    marginTop: 16,
  },
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
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
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
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  redirectButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  redirectText: {
    marginLeft: 8,
    color: "#FFF",
    fontWeight: "bold",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: "#007BFF",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#FF3B30",
  },
  modalButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  fetchingIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});
