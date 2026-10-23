import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db";
import { authRouter } from "./routes/auth";
import { eventRouter } from "./routes/events";
import { registrationRouter } from "./routes/registrations";
import { aiRouter } from "./routes/ai";

// This file builds the app and stops. It never opens a port.
export const app = express();

// ============================================
// 1. CORS — only the origins we list
// ============================================
const ALLOWED_ORIGINS = (process.env.CORS_ORIGIN ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter((origin) => origin !== "");

app.use(cors({ origin: ALLOWED_ORIGINS }));

// ============================================
// 2. JSON body parser
// ============================================
app.use(express.json());

// ============================================
// 3. Connect middleware — waits for MongoDB before any route runs
// ============================================
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  await connectDB();
  next();
});

// ============================================
// 4. Health check
// ============================================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// ============================================
// 5. Routers
// ============================================
app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);
app.use("/api/registrations", registrationRouter);
app.use("/api/ai", aiRouter);

// ============================================
// 6. 404
// ============================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// 7. Error handler
// ============================================
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({
        message: `"${err.value}" is not a valid id`,
      });
      return;
    }

    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
  }
);

// ============================================
// 8. Vercel default export
// ============================================
export default app;