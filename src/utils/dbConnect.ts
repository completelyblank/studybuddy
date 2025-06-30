import mongoose from "mongoose";

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // Allow global var extension in Node.js
  var mongooseGlobal: MongooseGlobal | undefined;
}

// Use existing global or initialize a new one
const cached: MongooseGlobal = global.mongooseGlobal ?? { conn: null, promise: null };
global.mongooseGlobal = cached;

// Validate the URI
const uri = process.env.MONGODB_URI as string;
if (!uri) {
  throw new Error("❌ MONGODB_URI is not defined in environment variables.");
}


async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
