import { z } from "zod";

export const aiRequestSchema = z.object({
  prompt: z
    .string()
    .trim()
    .min(20, "Describe your event in at least 20 characters.")
    .max(2000, "Keep the description under 2000 characters."),
});

export const reviewSchema = z.object({
  summary: z.string().describe("One sentence restating what the event is."),
  highlights: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("One to three things the description shows will make the event appealing to students."),
  improvements: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Concrete things to add or fix before publishing the event."),
  readiness: z
    .enum(["ready", "almost", "not-yet"])
    .describe("How close the event description is to being publishable."),
});

export type Review = z.infer<typeof reviewSchema>;
export const reviewJsonSchema = z.toJSONSchema(reviewSchema);