import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  Button,
  Image,
  Share,
} from "react-native";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import SafeAreaViewWithKeyboard from "@/components/layout/safe-area-view";
import HeaderWithBackButton from "@/components/layout/back-header";
import ApiClient from "@/api/client";
import useParentDetails from "@/hooks/useParentDetails";
import { useAuth } from "@clerk/clerk-expo";
import SvgImage from "@/components/layout/svg-image";
import { SvgUri } from "react-native-svg";
import ReusableButton from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";


interface EmergencyContact {
  name: string;
  phoneNumber: string;
  relationship: string;
}

interface Child {
  _id: string;
  name: string;
  age: number;
  familyCode: string;
  profilePicture: string;
  emergencyContacts: EmergencyContact[];
}
interface ChildCreated {
  name: string;
  age: number;
  familyCode: string;
  profilePicture: string;
  emergencyContacts: EmergencyContact[];
}


export default function CreateChildScreen(): JSX.Element {
  const { userId: clerkId } = useAuth();
  const { parentDetails, loading: parentLoading, error, refetch } = useParentDetails(clerkId || "");
  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([
    { name: "", phoneNumber: "", relationship: "" },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [parentIdMongo, setParentIdMongo] = useState<string>("");
  const router = useRouter();



  useEffect(() => {
    const fetchChildren = async () => {
      try {
        if (!clerkId) return;
        setLoading(true);
        const parents = await ApiClient.get(`/parents/clerk/${clerkId}`);
        const response = await ApiClient.get(`/children/by-parent/${parents.data.parent._id}`);
        setParentIdMongo(parents.data.parent._id)
        if (response.data.success) {
          setChildren(response.data.children);
        } else {
          throw new Error("Failed to fetch children.");
        }
      } catch (err) {
        console.log(err)
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [clerkId]);



  const handleAddContact = (): void => {
    setEmergencyContacts([
      ...emergencyContacts,
      { name: "", phoneNumber: "", relationship: "" },
    ]);
  };
  const handleChildClick = (childId: string) => {
    console.log("child id", childId)
    router.push(`/children/${childId}`);
  };

  const handleContactChange = (index: number, field: keyof EmergencyContact, value: string): void => {
    const updatedContacts = [...emergencyContacts];
    updatedContacts[index][field] = value;
    setEmergencyContacts(updatedContacts);
  };

  const generateFamilyCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString().padStart(6, "0");
  };

  const handleSubmit = async (): Promise<void> => {
    if (!name || !age) {
      Alert.alert("Error", "All fields are required.");
      return;
    }

    if (!parentDetails) {
      Alert.alert("Error", "Parent details are missing. Please try again.");
      return;
    }

    setLoading(true);


    try {

      const generatedFamilyCode = generateFamilyCode();
      const profilePicture = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${name.replace(/ /g, "_")}`;

      const child: ChildCreated = {
        name,
        age: parseInt(age, 10),
        familyCode: generatedFamilyCode,
        profilePicture,
        emergencyContacts,
      };

      const localChildrenString = await AsyncStorage.getItem("childrenData");
      let localChildren: Child[] = localChildrenString
        ? JSON.parse(localChildrenString)
        : [];

      // Add the new child



      const response = await ApiClient.post("/children/create", {
        ...child,
        parentId: parentIdMongo,
      });

      if (response.data.success) {
        setChildren((prev) => [...prev, { ...child, _id: response.data.child._id }]);
        setName("");
        setAge("");
        setEmergencyContacts([{ name: "", phoneNumber: "", relationship: "" }]);
        setModalVisible(false);
        setShowCreateForm(false);
        Alert.alert("Success", "Child created successfully.");
        localChildren.push(response.data.success.child);
        await AsyncStorage.setItem("childrenData", JSON.stringify(localChildren));

        // Set hasChild to "true"
        console.log(response.data.child)
        await AsyncStorage.setItem("hasChild", "true");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to create child. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaViewWithKeyboard style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Spinner visible={loading || parentLoading} />

        {!showCreateForm && (
          <ReusableButton
            label="Add Child"
            onPress={() => setShowCreateForm(true)}
            backgroundColor="#000"
            textColor="#FFF"
          />
        )}

        {showCreateForm && (
          <View style={styles.card}>
            <Text style={styles.title}>Create Child</Text>
            <TextInput
              style={styles.input}
              placeholder="Child's Name"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={styles.input}
              placeholder="Child's Age"
              placeholderTextColor="#aaa"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />

            <Text style={styles.sectionTitle}>Emergency Contacts</Text>
            {emergencyContacts.map((contact, index) => (
              <View key={index} style={styles.contactContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Name"
                  placeholderTextColor="#aaa"
                  value={contact.name}
                  onChangeText={(value) =>
                    handleContactChange(index, "name", value)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#aaa"
                  keyboardType="phone-pad"
                  value={contact.phoneNumber}
                  onChangeText={(value) =>
                    handleContactChange(index, "phoneNumber", value)
                  }
                />
                <TextInput
                  style={styles.input}
                  placeholder="Relationship"
                  placeholderTextColor="#aaa"
                  value={contact.relationship}
                  onChangeText={(value) =>
                    handleContactChange(index, "relationship", value)
                  }
                />
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddContact}
            >
              <Text style={styles.addButtonText}>+ Add Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Create Child</Text>
            </TouchableOpacity>
          </View>
        )}
        {children.length > 0 ? (
          children.map((child, index) => (
            <TouchableOpacity
              key={child._id}
              style={styles.childCard}
              onPress={() => handleChildClick(child._id)}
            >
              <View style={styles.container}>
                <SvgUri
                  width={80}
                  height={80}
                  uri={child.profilePicture}
                />
              </View>

              <Text style={styles.childName}>{child.name}</Text>
              <Text style={styles.childCode}>Family Code: {child.familyCode}</Text>

              <TouchableOpacity
                style={styles.shareButton}
                onPress={async () => {
                  try {
                    await Share.share({
                      message: `Here is the family code for ${child.name}: ${child.familyCode}.`,
                      url: child.profilePicture, // Optional: Include the picture URL
                      title: "Share Family Code",
                    });
                  } catch (error) {
                    Alert.alert("Error", "Failed to share family code.");
                  }
                }}
              >
                <Ionicons name="share-social-outline" size={24} color="#FFF" />
                <Text style={styles.shareButtonText}>Share</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.noChildrenCard}>
            <Text style={styles.noChildrenText}>No children found. Please add a child.</Text>
          </View>
        )}



      </ScrollView>

    </SafeAreaViewWithKeyboard>
  );
}
//42170
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginVertical: 8,
  },
  contactContainer: {
    marginBottom: 16,
  },
  addButton: {
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
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
    backgroundColor: "#0000",
    color: "#000",
  },
  childCard: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  childAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  childCode: {
    fontSize: 16,
    color: "#555",
  },
  noChildrenCard: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  noChildrenText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },

  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    backgroundColor: "#000",
    padding: 10,
    borderRadius: 8,
  },
  shareButtonText: {
    marginLeft: 8,
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },

});
