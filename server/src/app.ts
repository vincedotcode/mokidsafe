import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import { swaggerDocs } from "./utils/swagger";
import config from './configs';
import ClerkWebhookRoutes from "./routes/webhook";
import ChildRoutes from "./routes/child";
import ParentRoutes from "./routes/parent"; // Import ParentRoutes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

if (config.mongoURI) {
    mongoose.connect(config.mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as ConnectOptions)
        .then(() => console.log('MongoDB Connected'))
        .catch(err => console.log(err));
}

app.use(bodyParser.json());

// Routes
app.use("/api/webhooks", ClerkWebhookRoutes);
app.use("/api/children", ChildRoutes);
app.use("/api/parents", ParentRoutes); // Add ParentRoutes here

// Swagger Documentation
swaggerDocs(app);

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API Docs available at http://localhost:${PORT}/api-docs`);
});
