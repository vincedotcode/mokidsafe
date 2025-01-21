import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export const Header = ({
  title,
  showBackButton = false,
  backRoute,
}: {
  title?: string;
  showBackButton?: boolean;
  backRoute?: string;
}) => {
  const router = useRouter();
  const { signOut } = useAuth();

  const doLogout = async () => {
    await signOut();
    alert("Logged out successfully");
  };

  const handleBackPress = () => {
    if (backRoute) {
      router.replace(backRoute as any);
    } else {
      router.back();
    }
  };

  const handleNotificationPress = () => {
    alert("You pressed the notification icon");
  };

  const notificationCount = 3; // Example notification count

  return (
    <SafeAreaView edges={["top"]} style={styles.safeAreaContainer}>
      <View style={styles.headerContainer}>
        {/* Back Button */}
        {showBackButton && (
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        )}

        {/* Title */}
        {title && <Text style={styles.title}>{title}</Text>}

        {/* Right Icons */}
        <View style={styles.iconsContainer}>
          {/* Notification Icon */}
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.notificationContainer}
          >
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
  backButton: {
    marginRight: 16,
  },
  title: {
    flex: 1,
    textAlign: "center",
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

export default Header;
