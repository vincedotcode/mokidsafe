import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ParentSettingsScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.clear();
          router.replace("/(auth)");
        },
      },
    ]);
  };

  const handleManageGeoFencing = () => {
    router.push("/geofencing/geo-fencing");
  };

  const handleManageNotifications = () => {
    //router.push("/(parent)/notification-preferences");
  };

  const handleManageChildren = () => {
    // router.push("/(parent)/child-management");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={() => Alert.alert("Feature Coming Soon", "Edit Profile")}
        >
          <Text style={styles.optionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => Alert.alert("Feature Coming Soon", "Change Password")}
        >
          <Text style={styles.optionText}>Change Password</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option} onPress={handleLogout}>
          <Text style={[styles.optionText, styles.logout]}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Geo-Fencing</Text>
        <TouchableOpacity style={styles.option} onPress={handleManageGeoFencing}>
          <Text style={styles.optionText}>Manage Geo-Fencing</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>
        <TouchableOpacity
          style={styles.option}
          onPress={handleManageNotifications}
        >
          <Text style={styles.optionText}>Manage Notification Preferences</Text>
        </TouchableOpacity>
        <View style={styles.switchRow}>
          <Text style={styles.optionText}>Receive Alerts</Text>
          <Switch value={true} onValueChange={() => Alert.alert("Toggled")} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Child Management</Text>
        <TouchableOpacity style={styles.option} onPress={handleManageChildren}>
          <Text style={styles.optionText}>Manage Children</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.option}
          onPress={() => Alert.alert("Feature Coming Soon", "Invite Child")}
        >
          <Text style={styles.optionText}>Invite Child</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  option: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
  optionText: {
    fontSize: 16,
    color: "#000",
  },
  logout: {
    color: "red",
    fontWeight: "bold",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#DDD",
  },
});
