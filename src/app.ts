import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import mongoose from "mongoose";
import { authRouter } from "./routes/auth";
import { eventRouter } from "./routes/events";

// This file builds the app and stops. It never opens a port and never
// touches the database, so anything that wants an app can have one
// without starting a server.
export const app = express();

// ============================================
// 1. CORS — lets a browser on port 5173 call this API on port 4000
// ============================================
app.use(cors());

// ============================================
// 2. JSON body parser — creates req.body
// ============================================
app.use(express.json());

// ============================================
// 3. Health check — proves the server and DB are alive
// ============================================
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, db: mongoose.connection.readyState === 1 });
});

// ============================================
// 4. Routers
// ============================================
app.use("/api/auth", authRouter);
app.use("/api/events", eventRouter);

// ============================================
// 5. 404 — nothing above matched
// ============================================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    message: `No route for ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// 6. Error handler — FOUR params is what makes Express treat this as one
// ============================================
app.use(
  (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Schema validation failed (required, enum, min, max, minlength)
    if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({
        message: "Validation failed",
        errors: Object.values(err.errors).map((e) => e.message),
      });
      return;
    }

    // Bad ObjectId in the URL (e.g. /api/events/hello)
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