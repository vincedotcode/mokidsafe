import { GeoFence } from "../models/geofencing.model";

interface CreateGeoFenceInput {
  parentId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
}


class GeoFenceService {
  // Create a new geofence
  async createGeoFence(data: CreateGeoFenceInput) {
    try {
      const geoFence = await GeoFence.create(data);
      console.log("Geofence created:", geoFence);
      return geoFence;
    } catch (error: any) {
      console.error("Error creating geofence:", error.message);
      throw new Error("Failed to create geofence");
    }
  }

  // Get all geofences for a specific parent by parentId
  async getGeoFencesByParentId(parentId: string) {
    try {
      const geoFences = await GeoFence.find({ parentId });
      console.log("Geofences for parent:", geoFences);
      return geoFences;
    } catch (error: any) {
      console.error("Error fetching geofences for parent:", error.message);
      throw new Error("Failed to fetch geofences for parent");
    }
  }

  // Get all geofences (global retrieval)
  async getAllGeoFences() {
    try {
      const geoFences = await GeoFence.find();
      console.log("All geofences:", geoFences);
      return geoFences;
    } catch (error: any) {
      console.error("Error fetching all geofences:", error.message);
      throw new Error("Failed to fetch all geofences");
    }
  }

  // Delete a geofence by ID
  async deleteGeoFence(geoFenceId: string) {
    try {
      const deletedGeoFence = await GeoFence.findByIdAndDelete(geoFenceId);
      if (!deletedGeoFence) {
        console.log("Geofence not found");
        throw new Error("Geofence not found");
      }
      console.log("Geofence deleted:", deletedGeoFence);
      return deletedGeoFence;
    } catch (error: any) {
      console.error("Error deleting geofence:", error.message);
      throw new Error("Failed to delete geofence");
    }
  }
}


export default new GeoFenceService();
