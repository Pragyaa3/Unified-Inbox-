import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

import authRoutes from "./app/api/auth/routes";
import contactRoutes from "./app/api/contacts/routes";
import messageRoutes from "./app/api/messages/routes";
import analyticsRoutes from "./app/api/analytics/routes";
import webhookRoutes from "./app/api/webhooks/routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/webhooks", webhookRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Unified Inbox backend running on port ${PORT}`));
