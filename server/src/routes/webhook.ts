// src/routes/ClerkWebhookRoutes.ts
import { Router } from "express";
import { handleUserCreatedWebhook } from "../controllers/webhook-controller";

const router = Router();

/**
 * @swagger
 * /api/webhooks/clerk:
 *   post:
 *     summary: Clerk Webhook Listener
 *     description: Webhook to handle Clerk events, such as user creation, and sync user details to MongoDB.
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The event type (e.g., user.created).
 *                 example: user.created
 *               data:
 *                 type: object
 *                 description: Event payload containing user details.
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The Clerk user ID.
 *                     example: user_abc123
 *                   first_name:
 *                     type: string
 *                     description: The user's first name.
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     description: The user's last name.
 *                     example: Doe
 *                   email_addresses:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         email_address:
 *                           type: string
 *                           description: The user's email address.
 *                           example: john.doe@example.com
 *     responses:
 *       200:
 *         description: Webhook handled successfully
 *       400:
 *         description: Invalid webhook payload or event type
 *       500:
 *         description: Server error
 */
router.post("/clerk", handleUserCreatedWebhook);

export default router;
