import { Schema, model } from "mongoose";
import type { RegistrationDoc } from "../types/index";

const registrationSchema = new Schema<RegistrationDoc>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "eventId is required"],
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "userId is required"],
  },
  status: {
    type: String,
    enum: {
      values: ["pending", "confirmed", "cancelled", "waitlisted"],
      message: "status must be pending, confirmed, cancelled, or waitlisted",
    },
    default: "pending",
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, "notes cannot exceed 500 characters"],
  },
});

registrationSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Registration = model<RegistrationDoc>(
  "Registration",
  registrationSchema
);