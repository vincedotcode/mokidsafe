// src/routes/ChildRoutes.ts
import { Router } from "express";
import ChildController from "../controllers/child-controller"; // Update path as per your project structure

const router = Router();

/**
 * @swagger
 * /api/children/authenticate:
 *   post:
 *     summary: Authenticate Child by Family Code
 *     description: Authenticate a child using the family code and retrieve the associated child information.
 *     tags:
 *       - Children
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               familyCode:
 *                 type: string
 *                 description: The family code for authentication.
 *                 example: ABC123
 *     responses:
 *       200:
 *         description: Child information retrieved successfully
 *       400:
 *         description: Invalid family code
 */
router.post("/authenticate", ChildController.authenticateChild);

/**
 * @swagger
 * /api/children/create:
 *   post:
 *     summary: Create a new child
 *     description: Create a new child and update the parent's family codes.
 *     tags:
 *       - Children
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the child.
 *                 example: John Doe
 *               age:
 *                 type: number
 *                 description: The age of the child.
 *                 example: 10
 *               profilePicture:
 *                 type: string
 *                 description: The profile picture URL of the child.
 *                 example: https://example.com/profile.jpg
 *               familyCode:
 *                 type: string
 *                 description: The family code associated with the child.
 *                 example: ABC123
 *               parentId:
 *                 type: string
 *                 description: The ID of the parent.
 *                 example: parent-clerk-id
 *               emergencyContacts:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Name of the emergency contact.
 *                     phoneNumber:
 *                       type: string
 *                       description: Phone number of the emergency contact.
 *                     relationship:
 *                       type: string
 *                       description: Relationship with the child.
 *                 description: A list of emergency contacts.
 *     responses:
 *       201:
 *         description: Child created successfully
 *       400:
 *         description: Error creating child
 */
router.post("/create", ChildController.createChild);

/**
 * @swagger
 * /api/children/by-parent/{parentId}:
 *   get:
 *     summary: Get Children by Parent ID
 *     description: Retrieve a list of children associated with a specific parent.
 *     tags:
 *       - Children
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         description: The ID of the parent.
 *         schema:
 *           type: string
 *           example: parent-clerk-id
 *     responses:
 *       200:
 *         description: List of children retrieved successfully.
 *       400:
 *         description: Error retrieving children.
 */
router.get("/by-parent/:parentId", ChildController.getChildrenByParentId);


export default router;
