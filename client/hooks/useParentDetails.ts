import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ApiClient from "@/api/client";

const PARENT_DETAILS_KEY = "parentDetails";

export default function useParentDetails(clerkId: string) {
  const [parentDetails, setParentDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParentDetails = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.get(`/parents/clerk/${clerkId}`);
      if (response.data.success) {
        const parentData = response.data.parent;
        await AsyncStorage.setItem(PARENT_DETAILS_KEY, JSON.stringify(parentData));

        setParentDetails(parentData);
      } else {
        throw new Error("Failed to fetch parent details.");
      }
    } catch (err: any) {
        console.error(err)
      setError(err.message || "An error occurred while fetching parent details.");
    } finally {
      setLoading(false);
    }
  };

  const loadFromStorage = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem(PARENT_DETAILS_KEY);
      if (storedDetails) {
        setParentDetails(JSON.parse(storedDetails));
      }
    } catch (err) {
      setError("Failed to load parent details from storage.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      // Check if data exists in storage
      const storedDetails = await AsyncStorage.getItem(PARENT_DETAILS_KEY);

      if (storedDetails) {
        // Load from storage
        await loadFromStorage();
      } else {
        // Fetch fresh data
        await fetchParentDetails();
      }
    };

    initialize();
  }, [clerkId]);

  return { parentDetails, loading, error, refetch: fetchParentDetails };
}
