// src/controllers/ClerkWebhookController.ts
import { Request, Response } from "express";
import { Webhook } from "svix";
import { ParentService } from "../services/parent-service";
import dotenv from "dotenv";

dotenv.config();

const parentService = new ParentService();

const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET || "";

export const handleUserCreatedWebhook = async (req: Request, res: Response) => {
  try {
    console.log("CLERK_SIGNING_SECRET:", process.env.CLERK_SIGNING_SECRET);

    if (!SIGNING_SECRET) {
      throw new Error("Signing secret not configured in .env file");
    }

    const svix = new Webhook(SIGNING_SECRET);

    // Verify the webhook signature
    const headers = req.headers;
    const payload = req.body;
    const body = JSON.stringify(payload);

    svix.verify(body, {
      "svix-id": headers["svix-id"] as string,
      "svix-timestamp": headers["svix-timestamp"] as string,
      "svix-signature": headers["svix-signature"] as string,
    });

    // Process only the `user.created` event
    if (payload.type === "user.created") {
      const { id, first_name, last_name, email_addresses } = payload.data;
      // Synchronize parent to MongoDB
      await parentService.createParent({
        clerkId: id,
        firstName: first_name || "",
        lastName: last_name || "",
        email: email_addresses[0]?.email_address || "",
      });

      res.status(200).json({ message: "Parent synchronized successfully" });
    } else {
      res.status(400).json({ message: "Unhandled event type" });
    }
  } catch (error: any) {
    console.error("Error handling webhook:", error.message);
    res.status(500).json({ error: error.message });
  }
};
