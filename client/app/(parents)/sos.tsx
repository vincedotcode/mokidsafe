import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Vibration,
  Text,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { emitEvent, initializeSocket, listenToEvent, removeEventListener } from "@/utils/socket";
import { useAuth } from "@clerk/clerk-expo";
import useParentDetails from "@/hooks/useParentDetails";

const SOS_TASK_NAME = "SOS_TASK";

interface SOSAlertData {
  message: string;
  location: { latitude: number; longitude: number };
  familyCode: string;
}

export default function SosAlertPage() {
  const { userId: clerkId } = useAuth();
  const { parentDetails } = useParentDetails(clerkId || "");
  const mapRef = useRef<MapView>(null);
  const [childLocations, setChildLocations] = useState<SOSAlertData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const socket = initializeSocket();
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 0,
    longitude: 0,
  });


  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  // Handle SOS Alert
  const handleSOSAlert = async (data: SOSAlertData) => {
    const familyCodes = parentDetails?.familyCodes || [];
    if (!familyCodes.includes(data.familyCode)) {
      console.warn("SOS alert received for unrelated family code:", data.familyCode);
      return;
    }

    // Save SOS Alert Locally
    await AsyncStorage.setItem(
      `sos-${data.familyCode}`,
      JSON.stringify({ message: data.message, location: data.location })
    );

    // Send Notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "SOS Alert",
        body: `${data.message} for FamilyCode: ${data.familyCode}`,
        data: data,
      },
      trigger: null,
    });

    // Vibrate Device
    Vibration.vibrate([500, 500, 500], true); // Vibrates indefinitely
    Alert.alert(
      "SOS Alert",
      `${data.message} at (${data.location.latitude}, ${data.location.longitude})`,
      [
        {
          text: "Stop Vibration",
          onPress: () => Vibration.cancel(),
        },
      ],
      { cancelable: false }
    );

    // Focus Map on SOS Location
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: data.location.latitude,
          longitude: data.location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
    setChildLocations((prevLocations) => [...prevLocations, data]);
  };

  // Background Task for SOS Alerts
  TaskManager.defineTask(SOS_TASK_NAME, async ({ data, error }: { data?: any; error?: any }) => {
    if (error) {
      console.error("Error in background task:", error);
      return Promise.resolve();
    }
    if (data) {
      handleSOSAlert(data as SOSAlertData);
    }
  });

  useEffect(() => {
    listenToEvent("sosAlert", handleSOSAlert);
    return () => {
      removeEventListener("sosAlert");
      console.log("Removed SOS Alert listener");
    };
  }, [parentDetails]);


  
  useEffect(() => {
    const setupNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Notification permissions are required.");
        return;
      }

      setLoading(false);
      await Notifications.registerTaskAsync(SOS_TASK_NAME);
    };
    setupNotifications();
  }, []);



  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const testLocation = {
    latitude: -20.1963851,
    longitude: 57.7226468,
    message: "sos alert",
    familyCode: "152269",
    timestamp: new Date().toISOString(),
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
      <MapView ref={mapRef} style={styles.map}>
        {childLocations.map((child, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: child.location.latitude,
              longitude: child.location.longitude,
            }}
            title={`Child SOS Alert`}
            description={`FamilyCode: ${child.familyCode}`}
            pinColor="red"
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={styles.backButton}
        onPress={handleSOS}
      >
        <Ionicons name="arrow-back" size={24} color="#FFF" />
        <Text style={styles.backButtonText}>Back</Text>
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backButtonText: {
    marginLeft: 8,
    color: "#FFF",
    fontWeight: "bold",
  },
});
