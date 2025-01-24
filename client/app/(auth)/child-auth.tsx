import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import ApiClient from "../../api/client";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ChildAuthScreen() {
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const refs = useRef<TextInput[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchSavedCode = async () => {
      const savedCode = await AsyncStorage.getItem("savedFamilyCode");
      if (savedCode) {
        setCode(savedCode.split(""));
      }
    };

    fetchSavedCode();
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    const updatedCode = [...code];
    updatedCode[index] = text;
    setCode(updatedCode);

    if (text && index < code.length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const enteredCode = code.join("");
    if (enteredCode.length === 6) {
      try {
        const response = await ApiClient.post("/children/authenticate", {
          familyCode: enteredCode,
        });
        const { child } = response.data;
        console.log(child);
        const nameofchild = child.name;

        // Save the family code to AsyncStorage
        await AsyncStorage.setItem("savedFamilyCode", enteredCode);
        await AsyncStorage.setItem("childData", JSON.stringify(child));
        await AsyncStorage.setItem("isChild", "true");

        Alert.alert("Authentication Successful", `Hello ${nameofchild}`);
        router.replace("/(child)");
      } catch (error: any) {
        console.error("this is the error", error);
        Alert.alert(
          "Authentication Failed",
          error.response?.data?.message || "An error occurred"
        );
      }
    } else {
      Alert.alert("Invalid Code", "Please enter all 6 digits.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo-black.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>SecureNest</Text>
      </View>
      <Text style={styles.title}>Enter your invite code</Text>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            style={styles.input}
            maxLength={1}
            keyboardType="number-pad"
            value={digit}
            onChangeText={(text) => handleCodeChange(text, index)}
            ref={(input: TextInput) => (refs.current[index] = input)}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Don’t have a code? Ask your parent to invite you to the family group.
      </Text>
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
  codeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#FFF",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    marginHorizontal: 5,
  },
  button: {
    width: "50%",
    paddingVertical: 12,
    backgroundColor: "#000",
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footerText: {
    fontSize: 14,
    color: "#000",
    textAlign: "center",
    marginTop: 16,
  },
});
