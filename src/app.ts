import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { auth } from "./app/lib/auth";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import status from "http-status";
import { ApplicationRoutes } from "./app/routes";
import { toNodeHandler } from "better-auth/node";
import { envVars } from "./app/config/env";

const app = express();

app.use(cors({
    origin : [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    credentials : true,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders : ["Content-Type", "Authorization"]
}))

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res
    .status(status.OK)
    .json({ success: true, message: "Welcome to EcoSpark_Hub API" });
});

// Better-Auth handler for authentication routes (/api/auth/*)
app.all("/api/auth", toNodeHandler(auth));

// Application routes
app.use("/api/v1", ApplicationRoutes);

// Global error handler
app.use(globalErrorHandler);

// Not found handler
app.use(notFound);

export default app;
