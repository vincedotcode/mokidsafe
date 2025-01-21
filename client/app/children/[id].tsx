import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";
import HeaderWithBackButton from "@/components/layout/back-header";

const { width } = Dimensions.get("window");

const dummyChild = {
  id: "1",
  name: "John Doe",
  age: 12,
  profilePicture: "https://api.dicebear.com/9.x/pixel-art/svg?seed=JohnDoe",
  screenTimeData: [2, 3, 1.5, 4, 2.5, 3, 1],
  previousLocations: [
    { latitude: 37.7749, longitude: -122.4194, timestamp: "2025-01-15T10:00:00Z" },
    { latitude: 37.7849, longitude: -122.4094, timestamp: "2025-01-15T12:00:00Z" },
    { latitude: 37.7949, longitude: -122.3994, timestamp: "2025-01-15T14:00:00Z" },
  ],
};

export default function DetailsScreen() {
  const [child, setChild] = useState(dummyChild);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate a loading delay
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#F5C543" />
        <Text>Loading child data...</Text>
      </View>
    );
  }

  return (
    <SafeAreaViewWithKeyboard style={styles.safeArea}>
            <HeaderWithBackButton backRoute="/(parents)/children" />
    <ScrollView style={styles.container}>
      {/* Child Info */}
      <View style={styles.header}>
        <Image source={{ uri: child.profilePicture }} style={styles.avatar} />
        <View>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.childAge}>Age: {child.age}</Text>
        </View>
      </View>

      {/* Screen Time Chart */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screen Time (Hours)</Text>
        <LineChart
          data={{
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
            datasets: [
              {
                data: child.screenTimeData,
                color: () => "#F5C543",
              },
            ],
          }}
          width={width - 32}
          height={220}
          yAxisSuffix="h"
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            color: () => "#000",
            labelColor: () => "#666",
            style: {
              borderRadius: 16,
            },
          }}
          style={styles.chart}
        />
      </View>

      {/* Previous Locations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Previous Locations</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: child.previousLocations[0]?.latitude || 37.7749,
            longitude: child.previousLocations[0]?.longitude || -122.4194,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          {child.previousLocations.map((loc, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: loc.latitude,
                longitude: loc.longitude,
              }}
              title={`Visited on ${new Date(loc.timestamp).toLocaleDateString()}`}
            />
          ))}
          <Polyline
            coordinates={child.previousLocations.map((loc) => ({
              latitude: loc.latitude,
              longitude: loc.longitude,
            }))}
            strokeColor="#F5C543"
            strokeWidth={4}
          />
        </MapView>
      </View>

      {/* Additional Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Details</Text>
        <Text style={styles.detailText}>
          Total Screen Time:{" "}
          {child.screenTimeData.reduce((a, b) => a + b, 0)} hours
        </Text>
        <Text style={styles.detailText}>
          Last Location: {child.previousLocations[0]?.latitude},{" "}
          {child.previousLocations[0]?.longitude}
        </Text>
        <Text style={styles.detailText}>
          Last Seen:{" "}
          {new Date(child.previousLocations[0]?.timestamp).toLocaleString()}
        </Text>
      </View>
    </ScrollView>
    </SafeAreaViewWithKeyboard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#FFF",
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  childName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  childAge: {
    fontSize: 16,
    color: "#666",
  },
  section: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000",
  },
  chart: {
    borderRadius: 16,
  },
  map: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  detailText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
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
  safeArea: {
    flex: 1,
    backgroundColor: "#F5C543",
},
});
