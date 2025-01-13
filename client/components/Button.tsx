import React from "react";
import { TouchableOpacity, Text, StyleSheet, View, Image } from "react-native";

interface ButtonProps {
  label: string;
  onPress: () => void;
  icon?: any; // Accepts local image source or URL string
  backgroundColor?: string;
  textColor?: string;
}

export default function ReusableButton({
  label,
  onPress,
  icon,
  backgroundColor = "#000", // Default to black
  textColor = "#FFF", // Default to white
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {icon && (
          typeof icon === "string" ? (
            <Image source={{ uri: icon }} style={styles.icon} />
          ) : (
            <Image source={icon} style={styles.icon} />
          )
        )}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "85%",
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    alignSelf: "center",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: "contain",
  },
});
