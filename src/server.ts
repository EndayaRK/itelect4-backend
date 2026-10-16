import "dotenv/config";
import { app } from "./app";
import { connectDB } from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

// Start the connect immediately so a bad URI is a message in this
// terminal within 5 seconds, not a surprise on the first request.
// Logged, not exited: on Vercel this file may be the entry point, and
// killing the process takes down an instance that was about to answer.
connectDB().catch((err: unknown) => {
  console.error("Could not connect to MongoDB:", err);
});

app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));