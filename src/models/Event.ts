import { Schema, model } from "mongoose";
import type { EventDoc } from "../types/index";

const eventSchema = new Schema<EventDoc>({
  title: {
    type: String,
    required: [true, "title is required"],
    trim: true,
    minlength: [3, "title must be at least 3 characters"],
  },
  description: {
    type: String,
    required: [true, "description is required"],
    trim: true,
  },
  category: {
    type: String,
    required: [true, "category is required"],
    enum: {
      values: ["academic", "social", "sports", "career", "other"],
      message: "category must be academic, social, sports, career, or other",
    },
  },
  capacity: {
    type: Number,
    required: [true, "capacity is required"],
    min: [1, "capacity must be at least 1"],
    max: [1000, "capacity cannot exceed 1000"],
  },
  status: {
    type: String,
    enum: ["draft", "open", "ongoing", "closed"],
    default: "draft",
  },
  startDate: {
    type: Date,
    required: [true, "startDate is required"],
  },
  endDate: {
    type: Date,
    required: [true, "endDate is required"],
  },
  organizerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  location: {
    type: String,
    required: [true, "location is required"],
    trim: true,
    minlength: [3, "location must be at least 3 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Rename _id to id, remove __v — same as User
eventSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Event = model<EventDoc>("Event", eventSchema);