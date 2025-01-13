import { Express } from "express";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SecureNest API",
      version: "1.0.0",
      description: `
        The SecureNest API is a comprehensive backend solution for managing parent-child relationships, real-time tracking, 
        geofencing, screen time management, and more. This API integrates seamlessly with the SecureNest mobile app, 
        ensuring a secure and efficient environment for families.

        **Features**
        - **Parent Synchronization**: Sync parent details from Clerk authentication with MongoDB.
        - **Child Management**: Manage child profiles linked to parents.
        - **Real-Time Location Tracking**: Access real-time child location updates.
        - **Geofencing**: Define safe zones for children and get alerts on boundary breaches.
        - **Screen Time Monitoring**: Manage and monitor children's device usage.

        **Owner**
        Built and maintained by Vince Erkadoo, vincedotcode.
      `,
      contact: {
        name: "Vince Erkadoo",
        url: "https://vincedotcode.com",
        email: "support@vincedotcode.com",
      },
    },
    servers: [
      { url: process.env.BASE_URL || "http://localhost:5001", description: "Local Development Server" },
      { url: "https://api.securenest.com", description: "Production Server" },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to your route files containing Swagger annotations
};

const swaggerSpec = swaggerJsDoc(options);

export const swaggerDocs = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI is available at http://localhost:5001/api-docs");
};
