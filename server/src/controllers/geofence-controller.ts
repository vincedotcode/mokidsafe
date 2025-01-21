import { Request, Response } from "express";
import GeoFenceService from "../services/geofence-service";

class GeoFencingController {
  /**
   * Create a GeoFencing entry
   */
  async createGeoFencing(req: Request, res: Response): Promise<void> {
    const { parentId, latitude, longitude, radius, name } = req.body;

    if (!parentId || !latitude || !longitude || !radius) {
       res.status(400).json({
        success: false,
        message: "Missing required fields: parentId, latitude, longitude, and radius are required.",
      });
      return;
    }

    try {
      const geoFence = await GeoFenceService.createGeoFence({
        parentId,
        latitude,
        longitude,
        radius,
        name,
      });

      res.status(201).json({
        success: true,
        message: "GeoFencing created successfully.",
        geoFence,
      });
    } catch (error: any) {
      console.error("Error creating GeoFencing:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to create GeoFencing.",
        error: error.message,
      });
    }
  }

  /**
   * Get all GeoFencing entries for a specific parent
   */
  async getGeoFencingByParentId(req: Request, res: Response): Promise<void> {
    const { parentId } = req.params;
    if (!parentId) {
      res.status(400).json({
        success: false,
        message: "Missing required parameter: parentId.",
      });
      return;
    }

    try {
      const geoFences = await GeoFenceService.getGeoFencesByParentId(parentId);

      if (!geoFences.length) {
        res.status(404).json({
          success: false,
          message: "No GeoFencing entries found for the specified parentId.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "GeoFencing entries retrieved successfully.",
        geoFences,
      });
    } catch (error: any) {
      console.error("Error retrieving GeoFencing:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve GeoFencing.",
        error: error.message,
      });
    }
  }

  /**
   * Get all GeoFencing entries globally
   */
  async getAllGeoFencing(req: Request, res: Response): Promise<void> {
    try {
      const geoFences = await GeoFenceService.getAllGeoFences();

      if (!geoFences.length) {
         res.status(404).json({
          success: false,
          message: "No GeoFencing entries found.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "All GeoFencing entries retrieved successfully.",
        geoFences,
      });
    } catch (error: any) {
      console.error("Error retrieving all GeoFencing:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve all GeoFencing.",
        error: error.message,
      });
    }
  }

  /**
   * Delete a GeoFencing entry
   */
  async deleteGeoFencing(req: Request, res: Response): Promise<void> {
    const { geoFencingId } = req.params;

    if (!geoFencingId) {
       res.status(400).json({
        success: false,
        message: "Missing required parameter: geoFencingId.",
      });
      return;
    }

    try {
      const deletedGeoFence = await GeoFenceService.deleteGeoFence(geoFencingId);

      if (!deletedGeoFence) {
         res.status(404).json({
          success: false,
          message: "GeoFencing entry not found.",
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: "GeoFencing deleted successfully.",
      });
    } catch (error: any) {
      console.error("Error deleting GeoFencing:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to delete GeoFencing.",
        error: error.message,
      });
    }
  }
}

export default new GeoFencingController();
