import { Router, type Request, type Response } from "express";
import { Event } from "../models/Event";
import { requireAuth } from "../middleware/auth";
import type { NewEventBody } from "../types/index";

export const eventRouter = Router();

interface IdParam {
  id: string;
}

// ============================================
// PUBLIC: browse the event catalog. No token.
// ============================================
eventRouter.get("/", async (_req: Request, res: Response) => {
  const events = await Event.find().sort({ startDate: -1 });
  res.json(events);
});

eventRouter.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404).json({ message: "No event with that id" });
    return;
  }

  res.json(event);
});

// ============================================
// PRIVATE: everything below needs a token
// ============================================
eventRouter.use(requireAuth);

eventRouter.post(
  "/",
  async (req: Request<unknown, unknown, NewEventBody>, res: Response) => {
    const event = await Event.create({
      ...req.body,
      // organizerId comes from the verified token, NOT from the body
      organizerId: req.userId,
    });
    res.status(201).json(event);
  }
);

eventRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewEventBody>>,
    res: Response
  ) => {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizerId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!event) {
      res.status(404).json({ message: "No event with that id" });
      return;
    }

    res.json(event);
  }
);

eventRouter.delete(
  "/:id",
  async (req: Request<IdParam>, res: Response) => {
    const event = await Event.findOneAndDelete({
      _id: req.params.id,
      organizerId: req.userId,
    });

    if (!event) {
      res.status(404).json({ message: "No event with that id" });
      return;
    }

    res.status(204).send();
  }
);