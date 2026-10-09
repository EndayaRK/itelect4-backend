import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Express's Request type has no userId field. This block adds one for this
// project only, so req.userId type-checks everywhere below.
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// What we put inside the token when we sign it, and therefore what we
// get back out when we verify it.
export interface TokenPayload {
  userId: string;
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Browsers and Postman send this as:
  //   Authorization: Bearer <token>
  const header = req.headers.authorization;

  // Check the header exists AND starts with "Bearer " (case-sensitive, space included)
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({
      message: "No token. Send Authorization: Bearer <token>",
    });
    return;
  }

  // Remove the "Bearer " prefix to get the raw token
  const token = header.slice("Bearer ".length);

  try {
    // verify() checks TWO things:
    // 1. The signature was made with our JWT_SECRET
    // 2. The token has not expired
    // Either failure throws, which is why this is inside a try
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as TokenPayload;

    // Attach the user id to the request — every protected route reads this
    req.userId = payload.userId;

    // Continue to the route handler
    next();
  } catch {
    // Signature failed OR token expired — same message for both
    res.status(401).json({
      message: "Token is invalid or has expired",
    });
  }
}