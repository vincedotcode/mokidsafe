import { Stack } from "expo-router";
import { Header } from "@/components/layout/header";

export default function GeoFencingLayout() {
  return (
    <Stack
      screenOptions={{
        header: ({ navigation, route }) => (
          <Header
          showBackButton={true}
          title="SecureNest"
          />
        ),
        headerTransparent: true, // Transparent header background
        headerStyle: {
          backgroundColor: "transparent",
        },
        headerTitle: "", // Remove default title
        headerBackVisible: false, // Hides the default back button
      }}
    />
  );
}
