import { Tabs } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Header } from "@/components/layout/header";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        header: ({ navigation, route }) => (
          <Header title="MoKidSafe" />
        ),
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 2,
          height: 80,
          borderTopColor: "#E0E0E0",
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      {/* Location Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Location",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />

      {/* Children Tab */}
      <Tabs.Screen
        name="children"
        options={{
          title: "Your Children",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />

      {/* SOS Tab */}
      <Tabs.Screen
        name="sos"
        options={{
          tabBarLabel: "",
          tabBarButton: (props) => (
            <TouchableOpacity
              style={[styles.sosButton]}
              onPress={props.onPress}
              accessible
              accessibilityLabel="SOS Button"
            >
              <Ionicons name="warning" size={32} color="#FFF" />
            </TouchableOpacity>
          ),
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sosButton: {
    backgroundColor: "#FF3B30", // Red color
    borderRadius: 35, // Circular button
    width: 70,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: -20, // Make the button float above the tab bar
    left: "50%",
    marginLeft: -35, // Center the button horizontally
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // For Android shadow
  },
});
