import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { Header } from "@/components/layout/header";
import { Ionicons } from "@expo/vector-icons";
import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";
export default function TabLayout() {
  return (
    
    <Tabs
      screenOptions={{
        header: ({ navigation, route }) => (
          <Header
            title="SecureNest"
            profileImage="https://via.placeholder.com/150"
            onNotificationPress={() => alert("Notification Pressed")}
            notificationCount={1}
          />
        ),
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 1,
          borderTopColor: "#E0E0E0",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Location",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Your Family",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
