import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import ApiClient from "../../api/client";
import { useLocalSearchParams } from "expo-router";

export default function ChildDetailsScreen() {
  const { parentName, parentId } = useLocalSearchParams<{ parentName: string; parentId: string }>();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const handleSignUp = async () => {
    try {
      const response = await ApiClient.post("/children", {
        name,
        age: parseInt(age),
        emergencyContacts: [],
        parentId,
      });
      Alert.alert("Sign Up Successful", "Child account has been created.");
    } catch (error: any) {
      Alert.alert("Sign Up Failed", error.response?.data?.message || "An error occurred");
    }
  };

  const handleLogin = async () => {
    try {
      const response = await ApiClient.get(`/children?name=${name}&parentId=${parentId}`);
      Alert.alert("Login Successful", `Welcome back, ${name}`);
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>You are the child of {parentName}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter your age"
        keyboardType="number-pad"
        value={age}
        onChangeText={setAge}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5C543",
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    width: "80%",
    height: 40,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  button: {
    width: "50%",
    paddingVertical: 12,
    backgroundColor: "#000",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
