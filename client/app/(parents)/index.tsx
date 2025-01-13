import React from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/header";

export default function ParentHomeScreen() {
  const mockProfileImage = "https://via.placeholder.com/150";
  const mockChildrenLocations = [
    {
      id: 1,
      name: "Child 1",
      coordinate: { latitude: 19.076, longitude: 72.8777 },
      image: "https://via.placeholder.com/50",
    },
    {
      id: 2,
      name: "Child 2",
      coordinate: { latitude: 19.086, longitude: 72.8877 },
      image: "https://via.placeholder.com/50",
    },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="SecureNest"
        profileImage={mockProfileImage}
        onNotificationPress={() => alert("Notification Pressed")}
        notificationCount={1}
      />

      {/* Map Section */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 19.076,
          longitude: 72.8777,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {mockChildrenLocations.map((child) => (
          <Marker key={child.id} coordinate={child.coordinate} title={child.name}>
            <View style={styles.markerContainer}>
              <Image source={{ uri: child.image }} style={styles.childImage} />
            </View>
          </Marker>
        ))}
      </MapView>

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
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 25,
    padding: 5,
    borderColor: "#F5C543",
    borderWidth: 2,
  },
  childImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
});
