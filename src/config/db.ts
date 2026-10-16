import mongoose from "mongoose";

// The promise, kept. Not the connection -- the promise of one.
// First caller starts the connect; every caller after gets this same
// promise back. Vercel calls this on every cold start, so it has to be
// safe to call many times.
let connection: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is missing. Copy .env.example to .env and fill it in."
    );
  }

  if (connection === null) {
    connection = mongoose
      .connect(uri, { serverSelectionTimeoutMS: 5000 })
      .then((m) => {
        console.log("MongoDB connected:", m.connection.name);
        return m;
      })
      .catch((err: unknown) => {
        // A failed attempt must not be kept. Leave the rejected promise
        // in place and every request from now on fails with the same
        // five-second-old error, even after the database comes back.
        connection = null;
        throw err;
      });
  }

  return connection;
}