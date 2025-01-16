import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function useHasChild() {
  const [hasChild, setHasChild] = useState<boolean>(false);
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        // Read the hasChild flag from AsyncStorage
        const storedHasChild = await AsyncStorage.getItem("hasChild");
        
        if (storedHasChild === "true") {
          setHasChild(true);
          
          // If the user has children, fetch the child data
          const storedChildren = await AsyncStorage.getItem("childrenData");
          if (storedChildren) {
            setChildren(JSON.parse(storedChildren));
          }
        } else {
          setHasChild(false);
        }
      } catch (error) {
        console.error("Error reading from AsyncStorage:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return {
    hasChild,     // boolean indicating if hasChild is true
    children,     // array or object containing children data
    loading,      // indicates if the hook is still reading from storage
  };
}
