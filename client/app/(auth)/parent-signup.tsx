import { useSignUp } from "@clerk/clerk-expo";
import React, { useState } from "react";
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
import SignInWithOAuth from "@/components/auth/sign-in-google";
import { useRouter } from "expo-router";
import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";
import HeaderWithBackButton from "@/components/layout/back-header";

export default function ParentSignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [firstName, setFName] = useState("");
  const [lastName, setLName] = useState("");


  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignUp = async () => {
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    try {
      await signUp.create({
        firstName,
        lastName,
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
      Alert.alert("Verification Email Sent", "Check your inbox for a code.");
    } catch (err: any) {
      console.log(err)
      Alert.alert("Error", err.errors[0]?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!isLoaded) {
      return;
    }

    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        Alert.alert("Sign Up Successful", "You are now logged in!");
      } else {
        Alert.alert("Error", "Verification failed. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors[0]?.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaViewWithKeyboard style={styles.safeArea}>
      {/* Header */}
      <HeaderWithBackButton backRoute="/(auth)/user-permission" />
      <View style={styles.container}>
        <Spinner visible={loading} />

        {/* Logo Section */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo-black.png")}
            style={styles.logo}
          />
          <Text style={styles.logoText}>SecureNest</Text>
        </View>

        {/* Sign Up Form */}
        <View style={styles.card}>
          <Text style={styles.title}>
            {pendingVerification ? "Verify Email" : "Parent Sign Up"}
          </Text>

          {!pendingVerification && (
            <>
              <SignInWithOAuth />
              <Text style={styles.orText}>OR</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#aaa"
                keyboardType="default"
                autoCapitalize="none"
                value={firstName}
                onChangeText={setFName}
              />
            
            <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor="#aaa"
                keyboardType="default"
                autoCapitalize="none"
                value={lastName}
                onChangeText={setLName}
              />
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
              <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                <Text style={styles.buttonText}>Sign Up</Text>
              </TouchableOpacity>
            </>
          )}

          {pendingVerification && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Enter Verification Code"
                placeholderTextColor="#aaa"
                keyboardType="number-pad"
                value={verificationCode}
                onChangeText={setVerificationCode}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={handleVerifyEmail}
              >
                <Text style={styles.buttonText}>Verify Email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>
          Already have an account?{" "}
          <Text
            style={styles.link}
            onPress={() => router.push("/(auth)/parent-login")}
          >
            Log In
          </Text>
        </Text>
      </View>
    </SafeAreaViewWithKeyboard>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5C543", // Background color to match theme
  },
  container: {
    flex: 1,
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
  orText: {
    textAlign: "center",
    fontSize: 14,
    color: "#aaa",
    marginVertical: 16,
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
