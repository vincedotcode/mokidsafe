import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from "react-native";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import { useRouter, useLocalSearchParams } from "expo-router";
import HeaderWithBackButton from "@/components/layout/back-header";
import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";

const PermissionsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const { from } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (notificationsEnabled && locationEnabled) {
      if (from === "/parent-login") {
        router.replace("/(parents)");
      } else {
        router.replace("/(child)");
      }
    }
  }, [notificationsEnabled, locationEnabled, from, router]);

  const openAppSettings = () => {
    Linking.openSettings().catch(() =>
      Alert.alert(
        "Error",
        "Unable to open settings. Please go to your device settings manually."
      )
    );
  };

  const handleEnableNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      Alert.alert("Success", "Push Notifications enabled!");
      setNotificationsEnabled(true);
    } else if (status === "denied") {
      Alert.alert(
        "Permission Denied",
        "Push Notifications permission is required. Redirecting to settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", onPress: openAppSettings },
        ]
      );
    }
  };

  const handleEnableLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      Alert.alert("Success", "Location access enabled!");
      setLocationEnabled(true);
    } else if (status === "denied") {
      Alert.alert(
        "Permission Denied",
        "Location permission is required for this feature. Redirecting to settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go to Settings", onPress: openAppSettings },
        ]
      );
    }
  };

  return (
    <SafeAreaViewWithKeyboard style={styles.safeArea}>
      <HeaderWithBackButton backRoute="/(auth)/user-permission" />

      <View style={styles.contentContainer}>
        <Text style={styles.title}>
          SecureNest requires these permissions to work
        </Text>

        <View style={styles.permissionContainer}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Push Notifications</Text>
            <Text style={styles.permissionDescription}>
              To keep you updated with important family updates
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.enableButton,
              notificationsEnabled && styles.enabled,
            ]}
            onPress={handleEnableNotifications}
            disabled={notificationsEnabled}
          >
            <Text style={styles.buttonText}>
              {notificationsEnabled ? "Enabled" : "Enable"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.permissionContainer}>
          <View style={styles.permissionInfo}>
            <Text style={styles.permissionTitle}>Location</Text>
            <Text style={styles.permissionDescription}>
              To keep you safe at all times
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.enableButton, locationEnabled && styles.enabled]}
            onPress={handleEnableLocation}
            disabled={locationEnabled}
          >
            <Text style={styles.buttonText}>
              {locationEnabled ? "Enabled" : "Enable"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaViewWithKeyboard>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5C543", // Background color to match theme
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "center", // Centers content vertically
    alignItems: "center", // Centers content horizontally
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  permissionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
    width: "90%", // Make the containers responsive
  },
  permissionInfo: {
    flex: 1,
    marginRight: 10,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  permissionDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  enableButton: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F5C543",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  enabled: {
    backgroundColor: "#D4EDDA",
    borderColor: "#28A745",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F5C543",
  },
});

export default PermissionsScreen;
