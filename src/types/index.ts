import type { Types } from "mongoose";

// ============================================
// FROM GT1: your existing interfaces
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "organizer" | "admin";
  isActive: boolean;
  createdAt: Date;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  category: "academic" | "social" | "sports" | "career" | "other";
  capacity: number;
  status: "draft" | "open" | "ongoing" | "closed";
  startDate: Date;
  endDate: Date;
  organizerId: number;
  location: string;
  createdAt: Date;
}

export interface Registration {
  id: number;
  eventId: number;
  userId: number;
  status: "pending" | "confirmed" | "cancelled" | "waitlisted";
  registeredAt: Date;
  notes?: string;
}

// ============================================
// DERIVED TYPES (for MongoDB)
// ============================================

// What the database actually stores for a User.
// Omit id (MongoDB makes its own), add password.
export type UserDoc = Omit<User, "id"> & {
  password: string;
};

// What the database actually stores for an Event.
// id and organizerId become MongoDB's own types.
export type EventDoc = Omit<Event, "id" | "organizerId"> & {
  organizerId: Types.ObjectId;
};

// What a client is allowed to send when creating an Event.
// No id, no organizerId, no status, no createdAt —
// the server generates those.
export type NewEventBody = Pick<
  Event,
  "title" | "description" | "category" | "capacity" | "location" | "startDate" | "endDate"
>;