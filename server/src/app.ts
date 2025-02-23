import express from "express";
import dotenv from "dotenv";
import http from "http"; // Required to create an HTTP server for Socket.IO
import { Server } from "socket.io";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import cors from "cors"; // Import cors middleware
import { swaggerDocs } from "./utils/swagger";
import config from "./configs";
import ClerkWebhookRoutes from "./routes/webhook";
import ChildRoutes from "./routes/child";
import ParentRoutes from "./routes/parent";
import GeofenceRoutes from "./routes/geofence";
import setupSocket from "./socket"; // Import the Socket.IO setup function

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

setupSocket(io);

// ✅ Apply CORS middleware globally
app.use(cors());

// MongoDB connection
if (config.mongoURI) {
  mongoose
    .connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.log(err));
}

app.use(bodyParser.json());

// Routes
app.use("/api/webhooks", ClerkWebhookRoutes);
app.use("/api/children", ChildRoutes);
app.use("/api/parents", ParentRoutes);
app.use("/api/geofencing", GeofenceRoutes);

// Swagger Documentation
swaggerDocs(app);

// Start Server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});
