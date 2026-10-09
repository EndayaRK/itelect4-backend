import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import type { TokenPayload } from "../middleware/auth";

export const authRouter = Router();

// ============================================
// Request body types
// ============================================

interface RegisterBody {
  name: string;
  email: string;
  password: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// ============================================
// POST /api/auth/register
// ============================================

authRouter.post(
  "/register",
  async (req: Request<unknown, unknown, RegisterBody>, res: Response) => {
    const { name, email, password } = req.body;

    // Check if email is already taken
    if (await User.findOne({ email })) {
      res.status(409).json({
        message: "That email is already registered",
      });
      return;
    }

    // create() runs the schema rules AND the pre("save") hook,
    // which hashes the password before it reaches the database.
    const user = await User.create({ name, email, password });

    // toJSON removes password and renames _id to id
    res.status(201).json(user.toJSON());
  }
);

// ============================================
// POST /api/auth/login
// ============================================

authRouter.post(
  "/login",
  async (req: Request<unknown, unknown, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    // password has select: false in the schema, so we must ask for it back
    // with .select("+password") — otherwise it comes back undefined.
    const user = await User.findOne({ email }).select("+password");

    // One message for both failures: a wrong email AND a wrong password
    // both say the same thing, so attackers can't tell which was right.
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({
        message: "Email or password is incorrect",
      });
      return;
    }

    // Sign a token with the user's id
    const payload: TokenPayload = { userId: String(user._id) };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "2h",
    });

    // Return the token + user info (no password)
    res.json({ token, user: user.toJSON() });
  }
);