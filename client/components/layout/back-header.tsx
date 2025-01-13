import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";



interface HeaderWithBackButtonProps {
  backRoute: string; // Use a string to represent the route
}

const HeaderWithBackButton: React.FC<HeaderWithBackButtonProps> = ({ backRoute }) => {
  const router = useRouter();

  
  const handleBackPress = () => {
    router.replace(backRoute as any);
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      {/* Placeholder for alignment */}
      <View style={styles.placeholder} />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "transparent", // Transparent background
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 24, // Match back button size to balance alignment
  },
});

export default HeaderWithBackButton;
