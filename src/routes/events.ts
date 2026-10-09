import { Router, type Request, type Response } from "express";
import { Event } from "../models/Event";
import { requireAuth } from "../middleware/auth";
import type { NewEventBody } from "../types/index";

export const eventRouter = Router();

// ============================================
// One line protects every route below it
// ============================================
eventRouter.use(requireAuth);

interface IdParam {
  id: string;
}

// ============================================
// GET /api/events — only THIS user's events
// ============================================
eventRouter.get("/", async (req: Request, res: Response) => {
  const events = await Event.find({ organizerId: req.userId }).sort({
    startDate: -1,
  });
  res.json(events);
});

// ============================================
// GET /api/events/:id — one event, still scoped to the user
// ============================================
eventRouter.get("/:id", async (req: Request<IdParam>, res: Response) => {
  const event = await Event.findOne({
    _id: req.params.id,
    organizerId: req.userId,
  });

  if (!event) {
    res.status(404).json({ message: "No event with that id" });
    return;
  }

  res.json(event);
});

// ============================================
// POST /api/events — create a new event
// ============================================
eventRouter.post(
  "/",
  async (req: Request<unknown, unknown, NewEventBody>, res: Response) => {
    const event = await Event.create({
      ...req.body,
      // organizerId comes from the verified token, NOT from the request body
      organizerId: req.userId,
    });
    res.status(201).json(event);
  }
);

// ============================================
// PATCH /api/events/:id — update a field
// ============================================
eventRouter.patch(
  "/:id",
  async (
    req: Request<IdParam, unknown, Partial<NewEventBody>>,
    res: Response
  ) => {
    const event = await Event.findOneAndUpdate(
      { _id: req.params.id, organizerId: req.userId },
      req.body,
      // new: return the row AFTER the change
      // runValidators: schema rules are skipped on updates otherwise
      { new: true, runValidators: true }
    );

    if (!event) {
      res.status(404).json({ message: "No event with that id" });
      return;
    }

    res.json(event);
  }
);

// ============================================
// DELETE /api/events/:id
// ============================================
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