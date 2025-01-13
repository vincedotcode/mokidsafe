import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo"; // Ensure Clerk is properly integrated

export const Header = ({ title, profileImage, onNotificationPress, notificationCount }: any) => {
  const { signOut } = useAuth();

  const doLogout = () => {
    signOut();
  };

  return (
    <View style={styles.headerContainer}>
      {/* Profile Image */}
      <Image source={{ uri: profileImage }} style={styles.profileImage} />

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Icons Container */}
      <View style={styles.iconsContainer}>
        {/* Notification Icon */}
        <TouchableOpacity onPress={onNotificationPress} style={styles.notificationContainer}>
          <Ionicons name="notifications" size={24} color="black" />
          {notificationCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationCount}>{notificationCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Logout Icon */}
        <Pressable onPress={doLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="black" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#F5C543",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationContainer: {
    position: "relative",
    marginRight: 16,
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  logoutButton: {
    marginLeft: 8,
  },
});
