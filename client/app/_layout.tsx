import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Slot, useRouter, useSegments, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import 'react-native-reanimated';
import "../global.css";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHasChild } from "@/hooks/useHasChild"; 

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Clerk publishable key
const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';

// Token cache for Clerk
const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      console.error('Error retrieving token:', err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error('Error saving token:', err);
    }
  },
};


// Authentication flow and routing logic
const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { hasChild, loading: hasChildLoading } = useHasChild(); // <-- Retrieve the hasChild value
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded || hasChildLoading) return;
    
    const handleRouting = async () => {
      try {
        const isChild = await AsyncStorage.getItem("isChild");
        const isParent = await AsyncStorage.getItem("isParent");
        const isChildLoggedIn = await AsyncStorage.getItem("childData");
        
        if (!isSignedIn) {
          const isFirstTimeUser = await AsyncStorage.getItem("isFirstTimeUser");
    
          if (isFirstTimeUser === null) {
            await AsyncStorage.setItem("isFirstTimeUser", "false");
            router.replace("/");
          } else {
            if (isChildLoggedIn && isChild){
              router.replace("/(child)");
            }
            else {
              router.replace("/(auth)");
            }
          }
          return;
        }
        if (isParent === "true") {
          if (hasChild) {
            router.replace("/(parents)");
          } else {
            router.replace("/(auth)/child-create");
          }
        } else {
          router.replace("/(auth)");
        }
      } catch (error) {
        console.error("Error checking user status:", error);
      }
    };
    
    
    handleRouting();
  }, [isLoaded, isSignedIn, hasChild, hasChildLoading, router]);

  return <Slot />;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <InitialLayout />
        <StatusBar style="auto" />
      </ThemeProvider>
    </ClerkProvider>
  );
}
