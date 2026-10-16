import { Router, type Request, type Response } from "express";
import { Registration } from "../models/Registration";
import { requireAuth } from "../middleware/auth";
import type { NewRegistrationBody } from "../types/index";

export const registrationRouter = Router();

// One line protects every route in this file
registrationRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// GET /api/registrations -- only THIS user's registrations
registrationRouter.get("/", async (req: Request, res: Response) => {
  const registrations = await Registration.find({
    userId: req.userId,
  }).sort({ registeredAt: -1 });
  res.json(registrations);
});

// GET /api/registrations/:id -- one row, still scoped to the user
registrationRouter.get(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const registration = await Registration.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!registration) {
      res.status(404).json({ message: "No registration with that id" });
      return;
    }

    res.json(registration);
  }
);

// POST /api/registrations
registrationRouter.post(
  "/",
  async (
    req: Request<unknown, unknown, NewRegistrationBody>,
    res: Response
  ) => {
    const registration = await Registration.create({
      ...req.body,
      // userId comes from the verified token, not from the body
      userId: req.userId,
    });
    res.status(201).json(registration);
  }
);

// PATCH /api/registrations/:id
registrationRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewRegistrationBody>>,
    res: Response
  ) => {
    const registration = await Registration.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!registration) {
      res.status(404).json({ message: "No registration with that id" });
      return;
    }

    res.json(registration);
  }
);

// DELETE /api/registrations/:id
registrationRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const registration = await Registration.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!registration) {
      res.status(404).json({ message: "No registration with that id" });
      return;
    }

    res.status(204).send();
  }
);