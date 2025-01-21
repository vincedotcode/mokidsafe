import mongoose, { Schema, Document } from "mongoose";

export interface IGeoFence extends Document {
  parentId: string; // Reference to the Parent model
  name: string; // Name of the geofence (e.g., "Home Zone")
  latitude: number; // Latitude of the geofence center
  longitude: number; // Longitude of the geofence center
  radius: number; // Radius in meters
  isActive: boolean; // Whether the geofence is currently active
  createdAt: Date;
  updatedAt: Date;
}

// Create the GeoFence schema
const GeoFenceSchema: Schema<IGeoFence> = new Schema(
  {
    parentId: {
      type: String,
      ref: "Parent", 
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
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
    radius: {
      type: Number,
      required: true,
      min: [0, "Radius must be a positive number"],
      default: 100, // Default radius in meters
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

// Create and export the GeoFence model
export const GeoFence = mongoose.model<IGeoFence>("GeoFence", GeoFenceSchema);
