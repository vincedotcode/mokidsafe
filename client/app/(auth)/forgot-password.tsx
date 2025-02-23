import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";

/**
 * Two-step password reset screen using Clerk's "reset_password_email_code" strategy.
 */
export default function ForgotPasswordScreen() {
  // Clerk signIn object (make sure you're on at least clerk-expo v4+)
  const { isLoaded, signIn, setActive } = useSignIn();

  // UI states
  const [loading, setLoading] = useState(false);
  const [stepOneDone, setStepOneDone] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  /**
   * Step 1: Request a password reset (sends a 6-digit code to user’s email).
   */
  const handleRequestReset = async () => {
    if (!isLoaded) return;

    if (!email) {
      Alert.alert("Error", "Please enter an email address.");
      return;
    }

    setLoading(true);
    try {
      // Initiate the password reset strategy
      await signIn!.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });

      Alert.alert(
        "Reset Email Sent",
        "We've sent a 6-digit reset code to your email. Check your inbox."
      );

      setStepOneDone(true);
    } catch (err: any) {
      console.error("Password Reset (Step 1) Error:", err);
      Alert.alert(
        "Reset Failed",
        err?.errors?.[0]?.message || "Could not send reset code."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Attempt the password reset using the 6-digit code + new password.
   */
  const handleResetPassword = async () => {
    if (!isLoaded) return;

    if (!code || !password) {
      Alert.alert("Error", "Please enter both the code and your new password.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      Alert.alert("Success", "Your password has been reset!");

      // Optionally set the session active to auto-login the user
      // after successful reset
      if (result.createdSessionId) {
        await setActive!({ session: result.createdSessionId });
      }

      // Navigate to a success screen or back to login
      router.replace("/(auth)/parent-login");
    } catch (err: any) {
      console.error("Password Reset (Step 2) Error:", err);
      Alert.alert(
        "Reset Failed",
        err?.errors?.[0]?.message || "Could not reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaViewWithKeyboard>
    <View style={styles.container}>
      {/* Loading Spinner */}
      <Spinner visible={loading} />

      {/* Logo / Header */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/logo-black.png")}
          style={styles.logo}
        />
        <Text style={styles.logoText}>MoKidSafe</Text>
      </View>

      {/* Main Card */}
      <View style={styles.card}>
        {!stepOneDone ? (
          <>
            {/* Step 1: Request a Reset Code */}
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.infoText}>
              Enter the email address associated with your account.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRequestReset}
            >
              <Text style={styles.buttonText}>Send Reset Email</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Step 2: Reset with Code + New Password */}
            <Text style={styles.title}>Enter Reset Code</Text>
            <Text style={styles.infoText}>
              A code was sent to your email. Enter it along with a new password.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="6-digit Code"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />

            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#aaa"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleResetPassword}
            >
              <Text style={styles.buttonText}>Set New Password</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Footer: Go Back to Login */}
      <Text style={styles.footerText}>
        Remember your password?{" "}
        <Text
          style={styles.link}
          onPress={() => router.replace("/(auth)/parent-login")}
        >
          Login
        </Text>
      </Text>
    </View>
    </SafeAreaViewWithKeyboard>
  );
}

// -------------------------------
// Styles
// -------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5C543",
    justifyContent: "center",
    alignItems: "center",
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
  infoText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#F9F9F9",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#000",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
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
