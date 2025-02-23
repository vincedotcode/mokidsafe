import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSignIn } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { useRouter, usePathname } from "expo-router";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";
import GoogleSignInButton from "@/components/auth/sign-in-google"; // Import the component

const saveCredentials = async (email: string, password: string) => {
  await SecureStore.setItemAsync("email", email);
  await SecureStore.setItemAsync("password", password);
};

const getStoredCredentials = async () => {
  const email = await SecureStore.getItemAsync("email");
  const password = await SecureStore.getItemAsync("password");
  return { email, password };
};

const clearCredentials = async () => {
  await SecureStore.deleteItemAsync("email");
  await SecureStore.deleteItemAsync("password");
};

export default function ParentLoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const pathname = usePathname(); // This provides the current route's path
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
const router = useRouter();
  useEffect(() => {
    const loadStoredCredentials = async () => {
      const { email, password } = await getStoredCredentials();
      if (email && password) {
        setEmail(email);
        setPassword(password);
        setRememberMe(true);
      }
    };
    loadStoredCredentials();
  }, []);
  const checkPermissions = async () => {
    const { status: notificationStatus } = await Notifications.getPermissionsAsync();
    const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
  
    if (notificationStatus !== "granted" || locationStatus !== "granted") {
      router.replace("/(auth)/user-permission");
      return false;
    }
    return true;
  };
  
  const handleLogin = async () => {
    if (!isLoaded) {
      return;
    }
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });

      if (rememberMe) {
        await saveCredentials(email, password);
      } else {
        await clearCredentials();
      }
      Alert.alert("Login Successful", "You are now logged in!");
      await AsyncStorage.setItem("isParent", "true");

      const hasPermissions = await checkPermissions();
      if (hasPermissions) {
        router.push({
          pathname: "/(auth)/user-permission",
          params: { from: pathname }, // Pass the current path
        });
      }
      else {
        router.replace("/(parents)");

      }
    } catch (err: any) {
      Alert.alert("Login Failed", err.message || "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.replace("/(auth)/forgot-password");

  };

  return (
    <SafeAreaViewWithKeyboard>
    <View style={styles.container}>
      <Spinner visible={loading} />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo-black.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>MoKidSafe</Text>
      </View>

      {/* Login Form */}
      <View style={styles.card}>
        <Text style={styles.title}>Parent Login</Text>
        <GoogleSignInButton/>
        <Text style={styles.orText}>OR</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.rememberContainer}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              rememberMe ? styles.checkboxChecked : null,
            ]}
            onPress={() => setRememberMe(!rememberMe)}
          />
          <Text style={styles.rememberText}>Remember Me</Text>
        </View>
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <Text style={styles.footerText}>
        Don’t have an account?{" "}
        <Text
          style={styles.link}
          onPress={() => router.push("/(auth)/parent-signup")}
        >
          Sign up
        </Text>
      </Text>
    </View>
    </SafeAreaViewWithKeyboard>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5C543", // Background color to match theme
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
  card: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rememberContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#F5C543",
  },
  rememberText: {
    fontSize: 14,
    color: "#000",
  },
  forgotPasswordContainer: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  orText: {
    textAlign: "center",
    fontSize: 14,
    color: "#aaa",
    marginVertical: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: "#F5C543",
    fontWeight: "bold",
  },
  button: {
    width: "100%",
    backgroundColor: "#F5C543",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  footerText: {
    fontSize: 14,
    color: "#000",
    marginTop: 16,
  },
  link: {
    fontWeight: "bold",
    textDecorationLine: "underline",
    color: "#000",
  },
});
