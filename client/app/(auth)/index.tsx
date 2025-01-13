import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

const ChooseRoleScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
          <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo-black.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>SecureNest</Text>
      </View>
      <Text style={styles.title}>Choose your role</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(auth)/parent-login")}
      >
        <Text style={styles.buttonText}>Parent</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(auth)/child-auth")}
      >
        <Text style={styles.buttonText}>Child</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("/(auth)/parent-signup")}
        style={styles.linkContainer}
      >
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.link}>Log in</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5C543", // Match background color
    padding: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 60,
    height: 60,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 32,
  },
  button: {
    width: "80%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  linkContainer: {
    marginTop: 16,
  },
  linkText: {
    fontSize: 14,
    color: "#000",
  },
  link: {
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default ChooseRoleScreen;
