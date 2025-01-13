// src/routes/ParentRoutes.ts
import { Router } from "express";
import ParentController from "../controllers/parent-controller";

const router = Router();

/**
 * @swagger
 * /api/parents:
 *   get:
 *     summary: Get all parents
 *     description: Retrieve a list of all parents.
 *     tags:
 *       - Parents
 *     responses:
 *       200:
 *         description: List of parents retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   clerkId:
 *                     type: string
 *                     description: Clerk ID of the parent.
 *                   email:
 *                     type: string
 *                     description: Email of the parent.
 *                   name:
 *                     type: string
 *                     description: Name of the parent.
 *                   phoneNumber:
 *                     type: string
 *                     description: Phone number of the parent.
 *                   familyCodes:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: Family codes associated with the parent.
 *                   isVerified:
 *                     type: boolean
 *                     description: Verification status of the parent.
 *                   role:
 *                     type: string
 *                     description: Role of the parent (always 'parent').
 *                   status:
 *                     type: string
 *                     description: Account status (active, inactive, banned).
 *       400:
 *         description: Error retrieving parents
 */
router.get("/", ParentController.getAllParents);

/**
 * @swagger
 * /api/parents/{id}:
 *   get:
 *     summary: Get a parent by ID
 *     description: Retrieve a specific parent's details by their ID.
 *     tags:
 *       - Parents
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the parent to retrieve.
 *     responses:
 *       200:
 *         description: Parent details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 clerkId:
 *                   type: string
 *                   description: Clerk ID of the parent.
 *                 email:
 *                   type: string
 *                   description: Email of the parent.
 *                 name:
 *                   type: string
 *                   description: Name of the parent.
 *                 phoneNumber:
 *                   type: string
 *                   description: Phone number of the parent.
 *                 familyCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Family codes associated with the parent.
 *                 isVerified:
 *                   type: boolean
 *                   description: Verification status of the parent.
 *                 role:
 *                   type: string
 *                   description: Role of the parent (always 'parent').
 *                 status:
 *                   type: string
 *                   description: Account status (active, inactive, banned).
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Parent not found
 */
router.get("/:id", ParentController.getParentById);

/**
 * @swagger
 * /api/parents:
 *   post:
 *     summary: Create a new parent
 *     description: Create a new parent with the provided details.
 *     tags:
 *       - Parents
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clerkId:
 *                 type: string
 *                 description: Clerk ID of the parent.
 *                 example: clerk12345
 *               firstName:
 *                 type: string
 *                 description: First name of the parent.
 *                 example: John
 *               lastName:
 *                 type: string
 *                 description: Last name of the parent.
 *                 example: Doe
 *               email:
 *                 type: string
 *                 description: Email of the parent.
 *                 example: john.doe@example.com
 *     responses:
 *       201:
 *         description: Parent created successfully
 *       400:
 *         description: Error creating parent
 */
router.post("/", ParentController.createParent);

/**
 * @swagger
 * /api/parents/clerk/{clerkId}:
 *   get:
 *     summary: Get parent by clerkId
 *     description: Retrieve a parent's details by their clerkId.
 *     tags:
 *       - Parents
 *     parameters:
 *       - in: path
 *         name: clerkId
 *         required: true
 *         schema:
 *           type: string
 *         description: The clerkId of the parent.
 *         example: clerk12345
 *     responses:
 *       200:
 *         description: Parent retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 parent:
 *                   type: object
 *                   properties:
 *                     clerkId:
 *                       type: string
 *                       description: The clerkId of the parent.
 *                       example: clerk12345
 *                     email:
 *                       type: string
 *                       description: Email address of the parent.
 *                       example: john.doe@example.com
 *                     name:
 *                       type: string
 *                       description: Full name of the parent.
 *                       example: John Doe
 *                     phoneNumber:
 *                       type: string
 *                       description: Phone number of the parent.
 *                       example: +123456789
 *                     familyCodes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Array of family codes associated with the parent.
 *                     isVerified:
 *                       type: boolean
 *                       description: Whether the parent is verified.
 *                       example: true
 *                     role:
 *                       type: string
 *                       description: The role of the user (always 'parent').
 *                       example: parent
 *                     status:
 *                       type: string
 *                       description: Account status (active, inactive, or banned).
 *                       example: active
 *       404:
 *         description: Parent not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Parent not found"
 *       400:
 *         description: Invalid request or error retrieving parent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid clerkId format"
 */
router.get("/clerk/:clerkId", ParentController.getParentByClerkId);



export default router