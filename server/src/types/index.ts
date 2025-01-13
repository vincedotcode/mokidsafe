export interface Parent {
    clerkId: string;
    email: string;
    name: string;
    phoneNumber?: string;
    profilePicture?: string;
    familyCode: string;
    isVerified: boolean;
    role: string;
    status: string;
}


export interface Child {
    id: string; // Unique identifier (e.g., UUID or database ID as a string)
    parentId: string; // Reference to Parent's ID
    name: string; // Child's name
    age: number; // Child's age
    profilePicture?: string; // Optional profile picture URL
    locationHistory: Array<{
        latitude: number;
        longitude: number;
        timestamp: string; // ISO 8601 format
    }>; // Array of location history objects
    geoFence?: {
        latitude: number;
        longitude: number;
        radius: number;
    }; // Geo-fence settings
    emergencyContacts: Array<{
        name: string;
        phoneNumber: string;
        relationship: string;
    }>; // Array of emergency contact objects
    isOnline: boolean; // Online status
    lastSeen?: string; // Timestamp of the last time the child was online (ISO 8601 format)
    createdAt?: string; // Timestamp of document creation (ISO 8601 format)
    updatedAt?: string; // Timestamp of last document update (ISO 8601 format)
}
