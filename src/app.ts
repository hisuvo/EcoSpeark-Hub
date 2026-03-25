import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/libs/auth";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import { notFound } from "./app/middlewares/notFound";
import status from "http-status";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res
    .status(status.OK)
    .json({ success: true, message: "Welcome to EcoSpark_Hub API" });
});

// Better-Auth handler for authentication routes (/api/auth/*)
app.all("/api/auth", toNodeHandler(auth));

app.use(globalErrorHandler);
app.use(notFound);

export default app;
