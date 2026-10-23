import "dotenv/config";
import { reviewEvent } from "./ai/gemini";

async function tryAi() {
  const review = await reviewEvent(
    "A campus movie night on the quad, Friday at 7pm. Bring your own " +
      "blanket, free popcorn while it lasts. Open to all students, no " +
      "registration needed.",
  );
  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});