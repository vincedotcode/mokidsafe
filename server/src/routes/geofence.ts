// src/routes/GeoFencingRoutes.ts
import { Router } from "express";
import GeoFencingController from "../controllers/geofence-controller";

const router = Router();

/**
 * @swagger
 * /api/geofencing:
 *   post:
 *     summary: Create a GeoFencing entry
 *     description: Create a new GeoFencing entry for a parent.
 *     tags:
 *       - GeoFencing
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parentId:
 *                 type: string
 *                 description: The ID of the parent creating the GeoFencing.
 *                 example: 63f72d9142e8aa13f4d2e6c2
 *               latitude:
 *                 type: number
 *                 description: Latitude for the GeoFence.
 *                 example: 37.7749
 *               longitude:
 *                 type: number
 *                 description: Longitude for the GeoFence.
 *                 example: -122.4194
 *               radius:
 *                 type: number
 *                 description: Radius of the GeoFence in meters.
 *                 example: 100
 *               name:
 *                 type: string
 *                 description: Name of the GeoFence.
 *                 example: Home
 *     responses:
 *       201:
 *         description: GeoFencing entry created successfully.
 *       400:
 *         description: Missing or invalid request fields.
 *       500:
 *         description: Failed to create GeoFencing entry.
 */
router.post("/", GeoFencingController.createGeoFencing);

/**
 * @swagger
 * /api/geofencing/parent/{parentId}:
 *   get:
 *     summary: Get all GeoFencing entries for a parent
 *     description: Retrieve all GeoFencing entries associated with a specific parent.
 *     tags:
 *       - GeoFencing
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the parent.
 *     responses:
 *       200:
 *         description: GeoFencing entries retrieved successfully.
 *       404:
 *         description: No GeoFencing entries found for the parent.
 *       500:
 *         description: Failed to retrieve GeoFencing entries.
 */
router.get("/parent/:parentId", GeoFencingController.getGeoFencingByParentId);

/**
 * @swagger
 * /api/geofencing:
 *   get:
 *     summary: Get all GeoFencing entries
 *     description: Retrieve all GeoFencing entries globally.
 *     tags:
 *       - GeoFencing
 *     responses:
 *       200:
 *         description: GeoFencing entries retrieved successfully.
 *       404:
 *         description: No GeoFencing entries found.
 *       500:
 *         description: Failed to retrieve GeoFencing entries.
 */
router.get("/", GeoFencingController.getAllGeoFencing);

/**
 * @swagger
 * /api/geofencing/{geoFencingId}:
 *   delete:
 *     summary: Delete a GeoFencing entry
 *     description: Delete a specific GeoFencing entry by its ID.
 *     tags:
 *       - GeoFencing
 *     parameters:
 *       - in: path
 *         name: geoFencingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the GeoFencing entry to delete.
 *     responses:
 *       200:
 *         description: GeoFencing entry deleted successfully.
 *       404:
 *         description: GeoFencing entry not found.
 *       500:
 *         description: Failed to delete GeoFencing entry.
 */
router.delete("/:geoFencingId", GeoFencingController.deleteGeoFencing);

export default router;
