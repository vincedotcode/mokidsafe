import mongoose, { Schema, Document } from "mongoose";

export interface IChild extends Document {
  parentId: string; // Reference to the Parent as a string
  familyCode: string; // Family code for associating the child with the family
  name: string;
  age: number;
  profilePicture?: string;
  locationHistory: Array<{
    latitude: number;
    longitude: number;
    timestamp: Date;
  }>;
  geoFence?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  emergencyContacts: Array<{
    name: string;
    phoneNumber: string;
    relationship: string;
  }>;
  isOnline: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Create the Child schema
const ChildSchema: Schema<IChild> = new Schema(
  {
    parentId: {
      type: String,
      required: true,
      trim: true,
    },
    familyCode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Z0-9]{6,10}$/, "Family code must be alphanumeric and 6-10 characters long"], // Example validation
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    age: {
      type: Number,
      required: true,
      min: [0, "Age must be a positive number"],
      max: [18, "Age must be less than or equal to 18"], // Assuming a child is defined as under 18
    },
    profilePicture: {
      type: String,
      trim: true,
      validate: {
        validator: (v: string) => v === "" || /^https?:\/\/.+/.test(v), // Validate URL
        message: "Profile picture must be a valid URL",
      },
    },
    locationHistory: [
      {
        latitude: {
          type: Number,
          required: true,
          min: -90,
          max: 90, // Latitude range
        },
        longitude: {
          type: Number,
          required: true,
          min: -180,
          max: 180, // Longitude range
        },
        timestamp: {
          type: Date,
          required: true,
          default: Date.now,
        },
      },
    ],
    geoFence: {
      latitude: {
        type: Number,
        min: -90,
        max: 90,
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180,
      },
      radius: {
        type: Number,
        min: [0, "Radius must be a positive number"],
        default: 100, // Default geofence radius in meters
      },
    },
    emergencyContacts: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
          minlength: [2, "Name must be at least 2 characters long"],
        },
        phoneNumber: {
          type: String,
          required: true,
          validate: {
            validator: (v: string) => /^\+?[1-9]\d{1,14}$/.test(v), // E.164 format
            message: "Phone number must be valid and in E.164 format",
          },
        },
        relationship: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Create and export the Child model
export const Child = mongoose.model<IChild>("Child", ChildSchema);
