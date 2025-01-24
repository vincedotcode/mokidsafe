import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

export const ChildHeader = ({
  title,
}: {
  title?: string;
}) => {
  const router = useRouter();

  const doLogout = async () => {
    try {
      await AsyncStorage.removeItem("childData"); // Remove childData from storage
      await AsyncStorage.removeItem("isChild"); // Remove isChild flag
      router.replace("/(auth)"); // Redirect to (auth)
      alert("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeAreaContainer}>
      <View style={styles.headerContainer}>
        {/* Title */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Logout Icon */}
        <Pressable onPress={doLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="black" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaContainer: {
    backgroundColor: "#F5C543", // Ensure background color extends into the safe area
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#F5C543",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  logoutButton: {
    marginLeft: 8,
  },
});

export default ChildHeader;
