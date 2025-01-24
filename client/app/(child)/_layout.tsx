import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import Header from "@/components/layout/child-header"; // Reuse the Header component
import { Ionicons } from "@expo/vector-icons";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        header: ({ navigation, route }) => (
          <Header title={route.name === "index" ? "Home" : route.name === "explore" ? "Explore" : "SecureNest"} />
        ),
        tabBarStyle: {
          backgroundColor: "#FFF",
          borderTopWidth: 2,
          height: 80,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 10,
          borderTopColor: "#E0E0E0",
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />

      {/* Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
